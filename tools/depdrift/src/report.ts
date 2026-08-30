import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { Finding } from "./types";
import { AIEnhancedFinding } from "./ai/types";

export type ReportType = "local" | "github" | "history";

export function generateReport(
  findings: AIEnhancedFinding[],
  reportType: ReportType = "local",
  baseDir: string = process.cwd(),
  markdownSummary?: string
): void {
  const outputDir = path.join(baseDir, "reports", reportType);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Write JSON Report
  const jsonPath = path.join(outputDir, "depdrift-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2), "utf8");

  // Also mirror json report at repository root or reports/local/ for easy fetching by dashboard if needed
  const localJsonPath = path.join(baseDir, "reports", "local", "depdrift-report.json");
  if (jsonPath !== localJsonPath) {
    const localDir = path.dirname(localJsonPath);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(localJsonPath, JSON.stringify(findings, null, 2), "utf8");
  }

  // 2. Write HTML Report
  const htmlPath = path.join(outputDir, "depdrift-report.html");
  const htmlContent = generateHtmlReport(findings, reportType);
  fs.writeFileSync(htmlPath, htmlContent, "utf8");

  // 3. Write PR Markdown Summary if provided
  if (markdownSummary) {
    const mdPath = path.join(outputDir, "depdrift-pr-comment.md");
    fs.writeFileSync(mdPath, markdownSummary, "utf8");
    console.log(chalk.magenta(`\n📄 PR Comment Markdown saved to ${mdPath}`));
  }

  console.log(chalk.bold("\n========================================"));
  console.log(chalk.bold("            DEPDRIFT REPORT            "));
  console.log(chalk.bold("========================================\n"));

  if (findings.length === 0) {
    console.log(chalk.bold.green("Clean repository. Zero dependency drift findings detected.\n"));
    return;
  }

  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  // Print Top 3 High Severity
  if (high.length > 0) {
    console.log(chalk.bold.red(`HIGH SEVERITY FINDINGS (Showing Top 3 of ${high.length})`));
    console.log(chalk.red("----------------------------------------"));
    for (const f of high.slice(0, 3)) {
      printFinding(f);
    }
    if (high.length > 3) {
      console.log(chalk.dim(`\n  ... plus ${high.length - 3} more HIGH severity findings (see HTML report for complete list)`));
    }
  }

  // Print Top 3 Medium Severity
  if (medium.length > 0) {
    console.log(chalk.bold.yellow(`\nMEDIUM SEVERITY FINDINGS (Showing Top 3 of ${medium.length})`));
    console.log(chalk.yellow("----------------------------------------"));
    for (const f of medium.slice(0, 3)) {
      printFinding(f);
    }
    if (medium.length > 3) {
      console.log(chalk.dim(`\n  ... plus ${medium.length - 3} more MEDIUM severity findings (see HTML report for complete list)`));
    }
  }

  // Print Top 3 Low Severity
  if (low.length > 0) {
    console.log(chalk.bold.blue(`\nLOW SEVERITY FINDINGS (Showing Top 3 of ${low.length})`));
    console.log(chalk.blue("----------------------------------------"));
    for (const f of low.slice(0, 3)) {
      printFinding(f);
    }
    if (low.length > 3) {
      console.log(chalk.dim(`\n  ... plus ${low.length - 3} more LOW severity findings (see HTML report for complete list)`));
    }
  }

  // Summary footer
  console.log("\n" + chalk.bold("----------------------------------------"));
  console.log(chalk.bold("TOTAL SUMMARY COUNT"));
  console.log(chalk.bold("----------------------------------------"));
  console.log(`${chalk.red(`${high.length} High`)} | ${chalk.yellow(`${medium.length} Medium`)} | ${chalk.blue(`${low.length} Low`)} | Total: ${findings.length}`);
  console.log(chalk.bold.green(`\nHTML Report generated at: ${htmlPath}`));
  console.log(chalk.gray(`JSON Report generated at: ${jsonPath}\n`));
}

function printFinding(f: AIEnhancedFinding) {
  const sevLabel = f.severity.toUpperCase();
  console.log(`\n ${sevLabel === "HIGH" ? chalk.bgRed.white(` ${sevLabel} `) : sevLabel === "MEDIUM" ? chalk.bgYellow.black(` ${sevLabel} `) : chalk.bgBlue.white(` ${sevLabel} `)}  ${chalk.bold(f.dependency)} (${f.fromPackage} - ${f.ecosystem})`);
  console.log(`  Type: ${f.type}`);
  console.log(`  Reasoning: ${f.reasoning}`);
  if (f.aiAnalysis) {
    console.log(`  AI Explanation: ${chalk.white(f.aiAnalysis.explanation)}`);
    if (f.aiAnalysis.impact) {
      console.log(`  AI Impact: ${chalk.yellow(f.aiAnalysis.impact)}`);
    }
  }
  if (f.evidence && f.evidence.length > 0) {
    console.log(`  Evidence: ${f.evidence.join(", ")}`);
  }
  if (f.introducedInCommit) {
    console.log(`  Commit: ${f.introducedInCommit.hash.slice(0, 7)} (${f.introducedInCommit.date})`);
  }
  console.log(`  Suggested Fix: ${chalk.green(f.aiAnalysis?.recommendedFix || f.suggestedFix)}`);
}

function generateHtmlReport(findings: AIEnhancedFinding[], reportType: ReportType = "local"): string {
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;
  const timestamp = new Date().toLocaleString();
  const reportTypeLabel = reportType === "github" ? "GitHub Remote Scan" : reportType === "history" ? "Git History Scan" : "Local Scan";

  const safeJson = JSON.stringify(findings).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DepDrift - Analysis Report</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #475569;
      --high: #dc2626;
      --high-bg: #fef2f2;
      --high-border: #fca5a5;
      --medium: #d97706;
      --medium-bg: #fffbeb;
      --medium-border: #fcd34d;
      --low: #2563eb;
      --low-bg: #eff6ff;
      --low-border: #bfdbfe;
      --code-bg: #f1f5f9;
      --accent: #16a34a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1rem;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .title-area h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
    .title-area p { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; }
    .stats-bar { display: flex; gap: 0.75rem; }
    .stat-pill {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--card-bg);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .stat-pill.high { color: var(--high); border-color: var(--high-border); background: var(--high-bg); }
    .stat-pill.medium { color: var(--medium); border-color: var(--medium-border); background: var(--medium-bg); }
    .stat-pill.low { color: var(--low); border-color: var(--low-border); background: var(--low-bg); }
    
    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 250px;
      padding: 0.6rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 0.875rem;
      outline: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .search-input:focus { border-color: #0284c7; }
    .filter-btn {
      padding: 0.6rem 1.2rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .filter-btn.active, .filter-btn:hover {
      color: #0f172a;
      border-color: #94a3b8;
      background: #e2e8f0;
    }

    .findings-list { display: flex; flex-direction: column; gap: 1rem; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: border-color 0.15s ease;
    }
    .card:hover { border-color: #cbd5e1; }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }
    .card-title-group { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .dep-name { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    .pkg-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
      font-family: monospace;
    }
    .eco-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #e2e8f0;
      color: #1e293b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge.high { background: var(--high-bg); color: var(--high); border: 1px solid var(--high-border); }
    .badge.medium { background: var(--medium-bg); color: var(--medium); border: 1px solid var(--medium-border); }
    .badge.low { background: var(--low-bg); color: var(--low); border: 1px solid var(--low-border); }

    .meta-row { display: flex; gap: 1.5rem; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.75rem; flex-wrap: wrap; }
    .meta-item strong { color: var(--text); font-weight: 600; }

    .reasoning {
      font-size: 0.9rem;
      color: #334155;
      margin-bottom: 1rem;
      padding: 0.6rem 0.8rem;
      background: #f8fafc;
      border-left: 3px solid var(--border);
      border-radius: 0 4px 4px 0;
    }
    .card.high .reasoning { border-left-color: var(--high); background: var(--high-bg); }
    .card.medium .reasoning { border-left-color: var(--medium); background: var(--medium-bg); }
    .card.low .reasoning { border-left-color: var(--low); background: var(--low-bg); }

    .ai-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #166534;
    }
    .ai-title { font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }

    .fix-box {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .fix-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--accent); }
    .fix-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875rem; color: #0f172a; word-break: break-all; font-weight: 500; }
    
    .empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-area">
        <h1>DepDrift Analysis Report <span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: #1e293b; color: #ffffff; font-family: monospace; vertical-align: middle; text-transform: uppercase;">[${reportTypeLabel}]</span></h1>
        <p>Generated on ${timestamp}</p>
      </div>
      <div class="stats-bar">
        <div class="stat-pill high">High: ${highCount}</div>
        <div class="stat-pill medium">Medium: ${mediumCount}</div>
        <div class="stat-pill low">Low: ${lowCount}</div>
      </div>
    </header>

    <div class="controls">
      <input type="text" id="searchInput" class="search-input" placeholder="Search dependency or package name...">
      <button class="filter-btn active" data-filter="all">All (${findings.length})</button>
      <button class="filter-btn" data-filter="high">High (${highCount})</button>
      <button class="filter-btn" data-filter="medium">Medium (${mediumCount})</button>
      <button class="filter-btn" data-filter="low">Low (${lowCount})</button>
    </div>

    <div id="findingsContainer" class="findings-list"></div>
  </div>

  <script>
    const findings = ${safeJson};
    let currentFilter = 'all';
    let searchQuery = '';

    const container = document.getElementById('findingsContainer');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function render() {
      const filtered = findings.filter(f => {
        const matchesSeverity = currentFilter === 'all' || f.severity === currentFilter;
        const matchesSearch = !searchQuery || 
          f.dependency.toLowerCase().includes(searchQuery) ||
          f.fromPackage.toLowerCase().includes(searchQuery) ||
          f.reasoning.toLowerCase().includes(searchQuery);
        return matchesSeverity && matchesSearch;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No matching dependency drift findings observed.</div>';
        return;
      }

      container.innerHTML = filtered.map(f => {
        const evHtml = f.evidence && f.evidence.length ? '<div class="meta-item"><strong>Evidence:</strong> ' + escapeHtml(f.evidence.join(', ')) + '</div>' : '';
        const commitHtml = f.introducedInCommit ? '<div class="meta-item"><strong>Introduced in:</strong> ' + escapeHtml(f.introducedInCommit.hash.slice(0, 7)) + ' (' + escapeHtml(f.introducedInCommit.date) + ')</div>' : '';
        const aiHtml = f.aiAnalysis ? '<div class="ai-box"><div class="ai-title">AI Analysis</div><div>' + escapeHtml(f.aiAnalysis.explanation) + '</div>' + (f.aiAnalysis.impact ? '<div style="margin-top:0.25rem; font-weight:600;">Impact: ' + escapeHtml(f.aiAnalysis.impact) + '</div>' : '') + '</div>' : '';

        const fixText = f.aiAnalysis && f.aiAnalysis.recommendedFix ? f.aiAnalysis.recommendedFix : f.suggestedFix;

        return '<div class="card ' + f.severity + '">' +
          '<div class="card-header">' +
            '<div class="card-title-group">' +
              '<span class="badge ' + f.severity + '">' + f.severity + '</span>' +
              '<span class="dep-name">' + escapeHtml(f.dependency) + '</span>' +
              '<span class="pkg-tag">' + escapeHtml(f.fromPackage) + '</span>' +
              '<span class="eco-tag">' + escapeHtml(f.ecosystem) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="meta-row">' +
            '<div class="meta-item"><strong>Type:</strong> ' + escapeHtml(f.type) + '</div>' +
            evHtml + commitHtml +
          '</div>' +
          '<div class="reasoning">' + escapeHtml(f.reasoning) + '</div>' +
          aiHtml +
          '<div class="fix-box">' +
            '<div>' +
              '<div class="fix-label">Suggested Fix</div>' +
              '<div class="fix-code">' + escapeHtml(fixText) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value.toLowerCase().trim();
      render();
    });

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        render();
      });
    });

    render();
  </script>
</body>
</html>`;
}
