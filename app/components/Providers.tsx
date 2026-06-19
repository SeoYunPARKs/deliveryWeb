"use client";

import { AuthProvider } from "@/app/components/AuthProvider";
import { CartProvider } from "@/app/components/CartProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
