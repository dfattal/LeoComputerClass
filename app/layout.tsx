import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import HeaderAuth from "@/components/HeaderAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Classroom",
  description: "Interactive coding classes for curious kids",
  openGraph: {
    title: "Family Classroom",
    description: "Interactive coding classes for curious kids",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Classroom",
    description: "Interactive coding classes for curious kids",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 border-b border-indigo-900/30 shadow-sm" style={{ background: 'var(--header-bg)' }}>
          <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
              style={{ color: 'var(--header-fg)' }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/20 text-sm">
                FC
              </span>
              Family Classroom
            </Link>
            <Suspense fallback={null}>
              <HeaderAuth />
            </Suspense>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
