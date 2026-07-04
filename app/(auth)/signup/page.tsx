import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>
        Create your account
      </h1>
      <p className="muted" style={{ margin: "0 0 24px" }}>
        Choose how you&apos;ll invest on AgriMarket.
      </p>

      <SignupForm />

      <p className="muted" style={{ textAlign: "center", marginTop: 22, fontSize: 13.5 }}>
        Already have an account?{" "}
        <Link href="/login" className="link-btn">
          Sign in
        </Link>
      </p>
    </>
  );
}
