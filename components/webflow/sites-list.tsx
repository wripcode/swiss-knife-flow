"use client";

import {
    Globe,
    RefreshCcw,
    Loader2,
    ExternalLink,
    Calendar,
    Clock,
    Upload,
    LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-sites";
import { useWebflowAuth } from "@/hooks/use-webflow-auth";
import { ConnectWebflowButton } from "@/components/webflow/connect-button";

function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateStr));
}

function SiteCard({ site }: { site: {
    id: string;
    displayName: string;
    shortName: string;
    previewUrl?: string;
    timeZone?: string;
    createdOn?: string;
    lastUpdated?: string;
    lastPublished?: string;
} }) {
    const domain = site.shortName ? `${site.shortName}.webflow.io` : null;

    return (
        <div className="group flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-accent/40">
            {/* Top row: icon + name + external link */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Globe className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">
                            {site.displayName || site.shortName || site.id}
                        </p>
                        {domain && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {domain}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {site.lastPublished ? (
                        <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5 rounded-sm font-normal bg-primary/10 text-primary border-0"
                        >
                            Published
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5 rounded-sm font-normal bg-muted text-muted-foreground border-0"
                        >
                            Draft
                        </Badge>
                    )}
                    {site.shortName && (
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <a href={`https://${site.shortName}.webflow.io`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="size-3.5" />
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Meta grid — 2 columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {site.createdOn && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="size-3 shrink-0" />
                        Created {formatDate(site.createdOn)}
                    </span>
                )}
                {site.lastUpdated && (
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-3 shrink-0" />
                        Updated {formatDate(site.lastUpdated)}
                    </span>
                )}
                {site.lastPublished && (
                    <span className="flex items-center gap-1.5">
                        <Upload className="size-3 shrink-0" />
                        Published {formatDate(site.lastPublished)}
                    </span>
                )}
                {site.timeZone && (
                    <span className="flex items-center gap-1.5">
                        <LinkIcon className="size-3 shrink-0" />
                        {site.timeZone}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Displays a list of connected Webflow sites, or a prompt to connect.
 */
export function SitesList() {
    const { authenticated, loading: authLoading, connectUrl } = useWebflowAuth();
    const { sites, loading: sitesLoading, error, refresh } = useSites(authenticated);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 gap-4">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="size-5 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Connect your Webflow account</p>
                    <p className="text-xs text-muted-foreground">
                        Link your account to manage your sites and tools.
                    </p>
                </div>
                <ConnectWebflowButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">Your Sites</h2>
                    {!sitesLoading && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                            {sites.length}
                        </span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={refresh}
                    disabled={sitesLoading}
                >
                    <RefreshCcw className={`size-3.5 ${sitesLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Loading */}
            {sitesLoading && (
                <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading sites…</span>
                </div>
            )}

            {/* Error */}
            {error && !sitesLoading && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCcw className="size-3.5 mr-1.5" />
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty */}
            {!sitesLoading && !error && sites.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No sites found in your Webflow account.
                </p>
            )}

            {/* Site cards */}
            {!sitesLoading && !error && sites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {sites.map((site) => (
                        <SiteCard key={site.id} site={site} />
                    ))}
                </div>
            )}
        </div>
    );
}
