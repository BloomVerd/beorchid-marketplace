import { toast as s } from "sonner";

export type ToastKind = "ok" | "money" | "warn";

const KIND_STYLE: Record<ToastKind, React.CSSProperties> = {
  ok:    { borderLeftColor: "var(--primary)" },
  money: { borderLeftColor: "var(--money)" },
  warn:  { borderLeftColor: "var(--risk-mod)" },
};

export function showToast({
  msg,
  kind = "ok",
  description,
  duration,
}: {
  msg: string;
  kind?: ToastKind;
  description?: string;
  duration?: number;
}) {
  const style = KIND_STYLE[kind];
  if (kind === "warn") return s.warning(msg, { description, duration, style });
  return s.success(msg, { description, duration, style });
}

showToast.ok    = (msg: string) => showToast({ msg, kind: "ok" });
showToast.money = (msg: string) => showToast({ msg, kind: "money" });
showToast.warn  = (msg: string) => showToast({ msg, kind: "warn" });
showToast.error = (msg: string) => s.error(msg);
