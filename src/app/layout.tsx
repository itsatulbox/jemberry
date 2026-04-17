import type { Metadata } from "next";
import { Andada_Pro } from "next/font/google";
import "./globals.css";

const andada = Andada_Pro({
  variable: "--font-andada-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
  ),
  title: "Jemberry Studio",
  description: "Clay Trinkets and More!",
  openGraph: {
    title: "Jemberry Studio",
    description: "Clay Trinkets and More!",
    siteName: "Jemberry Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jemberry Studio",
    description: "Clay Trinkets and More!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${andada.variable} antialiased`}>{children}</body>
    </html>
  );
}
