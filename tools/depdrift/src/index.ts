import { ingestRepo } from "./ingest";
import * as detectors from "./detectors";
import { analyzeVersionDrift } from "./version-drift";
import { generateReport } from "./report";
import { enrichFindingsWithAI } from "./ai";
import { Finding } from "./types";
import { AIEnhancedFinding } from "./ai/types";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args.find((a) => !a.startsWith("--") && a !== command) || ".";
  const enableAI = args.includes("--ai");

  if (command !== "scan") {
    console.log("Usage: depdrift scan <path-or-github-url> [--ai]");
    process.exit(1);
  }

  console.log(`Ingesting repository: ${target}...`);
  const ingest = await ingestRepo(target);

  try {
    const repoPath = (ingest as any).repoPath || (ingest as any).localPath || target;
    console.log("Running detectors...");
    
    // Dynamically call the detector runner function exported from ./detectors
    const detectorFn = (detectors as any).runDetectors || (detectors as any).runAllDetectors || (detectors as any).default;
    const declaredGraph = typeof detectorFn === "function" ? detectorFn(repoPath) : [];

    const rawFindings: Finding[] = analyzeVersionDrift(declaredGraph, []);

    let finalFindings: AIEnhancedFinding[] = rawFindings;
    let markdownSummary: string | undefined;

    if (enableAI) {
      console.log("\n🤖 Running AI Analysis & Patch Generation...");
      const aiResult = await enrichFindingsWithAI(rawFindings, { repoRoot: repoPath });
      finalFindings = aiResult.findings;
      markdownSummary = aiResult.markdownSummary;
    }

    generateReport(finalFindings, process.cwd(), markdownSummary);

    const hasHigh = finalFindings.some((f) => f.severity === "high");
    process.exit(hasHigh ? 1 : 0);
  } finally {
    if (typeof ingest.cleanup === "function") {
      await ingest.cleanup();
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});