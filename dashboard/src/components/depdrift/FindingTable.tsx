import { Link } from "@tanstack/react-router";
import { ArrowRight, GitCommitHorizontal } from "lucide-react";
import type { Finding } from "@/lib/depdrift/types";
import { EcosystemBadge, SeverityBadge, TypeBadge } from "./SeverityBadge";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Link
      to="/findings/$findingId"
      params={{ findingId: finding.id }}
      className="group block border-b border-border/70 px-4.5 py-3.5 transition-all last:border-b-0 hover:bg-panel-raised/80 active:bg-accent/40"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SeverityBadge severity={finding.severity} />
        <span className="font-mono text-sm font-semibold text-foreground tracking-tight">{finding.dependency}</span>
        <span className="font-mono text-xs text-muted-foreground">← {finding.fromPackage}</span>
        <EcosystemBadge ecosystem={finding.ecosystem} />
        <TypeBadge type={finding.type} />
        {(finding.expectedVersion || finding.actualVersion) && (
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            {finding.expectedVersion ?? "—"}{" "}
            <span className="text-medium font-bold">→</span> {finding.actualVersion ?? "—"}
          </span>
        )}
        {finding.introducedCommit && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-panel px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
            <GitCommitHorizontal className="size-3 text-muted-foreground/80" />
            {finding.introducedCommit.hash}
          </span>
        )}
        <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-40 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-primary" />
      </div>
      <p className="mt-2 line-clamp-2 max-w-4xl text-xs leading-relaxed text-muted-foreground/90 font-normal">
        {finding.reasoning}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {finding.evidence.slice(0, 3).map((e) => (
          <span
            key={e}
            className="rounded-md border border-border/60 bg-secondary px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground"
          >
            {e}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function FindingTable({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div className="px-4 py-14 text-center">
        <p className="text-sm font-medium text-muted-foreground">No findings match the current filters.</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/70">
      {findings.map((f) => (
        <FindingCard key={f.id} finding={f} />
      ))}
    </div>
  );
}
