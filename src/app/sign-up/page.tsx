import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";
import { safeReturnTo } from "@/features/auth/access";
import { requestLanguage } from "@/lib/i18n/request-language";

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
  const language = await requestLanguage();
  return (
    <AuthForm
      mode="sign-up"
      returnTo={safeReturnTo(query.returnTo)}
      language={language}
    />
  );
}
