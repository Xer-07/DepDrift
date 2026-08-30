import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { AIEnhancedFinding } from "./ai/types";

export function generateReport(
  findings: AIEnhancedFinding[],
  outputDir: string = process.cwd(),
  markdownSummary?: string
): void {
  const reportPath = path.join(outputDir, "depdrift-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(findings, null, 2));

  if (markdownSummary) {
    const mdPath = path.join(outputDir, "depdrift-pr-comment.md");
    fs.writeFileSync(mdPath, markdownSummary);
    console.log(chalk.magenta(`\n📄 PR Comment Markdown saved to ${mdPath}`));
  }

  console.log(chalk.bold("\n=== DEPDRIFT ANALYSIS REPORT ===\n"));

  if (findings.length === 0) {
    console.log(chalk.green("✔ No dependency drift detected!"));
    return;
  }

  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  if (high.length > 0) {
    console.log(chalk.red.bold(`🔴 HIGH SEVERITY (${high.length})`));
    high.forEach(printFinding);
  }

  if (medium.length > 0) {
    console.log(chalk.yellow.bold(`🟡 MEDIUM SEVERITY (${medium.length})`));
    medium.forEach(printFinding);
  }

  if (low.length > 0) {
    console.log(chalk.blue.bold(`🔵 LOW SEVERITY (${low.length})`));
    low.forEach(printFinding);
  }

  console.log(chalk.gray(`\nReport written to ${reportPath}`));
}

function printFinding(f: AIEnhancedFinding) {
  console.log(`  • [${f.dependency}] in ${f.fromPackage}`);
  console.log(`    Reasoning: ${f.reasoning}`);
  if (f.aiAnalysis) {
    console.log(`    🤖 AI Explanation: ${chalk.white(f.aiAnalysis.explanation)}`);
    if (f.aiAnalysis.impact) {
      console.log(`    ⚠️  AI Impact Assessment: ${chalk.yellow(f.aiAnalysis.impact)}`);
    }
  }
  console.log(`    Fix: ${chalk.cyan(f.aiAnalysis?.recommendedFix || f.suggestedFix)}\n`);
}