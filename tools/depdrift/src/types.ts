export type Ecosystem = "node" | "python";

export type ActualEdge = {
  ecosystem: Ecosystem;
  fromPackage: string; // package name (e.g. "@demo/app", "app", or python package)
  fromPackagePath: string; // path to package directory relative to repo root
  fromFile: string; // relative file path from repo root
  toPackage: string; // package name being imported (workspace or external e.g. "lodash", "requests")
  importedSpecifier: string; // e.g. "lodash/get", "@demo/ui", "requests"
  isMainBuildEntrypoint: boolean; // true if file matches src/index.*, main.*, package.json "main" target, etc.
};

export type DeclaredEdge = {
  ecosystem: Ecosystem;
  fromPackage: string; // package name
  fromPackagePath: string; // relative path from repo root
  toPackage: string; // declared target package
  declaredRange: string | null; // e.g. "^4.17.21" or "4.17.21" or null
  resolvedVersion: string | null; // e.g. "4.17.21" from lockfile or requirements.txt
  isDevDependency?: boolean;
};

export type DriftType =
  | "missing_dependency"
  | "unnecessary_dependency"
  | "version_drift"
  | "cross_package_version_conflict";

export type Severity = "high" | "medium" | "low";

export type Finding = {
  dependency: string;
  fromPackage: string;
  ecosystem: Ecosystem;
  expected: string | null;
  actual: string | null;
  type: DriftType;
  severity: Severity;
  reasoning: string;
  evidence: string[];
  introducedInCommit: { hash: string; date: string } | null;
  suggestedFix: string;
};

export interface EcosystemDetector {
  ecosystem: Ecosystem;
  detect(repoRoot: string): boolean;
  extractActualGraph(repoRoot: string): ActualEdge[];
  extractDeclaredGraph(repoRoot: string): DeclaredEdge[];
}

export type ScanOptions = {
  inputPath: string;
  history?: boolean;
  commits?: number;
};

export type IngestResult = {
  repoRoot: string;
  isTemp: boolean;
  cleanup: () => void;
};
