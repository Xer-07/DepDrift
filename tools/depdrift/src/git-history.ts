import simpleGit from "simple-git";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { Finding } from "./types";
import { getActiveDetectors } from "./detectors";
import { analyzeVersionDrift } from "./version-drift";

export async function annotateGitHistory(
  repoRoot: string,
  findings: Finding[],
  maxCommits: number = 20
): Promise<Finding[]> {
  if (findings.length === 0) return findings;

  try {
    const git = simpleGit(repoRoot);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log("History analysis skipped: path is not a git repository.");
      return findings;
    }

    // Get log of commits touching package files
    const logResult = await git.log({
      maxCount: Math.min(maxCommits, 30),
      file: "package.json package-lock.json requirements.txt pyproject.toml",
    });

    const commits = logResult.all;
    if (!commits || commits.length === 0) {
      return findings;
    }

    console.log(`Analyzing git history across last ${commits.length} manifest commits...`);

    // Walk commits from oldest to newest
    const sortedCommits = [...commits].reverse();
    const firstSeenMap = new Map<string, { hash: string; date: string }>();

    for (const commit of sortedCommits) {
      const worktreePath = path.join(os.tmpdir(), `depdrift-wt-${commit.hash.slice(0, 7)}`);

      try {
        // Create worktree
        await git.raw(["worktree", "add", "--detach", worktreePath, commit.hash]);

        // Run detection on worktree
        const detectors = getActiveDetectors(worktreePath);
        const actualEdges = detectors.flatMap(d => d.extractActualGraph(worktreePath));
        const declaredEdges = detectors.flatMap(d => d.extractDeclaredGraph(worktreePath));
        const snapshotFindings = analyzeVersionDrift(actualEdges, declaredEdges);

        for (const finding of snapshotFindings) {
          const key = `${finding.dependency}:${finding.fromPackage}:${finding.type}`;
          if (!firstSeenMap.has(key)) {
            firstSeenMap.set(key, {
              hash: commit.hash,
              date: commit.date.slice(0, 10),
            });
          }
        }
      } catch {
        // ignore worktree error
      } finally {
        // Clean worktree
        try {
          await git.raw(["worktree", "remove", "--force", worktreePath]);
        } catch {
          if (fs.existsSync(worktreePath)) {
            try { fs.rmSync(worktreePath, { recursive: true, force: true }); } catch {}
          }
        }
      }
    }

    // Annotate findings
    return findings.map(f => {
      const key = `${f.dependency}:${f.fromPackage}:${f.type}`;
      const intro = firstSeenMap.get(key);
      return {
        ...f,
        introducedInCommit: intro || null,
      };
    });

  } catch (err: any) {
    console.log(`History analysis skipped: ${err?.message || "git command error"}`);
    return findings;
  }
}
