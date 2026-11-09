import { Clock, ShieldCheck, Sparkles, Truck } from "lucide-react";

const promises = [
  {
    icon: Clock,
    title: "15-Minute Delivery",
    text: "Hyperlocal dark stores stationed across Amravati.",
    badge: "Guaranteed",
  },
  {
    icon: Truck,
    title: "Unified Cart",
    text: "Groceries, hardware, and pros on a single order.",
    badge: "All-in-One",
  },
  {
    icon: Sparkles,
    title: "Verified Local Pros",
    text: "Electricians, cooks, and technicians at your door.",
    badge: "Background-Checked",
  },
  {
    icon: ShieldCheck,
    title: "Zero-Friction Checkout",
    text: "Instant WhatsApp login and 256-bit Razorpay pay.",
    badge: "Secure",
  },
];

export function PromiseRow() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {promises.map(({ icon: Icon, title, text, badge }) => (
        <div
          key={title}
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-900/[0.05] bg-white/90 p-5 shadow-apple-subtle backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:bg-white hover:shadow-apple-card"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 transition-colors group-hover:bg-[#1D1D1F] group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {badge}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
