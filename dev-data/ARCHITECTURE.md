# Architecture — Swiss Knife Flow

This document explains the non-obvious parts of how Swiss Knife Flow is put together. The directory layout itself follows standard Next.js App Router conventions, so this doc focuses on what _isn't_ immediately obvious from reading the files.

---

## Two-Package Monorepo

```
swiss-knife-flow/          ← root — Next.js 16 app (dashboard + API + OAuth)
extension/                 ← separate Vite + React package (Webflow Designer Extension)
```

These are **two completely different runtimes** managed by pnpm workspaces:

| | Root (Next.js) | `extension/` (Vite) |
|---|---|---|
| Runs on | Node.js / Vercel Edge | Browser (iframe inside Webflow Designer) |
| URL | `localhost:3000` (dev) | `localhost:1337` (dev) |
| Build output | Vercel serverless functions | Static bundle served by Webflow |
| Auth access | Yes — reads/writes LevelDB token | No — makes no direct API calls |
| Webflow Data API | Yes — via `webflow-api` SDK | No |
| Webflow Designer API | No | Yes — via `webflow.extensions.*` globals |

The boundary between them is enforced physically by the package split, not just by convention. You cannot call the Designer API from the Next.js app, and the extension iframe has no access to the stored OAuth token.

---

## The postMessage Bridge (`lib/message-bus.ts`)

This is the most architecturally important file in the repo and is currently the only way the two runtimes communicate.

```
Webflow Designer
  └── Extension iframe (localhost:1337)
        ├── extension/src/App.tsx          — listens for USER actions
        ├── extension/src/message-router.ts — routes incoming messages to Designer API calls
        └── ↕ postMessage (typed via lib/message-bus.ts)
              └── Next.js dashboard (localhost:3000, embedded as iframe inside extension)
                    ├── lib/message-bus.ts  — postToExtension(), onExtensionMessage()
                    └── store/attributes-store.ts — calls postToExtension() to trigger Designer actions
```

### Message flow — example: "save an attribute"

1. User edits an attribute in the Next.js dashboard UI
2. `useAttributesStore.saveAttribute()` calls `postToExtension("SET_ATTRIBUTE", { name, value, elementId })`
3. `lib/message-bus.ts → postToExtension` sends `window.parent.postMessage(...)` to the extension iframe
4. `extension/src/message-router.ts` receives the message, validates it, and calls `webflow.setElementAttribute(elementId, name, value)` via the Webflow Designer API
5. Webflow Designer applies the change to the selected element

### Message types

Defined as a discriminated union in `lib/message-bus.ts`:

| Type | Direction | Purpose |
|---|---|---|
| `GET_ATTRIBUTES` | Next.js → Extension | Request attributes for currently selected element |
| `SET_ATTRIBUTE` | Next.js → Extension | Set a single attribute on an element |
| `REMOVE_ATTRIBUTE` | Next.js → Extension | Remove a single attribute from an element |
| `SELECT_ELEMENT` | Next.js → Extension | Tell Designer to select a specific element |
| `ATTRIBUTES_UPDATED` | Extension → Next.js | Push updated attribute data to the dashboard |
| `ELEMENT_DESELECTED` | Extension → Next.js | Notify dashboard that selection was cleared |
| `NOTIFY` | Next.js → Extension | Show a toast notification inside the Designer |

**Security note:** `postToExtension` currently sends to `"*"` as the target origin. This is acceptable for local development where the extension iframe is served from a known localhost port, but should be tightened to a specific origin if this is ever deployed to a shared environment.

---

## OAuth + Token Storage Flow

```
User clicks "Connect with Webflow"
  → GET /api/auth/connect
    → redirect to Webflow OAuth (getAuthorizeURL())
      → Webflow redirects to GET /api/auth/callback?code=...
        → exchangeCodeForToken(code) calls Webflow token endpoint
          → storeToken(token) writes to LevelDB at ./data
            → redirect to /auth/done
```

The stored token is a long-lived Webflow access token. It is:
- Read by `getWebflowClient()` in `lib/auth-client/client.ts` before every API call
- Validated against Webflow on every `GET /api/auth/status` call (stale tokens are auto-deleted)

