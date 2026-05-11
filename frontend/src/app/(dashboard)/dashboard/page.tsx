"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import EmailForm from "@/components/EmailForm";
import HistoryList from "@/components/HistoryList";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EmailForm />
          <HistoryList />
        </div>
      </main>
    </div>
  );
}
