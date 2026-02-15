"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCustomerId } from "@/lib/customer";
import { fetchOrders } from "@/lib/api";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  total_amount: number;
  created_at: string;
};

function formatKrw(v: number) {
  return `${(v ?? 0).toLocaleString()}원`;
}

function statusLabel(s: string) {
  switch (s) {
    case "PLACED":
      return "주문접수 대기";
    case "ACCEPTED":
      return "조리 시작";
    case "COMPLETED":
      return "완료";
    case "CANCELED":
      return "취소";
    default:
      return s;
  }
}

function formatDt(v: string) {
  // created_at이 timestamptz → ISO로 오면 브라우저에서 표시 가능
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string>("");

  const customerId = useMemo(() => getCustomerId(), []);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError("");

        if (!customerId) {
          // 아직 로컬스토리지에 없으면(극단 케이스) 빈 상태로 표시
          if (!alive) return;
          setOrders([]);
          return;
        }

        const data = await fetchOrders({ customerId, limit: 50 });
        if (!alive) return;
        setOrders(data.orders ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "주문내역을 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [customerId]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="h1" style={{ margin: 0 }}>결재내역</h1>
          <div className="mini" style={{ marginTop: 4 }}>
            최근 주문 내역을 확인할 수 있어요.
          </div>
        </div>

        <Link className="btn" href="/" style={{ textDecoration: "none" }}>
          메뉴로
        </Link>
      </div>

      {loading && (
        <div className="card" style={{ padding: 14 }}>
          불러오는 중...
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>오류</div>
          <div className="mini" style={{ whiteSpace: "pre-wrap" }}>{error}</div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>아직 주문 내역이 없어요</div>
          <div className="mini">메뉴에서 주문을 넣으면 여기에 표시됩니다.</div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.id}`}
              className="card"
              style={{
                textDecoration: "none",
                color: "inherit",
                padding: 14,
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>
                  주문번호 {o.order_no}
                </div>
                <div className="pill">
                  {statusLabel(o.status)}
                </div>
              </div>

              <div className="mini" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>{formatDt(o.created_at)}</span>
                <span style={{ fontWeight: 800 }}>{formatKrw(o.total_amount)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
