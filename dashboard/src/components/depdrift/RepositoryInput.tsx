import { FolderGit2, Github, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceMode = "github" | "local";

export function RepositoryInput({
  mode,
  onModeChange,
  value,
  onValueChange,
  onScan,
  scanning,
}: {
  mode: SourceMode;
  onModeChange: (m: SourceMode) => void;
  value: string;
  onValueChange: (v: string) => void;
  onScan: () => void;
  scanning: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/90 bg-panel p-5 shadow-panel">
      <div className="flex w-fit rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
        {(
          [
            { id: "github" as const, label: "GitHub URL", icon: Github },
            { id: "local" as const, label: "Local Repository", icon: FolderGit2 },
          ]
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97]",
              mode === id
                ? "bg-panel text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          onScan();
        }}
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-muted-foreground/80">
            {mode === "github" ? "git" : "fs"}
          </span>
          <input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={
              mode === "github" ? "https://github.com/owner/repository" : "C:\\projects\\my-app"
            }
            spellCheck={false}
            className="w-full rounded-lg border border-border/80 bg-panel py-3 pl-11 pr-3 font-mono text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/80 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <button
          type="submit"
          disabled={scanning}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
        >
          <Play className="size-4" />
          {scanning ? "Scanning…" : "Scan Repository"}
        </button>
      </form>

      <p className="mt-3 font-mono text-[11px] text-muted-foreground font-medium">
        Accepts a GitHub URL or a local path. Analysis runs read-only — no files are modified.
      </p>
    </div>
  );
}
