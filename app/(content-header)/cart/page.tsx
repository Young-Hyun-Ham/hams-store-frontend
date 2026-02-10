// app/(content-header)/cart/page.tsx
'use client'

import { useCart } from '@/lib/cart.store'
import { createOrder } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, clear } = useCart()
  const router = useRouter()

  async function order() {
    const res = await createOrder({
      customerId: crypto.randomUUID(),
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        qty: i.qty,
        selectedOptions: i.selectedOptions,
      })),
    })

    clear()
    router.push(`/order/complete?id=${res.id}`)
  }

  return (
    <div>
      <h1>장바구니</h1>
      {items.map((i, idx) => (
        <div key={idx}>{i.name} x {i.qty}</div>
      ))}

      <button onClick={order}>주문하기</button>
    </div>
  )
}
