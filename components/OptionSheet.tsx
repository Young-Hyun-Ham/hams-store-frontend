// components/OptionSheet.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
};

export type MenuOption = {
  id: string;
  name: string;
  selection_type: "single" | "multi";
  is_required: boolean;
};

export type MenuOptionValue = {
  id: string;
  option_id: string;
  value_key: string;
  label: string;
  price_delta: number;
  is_active: boolean;
  sort_order?: number;
};

export type BuiltItemOption = {
  option: MenuOption;
  values: MenuOptionValue[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  item: MenuItem;
  builtOptions: BuiltItemOption[];
};

export default function OptionSheet({ open, onClose, item, builtOptions }: Props) {
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);

  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<Record<string, string[]>>({}); // optionId -> valueKeys

  const { optionDelta, optionLabelText, canSubmit } = useMemo(() => {
    let delta = 0;
    const labels: string[] = [];

    for (const bo of builtOptions) {
      const keys = picked[bo.option.id] ?? [];
      const pickedVals = bo.values.filter((v) => keys.includes(v.value_key));
      if (pickedVals.length) {
        labels.push(`${bo.option.name}: ${pickedVals.map((v) => v.label).join(", ")}`);
        delta += pickedVals.reduce((s, v) => s + (Number(v.price_delta) || 0), 0);
      }
    }

    const requiredOk = builtOptions.every((bo) => {
      if (!bo.option.is_required) return true;
      const keys = picked[bo.option.id] ?? [];
      return bo.option.selection_type === "single" ? keys.length === 1 : keys.length >= 1;
    });

    return {
      optionDelta: delta,
      optionLabelText: labels.join(" / "),
      canSubmit: requiredOk,
    };
  }, [builtOptions, picked]);

  if (!open) return null;

  const unit = (Number(item.price) || 0) + optionDelta;
  const total = unit * qty;

  function closeAndReset() {
    onClose();
    setQty(1);
    setPicked({});
  }

  function toggleMulti(optionId: string, valueKey: string) {
    setPicked((prev) => {
      const cur = prev[optionId] ?? [];
      const next = cur.includes(valueKey) ? cur.filter((k) => k !== valueKey) : [...cur, valueKey];
      return { ...prev, [optionId]: next };
    });
  }

  function setSingle(optionId: string, valueKey: string) {
    setPicked((prev) => ({ ...prev, [optionId]: [valueKey] }));
  }

  function submit() {
    if (!canSubmit) return;

    addLine({
      menuItemId: item.id,
      name: item.name,
      basePrice: Number(item.price) || 0,
      qty,
      selectedOptions: builtOptions
        .map((bo) => ({ optionId: bo.option.id, valueKeys: picked[bo.option.id] ?? [] }))
        .filter((o) => o.valueKeys.length > 0),
      optionLabelText: optionLabelText || "옵션 없음",
      optionDelta,
    });

    closeAndReset();
    router.push("/cart");
  }

  return (
    <>
      <button className="os-overlay" onClick={closeAndReset} aria-label="닫기" />

      <div className="os-panel" role="dialog" aria-modal="true">
        <div className="os-inner">
          <div className="os-head">
            <div>
              <div className="os-title">{item.name}</div>
              <div className="os-sub">기본 {Number(item.price).toLocaleString()}원</div>
            </div>
            <button onClick={closeAndReset} className="os-close">
              닫기
            </button>
          </div>

          <div className="os-sections">
            {builtOptions.map((bo) => (
              <div key={bo.option.id} className="os-card">
                <div className="os-card-head">
                  <div className="os-card-title">
                    {bo.option.name}
                    {bo.option.is_required && <span className="os-required">필수</span>}
                  </div>
                  <div className="os-card-hint">
                    {bo.option.selection_type === "single" ? "1개 선택" : "복수 선택"}
                  </div>
                </div>

                <div className="os-list">
                  {bo.values
                    .filter((v) => v.is_active)
                    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
                    .map((v) => {
                      const selected = (picked[bo.option.id] ?? []).includes(v.value_key);
                      const priceText =
                        (Number(v.price_delta) || 0) === 0 ? "" : `(+${Number(v.price_delta).toLocaleString()}원)`;

                      return (
                        <button
                          key={v.id}
                          onClick={() =>
                            bo.option.selection_type === "single"
                              ? setSingle(bo.option.id, v.value_key)
                              : toggleMulti(bo.option.id, v.value_key)
                          }
                          className={`os-opt ${selected ? "is-selected" : ""}`}
                        >
                          <strong>{v.label}</strong>
                          <span>{priceText}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="os-qty">
            <div className="os-qty-box">
              <button className="os-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                -
              </button>
              <div className="os-qty-num">{qty}</div>
              <button className="os-qty-btn" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <div className="os-total">
              <small>총 결제 예상</small>
              <b>{total.toLocaleString()}원</b>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`os-submit ${canSubmit ? "is-enabled" : "is-disabled"}`}
          >
            장바구니 담기
          </button>

          {!canSubmit && <div className="os-warn">필수 옵션을 선택해 주세요.</div>}
        </div>
      </div>
    </>
  );
}
