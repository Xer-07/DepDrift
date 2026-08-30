import { useState } from "react";
import { Check, Copy, Terminal, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return { copied, copy };
}

export function SuggestedFix({ command, className }: { command: string; className?: string }) {
  const { copied, copy } = useCopy();

  return (
    <div className={cn("rounded-lg border border-border bg-panel p-4", className)}>
      <div className="flex items-center gap-2">
        <Terminal className="size-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-tight">Suggested fix</h3>
      </div>
      <div className="mt-3 flex items-stretch gap-2 rounded-md border border-border-strong bg-background">
        <span className="flex select-none items-center border-r border-border px-3 font-mono text-xs text-primary">
          $
        </span>
        <code className="flex-1 overflow-x-auto whitespace-pre px-1 py-3 font-mono text-[13px] text-foreground">
          {command}
        </code>
        <button
          type="button"
          onClick={() => copy(command)}
          className={cn(
            "m-1.5 inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
            copied
              ? "bg-ok/15 text-ok"
              : "bg-panel-raised text-muted-foreground hover:text-foreground",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Run from the repository root. Re-scan afterwards to confirm the drift is resolved.
      </p>
    </div>
  );
}

export function EvidenceList({ evidence }: { evidence: string[] }) {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center gap-2">
        <FileCode2 className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold tracking-tight">Evidence</h3>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {evidence.length} file{evidence.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {evidence.map((file) => (
          <li key={file}>
            <button
              type="button"
              onClick={() => copy(file)}
              title="Copy path"
              className="group flex w-full items-center gap-2 rounded border border-border bg-background px-2.5 py-2 text-left font-mono text-xs text-secondary-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <span className="text-muted-foreground">/</span>
              <span className="truncate">{file}</span>
              <Copy className="ml-auto size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>
      {copied && <p className="mt-2 text-[11px] text-ok">Path copied to clipboard</p>}
    </div>
  );
}
