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
    Copy,
    Check,
    ChevronDown,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-sites";
import { useAuth } from "@/hooks/use-auth";
import { ConnectButton } from "@/components/dashboard/connect-button";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

function formatDate(dateStr?: string) {
    if (!dateStr) return null;
    return dateFormatter.format(new Date(dateStr));
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const done = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        };

        try {
            const el = document.createElement("textarea");
            el.value = value;
            el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
            document.body.appendChild(el);
            el.focus();
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            done();
        } catch {
            navigator.clipboard?.writeText(value).then(done).catch(() => {});
        }
    }, [value]);

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            title="Copy to clipboard"
        >
            {copied
                ? <Check className="size-3 text-primary" />
                : <Copy className="size-3" />
            }
        </button>
    );
}

function SiteCard({ site, isActive }: {
    site: {
        id: string;
        displayName: string;
        shortName: string;
        previewUrl?: string;
        timeZone?: string;
        createdOn?: string;
        lastUpdated?: string;
        lastPublished?: string;
    };
    isActive?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const domain = site.shortName ? `${site.shortName}.webflow.io` : null;

    return (
        <div className={`group rounded-md border bg-card transition-colors hover:bg-accent/40 ${
            isActive ? "border-primary/50 bg-primary/5" : "border-border"
        }`}>
            {/* Compact row — always visible */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center gap-2 p-2 text-left"
            >
                <div className={`size-6 rounded flex items-center justify-center shrink-0 ${
                    isActive ? "bg-primary/20" : "bg-primary/10"
                }`}>
                    <Globe className="size-3 text-primary" />
                </div>

                <p className="text-[11px] font-medium text-foreground truncate min-w-0 flex-1">
                    {site.displayName || site.shortName || site.id}
                </p>

                {isActive && (
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 rounded-sm font-normal bg-secondary border-0 shrink-0"
                    >
                        current site
                    </Badge>
                )}

                {site.lastPublished ? (
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 rounded-sm font-normal bg-primary border-0 shrink-0"
                    >
                        Published
                    </Badge>
                ) : (
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 rounded-sm font-normal bg-muted text-muted-foreground border-0 shrink-0"
                    >
                        Draft
                    </Badge>
                )}

                <ChevronDown className={`size-3 text-muted-foreground shrink-0 transition-transform ${
                    expanded ? "rotate-180" : ""
                }`} />
            </button>

            {/* Expandable details */}
            {expanded && (
                <div className="border-t border-border px-2 pb-2 pt-1.5 flex flex-col gap-1.5">
                    {/* Site ID */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <span className="shrink-0">ID:</span>
                        <span className="truncate opacity-60">{site.id}</span>
                        <CopyButton value={site.id} />
                    </div>

                    {/* Domain */}
                    {domain && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <LinkIcon className="size-3 shrink-0" />
                            <span className="truncate">{domain}</span>
                            {site.shortName && (
                                <a
                                    href={`https://${site.shortName}.webflow.io`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="size-3" />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {site.createdOn && (
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3 shrink-0" />
                                {formatDate(site.createdOn)}
                            </span>
                        )}
                        {site.lastUpdated && (
                            <span className="flex items-center gap-1">
                                <Clock className="size-3 shrink-0" />
                                {formatDate(site.lastUpdated)}
                            </span>
                        )}
                        {site.lastPublished && (
                            <span className="flex items-center gap-1">
                                <Upload className="size-3 shrink-0" />
                                {formatDate(site.lastPublished)}
                            </span>
                        )}
                        {site.timeZone && (
                            <span className="flex items-center gap-1">
                                <Globe className="size-3 shrink-0" />
                                {site.timeZone}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function SitesList() {
    const { authenticated, loading: authLoading } = useAuth();
    const { sites, loading: sitesLoading, error, refresh } = useSites(authenticated);
    const searchParams = useSearchParams();
    const activeSiteId = searchParams.get("siteId");

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
                    <p className="text-xs font-medium">Connect your Webflow account</p>
                    <p className="text-xs text-muted-foreground">
                        Link your account to manage your sites and tools.
                    </p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-foreground">Site List</h2>
                    {!sitesLoading && (
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
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

            {sitesLoading && (
                <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-xs">Loading sites…</span>
                </div>
            )}

            {error && !sitesLoading && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-xs text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCcw className="size-3.5 mr-1.5" />
                        Retry
                    </Button>
                </div>
            )}

            {!sitesLoading && !error && sites.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                    No sites found in your Webflow account.
                </p>
            )}

            {!sitesLoading && !error && sites.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    {[...sites]
                        .sort((a, b) => (a.id === activeSiteId ? -1 : b.id === activeSiteId ? 1 : 0))
                        .map((site) => (
                            <SiteCard
                                key={site.id}
                                site={site}
                                isActive={!!activeSiteId && site.id === activeSiteId}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

