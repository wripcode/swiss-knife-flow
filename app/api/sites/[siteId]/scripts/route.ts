import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (client, _req, params) => {
  const result = await client.scripts.list(params.siteId);
  return NextResponse.json({ data: result });
});

export const POST = withAuth(async (client, req, params) => {
  const body = await req.json();
  const result = await client.scripts.registerHosted(params.siteId, {
    hostedLocation: body.hostedLocation,
    integrityHash: body.integrityHash || "",
    canCopy: body.canCopy ?? true,
    version: body.version,
    displayName: body.displayName,
  });
  return NextResponse.json({ data: result }, { status: 201 });
});
