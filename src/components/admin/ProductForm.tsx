"use client";

import { useState, useTransition } from "react";
import { saveProductAction } from "@/app/admin/actions";
import { ImageField } from "./ImageField";

type Option = { id: string; name?: string; shopName?: string };

type ProductShape = {
  id?: string;
  name?: string;
  slug?: string;
  unit?: string;
  price?: number;
  mrp?: number | null;
  blurb?: string;
  image?: string;
  emoji?: string;
  tags?: string;
  kind?: string;
  etaMinutes?: number;
  stock?: number;
  active?: boolean;
  categoryId?: string;
  sellerId?: string;
  commissionPercent?: string;
};

export function ProductForm({
  product,
  categories,
  sellers,
  action = saveProductAction,
  lockedSellerId,
  showCommission = true,
}: {
  product?: ProductShape;
  categories: Option[];
  sellers: Option[];
  action?: (formData: FormData) => Promise<{ error?: string } | void>;
  lockedSellerId?: string;
  showCommission?: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="max-w-3xl space-y-4 rounded-3xl bg-white p-6 ring-1 ring-zk-line">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      {lockedSellerId ? <input type="hidden" name="sellerId" value={lockedSellerId} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required defaultValue={product?.name} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Slug
          <input name="slug" defaultValue={product?.slug} className="input" placeholder="auto from name" />
        </label>
        <label className="text-sm font-semibold">
          Unit
          <input name="unit" defaultValue={product?.unit || "1 pc"} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Kind
          <select name="kind" defaultValue={product?.kind || "product"} className="input">
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Price ₹
          <input name="price" type="number" min={1} required defaultValue={product?.price} className="input" />
        </label>
        <label className="text-sm font-semibold">
          MRP ₹
          <input name="mrp" type="number" min={0} defaultValue={product?.mrp ?? ""} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Aisle
          <select name="categoryId" required defaultValue={product?.categoryId} className="input">
            <option value="">Select aisle</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {lockedSellerId ? null : (
          <label className="text-sm font-semibold">
            Seller
            <select name="sellerId" required defaultValue={product?.sellerId} className="input">
              <option value="">Select seller</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-sm font-semibold">
          ETA minutes
          <input name="etaMinutes" type="number" min={5} defaultValue={product?.etaMinutes ?? 15} className="input" />
        </label>
        <label className="text-sm font-semibold">
          Stock
          <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 100} className="input" />
        </label>
        {showCommission ? (
          <label className="text-sm font-semibold">
            Commission % override
            <input
              name="commissionPercent"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue={product?.commissionPercent}
              className="input"
              placeholder="Use seller / category default"
            />
          </label>
        ) : null}
        <label className="text-sm font-semibold">
          Emoji
          <input name="emoji" defaultValue={product?.emoji} className="input" />
        </label>
      </div>
      <ImageField defaultValue={product?.image} />
      <label className="block text-sm font-semibold">
        Tags (comma separated)
        <input name="tags" defaultValue={product?.tags} className="input" />
      </label>
      <label className="block text-sm font-semibold">
        Blurb
        <textarea name="blurb" rows={3} defaultValue={product?.blurb} className="input min-h-24" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Live on storefront
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
        {pending ? "Saving… keep this tab open" : "Save product"}
      </button>
    </form>
  );
}
