import { NextResponse } from "next/server";
import { getToken, deleteToken } from "@/lib/db/token-store";
import { WebflowClient } from "webflow-api";

/**
 * GET /api/auth/status
 * Validates the stored token against Webflow before reporting authenticated.
 * A locally-stored token can be stale (e.g. app access removed in Webflow),
 * so we do a lightweight ping and purge the token if Webflow rejects it.
 */
export async function GET() {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json({ authenticated: false });
        }

        const client = new WebflowClient({ accessToken: token });
        await client.token.authorizedBy();

        return NextResponse.json({ authenticated: true });
    } catch (error: unknown) {
        const statusCode =
            error && typeof error === "object" && "statusCode" in error
                ? (error as { statusCode: number }).statusCode
                : null;

        if (statusCode === 401) {
            await deleteToken().catch(() => {});
            return NextResponse.json({ authenticated: false });
        }

        console.error("Auth status check error:", error);
        return NextResponse.json({ authenticated: false });
    }
}
