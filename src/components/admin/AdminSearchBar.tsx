import { Search } from "lucide-react";

export function AdminSearchBar({
  action,
  q = "",
  placeholder,
  extra = {},
  name = "q",
}: {
  action: string;
  q?: string;
  placeholder: string;
  extra?: Record<string, string | undefined>;
  name?: string;
}) {
  return (
    <form action={action} method="get" className="flex w-full max-w-xl gap-2">
      {Object.entries(extra).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zk-ink/40" />
        <input
          key={`${action}-${name}-${q}`}
          name={name}
          defaultValue={q}
          placeholder={placeholder}
          className="h-11 w-full rounded-2xl border border-zk-line bg-white pl-10 pr-3 text-sm outline-none focus:border-zk-blue"
        />
      </label>
      <button type="submit" className="btn-primary h-11 px-5">
        Search
      </button>
    </form>
  );
}
