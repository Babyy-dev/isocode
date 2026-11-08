import type { Metadata } from "next";
import { requestLanguage } from "@/lib/i18n/request-language";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Company A | Find your next Brand X car in Lucknow",
    template: "%s | Company A",
  },
  description:
    "New and certified used Brand X cars in Lucknow with on-road prices by city, EMI estimates and online test-drive booking.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const language = await requestLanguage();
  return (
    <html lang={language}>
      <body>{children}</body>
    </html>
  );
}
