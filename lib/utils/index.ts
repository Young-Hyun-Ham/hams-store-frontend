// lib/utils/index.ts

// uuid 생성
export function getOrCreateUUID(key = "customer_uuid") {
  if (typeof window === "undefined") return "";

  let uuid = localStorage.getItem(key);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(key, uuid);
  }
  return uuid;
}
