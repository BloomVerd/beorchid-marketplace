"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { AuthField } from "./auth-field";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginWithPassword } from "@/common/hooks/mutations/use-login-with-password";
import { useSendMagicLink } from "@/common/hooks/mutations/use-send-magic-link";

type LoginMode = "magic-link" | "password";

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const passwordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type MagicLinkValues = z.infer<typeof magicLinkSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function MagicLinkForm() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [sendMagicLink, { loading }] = useSendMagicLink();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: MagicLinkValues) => {
    try {
      await sendMagicLink({
        variables: {
          email: values.email,
          redirectBase: `${window.location.origin}/verify`,
        },
      });
      setSentEmail(values.email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again.";
      toast.error(msg);
    }
  };

  if (sent) {
    return (
      <div
        className="flex col gap-4"
        style={{ textAlign: "center", alignItems: "center" }}
      >
        <span
          className="iconbox iconbox-lg"
          style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
        >
          <Mail size={22} />
        </span>
        <div>
          <p style={{ fontWeight: 600, margin: "0 0 6px", color: "var(--ink)" }}>
            Check your email
          </p>
          <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>
            We&apos;ve sent a sign-in link to{" "}
            <strong style={{ color: "var(--ink)" }}>{sentEmail}</strong>. Click
            it to log in — the link expires in 15 minutes.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-block"
          style={{ marginTop: 4 }}
          onClick={() => {
            setSent(false);
            reset();
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex col gap-4" style={{ width: "100%" }}>
      <AuthField
        label="Email"
        icon={Mail}
        type="email"
        placeholder="ama@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg btn-block"
        style={{ marginTop: 4 }}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="spin" /> Sending…
          </>
        ) : (
          <>
            <span>Send Magic Link</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}

function PasswordForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [login, { loading }] = useLoginWithPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: PasswordValues) => {
    try {
      const { data } = await login({
        variables: { email: values.email, password: values.password },
      });
      if (!data) return;
      const { farmer, accessToken, refreshToken } = data.loginWithPassword;
      setAuth(farmer, accessToken, refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex col gap-4" style={{ width: "100%" }}>
      <AuthField
        label="Email"
        icon={Mail}
        type="email"
        placeholder="ama@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthField
        label="Password"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg btn-block"
        style={{ marginTop: 4 }}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="spin" /> Signing in…
          </>
        ) : (
          <>
            <span>Sign in</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<LoginMode>("magic-link");

  return (
    <div className="flex col gap-5">
      <div className="segmented" style={{ width: "100%" }}>
        <button
          type="button"
          className="seg-btn"
          data-active={mode === "magic-link" ? "true" : "false"}
          onClick={() => setMode("magic-link")}
          style={{ flex: 1, justifyContent: "center", outline: "none" }}
        >
          Magic Link
        </button>
        <button
          type="button"
          className="seg-btn"
          data-active={mode === "password" ? "true" : "false"}
          onClick={() => setMode("password")}
          style={{ flex: 1, justifyContent: "center", outline: "none" }}
        >
          Password
        </button>
      </div>

      {mode === "magic-link" ? <MagicLinkForm /> : <PasswordForm />}
    </div>
  );
}
