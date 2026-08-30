import { createFileRoute, Link } from "@tanstack/react-router";
import { TopHeader } from "@/components/depdrift/TopHeader";
import { FindingDetails } from "@/components/depdrift/FindingDetails";
import { useReport } from "@/lib/depdrift/useReport";

export const Route = createFileRoute("/findings/$findingId")({
  head: () => ({
    meta: [
      { title: "Finding Details — DepDrift" },
      {
        name: "description",
        content:
          "Full drift detail: reasoning, evidence files, introducing commit and a copyable suggested fix.",
      },
      { property: "og:title", content: "Finding Details — DepDrift" },
      {
        property: "og:description",
        content: "Reasoning, evidence, introducing commit and a copyable suggested fix.",
      },
    ],
  }),
  component: FindingDetailsPage,
});

function FindingDetailsPage() {
  const { findingId } = Route.useParams();
  const report = useReport();
  const finding = report.findings.find((f) => f.id === findingId);

  if (!finding) {
    return (
      <div>
        <TopHeader title="Finding not found" subtitle="This finding is not in the active report." />
        <div className="px-5 py-10 md:px-8">
          <Link to="/findings" className="text-sm text-primary underline-offset-4 hover:underline">
            Back to findings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopHeader
        title={`${finding.dependency} · ${finding.fromPackage}`}
        subtitle="Finding details, evidence and remediation."
      />
      <div className="px-5 py-6 md:px-8">
        <FindingDetails finding={finding} report={report} />
      </div>
    </div>
  );
}
