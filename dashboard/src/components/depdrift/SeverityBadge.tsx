import { cn } from "@/lib/utils";
import type { DriftType, Ecosystem, Severity } from "@/lib/depdrift/types";
import { DRIFT_TYPE_LABEL } from "@/lib/depdrift/types";

const SEVERITY_CLASS: Record<Severity, string> = {
  HIGH: "border-high/40 bg-high/12 text-high",
  MEDIUM: "border-medium/40 bg-medium/12 text-medium",
  LOW: "border-low/40 bg-low/12 text-low",
};

export function SeverityBadge({
  severity,
  className,
  size = "sm",
}: {
  severity: Severity;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border font-mono font-medium uppercase tracking-wider",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        SEVERITY_CLASS[severity],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export function TypeBadge({ type, className }: { type: DriftType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-border bg-panel-raised px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground",
        className,
      )}
    >
      {DRIFT_TYPE_LABEL[type] ?? type}
    </span>
  );
}

export function EcosystemBadge({ ecosystem }: { ecosystem: Ecosystem }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          ecosystem === "node" ? "bg-ok" : "bg-low",
        )}
      />
      {ecosystem}
    </span>
  );
}
