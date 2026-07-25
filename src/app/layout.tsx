import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Journal — Discipline over Prediction",
  description:
    "A discipline-focused trading journal. Document each trade rigorously and visualize objective statistics to identify weaknesses.",
  keywords: [
    "trading journal",
    "trade log",
    "backtesting",
    "psychology",
    "discipline",
    "risk management",
  ],
  authors: [{ name: "Trading Journal" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.185 0 0)",
              color: "oklch(0.985 0 0)",
              border: "1px solid oklch(1 0 0 / 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
