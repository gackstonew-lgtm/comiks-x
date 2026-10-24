"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/projects");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-[#a0a0a0] text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span>Loading Projects & Reference Library...</span>
      </div>
    </div>
  );
}
