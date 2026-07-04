import { OnboardForm } from "@/components/auth/onboard-form";

interface PageProps {
  searchParams: Promise<{
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>;
}

export default async function OnboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const role = params.role ?? "individual";
  const firstName = params.firstName ?? "";
  const lastName = params.lastName ?? "";
  const email = params.email ?? "";
  const password = params.password ?? "";

  return (
    <>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        Step 2 of 2
      </div>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>
        Set up your profile
      </h1>
      <p className="muted" style={{ margin: "0 0 24px" }}>
        Pick crops to watch — we&apos;ll seed your watchlist and dashboard.
      </p>

      <OnboardForm
        role={role}
        firstName={firstName}
        lastName={lastName}
        email={email}
        password={password}
      />
    </>
  );
}
