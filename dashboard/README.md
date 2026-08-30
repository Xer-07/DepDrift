# Dependency Drift Dashboard

# DepDrift — Person 4 Frontend Implementation Prompt

Build a **hackathon-ready frontend-only web dashboard** called **DepDrift**.

DepDrift is a developer security/dependency-analysis tool that detects dependency drift in Node.js, Python, and polyglot repositories.

## IMPORTANT SCOPE

I am **Person 4**, responsible only for the frontend/demo layer.

### DO NOT:

* Build a backend.
* Build a database.
* Modify the existing CLI engine.
* Implement dependency scanning.
* Reimplement dependency analysis.
* Modify `tools/depdrift`.
* Invent a different Finding data model.

The existing CLI already generates:

`depdrift-report.json`

The frontend must be designed to consume that report later.

For the initial implementation, use **realistic mock data matching the existing `Finding[]` schema**.

---

# TECH STACK

Use:

* React
* TypeScript
* Vite or Next.js
* Tailwind CSS
* Lucide React icons
* React Flow for the dependency graph
* Recharts for timeline/metrics if needed

Keep the code component-based and easy to connect to a real JSON report later.

---

# DESIGN DIRECTION

Create a premium developer-tool interface.

Theme:

* Dark
* Technical
* Modern
* High information density
* Professional hackathon presentation quality
* Excellent typography
* Responsive
* Subtle animations
* Clear hierarchy

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Generic AI-dashboard styling
* Huge empty spaces
* Cartoon-like UI
* Unnecessary decorative elements

Suggested colors:

Background:
`#0B0F14`

Panels:
`#111820`

Borders:
`#1E293B`

Primary text:
`#F8FAFC`

Secondary text:
`#94A3B8`

Severity colors:

HIGH → red

MEDIUM → amber/yellow

LOW → blue

---

# APPLICATION STRUCTURE

Create these main views:

1. Scan Repository
2. Dashboard
3. Finding Details
4. Git History

Use a persistent sidebar navigation.

Sidebar:

DepDrift

* Dashboard
* Scan Repository
* Findings
* Git History

---

# 1. SCAN REPOSITORY PAGE

Create a polished repository ingestion screen.

Header:

"Scan Repository"

Subtitle:

"Analyze dependency health, drift, and historical changes."

Provide an input:

Placeholder:

`https://github.com/owner/repository`

The input must also accept local paths.

Example:

`C:\projects\my-app`

Add:

**Scan Repository**

button.

Also provide a small option/toggle for:

* GitHub URL
* Local Repository

When the user clicks Scan Repository, show a realistic mock scanning progress interface.

Progress steps:

✓ Repository connected

✓ Ecosystem detected

✓ Dependencies analyzed

✓ Drift detected

✓ Report generated

Do not actually scan anything.

After mock scanning completes, navigate to Dashboard.

---

# 2. DASHBOARD PAGE

This is the most important screen.

At the top show:

Repository:

`demo-project`

Repository URL/path.

Then summary cards.

## SUMMARY CARDS

Display:

### High Severity

Example:

`5`

Subtitle:

`Immediate build/runtime risk`

### Medium Severity

Example:

`4`

Subtitle:

`Potential dependency risk`

### Low Severity

Example:

`3`

Subtitle:

`Dependency bloat`

Also show:

### Total Findings

Example:

`12`

Use strong visual hierarchy.

---

# DEPENDENCY HEALTH OVERVIEW

Add a compact visualization showing:

High
Medium
Low

Use a donut/bar chart if appropriate.

The chart must be clean and readable in dark mode.

---

# DEPENDENCY GRAPH

Create a large interactive React Flow graph.

Title:

`Dependency Graph`

Subtitle:

`Package relationships and detected dependency drift`

Example nodes:

`packages/app`

`packages/ui`

`lodash`

`axios`

`numpy`

`flask`

`requests`

Show package/dependency relationships.

Edges must communicate relationship state:

GREEN:
Declared & used

RED:
Missing dependency/import

AMBER:
Version conflict/drift

Nodes should display:

* package name
* ecosystem
* status

Allow:

* zoom
* pan
* node selection
* minimap if visually appropriate

When a node is clicked, show a small details panel containing its dependency information.

Make this section visually impressive because it is a major hackathon demo feature.

---

# DRIFT TIMELINE

Create a timeline visualization.

Show historical dependency changes.

Example:

Commit A
↓
Commit B
↓
Commit C 🔴 Drift Introduced
↓
Commit D
↓
Current

Each important commit should display:

* short hash
* date
* dependency
* change
* severity if applicable

Clicking a commit should open its details.

---

# DETECTED DRIFT

Create a professional findings table/list.

Title:

`Detected Drift`

Add controls:

Search

Severity filter:

* All
* High
* Medium
* Low

Ecosystem filter:

* All
* Node
* Python

Drift type filter.

Search should filter by:

* dependency
* package
* reasoning
* commit

Each finding row/card must display:

Dependency

From Package

Ecosystem

Type

Severity

Reasoning

Evidence

Introduced Commit

Suggested Fix

---

# FINDING DATA MODEL

IMPORTANT:

Do NOT invent a new schema.

The frontend should map directly to the team's existing `Finding[]` report structure from:

`tools/depdrift/src/types.ts`

