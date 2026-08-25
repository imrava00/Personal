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
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='9' fill='%23059669'/%3E%3Cpath d='M11 10h14v2.5H11z' fill='white' fill-opacity='.95'/%3E%3Cpath d='M11 16.5h9v2.5H11z' fill='white' fill-opacity='.95'/%3E%3Cpath d='M11 23h6v2.5H11z' fill='white' fill-opacity='.6'/%3E%3Ccircle cx='27' cy='25' r='4' fill='white' fill-opacity='.25'/%3E%3Cpath d='M25.5 25l1 1.5 2.5-3' stroke='white' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E",
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
