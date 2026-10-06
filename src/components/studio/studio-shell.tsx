"use client";

import { useState, useEffect } from "react";
import { StudioSidebar } from "./studio-sidebar";
import { StudioTopBar } from "./studio-topbar";
import { CreatorAssistant } from "@/components/creator-assistant";

export function StudioShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("comiksx.sidebar.collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    } else if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("comiksx.sidebar.collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-studio-950 text-zinc-100 flex overflow-hidden">
      {/* Expandable/Collapsible Studio Sidebar */}
      <StudioSidebar isCollapsed={isCollapsed} onToggle={handleToggle} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Studio Top Navigation Bar */}
        <StudioTopBar />

        {/* Scrollable Main Studio Content */}
        <main className="flex-1 overflow-y-auto bg-studio-950 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>

      {/* Floating AI Director Copilot */}
      <CreatorAssistant />
    </div>
  );
}
