import { WebflowClient } from "webflow-api";
import { WEBFLOW_SCOPES } from "./scopes";

const WEBFLOW_CLIENT_ID = process.env.WEBFLOW_CLIENT_ID!;
const WEBFLOW_CLIENT_SECRET = process.env.WEBFLOW_CLIENT_SECRET!;

// Define the permissions your app needs
// See https://developers.webflow.com/v2.0.0/data/reference/scopes
const DEFAULT_SCOPES = [...WEBFLOW_SCOPES];

/**
 * Build the Webflow OAuth authorization URL
 */
export function getAuthorizeURL(scopes: string[] = DEFAULT_SCOPES): string {
    return WebflowClient.authorizeURL({
        scope: scopes as Parameters<typeof WebflowClient.authorizeURL>[0]["scope"],
        clientId: WEBFLOW_CLIENT_ID,
        state: Math.random().toString(36).substring(7),
    });
}

/**
 * Exchange an authorization code for an access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
    const token = await WebflowClient.getAccessToken({
        clientId: WEBFLOW_CLIENT_ID,
        clientSecret: WEBFLOW_CLIENT_SECRET,
        code,
    });

    return token;
}
