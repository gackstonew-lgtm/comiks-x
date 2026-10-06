"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  BookOpen,
  User,
  Sparkles,
  Layers,
  Sliders,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Activity,
  PlaySquare,
  Home,
  Mic,
} from "lucide-react";

interface StudioSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function StudioSidebar({ isCollapsed, onToggle }: StudioSidebarProps) {
  const pathname = usePathname();

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

  return (
    <aside
      className={`relative flex flex-col bg-studio-900 border-r border-studio-border transition-all duration-300 ease-in-out z-40 select-none ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Sidebar Header / Workspace Pill */}
      <div className="p-3 border-b border-studio-border flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <Link
            href="/"
            className="flex-1 flex items-center justify-between p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-border transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-studioOrange flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                CX
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate leading-tight group-hover:text-studioOrange transition-colors">
                  Comiks X
                </div>
                <div className="text-[10px] text-zinc-400 truncate leading-tight">
                  Studio Workspace
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
          </Link>
        ) : (
          <Link
            href="/"
            className="mx-auto w-10 h-10 rounded-xl bg-studioOrange flex items-center justify-center text-white font-black text-sm shadow-sm hover:scale-105 transition-transform"
            title="Comiks X Studio"
          >
            CX
          </Link>
        )}

        {/* Minimal Directional Arrow Collapse Toggle */}
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-7 h-7 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-border flex items-center justify-center text-zinc-400 hover:text-white transition-all ${
            isCollapsed ? "absolute -right-3.5 top-5 z-50 shadow-md bg-studio-900 border-studio-700" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-studioOrange" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
        {/* Main Group */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Create & Direct
            </div>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-studio-800 text-white font-semibold border border-white/[0.06] shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-studio-850/80"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? "text-studioOrange" : "text-zinc-400 group-hover:text-zinc-300"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Production Group */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Post & Publish
            </div>
          )}
          <nav className="space-y-1">
            {productionNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-studio-800 text-white font-semibold border border-white/[0.06] shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-studio-850/80"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? "text-studioOrange" : "text-zinc-400 group-hover:text-zinc-300"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Config Group */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              System
            </div>
          )}
          <nav className="space-y-1">
            {configNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-studio-800 text-white font-semibold border border-white/[0.06] shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-studio-850/80"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      active ? "text-studioOrange" : "text-zinc-400 group-hover:text-zinc-300"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Feature Badge (Matching Reference's "Unlock more features") */}
      <div className="p-3 border-t border-studio-border">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-studio-850 border border-studio-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-studioOrange/20 flex items-center justify-center text-studioOrange">
                <Star className="w-3 h-3 fill-studioOrange" />
              </div>
              <span className="font-semibold text-zinc-300 text-[11px]">Pro Studio Engine</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">95% Health</span>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-xl bg-studio-850 border border-studio-border flex items-center justify-center text-studioOrange"
            title="Pro Studio Engine: 95% Queue Health"
          >
            <Star className="w-4 h-4 fill-studioOrange" />
          </div>
        )}
      </div>
    </aside>
  );
}
