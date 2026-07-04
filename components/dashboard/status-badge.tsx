const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // Listings
  draft:       { label: "Draft",       cls: "" },
  open:        { label: "Open",        cls: "badge-primary" },
  under_offer: { label: "Under Offer", cls: "badge-money" },
  accepted:    { label: "Accepted",    cls: "badge-low" },
  sold:        { label: "Sold",        cls: "badge-low" },
  withdrawn:   { label: "Withdrawn",  cls: "" },
  expired:     { label: "Expired",    cls: "" },
  // Offers
  pending:     { label: "Pending",    cls: "badge-money" },
  countered:   { label: "Countered",  cls: "badge-mod" },
  rejected:    { label: "Rejected",   cls: "badge-high" },
  // Deals
  pending_payment: { label: "Pending Payment", cls: "badge-mod" },
  in_escrow:       { label: "In Escrow",       cls: "badge-money" },
  completed:       { label: "Completed",        cls: "badge-low" },
  cancelled:       { label: "Cancelled",        cls: "" },
  disputed:        { label: "Disputed",         cls: "badge-high" },
  // Investments
  matured:     { label: "Matured",    cls: "badge-low" },
  settled:     { label: "Settled",    cls: "badge-primary" },
  closed:      { label: "Closed",     cls: "" },
  active:      { label: "Active",     cls: "badge-primary" },
  // Observations
  under_review:    { label: "Under Review", cls: "badge-money" },
  approved:        { label: "Approved",     cls: "badge-low" },
  // Coins
  paused:      { label: "Paused",     cls: "badge-mod" },
  delisted:    { label: "Delisted",   cls: "" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? { label: status, cls: "" };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}
