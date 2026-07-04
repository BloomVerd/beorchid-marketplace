"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useListingDetail } from "@/common/hooks/queries/use-listing-detail";
import { useListingOffers } from "@/common/hooks/queries/use-listing-offers";
import { useMakeOffer } from "@/common/hooks/mutations/use-make-offer";
import { useCounterOffer } from "@/common/hooks/mutations/use-counter-offer";
import { useAcceptOffer } from "@/common/hooks/mutations/use-accept-offer";
import { useRejectOffer } from "@/common/hooks/mutations/use-reject-offer";
import { useWithdrawOffer } from "@/common/hooks/mutations/use-withdraw-offer";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ErrorState } from "@/components/dashboard/error-state";
import { FarmPinMap } from "@/components/dashboard/farm-pin-map";
import { toGHS, toPesewas, formatRelative } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { ListingOffersQuery } from "@/common/graphql/generated/graphql";

type Offer = ListingOffersQuery["listingOffers"][number];

function buildOfferThreads(offers: Offer[]): Offer[][] {
  return offers
    .filter((o) => !o.parentOfferId)
    .map((root) => {
      const chain = [root];
      let current = root;
      for (;;) {
        const next = offers.find((o) => o.parentOfferId === current.id);
        if (!next) break;
        chain.push(next);
        current = next;
      }
      return chain;
    });
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const farmer = useAuthStore((s) => s.farmer);
  const [offerAmt, setOfferAmt] = useState("");
  const [offerMsg, setOfferMsg] = useState("");
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);

  const { data: listingData, loading, error, refetch } = useListingDetail(id);
  const { data: offersData, refetch: refetchOffers } = useListingOffers(id);
  const [makeOffer, { loading: offerLoading }] = useMakeOffer();
  const [counterOffer, { loading: counterLoading }] = useCounterOffer();
  const [acceptOffer] = useAcceptOffer();
  const [rejectOffer] = useRejectOffer();
  const [withdrawOffer] = useWithdrawOffer();

  if (loading) return <div className="card skel" style={{ minHeight: 400 }} />;
  if (error || !listingData?.listing)
    return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  const l = listingData.listing;
  const offers = offersData?.listingOffers ?? [];
  const isSeller = farmer?.id === l.sellerId;
  const offerThreads = buildOfferThreads(offers);
  const offerThread =
    offerThreads.find((t) => t[0].buyerId === farmer?.id) ?? [];
  const myOffer = offerThread[offerThread.length - 1];
  const hasOffer = offerThread.length > 0 && !isSeller;
  const noOffer = !hasOffer && !isSeller;
  const isMyTurn = !!myOffer && (myOffer.createdById ?? myOffer.buyerId) !== farmer?.id;

  const images = l.farmImages ?? [];
  const health = l.farmHealth;
  const overallScore = health?.overall_score ?? 0;

  const signals = health
    ? [
        {
          n: "Soil quality",
          v: Math.round(health.soil_health),
          pct: health.soil_health,
          color: "var(--gain)",
        },
        {
          n: "Crop health",
          v: Math.round(health.crop_health),
          pct: health.crop_health,
          color: "var(--water)",
        },
        {
          n: "Weather stress",
          v: Math.round(100 - health.weather_stress),
          pct: 100 - health.weather_stress,
          color: "var(--sun)",
        },
        {
          n: "Disease risk",
          v: Math.round(100 - health.disease_risk),
          pct: 100 - health.disease_risk,
          color: "var(--gain)",
        },
      ]
    : [];

  const submitOffer = async () => {
    if (!offerAmt) {
      toast.error("Enter an offer amount.");
      return;
    }
    try {
      if (counterOfferId) {
        await counterOffer({
          variables: {
            offerId: counterOfferId,
            amount: parseFloat(offerAmt),
            message: offerMsg || undefined,
          },
        });
        toast.success("Counter offer sent.");
      } else {
        await makeOffer({
          variables: {
            listingId: id,
            amount: parseFloat(offerAmt),
            message: offerMsg || undefined,
          },
        });
        toast.success("Offer submitted.");
      }
      setOfferAmt("");
      setOfferMsg("");
      setCounterOfferId(null);
      refetchOffers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  };

  const handleAccept = async (oid: string) => {
    try {
      await acceptOffer({ variables: { offerId: oid } });
      toast.success("Offer accepted.");
      refetchOffers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  };
  const handleWithdraw = async (oid: string) => {
    try {
      await withdrawOffer({ variables: { offerId: oid } });
      toast.success("Offer withdrawn.");
      refetchOffers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  };
  const handleReject = async (oid: string) => {
    try {
      await rejectOffer({ variables: { offerId: oid } });
      toast.success("Offer rejected.");
      refetchOffers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  };

  return (
    <div className="anim-up">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Link
          href="/marketplace"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0 }}
        >
          ← Marketplace
        </Link>
        <Link href="/my-offers" className="btn btn-outline btn-sm">
          My offers
        </Link>
      </div>

      <div className="detail-grid">
        {/* Left column */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <StatusBadge status={l.status} />
                {overallScore > 0 && (
                  <span
                    className={
                      overallScore >= 80
                        ? "badge badge-low"
                        : overallScore >= 60
                          ? "badge badge-mod"
                          : "badge badge-high"
                    }
                  >
                    {overallScore >= 80
                      ? "Healthy"
                      : overallScore >= 60
                        ? "Moderate"
                        : "Needs attention"}
                  </span>
                )}
              </div>
              <h1 className="h1" style={{ margin: 0 }}>
                {l.crop} Farm
              </h1>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                {l.crop} · {l.acreage} acres · {l.region.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Gallery */}
          <div
            style={{
              borderRadius: "var(--r-card)",
              overflow: "hidden",
              border: "1px solid var(--line)",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 280,
                position: "relative",
                background:
                  "linear-gradient(135deg, oklch(0.70 0.10 155), oklch(0.55 0.12 160))",
              }}
            >
              {images[0]?.url ? (
                <img
                  src={images[0].url}
                  alt={l.crop}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  className="badge card-glass"
                  style={{ position: "absolute", top: 12, left: 12 }}
                >
                  ◎ Drone capture · Jun 2026
                </span>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 0,
              }}
            >
              {[0, 1, 2].map((i) => {
                const img = images[i + 1];
                return (
                  <div
                    key={i}
                    style={{
                      height: 88,
                      borderTop: "1px solid var(--surface)",
                      background: img?.url
                        ? undefined
                        : "linear-gradient(135deg, oklch(0.72 0.12 163), oklch(0.60 0.14 168))",
                      overflow: "hidden",
                    }}
                  >
                    {img?.url && (
                      <img
                        src={img.url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* About */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div className="h3" style={{ marginBottom: 8 }}>
              About this farm
            </div>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
              {l.description ||
                `A productive ${l.crop.toLowerCase()} farm spanning ${l.acreage} acres in ${l.region.replace(/_/g, " ")}. Fully documented soil and water reports available. Verified by Bloomverd field agents.`}
            </p>
          </div>

          {/* Health + Location */}
          <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Farm health · from Bloomverd
              </div>
              {health ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <span className="metric" style={{ fontSize: 30 }}>
                      {Math.round(overallScore)}
                    </span>
                    <span className="faint">/ 100</span>
                  </div>
                  {signals.map((sg) => (
                    <div key={sg.n} style={{ marginBottom: 11 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12.5,
                          marginBottom: 5,
                        }}
                      >
                        <span className="muted">{sg.n}</span>
                        <span className="mono semibold">{sg.v}/100</span>
                      </div>
                      <div className="track">
                        <div
                          className="track-fill"
                          style={{ width: `${sg.pct}%`, background: sg.color }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="faint" style={{ margin: 0, fontSize: 13 }}>
                  No health data recorded yet.
                </p>
              )}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Location
              </div>
              {l.lat != null && l.lon != null ? (
                <>
                  <div
                    style={{
                      height: 200,
                      borderRadius: "var(--r-sm)",
                      overflow: "hidden",
                    }}
                  >
                    <FarmPinMap
                      lat={l.lat}
                      lon={l.lon}
                      label={`${l.crop} Farm · ${l.region.replace(/_/g, " ")}`}
                    />
                  </div>
                  <div
                    className="faint mono"
                    style={{ fontSize: 11, marginTop: 10 }}
                  >
                    {l.lat.toFixed(4)}° N, {Math.abs(l.lon).toFixed(4)}° W ·{" "}
                    {l.region.replace(/_/g, " ")}
                  </div>
                </>
              ) : (
                <p className="faint" style={{ margin: 0, fontSize: 13 }}>
                  Location not recorded.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right rail — sticky */}
        <div style={{ position: "sticky", top: 0 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="faint" style={{ fontSize: 11 }}>
              Asking price
            </div>
            <div
              className="metric"
              style={{ fontSize: 30, margin: "6px 0 18px" }}
            >
              {toGHS(l.askingPrice)}
            </div>

            {/* Negotiation thread (seller view or buyer with existing offer) */}
            {isSeller && offerThreads.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <span className="h3">Offers received</span>
                  <span className="badge">{offerThreads.length}</span>
                </div>
                {offerThreads.map((thread) => {
                  const head = thread[thread.length - 1];
                  const buyerId = thread[0].buyerId;
                  const canRespond =
                    head.buyerId === buyerId && head.status === "PENDING";
                  return (
                    <div
                      key={thread[0].id}
                      style={{
                        padding: "12px 0",
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span className="faint" style={{ fontSize: 11 }}>
                          Buyer #{buyerId.slice(0, 8)}
                        </span>
                        <StatusBadge status={head.status} />
                      </div>
                      {[...thread].reverse().map((o) => (
                        <div key={o.id} style={{ padding: "6px 0" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              className="semibold"
                              style={{ fontSize: 13 }}
                            >
                              {o.buyerId === buyerId
                                ? "Buyer offer"
                                : "Your counter"}
                            </span>
                            <span
                              className="mono semibold"
                              style={{ fontSize: 13 }}
                            >
                              {toGHS(o.amount)}
                            </span>
                          </div>
                          <div className="faint" style={{ fontSize: 11.5 }}>
                            {formatRelative(o.createdAt)}
                          </div>
                          {o.message && (
                            <div
                              className="muted"
                              style={{
                                fontSize: 12.5,
                                marginTop: 6,
                                background: "var(--surface-2)",
                                padding: "8px 10px",
                                borderRadius: "var(--r-sm)",
                              }}
                            >
                              {o.message}
                            </div>
                          )}
                        </div>
                      ))}
                      {canRespond && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 8,
                          }}
                        >
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(head.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setCounterOfferId(head.id);
                            }}
                          >
                            Counter
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleReject(head.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Buyer with existing offer: negotiation thread */}
            {hasOffer && myOffer && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <span className="h3">Your negotiation</span>
                  <StatusBadge status={myOffer.status} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    marginBottom: 18,
                  }}
                >
                  {[...offerThread].reverse().map((t) => {
                    const isMine = (t.createdById ?? t.buyerId) === farmer?.id;
                    return (
                      <div
                        key={t.id}
                        style={{
                          display: "flex",
                          gap: 11,
                          paddingBottom: 16,
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <span
                            className="iconbox iconbox-sm"
                            style={{
                              background: "var(--surface-2)",
                              color: "var(--ink-2)",
                              fontSize: 10,
                              fontWeight: 700,
                              width: "auto",
                              padding: "0 6px",
                            }}
                          >
                            {isMine ? "You" : "Farmer"}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              className="semibold"
                              style={{ fontSize: 13, color: "var(--ink)" }}
                            >
                              {isMine ? "Your offer" : "Farmer's counter"}
                            </span>
                            <span
                              className="mono semibold"
                              style={{ fontSize: 13 }}
                            >
                              {toGHS(t.amount)}
                            </span>
                          </div>
                          <div
                            className="faint"
                            style={{ fontSize: 11.5, marginTop: 2 }}
                          >
                            {formatRelative(t.createdAt)}
                          </div>
                          {t.message && (
                            <div
                              className="muted"
                              style={{
                                fontSize: 12.5,
                                marginTop: 6,
                                background: "var(--surface-2)",
                                padding: "8px 10px",
                                borderRadius: "var(--r-sm)",
                              }}
                            >
                              {t.message}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isMyTurn ? (
                  <>
                    <div className="label">Counter amount (GHS)</div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <span className="mono faint">GHS</span>
                      <input
                        value={offerAmt}
                        onChange={(e) => setOfferAmt(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="label">Message (optional)</div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <textarea
                        value={offerMsg}
                        onChange={(e) => setOfferMsg(e.target.value)}
                        placeholder="Add a message to the farmer..."
                        rows={2}
                        style={{ width: "100%", resize: "vertical" }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 9,
                      }}
                    >
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => handleAccept(myOffer.id)}
                      >
                        Accept farmer&apos;s counter
                      </button>
                      <button
                        className="btn btn-outline btn-block"
                        onClick={() => {
                          setCounterOfferId(myOffer.id);
                          submitOffer();
                        }}
                      >
                        Send counter
                      </button>
                      <button
                        className="btn btn-ghost btn-block"
                        onClick={() => handleWithdraw(myOffer.id)}
                      >
                        Withdraw offer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className="faint"
                      style={{ fontSize: 12.5, margin: "0 0 12px" }}
                    >
                      Waiting for the farmer to respond.
                    </p>
                    <button
                      className="btn btn-ghost btn-block"
                      onClick={() => handleWithdraw(myOffer.id)}
                    >
                      Withdraw offer
                    </button>
                  </>
                )}
                <p
                  className="faint"
                  style={{ fontSize: 11, margin: "14px 0 0", lineHeight: 1.5 }}
                >
                  The farmer accepts or rejects from the Bloomverd app — the
                  result appears here.
                </p>
              </>
            )}

            {/* No offer yet */}
            {noOffer && (
              <>
                <div className="h3" style={{ marginBottom: 14 }}>
                  Make an offer
                </div>
                <div className="label">Your offer (GHS)</div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <span className="mono faint">GHS</span>
                  <input
                    value={offerAmt}
                    onChange={(e) => setOfferAmt(e.target.value)}
                    placeholder={String(
                      Math.round((l.askingPrice / 100) * 0.9),
                    )}
                  />
                </div>
                <div className="label">Message to farmer (optional)</div>
                <div
                  className="field"
                  style={{
                    height: "auto",
                    padding: "12px 14px",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <input
                    placeholder="Ready to move quickly on payment…"
                    style={{
                      height: 40,
                      border: "none",
                      outline: "none",
                      background: "none",
                      flex: 1,
                      fontFamily: "inherit",
                      fontSize: 14,
                      color: "var(--ink)",
                    }}
                    value={offerMsg}
                    onChange={(e) => setOfferMsg(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={offerLoading || counterLoading}
                  onClick={submitOffer}
                >
                  {offerLoading || counterLoading
                    ? "Submitting…"
                    : "Submit offer"}
                </button>
                <p
                  className="faint"
                  style={{ fontSize: 11, margin: "14px 0 0", lineHeight: 1.5 }}
                >
                  Offers are non-binding until accepted. Funds move to escrow
                  only after the farmer accepts.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
