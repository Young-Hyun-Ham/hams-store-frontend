// lib/fcm/registerFcm.ts
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase/client";

async function ensureSW() {
  if (!("serviceWorker" in navigator)) return false;
  await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;
  return true;
}

export async function registerWebFcmToken() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("알림 권한 거부됨");
  }

  await ensureSW();

  const messaging = await getFirebaseMessaging();
  if (!messaging) throw new Error("FCM 미지원 브라우저");

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  if (!token) throw new Error("FCM 토큰 발급 실패");
  return token;
}

export async function saveDevice({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "b7576939-11ca-4502-89f6-e3735465f88c", // userId,
      platform: "web",
      fcmToken: token,
    }),
  });
}
