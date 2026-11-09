"use client";

import { useState, useTransition } from "react";
import { updateAdminAccountAction } from "@/app/admin/actions";

export function AdminAccountForm({ email }: { email: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateAdminAccountAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="rounded-3xl bg-white p-5 ring-1 ring-zk-line">
      <h2 className="font-display text-lg font-bold text-zk-navy">Admin login</h2>
      <p className="mt-1 text-sm text-zk-ink/55">Change the panel email and password. Requires the current password.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-zk-navy">
          Admin email
          <input name="email" type="email" defaultValue={email} className="input" required />
        </label>
        <label className="block text-sm font-semibold text-zk-navy">
          Current password
          <input name="currentPassword" type="password" className="input" required />
        </label>
        <label className="block text-sm font-semibold text-zk-navy">
          New password (optional)
          <input name="newPassword" type="password" className="input" />
          <p className="mt-1 text-xs font-normal text-zk-ink/50">At least 8 characters. Leave blank to keep the current password.</p>
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-navy mt-5 disabled:opacity-50">
        {pending ? "Saving…" : "Update admin login"}
      </button>
    </form>
  );
}
