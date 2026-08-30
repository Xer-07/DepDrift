import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SCAN_STEPS = [
  { label: "Repository connected", detail: "resolving remote & checking out HEAD" },
  { label: "Ecosystem detected", detail: "package.json, requirements.txt, lockfiles" },
  { label: "Dependencies analyzed", detail: "imports vs declared manifests" },
  { label: "Drift detected", detail: "version, missing, unused, conflicts" },
  { label: "Report generated", detail: "depdrift-report.json" },
] as const;

export function ScanProgress({ step, target }: { step: number; target: string }) {
  const pct = Math.round((Math.min(step, SCAN_STEPS.length) / SCAN_STEPS.length) * 100);

  return (
    <div className="animate-fade-up rounded-lg border border-border bg-panel p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Scanning</h2>
        <span className="font-mono text-xs text-primary">{pct}%</span>
      </div>
      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{target}</div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-panel-raised">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-3">
        {SCAN_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={s.label}
              className={cn(
                "flex items-start gap-3 transition-opacity",
                !done && !active && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                  done ? "border-ok/60 bg-ok/15 text-ok" : "border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-3" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin text-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <div>
                <div className={cn("text-sm", done ? "text-foreground" : "text-secondary-foreground")}>
                  {s.label}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">{s.detail}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
