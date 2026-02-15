// app/(sidebar-header)/admin/layout.tsx
import "./admin.css"; // 관리자에서만 Tailwind 로드
import AdminPushBootstrapper from "./PushBootstrapper";
import AdminRealtimeBootstrapper from "./AdminRealtimeBootstrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50">
      <AdminPushBootstrapper />
      <AdminRealtimeBootstrapper />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
          {/* 상단: 좌측 타이틀 / 우측 메뉴 버튼 */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-black">관리자</div>
              <div className="mt-1 text-sm text-neutral-600">임진매운갈비</div>
            </div>

            {/* ✅ 우측 상단 버튼 그룹 (글자폭만큼) */}
            <nav className="flex flex-wrap items-center justify-end gap-2">
              <a
                className="inline-flex h-9 items-center rounded-2xl px-3 text-sm font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
                href="/admin"
              >
                관리자홈
              </a>
              <a
                className="inline-flex h-9 items-center rounded-2xl px-3 text-sm font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
                href="/admin/orders"
              >
                주문관리
              </a>
              <a
                className="inline-flex h-9 items-center rounded-2xl px-3 text-sm font-black ring-1 ring-neutral-200 hover:bg-neutral-50"
                href="/admin/notifications"
              >
                알림로그
              </a>
            </nav>
          </div>

          {/* (선택) 사이드바에 추가 메뉴가 늘어날 거면 여기 아래 영역에 따로 섹션을 두면 됨 */}
          <div className="mt-4 rounded-2xl bg-neutral-50 p-3 text-xs font-bold text-neutral-600 ring-1 ring-neutral-100">
            새 주문이 있으면 5초마다 음성 알림이 반복됩니다. (접수하면 멈춤)
          </div>
        </aside>

        <main className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
