# Plan: Restyle Dashboard to Match Webflow Designer Dark Theme

## Context

The current app is a generic "Taskplus" dashboard template (light/dark neutral grays, Geist font, placeholder branding). We need to reskin it to look and feel like the **Webflow Designer** — dark panels, Webflow blue (#146EF5) as the primary accent, Inter font, and navigation relevant to a Webflow tools platform.

This is purely a **visual/styling pass** — no functional changes, no new components, no API wiring.

---

## Target Aesthetic

| Property | Webflow Designer Value |
|---|---|
| Main background | `#13161f` — deep dark navy |
| Sidebar background | `#0f1117` — darker panel |
| Card/panel background | `#1c2030` — elevated surface |
| Primary (brand) color | `#146EF5` — Webflow Blue |
| Primary text | `#e8ecf2` — near-white |
| Muted text | `#7a8696` — mid-gray |
| Border | `rgba(255,255,255, 0.08)` — very subtle |
| Font | Inter |
| Border radius | ~6px — tighter, tool-like |
| Default theme | Dark (already set) |

---

## Phase 1 — Font + Metadata
**Files:** `app/layout.tsx`

- Remove `Geist` and `Geist_Mono` imports from `next/font/google`
- Add `Inter` font (variable: `--font-inter`)
- Keep Geist Mono or swap to `JetBrains_Mono` for code/mono usage
- Update `@theme inline` in globals.css: `--font-sans: var(--font-inter)`
- Update metadata:
  - `title: "Swiss Knife Flow — Webflow Tools"`
  - `description: "Open-source local-first toolset for managing Webflow sites"`

---

## Phase 2 — Color System Rewrite
**Files:** `app/globals.css`

Replace all OKLCH tokens in both `:root` (light) and `.dark` (primary) to match Webflow Designer palette.

**`.dark` token targets:**
```
--background:         oklch(0.14 0.015 264)   /* #13161f  main bg */
--foreground:         oklch(0.93 0.008 264)   /* #e8ecf2  primary text */
--card:               oklch(0.18 0.02 264)    /* #1c2030  panel bg */
--primary:            oklch(0.52 0.245 264)   /* #146EF5  Webflow blue */
--primary-foreground: oklch(1 0 0)            /* white */
--secondary:          oklch(0.22 0.02 264)    /* elevated surface */
--muted:              oklch(0.22 0.02 264)
--muted-foreground:   oklch(0.62 0.015 264)   /* #7a8696 */
--accent:             oklch(0.22 0.02 264)
--destructive:        oklch(0.65 0.22 25)     /* error red */
--border:             oklch(1 0 0 / 8%)       /* subtle white border */
--input:              oklch(1 0 0 / 10%)
--ring:               oklch(0.52 0.245 264)   /* blue focus ring */

/* Sidebar — darker than main content */
--sidebar:                    oklch(0.11 0.015 264)   /* #0f1117 */
--sidebar-primary:            oklch(0.52 0.245 264)   /* blue active */
--sidebar-primary-foreground: oklch(1 0 0)
--sidebar-accent:             oklch(1 0 0 / 8%)       /* hover tint */
--sidebar-border:             oklch(1 0 0 / 6%)
--sidebar-ring:               oklch(0.52 0.245 264)
```

**`:root` (light mode) updates:**
- Keep light mode viable for toggle
- Update `--primary` to Webflow blue (`oklch(0.52 0.245 264)`) — same blue in light mode
- Apply a slightly cooler (blue-tinted) tone to grays

**Border radius:**
- Change `--radius` from `0.625rem` (10px) → `0.375rem` (6px) — tighter, tool feel

**Chart colors** — Update to Webflow blue-led palette:
- chart-1: Webflow blue
- chart-2: Teal
- chart-3: Yellow-green
- chart-4: Purple
- chart-5: Red-orange

---

## Phase 3 — Sidebar Branding + Navigation
**Files:** `components/dashboard/sidebar.tsx`

**Logo/Header:**
- Replace `T+` mark → `SKF` (Swiss Knife Flow initials)
- Rename workspace `"Taskplus"` → `"Swiss Knife Flow"`
- Keep workspace switcher structure (will be used for Webflow site-switching later)

**Nav items** — Replace generic task nav with Webflow tools nav:
```ts
{ title: "Dashboard",       icon: LayoutDashboard,   isActive: true },
{ title: "Sites",           icon: Globe               },
{ title: "Attributes",      icon: Code2               },
{ title: "Slider Builder",  icon: SlidersHorizontal   },
{ title: "Airtable Sync",   icon: RefreshCw           },
{ title: "Activity Log",    icon: Activity             },
{ title: "Settings",        icon: Settings             },
```

**Footer:**
- Remove `"lndev-ui / square.lndev.me"` promotional box entirely
- Replace with a clean **"Connect Webflow"** CTA button (placeholder, not functional yet)

---

## Phase 4 — Header Cleanup
**Files:** `components/dashboard/header.tsx`

- Remove GitHub link (points to old "square-ui" repo — wrong project)
- Remove hardcoded "Last Updated" timestamp (from mock-data)
- Remove avatar stack (placeholder team members, not relevant)
- Keep: `SidebarTrigger`, breadcrumb, `ThemeToggle`
- Update breadcrumb icon: `Folder` → `LayoutDashboard`
- Add one clean action button if needed (e.g., a simple "Connect Site" placeholder)

---

## What We're NOT Changing

- `components/ui/` — shadcn components untouched (per CLAUDE.md)
- `components/dashboard/content.tsx` — Layout structure intact
- `components/dashboard/stats-cards.tsx`, `todays-tasks.tsx`, `performance-chart.tsx`, `projects-table.tsx` — Mock content stays (replaced in Phase 2+ of app dev)
- Database, API routes, auth — Not in scope here
- `app/page.tsx` — No changes needed

---

## Verification Checklist

After all 4 phases, verify in browser (`pnpm dev`):

- [ ] Dark background is deep navy (`#13161f`), not pure black
- [ ] Sidebar is visibly darker than main content area
- [ ] Primary buttons/active nav states show Webflow blue (`#146EF5`)
- [ ] Font renders as Inter (check DevTools > computed `font-family` on `body`)
- [ ] Card border radius feels tighter (~6px)
- [ ] Nav shows: Dashboard, Sites, Attributes, Slider Builder, Airtable Sync, Activity Log, Settings
- [ ] Browser tab reads "Swiss Knife Flow — Webflow Tools"
- [ ] No "Taskplus", "Square UI", or "lndev-ui" references visible
- [ ] Theme toggle still works (light mode fallback functional)
