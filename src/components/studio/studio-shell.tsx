"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { StudioSidebar } from "./studio-sidebar";
import { StudioTopBar } from "./studio-topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { CreatorAssistant } from "@/components/creator-assistant";

export function StudioShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isMarketingOrAuth =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth");

  if (isMarketingOrAuth) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] bg-[#121212] text-[#ededed] flex overflow-hidden">
      {/* Supabase-style Compact Hover-Expanding Sidebar */}
      <StudioSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace Frame with constant 56px (pl-14) offset on desktop to prevent layout shifts */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden md:pl-14 transition-[padding] duration-200">
        {/* Studio Top Navigation Bar */}
        <StudioTopBar onToggleMobile={() => setIsMobileOpen((prev) => !prev)} />

        {/* Scrollable Main Content Area with bottom padding for mobile bar */}
        <main className="flex-1 overflow-y-auto bg-[#121212] p-4 lg:p-6 pb-24 md:pb-6 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full space-y-6">{children}</div>
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Floating AI Director Copilot */}
      <CreatorAssistant />
    </div>
  );
}
