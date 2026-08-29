import simpleGit from "simple-git";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { IngestResult } from "./types";

export async function ingestRepo(input: string): Promise<IngestResult> {
  const isUrl =
    input.startsWith("http://") ||
    input.startsWith("https://") ||
    input.startsWith("git@");

  if (isUrl) {
    let cloneUrl = input;
    const token = process.env.GITHUB_TOKEN;

    if (token && cloneUrl.startsWith("https://github.com/")) {
      cloneUrl = cloneUrl.replace(
        "https://github.com/",
        `https://${encodeURIComponent(token)}@github.com/`
      );
    }

    // Create only the parent directory.
    // Let `git clone` create the actual repository directory inside parentDir.
    const parentDir = fs.mkdtempSync(path.join(os.tmpdir(), "depdrift-scan-"));

    const repoName =
      cloneUrl
        .replace(/\.git$/, "")
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, "-") || "repo";

    const repoRoot = path.join(parentDir, repoName);

    console.log(`📥 Cloning ${input} (shallow depth 50)...`);

    const git = simpleGit({
      progress({ method, stage, progress }) {
        if (progress % 25 === 0 || progress === 100) {
          console.log(`  └─ Git ${method} [${stage}]: ${progress}%`);
        }
      },
    });

    try {
      await git.clone(cloneUrl, repoRoot, ["--depth", "50"]);

      console.log(`✅ Clone complete: ${repoRoot}`);

      return {
        repoRoot,
        isTemp: true,
        cleanup: () => {
          try {
            fs.rmSync(parentDir, {
              recursive: true,
              force: true,
            });
          } catch {
            // Ignore cleanup errors.
          }
        },
      };
    } catch (error) {
      // Clean up a failed clone immediately.
      try {
        fs.rmSync(parentDir, {
          recursive: true,
          force: true,
        });
      } catch {
        // Ignore cleanup errors.
      }

      throw new Error(
        `Failed to clone repository: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  const resolvedPath = path.resolve(process.cwd(), input);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Target directory path does not exist: ${resolvedPath}`);
  }

  return {
    repoRoot: resolvedPath,
    isTemp: false,
    cleanup: () => {},
  };
}
