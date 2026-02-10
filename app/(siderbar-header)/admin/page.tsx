// app/(sidebar-header)/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)]">
          <div className="text-lg font-black">관리자</div>
          <div className="mt-1 text-sm text-neutral-600">임진매운갈비</div>

          <nav className="mt-4 space-y-2">
            <a className="block rounded-2xl px-3 py-3 font-bold ring-1 ring-neutral-200 hover:bg-neutral-50" href="/admin/orders">
              주문 관리
            </a>
            <a className="block rounded-2xl px-3 py-3 font-bold ring-1 ring-neutral-200 hover:bg-neutral-50" href="/admin/notifications">
              알림 로그
            </a>
          </nav>
        </aside>

        <main className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
