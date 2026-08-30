import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, GitCommitHorizontal, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepDriftReport, HistoryCommit } from "@/lib/depdrift/types";
import { SeverityBadge } from "./SeverityBadge";

export function DriftTimeline({ report }: { report: DepDriftReport }) {
  const [active, setActive] = useState<HistoryCommit | null>(null);

  return (
    <section className="rounded-xl border border-border/90 bg-panel shadow-panel">
      <div className="flex items-center gap-3 border-b border-border/80 bg-panel-raised/50 px-5 py-3.5">
        <History className="size-4 text-primary" />
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">Drift Timeline</h2>
          <p className="text-xs text-muted-foreground">
            Historical dependency changes across the scanned branch
          </p>
        </div>
        <Link
          to="/history"
          className="ml-auto rounded-lg border border-border/80 bg-panel px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all active:scale-[0.98] hover:border-border-strong hover:text-foreground hover:shadow-2xs"
        >
          Full git history
        </Link>
      </div>

      <div className="overflow-x-auto px-5 py-5.5">
        <div className="flex min-w-max items-stretch gap-0">
          {report.history.map((c, i) => (
            <div key={c.hash} className="flex items-stretch">
              <button
                type="button"
                onClick={() => setActive(active?.hash === c.hash ? null : c)}
                className={cn(
                  "w-[195px] rounded-xl border bg-background p-3.5 text-left transition-all active:scale-[0.98]",
                  c.driftIntroduced ? "border-high/40 bg-high/5" : "border-border/80 hover:border-border-strong",
                  active?.hash === c.hash && "border-primary/80 shadow-glow bg-panel",
                )}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <GitCommitHorizontal
                    className={cn(
                      "size-3.5",
                      c.driftIntroduced ? "text-high" : "text-muted-foreground",
                    )}
                  />
                  {c.hash}
                  {c.severity && <SeverityBadge severity={c.severity} className="ml-auto" />}
                </div>
                <div className="mt-1 font-mono text-[10px] font-medium text-muted-foreground">{c.date}</div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-foreground font-normal">
                  {c.dependencyChange}
                </p>
                {c.driftIntroduced && (
                  <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-high">
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
          <div className="flex w-[120px] items-center justify-center rounded-xl border border-primary/50 bg-primary/10 font-mono text-xs font-bold text-primary">
            Current
          </div>
        </div>
      </div>

      {active && (
        <div className="animate-fade-up border-t border-border/80 bg-secondary/50 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-border bg-panel px-2.5 py-1 font-mono text-xs font-bold text-primary">
              {active.hash}
            </span>
            <span className="font-mono text-xs font-medium text-muted-foreground">{active.date}</span>
            {active.author && (
              <span className="font-mono text-xs font-medium text-muted-foreground">{active.author}</span>
            )}
            {active.message && <span className="text-xs font-medium text-foreground">{active.message}</span>}
          </div>
          <p className="mt-2 text-xs font-medium text-foreground">{active.dependencyChange}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(active.files ?? []).map((f) => (
              <span
                key={f}
                className="rounded-md border border-border/60 bg-panel px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {(active.findingIds ?? []).map((id) => {
              const f = report.findings.find((x) => x.id === id);
              if (!f) return null;
              return (
                <Link
                  key={id}
                  to="/findings/$findingId"
                  params={{ findingId: id }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-panel px-2.5 py-1 font-mono text-[11px] font-medium transition-all hover:border-border-strong hover:shadow-2xs"
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
