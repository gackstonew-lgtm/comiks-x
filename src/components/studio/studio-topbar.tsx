"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Zap,
  Bell,
  Film,
  User,
  X,
  Menu,
  LogOut,
  Wallet,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

interface StudioTopBarProps {
  onToggleMobile?: () => void;
}

export function StudioTopBar({ onToggleMobile }: StudioTopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [results, setResults] = useState<{
    projects: Array<{ id: string; name?: string; title?: string }>;
    characters: Array<{ id: string; name: string }>;
  }>({ projects: [], characters: [] });

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    async function fetchIndex() {
      try {
        const [projRes, charRes] = await Promise.all([
          fetch("/api/projects").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/characters").then((r) => (r.ok ? r.json() : [])),
        ]);

        setResults({
          projects: Array.isArray(projRes) ? projRes : [],
          characters: Array.isArray(charRes) ? charRes : [],
        });
      } catch {
        // Fallback or offline state
      }
    }
    fetchIndex();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = results.projects.filter((p) => {
    const title = p.name || p.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const filteredCharacters = results.characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasAnyResults =
    searchQuery.trim().length > 0 &&
    (filteredProjects.length > 0 || filteredCharacters.length > 0);

  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "C";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Studio Creator";

  return (
    <header className="h-14 border-b border-[#2e2e2e] bg-[#171717]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 select-none">
      {/* Left section: Mobile hamburger + Contextual search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-1.5 rounded-[6px] border border-[#2e2e2e] bg-[#1c1c1c] text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#232323] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Global Instant Search */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 stroke-[2] text-[#707070] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, scenes & character profiles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] pl-9 pr-8 py-1.5 text-xs text-[#ededed] placeholder-[#707070] outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#ededed]"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick-Search Autocomplete Dropdown */}
          {isSearching && hasAnyResults && (
            <div className="absolute left-0 right-0 top-11 bg-[#1c1c1c] border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_32px_0_rgba(0,0,0,0.6)] p-2 z-50 max-h-72 overflow-y-auto space-y-2 animate-fade-in text-xs">
              {filteredProjects.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707070] px-2 py-1">
                    Projects ({filteredProjects.length})
                  </div>
                  {filteredProjects.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#232323] text-xs text-[#ededed] transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 stroke-[2] text-brand" />
                      <span className="truncate">{p.name || p.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {filteredCharacters.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#707070] px-2 py-1">
                    Characters & DNA ({filteredCharacters.length})
                  </div>
                  {filteredCharacters.slice(0, 4).map((c) => (
                    <Link
                      key={c.id}
                      href={`/training`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#232323] text-xs text-[#ededed] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 stroke-[2] text-brand" />
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Credits Balance Pill */}
        <Link
          href="/billing"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] hover:border-brand/40 text-xs text-[#ededed] transition-all"
          title="Credits & Usage"
        >
          <Wallet className="w-3.5 h-3.5 stroke-[2] text-brand" />
          <span className="font-mono text-[11px] font-semibold text-brand">250 CR</span>
        </Link>

        {/* Primary Creation Action Button */}
        <Link
          href="/video-generator?new=true"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all focus-visible:outline-brand focus-visible:outline-2"
        >
          <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
          <span className="hidden sm:inline">Generate Video</span>
          <span className="sm:hidden">Create</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="w-8 h-8 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] flex items-center justify-center text-[#a0a0a0] hover:text-[#ededed] transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5 stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
        </button>

        {/* User Profile Avatar with dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-8 h-8 rounded-[6px] bg-brand/15 border border-brand/30 flex items-center justify-center text-brand text-xs font-semibold select-none hover:bg-brand/25 transition-colors focus-visible:outline-brand"
            title={user?.email || "Studio Creator Profile"}
            aria-label="User profile menu"
          >
            {userInitial}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 w-56 rounded-[8px] bg-[#1c1c1c] border border-[#2e2e2e] shadow-[0_12px_32px_0_rgba(0,0,0,0.6)] p-2 z-50 text-xs animate-scale-in">
              <div className="px-2.5 py-2 border-b border-[#2e2e2e] mb-1">
                <div className="font-semibold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-[#a0a0a0] truncate">{user?.email || "creator@comiks-x.studio"}</div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-[#232323] text-[#ededed] transition-colors"
              >
                <Settings className="w-3.5 h-3.5 stroke-[2]" />
                <span>Settings & API Keys</span>
              </Link>

              <Link
                href="/billing"
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-[#232323] text-[#ededed] transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 stroke-[2]" />
                <span>Credits & Billing</span>
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-red-500/10 hover:text-red-400 text-[#a0a0a0] transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
