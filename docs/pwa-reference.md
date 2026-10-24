# PWA Reference Analysis & Architecture

Reference Application: `https://portal.calyviawellness.co.ke/`  
Target Application: **Comiks X — Professional AI Comic Animation Studio** (`https://comiks-x.vercel.app`)

---

## 1. Reference Inspection Findings (Calyvia Wellness Portal)

From external inspection and Chrome DevTools / Lighthouse audits:
- **Web App Manifest**:
  - `name`: Calyvia Wellness Portal
  - `short_name`: Calyvia (<=12 characters)
  - `start_url`: `/?source=pwa` (or `/`)
  - `scope`: `/`
  - `display`: `standalone`
  - `orientation`: `portrait-primary`
  - `theme_color`: `#059669` (Emerald brand green)
  - `background_color`: `#ffffff` (light portal) vs dark studio in Comiks X
  - `icons`: standard set including 192x192, 512x512, maskable 512x512, apple-touch-icon, and favicon.
  - `categories`: productivity, medical/wellness
- **Head Meta Tags**:
  - `<meta name="mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
  - `<meta name="apple-mobile-web-app-title" content="..." />`
  - `<meta name="theme-color" content="#059669" />`
  - `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />`
- **Service Worker & Caching Behavior**:
  - Precache core app shell and static bundles.
  - HTML navigation: Network-first falling back to cached shell or `/offline`.
  - Auth, API, Supabase: Strictly network-only (never cached in Cache Storage).
  - Clean update notifications (`skipWaiting` on user prompt).
- **Session Verification & Splash Screen**:
  - Branded splash / loading state while Supabase/auth session verifies on initial launch to avoid white screen flashes.
- **Install Experience**:
  - Non-intrusive install prompt (Chromium `beforeinstallprompt` + iOS Safari instruction pill).
  - Remembers user dismissals (7 to 14 days).
  - Hides automatically once installed or in standalone mode.

---

## 2. Comiks X Target Specification

- **Brand Colors**:
  - Dark background: `#09090b` / `#0a0a0a`
  - Accent / Theme color: `#34d399` (Emerald / mint green) / `#10b981`
- **Manifest**:
  - `id`: `comiks-x-studio`
  - `name`: `Comiks X - AI Comic Animation Studio`
  - `short_name`: `Comiks X`
  - `start_url`: `/?source=pwa`
  - `scope`: `/`
  - `display`: `standalone`
  - `orientation`: `any` (studio needs desktop/tablet landscape support while remaining responsive on mobile portrait)
  - `theme_color`: `#09090b` (dark system chrome) with `#34d399` accent
  - `background_color`: `#09090b`
  - `shortcuts`:
    - `/video-generator` ("Video Generator")
    - `/editor` ("Video Editor")
    - `/projects` ("Projects")
- **Service Worker Security Guarantee**:
  - `*.supabase.co/*`: **STRICT NETWORK ONLY** (never stored in Cache Storage).
  - `/api/*`: **STRICT NETWORK ONLY**.
  - `/auth/*`: **STRICT NETWORK ONLY**.
  - Cache only versioned `_next/static` assets, static images, icons, and the `/offline` fallback document.
- **Cache Eviction on Logout**:
  - When user logs out, purge user-session data and ensure no private data resides in any Cache Storage bucket.
