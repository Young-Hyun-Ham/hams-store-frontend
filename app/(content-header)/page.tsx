// app\(content-header)\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { fetchMenu } from '@/lib/api'
import { useCart } from '@/lib/cart.store'

export default function MenuPage() {
  const [menu, setMenu] = useState<any>(null)
  const addItem = useCart((s) => s.addItem)

  useEffect(() => {
    fetchMenu().then(setMenu)
  }, [])

  if (!menu) return <div>로딩중...</div>

  return (
    <div>
      {menu.categories.map((cat: any) => (
        <div key={cat.id}>
          <h2>{cat.name}</h2>

          {menu.items
            .filter((i: any) => i.category_id === cat.id)
            .map((item: any) => (
              <div key={item.id}>
                <strong>{item.name}</strong>
                <div>{item.price.toLocaleString()}원</div>

                <button
                  onClick={() =>
                    addItem({
                      menuItemId: item.id,
                      name: item.name,
                      qty: 1,
                      price: item.price,
                      selectedOptions: [],
                    })
                  }
                >
                  담기
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
