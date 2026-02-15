// lib/push/useFcmToken.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase/client";
import { registerDevice } from "@/lib/push/registerDevice";
import { ensureGuestUser } from "@/lib/user/ensureGuestUser";

export function useFcmToken(userId: string | null) {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  
  const ranRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    if (ranRef.current) return;
    ranRef.current = true;

    let unsub: (() => void) | null = null;

    async function run() {
      if (!userId) return;

      // HTTPS(또는 localhost) + 서비스워커 + Notification API 필요
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) {
        setPermission("unsupported");
        return;
      }

      // 권한 요청
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      // 서비스워커 등록(중복 등록돼도 괜찮음)
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        setPermission("unsupported");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;
      const t = await getToken(messaging, { vapidKey });
      if (!t) return;

      setToken(t);

      await ensureGuestUser({ id: userId });

      // 백엔드 등록 (이미 너 FastAPI에 구현되어 있음)
      await registerDevice({ userId, platform: "web", fcmToken: t });

      // 포그라운드 수신(페이지 열려있을 때)
      unsub = onMessage(messaging, (payload) => {
        // 여기서는 토스트 띄우거나, 주문상세 재조회 트리거 걸면 됨
        // payload.data.orderId 등 활용
        console.log("[FCM foreground]", payload);
      });
    }

    run().catch((e) => console.error("[useFcmToken]", e));

    return () => {
      if (unsub) unsub();
    };
  }, [userId]);

  return { token, permission };
}