Create a TypeScript interface/type in the frontend that mirrors the actual schema.

If the exact schema is available in the repository, inspect and use it.

If it is not available during frontend generation, create a temporary adapter/mock type that can easily be replaced with the actual exported fields.

The frontend architecture should have a clear report adapter such as:

`reportAdapter.ts`

This should transform:

`depdrift-report.json`

into the UI model without changing the underlying report format.

---

# FINDING DETAILS PAGE

This is the main **judge WOW screen**.

When the user clicks a finding such as:

`lodash`

open a detailed finding view.

Display:

## Dependency

`lodash`

## From Package

`app`

## Ecosystem

`node`

## Expected Version

`^4.17.0`

## Actual Version

`4.17.21`

## Type

`version_drift`

## Severity

`HIGH`

---

## WHY?

Display the reasoning directly from the report.

Example:

"The resolved version falls outside the declared dependency range, creating potential breaking-change risk."

Do not invent reasoning when real report data is available.

---

## EVIDENCE

Display evidence file paths such as:

`package.json`

`package-lock.json`

Make file paths visually distinct and copyable.

---

## INTRODUCED IN

Show:

Commit:

`8f21a9`

Date:

`2026-08-29`

Make the commit hash a clickable-looking badge.

---

## SUGGESTED FIX

Create a prominent code box.

Example:

`npm install lodash@4.17.21`

Add a copy button.

When clicked:

* copy fix command to clipboard
* show "Copied" state

This section should look polished and useful during a live demo.

---

# GIT HISTORY PAGE

Create a dedicated historical visualization.

Header:

`Git History`

Subtitle:

`Trace exactly when dependency drift was introduced.`

Display a vertical commit timeline.

Example:

Commit A
│
├── dependency state
│
▼
Commit B
│
├── package.json changed
│
▼
Commit C
│
🔴 DRIFT INTRODUCED
│
▼
Current

Each commit should show:

Commit hash

Date

Author if available

Dependency change

Drift status

Clicking a commit opens a details panel.

---

# DEMO FIXTURES

The repository contains these fixtures:

`tools/depdrift/test-fixtures/monorepo`

Node.js

Demo:

`@demo/utils` missing in `@demo/app` entrypoint

---

`tools/depdrift/test-fixtures/python`

Python

Demo:

`numpy` missing in `main.py`

`flask` unused dependency bloat

---

`tools/depdrift/test-fixtures/polyglot`

Polyglot

Demo:

`lodash` in TypeScript

`urllib3` in Python

---

`tools/depdrift/test-fixtures/conflict`

Node.js monorepo

Demo:

`lodash ^4.17.0` vs `^3.0.0`

cross-package version conflict

---

# DEMO REPOSITORY SELECTOR

Add a small demo selector on the Scan page or Dashboard.

Options:

* Monorepo
* Python
* Polyglot
* Version Conflict

Selecting one should load its corresponding mock report.

This is ONLY for frontend demonstration.

Do not execute the real CLI.

The architecture must make it easy to replace mock loading with:

`depdrift-report.json`

later.

---

# COMPONENT STRUCTURE

Use reusable components such as:

`Sidebar`

`TopHeader`

`RepositoryInput`

`ScanProgress`

`MetricCard`

`SeverityBadge`

`FindingTable`

`FindingCard`

`FindingDetails`

`EvidenceList`

`SuggestedFix`

`DependencyGraph`

`GraphNode`

`DriftTimeline`

`CommitTimeline`

`FilterBar`

`DemoFixtureSelector`

---

# MOCK DATA

Create realistic mock report data covering:

* version drift
* missing dependency
* unnecessary dependency
* cross-package version conflict
* Node dependencies
* Python dependencies
* Git history

Example findings:

lodash

ecosystem: node

type: version_drift

expected: ^4.17.0

actual: 4.17.21

severity: HIGH

---

axios

ecosystem: node

type: missing_dependency

severity: MEDIUM

---

numpy

ecosystem: python

type: missing_dependency

severity: HIGH

---

flask

ecosystem: python

type: unnecessary_dependency

severity: LOW

---

# UX REQUIREMENTS

The application should feel like a real security/developer tool.

Important interactions:

1. Scan button shows progress.
2. Dashboard updates with report data.
3. Search filters findings instantly.
4. Severity filter works.
5. Ecosystem filter works.
6. Finding can be selected.
7. Finding details display complete information.
8. Suggested fix can be copied.
9. Dependency graph nodes are interactive.
10. Commit timeline entries are clickable.
11. Demo fixtures can be switched quickly.

---

# FUTURE JSON INTEGRATION

Design the frontend so that later we can replace:

`mockReport`

with:

`depdrift-report.json`

without rewriting the UI.

Create a clear data-loading abstraction:

`loadReport()`

For now:

`loadReport()` returns mock data.

Later:

`loadReport()` should load the real CLI-generated JSON.

---

# FINAL REQUIREMENT

The result must look strong enough for a live hackathon judge demonstration.

Prioritize polish on:

1. Dashboard
2. Finding Details
3. Dependency Graph
4. Git History

Use realistic data and interactions.

Do not build backend functionality.

Do not modify the CLI.

Do not create a database.

Deliver a working frontend with clean TypeScript components and mock DepDrift report data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/073384c4-f04a-415a-9d3c-a57e26accd3a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
