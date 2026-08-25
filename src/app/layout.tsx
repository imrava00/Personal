import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinPlan — Personal Finance Hub",
  description: "Track schedules, manage income & expenses, and plan your financial goals — all in one place.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='8' fill='%2310b981'/%3E%3Cpath d='M10 12h6v12h-6z' fill='white' opacity='.9'/%3E%3Cpath d='M20 8h6v16h-6z' fill='white' opacity='.9'/%3E%3Cpath d='M10 20h6v4h-6z' fill='white' opacity='.5'/%3E%3Cpath d='M20 16h6v8h-6z' fill='white' opacity='.5'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
