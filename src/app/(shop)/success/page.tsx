"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cartContext";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
          Order Confirmed
        </h1>

        <p className="text-lg text-primary/70 max-w-md mb-12 leading-relaxed">
          Thank you for your purchase. We’ve received your order and it’s now
          being processed. You’ll receive an email update shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link
            href="/products"
            className="flex-1 py-4 bg-primary text-white rounded-md font-bold text-center hover:brightness-95 transition-all"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="flex-1 py-4 border border-primary text-primary rounded-md font-bold text-center hover:bg-primary/5 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
