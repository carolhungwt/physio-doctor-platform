import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physio-Doctor Platform",
  description: "Hong Kong physio-doctor referral and booking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
