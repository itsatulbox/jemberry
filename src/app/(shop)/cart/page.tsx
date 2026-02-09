"use client";
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import Image from "next/image";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-primary">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="text-sm underline font-bold text-primary"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-12">Your Cart</h1>

      <div className="space-y-10">
        {cart.map((item) => (
          <div
            key={`${item.id}-${item.selectedVariant || ""}`}
            className="flex gap-6 border-b border-primary/20 pb-8"
          >
            <div className="relative w-24 h-24 bg-gray-50 overflow-hidden rounded-md flex-shrink-0 border border-primary/10">
              <Image
                src={item.main_image || "/placeholder.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-between flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-primary">
                    {item.name}
                  </h3>
                  {item.selectedVariant && (
                    <p className="text-xs font-medium text-primary/60 mt-0.5">
                      Variant: {item.selectedVariant}
                    </p>
                  )}
                  <p className="text-xs italic mt-1">
                    ${(item.variantPrice ?? item.price).toFixed(2)} NZD each
                  </p>
                </div>
                <p className="font-bold text-primary">
                  $
                  {((item.variantPrice ?? item.price) * item.quantity).toFixed(
                    2
                  )}
                </p>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center border border-primary rounded-full px-3 py-1 gap-4">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.selectedVariant, -1)
                    }
                    className="text-lg leading-none text-primary hover:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.selectedVariant, 1)
                    }
                    className="text-lg leading-none text-primary hover:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.selectedVariant)}
                  className="text-xs underline font-medium text-primary/70 hover:text-primary"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 space-y-6">
          <div className="flex justify-between text-xl font-bold pt-4 text-primary">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)} NZD</span>
          </div>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full py-4 bg-primary text-white rounded-md font-bold text-center hover:brightness-95 transition-all"
            >
              Proceed to Checkout
            </Link>
            <p className="text-xs text-center italic opacity-60">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
