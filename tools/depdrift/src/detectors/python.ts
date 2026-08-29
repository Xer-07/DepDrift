import fs from "node:fs";
import path from "node:path";
import { ActualEdge, DeclaredEdge, EcosystemDetector } from "../types";

const PYTHON_STDLIB = new Set([
  "abc", "argparse", "array", "ast", "asyncio", "atexit", "base64", "bdb", "binascii",
  "bisect", "builtins", "bz2", "calendar", "cgi", "cgitb", "chunk", "cmath", "cmd",
  "code", "codecs", "codeop", "collections", "colorsys", "compileall", "concurrent",
  "configparser", "contextlib", "contextvars", "copy", "copyreg", "cProfile", "crypt",
  "csv", "ctypes", "curses", "dataclasses", "datetime", "dbm", "decimal", "difflib",
  "dis", "distutils", "doctest", "email", "encodings", "enum", "errno", "faulthandler",
  "fcntl", "filecmp", "fileinput", "fnmatch", "fractions", "ftplib", "functools", "gc",
  "getopt", "getpass", "gettext", "glob", "graphlib", "grp", "gzip", "hashlib", "heapq",
  "hmac", "html", "http", "imaplib", "imghdr", "imp", "importlib", "inspect", "io",
  "ipaddress", "itertools", "json", "keyword", "lib2to3", "linecache", "locale", "logging",
  "lzma", "mailbox", "mailcap", "marshal", "math", "mimetypes", "mmap", "modulefinder",
  "msvcrt", "multiprocessing", "netrc", "nis", "nntplib", "numbers", "operator", "optparse",
  "os", "pathlib", "pdb", "pickle", "pickletools", "pkgutil", "platform", "plistlib",
  "poplib", "posix", "pprint", "profile", "pstats", "pty", "pwd", "py_compile", "pyclbr",
  "pydoc", "queue", "quopri", "random", "re", "readline", "reprlib", "resource", "rlcompleter",
  "runpy", "sched", "secrets", "select", "selectors", "shelve", "shlex", "shutil", "signal",
  "site", "smtpd", "smtplib", "sndhdr", "socket", "socketserver", "spwd", "sqlite3", "ssl",
  "stat", "statistics", "string", "stringprep", "struct", "subprocess", "sunau", "symtable",
  "sys", "sysconfig", "syslog", "tabnanny", "tarfile", "telnetlib", "tempfile", "termios",
  "test", "textwrap", "threading", "time", "timeit", "tkinter", "token", "tokenize",
  "tomllib", "trace", "traceback", "tracemalloc", "tty", "types", "typing", "typing_extensions",
  "unicodedata", "unittest", "urllib", "uu", "uuid", "venv", "warnings", "wave", "weakref",
  "webbrowser", "wsgiref", "xdrlib", "xml", "xmlrpc", "zipapp", "zipfile", "zipimport", "zlib"
]);

export class PythonDetector implements EcosystemDetector {
  ecosystem: "python" = "python";

  detect(repoRoot: string): boolean {
    return (
      fs.existsSync(path.join(repoRoot, "requirements.txt")) ||
      fs.existsSync(path.join(repoRoot, "pyproject.toml")) ||
      fs.existsSync(path.join(repoRoot, "Pipfile")) ||
      fs.existsSync(path.join(repoRoot, "setup.py")) ||
      this.hasPythonFiles(repoRoot)
    );
  }

