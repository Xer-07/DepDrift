import fs from "node:fs";
import path from "node:path";

export type DeclaredEdge = {
  fromPackage: string;
  toPackage: string;
};

export function extractDeclaredGraph(repoRoot: string): DeclaredEdge[] {
  const packagesDir = path.join(repoRoot, "packages");
  const packageDirs = fs.readdirSync(packagesDir);

  const edges: DeclaredEdge[] = [];

  for (const dir of packageDirs) {
    const pkgJsonPath = path.join(packagesDir, dir, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const fromPackage = dir;

    const deps = {
      ...(pkgJson.dependencies || {}),
      ...(pkgJson.devDependencies || {}),
    };

    for (const depName of Object.keys(deps)) {
      if (!depName.startsWith("@demo/")) continue;
      const toPackage = depName.replace("@demo/", "");
      edges.push({ fromPackage, toPackage });
    }
  }

  return edges;
}