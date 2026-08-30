import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, Info, Layers } from "lucide-react";
import { TopHeader } from "@/components/depdrift/TopHeader";
import { MetricCard } from "@/components/depdrift/MetricCard";
import { HealthChart } from "@/components/depdrift/HealthChart";
import { DependencyGraph } from "@/components/depdrift/DependencyGraph";
import { DriftTimeline } from "@/components/depdrift/DriftTimeline";
import { FindingTable } from "@/components/depdrift/FindingTable";
import { FilterBar, DEFAULT_FILTERS, applyFilters, type Filters } from "@/components/depdrift/FilterBar";
import { DemoFixtureSelector } from "@/components/depdrift/DemoFixtureSelector";
import { useReport } from "@/lib/depdrift/useReport";
import { summarize } from "@/lib/depdrift/reportAdapter";
import { SEVERITY_ORDER } from "@/lib/depdrift/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DepDrift Dashboard — Dependency Drift Intelligence" },
      {
        name: "description",
        content:
          "Severity breakdown, dependency graph, drift timeline and detected findings for Node.js, Python and polyglot repositories.",
      },
      { property: "og:title", content: "DepDrift Dashboard — Dependency Drift Intelligence" },
      {
        property: "og:description",
        content:
          "Severity breakdown, dependency graph, drift timeline and detected findings for scanned repositories.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const report = useReport();
  const summary = summarize(report);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const findings = useMemo(
    () =>
      applyFilters(report.findings, filters).sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      ),
    [report, filters],
  );

  const total = summary.total || 1;

  return (
    <div className="animate-fade-up">
      <TopHeader
        title="Dashboard"
        subtitle="Dependency health, drift and historical attribution for the active report."
        actions={
          <>
            <DemoFixtureSelector />
            <Link
              to="/scan"
              className="rounded-lg border border-border/90 bg-panel px-3 py-1.5 text-xs font-semibold text-foreground transition-all active:scale-[0.98] hover:border-border-strong hover:shadow-2xs"
            >
              New scan
            </Link>
          </>
        }
      />

      <div className="space-y-6 px-5 py-6 md:px-8">
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="High severity"
            value={summary.high}
            subtitle="Immediate build/runtime risk"
            tone="high"
            icon={AlertOctagon}
            share={summary.high / total}
          />
          <MetricCard
            label="Medium severity"
            value={summary.medium}
            subtitle="Potential dependency risk"
            tone="medium"
            icon={AlertTriangle}
            share={summary.medium / total}
          />
          <MetricCard
            label="Low severity"
            value={summary.low}
            subtitle="Dependency bloat"
            tone="low"
            icon={Info}
            share={summary.low / total}
          />
          <MetricCard
            label="Total findings"
            value={summary.total}
            subtitle={`Across ${summary.packages} packages · ${report.repository.ecosystems.join(", ")}`}
            tone="neutral"
            icon={Layers}
            share={1}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <DependencyGraph report={report} />
          <HealthChart summary={summary} />
        </div>

        <DriftTimeline report={report} />

        <section className="overflow-hidden rounded-xl border border-border/90 bg-panel shadow-panel">
          <div className="flex items-center gap-3 border-b border-border/70 bg-panel-raised/50 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground">Detected Drift</h2>
              <p className="text-xs text-muted-foreground">
                Every finding emitted by the scan, newest severity first
              </p>
            </div>
            <Link
              to="/findings"
              className="ml-auto rounded-lg border border-border/80 bg-panel px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all active:scale-[0.98] hover:border-border-strong hover:text-foreground hover:shadow-2xs"
            >
              Open findings view
            </Link>
          </div>
          <div>
            <FilterBar filters={filters} onChange={setFilters} resultCount={findings.length} />
            <FindingTable findings={findings} />
          </div>
        </section>
      </div>
    </div>
  );
}
