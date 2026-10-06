import type { Metadata } from "next";
import "./globals.css";
import { StudioShell } from "@/components/studio/studio-shell";

export const metadata: Metadata = {
  title: "Comiks X | Professional AI Comic Animation Studio",
  description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-zinc-100 min-h-screen font-sans antialiased selection:bg-studioOrange selection:text-white">
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
