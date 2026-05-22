import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cohort Comms",
  description:
    "Simple communication tool for the Cursor Boston summer cohort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
