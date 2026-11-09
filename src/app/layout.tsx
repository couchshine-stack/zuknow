import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreFrame } from "@/components/layout/StoreFrame";
import { PublicConfigProvider } from "@/components/config/PublicConfigProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "zuknow.in — Everything you need. Faster.",
    template: "%s · zuknow.in",
  },
  description:
    "Quick commerce for the whole house. Groceries, home build, cooking, electronics, and on-demand services delivered in 15 minutes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "zuknow.in",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#163A8C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <PublicConfigProvider>
          <StoreFrame>{children}</StoreFrame>
        </PublicConfigProvider>
      </body>
    </html>
  );
}
