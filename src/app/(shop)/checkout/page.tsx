"use client";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/toastContext";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  getShippingRateFromData,
  getShippingLabelFromData,
  type ShippingZone,
  type ShippingCountry,
} from "@/utils/shippingRates";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"shipping" | "pickup">("shipping");

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [countries, setCountries] = useState<ShippingCountry[]>([]);

  useEffect(() => {
    fetch("/api/shipping")
      .then((res) => res.json())
      .then((data) => {
        setZones(data.zones || []);
        setCountries(data.countries || []);
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const shippingCost = useMemo(
    () => getShippingRateFromData(formData.country, method, zones, countries),
    [formData.country, method, zones, countries],
  );
  const shippingLabel = useMemo(
    () => getShippingLabelFromData(formData.country, method, zones, countries),
    [formData.country, method, zones, countries],
  );
  const orderTotal = cartTotal + shippingCost;

  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const popularCountryNames = useMemo(
    () => countries.filter((c) => c.is_popular).map((c) => c.name),
    [countries],
  );

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countrySearch, countries]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
          total: orderTotal,
          shippingCost: shippingCost,
          country: formData.country,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      showToast(err.message || "Something went wrong.", "error");
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
                  <div className="col-span-2 relative" ref={countryRef}>
                    <input
                      type="text"
                      value={
                        countryDropdownOpen ? countrySearch : formData.country
                      }
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setFormData({ ...formData, country: "" });
                        setCountryDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setCountryDropdownOpen(true);
                        setCountrySearch("");
                      }}
                      placeholder="Search country..."
                      className="w-full p-3 border border-primary/20 rounded-md outline-none focus:border-primary bg-white"
                      autoComplete="off"
                      required={!formData.country}
                    />
                    {/* Hidden input to hold the actual selected value */}
                    <input
                      type="hidden"
                      name="country"
                      value={formData.country}
                    />
                    {countryDropdownOpen && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto border border-primary/20 rounded-md bg-white shadow-lg">
                        {filteredCountries.length === 0 ? (
                          <li
                            onClick={() => {
                              setFormData({
                                ...formData,
                                country: "Other Country",
                              });
                              setCountrySearch("");
                              setCountryDropdownOpen(false);
                            }}
                            className="p-3 text-sm cursor-pointer hover:bg-primary/5 transition-colors"
                          >
                            Other Country
                          </li>
                        ) : (
                          filteredCountries.map((c) => (
                            <li
                              key={c.name}
                              onClick={() => {
                                setFormData({ ...formData, country: c.name });
                                setCountrySearch("");
                                setCountryDropdownOpen(false);
                              }}
                              className={`p-3 text-sm cursor-pointer hover:bg-primary/5 transition-colors ${
                                popularCountryNames.includes(c.name) &&
                                !countrySearch
                                  ? "font-bold"
                                  : ""
                              }`}
                            >
                              {c.name}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
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
            disabled={loading || (method === "shipping" && !formData.country)}
            className="w-full py-4 bg-primary text-white rounded-md font-bold text-lg hover:brightness-95 disabled:bg-gray-300"
          >
            {loading ? "Processing..." : `Pay $${orderTotal.toFixed(2)} NZD`}
          </button>
        </form>

        <div className="lg:w-[400px]">
          <div className="sticky top-24 border border-primary/10 rounded-xl p-8 bg-primary/5">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedVariant || ""}-${item.selectedAddon || ""}`}
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
                    {item.selectedAddon && (
                      <p className="text-xs opacity-60">
                        + {item.selectedAddon}
                      </p>
                    )}
                  </div>
                  <span>
                    $
                    {(
                      ((item.variantPrice ?? item.price) + (item.addonPrice ?? 0)) * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/20 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span
                  className={
                    shippingCost === 0 &&
                    method === "shipping" &&
                    !formData.country
                      ? "opacity-50 italic"
                      : ""
                  }
                >
                  {method === "pickup"
                    ? "Free"
                    : !formData.country
                      ? "Select country"
                      : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-primary/10">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)} NZD</span>
              </div>
              {method === "shipping" && formData.country && (
                <p className="text-xs opacity-50 italic">{shippingLabel}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
