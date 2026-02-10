// components/OrderStatusBadge.tsx
type OrderStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED" | string;

function statusMeta(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return { label: "대기중", tone: "amber" as const, desc: "주문이 접수 대기중입니다." };
    case "ACCEPTED":
      return { label: "접수됨", tone: "green" as const, desc: "조리가 시작되었습니다." };
    case "COMPLETED":
      return { label: "완료", tone: "slate" as const, desc: "주문이 완료되었습니다." };
    case "CANCELED":
      return { label: "취소", tone: "rose" as const, desc: "주문이 취소되었습니다." };
    default:
      return { label: status, tone: "slate" as const, desc: "" };
  }
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const m = statusMeta(status);

  const cls =
    m.tone === "green"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : m.tone === "amber"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : m.tone === "rose"
      ? "bg-rose-50 text-rose-800 ring-rose-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        "ring-1 ring-inset",
        cls,
      ].join(" ")}
      aria-label={`주문 상태: ${m.label}`}
      title={m.desc}
    >
      {m.label}
    </span>
  );
}

export function OrderStatusHint({ status }: { status: OrderStatus }) {
  const m = statusMeta(status);
  if (!m.desc) return null;
  return <p className="mt-1 text-sm text-slate-600">{m.desc}</p>;
}
