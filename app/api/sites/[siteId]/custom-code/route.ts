import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (client, _req, params) => {
  const result = await client.sites.scripts.getCustomCode(params.siteId);
  return NextResponse.json({ data: result });
});

export const PUT = withAuth(async (client, req, params) => {
  const body = await req.json();
  const result = await client.sites.scripts.upsertCustomCode(params.siteId, {
    scripts: body.scripts,
  });
  return NextResponse.json({ data: result });
});
