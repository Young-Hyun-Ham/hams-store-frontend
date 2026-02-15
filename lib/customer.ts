// lib/customer.ts
export const CUSTOMER_ID_KEY = "imjin:customerId";

export function getOrCreateCustomerId(): string {
  if (typeof window === "undefined") return ""; // 서버에서는 사용 금지
  const existing = localStorage.getItem(CUSTOMER_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID(); // 브라우저/모바일웹 OK
  localStorage.setItem(CUSTOMER_ID_KEY, id);
  return id;
}

export function getCustomerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_ID_KEY);
}
