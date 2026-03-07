import { Level } from "level";
import path from "path";

// Singleton promise — ensures the DB is opened exactly once,
// even when multiple API routes call getDb() concurrently.
let dbPromise: Promise<Level<string, string>> | null = null;

function getDb(): Promise<Level<string, string>> {
    if (!dbPromise) {
        dbPromise = (async () => {
            const dbPath = path.join(process.cwd(), "data");
            const db = new Level<string, string>(dbPath, { valueEncoding: "json" });
            await db.open();
            return db;
        })();
    }
    return dbPromise;
}

const TOKEN_KEY = "webflow_token";

/**
 * Store the Webflow access token
 */
export async function storeToken(token: string): Promise<void> {
    const store = await getDb();
    await store.put(TOKEN_KEY, token);
}

/**
 * Retrieve the stored Webflow access token.
 * Returns null if no token is stored.
 */
export async function getToken(): Promise<string | null> {
    try {
        const store = await getDb();
        return await store.get(TOKEN_KEY);
    } catch (error: unknown) {
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
        const store = await getDb();
        await store.del(TOKEN_KEY);
    } catch (error: unknown) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "LEVEL_NOT_FOUND"
        ) {
            return; // Key didn't exist, nothing to delete
        }
        throw error;
    }
}
