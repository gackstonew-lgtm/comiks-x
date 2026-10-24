# Supabase Backend Setup & Deployment Guide for Comiks X

This document details the configuration, schema migrations, and authentication settings for hosting the Comiks X backend on Supabase.

---

## 1. Supabase Environment Variables

In your Vercel Project Dashboard (and local `.env.local` for development), set the following environment variables:

| Variable Name | Exposure | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Your Supabase project URL (e.g. `https://yitsgrcgqdzguhvqzyzw.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | Your Supabase anonymous public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private (Server-only)** | Secret administrative key. Never prefix with `NEXT_PUBLIC_` |
| `DATABASE_URL` | **Private (Server-only)** | PostgreSQL pooled connection string for direct database access |
| `NEXT_PUBLIC_SITE_URL` | Public (Client & Server) | Base URL for redirects (`http://localhost:3000` locally, `https://comiks-x.vercel.app` in prod) |

---

## 2. Supabase Auth Dashboard Settings

In your [Supabase Dashboard](https://supabase.com/dashboard/project/yitsgrcgqdzguhvqzyzw) navigate to **Authentication -> URL Configuration**:

1. **Site URL**:
   Set to:
   ```
   https://comiks-x.vercel.app
   ```
   (Or `http://localhost:3000` during local development)

2. **Redirect URLs**:
   Add both of the following callback URLs to the list of allowed redirect URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   https://comiks-x.vercel.app/auth/callback
   https://comiks-x.vercel.app/**
   ```

3. **Email Auth**:
   Under **Authentication -> Providers -> Email**:
   - Ensure **Enable Email provider** is turned ON.
   - If **Confirm email** is enabled, users will receive a verification email upon signup and be redirected to `/auth/callback`.

---

## 3. Applying Database Migrations

The database migration is located in `supabase/migrations/20261024120000_init_comiks_schema.sql`.

### Option A: Using the Supabase CLI (Recommended)
```bash
# Log in to Supabase CLI
npx supabase login

# Link your remote Supabase project
npx supabase link --project-ref yitsgrcgqdzguhvqzyzw

# Push the migration schema and RLS policies
npx supabase db push
```

### Option B: Using the Supabase Dashboard SQL Editor
1. Open the [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/yitsgrcgqdzguhvqzyzw/sql/new).
2. Copy and paste the entire contents of `supabase/migrations/20261024120000_init_comiks_schema.sql`.
3. Click **Run** to execute the migration.

---

## 4. Row Level Security (RLS) Architecture

Every table in the `public` schema has strict RLS enabled:

- `profiles`: Users can view, insert, and update only their own profile (`id = auth.uid()`).
- `series`: Users can view, create, edit, and delete only their own series projects (`user_id = auth.uid()`).
- `characters`: Scoped to `user_id = auth.uid()`.
- `locations`: Scoped to `user_id = auth.uid()`.
- `episodes`: Scoped to `user_id = auth.uid()`.
- `scenes`: Scoped to `user_id = auth.uid()`.
- `social_clips`: Scoped to `user_id = auth.uid()`.

No unauthenticated user can read or manipulate any creator data.
