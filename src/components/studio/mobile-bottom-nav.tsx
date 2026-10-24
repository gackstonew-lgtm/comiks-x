"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Scissors, Zap, BrainCircuit, Film } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Generator", href: "/video-generator", icon: Clapperboard },
    { label: "Editor", href: "/editor", icon: Scissors },
    { label: "Create", href: "/video-generator?new=true", icon: Zap, isPrimary: true },
    { label: "Training", href: "/training", icon: BrainCircuit },
    { label: "Projects", href: "/projects", icon: Film },
  ];

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    return pathname.startsWith(cleanHref);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#171717]/95 backdrop-blur-md border-t border-[#2e2e2e] pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Create Video"
                aria-current={active ? "page" : undefined}
                className="relative -top-3 flex flex-col items-center justify-center group focus-visible:outline-brand focus-visible:outline-2"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-active:scale-95 ${
                    active
                      ? "bg-brand text-[#09090b] shadow-brand/20"
                      : "bg-brand hover:bg-brand-hover text-[#09090b] shadow-brand/10"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-semibold text-brand mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-[6px] transition-colors motion-reduce:transition-none focus-visible:outline-brand focus-visible:outline-2 ${
                active
                  ? "text-brand"
                  : "text-[#a0a0a0] hover:text-[#ededed] active:text-white"
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 stroke-[2]" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "font-semibold text-white" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
