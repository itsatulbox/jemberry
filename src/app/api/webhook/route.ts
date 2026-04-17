import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { OrderItem } from "@/types/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: statusError } = await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (statusError) {
        console.error(`Failed to update order ${orderId} status:`, statusError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("items")
        .eq("id", orderId)
        .single();

      if (order?.items) {
        const items = order.items as OrderItem[];
        await Promise.all(
          items.map(async (item) => {
            if (!item.id || !item.quantity) return;

            if (item.selectedVariant) {
              const { error } = await supabaseAdmin.rpc(
                "decrement_variant_stock",
                {
                  p_product_id: item.id,
                  p_variant_name: item.selectedVariant,
                  p_qty: item.quantity,
                }
              );
              if (error)
                console.error(
                  `Failed to decrement variant stock for ${item.id}/${item.selectedVariant}:`,
                  error
                );
            } else {
              const { error } = await supabaseAdmin.rpc("decrement_stock", {
                product_id: item.id,
                qty: item.quantity,
              });
              if (error)
                console.error(
                  `Failed to decrement stock for ${item.id}:`,
                  error
                );
            }
          })
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
