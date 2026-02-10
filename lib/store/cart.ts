// lib/store/cart.ts
import { create } from "zustand";

export type CartSelectedOption = { optionId: string; valueKeys: string[] };

export type CartLine = {
  key: string; // 유니크 키(메뉴+옵션조합)
  menuItemId: string;
  name: string;
  basePrice: number;
  qty: number;
  selectedOptions: CartSelectedOption[];
  optionLabelText: string; // UI 요약
  optionDelta: number; // 옵션 추가금 합
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "key">) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

function stableKey(menuItemId: string, selectedOptions: CartSelectedOption[]) {
  const normalized = selectedOptions
    .map((o) => ({ optionId: o.optionId, valueKeys: [...o.valueKeys].sort() }))
    .sort((a, b) => a.optionId.localeCompare(b.optionId));
  return `${menuItemId}::${JSON.stringify(normalized)}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],

  addLine: (line) => {
    const key = stableKey(line.menuItemId, line.selectedOptions);
    const exists = get().lines.find((l) => l.key === key);
    if (exists) {
      set({
        lines: get().lines.map((l) =>
          l.key === key ? { ...l, qty: l.qty + line.qty } : l
        ),
      });
      return;
    }
    set({ lines: [{ ...line, key }, ...get().lines] });
  },

  inc: (key) =>
    set({
      lines: get().lines.map((l) =>
        l.key === key ? { ...l, qty: l.qty + 1 } : l
      ),
    }),

  dec: (key) =>
    set({
      lines: get().lines.map((l) =>
        l.key === key ? { ...l, qty: Math.max(1, l.qty - 1) } : l
      ),
    }),

  remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
  clear: () => set({ lines: [] }),
}));
