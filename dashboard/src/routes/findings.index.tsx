import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopHeader } from "@/components/depdrift/TopHeader";
import { FindingTable } from "@/components/depdrift/FindingTable";
import { FilterBar, DEFAULT_FILTERS, applyFilters, type Filters } from "@/components/depdrift/FilterBar";
import { DemoFixtureSelector } from "@/components/depdrift/DemoFixtureSelector";
import { useReport } from "@/lib/depdrift/useReport";
import { SEVERITY_ORDER } from "@/lib/depdrift/types";

export const Route = createFileRoute("/findings/")({
  head: () => ({
    meta: [
      { title: "Findings — DepDrift" },
      {
        name: "description",
        content:
          "Search and filter every detected dependency drift finding by severity, ecosystem and drift type.",
      },
      { property: "og:title", content: "Findings — DepDrift" },
      {
        property: "og:description",
        content: "Search and filter detected dependency drift by severity, ecosystem and type.",
      },
    ],
  }),
  component: FindingsPage,
});

function FindingsPage() {
  const report = useReport();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const findings = useMemo(
    () =>
      applyFilters(report.findings, filters).sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      ),
    [report, filters],
  );

  return (
    <div className="animate-fade-up">
      <TopHeader
        title="Findings"
        subtitle="Every dependency drift detected in the active report."
        actions={<DemoFixtureSelector />}
      />
      <div className="px-5 py-6 md:px-8">
        <section className="overflow-hidden rounded-xl border border-border/90 bg-panel shadow-panel">
          <FilterBar filters={filters} onChange={setFilters} resultCount={findings.length} />
          <FindingTable findings={findings} />
        </section>
      </div>
    </div>
  );
}
