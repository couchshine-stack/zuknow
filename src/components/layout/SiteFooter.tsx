import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-900/[0.06] bg-[#F5F5F7] text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/logo.png" alt="zuknow.in" width={48} height={48} className="h-10 w-10 object-contain rounded-xl shadow-sm" />
          <p className="mt-3 font-display text-lg font-bold tracking-tight text-slate-900">
            zukn<span className="text-[#F97316]">o</span>w<span className="text-[#F97316]">.in</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Everything you need. Faster. Groceries, home build, electricals, and verified local pros — delivered in 15 minutes across Amravati.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Shop Categories</p>
          <ul className="mt-3.5 space-y-2 text-xs text-slate-600">
            <li><Link className="transition hover:text-slate-900" href="/category/fruits-veg">Fruits & Vegetables</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/category/build">Home Build & Hardware</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/category/electronics">Electronics & Accessories</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/services">On-Demand Home Services</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Account & Orders</p>
          <ul className="mt-3.5 space-y-2 text-xs text-slate-600">
            <li><Link className="transition hover:text-slate-900" href="/account">Your Account</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/orders">Order History</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/track">Live Order Tracking</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/seller/login">Partner Seller Portal</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="transition hover:text-slate-900" href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Service Coverage</p>
          <p className="mt-3.5 text-xs leading-relaxed text-slate-500">
            Dark stores and fleets deployed across Rajapeth, Camp, Jaistambh, and Sai Nagar. One unified 15-minute standard for the entire city.
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Amravati · 15-Minute City</p>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} zuknow.in · Secured by Razorpay 256-bit encryption
      </div>
    </footer>
  );
}
