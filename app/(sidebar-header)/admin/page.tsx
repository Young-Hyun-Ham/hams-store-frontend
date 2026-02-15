// app/(sidebar-header)/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type OrderRow = {
  id: string;
  order_no: number;
  status: string;
  total_amount: number;
  created_at: string;
};

function money(v: number) {
  return new Intl.NumberFormat("ko-KR").format(v);
}
function dt(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function AdminHomePage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [placed, setPlaced] = useState<OrderRow[]>([]);
  const [recent, setRecent] = useState<OrderRow[]>([]);

  const placedUrl = useMemo(() => {
    const u = new URL(`${API_BASE}/admin/orders`);
    u.searchParams.set("status", "PLACED");
    u.searchParams.set("limit", "10");
    return u.toString();
  }, []);

  const recentUrl = useMemo(() => {
    const u = new URL(`${API_BASE}/admin/orders`);
    u.searchParams.set("limit", "10");
    return u.toString();
  }, []);

  async function load() {
    setLoading(true);
    setToast("");
    try {
      const [r1, r2] = await Promise.all([
        fetch(placedUrl, { cache: "no-store" }),
        fetch(recentUrl, { cache: "no-store" }),
      ]);

      const d1 = await r1.json().catch(() => ({}));
      const d2 = await r2.json().catch(() => ({}));

      if (!r1.ok) throw new Error(d1?.detail || `PLACED 조회 실패: ${r1.status}`);
      if (!r2.ok) throw new Error(d2?.detail || `최근 주문 조회 실패: ${r2.status}`);

      setPlaced((d1?.orders || []) as OrderRow[]);
      setRecent((d2?.orders || []) as OrderRow[]);
    } catch (e: any) {
      setToast(e?.message || "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placedCount = placed.length;

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-black tracking-tight">관리자 메인</div>
          <div className="mt-1 text-sm font-bold text-neutral-600">
            새 주문을 빠르게 확인하고, 주문 관리로 이동해 처리하세요.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/orders"
            className="h-11 rounded-2xl bg-neutral-900 px-4 inline-flex items-center justify-center font-black text-white hover:bg-neutral-800"
          >
            주문 관리로 이동
          </a>
          <a
            href="/admin/notifications"
            className="h-11 rounded-2xl bg-white px-4 inline-flex items-center justify-center font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            알림 로그
          </a>
          <button
            onClick={load}
            disabled={loading}
            className="h-11 rounded-2xl px-4 font-black ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
          >
            {loading ? "새로고침..." : "새로고침"}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
          {toast}
        </div>
      ) : null}

      {/* KPI 카드 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          <div className="text-xs font-black text-neutral-500">새 주문 (PLACED)</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-black">{placedCount}</div>
            <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-200">
              확인 필요
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-neutral-600">
            새 주문이 있으면 주문 관리에서 접수하세요.
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          <div className="text-xs font-black text-neutral-500">최근 주문</div>
          <div className="mt-2 text-3xl font-black">{recent.length}</div>
          <div className="mt-2 text-sm font-bold text-neutral-600">
            최근 {recent.length}건을 프리뷰로 보여줍니다.
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          <div className="text-xs font-black text-neutral-500">빠른 작업</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="/admin/orders?status=PLACED"
              className="rounded-2xl bg-neutral-900 px-3 py-2 text-sm font-black text-white hover:bg-neutral-800"
            >
              새 주문만 보기
            </a>
            <a
              href="/admin/orders?status=ACCEPTED"
              className="rounded-2xl bg-white px-3 py-2 text-sm font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              접수 주문 보기
            </a>
          </div>
          <div className="mt-2 text-sm font-bold text-neutral-600">
            상태별로 빠르게 이동할 수 있어요.
          </div>
        </div>
      </div>

      {/* 새 주문 프리뷰 */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-neutral-100">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <div>
            <div className="text-lg font-black">새 주문 (PLACED) 프리뷰</div>
            <div className="mt-1 text-sm font-bold text-neutral-600">
              아래 목록을 눌러 주문 관리에서 상세 확인/접수하세요.
            </div>
          </div>
          <a
            href="/admin/orders"
            className="rounded-2xl bg-white px-3 py-2 text-sm font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            전체 보기
          </a>
        </div>

        <div className="divide-y divide-neutral-100">
          {placed.map((o) => (
            <a
              key={o.id}
              href={`/admin/orders?select=${o.id}`}
              className="block p-4 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-black">#{o.order_no}</div>
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-200">
                      PLACED
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-neutral-600">
                    {dt(o.created_at)} · 합계 {money(o.total_amount)}원
                  </div>
                </div>
                <div className="text-xs font-black text-neutral-500">주문 관리에서 보기 →</div>
              </div>
            </a>
          ))}

          {!loading && placed.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-neutral-500">
              지금은 새 주문이 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      {/* 최근 주문 프리뷰 */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-neutral-100">
        <div className="border-b border-neutral-100 p-4">
          <div className="text-lg font-black">최근 주문</div>
          <div className="mt-1 text-sm font-bold text-neutral-600">최신 10건</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {recent.map((o) => {
            const badge =
              o.status === "PLACED"
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : o.status === "ACCEPTED"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : o.status === "COMPLETED"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-neutral-50 text-neutral-600 ring-neutral-200";

            return (
              <a
                key={o.id}
                href={`/admin/orders?select=${o.id}`}
                className="block p-4 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-base font-black">#{o.order_no}</div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-black ring-1 ${badge}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-neutral-600">
                      {dt(o.created_at)} · 합계 {money(o.total_amount)}원
                    </div>
                  </div>
                  <div className="text-xs font-black text-neutral-500">보기 →</div>
                </div>
              </a>
            );
          })}

          {!loading && recent.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-neutral-500">
              주문 데이터가 없습니다.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
