// app/(content-header)/order/[orderId]/page.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchOrder } from "@/lib/api";

function formatWon(v: number) {
  return `${Number(v || 0).toLocaleString()}원`;
}

function statusLabel(status: string) {
  switch (status) {
    case "PLACED":
      return "접수 대기";
    case "ACCEPTED":
      return "조리 시작";
    case "COMPLETED":
      return "완료";
    case "CANCELED":
      return "취소";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "PLACED":
      return "is-placed";
    case "ACCEPTED":
      return "is-accepted";
    case "COMPLETED":
      return "is-completed";
    case "CANCELED":
      return "is-canceled";
    default:
      return "is-placed";
  }
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchOrder>> | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 중복 호출/경합 방지용
  const fetchingRef = useRef(false);

  async function load() {
    if (!orderId) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setErrorMsg("");

    try {
      const next = await fetchOrder(orderId);
      setData(next);
    } catch (e: any) {
      setErrorMsg(e?.message || "주문 조회 실패");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }

  // 1) 최초 로드
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // 2) PLACED(접수대기) 상태일 때만 폴링 → 접수되면 자동 중단
  useEffect(() => {
    if (!data?.order?.status) return;
    if (data.order.status !== "PLACED") return;

    const t = setInterval(() => {
      load();
    }, 3000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.order?.status, orderId]);

  // 3) 푸시 눌러서 들어오거나, 탭 복귀 시에도 즉시 갱신
  useEffect(() => {
    function onFocus() {
      load();
    }
    function onVis() {
      if (document.visibilityState === "visible") load();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const groupedOptions = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const o of data?.itemOptions ?? []) {
      const arr = m.get(o.order_item_id) ?? [];
      arr.push(`${o.option_name}: ${o.value_label}`);
      m.set(o.order_item_id, arr);
    }
    return m;
  }, [data]);

  if (errorMsg) {
    return (
      <div className="co-wrap">
        <div className="co-title">주문 상세</div>
        <div className="co-sub" style={{ color: "#e11d48", fontWeight: 900 }}>
          {errorMsg}
        </div>

        <div className="cart-bar">
          <div className="cart-bar-inner">
            <div className="cart-bar-left">
              <small>다시 시도하거나</small>
              <b>메뉴로 이동</b>
            </div>
            <div className="cart-bar-actions">
              <button className="cart-btn secondary" onClick={load}>
                다시 시도
              </button>
              <button className="cart-btn primary" onClick={() => router.push("/")}>
                메뉴로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="co-wrap">
        <div className="co-title">주문 불러오는 중...</div>
        <div className="co-sub">잠시만 기다려 주세요.</div>
      </div>
    );
  }

  const { order, items } = data;

  return (
    <div className="co-wrap">
      <div className="co-head">
        <div>
          <div className="co-title">주문 상세</div>
          <div className="co-sub">
            주문번호 <b>{order.order_no}</b> · {new Date(order.created_at).toLocaleString("ko-KR")}
            {loading ? <span style={{ marginLeft: 8, opacity: 0.7 }}>업데이트 중…</span> : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="cart-btn secondary"
            onClick={load}
            disabled={loading}
            style={{ padding: "10px 12px" }}
            aria-label="상태 새로고침"
          >
            새로고침
          </button>

          <div className={`status-pill ${statusClass(order.status)}`}>
            {statusLabel(order.status)}
          </div>
        </div>
      </div>

      {/* 이하 기존 그대로 */}
      <div className="co-grid">
        <div className="co-card">
          <h3>주문 내역</h3>
          <div className="co-muted">
            총 {items.reduce((s, it) => s + it.qty, 0)}개 · {formatWon(order.total_amount)}
          </div>

          <div className="co-lines">
            {items.map((it) => {
              const opts = groupedOptions.get(it.id) ?? [];
              return (
                <div key={it.id} className="co-line">
                  <div className="co-line-top">
                    <div className="co-line-name">{it.name_snapshot}</div>
                    <div className="co-line-qty">× {it.qty}</div>
                  </div>
                  <div className="co-line-opt">
                    {opts.length ? opts.join(" / ") : "옵션 없음"}
                  </div>
                  <div className="co-line-price">
                    합계 <b>{formatWon(it.line_amount)}</b>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="co-card">
          <h3>요청사항</h3>
          <div className="co-muted" style={{ marginTop: 8 }}>
            {order.customer_note ? order.customer_note : "요청사항 없음"}
          </div>
        </div>
      </div>

      <div className="cart-bar">
        <div className="cart-bar-inner">
          <div className="cart-bar-left">
            <small>다른 메뉴도 담아볼까요?</small>
            <b>메뉴판으로 이동</b>
          </div>
          <div className="cart-bar-actions">
            <button className="cart-btn secondary" onClick={() => router.push("/cart")}>
              장바구니
            </button>
            <button className="cart-btn primary" onClick={() => router.push("/")}>
              메뉴로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
