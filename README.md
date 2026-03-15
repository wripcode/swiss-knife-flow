# Swiss Knife Flow

An open-source, local-first toolset for managing Webflow sites — built as a pnpm monorepo with a Next.js dashboard and a Webflow Designer Extension.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start both the Next.js app and the Webflow extension dev server concurrently
pnpm dev
```

The web app runs at **http://localhost:3000** and the Designer Extension at **http://localhost:1337**.

## Commands

```bash
# Start both Next.js + Webflow extension
pnpm dev

# Start only the Next.js web app (port 3000)
pnpm dev:web

# Start only the Webflow Designer Extension (Vite, port 1337)
pnpm dev:ext

# Build the Next.js app for production
pnpm build

# Lint
pnpm lint
```

> No test suite is configured.

## Environment Variables

Create a `.env.local` at the project root:

```env
WEBFLOW_CLIENT_ID=
WEBFLOW_CLIENT_SECRET=
```

The extension reads `VITE_DATA_CLIENT_URL` from `extension/.env.development` (defaults to `http://localhost:3000`).

## Architecture

This is a **pnpm monorepo** with two packages:

| Package          | Description                                             |
| ---------------- | ------------------------------------------------------- |
| **Root**         | Next.js 16 web app — dashboard, API backend, OAuth flow |
| **`extension/`** | Vite + React — runs as a Webflow Designer Extension     |

### Data Storage

Tokens are stored in a **LevelDB** database at `/data` (local filesystem, never leaves your machine). The singleton connection pattern ensures the database is opened exactly once across all concurrent API routes.

---

### Next.js App Structure

```
app/
  (app)/                    # Route group — shared sidebar + header shell layout
    layout.tsx              # SidebarProvider + DashboardSidebar + DashboardHeader
    page.tsx                # Dashboard page (/)
    custom-attributes/
      page.tsx              # Custom Attributes tool (/custom-attributes)
  layout.tsx                # Root layout — Inter + Roboto Mono fonts, ThemeProvider (dark only)
  globals.css               # Webflow design tokens (CSS variables), base styles
  api/
    auth/
      webflow/route.ts      # GET → redirects to Webflow OAuth
      callback/route.ts     # GET → exchanges code for token, stores in LevelDB
      status/route.ts       # GET → { authenticated: boolean }
    sites/route.ts          # GET → lists Webflow sites via SDK
    user/route.ts           # GET → { user: { id, email, firstName, lastName } }

lib/
  webflow/
    oauth.ts                # getAuthorizeURL(), exchangeCodeForToken()
    client.ts               # getWebflowClient() — builds WebflowClient from stored token
  db/
    token-store.ts          # LevelDB singleton — storeToken / getToken / deleteToken
  utils.ts                  # cn() helper (clsx + tailwind-merge)

hooks/
  use-webflow-auth.ts       # Polls /api/auth/status; exposes { authenticated, loading, connectUrl }
  use-sites.ts              # Fetches /api/sites when authenticated

components/
  ui/                       # shadcn/ui primitives — DO NOT edit directly
  dashboard/
    sidebar.tsx             # Route-aware sidebar (usePathname for active state)
    header.tsx              # Dynamic page title + icon based on current route
    content.tsx             # Dashboard home content (welcome + sites list)
  webflow/
    connect-button.tsx      # OAuth connect / connected state button
    sites-list.tsx          # Site cards with metadata (dates, timezone, status badge)
```

---

### Styling

- **Tailwind CSS v4** with no `tailwind.config` — all configuration is done in CSS
- **Webflow dark theme** exclusively — light mode has been removed
- **CSS variables** in `app/globals.css` map to Webflow's design tokens (colors, shadows, typography)
- **Typography**: Inter (11px / 12px, 16px line-height) + Roboto Mono (11px, for code)
- **No shadcn/ui source edits** — all overrides use CSS variable mapping or targeted `[data-slot]` selectors in `globals.css`
- Component variants use `class-variance-authority`; class merging uses `cn()` from `lib/utils.ts`

---

### Tools

| Tool              | Route                | Description                                       |
| ----------------- | -------------------- | ------------------------------------------------- |
| Custom Attributes | `/custom-attributes` | Manage custom HTML attributes on Webflow elements |

More tools coming soon.
