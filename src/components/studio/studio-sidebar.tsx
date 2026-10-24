"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Image as ImageIcon,
  Layers,
  Sliders,
  UserCheck,
  Mic,
  Users,
  FolderKanban,
  LayoutTemplate,
  Stamp,
  CreditCard,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
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

  // Persistent collapsed state (default: expanded on desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Exact 14 primary modules in requested order
  const navigationModules = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Video Generator", href: "/video-generator", icon: Video },
    { name: "AI Image Generator", href: "/image-generator", icon: ImageIcon },
    { name: "Script & Storyboard", href: "/storyboard", icon: Layers },
    { name: "Timeline Editor", href: "/editor", icon: Sliders },
    { name: "AI Avatars", href: "/avatars", icon: UserCheck },
    { name: "Voice & Music Studio", href: "/voice-music", icon: Mic },
    { name: "Characters & Styles", href: "/characters", icon: Users },
    { name: "Projects & Assets", href: "/projects", icon: FolderKanban },
    { name: "Templates", href: "/templates", icon: LayoutTemplate },
    { name: "Brand Kit", href: "/brand-kit", icon: Stamp },
    { name: "Billing & Credits", href: "/billing", icon: CreditCard },
    { name: "Team Workspace", href: "/team", icon: Building2 },
    { name: "Settings", href: "/settings", icon: Settings },
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
    if (href === "/dashboard") return pathname === "/dashboard";
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

  // Desktop sidebar is open if not collapsed OR if hovered while collapsed
  const isExpanded = !isCollapsed || isHovered;

  return (
    <>
      {/* Mobile Dimmed Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Studio Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Studio Main Navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#1c1c1c] border-r border-[#2e2e2e] select-none transition-[width,transform] duration-200 ease-in-out ${
          // Desktop: collapsed 56px (w-14) vs expanded 240px (w-60)
          isExpanded
            ? "md:w-60 shadow-[0_0_0_1px_#2e2e2e,0_12px_32px_0_rgba(0,0,0,0.6)]"
            : "md:w-14"
        } ${
          // Mobile: drawer slides in full height 240px
          isMobileOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Workspace Brand Header & Collapse Chevron */}
        <div className="h-14 border-b border-[#2e2e2e] flex items-center justify-between px-2.5 overflow-hidden whitespace-nowrap">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 p-1 rounded-md hover:bg-[#232323] transition-colors focus-visible:outline-brand focus-visible:outline-2"
          >
            {/* Supabase-style Brand Mark */}
            <div className="w-7 h-7 rounded-md bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs shrink-0 shadow-xs">
              CX
            </div>
            <div
              className={`transition-all duration-150 ${
                isExpanded || isMobileOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none w-0"
              }`}
            >
              <div className="text-xs font-semibold text-[#ededed] leading-tight">
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

        {/* 14 Navigation Modules */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 hide-scrollbar">
          {navigationModules.map((item, idx) => {
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
                className={`relative flex items-center h-8.5 px-2 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden group focus-visible:outline-brand focus-visible:outline-2 ${
                  active
                    ? "bg-[#232323] text-[#ededed] font-semibold shadow-xs"
                    : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#232323]"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-brand rounded-r-full"
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

        {/* Pinned Bottom Status / Credit Summary */}
        <div className="p-2 border-t border-[#2e2e2e] overflow-hidden whitespace-nowrap">
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
