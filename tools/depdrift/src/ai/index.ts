import { Finding } from "../types";
import { AIEnhancedFinding, AIReportSummary, AIEnrichmentOptions } from "./types";
import { processFindingWithLLM } from "./client";

export * from "./types";

export async function enrichFindingsWithAI(
  findings: Finding[],
  options?: AIEnrichmentOptions
): Promise<AIReportSummary> {
  const hasKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!hasKey) {
    console.warn("No LLM API Key (GEMINI_API_KEY or OPENAI_API_KEY) configured. Operating in 100% deterministic mode.");
  }

  const enrichedFindings: AIEnhancedFinding[] = [];

  for (const finding of findings) {
    // Deterministic first priority: Only invoke Gemini for ambiguous findings
    if (hasKey && isAmbiguousFinding(finding)) {
      const enriched = await processFindingWithLLM(finding, options);
      enrichedFindings.push(enriched);
    } else {
      enrichedFindings.push(finding);
    }
  }

  const markdownSummary = generatePRMarkdownSummary(enrichedFindings);

  return {
    markdownSummary,
    findings: enrichedFindings,
  };
}

function isAmbiguousFinding(finding: Finding): boolean {
  // Flag ambiguous cases (dynamic imports, cross-package conflicts, unresolvable versions)
  if ((finding as any).isAmbiguous) return true;
  if (finding.type === "cross_package_version_conflict") return true;
  if (finding.reasoning.toLowerCase().includes("dynamic") || finding.reasoning.toLowerCase().includes("ambiguous")) return true;
  return false;
}

function generatePRMarkdownSummary(findings: AIEnhancedFinding[]): string {
  let md = "## DepDrift AI Risk & Remediation Analysis\n\n";

  if (findings.length === 0) {
    return md + "No dependency drift detected.";
  }

  md += "| Severity | Dependency | Scope | Risk & Explanation | Suggested Fix |\n";
  md += "| --- | --- | --- | --- | --- |\n";

  for (const f of findings) {
    const badge = f.severity.toUpperCase();
    const explanation = f.aiAnalysis?.explanation || f.reasoning;
    const fix = f.aiAnalysis?.recommendedFix || f.suggestedFix;
    md += `| ${badge} | \`${f.dependency}\` | \`${f.fromPackage}\` | ${explanation} | \`${fix}\` |\n`;
  }

  const patches = findings.filter((f) => f.aiAnalysis?.patch);
  if (patches.length > 0) {
    md += "\n### Automated Code Patches\n";
    for (const f of patches) {
      if (f.aiAnalysis?.patch) {
        md += `\n**Target File:** \`${f.aiAnalysis.patch.file}\`\n`;
        md += "```diff\n" + f.aiAnalysis.patch.diff + "\n```\n";
      }
    }
  }

  return md;
}