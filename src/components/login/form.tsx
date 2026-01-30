"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Sign-in failed: ${error.message}`);
      setLoading(false);
    } else {
      const redirectTo =
        searchParams.get("redirectedFrom") || "/admin/products";
      router.refresh();
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/1 p-6 text-primary">
      <div className="w-full max-w-md bg-white border border-primary/10 p-10 rounded-2xl shadow-xl shadow-primary/5">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">
            Login
          </h1>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[9px] font-black uppercase mb-2 tracking-widest opacity-40"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full p-4 border border-primary/20 rounded-xl outline-none focus:border-primary bg-primary/2 text-sm font-medium transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[9px] font-black uppercase mb-2 tracking-widest opacity-40"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-4 border border-primary/20 rounded-xl outline-none focus:border-primary bg-primary/2 text-sm font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white text-[11px] font-bold tracking-[0.2em] py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-primary/20 transition-all shadow-lg shadow-primary/10"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
