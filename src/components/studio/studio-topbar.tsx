"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Activity,
  Film,
  User,
  BookOpen,
  X,
  Layers,
} from "lucide-react";

export function StudioTopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    episodes: Array<{ id: string; title: string }>;
    characters: Array<{ id: string; name: string }>;
    series: Array<{ id: string; title: string }>;
  }>({ episodes: [], characters: [], series: [] });

  const [hasData, setHasData] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-fetch search index items for instant responsive searching
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
        setHasData(true);
      } catch {
        // Fallback or offline state
      }
    }
    fetchIndex();
  }, []);

  // Handle outside click to close search popup
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
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

  return (
    <header className="h-16 border-b border-studio-border bg-studio-900/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Contextual Search Input (Matching Reference Visual) */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Search episodes, characters, scenes, assets..."
            className="w-full h-9 pl-9 pr-8 rounded-full bg-studio-850 hover:bg-studio-800 focus:bg-studio-800 border border-studio-border focus:border-studioOrange/50 text-xs text-white placeholder-zinc-500 transition-all focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearching(false);
              }}
              className="absolute right-2.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearching && hasAnyResults && (
          <div className="absolute top-11 left-0 right-0 rounded-2xl bg-studio-900 border border-studio-border shadow-2xl p-2 z-50 max-h-80 overflow-y-auto space-y-2">
            {filteredEpisodes.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                  Episodes
                </div>
                {filteredEpisodes.slice(0, 3).map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/storyboard/${ep.id}`}
                    onClick={() => setIsSearching(false)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-studio-800 text-xs text-zinc-200 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-studioOrange" />
                    <span className="truncate">{ep.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {filteredCharacters.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                  Characters
                </div>
                {filteredCharacters.slice(0, 3).map((char) => (
                  <Link
                    key={char.id}
                    href={`/characters`}
                    onClick={() => setIsSearching(false)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-studio-800 text-xs text-zinc-200 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{char.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {filteredSeries.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                  Series
                </div>
                {filteredSeries.slice(0, 2).map((s) => (
                  <Link
                    key={s.id}
                    href={`/series`}
                    onClick={() => setIsSearching(false)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-studio-800 text-xs text-zinc-200 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{s.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-3">
        {/* Primary Creation Action Button (Warm Orange Pill Button) */}
        <Link
          href="/story-creator"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-studioOrange hover:bg-studioOrange-hover active:scale-95 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Episode</span>
        </Link>

        {/* AI Queue Indicator */}
        <Link
          href="/queue"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-studio-850 hover:bg-studio-800 border border-studio-border text-xs text-zinc-300 transition-colors"
          title="AI Video Generation Queue"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-medium">Queue</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="w-9 h-9 rounded-full bg-studio-850 hover:bg-studio-800 border border-studio-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-studioOrange"></span>
        </button>

        {/* User Profile Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-studio-border flex items-center justify-center text-white text-xs font-bold shadow-sm"
          title="Studio Creator Profile"
        >
          CX
        </div>
      </div>
    </header>
  );
}
