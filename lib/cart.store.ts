import { create } from 'zustand'

type CartItem = {
  menuItemId: string
  name: string
  qty: number
  price: number
  selectedOptions: {
    optionId: string
    valueKeys: string[]
  }[]
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  clear: () => void
}

export const useCart = create<CartState>((set: any) => ({
  items: [],
  addItem: (item: any) =>
    set((s: any) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}))
