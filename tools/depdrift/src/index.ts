import { ingestRepo } from "./ingest";
import { getActiveDetectors } from "./detectors";
import { analyzeVersionDrift } from "./version-drift";
import { annotateGitHistory } from "./git-history";
import { generateReport } from "./report";
import { ScanOptions } from "./types";

function parseArgs(args: string[]): { command: string; options: ScanOptions } {
  const result: ScanOptions = {
    inputPath: ".",
    history: false,
    commits: 20,
  };

  let command = "scan";
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--history") {
      result.history = true;
    } else if (arg.startsWith("--commits=")) {
      const val = parseInt(arg.split("=")[1], 10);
      if (!isNaN(val)) result.commits = val;
    } else if (arg === "--commits" && i + 1 < args.length) {
      const val = parseInt(args[++i], 10);
      if (!isNaN(val)) result.commits = val;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    command = positional[0];
  }
  if (positional.length > 1) {
    result.inputPath = positional[1];
  }

  return { command, options: result };
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const { command, options } = parseArgs(rawArgs);

  if (command !== "scan") {
    console.log("Usage: depdrift scan <path-or-github-url> [--history] [--commits=20]");
    process.exit(0);
  }

  console.log(`\n🔍 Starting DepDrift scan on target: ${options.inputPath}`);

  let ingestResult;
  try {
    ingestResult = await ingestRepo(options.inputPath);
  } catch (err: any) {
    console.error(`❌ Ingestion failed: ${err.message}`);
    process.exit(1);
  }

  const { repoRoot, cleanup } = ingestResult;

  try {
    const detectors = getActiveDetectors(repoRoot);
    if (detectors.length === 0) {
      console.log("⚠ No supported ecosystems (Node or Python) detected in target repository.");
      cleanup();
      process.exit(0);
    }

    console.log(`Detected ecosystem(s): ${detectors.map(d => d.ecosystem).join(", ")}`);

    const actualEdges = detectors.flatMap(d => d.extractActualGraph(repoRoot));
    const declaredEdges = detectors.flatMap(d => d.extractDeclaredGraph(repoRoot));

    let findings = analyzeVersionDrift(actualEdges, declaredEdges);

    if (options.history) {
      findings = await annotateGitHistory(repoRoot, findings, options.commits);
    }

    generateReport(findings);

    const hasHighSeverity = findings.some(f => f.severity === "high");
    cleanup();

    if (hasHighSeverity) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error(`❌ Scan error: ${err.message}`);
    cleanup();
    process.exit(1);
  }
}

main();