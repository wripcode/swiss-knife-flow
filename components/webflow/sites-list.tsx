"use client";

import { Globe, RefreshCcw, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-sites";
import { useWebflowAuth } from "@/hooks/use-webflow-auth";

/**
 * Displays a list of connected Webflow sites, or a prompt to connect.
 */
export function SitesList() {
    const { authenticated, loading: authLoading } = useWebflowAuth();
    const { sites, loading: sitesLoading, error, refresh } = useSites(authenticated);

    if (authLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!authenticated) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                    <Globe className="size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground text-center">
                        Connect your Webflow account to see your sites
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (sitesLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base font-semibold">Your Webflow Sites</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading sites…</span>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base font-semibold">Your Webflow Sites</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={refresh} className="gap-1.5">
                        <RefreshCcw className="size-3.5" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">
                    Your Webflow Sites
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {sites.length}
                    </Badge>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={refresh} className="size-8">
                    <RefreshCcw className="size-3.5" />
                </Button>
            </CardHeader>
            <CardContent>
                {sites.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        No sites found in your Webflow account
                    </p>
                ) : (
                    <div className="space-y-2">
                        {sites.map((site) => (
                            <div
                                key={site.id}
                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-8 rounded-md bg-[#4353FF]/10 flex items-center justify-center shrink-0">
                                        <Globe className="size-4 text-[#4353FF]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {site.displayName || site.shortName || site.id}
                                        </p>
                                        {site.shortName && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {site.shortName}.webflow.io
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {site.previewUrl && (
                                    <Button variant="ghost" size="icon" asChild className="size-7 shrink-0">
                                        <a href={site.previewUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="size-3.5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
