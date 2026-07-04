"use client";

import { useState } from "react";
import { useInitiateDeposit } from "@/common/hooks/mutations/use-initiate-deposit";
import { MyWalletDocument } from "@/common/graphql/generated/graphql";
import { toPesewas } from "@/lib/format";
import { showToast } from "@/lib/toast";

const PROVIDERS = ["MTN MoMo", "Vodafone Cash", "AirtelTigo"] as const;

interface DepositWithdrawModalProps {
  mode: "deposit" | "withdraw";
  onClose: () => void;
}

export function DepositWithdrawModal({ mode, onClose }: DepositWithdrawModalProps) {
  const [tab, setTab] = useState<"momo" | "card">("momo");
  const [provider, setProvider] = useState<string>("MTN MoMo");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [initiateDeposit, { loading }] = useInitiateDeposit();

  const title = mode === "deposit" ? "Deposit funds" : "Withdraw funds";

  const handleSubmit = async () => {
    if (mode === "withdraw") {
      showToast.warn("Withdraw coming soon.");
      onClose();
      return;
    }

    const ghs = parseFloat(amount);
    if (!ghs || ghs < 1) {
      showToast.error("Enter a valid amount (min GHS 1).");
      return;
    }

    try {
      const { data } = await initiateDeposit({
        variables: { input: { amountPesewas: toPesewas(ghs), idempotencyKey: crypto.randomUUID() } },
        refetchQueries: [MyWalletDocument],
      });
      const url = data?.initiateDeposit?.checkoutUrl;
      if (url) window.open(url, "_blank");
      showToast.money("Deposit initiated — complete payment in the new tab.");
      onClose();
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Deposit failed.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h2">{title}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="segmented" style={{ width: "100%" }}>
            <button
              className="seg-btn"
              data-active={tab === "momo"}
              onClick={() => setTab("momo")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Mobile Money
            </button>
            <button
              className="seg-btn"
              data-active={tab === "card"}
              onClick={() => setTab("card")}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Card
            </button>
          </div>

          {tab === "momo" && (
            <>
              <div>
                <div className="label">Provider</div>
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 8 }}>
                  {PROVIDERS.map((p) => (
                    <button
                      key={p}
                      className="chip"
                      data-active={provider === p}
                      onClick={() => setProvider(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="label">Mobile number</div>
                <div className="field">
                  <input
                    type="tel"
                    placeholder="024 555 0192"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </>
          )}

          {tab === "card" && (
            <div>
              <div className="label">Card number</div>
              <div className="field">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <div className="label">Amount (GHS)</div>
            <div className="field">
              <span className="mono faint">GHS</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              />
            </div>
          </div>

          {mode === "deposit" && (
            <p className="faint" style={{ fontSize: 12 }}>
              You&apos;ll be redirected to Paystack to complete the deposit.
            </p>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-money btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing…" : title}
          </button>
        </div>
      </div>
    </div>
  );
}
