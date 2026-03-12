"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/cartContext";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error",
  );

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          clearCart();
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[75vh]">
        <p className="text-lg text-primary/70">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col items-center justify-center min-h-[75vh] py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Something went wrong
          </h1>
          <p className="text-lg text-primary/70 max-w-md mb-12 leading-relaxed">
            We couldn&apos;t verify your payment. If you were charged, please
            contact us and we&apos;ll sort it out.
          </p>
          <Link
            href="/"
            className="py-4 px-8 bg-primary text-white rounded-md font-bold text-center hover:brightness-95 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
          Order Confirmed
        </h1>

        <p className="text-lg text-primary/70 max-w-md mb-12 leading-relaxed">
          Thank you for your purchase. We&apos;ve received your order and
          it&apos;s now being processed. You&apos;ll receive an email update
          shortly.
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
