import { cn } from "@/lib/utils";
import type { DriftType, Ecosystem, Severity } from "@/lib/depdrift/types";
import { DRIFT_TYPE_LABEL } from "@/lib/depdrift/types";

const SEVERITY_CLASS: Record<Severity, string> = {
  HIGH: "border-high/30 bg-high/10 text-high font-semibold",
  MEDIUM: "border-medium/30 bg-medium/10 text-medium font-semibold",
  LOW: "border-low/30 bg-low/10 text-low font-semibold",
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
        "inline-flex items-center gap-1.5 rounded-md border font-mono tracking-[0.08em] uppercase",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
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
        "inline-flex items-center rounded-md border border-border/80 bg-secondary px-2 py-0.5 font-mono text-[10px] font-medium text-foreground",
        className,
      )}
    >
      {DRIFT_TYPE_LABEL[type] ?? type}
    </span>
  );
}

export function EcosystemBadge({ ecosystem }: { ecosystem: Ecosystem }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-muted-foreground">
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
