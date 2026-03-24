import { NextRequest, NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/auth-client/client";

type RouteParams = { params: Promise<{ siteId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { siteId } = await params;
  try {
    const webflow = await getWebflowClient();
    const result = await webflow.sites.scripts.getCustomCode(siteId);
    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get custom code";
    return NextResponse.json({ error: "Server error", message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { siteId } = await params;
  try {
    const body = await req.json();
    const webflow = await getWebflowClient();
    const result = await webflow.sites.scripts.upsertCustomCode(siteId, {
      scripts: body.scripts,
    });
    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to apply custom code";
    return NextResponse.json({ error: "Server error", message }, { status: 500 });
  }
}
