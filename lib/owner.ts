// lib/owner.ts
export const OWNER_ID_KEY = "imjin:ownerId";

export function setOwnerId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OWNER_ID_KEY, id);
}

export function getOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(OWNER_ID_KEY);
}
