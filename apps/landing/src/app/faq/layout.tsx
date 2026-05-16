import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | SnapOtter",
  description:
    "Frequently asked questions about SnapOtter. Privacy, pricing, AI features, file limits, updates, and enterprise licensing.",
  alternates: { canonical: "https://snapotter.com/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
