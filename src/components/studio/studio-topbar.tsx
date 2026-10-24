"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Bell,
  Layers,
  User,
  BookOpen,
  X,
  Menu,
  LogOut,
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
    episodes: Array<{ id: string; title: string }>;
    characters: Array<{ id: string; name: string }>;
    series: Array<{ id: string; title: string }>;
  }>({ episodes: [], characters: [], series: [] });

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    async function fetchIndex() {
      try {
        const [epRes, charRes, serRes] = await Promise.all([
          fetch("/api/episodes").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/characters").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/series").then((r) => (r.ok ? r.json() : [])),
        ]);

        setResults({
          episodes: Array.isArray(epRes) ? epRes : [],
          characters: Array.isArray(charRes) ? charRes : [],
          series: Array.isArray(serRes) ? serRes : [],
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

  const filteredEpisodes = results.episodes.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCharacters = results.characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSeries = results.series.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasAnyResults =
    searchQuery.trim().length > 0 &&
    (filteredEpisodes.length > 0 ||
      filteredCharacters.length > 0 ||
      filteredSeries.length > 0);

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
          <Menu className="w-4 h-4" />
        </button>

        {/* Supabase-style Search Input */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#707070] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Search episodes, characters, scenes..."
              className="w-full h-8 pl-8 pr-7 rounded-[6px] bg-[#121212] hover:bg-[#171717] focus:bg-[#171717] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-[#ededed] placeholder-[#707070] transition-all focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearching(false);
                }}
                className="absolute right-2 text-[#707070] hover:text-[#ededed]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {isSearching && hasAnyResults && (
            <div className="absolute top-10 left-0 right-0 rounded-[8px] bg-[#1c1c1c] border border-[#2e2e2e] shadow-[0_12px_32px_0_rgba(0,0,0,0.6)] p-2 z-50 max-h-80 overflow-y-auto space-y-2">
              {filteredEpisodes.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#707070] px-2 py-1">
                    Episodes
                  </div>
                  {filteredEpisodes.slice(0, 3).map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/storyboard/${ep.id}`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#232323] text-xs text-[#ededed] transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-brand" />
                      <span className="truncate">{ep.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {filteredCharacters.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#707070] px-2 py-1">
                    Characters
                  </div>
                  {filteredCharacters.slice(0, 3).map((char) => (
                    <Link
                      key={char.id}
                      href={`/characters`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#232323] text-xs text-[#ededed] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      <span className="truncate">{char.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {filteredSeries.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#707070] px-2 py-1">
                    Series
                  </div>
                  {filteredSeries.slice(0, 2).map((s) => (
                    <Link
                      key={s.id}
                      href={`/series`}
                      onClick={() => setIsSearching(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-[#232323] text-xs text-[#ededed] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#a0a0a0]" />
                      <span className="truncate">{s.title}</span>
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
        {/* Primary Creation Action Button */}
        <Link
          href="/story-creator"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all focus-visible:outline-brand focus-visible:outline-2"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Episode</span>
        </Link>

        {/* AI Queue Indicator */}
        <Link
          href="/queue"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-xs text-[#a0a0a0] hover:text-[#ededed] transition-colors"
          title="AI Video Generation Queue"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-[11px] font-medium">Queue</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="w-8 h-8 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] flex items-center justify-center text-[#a0a0a0] hover:text-[#ededed] transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
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
                Settings & API Keys
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] hover:bg-red-500/10 hover:text-red-400 text-[#a0a0a0] transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
