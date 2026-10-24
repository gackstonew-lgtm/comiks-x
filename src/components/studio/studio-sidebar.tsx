"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  Scissors,
  BrainCircuit,
  Film,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from "lucide-react";
import { usePwa } from "@/components/pwa/pwa-context";

interface StudioSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudioSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: StudioSidebarProps) {
  const pathname = usePathname();
  const { canInstall, promptInstall } = usePwa();

  // Persistent collapsed state (default: expanded on desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Exact 5 primary modules in requested product scope
  const navigationModules = [
    { name: "Video Generator", href: "/video-generator", icon: Clapperboard },
    { name: "Video Editor", href: "/editor", icon: Scissors },
    { name: "AI Training", href: "/training", icon: BrainCircuit },
    { name: "Projects & Library", href: "/projects", icon: Film },
    { name: "Credits & Usage", href: "/billing", icon: Wallet },
  ];

  // Load persistent collapse preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cx_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("cx_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  // Hover-intent delay (~100ms) for peek expansion when collapsed
  const handleMouseEnter = () => {
    if (!isCollapsed) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  const isExpanded = !isCollapsed || isHovered;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#171717] border-r border-[#2e2e2e] transition-[width,transform] duration-200 ease-in-out select-none ${
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0"
        } ${isExpanded ? "md:w-60 shadow-xl" : "md:w-14"}`}
        aria-label="Studio Navigation"
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center px-3 border-b border-[#2e2e2e] overflow-hidden whitespace-nowrap">
          <Link
            href="/projects"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 flex-1 min-w-0 group"
          >
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-[#09090b] font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              CX
            </div>
            <div
              className={`transition-all duration-150 flex flex-col ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                Comiks X
              </div>
              <div className="text-[10px] text-[#707070] leading-tight">
                AI Video Studio
              </div>
            </div>
          </Link>

          {/* Desktop Chevron Toggle Button */}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md text-[#707070] hover:text-[#ededed] hover:bg-[#232323] transition-colors shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#232323] transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Navigation Modules */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 hide-scrollbar">
          {navigationModules.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                aria-label={item.name}
                aria-current={active ? "page" : undefined}
                title={!isExpanded && !isMobileOpen ? item.name : undefined}
                className={`relative flex items-center h-9 px-2 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden group focus-visible:outline-brand focus-visible:outline-2 ${
                  active
                    ? "bg-[#232323] text-white font-semibold shadow-xs"
                    : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#202020]"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brand rounded-r-full"
                    aria-hidden="true"
                  />
                )}

                {/* Fixed Icon Container */}
                <span className="flex items-center justify-center w-6 h-6 shrink-0">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? "text-brand"
                        : "text-[#a0a0a0] group-hover:text-[#ededed]"
                    }`}
                  />
                </span>

                {/* Animated Label */}
                <span
                  className={`ml-2 text-xs transition-all duration-150 ${
                    isExpanded || isMobileOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 pointer-events-none w-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Settings & Pinned Bottom Status */}
        <div className="p-2 border-t border-[#2e2e2e] space-y-1 overflow-hidden whitespace-nowrap">
          {canInstall && (
            <button
              onClick={() => {
                promptInstall();
                onCloseMobile?.();
              }}
              className="w-full flex items-center h-8.5 px-2 rounded-md text-xs font-semibold text-brand hover:text-brand-hover hover:bg-brand/10 transition-colors group"
              title="Install Studio App"
            >
              <span className="flex items-center justify-center w-6 h-6 shrink-0">
                <Download className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </span>
              <span
                className={`ml-2 text-xs transition-all duration-150 ${
                  isExpanded || isMobileOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none w-0"
                }`}
              >
                Install App
              </span>
            </button>
          )}

          <Link
            href="/settings"
            onClick={onCloseMobile}
            className={`flex items-center h-8.5 px-2 rounded-md text-xs font-medium text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#202020] transition-colors ${
              pathname.startsWith("/settings") ? "bg-[#232323] text-white" : ""
            }`}
            title="Settings"
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0">
              <Settings className="w-4 h-4" />
            </span>
            <span
              className={`ml-2 text-xs transition-all duration-150 ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              Settings
            </span>
          </Link>

          <Link
            href="/billing"
            className="flex items-center h-9 px-2 rounded-md bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] transition-colors group"
            title="Billing & Credit Balance"
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            </span>
            <div
              className={`ml-2 flex-1 min-w-0 transition-all duration-150 flex items-center justify-between ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              <span className="text-[11px] font-medium text-[#ededed] truncate">
                Credits Balance
              </span>
              <span className="text-[10px] text-brand font-mono font-bold px-1.5 py-0.5 rounded bg-brand/10 border border-brand/20">
                250 CR
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
