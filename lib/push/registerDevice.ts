export async function registerDevice(params: {
  userId: string;
  platform: "web";
  fcmToken: string;
}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const res = await fetch(`${base}/devices/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`devices/register failed: ${res.status} ${t}`);
  }
  return res.json();
}
