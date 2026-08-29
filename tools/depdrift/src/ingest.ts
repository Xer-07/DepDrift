import simpleGit from "simple-git";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { IngestResult } from "./types";

export async function ingestRepo(input: string): Promise<IngestResult> {
  const isUrl = input.startsWith("http://") || input.startsWith("https://") || input.startsWith("git@");

  if (isUrl) {
    let cloneUrl = input;
    const token = process.env.GITHUB_TOKEN;

    if (token && cloneUrl.startsWith("https://github.com/")) {
      cloneUrl = cloneUrl.replace("https://github.com/", `https://${token}@github.com/`);
    }

    const tempDir = path.join(os.tmpdir(), `depdrift-scan-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    console.log(`Cloning ${input} (shallow depth 50) into temporary directory...`);
    const git = simpleGit();
    await git.clone(cloneUrl, tempDir, ["--depth", "50"]);

    return {
      repoRoot: tempDir,
      isTemp: true,
      cleanup: () => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // ignore cleanup error
        }
      },
    };
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
