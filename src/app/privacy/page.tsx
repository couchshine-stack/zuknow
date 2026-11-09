import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="prose max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold text-zk-navy">Privacy</h1>
      <p className="mt-4 text-zk-ink/75">
        zuknow.in stores your phone number, delivery address, and order history to fulfil 15-minute deliveries. WhatsApp
        OTP is sent through Turnkey Infotech. Payments are processed by Razorpay. We do not sell your number.
      </p>
    </article>
  );
}
