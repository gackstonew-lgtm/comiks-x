# Comiks X — Supabase Design Language & Token Specification

Documenting the extracted design tokens, components, and layout behaviors modeled directly on the **Supabase** Design System (`supabase.com` and Supabase Studio dashboard).

---

## 1. Color Palette (Dark-First Hierarchy)

| Semantic Role | CSS Variable | Hex / HSL | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas / Page Background** | `--bg-canvas` | `#121212` | Main page body, outer desktop background |
| **Surface (Base)** | `--bg-surface` | `#171717` | Standard card surface, panels |
| **Surface (Elevated / Sidebar)** | `--bg-surface-elevated` | `#1C1C1C` | Sidebar background, elevated dropdowns, dialogs |
| **Surface (Hover / Active)** | `--bg-surface-hover` | `#232323` | Table row hover, list item hover, button secondary hover |
| **Surface (Highest / Overlays)**| `--bg-surface-overlay` | `#282828` | Tooltips, popovers, flyout menus |
| **Border (Subtle)** | `--border-subtle` | `rgba(255, 255, 255, 0.08)` / `#282828` | Default 1px structural dividing lines |
| **Border (Default)** | `--border-default` | `#2E2E2E` | Card borders, input borders, button outlines |
| **Border (Strong / Focus)** | `--border-strong` | `#3E3E3E` | Highlighted borders, selected items, table headers |
| **Text Primary (Foreground)** | `--text-primary` | `#EDEDED` | Headings, active label text, high-contrast data |
| **Text Secondary** | `--text-secondary` | `#A0A0A0` | Body copy, secondary nav labels, inactive badges |
| **Text Muted** | `--text-muted` | `#707070` | Timestamps, section supertitles, placeholder text |
| **Brand Green (Primary)** | `--brand-default` | `#3ECF8E` | Primary CTA buttons, active accents, focus rings |
| **Brand Green (Hover)** | `--brand-hover` | `#34B27B` | Primary button hover state |
| **Brand Green (Active)** | `--brand-active` | `#24B47E` | Pressed button state |
| **Brand Green (Subtle Surface)**| `--brand-surface` | `rgba(62, 207, 142, 0.10)` | Active navigation background, tag highlights |
| **Brand Green (Subtle Border)** | `--brand-border` | `rgba(62, 207, 142, 0.25)` | Active item borders, selected cards |
| **Text on Brand** | `--text-on-brand` | `#09090B` | Contrast text on solid green buttons (high legibility) |
| **Focus Ring** | `--focus-ring` | `rgba(62, 207, 142, 0.45)` | Keyboard focus-visible 2px ring with 1px offset |
| **Destructive / Error** | `--destructive` | `#EF4444` | Deletion actions, failure states |
| **Warning** | `--warning` | `#F59E0B` | Cost limit alerts, retry notices |

---

## 2. Typography

- **Font Family (Sans)**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, sans-serif.
- **Font Family (Mono)**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace.
- **Scale**:
  - `Display / H1`: `24px` to `30px`, font-weight `600` (semibold) or `700` (bold), letter-spacing `-0.02em`.
  - `Section / H2`: `18px` to `20px`, font-weight `600`, letter-spacing `-0.015em`.
  - `Card Title / H3`: `14px` to `15px`, font-weight `600`, letter-spacing `-0.01em`.
  - `Body`: `13px` to `14px`, line-height `1.5`, font-weight `400` or `500`.
  - `Navigation / Buttons`: `13px`, font-weight `500` (medium).
  - `Small / Captions / Badges`: `11px` to `12px`, font-weight `500`.
  - `Code / Meta`: `11px` to `12px`, monospace font-weight `400`.

---

## 3. Spacing, Geometry & Shadows

- **Border Width**: Standard `1px` crisp borders. Flat design language; borders provide the primary depth separation rather than heavy drop-shadows.
- **Border Radius**:
  - Small / Badges / Tags: `4px` (`rounded`)
  - Inputs / Buttons / Nav items: `6px` (`rounded-md` or `rounded-[6px]`)
  - Cards / Modals / Popovers: `8px` (`rounded-lg` or `rounded-[8px]`)
  - Avatar / Status Dots: `9999px` (`rounded-full`)
- **Shadows**:
  - Mostly flat with 1px border.
  - Floating overlays: `box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)`.

---

## 4. Sidebar Specifications (Compact Icon-Rail & Smooth Hover Expansion)

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Collapsed Width** | `56px` (`w-14`) | Slim icon-only rail; icons centered horizontally |
| **Expanded Width** | `240px` (`w-60`) | Fully revealed navigation with category headings and titles |
| **Expansion Trigger** | `mouseenter` / `mouseleave` | Hover-intent delay of `120ms` to avoid accidental flickers |
| **Keyboard Accessibility**| `focus-within` | Automatically expands when focused via `Tab` key |
| **Overlay Mechanics** | Fixed / Absolute overlay | Main workspace keeps a permanent `margin-left: 56px` so content **does not shift or reflow** on expand |
| **Animation Curve** | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard smooth ease-out |
| **Width Transition Duration** | `200ms` | Container smoothly widens |
| **Label Transition** | `opacity` + `translateX` | Labels start at `opacity: 0; transform: translateX(-6px)` and animate to `1 / 0px` with `whitespace-nowrap` |
| **Active Nav Item Style** | Surface `#1F2421` + Brand text `#3ECF8E` + Left 2px green indicator bar or icon glow | Clean indicator conforming to Supabase Studio conventions |
| **Mobile (<768px)** | Off-canvas drawer (0px hidden) | Triggered via topbar hamburger toggle with dark backdrop blur |

---

## 5. Component Patterns

- **Primary Button**:
  - Background: `#3ECF8E`
  - Text: `#09090B` (bold `500`/`600` for crisp legibility)
  - Hover: `#34B27B`
  - Active: `#24B47E`
  - Radius: `6px`
- **Secondary Button**:
  - Background: `transparent` or `#1C1C1C`
  - Border: `1px solid #2E2E2E`
  - Text: `#EDEDED`
  - Hover: Background `#232323`, border `#3E3E3E`
- **Input & Search**:
  - Background: `#171717`
  - Border: `1px solid #2E2E2E`
  - Focus Ring: `2px solid rgba(62, 207, 142, 0.5)` with `box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.2)`
  - Radius: `6px`
- **Cards & Panels**:
  - Background: `#171717`
  - Border: `1px solid #2E2E2E`
  - Hover: Background `#1C1C1C`, border `#363636`
- **Badges**:
  - Brand Badge: Background `rgba(62, 207, 142, 0.12)`, text `#3ECF8E`, border `1px solid rgba(62, 207, 142, 0.25)`
  - Neutral Badge: Background `#232323`, text `#A0A0A0`, border `1px solid #2E2E2E`
