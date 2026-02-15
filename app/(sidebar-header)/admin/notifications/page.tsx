// app/(sidebar-header)/admin/notifications/page.tsx
"use client";

import { useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type NotiRow = {
  id: string;
  order_id: string | null;
  user_id: string | null;
  channel: string;
  title: string;
  body: string;
  send_status: "queued" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
};

function dtFull(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(d);
}

export default function AdminNotificationsPage() {
  const [orderId, setOrderId] = useState("");
  const [rows, setRows] = useState<NotiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");

  const listUrl = useMemo(() => {
    const u = new URL(`${API_BASE}/admin/notifications`);
    u.searchParams.set("limit", "120");
    if (orderId.trim()) u.searchParams.set("orderId", orderId.trim());
    return u.toString();
  }, [orderId]);

  async function load() {
    setLoading(true);
    setToast("");
    try {
      const r = await fetch(listUrl, { cache: "no-store" });
      if (!r.ok) throw new Error(`list failed: ${r.status}`);
      const data = (await r.json()) as { notifications: NotiRow[] };
      setRows(data.notifications || []);
    } catch (e: any) {
      setToast(e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  }

  async function dispatchQueued() {
    setActing(true);
    setToast("");
    try {
      const u = new URL(`${API_BASE}/admin/notifications/dispatch`);
      u.searchParams.set("limit", "50");
      const r = await fetch(u.toString(), { method: "POST" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.detail || `dispatch failed: ${r.status}`);
      setToast(`✅ 처리 ${data.processed} / sent ${data.sent} / failed ${data.failed}`);
      await load();
    } catch (e: any) {
      setToast(e?.message || "dispatch 실패");
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-black">알림 로그</div>
          <div className="mt-1 text-sm text-neutral-600">
            접수/상태 변경 시 생성된 notification_logs를 확인합니다.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-11 w-[260px] rounded-2xl bg-white px-3 text-sm font-bold ring-1 ring-neutral-200"
            placeholder="orderId로 필터 (선택)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button
            onClick={load}
            className="h-11 rounded-2xl px-4 font-black ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "조회"}
          </button>
          <button
            onClick={dispatchQueued}
            className="h-11 rounded-2xl bg-neutral-900 px-4 font-black text-white hover:bg-neutral-800 disabled:opacity-50"
            disabled={acting}
            title="queued 상태 알림을 실제 발송 처리"
          >
            {acting ? "dispatch..." : "dispatch"}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl ring-1 ring-neutral-100">
        <div className="border-b border-neutral-100 p-3 text-sm font-black text-neutral-700">
          로그 ({rows.length})
        </div>

        <div className="divide-y divide-neutral-100">
          {rows.map((n) => {
            const badge =
              n.send_status === "sent"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : n.send_status === "failed"
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "bg-amber-50 text-amber-700 ring-amber-200";

            return (
              <div key={n.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-black ring-1 ${badge}`}>
                        {n.send_status}
                      </span>
                      <div className="text-sm font-black">{n.title}</div>
                      {n.order_id ? (
                        <div className="text-xs font-bold text-neutral-500">order: {n.order_id}</div>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-neutral-700">{n.body}</div>
                  </div>

                  <div className="text-xs font-bold text-neutral-500">
                    created {dtFull(n.created_at)}
                    <br />
                    sent {dtFull(n.sent_at)}
                  </div>
                </div>

                {n.error_message ? (
                  <div className="mt-3 rounded-2xl bg-neutral-50 p-3 text-xs font-bold text-neutral-600 ring-1 ring-neutral-100">
                    error: {n.error_message}
                  </div>
                ) : null}
              </div>
            );
          })}

          {!loading && rows.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-neutral-500">
              로그가 없습니다.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
