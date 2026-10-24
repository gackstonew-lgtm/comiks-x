"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  BookOpen,
  User,
  Sparkles,
  Layers,
  Video,
  Settings,
  Activity,
  PlaySquare,
  Home,
  X,
} from "lucide-react";

interface StudioSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudioSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: StudioSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mainNav = [
    { name: "Home", href: "/", icon: Home },
    { name: "Series Hub", href: "/series", icon: BookOpen },
    { name: "Character Lab", href: "/characters", icon: User },
    { name: "Story Studio", href: "/story-creator", icon: Sparkles },
    { name: "Storyboard", href: "/storyboard/ep-01-the-pitch", icon: Layers },
    { name: "AI Queue", href: "/queue", icon: Activity },
  ];

  const productionNav = [
    { name: "Timeline Editor", href: "/editor/ep-01-the-pitch", icon: PlaySquare },
    { name: "Social Studio (9:16)", href: "/clips/ep-01-the-pitch", icon: Video },
  ];

  const configNav = [
    { name: "AI Providers & Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    const baseHref = href.split("/")[1];
    return pathname.startsWith(`/${baseHref}`);
  };

  // Hover-intent delay (~120ms) to prevent accidental flicker
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  // Clean up timer on unmount & support preview parameter
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("expanded=1")) {
      setIsHovered(true);
    }
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Desktop sidebar is expanded if hovered or focused via keyboard
  const isExpanded = isHovered || isFocused;

  return (
    <>
      {/* Mobile Dimmed Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop fixed overlay + Mobile off-canvas drawer) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Collapse only when focus leaves the entire sidebar container
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        aria-label="Studio Navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#1c1c1c] border-r border-[#2e2e2e] select-none transition-[width,transform] duration-200 ease-supabase motion-reduce:transition-none ${
          // Desktop: collapsed 56px (w-14) -> expanded 240px (w-60)
          isExpanded
            ? "md:w-60 shadow-[0_0_0_1px_#2e2e2e,0_12px_32px_0_rgba(0,0,0,0.6)]"
            : "md:w-14"
        } ${
          // Mobile: drawer full height 240px width, slides from left
          isMobileOpen
            ? "translate-x-0 w-60"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-14 border-b border-[#2e2e2e] flex items-center px-2.5 overflow-hidden whitespace-nowrap">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 w-full p-1.5 rounded-[6px] hover:bg-[#232323] transition-colors focus-visible:outline-brand focus-visible:outline-2"
          >
            {/* Supabase-style Brand Mark: Deep emerald background with green monogram */}
            <div className="w-7 h-7 rounded-[6px] bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs shrink-0 shadow-sm">
              CX
            </div>
            <div
              className={`flex-1 min-w-0 transition-all duration-150 ease-supabase ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              <div className="text-xs font-semibold text-[#ededed] truncate leading-tight">
                Comiks X
              </div>
              <div className="text-[10px] text-[#707070] truncate leading-tight">
                Studio Workspace
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-[#232323] transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-5 hide-scrollbar">
          {/* Group 1: Create & Direct */}
          <div>
            <div
              className={`px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#707070] transition-opacity duration-150 whitespace-nowrap overflow-hidden ${
                isExpanded || isMobileOpen ? "opacity-100" : "opacity-0 h-0 pb-0"
              }`}
            >
              Create & Direct
            </div>
            <nav className="space-y-0.5">
              {mainNav.map((item) => {
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
                    className={`relative flex items-center h-9 px-2 rounded-[6px] text-xs font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden group focus-visible:outline-brand focus-visible:outline-2 ${
                      active
                        ? "bg-[#232323] text-[#ededed] font-semibold shadow-sm"
                        : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#232323]"
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-brand rounded-r-full"
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
                      className={`ml-2 text-xs transition-all duration-150 ease-supabase ${
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
          </div>

          {/* Group 2: Production */}
          <div>
            <div
              className={`px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#707070] transition-opacity duration-150 whitespace-nowrap overflow-hidden ${
                isExpanded || isMobileOpen ? "opacity-100" : "opacity-0 h-0 pb-0"
              }`}
            >
              Post & Publish
            </div>
            <nav className="space-y-0.5">
              {productionNav.map((item) => {
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
                    className={`relative flex items-center h-9 px-2 rounded-[6px] text-xs font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden group focus-visible:outline-brand focus-visible:outline-2 ${
                      active
                        ? "bg-[#232323] text-[#ededed] font-semibold shadow-sm"
                        : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#232323]"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-brand rounded-r-full"
                        aria-hidden="true"
                      />
                    )}

                    <span className="flex items-center justify-center w-6 h-6 shrink-0">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          active
                            ? "text-brand"
                            : "text-[#a0a0a0] group-hover:text-[#ededed]"
                        }`}
                      />
                    </span>

                    <span
                      className={`ml-2 text-xs transition-all duration-150 ease-supabase ${
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
          </div>

          {/* Group 3: System / Config */}
          <div>
            <div
              className={`px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#707070] transition-opacity duration-150 whitespace-nowrap overflow-hidden ${
                isExpanded || isMobileOpen ? "opacity-100" : "opacity-0 h-0 pb-0"
              }`}
            >
              Configuration
            </div>
            <nav className="space-y-0.5">
              {configNav.map((item) => {
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
                    className={`relative flex items-center h-9 px-2 rounded-[6px] text-xs font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden group focus-visible:outline-brand focus-visible:outline-2 ${
                      active
                        ? "bg-[#232323] text-[#ededed] font-semibold shadow-sm"
                        : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#232323]"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] bg-brand rounded-r-full"
                        aria-hidden="true"
                      />
                    )}

                    <span className="flex items-center justify-center w-6 h-6 shrink-0">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          active
                            ? "text-brand"
                            : "text-[#a0a0a0] group-hover:text-[#ededed]"
                        }`}
                      />
                    </span>

                    <span
                      className={`ml-2 text-xs transition-all duration-150 ease-supabase ${
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
          </div>
        </div>

        {/* Footer Area Pinned to Bottom */}
        <div className="p-2 border-t border-[#2e2e2e] overflow-hidden whitespace-nowrap">
          <div
            className={`flex items-center h-10 px-2 rounded-[6px] bg-[#171717] border border-[#2e2e2e] transition-colors`}
            title="Studio Engine: Operational"
          >
            <span className="flex items-center justify-center w-6 h-6 shrink-0">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            </span>
            <div
              className={`ml-2 flex-1 min-w-0 transition-all duration-150 ease-supabase flex items-center justify-between ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              <span className="text-[11px] font-medium text-[#ededed] truncate">
                Pro Studio
              </span>
              <span className="text-[10px] text-brand font-mono font-medium px-1.5 py-0.5 rounded bg-brand/10 border border-brand/20">
                Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
