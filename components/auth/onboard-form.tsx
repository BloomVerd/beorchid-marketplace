"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Building2, ArrowRight } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { AuthField } from "./auth-field";
import { useAuthStore } from "@/stores/auth-store";
import type { Farmer } from "@/stores/auth-store";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      farmer {
        id email firstName lastName roles isFieldAgent
      }
    }
  }
`;

const CROPS = ["Maize", "Rice", "Cocoa", "Soybean", "Sorghum", "Cassava"] as const;

interface OnboardFormProps {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function OnboardForm({ role, firstName, lastName, email, password }: OnboardFormProps) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [orgName, setOrgName] = useState("");
  const [interests, setInterests] = useState<string[]>(["Maize", "Cocoa"]);
  const [register, { loading }] = useMutation<{
    register: { accessToken: string; refreshToken: string; farmer: Farmer };
  }>(REGISTER);

  const toggleCrop = (crop: string) => {
    setInterests((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      toast.error("Please select at least one crop.");
      return;
    }
    try {
      const { data } = await register({
        variables: {
          input: {
            firstName,
            lastName,
            email,
            password,
            role,
            ...(role === "company" && orgName ? { organizationName: orgName } : {}),
            interests,
          },
        },
      });
      if (!data) return;
      const { farmer, accessToken, refreshToken } = data.register;
      setAuth(farmer, accessToken, refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex col gap-4">
      {role === "company" && (
        <AuthField
          label="Organisation name"
          icon={Building2}
          placeholder="Kandev Capital"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
      )}

      <div>
        <div className="label" style={{ marginBottom: 10 }}>
          Crops to watch
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              className="chip"
              data-active={interests.includes(crop)}
              onClick={() => toggleCrop(crop)}
            >
              {crop}
            </button>
          ))}
        </div>
        {interests.length === 0 && (
          <p className="text-xs" style={{ color: "var(--crit)", marginTop: 8 }}>
            Select at least one crop
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || interests.length === 0}
        className="btn btn-primary btn-lg btn-block"
        style={{ marginTop: 8 }}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="spin" /> Setting up your account…
          </>
        ) : (
          <>
            <span>Enter AgriMarket</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
