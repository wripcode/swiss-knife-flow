import { Level } from "level";
import path from "path";

// LevelDB instance for storing tokens
// Data directory lives at project root /data
let db: Level<string, string> | null = null;

function getDb(): Level<string, string> {
    if (!db) {
        const dbPath = path.join(process.cwd(), "data");
        db = new Level(dbPath, { valueEncoding: "json" });
    }
    return db;
}

const TOKEN_KEY = "webflow_token";

/**
 * Store the Webflow access token
 */
export async function storeToken(token: string): Promise<void> {
    const store = getDb();
    await store.put(TOKEN_KEY, token);
}

/**
 * Retrieve the stored Webflow access token
 * Returns null if no token is stored
 */
export async function getToken(): Promise<string | null> {
    try {
        const store = getDb();
        const token = await store.get(TOKEN_KEY);
        return token;
    } catch (error: unknown) {
        // LevelDB throws LEVEL_NOT_FOUND when key doesn't exist
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "LEVEL_NOT_FOUND"
        ) {
            return null;
        }
        throw error;
    }
}

/**
 * Delete the stored token (for logout/disconnect)
 */
export async function deleteToken(): Promise<void> {
    try {
        const store = getDb();
        await store.del(TOKEN_KEY);
    } catch (error: unknown) {
        // Ignore if key doesn't exist
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "LEVEL_NOT_FOUND"
        ) {
            return;
        }
        throw error;
    }
}
