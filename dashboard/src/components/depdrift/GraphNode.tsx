import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Package, Boxes, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportGraphNode } from "@/lib/depdrift/types";

export type DriftNodeData = Pick<ReportGraphNode, "label" | "ecosystem" | "kind" | "status"> & {
  version?: string | undefined;
  [key: string]: unknown;
};

export type DriftNode = Node<DriftNodeData, "drift">;

const STATUS: Record<ReportGraphNode["status"], { ring: string; text: string; label: string; bg: string }> = {
  ok: { ring: "border-ok/40", text: "text-ok", label: "declared & used", bg: "bg-ok/5" },
  missing: { ring: "border-high/50", text: "text-high", label: "missing", bg: "bg-high/5" },
  conflict: { ring: "border-medium/50", text: "text-medium", label: "version drift", bg: "bg-medium/5" },
  unused: { ring: "border-low/50", text: "text-low", label: "unused", bg: "bg-low/5" },
};

export function GraphNode({ data, selected }: NodeProps<DriftNode>) {
  const s = STATUS[data.status];
  const Icon = data.kind === "workspace" ? Boxes : data.kind === "package" ? Package : FileWarning;

  return (
    <div
      className={cn(
        "w-[195px] rounded-xl border bg-panel px-3.5 py-3 shadow-panel transition-all hover:shadow-glow",
        s.ring,
        selected && "ring-2 ring-primary/80 border-primary",
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60", s.bg)}>
          <Icon className={cn("size-3.5", s.text)} />
        </div>
        <span className="truncate font-mono text-xs font-semibold text-foreground">{data.label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] font-medium text-muted-foreground">
        <span>{data.ecosystem}</span>
        <span>{data.version ?? "—"}</span>
      </div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] font-semibold",
          s.ring,
          s.text,
          s.bg,
        )}
      >
        <span className="size-1 rounded-full bg-current" />
        {s.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
