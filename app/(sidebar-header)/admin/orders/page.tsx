// app/(sidebar-header)/admin/orders/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from 'lucide-react';

type OrderRow = {
  id: string;
  order_no: number;
  customer_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
};

type OrderDetail = {
  order: {
    id: string;
    order_no: number;
    customer_id: string | null;
    status: string;
    customer_note: string | null;
    total_amount: number;
    created_at: string;
    accepted_at: string | null;
    completed_at: string | null;
    canceled_at: string | null;
  };
  items: Array<{
    id: string;
    order_id: string;
    menu_item_id: string;
    name_snapshot: string;
    price_snapshot: number;
    qty: number;
    line_amount: number;
  }>;
  itemOptions: Array<{
    id: string;
    order_item_id: string;
    option_key: string;
    option_name: string;
    value_key: string;
    value_label: string;
    price_delta: number;
  }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

function getOwnerIdSafe() {
  try {
    return localStorage.getItem("imjin:ownerId") || "";
  } catch {
    return "";
  }
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>(""); // empty=all
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [acting, setActing] = useState<"" | "accept" | "complete">("");
  const [toast, setToast] = useState<string>("");

  const query = useMemo(() => {
    const u = new URL(`${API_BASE}/admin/orders`);
    if (status) u.searchParams.set("status", status);
    u.searchParams.set("limit", "80");
    return u.toString();
  }, [status]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setToast("");
    try {
      const r = await fetch(query, { cache: "no-store" });
      if (!r.ok) throw new Error(`list failed: ${r.status}`);
      const data = (await r.json()) as { orders: OrderRow[] };
      setOrders(data.orders || []);
    } catch (e: any) {
      setToast(e?.message || "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const onRefresh = () => {
      // ✅ 알림이 울릴 때마다 목록 새로고침
      loadOrders();

      // (선택) 지금 선택된 주문이 있으면 상세도 같이 갱신
      if (selectedId) loadDetail(selectedId);
    };

    window.addEventListener("imjin:admin:refresh-orders", onRefresh);
    return () => window.removeEventListener("imjin:admin:refresh-orders", onRefresh);
  }, [loadOrders, selectedId]);

  async function loadDetail(id: string) {
    setDetailLoading(true);
    setToast("");
    try {
      const r = await fetch(`${API_BASE}/orders/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`detail failed: ${r.status}`);
      const data = (await r.json()) as OrderDetail;
      setDetail(data);
    } catch (e: any) {
      setDetail(null);
      setToast(e?.message || "주문 상세 조회 실패");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = detail?.order;

  const optionsByItem = useMemo(() => {
    const map = new Map<string, OrderDetail["itemOptions"]>();
    for (const opt of detail?.itemOptions || []) {
      const arr = map.get(opt.order_item_id) || [];
      arr.push(opt);
      map.set(opt.order_item_id, arr);
    }
    return map;
  }, [detail]);

  async function acceptOrder() {
    if (!selectedId) return;
    const ownerId = getOwnerIdSafe();
    if (!ownerId) {
      setToast("ownerId가 없습니다. localStorage 'imjin:ownerId'를 먼저 넣어주세요.");
      return;
    }

    setActing("accept");
    setToast("");
    try {
      const r = await fetch(`${API_BASE}/admin/orders/${selectedId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.detail || `accept failed: ${r.status}`);
      setToast("✅ 접수 처리 완료 + 고객에게 알림 발송 시도 완료");
      await loadOrders();
      await loadDetail(selectedId);
    } catch (e: any) {
      setToast(e?.message || "접수 실패");
    } finally {
      setActing("");
    }
  }

  async function completeOrder() {
    if (!selectedId) return;
    const ownerId = getOwnerIdSafe();
    if (!ownerId) {
      setToast("ownerId가 없습니다. localStorage 'imjin:ownerId'를 먼저 넣어주세요.");
      return;
    }

    setActing("complete");
    setToast("");
    try {
      const r = await fetch(`${API_BASE}/admin/orders/${selectedId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.detail || `complete failed: ${r.status}`);
      setToast("✅ 완료 처리 완료");
      await loadOrders();
      await loadDetail(selectedId);
    } catch (e: any) {
      setToast(e?.message || "완료 처리 실패");
    } finally {
      setActing("");
    }
  }

  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-black">주문 관리</div>
          <div className="mt-1 text-sm text-neutral-600">
            새 주문(PLACED)을 눌러 상세를 확인하고, <span className="font-bold">접수</span>를 누르면 손님에게 “조리 시작” 알림이 갑니다.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <div className="relative">
            <select
              className="appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm w-full bg-white"
              value={status}
              onChange={(e) => {
                setSelectedId("");
                setDetail(null);
                setStatus(e.target.value);
              }}
            >
              <option value="">전체</option>
              <option value="PLACED">PLACED (새 주문)</option>
              <option value="ACCEPTED">ACCEPTED (접수)</option>
              <option value="COMPLETED">COMPLETED (완료)</option>
              <option value="CANCELED">CANCELED (취소)</option>
            </select>
            {/* 커스텀 화살표: 텍스트 왼쪽 padding과 동일한 간격(12px) */}
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
          
          <button
            onClick={loadOrders}
            className="h-11 rounded-2xl px-4 font-black ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
          {toast}
        </div>
      ) : null}

      {/* 바디: 좌(리스트) / 우(상세) */}
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* 좌측: 주문 리스트 */}
        <div className="rounded-3xl ring-1 ring-neutral-100">
          <div className="border-b border-neutral-100 p-3 text-sm font-black text-neutral-700">
            주문 목록 ({orders.length})
          </div>

          <div className="divide-y divide-neutral-100">
            {orders.map((o) => {
              const active = o.id === selectedId;
              const badge =
                o.status === "PLACED"
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : o.status === "ACCEPTED"
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : o.status === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-neutral-50 text-neutral-600 ring-neutral-200";

              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={[
                    "w-full text-left p-4 transition",
                    active ? "bg-neutral-50" : "hover:bg-neutral-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-black">#{o.order_no}</div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-black ring-1 ${badge}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-neutral-600">
                        {dt(o.created_at)} · 합계 {money(o.total_amount)}원
                      </div>
                    </div>

                    <div className="text-xs font-bold text-neutral-400">
                      {active ? "선택됨" : "보기"}
                    </div>
                  </div>
                </button>
              );
            })}

            {!loading && orders.length === 0 ? (
              <div className="p-6 text-center text-sm font-bold text-neutral-500">
                주문이 없습니다.
              </div>
            ) : null}
          </div>
        </div>

        {/* 우측: 주문 상세 */}
        <div className="rounded-3xl ring-1 ring-neutral-100">
          <div className="border-b border-neutral-100 p-3 text-sm font-black text-neutral-700">
            주문 상세
          </div>

          {!selectedId ? (
            <div className="p-6 text-sm font-bold text-neutral-500">
              왼쪽에서 주문을 선택하세요.
            </div>
          ) : detailLoading ? (
            <div className="p-6 text-sm font-bold text-neutral-500">불러오는 중...</div>
          ) : !detail ? (
            <div className="p-6 text-sm font-bold text-neutral-500">
              상세를 불러오지 못했습니다.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black">#{selected?.order_no}</div>
                  <div className="text-xs font-black text-neutral-600">{selected?.status}</div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-neutral-600">
                  <div>주문시각: {dt(selected?.created_at)}</div>
                  <div>접수시각: {dt(selected?.accepted_at)}</div>
                  <div>완료시각: {dt(selected?.completed_at)}</div>
                  <div>취소시각: {dt(selected?.canceled_at)}</div>
                </div>

                {selected?.customer_note ? (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-neutral-700 ring-1 ring-neutral-100">
                    요청사항: {selected.customer_note}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-black text-neutral-700">주문 메뉴</div>
                <div className="space-y-2">
                  {detail.items.map((it) => {
                    const opts = optionsByItem.get(it.id) || [];
                    return (
                      <div key={it.id} className="rounded-2xl bg-white p-3 ring-1 ring-neutral-100">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-black">{it.name_snapshot}</div>
                            <div className="mt-1 text-xs font-bold text-neutral-600">
                              {it.qty}개 · {money(it.line_amount)}원
                            </div>
                          </div>
                          <div className="text-xs font-black text-neutral-500">
                            단가 {money(it.price_snapshot)}원
                          </div>
                        </div>

                        {opts.length ? (
                          <div className="mt-2 space-y-1">
                            {opts.map((o) => (
                              <div key={o.id} className="flex items-center justify-between text-xs font-bold text-neutral-700">
                                <div>
                                  {o.option_name}: <span className="font-black">{o.value_label}</span>
                                </div>
                                {o.price_delta ? (
                                  <div className="text-neutral-500">
                                    +{money(o.price_delta)}원
                                  </div>
                                ) : (
                                  <div className="text-neutral-400">+0</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                <div className="text-sm font-black">총 합계</div>
                <div className="text-base font-black">{money(selected?.total_amount || 0)}원</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={acceptOrder}
                  disabled={acting !== "" || selected?.status === "COMPLETED" || selected?.status === "CANCELED"}
                  className="h-12 rounded-2xl bg-neutral-900 font-black text-white hover:bg-neutral-800 disabled:opacity-40"
                >
                  {acting === "accept" ? "접수 중..." : "접수"}
                </button>

                <button
                  onClick={completeOrder}
                  disabled={acting !== "" || selected?.status === "COMPLETED" || selected?.status === "CANCELED"}
                  className="h-12 rounded-2xl bg-white font-black ring-1 ring-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
                >
                  {acting === "complete" ? "완료 중..." : "완료"}
                </button>
              </div>

              <div className="text-xs font-bold text-neutral-500">
                * “접수”는 손님 devices 토큰으로 푸시를 발송하고(notification_logs 기록) 처리됩니다. 
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
