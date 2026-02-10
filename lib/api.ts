const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/menu`)
  if (!res.ok) throw new Error('menu fetch failed')
  return res.json()
}

export async function createOrder(payload: any) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('order failed')
  return res.json()
}
