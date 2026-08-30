import { MOCK_REPORTS, type FixtureId } from "./fixtures";
import type { DepDriftReport, Finding, Severity } from "./types";

/**
 * Report adapter.
 *
 * Today `loadReport()` resolves bundled mock fixtures. To switch to the real
 * CLI output, replace the body with a fetch of `depdrift-report.json` and pass
 * the parsed JSON through `adaptReport()` — no UI component needs to change.
 */
export async function loadReport(fixture: FixtureId = "polyglot"): Promise<DepDriftReport> {
  try {
    const res = await fetch("/depdrift-report.json");
    if (res.ok) {
      const raw = await res.json();
      return adaptReport(raw);
    }
  } catch {
    // fallback to mock fixture if live JSON not served
  }
  return adaptReport(MOCK_REPORTS[fixture]);
}

export function getReport(fixture: FixtureId = "polyglot"): DepDriftReport {
  return adaptReport(MOCK_REPORTS[fixture]);
}

/**
 * Normalizes a raw `depdrift-report.json` payload into the UI model.
 * Tolerates snake_case keys and missing optional collections so that schema
 * drift in the CLI does not crash the dashboard.
 */
export function adaptReport(raw: unknown): DepDriftReport {
  let findingsList: Finding[] = [];
  let repositoryInfo = {
    name: "DepDrift Workspace",
    source: "local",
    branch: "main",
    scannedAt: new Date().toISOString(),
    ecosystems: ["node", "python"],
  };
  let graphData = { nodes: [], edges: [] };
  let historyData: any[] = [];

  if (Array.isArray(raw)) {
    findingsList = raw as Finding[];
  } else if (raw && typeof raw === "object") {
    const reportObj = raw as Partial<DepDriftReport> & Record<string, unknown>;
    findingsList = (reportObj.findings ?? []) as Finding[];
    if (reportObj.repository) repositoryInfo = reportObj.repository;
    if (reportObj.graph) graphData = reportObj.graph as any;
    if (reportObj.history) historyData = reportObj.history as any[];
  }

  return {
    version: "1.0.0",
    repository: repositoryInfo,
    findings: findingsList.map((f, i) => ({
      ...f,
      id: f.id ?? `finding-${i}`,
      evidence: f.evidence ?? [],
      severity: (f.severity?.toUpperCase?.() as Severity) ?? "LOW",
    })),
    graph: graphData,
    history: historyData,
  };
}

export interface ReportSummary {
  high: number;
  medium: number;
  low: number;
  total: number;
  packages: number;
  driftCommits: number;
}

export function summarize(report: DepDriftReport): ReportSummary {
  const count = (s: Severity) => report.findings.filter((f) => f.severity === s).length;
  return {
    high: count("HIGH"),
    medium: count("MEDIUM"),
    low: count("LOW"),
    total: report.findings.length,
    packages: new Set(report.findings.map((f) => f.fromPackage)).size,
    driftCommits: report.history.filter((c) => c.driftIntroduced).length,
  };
}
