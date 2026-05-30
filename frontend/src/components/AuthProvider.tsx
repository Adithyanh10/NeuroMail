"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Hydrates the auth store from cookies/localStorage once on app mount.
 * Place this at the root layout so it runs before any page checks auth.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
