// app/(content-header)/order/success/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

function formatWon(v: number) {
  return `${v.toLocaleString()}원`;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const orderNo = sp.get("orderNo") ?? "";
  const amount = Number(sp.get("amount") ?? "0");
  const orderId = sp.get("orderId") ?? "";

  return (
    <div className="co-wrap">
      <div className="co-head">
        <div>
          <div className="co-title">주문이 접수되었습니다 ✅</div>
          <div className="co-sub">
            주문이 들어갔어요. 곧 조리가 시작됩니다.
          </div>
        </div>
        {orderNo ? <div className="co-chip">주문번호 {orderNo}</div> : null}
      </div>

      <div className="co-grid">
        <div className="co-card">
          <h3>결제 예상 금액</h3>
          <div className="co-muted">총 결제(예상)</div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 1000 }}>
            {formatWon(amount)}
          </div>
          <div className="co-muted" style={{ marginTop: 10 }}>
            * 실제 결제는 매장 정책에 따라 달라질 수 있어요.
          </div>
        </div>

        <div className="co-card">
          <h3>다음 안내</h3>
          <div className="co-muted" style={{ marginTop: 8 }}>
            • 조리 시작/완료 알림은 다음 단계에서 푸시(FCM)로 연결할 예정이에요.  
            • 지금은 주문내역 조회 화면을 다음 단계에서 붙일게요.
          </div>
        </div>
      </div>

      {/* footer (cart 패턴 재사용) */}
      <div className="cart-bar">
        <div className="cart-bar-inner">
          <div className="cart-bar-left">
            <small>주문을 확인할 수 있어요</small>
            <b>주문 상세 보기</b>
          </div>
          <div className="cart-bar-actions">
            {orderId ? (
              <button className="cart-btn secondary" onClick={() => router.push(`/order/${orderId}`)}>
                주문 상세
              </button>
            ) : null}
            <button className="cart-btn primary" onClick={() => router.push("/")}>
              메뉴로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
