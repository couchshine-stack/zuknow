import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({
  kicker,
  title,
  subtitle,
  href,
  action = "See all",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-4 sm:mb-6 flex items-end justify-between gap-3 border-b border-slate-100 pb-3">
      <div>
        {kicker ? (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {kicker}
          </span>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs font-normal text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-sky-600 transition hover:text-sky-700"
        >
          <span>{action}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
