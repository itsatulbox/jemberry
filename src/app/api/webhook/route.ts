import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
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
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("items")
        .eq("id", orderId)
        .single();

      if (order?.items) {
        const items = order.items as any[];
        for (const item of items) {
          const product_id = item.id || item.product_id;
          const quantity = item.quantity || item.qty;

          if (product_id && quantity) {
            await supabaseAdmin.rpc("decrement_stock", {
              product_id,
              qty: quantity,
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
