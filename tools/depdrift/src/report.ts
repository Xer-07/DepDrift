import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { Finding } from "./types";

export function generateReport(findings: Finding[], outputDir: string = process.cwd()): string {
  // 1. Write JSON Report
  const jsonPath = path.join(outputDir, "depdrift-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2), "utf8");

  // 2. Write HTML Report
  const htmlPath = path.join(outputDir, "depdrift-report.html");
  const htmlContent = generateHtmlReport(findings);
  fs.writeFileSync(htmlPath, htmlContent, "utf8");

  // 3. Terminal Print Summary (Top 3 per severity)
  console.log("\n" + chalk.bold.cyan("========================================"));
  console.log(chalk.bold.cyan("            DEPDRIFT REPORT"));
  console.log(chalk.bold.cyan("========================================\n"));

  const high = findings.filter(f => f.severity === "high");
  const medium = findings.filter(f => f.severity === "medium");
  const low = findings.filter(f => f.severity === "low");

  if (findings.length === 0) {
    console.log(chalk.bold.green("✨ Clean repo! Zero dependency drift findings detected.\n"));
  } else {
    // Print Top 3 High Severity
    if (high.length > 0) {
      console.log(chalk.bold.red(`🔴 HIGH SEVERITY FINDINGS (Showing Top 3 of ${high.length})`));
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
      console.log(chalk.bold.yellow(`\n🟡 MEDIUM SEVERITY FINDINGS (Showing Top 3 of ${medium.length})`));
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
      console.log(chalk.bold.blue(`\n🔵 LOW SEVERITY FINDINGS (Showing Top 3 of ${low.length})`));
      console.log(chalk.blue("----------------------------------------"));
      for (const f of low.slice(0, 3)) {
        printFinding(f);
      }
      if (low.length > 3) {
        console.log(chalk.dim(`\n  ... plus ${low.length - 3} more LOW severity findings (see HTML report for complete list)`));
      }
    }
  }

  // Summary footer (Displays entire counts)
  console.log("\n" + chalk.bold("----------------------------------------"));
  console.log(chalk.bold("TOTAL SUMMARY COUNT"));
  console.log(chalk.bold("----------------------------------------"));
  console.log(`${chalk.red(`🔴 ${high.length} High`)} | ${chalk.yellow(`🟡 ${medium.length} Medium`)} | ${chalk.blue(`🔵 ${low.length} Low`)} | Total: ${findings.length}`);
  console.log(chalk.bold.green(`\n📄 HTML Report generated at: ${htmlPath}`));
  console.log(chalk.gray(`📊 JSON Report generated at: ${jsonPath}\n`));

  return htmlPath;
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

function generateHtmlReport(findings: Finding[]): string {
  const highCount = findings.filter(f => f.severity === "high").length;
  const mediumCount = findings.filter(f => f.severity === "medium").length;
  const lowCount = findings.filter(f => f.severity === "low").length;
  const timestamp = new Date().toLocaleString();

  const safeJson = JSON.stringify(findings).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DepDrift - Analysis Report</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --high: #ef4444;
      --high-bg: rgba(239, 68, 68, 0.1);
      --medium: #f59e0b;
      --medium-bg: rgba(245, 158, 11, 0.1);
      --low: #3b82f6;
      --low-bg: rgba(59, 130, 246, 0.1);
      --code-bg: #030712;
      --accent: #10b981;
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
    .title-area h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
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
    }
    .stat-pill.high { color: var(--high); border-color: rgba(239, 68, 68, 0.3); background: var(--high-bg); }
    .stat-pill.medium { color: var(--medium); border-color: rgba(245, 158, 11, 0.3); background: var(--medium-bg); }
    .stat-pill.low { color: var(--low); border-color: rgba(59, 130, 246, 0.3); background: var(--low-bg); }
    
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
    }
    .search-input:focus { border-color: var(--low); }
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
    }
    .filter-btn.active, .filter-btn:hover {
      color: #fff;
      border-color: var(--text-muted);
      background: #1f2937;
    }

    .findings-list { display: flex; flex-direction: column; gap: 1rem; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      transition: border-color 0.15s ease;
    }
    .card:hover { border-color: #374151; }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }
    .card-title-group { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .dep-name { font-size: 1.1rem; font-weight: 600; color: #fff; }
    .pkg-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #1f2937;
      color: #d1d5db;
      font-family: monospace;
    }
    .eco-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #374151;
      color: #e5e7eb;
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
    .badge.high { background: var(--high); color: #000; }
    .badge.medium { background: var(--medium); color: #000; }
    .badge.low { background: var(--low); color: #fff; }

    .meta-row { display: flex; gap: 1.5rem; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.75rem; flex-wrap: wrap; }
    .meta-item strong { color: var(--text); font-weight: 500; }

    .reasoning {
      font-size: 0.9rem;
      color: #e5e7eb;
      margin-bottom: 1rem;
      padding: 0.6rem 0.8rem;
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid var(--border);
      border-radius: 0 4px 4px 0;
    }
    .card.high .reasoning { border-left-color: var(--high); }
    .card.medium .reasoning { border-left-color: var(--medium); }
    .card.low .reasoning { border-left-color: var(--low); }

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
    .fix-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875rem; color: #a7f3d0; word-break: break-all; }
    
    .empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-area">
        <h1>DepDrift Analysis Report</h1>
        <p>Generated on ${timestamp}</p>
      </div>
      <div class="stats-bar">
        <div class="stat-pill high">🔴 ${highCount} High</div>
        <div class="stat-pill medium">🟡 ${mediumCount} Medium</div>
        <div class="stat-pill low">🔵 ${lowCount} Low</div>
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
          '<div class="fix-box">' +
            '<div>' +
              '<div class="fix-label">Suggested Fix</div>' +
              '<div class="fix-code">' + escapeHtml(f.suggestedFix) + '</div>' +
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
