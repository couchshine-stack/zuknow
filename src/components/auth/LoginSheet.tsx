"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function LoginSheet() {
  const { loginOpen, closeLogin, refresh, loginNext } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const firstInput = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (loginOpen) {
      setTimeout(() => firstInput.current?.focus(), 50);
    } else {
      setStep("phone");
      setOtp("");
      setError("");
      setHint("");
      setSending(false);
      setVerifying(false);
      setResendIn(0);
      sendingRef.current = false;
    }
  }, [loginOpen]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  if (!loginOpen) return null;

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (resendIn > 0) {
      setStep("otp");
      return;
    }
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError("");
    setHint("");
    setStep("otp");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { error?: string; preview?: string };
      if (!res.ok) {
        setStep("phone");
        setError(data.error || "Could not send the code.");
        return;
      }
      if (data.preview) setHint(`Dev preview code: ${data.preview}`);
      setResendIn(60);
    } catch {
      setStep("phone");
      setError("Could not send the code. Try once more.");
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError("");
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp }),
    });
    const data = (await res.json()) as { error?: string };
    setVerifying(false);
    if (!res.ok) {
      setError(data.error || "That code did not match.");
      return;
    }
    await refresh();
    closeLogin();
    if (loginNext) router.push(loginNext);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        aria-label="Close login"
        onClick={closeLogin}
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-900/[0.08] backdrop-blur-xl sm:rounded-3xl">
        <div className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />
        <button
          onClick={closeLogin}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Login with WhatsApp</h2>
            <p className="text-xs sm:text-sm text-slate-500">A 6-digit code, then you are in.</p>
          </div>
        </div>

        {step === "phone" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-800">
              Mobile number
              <div className="mt-1.5 flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 transition-all focus-within:border-zk-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-zk-blue/20">
                <span className="flex items-center px-3.5 text-sm font-semibold text-slate-500">+91</span>
                <input
                  ref={firstInput}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98xxxxxxxx"
                  className="h-12 w-full bg-transparent pr-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={sending || phone.length !== 10}
              className="btn-primary w-full disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send WhatsApp code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the code sent to +91 {phone}.{" "}
              <button
                type="button"
                className="font-semibold text-zk-blue hover:underline"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
              >
                Change
              </button>
            </p>
            <p className="text-xs text-slate-500">
              {sending
                ? "WhatsApp is on the way — type the code as soon as it arrives."
                : resendIn > 0
                  ? `Use any recent code. Another send is locked for ${resendIn}s.`
                  : "Use any code from the last few minutes."}
            </p>
            <input
              ref={firstInput}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 text-center font-display text-2xl tracking-[0.4em] text-slate-900 outline-none transition-all focus:border-zk-blue focus:bg-white focus:ring-2 focus:ring-zk-blue/20"
            />
            {hint ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">{hint}</p> : null}
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <button type="submit" disabled={verifying || otp.length !== 6} className="btn-primary w-full disabled:opacity-50">
              {verifying ? "Checking…" : "Verify & continue"}
            </button>
            <button
              type="button"
              disabled={sending || verifying || resendIn > 0}
              onClick={() => sendCode()}
              className="w-full text-center text-sm font-semibold text-zk-blue transition-colors hover:text-zk-orange disabled:text-slate-400"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
