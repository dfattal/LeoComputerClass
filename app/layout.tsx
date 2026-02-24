import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";
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
  title: "Build a Computer From Physics",
  description: "A hands-on course building a computer from first principles",
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
              href="/course/week-01"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
              style={{ color: 'var(--header-fg)' }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/20 text-sm">
                01
              </span>
              Build a Computer From Physics
            </Link>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <UserBadge />
              </Suspense>
              <div className="h-5 w-px bg-indigo-700/50" />
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm text-indigo-200/70 transition-colors hover:bg-indigo-800/40 hover:text-indigo-100"
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 text-sm text-indigo-200/70 transition-colors hover:bg-indigo-800/40 hover:text-indigo-100"
              >
                Admin
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
