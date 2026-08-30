import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, GitCommitHorizontal, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepDriftReport, HistoryCommit } from "@/lib/depdrift/types";
import { SeverityBadge } from "./SeverityBadge";

export function DriftTimeline({ report }: { report: DepDriftReport }) {
  const [active, setActive] = useState<HistoryCommit | null>(null);

  return (
    <section className="rounded-lg border border-border bg-panel shadow-panel">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <History className="size-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Drift Timeline</h2>
          <p className="text-xs text-muted-foreground">
            Historical dependency changes across the scanned branch
          </p>
        </div>
        <Link
          to="/history"
          className="ml-auto rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          Full git history
        </Link>
      </div>

      <div className="overflow-x-auto px-4 py-5">
        <div className="flex min-w-max items-stretch gap-0">
          {report.history.map((c, i) => (
            <div key={c.hash} className="flex items-stretch">
              <button
                type="button"
                onClick={() => setActive(active?.hash === c.hash ? null : c)}
                className={cn(
                  "w-[190px] rounded-lg border bg-background p-3 text-left transition-colors",
                  c.driftIntroduced ? "border-high/40" : "border-border",
                  active?.hash === c.hash && "border-primary/70 shadow-glow",
                )}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <GitCommitHorizontal
                    className={cn(
                      "size-3.5",
                      c.driftIntroduced ? "text-high" : "text-muted-foreground",
                    )}
                  />
                  {c.hash}
                  {c.severity && <SeverityBadge severity={c.severity} className="ml-auto" />}
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">{c.date}</div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-secondary-foreground">
                  {c.dependencyChange}
                </p>
                {c.driftIntroduced && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-high">
                    <AlertTriangle className="size-3" /> drift introduced
                  </div>
                )}
              </button>
              {i < report.history.length - 1 && (
                <div className="flex w-8 items-center">
                  <div className="h-px w-full bg-border-strong" />
                </div>
              )}
            </div>
          ))}
          <div className="flex w-8 items-center">
            <div className="h-px w-full bg-border-strong" />
          </div>
          <div className="flex w-[120px] items-center justify-center rounded-lg border border-primary/50 bg-panel-raised font-mono text-xs text-primary">
            Current
          </div>
        </div>
      </div>

      {active && (
        <div className="animate-fade-up border-t border-border bg-panel-raised/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-primary">
              {active.hash}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{active.date}</span>
            {active.author && (
              <span className="font-mono text-xs text-muted-foreground">{active.author}</span>
            )}
            {active.message && <span className="text-xs">{active.message}</span>}
          </div>
          <p className="mt-2 text-xs text-secondary-foreground">{active.dependencyChange}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(active.files ?? []).map((f) => (
              <span
                key={f}
                className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(active.findingIds ?? []).map((id) => {
              const f = report.findings.find((x) => x.id === id);
              if (!f) return null;
              return (
                <Link
                  key={id}
                  to="/findings/$findingId"
                  params={{ findingId: id }}
                  className="inline-flex items-center gap-2 rounded border border-border bg-background px-2 py-1 font-mono text-[11px] transition-colors hover:border-border-strong"
                >
                  <SeverityBadge severity={f.severity} />
                  {f.dependency}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
