export function CardSkeleton({ height = 120 }: { height?: number }) {
  return (
    <div
      className="card"
      style={{
        height,
        background: "var(--surface-2)",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function StatGridSkeleton() {
  return (
    <div className="stat-grid">
      {[120, 120, 120, 120].map((h, i) => (
        <CardSkeleton key={i} height={h} />
      ))}
    </div>
  );
}

export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="cards-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} height={180} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 52,
            borderBottom: i < rows - 1 ? "1px solid var(--line)" : "none",
            background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
            animation: "skeletonPulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
