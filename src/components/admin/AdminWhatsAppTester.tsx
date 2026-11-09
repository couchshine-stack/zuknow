"use client";

import { useState, useTransition } from "react";
import { testWhatsAppAction } from "@/app/admin/actions";
import { MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function AdminWhatsAppTester({ defaultPhone }: { defaultPhone?: string }) {
  const [phone, setPhone] = useState(defaultPhone || "");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData();
    fd.append("phone", phone);

    startTransition(async () => {
      const result = await testWhatsAppAction(fd);
      if (result.error) {
        setStatus({ type: "error", text: result.error });
      } else {
        setStatus({
          type: "success",
          text: `Test message sent successfully to +91 ${phone}! Check your WhatsApp.`,
        });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-800">Test Turnkey WhatsApp Gateway</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Send an instant test message to verify that your Turnkey WhatsApp Gateway credentials and phone instance are online.
      </p>

      <form onSubmit={onSend} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            +91
          </span>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit phone number"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={pending || phone.length !== 10}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {pending ? "Sending…" : "Send Test Message"}
        </button>
      </form>

      {status ? (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
              : "bg-red-50 text-red-800 ring-1 ring-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{status.text}</span>
        </div>
      ) : null}
    </div>
  );
}

