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

Create a `.env.local` at the project root (see `.env.example`):

```env
WEBFLOW_CLIENT_ID=
WEBFLOW_CLIENT_SECRET=
```

The extension reads `VITE_DATA_CLIENT_URL` from `extension/.env.development` (defaults to `http://localhost:3000`).

## Architecture

This is a **pnpm monorepo** with two packages:

| Package | Description |
| --- | --- |
| **Root** | Next.js 16.3 (preview) web app — dashboard UI, API backend, OAuth flow |
| **`extension/`** | Vite + React — runs as a Webflow Designer Extension iframe |

The two packages communicate via `postMessage` using a typed protocol defined in `lib/message-bus.ts`. See [`dev-data/ARCHITECTURE.md`](./dev-data/ARCHITECTURE.md) for the full architectural overview.

### Data Storage

Tokens are stored in a **LevelDB** database at `./data` (local filesystem, never leaves your machine). The singleton connection pattern ensures the database is opened exactly once across all concurrent API routes.

---

### Next.js App Structure

```
app/
  (app)/                          # Route group — shared sidebar + header + footer shell
    layout.tsx                    # SidebarProvider + DashboardSidebar + DashboardHeader + AppFooter
    page.tsx                      # Dashboard home (/)
    attributes/
      page.tsx                    # Custom Attributes tool (/attributes)
    variables/
      page.tsx                    # Variables — Coming soon (/variables)
    components/
      page.tsx                    # Components — Coming soon (/components)
    settings/
      page.tsx                    # Settings — Coming soon (/settings)
  auth/
    done/page.tsx                 # OAuth success landing page
  layout.tsx                      # Root layout — Inter + Roboto Mono fonts, ThemeProvider (dark only)
  globals.css                     # Webflow design tokens (CSS variables), base styles
  api/
    auth/
      connect/route.ts            # GET → redirects to Webflow OAuth
      callback/route.ts           # GET → exchanges code for token, stores in LevelDB
      status/route.ts             # GET → { authenticated: boolean } (validates token against Webflow)
    sites/
      route.ts                    # GET → lists Webflow sites via SDK
      [siteId]/
        scripts/route.ts          # GET → list registered scripts; POST → register hosted script
        custom-code/route.ts      # GET → get applied scripts; PUT → apply/update scripts on site
    user/route.ts                 # GET → { user: { id, email, firstName, lastName } }

lib/
  auth-client/
    oauth.ts                      # getAuthorizeURL(), exchangeCodeForToken()
    client.ts                     # getWebflowClient() — builds WebflowClient from stored token
    scopes.ts                     # Webflow OAuth scope constants
  db/
    token-store.ts                # LevelDB singleton — storeToken / getToken / deleteToken
  attributes/
    schema.ts                     # Zod schemas for library/category/attribute data shapes
    index.ts                      # getAvailableLibraries(), loadLibrary() — lazy JSON loaders with in-memory cache
    libraries/                    # Static JSON definitions: finsweet-v1, finsweet-v2, memberstack
  message-bus.ts                  # postMessage protocol between extension iframe ↔ Next.js app
  query-keys.ts                   # React Query key factory — all query keys defined here
  utils.ts                        # cn() helper (clsx + tailwind-merge)

hooks/
  use-auth-query.ts               # Fetches /api/auth/status; exposes { authenticated, isLoading }
  use-sites-query.ts              # Fetches /api/sites when authenticated
  use-user-query.ts               # Fetches /api/user — user profile info
  use-site-scripts.ts             # useSiteScriptsQuery, useAddScript, useRemoveScript mutations
  use-notify.ts                   # Toast/notification helper
  use-mobile.ts                   # Breakpoint detection hook
  use-copy-to-clipboard.ts        # Clipboard hook with textarea fallback + isCopied state

store/                            # Zustand stores — UI state only, zero server state
  attributes-store.ts             # Element groups, search query, editing state, bulk mode toggles
  site-store.ts                   # Persisted selected siteId (localStorage via zustand/persist)
  templates-store.ts              # Selected library, category, and template panel state
  footer-store.ts                 # Footer visibility / expand state

components/
  ui/                             # shadcn/ui primitives — DO NOT edit directly
  dashboard/
    sidebar.tsx                   # Route-aware sidebar (usePathname for active state)
    header.tsx                    # Dynamic page title + icon based on current route
    content.tsx                   # Dashboard home — welcome message + sites list
    connect-button.tsx            # OAuth connect / connected state button
    sites-list.tsx                # Site cards with metadata (dates, timezone, status badge)
    footer.tsx                    # App footer with status indicators
    tool-layout.tsx               # Shared tool page wrapper with consistent padding
  attributes/
    attributes-list-panel.tsx     # Left panel — element tree with attribute groups
    attributes-manage-panel.tsx   # Right panel — add / edit / delete attributes on selected element
    templates/
      templates-panel.tsx         # Tab container for the Templates feature
      library-picker.tsx          # Library selector (Finsweet, Memberstack)
      category-list.tsx           # Category list within a selected library
      templates-list.tsx          # Attribute templates inside a category
      attribute-row.tsx           # Single attribute row with copy / apply action
      site-scripts-panel.tsx      # Shows registered scripts on current site; remove action
  query-provider.tsx              # TanStack React Query client provider (wraps entire app)
  theme-provider.tsx              # next-themes ThemeProvider (dark mode only)
```

---

### Tools

| Tool | Route | Status | Description |
| --- | --- | --- | --- |
| Custom Attributes | `/attributes` | ✅ Live | Manage custom HTML attributes on Webflow elements. Includes a **Templates** tab for browsing Finsweet and Memberstack attribute libraries, registering their scripts to your site, and applying pre-defined attribute sets to elements. |
| Variables | `/variables` | 🚧 Coming soon | — |
| Components | `/components` | 🚧 Coming soon | — |
| Settings | `/settings` | 🚧 Coming soon | — |

---

### Styling

- **Tailwind CSS v4** with no `tailwind.config` — all configuration is done in CSS
- **Webflow dark theme** exclusively — light mode has been removed
- **CSS variables** in `app/globals.css` map to Webflow's design tokens (colors, shadows, typography)
- **Typography**: Inter (11px / 12px, 16px line-height) + Roboto Mono (11px, for code)
- **No shadcn/ui source edits** — all overrides use CSS variable mapping or targeted `[data-slot]` selectors in `globals.css`
- Component variants use `class-variance-authority`; class merging uses `cn()` from `lib/utils.ts`
