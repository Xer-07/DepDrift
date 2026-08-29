import { Project } from "ts-morph";
import path from "node:path";

export type ActualEdge = {
  fromPackage: string;
  fromFile: string;
  toPackage: string;
};

function packageNameFromPath(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/packages\/([^/]+)\//);
  return match ? match[1] : null;
}

export function extractActualGraph(repoRoot: string): ActualEdge[] {
  const project = new Project({
    tsConfigFilePath: path.join(repoRoot, "tsconfig.json"),
  });

  const edges: ActualEdge[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const fromPackage = packageNameFromPath(filePath);
    if (!fromPackage) continue;

    for (const importDecl of sourceFile.getImportDeclarations()) {
      const specifier = importDecl.getModuleSpecifierValue();

      if (!specifier.startsWith("@demo/")) continue;

      const toPackage = specifier.replace("@demo/", "");
      if (toPackage === fromPackage) continue;

      edges.push({
        fromPackage,
        fromFile: path.relative(repoRoot, filePath),
        toPackage,
      });
    }
  }

  return edges;
}