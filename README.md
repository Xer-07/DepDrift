# DepDrift

A polyglot dependency intelligence engine providing deterministic AST static analysis, Git commit history attribution, Gemini AI remediation for ambiguous dynamic imports, and an interactive web dashboard for Node.js and Python monorepos.

---

## 1. The Problem

Modern multi-package software development suffers from desynchronization across three distinct architectural layers:

1. **Declared Manifests**: Package declarations in `package.json`, `requirements.txt`, or `pyproject.toml`.
2. **Actual Code Invocations**: Source code imports (`import`, `require()`, dynamic `import()`) across `.ts`, `.tsx`, `.js`, `.py` files.
3. **Resolved Lockfiles & History**: Versions pinned in `package-lock.json` or introduced across Git commit history.

Discrepancies across these layers cause critical issues:
* **Undeclared Runtime Dependencies**: Source files importing external packages missing from manifest declarations. While local development may succeed due to `node_modules` hoisting, isolated production builds (`turbo run build` or Docker containers) crash with module resolution errors.
* **Dependency Bloat**: Manifests declaring heavy packages that are never imported in source code.
* **Version Drift**: Version mismatches between declared constraints and lockfile resolutions across workspace packages.

---

## 2. Key Capabilities & Pipeline Architecture

* **AST Source Scanning**: Uses `@babel/parser` and `@babel/traverse` (Node.js) alongside Python regex detectors to parse source files and map imported modules to owning packages.
* **Manifest & Lockfile Matching**: Cross-checks observed source code imports against declared manifests and resolved lockfiles.
* **Git History Attribution (`--history`)**: Traces commit histories (`git log` & `git blame`) to pinpoint the exact commit hash, date, author, and message that introduced a dependency drift.
* **Deterministic First + Gemini AI Reasoning**: Evaluates standard static findings 100% deterministically. Ambiguous findings (such as variable dynamic imports) automatically invoke the **Gemini AI Layer** to reason about runtime safety and generate code fixes.
* **Editorial Web Dashboard**: Real-time interactive UI built with Vite, React, TanStack Router, Recharts, and React Flow (`@xyflow/react`) to explore dependency graphs, severity distribution, and commit timelines.

---

## 3. End-to-End Pipeline Architecture

```
                      [CLI / GitHub Repository Input]
                                     │
                                     ▼
                        [Repository Ingestion]
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  [Node.js AST Detector]                              [Python AST Detector]
  (Babel Parser & Traverse)                           (PEP 508 / Manifests)
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                       [Deterministic Graph Resolution]
                       - Source Imports vs Manifests
                       - Git History Commit Blame
                                     │
                                     ▼
                       { Is Finding Ambiguous? }
                      ┌──────────────┴──────────────┐
                      │ YES                         │ NO
                      ▼                             ▼
             [Gemini AI Layer]             [Deterministic Rule Engine]
             (Dynamic import fix)          (Static rule remediation)
                      │                             │
                      └──────────────┬──────────────┘
                                     ▼
                       [Structured Report Generation]
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
reports/local/             reports/local/             reports/local/
depdrift-report.json       depdrift-report.html       depdrift-pr-comment.md
                                     │
                                     ▼
                         [Interactive Web Dashboard]
                         (Vite + React Flow + Recharts)
```

---

## 4. Setup & Environment Configuration

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Environment Variables
Create a `.env` file in the project root to enable Gemini AI dynamic import reasoning:
```bash
cp .env.example .env
```
In `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## 5. Usage & CLI Commands

### 1. Run Local Repository Scan (with Git History)
```bash
npx ts-node tools/depdrift/src/index.ts scan . --history --out reports/local/depdrift-report.json
```

### 2. Scan Subpackage
```bash
npx ts-node tools/depdrift/src/index.ts scan packages/app --history
```

### 3. Scan Remote Public GitHub Repository
```bash
npx ts-node tools/depdrift/src/index.ts scan https://github.com/palantir/blueprint --history
```

### 4. Launch Interactive Web Dashboard
```bash
# Option A: From dashboard directory
cd dashboard
npx vite

# Option B: From project root
npm --prefix dashboard run dev
```
Open **`http://localhost:8080`** (or `http://localhost:8081`) to explore the interactive dashboard.

---

## 6. Output Artifacts

Scans generate three structured report artifacts in `reports/local/`:

1. **`depdrift-report.json`**: Full machine-readable report containing findings, severity breakdown, file evidence, commit attribution, and suggested fixes.
2. **`depdrift-report.html`**: A visually styled HTML report for quick local browser inspection.
3. **`depdrift-pr-comment.md`**: Markdown summary ready for CI/CD integration and GitHub Pull Request comments.

### Finding Severity Levels
* **HIGH**: Missing dependency imported in source code but not declared in package manifest (risk of runtime production failure).
* **MEDIUM**: Version constraint mismatch between manifest declarations and lockfile resolutions.
* **LOW**: Unnecessary dependency declared in manifest but never imported in source code.
