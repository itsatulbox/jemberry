import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getShippingRate } from "@/utils/shippingRates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { items, method, customerDetails, country } = await req.json();

    // Compute total server-side from item prices
    const serverTotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item.variantPrice ?? item.price) * item.quantity,
      0,
    );

    // Compute shipping server-side (never trust client-sent shipping cost)
    const serverShippingCost = getShippingRate(
      country || customerDetails.country || "",
      method,
    );
    const grandTotal = serverTotal + serverShippingCost;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_email: customerDetails.email,
          customer_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          customer_phone: customerDetails.phone,
          address: customerDetails.address || "Pickup",
          city: customerDetails.city || "Auckland",
          country:
            country ||
            customerDetails.country ||
            (method === "pickup" ? "New Zealand" : null),
          delivery_method: method,
          total_amount: grandTotal,
          shipping_cost: serverShippingCost,
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
          name: item.selectedVariant
            ? `${item.name} — ${item.selectedVariant}`
            : item.name,
          images: item.main_image ? [item.main_image] : [],
        },
        unit_amount: Math.round((item.variantPrice ?? item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (serverShippingCost > 0) {
      line_items.push({
        price_data: {
          currency: "nzd",
          product_data: {
            name: "Shipping — NZ Post Tracked",
            images: [],
          },
          unit_amount: Math.round(serverShippingCost * 100),
        },
        quantity: 1,
      });
    }

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
