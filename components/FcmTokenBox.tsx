// components/FcmTokenBox.tsx
"use client";

import { registerWebFcmToken, saveDevice } from "@/lib/fcm/registerFcm";
import { useState } from "react";

export default function FcmTokenBox({ userId }: { userId: string }) {
  const [msg, setMsg] = useState("");

  const onClick = async () => {
    try {
      setMsg("토큰 발급 중...");
      const token = await registerWebFcmToken();
      await saveDevice({ userId, token });
      setMsg("✅ 알림 설정 완료");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  return (
    <div className="rounded-xl border p-4">
      <button
        onClick={onClick}
        className="rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        알림 허용
      </button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
