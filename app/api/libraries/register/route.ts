import { NextResponse } from "next/server";
import { getWebflowClient } from "@/lib/auth-client/client";
import { loadLibrary } from "@/lib/attributes";
import { z } from "zod";

const requestSchema = z.object({
  siteId: z.string(),
  libraryId: z.string(),
});

/**
 * POST /api/libraries/register
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, libraryId } = requestSchema.parse(body);

    // 1. Load the library definition with its hosted script info 
    const library = await loadLibrary(libraryId);
    
    if (!library.script) {
      return NextResponse.json(
        { error: "No script associated with this library" },
        { status: 400 }
      );
    }

    // 2. Register the script to the site via Webflow Data API
    const webflow = await getWebflowClient();
    
    const registeredScript = await webflow.scripts.registerHosted(siteId, {
      hostedLocation: library.script.hostedLocation,
      integrityHash: library.script.integrityHash || "",
      version: library.script.version,
      displayName: library.script.displayName,
      canCopy: true,
    });

    return NextResponse.json({
      success: true,
      data: registeredScript,
    });
  } catch (error: any) {
    console.error("Library Registration Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }

    const message = error.message || "Failed to register library";
    
    // Handle auth errors
    if (message.includes("Not authenticated")) {
        return NextResponse.json(
            { error: "Not authenticated", message: "Please connect with Webflow first" },
            { status: 401 }
        );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
