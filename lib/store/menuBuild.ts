// lib/store/menuBuild.ts
import type { BuiltItemOption, MenuOption, MenuOptionValue } from "@/components/OptionSheet";

export type MenuResponse = {
  items: { id: string; name: string; description?: string; price: number; image_url?: string; category_id?: string }[];
  options: MenuOption[];
  optionValues: MenuOptionValue[];
  itemOptionMap: { menu_item_id: string; option_id: string; sort_order?: number }[];
};

export function buildOptionsForItem(menu: MenuResponse, menuItemId: string): BuiltItemOption[] {
  const optionIds = menu.itemOptionMap
    .filter((m) => m.menu_item_id === menuItemId)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((m) => m.option_id);

  return optionIds
    .map((optionId) => {
      const option = menu.options.find((o) => o.id === optionId);
      if (!option) return null;

      const values = menu.optionValues
        .filter((v) => v.option_id === optionId)
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

      return { option, values };
    })
    .filter(Boolean) as BuiltItemOption[];
}
