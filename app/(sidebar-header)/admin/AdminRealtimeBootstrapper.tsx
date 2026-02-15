// app/(sidebar-header)/admin/AdminRealtimeBootstrapper.tsx 
"use client";

import { useEffect } from "react";
import { useNewOrderBeep } from "@/lib/admin/useNewOrderBeep";

export default function AdminRealtimeBootstrapper() {
  // ✅ "주문~" 음성 알림
  useNewOrderBeep(10000, "주문. 새 주문이 들어왔습니다");

  useEffect(() => {
    // ✅ 첫 사용자 제스처에서 오디오/TTS가 막히지 않도록 "워밍업"
    const unlock = () => {
      try {
        // WebAudio 워밍업
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctx.close();
      } catch {}

      try {
        // TTS 보이스 로딩 트리거(브라우저에 따라 getVoices가 첫 호출에 로드됨)
        window.speechSynthesis?.getVoices?.();
      } catch {}

      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return null;
}
