"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCoins } from "@/common/hooks/queries/use-coins";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { useCreateCoin } from "@/common/hooks/mutations/use-create-coin";
import { useRecomputeCoinPrice } from "@/common/hooks/mutations/use-recompute-coin-price";
import { useUpdateCoinStatus } from "@/common/hooks/mutations/use-update-coin-status";
import { useModalStore } from "@/stores/modal-store";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:    { label: "Draft",    color: "var(--muted)" },
  ACTIVE:   { label: "Active",   color: "var(--money)" },
  PAUSED:   { label: "Paused",   color: "var(--sun)" },
  DELISTED: { label: "Delisted", color: "var(--error, #e55)" },
};

const COIN_COLORS: Record<string, string> = {
  MAIZ: "var(--sun)", COCO: "var(--primary)", RICO: "var(--water)", SOYA: "var(--money)",
};

const EMPTY_COIN = { name: "", symbol: "", backingCropId: "", basePrice: "" };

export default function CoinPricingPage() {
  const { data: coinsData, loading: coinsLoading, error: coinsError, refetch } = useCoins();
  const { data: cropsData } = useCrops();
  const [createCoin, { loading: creating }] = useCreateCoin();
  const [recompute] = useRecomputeCoinPrice();
  const [updateStatus] = useUpdateCoinStatus();
  const openCreateCropModal = useModalStore((s) => s.openCreateCropModal);

  const [recomputing, setRecomputing] = useState(false);
  const [weights, setWeights] = useState({ momentum: 60, demand: 25, health: 15 });
  const [newCoin, setNewCoin] = useState(EMPTY_COIN);

  if (coinsError) return <ErrorState message={coinsError.message} onRetry={() => refetch()} />;

  const coins = coinsData?.coins ?? [];
  const crops = cropsData?.crops ?? [];

  const totalW   = weights.momentum + weights.demand + weights.health || 1;
  const wTrend   = weights.momentum / totalW;
  const wDemand  = weights.demand   / totalW;
  const wHealth  = weights.health   / totalW;

  const sampleBase  = newCoin.basePrice ? parseFloat(newCoin.basePrice) : 12.5;
  const previewPrice = sampleBase * (1 + (wTrend * 0.3 + wDemand * 0.2 + wHealth * 0.15));

  const handleCreateCoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoin.name || !newCoin.symbol || !newCoin.basePrice) {
      toast.error("Name, symbol, and base price are required.");
      return;
    }
    try {
      await createCoin({
        variables: {
          input: {
            name: newCoin.name,
            symbol: newCoin.symbol,
            cropId: newCoin.backingCropId || undefined,
            basePrice: Math.round(parseFloat(newCoin.basePrice)),
            pricingWeights: { w_trend: wTrend, w_demand: wDemand, w_health: wHealth, w_vol: 0 },
          },
        },
      });
      toast.success(`${newCoin.symbol} coin created.`);
      setNewCoin(EMPTY_COIN);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create coin.");
    }
  };

  const handleStatusChange = async (coinId: string, status: string) => {
    try {
      await updateStatus({ variables: { id: coinId, status: status as import("@/common/graphql/generated/graphql").CoinStatus } });
      toast.success(`Coin status updated to ${STATUS_LABELS[status]?.label ?? status}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Status update failed.");
    }
  };

  const handleRecompute = async () => {
    if (coins.length === 0) { toast.info("No coins to recompute."); return; }
    setRecomputing(true);
    try {
      await Promise.all(coins.map((c) => recompute({ variables: { coinId: c.id } })));
      toast.success(`Recomputed prices for ${coins.length} coin${coins.length > 1 ? "s" : ""}.`);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Recompute failed.");
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className="anim-up">
      <div className="eyebrow">Admin console</div>
      <h1 className="h1" style={{ margin: "6px 0 4px" }}>Coin pricing</h1>
      <p className="muted" style={{ margin: "0 0 22px" }}>Manage crop-backed coins and adjust pricing weights.</p>

      <div className="detail-grid">
        {/* Left */}
        <div>
          {/* Coins table */}
          <div className="card" style={{ overflowX: "auto", marginBottom: 18 }}>
            <div style={{ padding: "16px 20px" }} className="h3">Coins</div>
            <div className="tbl-head" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 80px 160px" }}>
              <span>Coin</span><span>Backing</span><span>Current price</span><span>Status</span><span></span>
            </div>
            {coinsLoading
              ? [1,2,3,4].map((i) => <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 80px 160px", height: 52 }} />)
              : coins.length === 0
                ? <div style={{ padding: "24px 20px", textAlign: "center" }} className="faint">No coins yet.</div>
                : coins.map((coin) => {
                    const color = COIN_COLORS[coin.symbol] ?? "var(--primary)";
                    const backing = crops.find((c) => c.id === coin.cropId)?.name ?? "—";
                    const statusInfo = STATUS_LABELS[coin.status] ?? { label: coin.status, color: "var(--muted)" };
                    return (
                      <div key={coin.id} className="tbl-row" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 80px 160px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="iconbox iconbox-sm" style={{ background: color, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                            {coin.symbol.slice(0, 3)}
                          </span>
                          <span>
                            <span className="semibold" style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{coin.name}</span>
                            <span className="faint" style={{ fontSize: 11 }}>{coin.symbol}</span>
                          </span>
                        </span>
                        <span className="muted" style={{ fontSize: 13 }}>{backing}</span>
                        <span className="mono">{toGHS(coin.currentPrice)}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: statusInfo.color }}>{statusInfo.label}</span>
                        <span style={{ display: "flex", gap: 6 }}>
                          {coin.status === "DRAFT" && (
                            <button className="btn btn-money btn-sm" onClick={() => handleStatusChange(coin.id, "ACTIVE")}>Activate</button>
                          )}
                          {coin.status === "ACTIVE" && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(coin.id, "PAUSED")}>Pause</button>
                              <button className="btn btn-ghost btn-sm" style={{ color: "var(--error, #e55)" }} onClick={() => handleStatusChange(coin.id, "DELISTED")}>Delist</button>
                            </>
                          )}
                          {coin.status === "PAUSED" && (
                            <>
                              <button className="btn btn-money btn-sm" onClick={() => handleStatusChange(coin.id, "ACTIVE")}>Activate</button>
                              <button className="btn btn-ghost btn-sm" style={{ color: "var(--error, #e55)" }} onClick={() => handleStatusChange(coin.id, "DELISTED")}>Delist</button>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
          </div>

          {/* New coin form */}
          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 16 }}>Add new coin</div>
            <form onSubmit={handleCreateCoin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="label">Coin name</div>
                  <div className="field">
                    <input placeholder="e.g. Maize Coin" value={newCoin.name}
                      onChange={(e) => setNewCoin((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <div className="label">Symbol (4 chars)</div>
                  <div className="field">
                    <input placeholder="e.g. MAIZ" maxLength={4} value={newCoin.symbol}
                      onChange={(e) => setNewCoin((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} />
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="label">Backing crop</div>
                  {crops.length === 0 ? (
                    <div className="field" style={{ justifyContent: "space-between" }}>
                      <span className="faint" style={{ fontSize: 12.5 }}>No crops yet</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={openCreateCropModal}>+ New crop</button>
                    </div>
                  ) : (
                    <div className="field">
                      <select value={newCoin.backingCropId} onChange={(e) => setNewCoin((f) => ({ ...f, backingCropId: e.target.value }))}>
                        <option value="">Select crop…</option>
                        {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <div className="label">Base price (GHS)</div>
                  <div className="field">
                    <input type="number" step="0.01" placeholder="e.g. 10.00" value={newCoin.basePrice}
                      onChange={(e) => setNewCoin((f) => ({ ...f, basePrice: e.target.value }))} />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-money btn-block" disabled={creating}>
                {creating ? "Creating…" : "Create coin"}
              </button>
            </form>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ position: "sticky", top: 0 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 6 }}>Pricing weights</div>
            <p className="faint" style={{ fontSize: 12.5, margin: "0 0 20px", lineHeight: 1.6 }}>
              Adjust how much each factor contributes to the coin price. Used when creating a new coin and when recomputing.
            </p>

            {/* Momentum */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label">Crop momentum</span>
                <span className="mono semibold" style={{ color: "var(--primary)" }}>{weights.momentum}%</span>
              </div>
              <input type="range" min={0} max={100} value={weights.momentum}
                onChange={(e) => setWeights((w) => ({ ...w, momentum: parseInt(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Market demand */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label">Market demand</span>
                <span className="mono semibold" style={{ color: "var(--money)" }}>{weights.demand}%</span>
              </div>
              <input type="range" min={0} max={100} value={weights.demand}
                onChange={(e) => setWeights((w) => ({ ...w, demand: parseInt(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--money)" }}
              />
            </div>

            {/* Farm health */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label">Farm health</span>
                <span className="mono semibold" style={{ color: "var(--water)" }}>{weights.health}%</span>
              </div>
              <input type="range" min={0} max={100} value={weights.health}
                onChange={(e) => setWeights((w) => ({ ...w, health: parseInt(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--water)" }}
              />
            </div>

            {/* Live preview */}
            <div className="card" style={{ padding: 16, background: "var(--surface-2)", marginBottom: 18, border: "none" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Price preview</div>
              <div className="metric" style={{ fontSize: 28, color: "var(--money)" }}>{toGHS(previewPrice)}</div>
              <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>
                Base {toGHS(sampleBase)} + weighted adjustments
              </div>
            </div>

            <button className="btn btn-money btn-block" onClick={handleRecompute} disabled={recomputing || coinsLoading}>
              {recomputing ? `Recomputing…` : "Recompute all prices"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
