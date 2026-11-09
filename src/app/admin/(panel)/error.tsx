"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-zk-line">
      <h1 className="font-display text-2xl font-extrabold text-zk-navy">This admin page crashed</h1>
      <p className="mt-2 text-sm text-zk-ink/65">
        If you just saved, the change may already be in the database. Open the page again. Do not keep clicking Save.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try again
        </button>
        <a href="/admin" className="btn-navy">
          Admin home
        </a>
      </div>
    </div>
  );
}
