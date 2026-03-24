import { WebflowClient } from "webflow-api";
import { getToken } from "@/lib/db/token-store";

/**
 * Get an authenticated Webflow client using the stored access token.
 * Throws if no token is stored (user not authenticated).
 */
export async function getWebflowClient(): Promise<WebflowClient> {
    const accessToken = await getToken();

    if (!accessToken) {
        throw new Error("Not authenticated. Please connect with Webflow first.");
    }

    return new WebflowClient({ accessToken });
}
