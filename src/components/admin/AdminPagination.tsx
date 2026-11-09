import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ADMIN_PAGE_SIZE } from "@/lib/admin-list";
import { cn } from "@/lib/utils";

function pageWindow(page: number, pageCount: number) {
  const set = new Set([1, pageCount, page - 1, page, page + 1]);
  return [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
}

export function AdminPagination({
  page,
  pageCount,
  total,
  pageSize = ADMIN_PAGE_SIZE,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize?: number;
  hrefFor: (page: number) => string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageWindow(page, pageCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm">
      <p className="text-zk-ink/55">
        Showing <span className="font-semibold text-zk-navy">{from}–{to}</span> of{" "}
        <span className="font-semibold text-zk-navy">{total}</span>
      </p>
      {pageCount > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Link
            href={hrefFor(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-full px-3 font-semibold",
              page <= 1 ? "pointer-events-none text-zk-ink/30" : "text-zk-blue hover:bg-white",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Link>
          {pages.map((n, i) => {
            const prev = pages[i - 1];
            return (
              <span key={n} className="contents">
                {prev && n - prev > 1 ? <span className="px-1 text-zk-ink/40">…</span> : null}
                <Link
                  href={hrefFor(n)}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold",
                    n === page ? "bg-zk-navy text-white" : "text-zk-navy hover:bg-white",
                  )}
                >
                  {n}
                </Link>
              </span>
            );
          })}
          <Link
            href={hrefFor(Math.min(pageCount, page + 1))}
            aria-disabled={page >= pageCount}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-full px-3 font-semibold",
              page >= pageCount ? "pointer-events-none text-zk-ink/30" : "text-zk-blue hover:bg-white",
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}

export function AdminFilterChips({
  options,
  value,
  hrefFor,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <Link
          key={option.value}
          href={hrefFor(option.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            value === option.value ? "bg-zk-navy text-white" : "bg-white text-zk-navy ring-1 ring-zk-line hover:bg-zk-mist",
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminEmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-zk-ink/50">
        {message}
      </td>
    </tr>
  );
}
