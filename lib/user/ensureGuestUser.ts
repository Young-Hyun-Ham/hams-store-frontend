// lib/user/ensureGuestUser.ts
export async function ensureGuestUser(params: { id: string; name?: string | null }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const res = await fetch(`${base}/users/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: params.id, name: params.name ?? null }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`users/guest failed: ${res.status} ${t}`);
  }
  return res.json();
}
