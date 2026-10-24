import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rate limiting in-memory store: max 5 signups per IP per 10 minutes
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5;

// Periodically clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, ip) => {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  });
}, 5 * 60 * 1000).unref();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(ip);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return false;
  }

  existing.count += 1;
  return true;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. Abuse Protection & Per-IP Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please wait 10 minutes and try again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Input
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Full Name or Creator Alias must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { success: false, error: "Password cannot exceed 72 characters." },
        { status: 400 }
      );
    }

    // 3. Initialize Supabase Admin Client using server-only SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[AUTH_ERROR] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment."
      );
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service is currently misconfigured. Please check server environment keys.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. Create confirmed user without email verification (email_confirm: true)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("user already exists") ||
        (error as any).status === 422
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists",
          },
          { status: 409 }
        );
      }

      console.error("[AUTH_ADMIN_CREATE_USER_ERROR]", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create account. Please try again.",
        },
        { status: 500 }
      );
    }

    // 5. Ensure profile row exists (complements Postgres AFTER INSERT trigger on auth.users)
    if (data.user?.id) {
      try {
        await supabaseAdmin.from("profiles").upsert(
          {
            id: data.user.id,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        // Trigger handle_new_user already handles this; log notice without failing signup
        console.warn("[PROFILE_UPSERT_NOTICE]", profileErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName,
      },
    });
  } catch (err: any) {
    console.error("[SIGNUP_ROUTE_EXCEPTION]", err);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
