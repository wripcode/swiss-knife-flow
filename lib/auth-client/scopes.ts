/**
 * Webflow Site-level Scopes
 */

export const WEBFLOW_SCOPES = [
  "assets:read",
  "assets:write",
  "authorized_user:read",
  "cms:read",
  "cms:write",
  "comments:read",
  "comments:write",
  "components:read",
  "components:write",
  "custom_code:read",
  "custom_code:write",
  "ecommerce:read",
  "ecommerce:write",
  "forms:read",
  "forms:write",
  "pages:read",
  "pages:write",
  "sites:read",
  "sites:write",
  "site_activity:read",
  "site_config:read",
  "site_config:write",
  "users:read",
  "users:write",
] as const;

export type WebflowScope = (typeof WEBFLOW_SCOPES)[number];
