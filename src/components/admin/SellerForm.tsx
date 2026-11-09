"use client";

import { useState } from "react";
import { saveSellerAction } from "@/app/admin/actions";
import { SellerMapPicker } from "./SellerMapPicker";

type SellerShape = {
  id?: string;
  shopName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  pincode?: string;
  address?: string;
  gstNumber?: string;
  pan?: string;
  status?: string;
  sellerCategoryId?: string;
  commissionPercent?: string;
  lat?: number | null;
  lng?: number | null;
};

export function SellerForm({
  seller,
  categories,
}: {
  seller?: SellerShape;
  categories: Array<{ id: string; name: string; commissionPercent: unknown }>;
}) {
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const result = await saveSellerAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={onSubmit} className="max-w-3xl space-y-4 rounded-3xl bg-white p-6 ring-1 ring-zk-line">
      {seller?.id ? <input type="hidden" name="id" value={seller.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Shop name
          <input name="shopName" required defaultValue={seller?.shopName} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Owner
          <input name="ownerName" required defaultValue={seller?.ownerName} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Phone
          <input name="phone" required defaultValue={seller?.phone} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Email
          <input name="email" type="email" defaultValue={seller?.email} className="input" />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Seller portal password
          <input
            name="password"
            type="password"
            className="input"
            placeholder={seller?.id ? "Leave blank to keep current password" : "Sellers use this at /seller"}
            autoComplete="new-password"
          />
          <span className="mt-1 block text-xs font-normal text-zk-ink/50">
            Required for /seller login. Phone or email + this password.
          </span>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Seller category
          <select name="sellerCategoryId" required defaultValue={seller?.sellerCategoryId} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {Number(c.commissionPercent)}% default
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Commission % override
          <input
            name="commissionPercent"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={seller?.commissionPercent}
            className="input"
            placeholder="Leave blank to use category %"
          />
        </label>
        <label className="text-sm font-semibold">
          Status
          <select name="status" defaultValue={seller?.status || "active"} className="input">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          City
          <input name="city" defaultValue={seller?.city} className="input" />
        </label>
        <label className="text-sm font-semibold">
          PIN
          <input name="pincode" defaultValue={seller?.pincode} className="input" />
        </label>
        <label className="text-sm font-semibold">
          GST
          <input name="gstNumber" defaultValue={seller?.gstNumber} className="input" />
        </label>
        <label className="text-sm font-semibold">
          PAN
          <input name="pan" defaultValue={seller?.pan} className="input" />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Address
        <textarea name="address" rows={2} defaultValue={seller?.address} className="input min-h-20" />
      </label>
      <SellerMapPicker lat={seller?.lat} lng={seller?.lng} address={seller?.address} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary">Save seller</button>
    </form>
  );
}
