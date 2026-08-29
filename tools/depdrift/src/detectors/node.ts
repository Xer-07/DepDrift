import { Project, SourceFile } from "ts-morph";
import path from "node:path";
import fs from "node:fs";
import { ActualEdge, DeclaredEdge, EcosystemDetector } from "../types";

// Node built-in modules to ignore
const NODE_BUILTINS = new Set([
  "assert", "async_hooks", "buffer", "child_process", "cluster", "console",
  "constants", "crypto", "dgram", "dns", "domain", "events", "fs", "fs/promises",
  "http", "http2", "https", "inspector", "module", "net", "os", "path", "path/posix",
  "path/win32", "perf_hooks", "process", "punycode", "querystring", "readline",
  "repl", "stream", "stream/web", "string_decoder", "sys", "timers", "timers/promises",
  "tls", "trace_events", "tty", "url", "util", "v8", "vm", "wasi", "worker_threads", "zlib"
]);

type PkgInfo = {
  name: string;
  dirPath: string; // relative to repoRoot
  absPath: string;
  mainFile?: string;
  pkgJson: any;
};

export class NodeDetector implements EcosystemDetector {
  ecosystem: "node" = "node";

  detect(repoRoot: string): boolean {
    return fs.existsSync(path.join(repoRoot, "package.json"));
  }

