"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * Button that initiates the OAuth flow or shows connection status
 */
export function ConnectButton() {
    const { authenticated, loading, connectUrl } = useAuth();

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
                variant="default"
                size="sm"
                className="gap-1.5"
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

