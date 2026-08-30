import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GitBranch, Clock } from "lucide-react";
import { useReport } from "@/lib/depdrift/useReport";

export function TopHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const report = useReport();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 md:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/" className="font-mono text-sm font-semibold">
              DepDrift
            </Link>
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border px-5 py-2 font-mono text-[11px] text-muted-foreground md:px-8">
        <span className="text-foreground">{report.repository.name}</span>
        <span className="truncate">{report.repository.source}</span>
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3" /> {report.repository.branch}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" /> {new Date(report.repository.scannedAt).toLocaleString()}
        </span>
        <span className="ml-auto hidden sm:inline">depdrift v{report.version}</span>
      </div>
    </header>
  );
}
