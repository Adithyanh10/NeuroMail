"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // Redirect authenticated users to dashboard
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return null;
}
