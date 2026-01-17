"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Sign-in failed: ${error.message}`);
    } else {
      const redirectTo =
        searchParams.get("redirectedFrom") || "/admin/dashboard";
      router.refresh();
      router.push(redirectTo);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="p-8">
      <h1 className="text-2xl mb-4">Login</h1>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block mb-1">
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}
