"use client";

import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ToolLayout({
  title,
  description,
  headerRight,
  children,
  className,
}: ToolLayoutProps) {
  return (
    <div className={`w-full overflow-hidden p-4 h-full flex flex-col ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
        {headerRight && <div className="shrink-0 ml-4">{headerRight}</div>}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