  private discoverPackages(repoRoot: string): PkgInfo[] {
    const packages: PkgInfo[] = [];

    // Helper to recursively find package.json files
    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "build" || entry.name === "test-fixtures" || entry.name === "docusaurus-test" || entry.name.startsWith("depdrift-scan-")) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const pkgJsonPath = path.join(fullPath, "package.json");
          if (fs.existsSync(pkgJsonPath)) {
            try {
              const content = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
              const pkgName = content.name || path.basename(fullPath);
              const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, "/");
              packages.push({
                name: pkgName,
                dirPath: relPath || ".",
                absPath: fullPath,
                mainFile: content.main,
                pkgJson: content,
              });
            } catch {
              // ignore invalid JSON
            }
          }
          scanDir(fullPath);
        }
      }
    }

    // Check root package.json
    const rootPkgPath = path.join(repoRoot, "package.json");
    if (fs.existsSync(rootPkgPath)) {
      try {
        const rootContent = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
        const rootName = rootContent.name || path.basename(repoRoot);
        packages.push({
          name: rootName,
          dirPath: ".",
          absPath: repoRoot,
          mainFile: rootContent.main,
          pkgJson: rootContent,
        });
      } catch {
        // ignore
      }
    }

    scanDir(repoRoot);

    // Deduplicate by absPath
    const uniqueMap = new Map<string, PkgInfo>();
    for (const pkg of packages) {
      if (!uniqueMap.has(pkg.absPath)) {
        uniqueMap.set(pkg.absPath, pkg);
      }
    }

    return Array.from(uniqueMap.values());
  }

  private parsePackageLock(repoRoot: string): Map<string, string> {
    const resolvedMap = new Map<string, string>();
    const lockPath = path.join(repoRoot, "package-lock.json");
    if (!fs.existsSync(lockPath)) return resolvedMap;

    try {
      const lockData = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      // npm lockfile v2 / v3 packages
      if (lockData.packages) {
        for (const [pkgPath, pkgMeta] of Object.entries<any>(lockData.packages)) {
          if (!pkgMeta || !pkgMeta.version) continue;
          // package path like "node_modules/lodash" or "packages/app/node_modules/lodash"
          const match = pkgPath.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)$/);
          if (match) {
            resolvedMap.set(match[1], pkgMeta.version);
          }
        }
      }
      // npm lockfile v1 dependencies
      if (lockData.dependencies) {
        for (const [depName, depMeta] of Object.entries<any>(lockData.dependencies)) {
          if (depMeta && depMeta.version) {
            resolvedMap.set(depName, depMeta.version);
          }
        }
      }
    } catch {
      // ignore invalid lockfile
    }

    return resolvedMap;
  }

  extractDeclaredGraph(repoRoot: string): DeclaredEdge[] {
    const packages = this.discoverPackages(repoRoot);
    const lockfileVersions = this.parsePackageLock(repoRoot);
    const edges: DeclaredEdge[] = [];

    for (const pkg of packages) {
      const deps = pkg.pkgJson.dependencies || {};
      const devDeps = pkg.pkgJson.devDependencies || {};

      for (const [toPackage, range] of Object.entries<string>(deps)) {
        edges.push({
          ecosystem: "node",
          fromPackage: pkg.name,
          fromPackagePath: pkg.dirPath,
          toPackage,
          declaredRange: typeof range === "string" ? range : null,
          resolvedVersion: lockfileVersions.get(toPackage) || null,
          isDevDependency: false,
        });
      }

      for (const [toPackage, range] of Object.entries<string>(devDeps)) {
        edges.push({
          ecosystem: "node",
          fromPackage: pkg.name,
          fromPackagePath: pkg.dirPath,
          toPackage,
          declaredRange: typeof range === "string" ? range : null,
          resolvedVersion: lockfileVersions.get(toPackage) || null,
          isDevDependency: true,
        });
      }
    }

    return edges;
  }

  extractActualGraph(repoRoot: string): ActualEdge[] {
    const packages = this.discoverPackages(repoRoot);
    if (packages.length === 0) return [];

    const normalizedRepoRoot = repoRoot.replace(/\\/g, "/");
    const project = new Project();
    project.addSourceFilesAtPaths([
      `${normalizedRepoRoot}/**/*.ts`,
      `${normalizedRepoRoot}/**/*.tsx`,
      `${normalizedRepoRoot}/**/*.js`,
      `${normalizedRepoRoot}/**/*.jsx`,
      `!${normalizedRepoRoot}/**/node_modules/**`,
      `!${normalizedRepoRoot}/**/dist/**`,
      `!${normalizedRepoRoot}/**/build/**`,
      `!${normalizedRepoRoot}/**/test-fixtures/**`,
      `!${normalizedRepoRoot}/**/docusaurus-test/**`,
      `!${normalizedRepoRoot}/**/depdrift-scan-**`,
    ]);

    const edges: ActualEdge[] = [];

    for (const sourceFile of project.getSourceFiles()) {
      const filePath = sourceFile.getFilePath().replace(/\\/g, "/");
      if (filePath.includes("/node_modules/") || filePath.includes("/dist/")) {
        continue;
      }

      const relFilePath = path.relative(repoRoot, filePath).replace(/\\/g, "/");

      // Find owning package
      let owningPkg: PkgInfo | null = null;
      for (const pkg of packages) {
        if (pkg.dirPath === "." && packages.length > 1) continue; // prefer subpackages
        if (relFilePath.startsWith(pkg.dirPath === "." ? "" : pkg.dirPath + "/")) {
          if (!owningPkg || pkg.dirPath.length > owningPkg.dirPath.length) {
            owningPkg = pkg;
          }
        }
      }
      if (!owningPkg && packages.length > 0) {
        owningPkg = packages[0];
      }
      if (!owningPkg) continue;

      // Determine if main build entrypoint
      const fileName = path.basename(relFilePath);
      const isMain =
        fileName.startsWith("index.") ||
        fileName.startsWith("main.") ||
        fileName.startsWith("app.") ||
        (owningPkg.mainFile && relFilePath.endsWith(owningPkg.mainFile.replace(/^\.\//, "")));

      for (const importDecl of sourceFile.getImportDeclarations()) {
        try {
          const specifier = importDecl.getModuleSpecifierValue()?.trim();
          if (!specifier) continue;
          const basePkg = getBasePackageName(specifier);
          if (!basePkg) continue;
          if (basePkg === owningPkg.name) continue;

          edges.push({
            ecosystem: "node",
            fromPackage: owningPkg.name,
            fromPackagePath: owningPkg.dirPath,
            fromFile: relFilePath,
            toPackage: basePkg,
            importedSpecifier: specifier,
            isMainBuildEntrypoint: Boolean(isMain),
          });
        } catch {
          // ignore non-string literal dynamic import specifiers
        }
      }

      for (const exportDecl of sourceFile.getExportDeclarations()) {
        try {
          const specifier = exportDecl.getModuleSpecifierValue()?.trim();
          if (!specifier) continue;
          const basePkg = getBasePackageName(specifier);
          if (!basePkg) continue;
          if (basePkg === owningPkg.name) continue;

          edges.push({
            ecosystem: "node",
            fromPackage: owningPkg.name,
            fromPackagePath: owningPkg.dirPath,
            fromFile: relFilePath,
            toPackage: basePkg,
            importedSpecifier: specifier,
            isMainBuildEntrypoint: Boolean(isMain),
          });
        } catch {
          // ignore
        }
      }
    }

    return edges;
  }
}

function getBasePackageName(specifier: string): string | null {
  if (!specifier || specifier.startsWith(".") || specifier.startsWith("/")) return null;
  if (specifier.startsWith("node:")) return null;
  if (NODE_BUILTINS.has(specifier) || NODE_BUILTINS.has(specifier.split("/")[0])) return null;

  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return specifier;
  }

  return specifier.split("/")[0];
}
