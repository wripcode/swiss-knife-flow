import { NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/webflow/client";

/**
 * GET /api/sites
 * Lists all Webflow sites accessible to the authenticated user.
 */
export async function GET() {
    try {
        const webflow = await getWebflowClient();
        const sites = await webflow.sites.list();

        return NextResponse.json({ data: sites });
    } catch (error: unknown) {
        console.error("Sites API Error:", error);

        const message =
            error instanceof Error ? error.message : "Failed to fetch sites";

        // Handle authentication errors
        if (message.includes("Not authenticated")) {
            return NextResponse.json(
                { error: "Not authenticated", message: "Please connect with Webflow first" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Server error", message },
            { status: 500 }
        );
    }
}
