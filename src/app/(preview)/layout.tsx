import type { Metadata } from "next";
import { PreviewShell } from "@/features/demo/preview-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PreviewShell>{children}</PreviewShell>;
}
