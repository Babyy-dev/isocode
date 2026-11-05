import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";
import { safeReturnTo } from "@/features/auth/access";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const query = await searchParams;
  return <AuthForm mode="sign-up" returnTo={safeReturnTo(query.returnTo)} />;
}
