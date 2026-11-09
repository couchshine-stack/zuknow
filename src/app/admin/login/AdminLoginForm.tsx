"use client";

import { useState } from "react";
import { adminLoginAction } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const result = await adminLoginAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={onSubmit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-lift">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-zk-orange">zuknow.in</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-zk-navy">Admin login</h1>
      <p className="mt-1 text-sm text-zk-ink/60">Manage products, sellers and commission.</p>
      <label className="mt-6 block text-sm font-semibold text-zk-navy">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue="admin@zuknow.in"
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
      <button className="btn-primary mt-6 w-full">Enter admin</button>
    </form>
  );
}
