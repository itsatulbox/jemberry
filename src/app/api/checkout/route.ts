import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function POST(req: Request) {
  try {
    const { items, method, customerDetails, total } = await req.json();
    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_email: customerDetails.email,
          customer_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          customer_phone: customerDetails.phone,
          address: customerDetails.address || "Pickup",
          city: customerDetails.city || "Auckland",
          delivery_method: method,
          total_amount: total,
          status: "pending",
          items: items,
        },
      ])
      .select()
      .single();

    if (orderError || !order?.id) {
      throw new Error(orderError?.message || "Order creation failed");
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "nzd",
        product_data: {
          name: item.name,
          images: item.main_image ? [item.main_image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
