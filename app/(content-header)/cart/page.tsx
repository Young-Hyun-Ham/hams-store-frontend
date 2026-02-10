// app/(content-header)/cart/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import OrderTypeSheet, { OrderType } from "@/components/OrderTypeSheet";

function formatWon(v: number) {
  return `${v.toLocaleString()}원`;
}

export default function CartPage() {
  const router = useRouter();
  const { lines, inc, dec, remove } = useCartStore();


  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  const summary = useMemo(() => {
    const totalQty = lines.reduce((s, l) => s + l.qty, 0);
    const totalAmount = lines.reduce(
      (s, l) => s + (l.basePrice + l.optionDelta) * l.qty,
      0
    );
    return { totalQty, totalAmount };
  }, [lines]);

  const hasItems = lines.length > 0;

  return (
    <div className="cart-wrap">
      <div className="cart-title">장바구니</div>
      <div className="cart-sub">옵션/수량을 확인하고 주문해 주세요.</div>

      {lines.length === 0 ? (
        <div className="cart-empty">
          <b>아직 담긴 메뉴가 없어요</b>
          <span>메뉴판에서 메뉴를 담아 보세요.</span>
        </div>
      ) : (
        <div className="cart-list">
          {lines.map((line) => {
            const unit = line.basePrice + line.optionDelta;
            const amount = unit * line.qty;

            return (
              <div key={line.key} className="cart-card">
                <div className="cart-row">
                  <div className="cart-main">
                    <div className="cart-name">{line.name}</div>
                    <div className="cart-opt">{line.optionLabelText}</div>
                    <div className="cart-price">
                      단가 {formatWon(unit)} · 합계{" "}
                      <b>{formatWon(amount)}</b>
                    </div>
                  </div>

                  <button onClick={() => remove(line.key)} className="cart-del">
                    삭제
                  </button>
                </div>

                <div className="cart-qty">
                  <button onClick={() => dec(line.key)} className="cart-qty-btn">
                    -
                  </button>
                  <div className="cart-qty-num">{line.qty}</div>
                  <button onClick={() => inc(line.key)} className="cart-qty-btn">
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* sticky footer */}
      <div className="cart-bar">
        <div className="cart-bar-inner">
          <div className="cart-bar-left">
            <small>총 {summary.totalQty}개</small>
            <b>{formatWon(summary.totalAmount)}</b>
          </div>

          <div className="cart-bar-actions">
            {!hasItems ? (
              // 비었을 때: 버튼 1개만 크게
              <button
                className="cart-btn primary wide"
                onClick={() => router.push("/")}
              >
                메뉴 담으러 가기
              </button>
            ) : (
              // 담겼을 때: 보조 + 메인 2개
              <>
                <button
                  className="cart-btn secondary"
                  onClick={() => router.push("/")}
                >
                  메뉴 추가
                </button>

                <button
                  className="cart-btn primary"
                  onClick={() => setOrderSheetOpen(true)}
                >
                  주문하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <OrderTypeSheet
        open={orderSheetOpen}
        onClose={() => setOrderSheetOpen(false)}
        onConfirm={(type: OrderType) => {
          setOrderSheetOpen(false);

          // 다음 단계 화면(아직 없으면 일단 query로만 넘겨둠)
          // 체크아웃 페이지 만들 때 이걸 받아서 "포장/매장" 표시하면 됨
          router.push(`/checkout?type=${type}`);
        }}
      />
    </div>
  );
}
