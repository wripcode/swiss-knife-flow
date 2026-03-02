import { NextResponse } from "next/server";
import { getToken } from "@/lib/db/token-store";

/**
 * GET /api/auth/status
 * Returns the current authentication status.
 */
export async function GET() {
    try {
        const token = await getToken();
        return NextResponse.json({
            authenticated: !!token,
        });
    } catch (error) {
        console.error("Auth status check error:", error);
        return NextResponse.json({
            authenticated: false,
        });
    }
}
