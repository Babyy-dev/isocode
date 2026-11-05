import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";
import { safeReturnTo } from "@/features/auth/access";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const query = await searchParams;
  return <AuthForm mode="sign-in" returnTo={safeReturnTo(query.returnTo)} />;
}
