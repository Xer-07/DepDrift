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
    console.warn("⚠️  No LLM API Key (OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY) configured. Returning raw findings.");
  }

  const enrichedFindings: AIEnhancedFinding[] = [];

  for (const finding of findings) {
    if (hasKey) {
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

function generatePRMarkdownSummary(findings: AIEnhancedFinding[]): string {
  let md = "## 🛡️ DepDrift AI Risk & Remediation Analysis\n\n";

  if (findings.length === 0) {
    return md + "✅ No dependency drift detected.";
  }

  md += "| Severity | Dependency | Scope | Risk & Explanation | Suggested Fix |\n";
  md += "| --- | --- | --- | --- | --- |\n";

  for (const f of findings) {
    const badge = f.severity === "high" ? "🔴 HIGH" : f.severity === "medium" ? "🟡 MEDIUM" : "🔵 LOW";
    const explanation = f.aiAnalysis?.explanation || f.reasoning;
    const fix = f.aiAnalysis?.recommendedFix || f.suggestedFix;
    md += `| ${badge} | \`${f.dependency}\` | \`${f.fromPackage}\` | ${explanation} | \`${fix}\` |\n`;
  }

  const patches = findings.filter((f) => f.aiAnalysis?.patch);
  if (patches.length > 0) {
    md += "\n### 🛠️ Automated Code Patches\n";
    for (const f of patches) {
      if (f.aiAnalysis?.patch) {
        md += `\n**Target File:** \`${f.aiAnalysis.patch.file}\`\n`;
        md += "```diff\n" + f.aiAnalysis.patch.diff + "\n```\n";
      }
    }
  }

  return md;
}