import { NextResponse } from "next/server";
import { getAuthorizeURL } from "@/lib/auth-client/oauth";

/**
 * GET /api/auth/webflow
 * Redirects user to Webflow's OAuth authorization page
 */
export async function GET() {
    const clientId = process.env.WEBFLOW_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: "WEBFLOW_CLIENT_ID not configured" },
            { status: 500 }
        );
    }

    const authorizeURL = getAuthorizeURL();
    return NextResponse.redirect(authorizeURL);
}
