"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Building2, Mail, Lock } from "lucide-react";
import { AuthField } from "./auth-field";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email:    z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;
type Role = "individual" | "company";

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("individual");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = (values: FormValues) => {
    const [firstName, ...rest] = values.fullName.trim().split(" ");
    const lastName = rest.join(" ") || firstName;
    const params = new URLSearchParams({ role, firstName, lastName, email: values.email, password: values.password });
    router.push(`/onboard?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex col gap-4">
      {/* Role picker */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
        <button
          type="button"
          className="card"
          data-active={role === "individual"}
          onClick={() => setRole("individual")}
          style={{ padding: 16, textAlign: "left", borderWidth: 1.5 }}
        >
          <span className="iconbox iconbox-md" style={{ background: "var(--primary-soft)", color: "var(--primary-strong)", marginBottom: 10, display: "inline-flex" }}>
            <User size={18} />
          </span>
          <div style={{ fontWeight: 600, color: "var(--ink)" }}>Individual</div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>Retail investor</div>
        </button>

        <button
          type="button"
          className="card"
          data-active={role === "company"}
          onClick={() => setRole("company")}
          style={{ padding: 16, textAlign: "left", borderWidth: 1.5 }}
        >
          <span className="iconbox iconbox-md" style={{ background: "var(--money-soft)", color: "var(--money)", marginBottom: 10, display: "inline-flex" }}>
            <Building2 size={18} />
          </span>
          <div style={{ fontWeight: 600, color: "var(--ink)" }}>Company</div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>Org with members</div>
        </button>
      </div>

      <AuthField
        label="Full name"
        icon={User}
        placeholder="Ama Mensah"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
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
        placeholder="Min. 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />

      <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 4 }}>
        Continue
      </button>
    </form>
  );
}
