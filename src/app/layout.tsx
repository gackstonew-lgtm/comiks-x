import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StudioShell } from "@/components/studio/studio-shell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PwaProvider } from "@/components/pwa/pwa-context";
import { InstallBanner } from "@/components/pwa/install-banner";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { UpdateToast } from "@/components/pwa/update-toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://comiks-x.vercel.app"),
  title: "Comiks X | Professional AI Comic Animation Studio",
  description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
  manifest: "/manifest.webmanifest",
  applicationName: "Comiks X",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comiks X",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/shortcut-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Comiks X",
  },
  openGraph: {
    title: "Comiks X | Professional AI Comic Animation Studio",
    description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
    type: "website",
    url: "https://comiks-x.vercel.app",
    images: [
      {
        url: "/screenshots/screenshot-wide.png",
        width: 1280,
        height: 720,
        alt: "Comiks X Studio Desktop",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-studio-100 min-h-screen font-sans antialiased selection:bg-brand selection:text-black">
        <PwaProvider>
          <AuthProvider>
            <StudioShell>{children}</StudioShell>
          </AuthProvider>
          <OfflineBanner />
          <InstallBanner />
          <UpdateToast />
        </PwaProvider>
      </body>
    </html>
  );
}
