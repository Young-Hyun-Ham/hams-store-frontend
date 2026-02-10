// components/OrderTypeSheet.tsx
"use client";

import { useMemo, useState } from "react";

export type OrderType = "pickup" | "dinein";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (type: OrderType) => void;
  defaultType?: OrderType;
};

export default function OrderTypeSheet({
  open,
  onClose,
  onConfirm,
  defaultType = "pickup",
}: Props) {
  const [type, setType] = useState<OrderType>(defaultType);

  // open이 false일 때 렌더 자체를 안 해버리면,
  // 다음에 열 때 defaultType 반영이 안 될 수 있어서 open 바뀔 때 초기화 대신
  // 간단히 memo로 버튼 disabled만 처리
  const canSubmit = useMemo(() => Boolean(type), [type]);

  if (!open) return null;

  function close() {
    onClose();
  }

  function submit() {
    if (!canSubmit) return;
    onConfirm(type);
  }

  return (
    <>
      <button className="ots-overlay" onClick={close} aria-label="닫기" />

      <div className="ots-panel" role="dialog" aria-modal="true">
        <div className="ots-inner">
          <div className="ots-head">
            <div>
              <div className="ots-title">주문 방식을 선택해 주세요</div>
              <div className="ots-sub">포장 또는 매장에서 식사 중 선택할 수 있어요.</div>
            </div>
            <button className="ots-close" onClick={close}>
              닫기
            </button>
          </div>

          <div className="ots-cards">
            <button
              className={`ots-card ${type === "pickup" ? "is-selected" : ""}`}
              onClick={() => setType("pickup")}
            >
              <div className="ots-left">
                <div className="ots-icon">🥡</div>
                <div className="ots-text">
                  <div className="ots-name">포장 / 빠른 픽업</div>
                  <div className="ots-desc">조리 완료 후 바로 가져갈 수 있어요.</div>
                </div>
              </div>
              <div className="ots-check">{type === "pickup" ? "선택됨" : "선택"}</div>
            </button>

            <button
              className={`ots-card ${type === "dinein" ? "is-selected" : ""}`}
              onClick={() => setType("dinein")}
            >
              <div className="ots-left">
                <div className="ots-icon">🍽️</div>
                <div className="ots-text">
                  <div className="ots-name">매장 식사</div>
                  <div className="ots-desc">매장에서 바로 드실게요.</div>
                </div>
              </div>
              <div className="ots-check">{type === "dinein" ? "선택됨" : "선택"}</div>
            </button>
          </div>

          <div className="ots-actions">
            <button className="ots-btn secondary" onClick={close}>
              취소
            </button>
            <button className="ots-btn primary" onClick={submit} disabled={!canSubmit}>
              다음
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
