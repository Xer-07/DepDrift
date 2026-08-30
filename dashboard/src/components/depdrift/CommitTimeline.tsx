import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, GitCommitHorizontal, User, FileDiff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DepDriftReport } from "@/lib/depdrift/types";
import { SeverityBadge } from "./SeverityBadge";

export function CommitTimeline({ report }: { report: DepDriftReport }) {
  const [openHash, setOpenHash] = useState<string | null>(
    report.history.find((c) => c.driftIntroduced)?.hash ?? null,
  );

  return (
    <div className="relative pl-6">
      <div className="absolute bottom-4 left-[11px] top-2 w-px bg-border-strong" />

      {report.history.map((c) => {
        const open = openHash === c.hash;
        return (
          <div key={c.hash} className="relative pb-4">
            <span
              className={cn(
                "absolute -left-6 top-4 flex size-[22px] items-center justify-center rounded-full border bg-background shadow-2xs",
                c.driftIntroduced ? "border-high/60 bg-high/10" : "border-border-strong bg-panel",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  c.driftIntroduced ? "bg-high animate-pulse-ring" : "bg-muted-foreground/60",
                )}
              />
            </span>

            <button
              type="button"
              onClick={() => setOpenHash(open ? null : c.hash)}
              className={cn(
                "w-full rounded-xl border bg-panel px-4.5 py-3.5 text-left transition-all active:scale-[0.98] shadow-panel",
                c.driftIntroduced ? "border-high/35 bg-high/5" : "border-border/90 hover:border-border-strong",
                open && "border-primary/80 shadow-glow bg-panel",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-secondary px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  <GitCommitHorizontal className="size-3" />
                  {c.hash}
                </span>
                <span className="font-mono text-xs font-medium text-muted-foreground">{c.date}</span>
                {c.author && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-muted-foreground">
                    <User className="size-3" />
                    {c.author}
                  </span>
                )}
                {c.severity && <SeverityBadge severity={c.severity} />}
                {c.driftIntroduced ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-high">
                    <AlertTriangle className="size-3" /> drift introduced
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ok">
                    <CheckCircle2 className="size-3" /> clean
                  </span>
                )}
              </div>
              {c.message && <div className="mt-1.5 text-xs font-semibold text-foreground">{c.message}</div>}
              <p className="mt-1 font-mono text-[11px] font-medium text-muted-foreground">
                {c.dependencyChange}
              </p>

              {open && (
                <div className="mt-3.5 animate-fade-up space-y-3 border-t border-border/70 pt-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Files changed
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(c.files ?? ["—"]).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-secondary px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
                        >
                          <FileDiff className="size-3" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(c.findingIds ?? []).length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Findings traced to this commit
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {(c.findingIds ?? []).map((id) => {
                          const f = report.findings.find((x) => x.id === id);
                          if (!f) return null;
                          return (
                            <Link
                              key={id}
                              to="/findings/$findingId"
                              params={{ findingId: id }}
                              className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background px-2.5 py-1 font-mono text-[11px] font-medium transition-all hover:border-border-strong"
                            >
                              <SeverityBadge severity={f.severity} />
                              {f.dependency}
                              <span className="text-muted-foreground">{f.fromPackage}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        );
      })}

      <div className="relative">
        <span className="absolute -left-6 top-3 flex size-[22px] items-center justify-center rounded-full border border-primary/60 bg-primary/10">
          <span className="size-2 rounded-full bg-primary" />
        </span>
        <div className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 font-mono text-xs font-bold text-primary shadow-2xs">
          HEAD · current working tree
        </div>
      </div>
    </div>
  );
}
