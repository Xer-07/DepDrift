import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Finding } from "./types";

export function generateReport(findings: Finding[], outputDir: string = process.cwd()): string {
  // 1. Write JSON Report
  const jsonPath = path.join(outputDir, "depdrift-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2), "utf8");

  // 2. Terminal Print Summary
  console.log("\n" + chalk.bold.cyan("========================================"));
  console.log(chalk.bold.cyan("            DEPDRIFT REPORT"));
  console.log(chalk.bold.cyan("========================================\n"));

  const high = findings.filter(f => f.severity === "high");
  const medium = findings.filter(f => f.severity === "medium");
  const low = findings.filter(f => f.severity === "low");

  if (findings.length === 0) {
    console.log(chalk.bold.green("✨ Clean repo! Zero dependency drift findings detected.\n"));
  } else {
    // Print High Severity
    if (high.length > 0) {
      console.log(chalk.bold.red(`🔴 HIGH SEVERITY FINDINGS (${high.length})`));
      console.log(chalk.red("----------------------------------------"));
      for (const f of high) {
        printFinding(f);
      }
    }

    // Print Medium Severity
    if (medium.length > 0) {
      console.log(chalk.bold.yellow(`\n🟡 MEDIUM SEVERITY FINDINGS (${medium.length})`));
      console.log(chalk.yellow("----------------------------------------"));
      for (const f of medium) {
        printFinding(f);
      }
    }

    // Print Low Severity
    if (low.length > 0) {
      console.log(chalk.bold.blue(`\n🔵 LOW SEVERITY FINDINGS (${low.length})`));
      console.log(chalk.blue("----------------------------------------"));
      for (const f of low) {
        printFinding(f);
      }
    }
  }

  // Summary footer
  console.log("\n" + chalk.bold("----------------------------------------"));
  console.log(chalk.bold("SUMMARY"));
  console.log(chalk.bold("----------------------------------------"));
  console.log(`${chalk.red(`🔴 ${high.length} High`)} | ${chalk.yellow(`🟡 ${medium.length} Medium`)} | ${chalk.blue(`🔵 ${low.length} Low`)}`);
  console.log(chalk.gray(`\nDetailed JSON report generated at: ${jsonPath}\n`));

  return jsonPath;
}

function printFinding(f: Finding) {
  const badge = f.severity === "high" ? chalk.bgRed.black(" HIGH ") : f.severity === "medium" ? chalk.bgYellow.black(" MEDIUM ") : chalk.bgBlue.black(" LOW ");
  console.log(`\n${badge} ${chalk.bold(f.dependency)} (${chalk.cyan(f.fromPackage)} - ${chalk.magenta(f.ecosystem)})`);
  console.log(`  ${chalk.bold("Type:")} ${f.type}`);
  console.log(`  ${chalk.bold("Reasoning:")} ${f.reasoning}`);
  
  if (f.evidence && f.evidence.length > 0) {
    console.log(`  ${chalk.bold("Evidence:")} ${f.evidence.join(", ")}`);
  }

  if (f.introducedInCommit) {
    console.log(`  ${chalk.bold("Introduced in:")} ${chalk.yellow(f.introducedInCommit.hash.slice(0, 7))} (${f.introducedInCommit.date})`);
  }

  console.log(`  ${chalk.bold.green("Suggested Fix:")} ${chalk.italic(f.suggestedFix)}`);
}