  private hasPythonFiles(dir: string): boolean {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === ".venv" || entry.name === "venv" || entry.name === ".git" || entry.name === "__pycache__" || entry.name === "docusaurus-test" || entry.name === "test-fixtures" || entry.name.startsWith("depdrift-scan-")) {
          continue;
        }
        if (entry.isDirectory()) {
          if (this.hasPythonFiles(path.join(dir, entry.name))) return true;
        } else if (entry.name.endsWith(".py")) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }

  extractDeclaredGraph(repoRoot: string): DeclaredEdge[] {
    const edges: DeclaredEdge[] = [];
    const rootPkgName = path.basename(repoRoot);

    // 1. Parse requirements.txt
    const reqPath = path.join(repoRoot, "requirements.txt");
    if (fs.existsSync(reqPath)) {
      try {
        const content = fs.readFileSync(reqPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;

          // Parse line like "requests==2.28.1" or "flask>=2.0.0" or "numpy"
          const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)(?:([=><~!]+)\s*([a-zA-Z0-9_\-\.]+))?/);
          if (match) {
            const pkgName = match[1].toLowerCase().replace(/-/g, "_");
            const op = match[2];
            const version = match[3];

            edges.push({
              ecosystem: "python",
              fromPackage: rootPkgName,
              fromPackagePath: ".",
              toPackage: pkgName,
              declaredRange: op && version ? `${op}${version}` : "*",
              resolvedVersion: op === "==" ? version : null,
            });
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Parse pyproject.toml
    const pyprojectPath = path.join(repoRoot, "pyproject.toml");
    if (fs.existsSync(pyprojectPath)) {
      try {
        const content = fs.readFileSync(pyprojectPath, "utf8");
        // Simple regex parser for [tool.poetry.dependencies] or [project.dependencies]
        const depLines = content.split("\n");
        let inDepSection = false;

        for (const line of depLines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("[")) {
            inDepSection =
              trimmed.includes("dependencies") ||
              trimmed.includes("tool.poetry.dependencies") ||
              trimmed.includes("project.dependencies");
            continue;
          }
          if (inDepSection && trimmed && !trimmed.startsWith("#")) {
            // e.g. requests = "^2.28.1" or "requests >= 2.0.0" or "requests"
            const match = trimmed.match(/^"?([a-zA-Z0-9_\-\.]+)"?\s*=\s*"?([^"#\n]+)"?/);
            if (match) {
              const pkgName = match[1].toLowerCase().replace(/-/g, "_");
              const verSpec = match[2].trim();
              if (pkgName !== "python") {
                edges.push({
                  ecosystem: "python",
                  fromPackage: rootPkgName,
                  fromPackagePath: ".",
                  toPackage: pkgName,
                  declaredRange: verSpec || "*",
                  resolvedVersion: verSpec.startsWith("==") ? verSpec.slice(2) : null,
                });
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return edges;
  }

  extractActualGraph(repoRoot: string): ActualEdge[] {
    const edges: ActualEdge[] = [];
    const rootPkgName = path.basename(repoRoot);

    const pyFiles: string[] = [];
    function findPyFiles(dir: string) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (
            entry.name === ".venv" ||
            entry.name === "venv" ||
            entry.name === ".git" ||
            entry.name === "__pycache__" ||
            entry.name === "build" ||
            entry.name === "dist" ||
            entry.name === "docusaurus-test" ||
            entry.name === "test-fixtures" ||
            entry.name.startsWith("depdrift-scan-")
          ) {
            continue;
          }
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findPyFiles(fullPath);
          } else if (entry.name.endsWith(".py")) {
            pyFiles.push(fullPath);
          }
        }
      } catch {
        // ignore
      }
    }
    findPyFiles(repoRoot);

    const importRegex = /^\s*(?:from\s+([a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_\.]+))/gm;

    for (const file of pyFiles) {
      const relPath = path.relative(repoRoot, file).replace(/\\/g, "/");
      const fileName = path.basename(relPath);
      const isMain =
        fileName === "main.py" ||
        fileName === "app.py" ||
        fileName === "index.py" ||
        fileName === "__main__.py" ||
        relPath.startsWith("src/main.py") ||
        relPath.startsWith("src/app.py");

      try {
        const content = fs.readFileSync(file, "utf8");
        let match: RegExpExecArray | null;

        while ((match = importRegex.exec(content)) !== null) {
          const rawModule = match[1] || match[2];
          if (!rawModule) continue;

          // Get top-level module name
          const topModule = rawModule.split(".")[0].toLowerCase();

          // Skip relative imports or stdlib
          if (!topModule || rawModule.startsWith(".") || PYTHON_STDLIB.has(topModule)) {
            continue;
          }

          edges.push({
            ecosystem: "python",
            fromPackage: rootPkgName,
            fromPackagePath: ".",
            fromFile: relPath,
            toPackage: topModule,
            importedSpecifier: rawModule,
            isMainBuildEntrypoint: isMain,
          });
        }
      } catch {
        // ignore read error
      }
    }

    return edges;
  }
}
