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
    <div className={cn("rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel", className)}>
      <div className="flex items-center gap-2">
        <Terminal className="size-4 text-primary" />
        <h3 className="text-sm font-bold tracking-tight text-foreground">Suggested fix</h3>
      </div>
      <div className="mt-3 flex items-stretch gap-2 rounded-lg border border-border-strong bg-background shadow-2xs">
        <span className="flex select-none items-center border-r border-border/80 px-3.5 font-mono text-xs font-bold text-primary">
          $
        </span>
        <code className="flex-1 overflow-x-auto whitespace-pre px-2 py-3 font-mono text-[13px] font-medium text-foreground">
          {command}
        </code>
        <button
          type="button"
          onClick={() => copy(command)}
          className={cn(
            "m-1.5 inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all active:scale-[0.96]",
            copied
              ? "bg-ok/15 text-ok border border-ok/30"
              : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground border border-border/60",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground font-medium">
        Run from the repository root. Re-scan afterwards to confirm the drift is resolved.
      </p>
    </div>
  );
}

export function EvidenceList({ evidence }: { evidence: string[] }) {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel">
      <div className="flex items-center gap-2">
        <FileCode2 className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-bold tracking-tight text-foreground">Evidence</h3>
        <span className="ml-auto font-mono text-[11px] font-medium text-muted-foreground">
          {evidence.length} file{evidence.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="mt-3.5 space-y-2">
        {evidence.map((file) => (
          <li key={file}>
            <button
              type="button"
              onClick={() => copy(file)}
              title="Copy path"
              className="group flex w-full items-center gap-2 rounded-lg border border-border/80 bg-background px-3 py-2.5 text-left font-mono text-xs font-medium text-foreground transition-all hover:border-border-strong hover:bg-panel-raised"
            >
              <span className="text-muted-foreground">/</span>
              <span className="truncate">{file}</span>
              <Copy className="ml-auto size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>
      {copied && <p className="mt-2 text-[11px] font-semibold text-ok">Path copied to clipboard</p>}
    </div>
  );
}
