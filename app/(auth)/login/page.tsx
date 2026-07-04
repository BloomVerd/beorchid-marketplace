import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>
        Welcome back
      </h1>
      <p className="muted" style={{ margin: "0 0 28px" }}>
        Sign in to your AgriMarket account.
      </p>

      <LoginForm />

      <p className="muted" style={{ textAlign: "center", marginTop: 22, fontSize: 13.5 }}>
        New to AgriMarket?{" "}
        <Link href="/signup" className="link-btn">
          Create an account
        </Link>
      </p>
    </>
  );
}
