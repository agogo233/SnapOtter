import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | SnapOtter",
  description:
    "Book a demo, get deployment help, or discuss enterprise licensing for SnapOtter self-hosted image processing.",
  alternates: { canonical: "https://snapotter.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
