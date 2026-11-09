import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold text-zk-navy">Terms</h1>
      <p className="mt-4 text-zk-ink/75">
        Orders are for personal use. 15-minute ETAs depend on store coverage, traffic, and partner availability. Service
        visits may add parts after inspection. Refunds for failed Razorpay payments return to the original method.
      </p>
    </article>
  );
}
