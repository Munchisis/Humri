import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HUMRI —  Access To Justice",
  description:
    "Connect with qualified volunteer lawyers. Free, confidential legal help for everyone regardless of means.",
  other: {
    ...Sentry.getTraceData(),
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
