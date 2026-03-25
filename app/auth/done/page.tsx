"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

/**
 * Landed here after a successful Webflow OAuth exchange.
 * Signals the opener via localStorage, then closes this tab so the user
 * returns to the Webflow Designer context.
 */
export default function AuthDonePage() {
    useEffect(() => {
        localStorage.setItem("auth_complete", Date.now().toString());
        try {
            const bc = new BroadcastChannel("auth_channel");
            bc.postMessage("auth_complete");
            bc.close();
        } catch {}
        window.close();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Connected to Webflow</p>
                <p className="text-xs text-muted-foreground">
                    You can close this tab.
                </p>
            </div>
        </div>
    );
}
