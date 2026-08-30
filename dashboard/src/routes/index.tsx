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
    <div>
      <TopHeader
        title="Dashboard"
        subtitle="Dependency health, drift and historical attribution for the active report."
        actions={
          <>
            <DemoFixtureSelector />
            <Link
              to="/scan"
              className="rounded-md border border-border bg-panel px-3 py-2 text-xs transition-colors hover:border-border-strong"
            >
              New scan
            </Link>
          </>
        }
      />

      <div className="space-y-5 px-5 py-6 md:px-8">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DependencyGraph report={report} />
          <HealthChart summary={summary} />
        </div>

        <DriftTimeline report={report} />

        <section className="overflow-hidden rounded-lg border border-border bg-panel shadow-panel">
          <div className="flex items-center gap-3 px-4 pt-4">
            <h2 className="text-sm font-semibold tracking-tight">Detected Drift</h2>
            <p className="text-xs text-muted-foreground">
              Every finding emitted by the scan, newest severity first
            </p>
            <Link
              to="/findings"
              className="ml-auto rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              Open findings view
            </Link>
          </div>
          <div className="mt-3">
            <FilterBar filters={filters} onChange={setFilters} resultCount={findings.length} />
            <FindingTable findings={findings} />
          </div>
        </section>
      </div>
    </div>
  );
}
