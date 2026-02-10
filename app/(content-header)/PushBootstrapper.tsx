"use client";

import { useFcmToken } from "@/lib/push/useFcmToken";

// 너 프로젝트에 이미 customer_id를 어떻게 만들지 정해져 있어야 함.
// MVP는: "기기 고유 userId"를 localStorage에 생성해서 쓰는 방식이 제일 편함.
function getOrCreateCustomerId() {
  const key = "imjin:customerId";
  const v = localStorage.getItem(key);
  if (v) return v;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export default function PushBootstrapper() {
  const userId = typeof window !== "undefined" ? getOrCreateCustomerId() : null;
  useFcmToken(userId);

  return null;
}
