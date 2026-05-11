"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getHistory } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import type { EmailHistoryItem } from "@/types";
import { ExternalLink, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const PAGE_SIZE = 15;
const PRIORITY_DOT: Record<string, string> = { High: "bg-red-500", Medium: "bg-yellow-500", Low: "bg-green-500" };
const GRADE_BADGE: Record<string, string> = {
  A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700",
  C: "bg-yellow-100 text-yellow-700", D: "bg-red-100 text-red-700",
};

export default function HistoryListPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [items, setItems] = useState<EmailHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", priority: "", tone: "", intent: "", emotion: "" });
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
    getHistory(page, PAGE_SIZE, active)
      .then((d) => { setItems(d.items); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [page, filters, isAuthenticated]);

  const clearFilters = () => { setFilters({ category: "", priority: "", tone: "", intent: "", emotion: "" }); setPage(1); };
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reply History</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} total replies</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${showFilters || activeFilterCount > 0 ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="card p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: "category", label: "Category", options: ["General","Refund","Delivery","Technical","Billing"] },
              { key: "priority", label: "Priority",  options: ["High","Medium","Low"] },
              { key: "tone",     label: "Tone",      options: ["professional","formal","friendly"] },
              { key: "intent",   label: "Intent",    options: ["complaint","meeting_request","follow_up","sales_inquiry","customer_support"] },
              { key: "emotion",  label: "Emotion",   options: ["angry","urgent","happy","frustrated","neutral"] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <select
                  value={filters[key as keyof typeof filters]}
                  onChange={(e) => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}
                  className="input-field text-xs py-1.5"
                >
                  <option value="">All</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {activeFilterCount > 0 && (
              <div className="col-span-full flex justify-end">
                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-500 mb-4">No replies found{activeFilterCount > 0 ? " matching your filters" : ""}.</p>
            {activeFilterCount > 0
              ? <button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>
              : <Link href="/dashboard" className="btn-primary text-sm">Generate your first reply</Link>
            }
          </div>
        ) : (
          <>
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Email Preview</th>
                      <th className="px-3 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide w-24">Intent</th>
                      <th className="px-3 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide w-20">Priority</th>
                      <th className="px-3 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide w-16">Grade</th>
                      <th className="px-3 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide w-24">Tone</th>
                      <th className="px-3 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide w-28">Date</th>
                      <th className="px-3 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx === items.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-4 py-3 text-gray-800 max-w-xs">
                          <p className="truncate">{item.original_email.slice(0, 70)}...</p>
                          {item.is_urgent && <span className="text-xs text-orange-600 font-medium">⚡ Urgent</span>}
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded capitalize">
                            {(item.intent ?? "—").replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[item.predicted_priority ?? ""] ?? "bg-gray-300"}`} />
                            <span className="text-xs text-gray-600">{item.predicted_priority ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {item.reply_grade
                            ? <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${GRADE_BADGE[item.reply_grade] ?? "bg-gray-100 text-gray-600"}`}>{item.reply_grade}</span>
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="capitalize text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{item.tone}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">{formatDate(item.created_at)}</td>
                        <td className="px-3 py-3 text-center">
                          <Link href={`/history/${item.id}`} className="text-blue-600 hover:text-blue-800" aria-label="View detail">
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900">
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
