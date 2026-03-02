"use client";

import { ExternalLink, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebflowAuth } from "@/hooks/use-webflow-auth";

/**
 * Button that initiates the Webflow OAuth flow or shows connection status
 */
export function ConnectWebflowButton() {
    const { authenticated, loading, connectUrl } = useWebflowAuth();

    if (loading) {
        return (
            <Button variant="outline" size="sm" disabled className="gap-2">
                <Loader2 className="size-4 animate-spin" />
                Checking…
            </Button>
        );
    }

    if (authenticated) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                disabled
            >
                <Check className="size-4" />
                Connected to Webflow
            </Button>
        );
    }

    return (
        <Button
            asChild
            size="sm"
            className="gap-2 bg-[#4353FF] hover:bg-[#3644DD] text-white"
        >
            <a href={connectUrl}>
                <ExternalLink className="size-4" />
                Connect with Webflow
            </a>
        </Button>
    );
}
