import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/webflow/oauth";
import { storeToken } from "@/lib/db/token-store";

/**
 * GET /api/auth/callback
 * Handles the OAuth callback from Webflow.
 * Exchanges the authorization code for an access token and stores it.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors from Webflow
    if (error) {
        console.error("OAuth Error:", error, errorDescription);
        return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, request.url)
        );
    }

    // No code means something went wrong
    if (!code) {
        return NextResponse.redirect(
            new URL("/?error=No+authorization+code+received", request.url)
        );
    }

    try {
        // Exchange the authorization code for an access token
        const token = await exchangeCodeForToken(code);

        // Store the token
        await storeToken(token);

        if (process.env.NODE_ENV === "development") {
            console.log("\n✅ Webflow Access Token Received\n");
        }

        // Redirect to dashboard with success indicator
        return NextResponse.redirect(new URL("/?authorized=true", request.url));
    } catch (err) {
        console.error("Auth callback error:", err);
        return NextResponse.redirect(
            new URL("/?error=Authentication+failed", request.url)
        );
    }
}
