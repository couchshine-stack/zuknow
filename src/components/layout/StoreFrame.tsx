"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { usePublicConfig } from "@/components/config/PublicConfigProvider";

export function StoreFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = usePublicConfig();
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
    return <>{children}</>;
  }
  if (config.maintenanceMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zk-mist px-6 text-center">
        <p className="font-display text-3xl font-extrabold text-zk-navy">{config.appName}</p>
        <p className="mt-3 max-w-md text-zk-ink/70">We are updating the dark stores. Please check back in a few minutes.</p>
        {config.supportPhone ? <p className="mt-4 text-sm font-semibold text-zk-blue">Help: {config.supportPhone}</p> : null}
      </div>
    );
  }
  return (
    <Providers>
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 pb-24 pt-5 md:pb-12 md:pt-8">{children}</main>
      <SiteFooter />
      <MobileTabBar />
    </Providers>
  );
}
