import type { Metadata } from "next";
import { Andada_Pro } from "next/font/google";
import "./globals.css";

const andada = Andada_Pro({
  variable: "--font-andada-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jemberry Studio",
  description: "Clay Trinkets and More!",
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
