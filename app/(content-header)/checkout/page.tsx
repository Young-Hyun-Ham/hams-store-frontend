// app/(content-header)/checkout/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/lib/api";

type OrderType = "pickup" | "dinein";

function formatWon(v: number) {
  return `${v.toLocaleString()}원`;
}

function typeLabel(t: OrderType) {
  return t === "dinein" ? "매장 식사" : "포장/픽업";
}

export default function CheckoutPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const type = (sp.get("type") as OrderType) || "pickup";

  const { lines, clear } = useCartStore();

  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const summary = useMemo(() => {
    const totalQty = lines.reduce((s, l) => s + l.qty, 0);
    const totalAmount = lines.reduce(
      (s, l) => s + (l.basePrice + l.optionDelta) * l.qty,
      0
    );
    return { totalQty, totalAmount };
  }, [lines]);

  const canSubmit = lines.length > 0;

  async function submit() {
    if (lines.length === 0) {
      router.push("/");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        // customerId는 나중에 로그인/디바이스 연동되면 넣으면 됨 (지금은 null)
        customerId: null,
        customerNote: `[${typeLabel(type)}] ${requestNote.trim()}`.trim(),
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          qty: l.qty,
          selectedOptions: l.selectedOptions.map((o) => ({
            optionId: o.optionId,
            valueKeys: o.valueKeys,
          })),
        })),
      };

      const created = await createOrder(payload);

      // ✅ 성공 → cart 비우고 성공 페이지로
      clear();

      router.push(
        `/order/success?orderId=${encodeURIComponent(created.id)}&orderNo=${encodeURIComponent(
          created.order_no
        )}&amount=${encodeURIComponent(String(created.total_amount))}`
      );
    } catch (e: any) {
      setErrorMsg(e?.message || "주문 생성에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <div className="co-wrap">
      <div className="co-head">
        <div>
          <div className="co-title">주문 확인</div>
          <div className="co-sub">주문 방식과 요청사항을 확인한 뒤 주문을 확정해 주세요.</div>
        </div>
        <div className="co-chip">{typeLabel(type)}</div>
      </div>

      <div className="co-grid">
        <div className="co-card">
          <h3>주문 내역</h3>
          <div className="co-muted">
            총 {summary.totalQty}개 · {formatWon(summary.totalAmount)}
          </div>

          {lines.length === 0 ? (
            <div className="co-muted" style={{ marginTop: 10 }}>
              담긴 메뉴가 없어요. 메뉴판으로 이동해 주세요.
            </div>
          ) : (
            <div className="co-lines">
              {lines.map((line) => {
                const unit = line.basePrice + line.optionDelta;
                const amount = unit * line.qty;

                return (
                  <div key={line.key} className="co-line">
                    <div className="co-line-top">
                      <div className="co-line-name">{line.name}</div>
                      <div className="co-line-qty">× {line.qty}</div>
                    </div>
                    <div className="co-line-opt">{line.optionLabelText}</div>
                    <div className="co-line-price">
                      단가 {formatWon(unit)} · 합계 <b>{formatWon(amount)}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="co-card">
          <h3>요청사항</h3>
          <div className="co-muted">예) 덜 맵게, 소스 따로, 젓가락 많이 주세요</div>

          <div className="co-field">
            <div className="co-label">사장님께 전달할 메시지</div>
            <textarea
              className="co-textarea"
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="요청사항을 입력해 주세요 (선택)"
            />
            <div className="co-note">* 요청사항은 상황에 따라 반영이 어려울 수 있어요.</div>
          </div>
        </div>
      </div>

      {/* sticky bottom bar */}
      <div className="cart-bar">
        <div className="cart-bar-inner">
          <div className="cart-bar-left">
            <small>결제 예상 금액</small>
            <b>{formatWon(summary.totalAmount)}</b>
          </div>

          <div className="cart-bar-actions">
            {/* Cart로 복귀 */}
            <button
              className="cart-btn secondary"
              onClick={() => router.push("/cart")}
            >
              뒤로가기
            </button>

            {/* 주문 확정 */}
            <button
              className="cart-btn primary"
              disabled={!canSubmit}
              onClick={submit}
            >
              주문 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
