import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Company A | Find your next Brand X car in Lucknow",
    template: "%s | Company A",
  },
  description:
    "Explore new and pre-owned Brand X cars in Lucknow. Compare the supplied sample stock, prices and vehicle details.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
