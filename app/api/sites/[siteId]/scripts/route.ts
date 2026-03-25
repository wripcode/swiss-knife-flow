import { NextRequest, NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/auth-client/client";

type RouteParams = { params: Promise<{ siteId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { siteId } = await params;
  try {
    const webflow = await getWebflowClient();
    const result = await webflow.scripts.list(siteId);
    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list scripts";
    return NextResponse.json({ error: "Server error", message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { siteId } = await params;
  try {
    const body = await req.json();
    console.log(`[API] Registering script for site ${siteId}:`, body);
    
    const webflow = await getWebflowClient();
    const result = await webflow.scripts.registerHosted(siteId, {
      hostedLocation: body.hostedLocation,
      integrityHash: body.integrityHash || "",
      canCopy: body.canCopy ?? true,
      version: body.version,
      displayName: body.displayName,
    });
    
    console.log(`[API] Script registered successfully:`, result);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    console.error(`[API] Script registration failed for site ${siteId}:`, {
      message: error.message,
      body: error.body,
      status: error.status,
    });
    const message = error instanceof Error ? error.message : "Failed to register script";
    return NextResponse.json({ error: "Server error", message, details: error.body || error }, { status: 500 });
  }
}
