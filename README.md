# DepDrift

A deterministic static analysis CLI for detecting dependency drift, undeclared imports, and manifest desynchronization in Node.js and Python projects.

---

## 1. Problem Statement

In modern software development, dependency management frequently suffers from desynchronization across three distinct layers:

1. **Declared Manifests**: Dependencies declared in `package.json`, `requirements.txt`, or `pyproject.toml`.
2. **Actual Code Invocations**: Modules imported or required within source code files (`.ts`, `.tsx`, `.js`, `.py`).
3. **Resolved Lockfiles and History**: Versions pinned in `package-lock.json` or modified across Git commit histories.

Discrepancies across these layers cause critical issues:
* **Undeclared Runtime Dependencies**: Source files importing external packages that are missing from manifest declarations, causing runtime module resolution failures in production builds.
* **Unnecessary Bloat**: Manifests declaring packages that are no longer imported in source code.
* **Unnoticed Version Drift**: Differences between declared version constraints and lockfile resolutions across workspace subprojects.

---

## 2. Solution Overview

DepDrift provides a CLI tool that performs deterministic AST-based code analysis and manifest verification without relying on runtime execution.

Key capabilities include:
* **AST Source Scanning**: Parses TypeScript, JavaScript (`ts-morph`), and Python source files to extract actual import specifiers and map them to owning packages.
* **Manifest & Lockfile Matching**: Extracts declared dependency graphs and cross-checks them against lockfile resolutions and source imports.
* **Git History Attribution**: Traces commit histories to identify the specific commit and date that introduced a dependency drift.
* **Polyglot & Monorepo Support**: Discovers and evaluates multiple workspace packages within Node.js monorepos and Python environments simultaneously.

---

## 3. System Architecture & Workflow

```
[CLI Target Input: Local Path or GitHub URL]
                         │
                         ▼
             [Repository Ingestion]
                         │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
[Node.js Detector]               [Python Detector]
 (ts-morph AST)                   (PEP 508 / TOML)
       │                                   │
       └─────────────────┬─────────────────┘
                         ▼
        [Graph Resolution & Analysis]
        - Actual Import Graph vs Declared Graph
        - Git History Commit Attribution
                         │
                         ▼
            [Structured Report Routing]
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
reports/local/     reports/github/    reports/history/
```

---

## 4. Installation & Usage

### Prerequisites
* Node.js v18 or higher
* npm

### Build CLI
```bash
npm install --prefix tools/depdrift
npm --prefix tools/depdrift run build
```

### Run Scans

#### Local Workspace Scan
```bash
node tools/depdrift/dist/index.js scan .
```

#### Subpackage Scan
```bash
node tools/depdrift/dist/index.js scan packages/app
```

#### Remote GitHub Repository Scan
```bash
node tools/depdrift/dist/index.js scan https://github.com/user/repository
```

#### Git History Annotated Scan
```bash
node tools/depdrift/dist/index.js scan . --history --commits=50
```

---

## 5. Output Contract

Scans generate two output artifacts routed to `reports/<local|github|history>/`:

1. **`depdrift-report.json`**: Structured JSON containing findings, severity levels, file evidence, commit hashes, and suggested fixes.
2. **`depdrift-report.html`**: A visual summary report for interactive inspection.

### Finding Severity Levels
* **HIGH**: Missing dependency imported in main entrypoints or source files (risk of production runtime crash).
* **MEDIUM**: Version constraint mismatch between declared ranges and resolved lockfile versions.
* **LOW**: Unnecessary dependency declared in manifest but never imported in source code.