**API Route Security (`withAuth`)**: Every API route that calls Webflow APIs must be wrapped in `withAuth` from `lib/api/with-auth.ts`. This centralized wrapper ensures that any 401 Unauthorized error from Webflow immediately deletes the stale token and returns a standardized JSON error format.

**LevelDB (`lib/db/token-store.ts`):** A three-function wrapper (`storeToken`, `getToken`, `deleteToken`) around a single LevelDB instance. The singleton pattern ensures the database file is opened exactly once, even across concurrent serverless function invocations. No schema, no relations — it's a single key-value store.

---

## State Architecture

```
Server state (async, remote)  →  TanStack React Query
UI state (sync, local)        →  Zustand
```

No exceptions. Zustand stores hold zero server state.

### React Query

| Hook | Endpoint | staleTime |
|---|---|---|
| `useAuthQuery` | `GET /api/auth/status` | 30s |
| `useUserQuery` | `GET /api/user` | 10min |
| `useSitesQuery` | `GET /api/sites` | 2min |
| `useSiteScriptsQuery` | `GET /api/sites/:id/custom-code` | 30s |

**Reactive Auth & Global Interceptors**: Because `refetchOnWindowFocus` doesn't fire inside the Webflow Designer iframe, auth freshness is reactive. All API fetchers throw an `ApiError` (`lib/api-error.ts`) which preserves HTTP status codes. The global `QueryCache` and `MutationCache` `onError` handlers in `components/query-provider.tsx` intercept any 401 status and instantly invalidate the auth query, forcing the UI back to the connect prompt without polling.

All query keys are defined in `lib/query-keys.ts`. Never hardcode a raw array key.

### Zustand Stores

| Store | What it holds |
|---|---|
| `site-store.ts` | Selected `siteId` — persisted to localStorage via `zustand/persist` |
| `attributes-store.ts` | Element groups from Designer, search query, editing state, bulk mode toggles |
| `templates-store.ts` | Selected library, category, and template panel UI state |
| `footer-store.ts` | Footer expand/collapse state |

---

## Attributes Tool — Templates Feature

The Templates tab (inside the Custom Attributes tool at `/attributes`) is the most complex feature in the codebase and currently has no documentation in the README. Here is how it works:

```
lib/attributes/libraries/*.json    ← static definitions: attribute schemas per category
lib/attributes/schema.ts           ← Zod schemas that validate the JSON at load time
lib/attributes/index.ts            ← getAvailableLibraries() + loadLibrary(id) with in-memory cache
  ↓
components/attributes/templates/   ← UI layer
  library-picker.tsx               ← Select Finsweet or Memberstack
  category-list.tsx                ← Browse categories within the library
  templates-list.tsx               ← Browse attributes in a category
  attribute-row.tsx                ← Copy or apply a single attribute to the selected element
  site-scripts-panel.tsx           ← View / remove scripts registered on the current site
  ↓
hooks/use-site-scripts.ts          ← useAddScript mutation: registers script via /api/sites/:id/scripts,
                                      then applies it via /api/sites/:id/custom-code
```

**Script registration two-step:** Adding a library script to a site requires two separate Webflow API operations:
1. **Register** — tells Webflow about the hosted script file (`POST /api/sites/:id/scripts` → `webflow.scripts.registerHosted`)
2. **Apply** — links the registered script ID to the site's custom code slot (`PUT /api/sites/:id/custom-code` → `webflow.sites.updateCustomCode`)

`useAddScript` in `hooks/use-site-scripts.ts` handles both steps in sequence, with a guard to skip re-registration if the script is already registered.

---

## Adding a New Tool

1. Create the page: `app/(app)/your-tool/page.tsx`
2. Add it to the sidebar: `toolItems` in `components/dashboard/sidebar.tsx`
3. Add it to the header title map: `pageMap` in `components/dashboard/header.tsx`
4. If the tool needs Designer API access, add the relevant message types to `lib/message-bus.ts` and handle them in `extension/src/message-router.ts`
