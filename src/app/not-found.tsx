import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-zk-line">
      <p className="text-5xl">🗺️</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-zk-navy">That aisle does not exist</h1>
      <p className="mt-2 text-sm text-zk-ink/55">Try another aisle, or head back to the 15-minute store.</p>
      <Link href="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
