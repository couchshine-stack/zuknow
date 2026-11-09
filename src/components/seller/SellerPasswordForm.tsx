"use client";

import { useState } from "react";
import { changeSellerPasswordAction } from "@/app/seller/actions";

export function SellerPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    const result = await changeSellerPasswordAction(formData);
    if (result?.error) setError(result.error);
    else setMessage("Password updated.");
  }

  return (
    <form action={onSubmit} className="max-w-md space-y-3 rounded-3xl bg-white p-5 ring-1 ring-zk-line">
      <h2 className="font-display text-lg font-bold text-zk-navy">Portal password</h2>
      <label className="block text-sm font-semibold">
        New password
        <input name="password" type="password" required minLength={6} className="input" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
      <button className="btn-navy h-11 px-5 text-sm">Update password</button>
    </form>
  );
}
