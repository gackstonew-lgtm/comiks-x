"use client";

import { useState } from "react";
import { StudioSidebar } from "./studio-sidebar";
import { StudioTopBar } from "./studio-topbar";
import { CreatorAssistant } from "@/components/creator-assistant";

export function StudioShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121212] text-[#ededed] flex overflow-hidden">
      {/* Supabase-style Compact Hover-Expanding Sidebar */}
      <StudioSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace Frame with constant 56px (pl-14) offset on desktop to prevent layout shifts */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden md:pl-14 transition-[padding] duration-200">
        {/* Studio Top Navigation Bar */}
        <StudioTopBar onToggleMobile={() => setIsMobileOpen((prev) => !prev)} />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#121212] p-4 lg:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>

      {/* Floating AI Director Copilot */}
      <CreatorAssistant />
    </div>
  );
}
