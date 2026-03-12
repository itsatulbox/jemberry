import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getShippingRate } from "@/utils/shippingRates.server";

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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Look up current prices and stock from the database
    const productIds = [...new Set(items.map((item: any) => item.id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock, main_image")
      .in("id", productIds);

    if (productsError || !products) {
      throw new Error("Failed to verify product prices");
    }

    // Fetch variants for products that need them
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id, name, price, stock")
      .in("product_id", productIds);

    // Fetch addons for products that need them
    const { data: addons } = await supabase
      .from("product_addons")
      .select("product_id, name, price_modifier")
      .in("product_id", productIds);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(
      (variants || []).map((v) => [`${v.product_id}|${v.name}`, v]),
    );
    const addonMap = new Map(
      (addons || []).map((a) => [`${a.product_id}|${a.name}`, a]),
    );

    // Validate each item's price and stock from DB
    let serverTotal = 0;
    const validatedItems: {
      name: string;
      unitPrice: number;
      quantity: number;
      image: string | null;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available` },
          { status: 400 },
        );
      }

      let unitPrice: number;
      let stock: number;
      const nameParts = [product.name];

      if (item.selectedVariant) {
        const variant = variantMap.get(`${item.id}|${item.selectedVariant}`);
        if (!variant) {
          return NextResponse.json(
            {
              error: `Variant "${item.selectedVariant}" for "${product.name}" is no longer available`,
            },
            { status: 400 },
          );
        }
        unitPrice = variant.price;
        stock = variant.stock;
        nameParts.push(item.selectedVariant);
      } else {
        unitPrice = product.price;
        stock = product.stock;
      }

      if (item.selectedAddon) {
        const addon = addonMap.get(`${item.id}|${item.selectedAddon}`);
        if (addon) {
          unitPrice += Number(addon.price_modifier);
          nameParts.push(item.selectedAddon);
        }
      }

      if (item.quantity > stock) {
        return NextResponse.json(
          {
            error:
              stock <= 0
                ? `"${product.name}${item.selectedVariant ? ` — ${item.selectedVariant}` : ""}" is sold out`
                : `Only ${stock} of "${product.name}${item.selectedVariant ? ` — ${item.selectedVariant}` : ""}" left in stock`,
          },
          { status: 400 },
        );
      }

      serverTotal += unitPrice * item.quantity;
      validatedItems.push({
        name: nameParts.join(" — "),
        unitPrice,
        quantity: item.quantity,
        image: product.main_image,
      });
    }

    // Compute shipping server-side (never trust client-sent shipping cost)
    const serverShippingCost = await getShippingRate(
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

    const line_items = validatedItems.map((item) => ({
      price_data: {
        currency: "nzd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.unitPrice * 100),
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
