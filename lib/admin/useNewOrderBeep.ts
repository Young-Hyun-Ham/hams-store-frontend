// lib/admin/useNewOrderBeep.ts
"use client";

import { useEffect, useRef } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type OrderRow = {
  id: string;
  order_no: number;
  created_at: string;
  status: string;
};

function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;

    window.speechSynthesis.speak(u);
  } catch {}
}

export function useNewOrderBeep(
  pollMs = 10000,
  phrase = "주문~ 새 주문이 들어왔습니다"
) {
  const hasPlacedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const u = new URL(`${API_BASE}/admin/orders`);
        u.searchParams.set("status", "PLACED");
        u.searchParams.set("limit", "1");

        const r = await fetch(u.toString(), { cache: "no-store" });
        if (!r.ok) return;

        const data = (await r.json()) as { orders: OrderRow[] };
        const hasPlaced = (data.orders?.length || 0) > 0;

        if (hasPlaced) {
          // ✅ PLACED 주문이 존재하면 계속 음성 반복
          speak(phrase);
          hasPlacedRef.current = true;
          // ✅ 알림이 울릴 때마다 주문목록 새로고침 트리거
          window.dispatchEvent(new CustomEvent("imjin:admin:refresh-orders"));
        } else {
          // ✅ PLACED가 없으면 자동 정지
          window.speechSynthesis?.cancel();
          hasPlacedRef.current = false;
        }
      } catch {}
    }

    tick();

    const timer = setInterval(() => {
      if (!alive) return;
      tick();
    }, pollMs);

    return () => {
      alive = false;
      clearInterval(timer);
      window.speechSynthesis?.cancel();
    };
  }, [pollMs, phrase]);
}
