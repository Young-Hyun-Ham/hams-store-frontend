export type MenuCategory = {
  id: string
  name: string
}

export type MenuItem = {
  id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
}

export type MenuOption = {
  id: string
  key: string
  name: string
  selection_type: 'single' | 'multi'
  is_required: boolean
}

export type MenuOptionValue = {
  option_id: string
  value_key: string
  label: string
  price_delta: number
}
