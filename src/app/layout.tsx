import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://devs-vltra.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "DEVS VLTRA",
    template: "%s | DEVS VLTRA",
  },
  description: "더 너머의 개발자 — Beyond the Limit. 개발 관련 정리 블로그 by gksfla8947",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "DEVS VLTRA",
    description: "더 너머의 개발자 — Beyond the Limit. 개발 관련 정리 블로그 by gksfla8947",
    url: BASE_URL,
    siteName: "DEVS VLTRA",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEVS VLTRA",
    description: "더 너머의 개발자 — Beyond the Limit. 개발 관련 정리 블로그 by gksfla8947",
  },
  verification: {
    google: "obgsY-znaB3CCPlpQiJRyuwGe0U8eYTPm8lCa72gTKI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
