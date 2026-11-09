import { MapPin, ShoppingBag, Bike } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "1. Pin Location",
    text: "Auto-routes to the nearest dark store in Rajapeth, Camp, or Sai Nagar.",
  },
  {
    icon: ShoppingBag,
    title: "2. Build Your Cart",
    text: "Add groceries, hardware tools, or book a specialist on one clock.",
  },
  {
    icon: Bike,
    title: "3. Doorstep in 15 Min",
    text: "Immediate dark store packing and express scooter dispatch.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-900/[0.06] bg-white p-7 shadow-apple-card sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Precision Logistics
          </span>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How zuknow delivers in 15 minutes.
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/60 self-start sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Dark Stores Stationed Citywide
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="group relative rounded-2xl border border-slate-100 bg-[#FAFBFD] p-6 transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-apple-subtle"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-900/[0.05] text-slate-800 transition-colors group-hover:bg-[#1D1D1F] group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
