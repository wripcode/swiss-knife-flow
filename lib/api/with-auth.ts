import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";
import { getToken, deleteToken } from "@/lib/db/token-store";

type AuthedHandler = (
  client: WebflowClient,
  req: NextRequest,
  params: Record<string, string>
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with Webflow auth. Handles missing/invalid tokens
 * uniformly so individual routes don't implement 401 logic themselves.
 */
export function withAuth(handler: AuthedHandler) {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated", message: "Please connect with Webflow first" },
        { status: 401 }
      );
    }

    try {
      const client = new WebflowClient({ accessToken: token });
      const params = context?.params ? await context.params : {};
      return await handler(client, req, params);
    } catch (error: unknown) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : null;

      if (statusCode === 401) {
        await deleteToken().catch(() => {});
        return NextResponse.json(
          { error: "Not authenticated", message: "Session expired. Please reconnect with Webflow." },
          { status: 401 }
        );
      }

      const message = error instanceof Error ? error.message : "Internal server error";
      console.error("[withAuth] Unhandled API error:", error);
      return NextResponse.json({ error: "Server error", message }, { status: 500 });
    }
  };
}
