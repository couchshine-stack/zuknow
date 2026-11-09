"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { CartProvider } from "@/components/cart/CartProvider";
import { LocationProvider } from "@/components/location/LocationProvider";
import { RegisterSW } from "@/components/pwa/RegisterSW";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          {children}
          <LoginSheet />
          <RegisterSW />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
