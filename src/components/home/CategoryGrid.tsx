import Link from "next/link";
import type { Category } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function CategoryGrid({
  categories,
  compact = false,
}: {
  categories: Category[];
  compact?: boolean;
}) {
  const list = compact ? categories.slice(0, 8) : categories;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {list.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="group flex flex-col items-center rounded-2xl border border-slate-900/[0.05] bg-white p-4 text-center shadow-apple-subtle transition-all duration-200 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-apple-card active:scale-95"
        >
          <span
            className={cn(
              "flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-sm ring-1 ring-black/[0.03] transition-transform duration-300 group-hover:scale-110",
              cat.tint,
            )}
          >
            {cat.emoji}
          </span>
          <span className="mt-3 line-clamp-1 font-display text-xs font-semibold text-slate-900 group-hover:text-black">
            {cat.name}
          </span>
          {cat.tagline ? (
            <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
              {cat.tagline}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
