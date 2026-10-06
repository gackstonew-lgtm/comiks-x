import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Film, BookOpen, User, Play, Sparkles, Sliders, Layers, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Comiks X | Professional AI Comic Animation Studio",
  description: "End-to-end AI comic animation production studio for 30-minute recurring episodes and viral TikTok/Reels clips.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-studio-100 min-h-screen flex flex-col font-sans antialiased selection:bg-comic-yellow selection:text-studio-950">
        {/* Studio Top Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-studio-800 bg-studio-900/90 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-comic-yellow via-amber-500 to-comic-red flex items-center justify-center font-black text-studio-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-studio-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-200 to-comic-cyan bg-clip-text text-transparent">
                  COMIKS <span className="text-comic-yellow">X</span>
                </span>
                <span className="block text-[10px] tracking-widest uppercase font-semibold text-studio-400">
                  AI Comic Animation Studio
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/series"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-comic-yellow" />
                Series Hub
              </Link>
              <Link
                href="/characters"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-comic-cyan" />
                Character Bible
              </Link>
              <Link
                href="/story-creator"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-comic-purple" />
                Story Creator
              </Link>
              <Link
                href="/storyboard/ep-01-the-pitch"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-comic-green" />
                Storyboard
              </Link>
              <Link
                href="/editor/ep-01-the-pitch"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                Timeline Editor
              </Link>
              <Link
                href="/clips/ep-01-the-pitch"
                className="px-3 py-1.5 rounded-lg text-studio-300 hover:text-white hover:bg-studio-800 transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-comic-pink" />
                Social Clips
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/queue"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-700 text-xs font-medium text-studio-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Queue Status</span>
            </Link>

            <Link
              href="/settings"
              className="p-2 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-400 hover:text-white transition-colors"
              title="Provider & AI Settings"
            >
              <Sliders className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Studio Footer */}
        <footer className="border-t border-studio-850 bg-studio-950 px-6 py-4 text-xs text-studio-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-studio-300">COMIKS X STUDIO</span>
            <span>•</span>
            <span>Multi-scene 30-min Episode Engine</span>
            <span>•</span>
            <span className="text-comic-yellow font-semibold">African Comic & Sheng Optimized</span>
          </div>
          <div>TikTok 9:16 & Reels Social Clip Pipeline Ready</div>
        </footer>
      </body>
    </html>
  );
}
