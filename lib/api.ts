// lib/api.ts
import { getOrCreateCustomerId } from "@/lib/customer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type CreateOrderPayload = {
  customerId?: string | null;
  customerNote?: string | null;
  items: Array<{
    menuItemId: string;
    qty: number;
    selectedOptions: Array<{ optionId: string; valueKeys: string[] }>;
  }>;
};

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error("menu fetch failed");
  return res.json();
}

export async function createOrder(payload: CreateOrderPayload) {
  // ✅ customerId가 없으면 로컬 저장된 손님 ID를 자동 주입
  const customerId =
    payload.customerId && String(payload.customerId).trim()
      ? String(payload.customerId).trim()
      : getOrCreateCustomerId();

  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Next.js cache 방지(주문은 항상 최신 요청)
    cache: "no-store",
    body: JSON.stringify({
      ...payload,
      customerId,
    }),
  });

  if (!res.ok) {
    let msg = "주문 생성에 실패했습니다.";
    try {
      const j = await res.json();
      msg = j?.detail ? String(j.detail) : msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<{
    id: string;
    order_no: string;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
}

export async function fetchOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "주문 조회에 실패했습니다.";
    try {
      const j = await res.json();
      msg = j?.detail ? String(j.detail) : msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<{
    order: {
      id: string;
      order_no: string;
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
  }>;
}

// 결재목록 조회
export async function fetchOrders(params: { customerId: string; limit?: number }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const qs = new URLSearchParams();
  qs.set("customerId", params.customerId);
  qs.set("limit", String(params.limit ?? 30));

  const res = await fetch(`${base}/orders?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`fetchOrders failed: ${res.status} ${t}`);
  }

  return res.json() as Promise<{
    orders: Array<{
      id: string;
      order_no: string;
      status: string;
      total_amount: number;
      created_at: string;
    }>;
  }>;
}
