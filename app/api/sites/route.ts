import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

/**
 * GET /api/sites
 * Lists all Webflow sites accessible to the authenticated user.
 */
export const GET = withAuth(async (client) => {
  const sites = await client.sites.list();
  return NextResponse.json({ data: sites });
});
