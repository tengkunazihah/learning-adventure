import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/hooks/useProgress";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Learning Adventure",
  description: "Fun learning for kids aged 4-5",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Learning Adventure",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FF6B35" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${nunito.variable} font-sans antialiased bg-background text-kid-body`}
      >
        <ProgressProvider>
          {children}
        </ProgressProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
