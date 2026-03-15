"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebflowAuth } from "@/hooks/use-webflow-auth";

/**
 * Button that initiates the Webflow OAuth flow or shows connection status
 */
export function ConnectWebflowButton() {
    const { authenticated, loading, connectUrl } = useWebflowAuth();

    if (loading) {
        return (
            <Button variant="outline" size="sm" disabled className="gap-1.5 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Checking…
            </Button>
        );
    }

    if (authenticated) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-[var(--wf-green-border)] border-[var(--wf-green-border)]/30 hover:bg-[var(--wf-green-bg)]"
                disabled
            >
                <Check className="size-3.5" />
                Connected to Webflow
            </Button>
        );
    }

    return (
        <Button asChild size="sm" className="gap-1.5">
            <a href={connectUrl} target="_blank" rel="noreferrer">
                Connect with Webflow
            </a>
        </Button>
    );
}

