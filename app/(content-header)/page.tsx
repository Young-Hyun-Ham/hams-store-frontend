// app/(content-header)/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "@/lib/api";
import OptionSheet, { type BuiltItemOption, type MenuItem } from "@/components/OptionSheet";

export default function MenuPage() {
  const [menu, setMenu] = useState<any>(null);

  // 옵션시트 상태
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [sheetBuiltOptions, setSheetBuiltOptions] = useState<BuiltItemOption[]>([]);

  useEffect(() => {
    fetchMenu().then(setMenu);
  }, []);

  const itemsByCat = useMemo(() => {
    if (!menu) return new Map<string, any[]>();
    const m = new Map<string, any[]>();
    for (const it of menu.items) {
      const key = it.category_id;
      m.set(key, [...(m.get(key) ?? []), it]);
    }
    return m;
  }, [menu]);

  // 특정 메뉴 아이템에 대한 builtOptions 생성
  function buildOptionsForItem(menuItemId: string): BuiltItemOption[] {
    if (!menu) return [];

    const mapRows = (menu.itemOptionMap ?? [])
      .filter((r: any) => r.menu_item_id === menuItemId)
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // options: id 필드 호환 (id / option_id / optionId)
    const optionById = new Map<string, any>();
    for (const o of menu.options ?? []) {
      const oid = String(o?.id ?? o?.option_id ?? o?.optionId ?? "");
      if (!oid) continue;
      optionById.set(oid, o);
    }

    // optionValues: option_id 필드 호환 (option_id / optionId / optionID)
    const valuesByOptionId = new Map<string, any[]>();
    for (const v of menu.optionValues ?? []) {
      const oid = String(v?.option_id ?? v?.optionId ?? v?.optionID ?? "");
      if (!oid) continue;
      const arr = valuesByOptionId.get(oid) ?? [];
      arr.push(v);
      valuesByOptionId.set(oid, arr);
    }

    return mapRows
      .map((r: any) => {
        const optionId = String(r?.option_id ?? r?.optionId ?? "");
        if (!optionId) return null;

        const opt = optionById.get(optionId);
        if (!opt) return null;

        const values = (valuesByOptionId.get(optionId) ?? [])
          .slice()
          .sort((a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

        // OptionSheet 타입이 MenuOption.id를 기대하니까,
        //    opt에도 id가 없으면 여기서 id를 주입해준다(호환)
        const optFixed = {
          ...opt,
          id: String(opt?.id ?? opt?.option_id ?? opt?.optionId ?? optionId),
        };

        return { option: optFixed, values };
      })
      .filter(Boolean) as BuiltItemOption[];
  }

  if (!menu) return <div className="card" style={{ padding: 16 }}>메뉴 불러오는 중...</div>;

  return (
    <div>
      <div className="hero">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div className="badge">🔥 매운맛 조절 가능</div>
            <div style={{ marginTop: 10, fontWeight: 1000, fontSize: 20, letterSpacing: "-0.4px" }}>
              오늘도 매운갈비 땡기는 날
            </div>
            <div className="muted" style={{ marginTop: 6, fontWeight: 800, fontSize: 13 }}>
              메뉴 선택 → 장바구니 → 주문 완료까지 1분
            </div>
          </div>
        </div>
      </div>

      {menu.categories.map((cat: any) => {
        const list = itemsByCat.get(cat.id) ?? [];
        if (!list.length) return null;

        return (
          <section key={cat.id}>
            <div className="section-title">
              <h2>{cat.name}</h2>
              <div className="count">{list.length}개</div>
            </div>

            {list.map((item: any) => (
              <div key={item.id} className="menu-item">
                <div className="thumb" />
                <div className="menu-info">
                  <div className="menu-name">{item.name}</div>
                  <div className="menu-desc">{item.description ?? " "}</div>

                  <div className="menu-bottom">
                    <div className="price">{Number(item.price).toLocaleString()}원</div>
                    <div className="actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          // 담기 → 옵션시트 열기
                          const built = buildOptionsForItem(item.id);

                          setSheetItem({
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: Number(item.price) || 0,
                            image_url: item.image_url,
                          });

                          setSheetBuiltOptions(built);
                          setSheetOpen(true);
                        }}
                      >
                        담기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {/* OptionSheet는 지금 최종소스 Props 그대로 사용 */}
      {sheetItem && (
        <OptionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          item={sheetItem}
          builtOptions={sheetBuiltOptions}
        />
      )}
    </div>
  );
}
