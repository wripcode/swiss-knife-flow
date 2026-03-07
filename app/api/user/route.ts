import { NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/webflow/client";

/**
 * GET /api/user
 * Returns the currently authorized user's profile info from Webflow.
 */
export async function GET() {
    try {
        const client = await getWebflowClient();
        const user = await client.token.authorizedBy();
        
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        });
    } catch (error) {
        console.error("Failed to fetch Webflow user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user information" },
            { status: 401 }
        );
    }
}
