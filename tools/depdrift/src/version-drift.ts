import semver from "semver";
import { ActualEdge, DeclaredEdge, Finding } from "./types";

export function analyzeVersionDrift(
  actual: ActualEdge[],
  declared: DeclaredEdge[]
): Finding[] {
  const findings: Finding[] = [];

  // Group actual edges by package & dependency
  // Key: `${fromPackage}->${toPackage}`
  const actualMap = new Map<string, ActualEdge[]>();
  for (const edge of actual) {
    const key = `${edge.fromPackage}->${edge.toPackage}`;
    if (!actualMap.has(key)) {
      actualMap.set(key, []);
    }
    actualMap.get(key)!.push(edge);
  }

  // Group declared edges by package & dependency
  // Key: `${fromPackage}->${toPackage}`
  const declaredMap = new Map<string, DeclaredEdge>();
  for (const edge of declared) {
    const key = `${edge.fromPackage}->${edge.toPackage}`;
    declaredMap.set(key, edge);
  }

  // 1. Missing Dependencies (Imported in source, missing from declarations)
  for (const [key, edges] of actualMap.entries()) {
    const declaredEdge = declaredMap.get(key);
    if (!declaredEdge) {
      const sample = edges[0];
      const isMain = edges.some(e => e.isMainBuildEntrypoint);
      const evidence = Array.from(new Set(edges.map(e => e.fromFile)));
      const severity = isMain ? "high" : "medium";

      const reasoning = isMain
        ? `Imported in main entrypoint (${evidence[0]}) but missing from ${sample.fromPackage}'s manifest declarations. High risk of immediate production runtime failure.`
        : `Imported in source (${evidence[0]}) but not declared in ${sample.fromPackage}'s manifest. May fail when executed dynamically.`;

      const pkgFile = sample.ecosystem === "node"
        ? (sample.fromPackagePath === "." ? "package.json" : `${sample.fromPackagePath}/package.json`)
        : (sample.fromPackagePath === "." ? "requirements.txt" : `${sample.fromPackagePath}/requirements.txt`);

      const suggestedFix = sample.ecosystem === "node"
        ? `Add "${sample.toPackage}": "*" to ${pkgFile} dependencies`
        : `Add "${sample.toPackage}" to ${pkgFile}`;

      findings.push({
        dependency: sample.toPackage,
        fromPackage: sample.fromPackage,
        ecosystem: sample.ecosystem,
        expected: null,
        actual: sample.importedSpecifier,
        type: "missing_dependency",
        severity,
        reasoning,
        evidence,
        introducedInCommit: null,
        suggestedFix,
      });
    }
  }

  // 2. Unnecessary Dependencies (Declared in manifest, never imported in source)
  for (const [key, edge] of declaredMap.entries()) {
    if (!actualMap.has(key)) {
      if (edge.isDevDependency) continue;

      const pkgFile = edge.ecosystem === "node"
        ? (edge.fromPackagePath === "." ? "package.json" : `${edge.fromPackagePath}/package.json`)
        : (edge.fromPackagePath === "." ? "requirements.txt" : `${edge.fromPackagePath}/requirements.txt`);

      findings.push({
        dependency: edge.toPackage,
        fromPackage: edge.fromPackage,
        ecosystem: edge.ecosystem,
        expected: edge.declaredRange || "*",
        actual: null,
        type: "unnecessary_dependency",
        severity: "low",
        reasoning: `Declared in ${pkgFile} but no static import observed in source code. Unnecessary dependency bloat.`,
        evidence: [pkgFile],
        introducedInCommit: null,
        suggestedFix: `Remove "${edge.toPackage}" from ${pkgFile} dependencies`,
      });
    }
  }

  // 3. SemVer Lockfile Version Drift (Declared range vs lockfile resolved version)
  for (const edge of declared) {
    if (!edge.declaredRange || !edge.resolvedVersion) continue;

    const declaredRange = edge.declaredRange;
    const resolvedVersion = edge.resolvedVersion;

    const validRange = semver.validRange(declaredRange);
    const validVersion = semver.valid(resolvedVersion);

    if (validRange && validVersion) {
      const satisfies = semver.satisfies(resolvedVersion, declaredRange);

      if (!satisfies) {
        // High severity: lockfile resolved version is completely outside declared manifest range
        const pkgFile = edge.fromPackagePath === "." ? "package.json" : `${edge.fromPackagePath}/package.json`;
        findings.push({
          dependency: edge.toPackage,
          fromPackage: edge.fromPackage,
          ecosystem: edge.ecosystem,
          expected: declaredRange,
          actual: resolvedVersion,
          type: "version_drift",
          severity: "high",
          reasoning: `Lockfile version ${resolvedVersion} breaks manifest constraint ${declaredRange}. Indicates un-synced manifest edit or major breaking change.`,
          evidence: [pkgFile, "package-lock.json"],
          introducedInCommit: null,
          suggestedFix: `Update ${pkgFile} dependency range of "${edge.toPackage}" to match lockfile version "${resolvedVersion}"`,
        });
      } else if (declaredRange === "*" || declaredRange.startsWith(">=") || declaredRange === "latest") {
        // Medium severity: overly loose version range
        const pkgFile = edge.fromPackagePath === "." ? "package.json" : `${edge.fromPackagePath}/package.json`;
        findings.push({
          dependency: edge.toPackage,
          fromPackage: edge.fromPackage,
          ecosystem: edge.ecosystem,
          expected: declaredRange,
          actual: resolvedVersion,
          type: "version_drift",
          severity: "medium",
          reasoning: `Overly permissive version specifier "${declaredRange}" in ${pkgFile}. Allows unexpected breaking updates on fresh installs.`,
          evidence: [pkgFile],
          introducedInCommit: null,
          suggestedFix: `Pin dependency range in ${pkgFile} from "${declaredRange}" to "^${resolvedVersion}"`,
        });
      }
    }
  }

  // 4. Cross-Package Version Conflicts (Monorepo packages declaring different version ranges for same external dep)
  // Map external dep -> Map<fromPackage, range>
  const externalDepMap = new Map<string, Map<string, { range: string; pkgPath: string }>>();
  for (const edge of declared) {
    if (!edge.declaredRange) continue;
    if (!externalDepMap.has(edge.toPackage)) {
      externalDepMap.set(edge.toPackage, new Map());
    }
    externalDepMap.get(edge.toPackage)!.set(edge.fromPackage, {
      range: edge.declaredRange,
      pkgPath: edge.fromPackagePath,
    });
  }

  for (const [depName, packageMap] of externalDepMap.entries()) {
    if (packageMap.size > 1) {
      const ranges = Array.from(packageMap.entries()).map(([pkg, info]) => `${pkg} (${info.range})`);
      const uniqueRanges = new Set(Array.from(packageMap.values()).map(info => info.range));

      if (uniqueRanges.size > 1) {
        const [firstPkg, firstInfo] = Array.from(packageMap.entries())[0];
        const [secondPkg, secondInfo] = Array.from(packageMap.entries())[1];

        findings.push({
          dependency: depName,
          fromPackage: `${firstPkg} & ${secondPkg}`,
          ecosystem: "node",
          expected: firstInfo.range,
          actual: secondInfo.range,
          type: "cross_package_version_conflict",
          severity: "high",
          reasoning: `Cross-package monorepo conflict: "${firstPkg}" declares range "${firstInfo.range}" while "${secondPkg}" declares "${secondInfo.range}" for dependency "${depName}". Causes duplicate installs and runtime type mismatches.`,
          evidence: Array.from(packageMap.values()).map(i => `${i.pkgPath}/package.json`),
          introducedInCommit: null,
          suggestedFix: `Unify dependency version of "${depName}" across packages to "${firstInfo.range}"`,
        });
      }
    }
  }

  return findings;
}
