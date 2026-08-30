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
    <div className="animate-fade-up rounded-xl border border-border/90 bg-panel p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Scanning</h2>
        <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="mt-1 truncate font-mono text-[11px] font-medium text-muted-foreground">{target}</div>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-3.5">
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
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border shadow-2xs",
                  done ? "border-ok/50 bg-ok/10 text-ok" : "border-border text-muted-foreground bg-panel",
                )}
              >
                {done ? (
                  <Check className="size-3 stroke-[2.5]" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin text-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <div>
                <div className={cn("text-xs font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </div>
                <div className="font-mono text-[11px] font-medium text-muted-foreground">{s.detail}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
