// app/(content-header)/layout.tsx
import Link from "next/link";
import PushBootstrapper from "./PushBootstrapper";

export default function ContentHeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="logo" />
            <div className="title">
              <b>임진매운갈비</b>
              <span>주문 · 포장 · 빠른 픽업</span>
            </div>
          </Link>

          <nav style={{ display: "flex", gap: 8 }}>
            <Link className="btn" href="/order/3ae31e62-beba-41ed-aeb7-72b4411a9b7c" style={{ textDecoration: "none" }}>
              결재내역
            </Link>
            <Link className="btn" href="/cart" style={{ textDecoration: "none" }}>
              장바구니
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">{children}</div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="mini">© 임진매운갈비 · 무산점</div>
          <div className="mini">포장/매장식사 가능</div>
        </div>
      </footer>

      <PushBootstrapper />
    </div>
  );
}
