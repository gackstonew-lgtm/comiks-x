import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StudioShell } from "@/components/studio/studio-shell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { InstallBanner } from "@/components/InstallBanner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Comiks X | Professional AI Comic Animation Studio",
  description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comiks X",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Comiks X | Professional AI Comic Animation Studio",
    description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
    type: "website",
    url: "https://comiks-x.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#34d399",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-studio-100 min-h-screen font-sans antialiased selection:bg-brand selection:text-black">
        <AuthProvider>
          <StudioShell>{children}</StudioShell>
        </AuthProvider>
        <InstallBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
