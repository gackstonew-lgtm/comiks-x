import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils/url";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/projects";
  const siteUrl = getSiteUrl();

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const destination = next.startsWith("/") ? next : `/${next}`;
        return NextResponse.redirect(`${siteUrl}${destination}`);
      }
    } catch {
      // Failed to exchange session
    }
  }

  // Redirect to login if code exchange fails
  return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`);
}
