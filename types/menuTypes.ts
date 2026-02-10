// lib/store/menuTypes.ts
export type MenuCategory = { id: string; name: string; sort_order: number; is_active: boolean };
export type MenuItem = { id: string; category_id: string; name: string; description?: string; price: number; image_url?: string; sort_order: number; is_active: boolean };

export type MenuOption = {
  id: string;
  key: string;              // 예: "spicy", "sari"
  name: string;             // 예: "매운 단계", "사리 추가"
  selection_type: "single" | "multi";
  is_required: boolean;
  sort_order: number;
};

export type MenuOptionValue = {
  id: string;
  option_id: string;
  value_key: string;        // 예: "1", "2", "udon"
  label: string;            // 예: "1단계", "우동사리"
  price_delta: number;
  sort_order: number;
  is_active: boolean;
};

export type ItemOptionMap = { menu_item_id: string; option_id: string; sort_order: number };

export type MenuResponse = {
  categories: MenuCategory[];
  items: MenuItem[];
  options: MenuOption[];
  optionValues: MenuOptionValue[];
  itemOptionMap: ItemOptionMap[];
};

export type BuiltItemOption = {
  option: MenuOption;
  values: MenuOptionValue[];
};


// export type CartItem = {
//   menuItemId: string
//   name: string
//   qty: number
//   price: number
//   selectedOptions: {
//     optionId: string
//     valueKeys: string[]
//   }[]
// }