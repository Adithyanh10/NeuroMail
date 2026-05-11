"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory } from "@/lib/api";
import type { EmailHistoryItem } from "@/types";
import { Clock, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function HistoryList() {
  const [items, setItems] = useState<EmailHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getHistory(page, PAGE_SIZE);
        setItems(data.items);
        setTotal(data.total);
      } catch {
        // silently fail — user may not have history yet
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-gray-500" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900">Reply History</h2>
        <span className="ml-auto text-sm text-gray-500">{total} total</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          No replies generated yet. Create your first one!
        </p>
      ) : (
        <ul className="space-y-3" role="list">
          {items.map((item) => (
            <li key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                aria-expanded={expanded === item.id}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">
                    {item.original_email.slice(0, 60)}...
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.tone}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                    <Link
                      href={`/history/${item.id}`}
                      className="text-primary-600 hover:text-primary-700"
                      aria-label="View full detail"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </button>

              {expanded === item.id && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Original Email
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {item.original_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Generated Reply
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {item.generated_reply}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} aria-hidden="true" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900 transition-colors"
            aria-label="Next page"
          >
            Next <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
