import { Link } from "@tanstack/react-router";
import { ArrowLeft, GitCommitHorizontal, Lightbulb, Package } from "lucide-react";
import type { DepDriftReport, Finding } from "@/lib/depdrift/types";
import { DRIFT_TYPE_LABEL } from "@/lib/depdrift/types";
import { SeverityBadge, TypeBadge } from "./SeverityBadge";
import { EvidenceList, SuggestedFix } from "./SuggestedFix";

const ECOSYSTEM_LABEL: Record<string, string> = {
  node: "Node.js",
  python: "Python",
};

function InfoRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 px-4.5 py-3 transition-colors last:border-b-0 hover:bg-panel-raised/50">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span
        className={
          mono
            ? "rounded-md border border-border/80 bg-background px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground"
            : "text-xs font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function FindingDetails({
  finding,
  report,
}: {
  finding: Finding;
  report: DepDriftReport;
}) {
  const commit = finding.introducedCommit;
  const siblings = report.findings.filter(
    (f) => f.id !== finding.id && f.dependency === finding.dependency,
  );

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground active:scale-[0.98]"
      >
        <ArrowLeft className="size-3.5" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/80 pb-5">
        <h1 className="font-mono text-2.5xl font-bold tracking-tight text-foreground">{finding.dependency}</h1>
        <SeverityBadge severity={finding.severity} size="md" />
        <TypeBadge type={finding.type} />
        <span className="ml-auto font-mono text-[11px] font-medium text-muted-foreground">{finding.id}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-border/90 bg-panel shadow-panel">
            <div className="flex items-center gap-2 border-b border-border/80 bg-panel-raised/50 px-4.5 py-3.5">
              <Package className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">Dependency Information</h2>
            </div>
            <InfoRow label="Dependency" value={finding.dependency} />
            <InfoRow label="From Package" value={finding.fromPackage} />
            <InfoRow
              label="Ecosystem"
              value={ECOSYSTEM_LABEL[finding.ecosystem] ?? finding.ecosystem}
              mono={false}
            />
            <InfoRow label="Expected" value={finding.expectedVersion ?? "—"} />
            <InfoRow label="Actual" value={finding.actualVersion ?? "—"} />
            <InfoRow
              label="Drift Type"
              value={DRIFT_TYPE_LABEL[finding.type] ?? finding.type}
              mono={false}
            />
          </section>

          <section className="rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Introduced In</h2>
            {commit ? (
              <div className="mt-3.5">
                <Link
                  to="/history"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 font-mono text-xs font-bold text-primary transition-all hover:border-primary/70 hover:bg-primary/15"
                >
                  <GitCommitHorizontal className="size-4" />
                  {commit.hash}
                </Link>
                <dl className="mt-3.5 space-y-2 font-mono text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 font-semibold uppercase tracking-wider text-[10px]">date</dt>
                    <dd className="font-medium text-foreground">{commit.date}</dd>
                  </div>
                  {commit.author && (
                    <div className="flex gap-3">
                      <dt className="w-16 shrink-0 font-semibold uppercase tracking-wider text-[10px]">author</dt>
                      <dd className="font-medium text-foreground">{commit.author}</dd>
                    </div>
                  )}
                  {commit.message && (
                    <div className="flex gap-3">
                      <dt className="w-16 shrink-0 font-semibold uppercase tracking-wider text-[10px]">message</dt>
                      <dd className="font-medium text-foreground">{commit.message}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">No commit attribution available.</p>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-medium" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">Why This Matters</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground font-normal">
              {finding.reasoning}
            </p>

            {siblings.length > 0 && (
              <div className="mt-4 border-t border-border/70 pt-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Related findings for {finding.dependency}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.id}
                      to="/findings/$findingId"
                      params={{ findingId: s.id }}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background px-2.5 py-1.5 font-mono text-[11px] font-medium transition-all hover:border-border-strong"
                    >
                      <SeverityBadge severity={s.severity} />
                      {s.fromPackage}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <EvidenceList evidence={finding.evidence} />
        </div>
      </div>

      <SuggestedFix command={finding.suggestedFix} />
    </div>
  );
}
