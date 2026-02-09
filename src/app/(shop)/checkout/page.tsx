"use client";
import { useCart } from "@/context/cartContext";
import { useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"shipping" | "pickup">("shipping");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          method: method,
          customerDetails: formData,
          total: cartTotal,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return <div className="py-20 text-center">Your cart is empty.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 text-primary">
      <h1 className="text-3xl font-bold mb-12">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        <form onSubmit={handleCheckout} className="flex-1 space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod("shipping")}
                className={`p-4 border rounded-md font-bold transition-all ${
                  method === "shipping"
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 opacity-50"
                }`}
              >
                Shipping
              </button>
              <button
                type="button"
                onClick={() => setMethod("pickup")}
                className={`p-4 border rounded-md font-bold transition-all ${
                  method === "pickup"
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 opacity-50"
                }`}
              >
                Pickup (Auckland)
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Contact & Shipping</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="p-3 border border-primary/20 rounded-md col-span-2 outline-none focus:border-primary"
                required
              />
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="p-3 border border-primary/20 rounded-md outline-none focus:border-primary"
                required
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="p-3 border border-primary/20 rounded-md outline-none focus:border-primary"
                required
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="p-3 border border-primary/20 rounded-md col-span-2 outline-none focus:border-primary"
                required
              />

              {method === "shipping" && (
                <>
                  <input
                    name="address"
                    placeholder="Shipping Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="p-3 border border-primary/20 rounded-md col-span-2 outline-none focus:border-primary"
                    required
                  />
                  <input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="p-3 border border-primary/20 rounded-md outline-none focus:border-primary"
                    required
                  />
                  <input
                    name="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="p-3 border border-primary/20 rounded-md outline-none focus:border-primary"
                    required
                  />
                </>
              )}
            </div>
          </section>

          <button
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-md font-bold text-lg hover:brightness-95 disabled:bg-gray-300"
          >
            {loading ? "Processing..." : `Pay $${cartTotal.toFixed(2)} NZD`}
          </button>
        </form>

        <div className="lg:w-[400px]">
          <div className="sticky top-24 border border-primary/10 rounded-xl p-8 bg-primary/5">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedVariant || ""}`}
                  className="flex gap-4 items-center text-sm"
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden border border-primary/10 bg-white">
                    <Image
                      src={item.main_image || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold">
                      {item.name} (x{item.quantity})
                    </span>
                    {item.selectedVariant && (
                      <p className="text-xs opacity-60">
                        {item.selectedVariant}
                      </p>
                    )}
                  </div>
                  <span>
                    $
                    {(
                      (item.variantPrice ?? item.price) * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/20 pt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)} NZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
