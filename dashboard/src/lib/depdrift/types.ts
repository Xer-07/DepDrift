/**
 * Mirrors the CLI report schema emitted by `tools/depdrift` (`src/types.ts`).
 * Keep this file as the single source of truth for the UI's data contract:
 * when the real exported types are available, replace the bodies here and the
 * rest of the app keeps working.
 */

export type Severity = "HIGH" | "MEDIUM" | "LOW";

export type Ecosystem = "node" | "python";

export type DriftType =
  | "version_drift"
  | "missing_dependency"
  | "unnecessary_dependency"
  | "version_conflict";

export interface CommitRef {
  hash: string;
  date: string;
  author?: string;
  message?: string;
}

export interface Finding {
  id: string;
  dependency: string;
  fromPackage: string;
  ecosystem: Ecosystem;
  type: DriftType;
  severity: Severity;
  expectedVersion?: string;
  actualVersion?: string;
  reasoning: string;
  evidence: string[];
  introducedCommit?: CommitRef;
  suggestedFix: string;
}

export type GraphNodeKind = "workspace" | "package" | "dependency";
export type GraphNodeStatus = "ok" | "missing" | "conflict" | "unused";

export interface ReportGraphNode {
  id: string;
  label: string;
  ecosystem: Ecosystem;
  kind: GraphNodeKind;
  status: GraphNodeStatus;
  version?: string;
  position: { x: number; y: number };
}

export type EdgeState = "declared" | "missing" | "conflict";

export interface ReportGraphEdge {
  id: string;
  source: string;
  target: string;
  state: EdgeState;
  label?: string;
}

export interface HistoryCommit extends CommitRef {
  dependencyChange: string;
  driftIntroduced: boolean;
  severity?: Severity;
  files?: string[];
  findingIds?: string[];
}

export interface RepositoryMeta {
  name: string;
  source: string;
  branch: string;
  scannedAt: string;
  ecosystems: Ecosystem[];
}

export interface DepDriftReport {
  version: string;
  repository: RepositoryMeta;
  findings: Finding[];
  graph: { nodes: ReportGraphNode[]; edges: ReportGraphEdge[] };
  history: HistoryCommit[];
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export const DRIFT_TYPE_LABEL: Record<DriftType, string> = {
  version_drift: "Version drift",
  missing_dependency: "Missing dependency",
  unnecessary_dependency: "Unnecessary dependency",
  version_conflict: "Version conflict",
};
