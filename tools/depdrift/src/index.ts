import dotenv from "dotenv";
import { ingestRepo } from "./ingest";
import { getActiveDetectors } from "./detectors";
import { analyzeVersionDrift } from "./version-drift";
import { annotateGitHistory } from "./git-history";
import { generateReport } from "./report";
import { enrichFindingsWithAI } from "./ai";
import { ActualEdge, DeclaredEdge, Finding } from "./types";
import { AIEnhancedFinding } from "./ai/types";

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== "scan") {
    console.log("Usage: depdrift scan <path-or-github-url> [--history] [--commits=20] [--ai]");
    process.exit(0);
  }

  const target = args.find((a) => !a.startsWith("--") && a !== command) || ".";
  const historyFlag = args.includes("--history");
  const aiFlag = args.includes("--ai");
  const commitsArg = args.find((a) => a.startsWith("--commits="));
  const maxCommits = commitsArg ? parseInt(commitsArg.split("=")[1], 10) || 20 : 20;

  console.log(`\nStarting DepDrift scan on target: ${target}`);

  const ingest = await ingestRepo(target);
  const repoRoot = ingest.repoRoot;

  try {
    const detectors = getActiveDetectors(repoRoot);
    if (detectors.length === 0) {
      console.log("Warning: No supported ecosystems (Node or Python) detected in target repository.");
      if (ingest.cleanup) await ingest.cleanup();
      process.exit(0);
    }

    console.log(`Detected ecosystem(s): ${detectors.map((d) => d.ecosystem).join(", ")}`);

    let declaredGraph: DeclaredEdge[] = [];
    let actualGraph: ActualEdge[] = [];

    for (const detector of detectors) {
      declaredGraph = declaredGraph.concat(detector.extractDeclaredGraph(repoRoot));
      actualGraph = actualGraph.concat(detector.extractActualGraph(repoRoot));
    }

    let findings: Finding[] = analyzeVersionDrift(actualGraph, declaredGraph);

    if (historyFlag) {
      console.log(`Analyzing git commit history (top ${maxCommits} commits)...`);
      findings = await annotateGitHistory(repoRoot, findings, maxCommits);
    }

    let finalFindings: AIEnhancedFinding[] = findings;
    let markdownSummary: string | undefined;

    if (aiFlag) {
      console.log("\nRunning AI Analysis for ambiguous findings...");
      const aiResult = await enrichFindingsWithAI(findings, { repoRoot });
      finalFindings = aiResult.findings;
      markdownSummary = aiResult.markdownSummary;
    }

    let reportType: "local" | "github" | "history" = "local";
    if (historyFlag) {
      reportType = "history";
    } else if (ingest.isTemp) {
      reportType = "github";
    }

    generateReport(finalFindings, reportType, process.cwd(), markdownSummary);

    const hasHighSeverity = finalFindings.some((f) => f.severity === "high");
    if (ingest.cleanup) await ingest.cleanup();

    process.exit(hasHighSeverity ? 1 : 0);
  } catch (err: any) {
    console.error(`Error: Scan error: ${err.message}`);
    if (ingest.cleanup) await ingest.cleanup();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});