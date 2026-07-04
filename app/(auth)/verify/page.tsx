"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import { useVerifyMagicLink } from "@/common/hooks/mutations/use-verify-magic-link";
import { useAuthStore } from "@/stores/auth-store";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const [verifyMagicLink] = useVerifyMagicLink();

  useEffect(() => {
    if (!token) {
      setError("Invalid link — no token found.");
      return;
    }

    verifyMagicLink({ variables: { token } })
      .then(({ data }) => {
        if (!data) return;
        const { farmer, accessToken, refreshToken } = data.verifyMagicLink;
        setAuth(farmer, accessToken, refreshToken);
        router.replace("/dashboard");
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "This link is invalid or has expired.";
        setError(msg);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (error) {
    return (
      <div className="flex col gap-4" style={{ textAlign: "center", alignItems: "center" }}>
        <XCircle size={48} style={{ color: "var(--loss)" }} />
        <div>
          <p style={{ fontWeight: 600, margin: "0 0 6px" }}>Sign-in failed</p>
          <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>
            {error}
          </p>
        </div>
        <Link href="/login" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex col gap-3" style={{ textAlign: "center", alignItems: "center" }}>
      <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
      <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>
        Signing you in…
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex col gap-3" style={{ textAlign: "center", alignItems: "center" }}>
          <Loader2 size={32} className="spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
