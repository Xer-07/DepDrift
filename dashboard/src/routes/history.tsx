import { createFileRoute } from "@tanstack/react-router";
import { TopHeader } from "@/components/depdrift/TopHeader";
import { CommitTimeline } from "@/components/depdrift/CommitTimeline";
import { DemoFixtureSelector } from "@/components/depdrift/DemoFixtureSelector";
import { useReport } from "@/lib/depdrift/useReport";
import { summarize } from "@/lib/depdrift/reportAdapter";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Git History — DepDrift" },
      {
        name: "description",
        content: "Trace exactly when dependency drift was introduced, commit by commit.",
      },
      { property: "og:title", content: "Git History — DepDrift" },
      {
        property: "og:description",
        content: "Trace exactly when dependency drift was introduced.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const report = useReport();
  const summary = summarize(report);

  return (
    <div className="animate-fade-up">
      <TopHeader
        title="Git History"
        subtitle="Trace exactly when dependency drift was introduced."
        actions={<DemoFixtureSelector />}
      />
      <div className="grid gap-6 px-5 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CommitTimeline report={report} />

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel">
            <h2 className="text-sm font-bold tracking-tight text-foreground">History summary</h2>
            <dl className="mt-3.5 space-y-2.5 text-xs font-medium">
              <Row label="Commits analyzed" value={String(report.history.length)} />
              <Row label="Drift commits" value={String(summary.driftCommits)} />
              <Row label="Branch" value={report.repository.branch} />
              <Row
                label="First drift"
                value={report.history.find((c) => c.driftIntroduced)?.date ?? "—"}
              />
              <Row
                label="Latest drift"
                value={[...report.history].reverse().find((c) => c.driftIntroduced)?.date ?? "—"}
              />
            </dl>
          </div>
          <div className="rounded-xl border border-border/90 bg-panel p-4.5 text-xs text-muted-foreground font-medium shadow-panel">
            Commit attribution comes from the report&apos;s{" "}
            <span className="font-mono text-foreground font-semibold">history[]</span> array — blame is computed
            by the CLI.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-semibold text-foreground">{value}</dd>
    </div>
  );
}
