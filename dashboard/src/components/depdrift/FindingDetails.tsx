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
    <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-panel-raised/50">
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <span
        className={
          mono
            ? "rounded border border-border bg-background px-2 py-0.5 font-mono text-[13px] text-foreground"
            : "text-sm text-foreground"
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
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <h1 className="font-mono text-3xl font-semibold tracking-tight">{finding.dependency}</h1>
        <SeverityBadge severity={finding.severity} size="md" />
        <TypeBadge type={finding.type} />
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{finding.id}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-lg border border-border bg-panel shadow-panel">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Package className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold tracking-tight">Dependency Information</h2>
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

          <section className="rounded-lg border border-border bg-panel p-4">
            <h2 className="text-sm font-semibold tracking-tight">Introduced In</h2>
            {commit ? (
              <div className="mt-3">
                <Link
                  to="/history"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-background px-3 py-2 font-mono text-sm text-primary transition-colors hover:border-primary/70 hover:bg-primary/10"
                >
                  <GitCommitHorizontal className="size-4" />
                  {commit.hash}
                </Link>
                <dl className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0">date</dt>
                    <dd className="text-foreground">{commit.date}</dd>
                  </div>
                  {commit.author && (
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0">author</dt>
                      <dd className="text-foreground">{commit.author}</dd>
                    </div>
                  )}
                  {commit.message && (
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0">message</dt>
                      <dd className="text-foreground">{commit.message}</dd>
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
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-panel p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-medium" />
              <h2 className="text-sm font-semibold tracking-tight">Why This Matters</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
              {finding.reasoning}
            </p>

            {siblings.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Related findings for {finding.dependency}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.id}
                      to="/findings/$findingId"
                      params={{ findingId: s.id }}
                      className="inline-flex items-center gap-2 rounded border border-border bg-background px-2 py-1 font-mono text-[11px] transition-colors hover:border-border-strong"
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
