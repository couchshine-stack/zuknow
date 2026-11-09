"use client";

import { useState } from "react";
import { sellerLoginAction } from "@/app/seller/actions";

export function SellerLoginForm() {
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const result = await sellerLoginAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={onSubmit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-lift">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-zk-orange">zuknow.in</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-zk-navy">Seller login</h1>
      <p className="mt-1 text-sm text-zk-ink/60">Add products, photos, and see orders for your dark store.</p>
      <label className="mt-6 block text-sm font-semibold text-zk-navy">
        Phone or email
        <input
          name="identifier"
          required
          placeholder="9811111111 or rajapeth@zuknow.in"
          className="mt-1 h-12 w-full rounded-2xl border border-zk-line bg-zk-mist px-3 outline-none focus:border-zk-blue"
        />
      </label>
      <label className="mt-3 block text-sm font-semibold text-zk-navy">
        Password
        <input
          name="password"
          type="password"
          required
          className="mt-1 h-12 w-full rounded-2xl border border-zk-line bg-zk-mist px-3 outline-none focus:border-zk-blue"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary mt-6 w-full">Enter shop</button>
      <p className="mt-4 text-center text-xs text-zk-ink/45">Ask admin to set your portal password if you cannot sign in.</p>
    </form>
  );
}
