import { NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/auth-client/client";
import { deleteToken } from "@/lib/db/token-store";

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
    } catch (error: unknown) {
        console.error("Failed to fetch Webflow user:", error);

        const statusCode =
            error && typeof error === "object" && "statusCode" in error
                ? (error as { statusCode: number }).statusCode
                : null;

        if (statusCode === 401) {
            await deleteToken().catch(() => {});
        }

        return NextResponse.json(
            { error: "Failed to fetch user information" },
            { status: 401 }
        );
    }
}

