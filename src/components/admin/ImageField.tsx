"use client";

import { useState } from "react";

export function ImageField({ name = "image", defaultValue = "" }: { name?: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.url) {
      setError(data.error || "Could not upload that photo.");
      return;
    }
    setUrl(data.url);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Product photo</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-zk-mist ring-1 ring-zk-line">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-zk-ink/40">
              No photo yet
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex h-11 cursor-pointer items-center rounded-full bg-zk-navy px-4 text-sm font-bold text-white">
            {busy ? "Uploading…" : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={busy}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <label className="block text-xs font-semibold text-zk-ink/55">
            Or paste an image URL
            <input
              name={name}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input"
              placeholder="https://… or /uploads/…"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
