import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Package, Boxes, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportGraphNode } from "@/lib/depdrift/types";

export type DriftNodeData = Pick<ReportGraphNode, "label" | "ecosystem" | "kind" | "status"> & {
  version?: string | undefined;
  [key: string]: unknown;
};

export type DriftNode = Node<DriftNodeData, "drift">;

const STATUS: Record<ReportGraphNode["status"], { ring: string; text: string; label: string }> = {
  ok: { ring: "border-ok/50", text: "text-ok", label: "declared & used" },
  missing: { ring: "border-high/60", text: "text-high", label: "missing" },
  conflict: { ring: "border-medium/60", text: "text-medium", label: "version drift" },
  unused: { ring: "border-low/60", text: "text-low", label: "unused" },
};

export function GraphNode({ data, selected }: NodeProps<DriftNode>) {
  const s = STATUS[data.status];
  const Icon = data.kind === "workspace" ? Boxes : data.kind === "package" ? Package : FileWarning;

  return (
    <div
      className={cn(
        "w-[188px] rounded-lg border bg-panel px-3 py-2.5 shadow-panel transition-all",
        s.ring,
        selected && "ring-2 ring-primary/70",
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3.5 shrink-0", s.text)} />
        <span className="truncate font-mono text-xs font-medium text-foreground">{data.label}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>{data.ecosystem}</span>
        <span>{data.version ?? "—"}</span>
      </div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
          s.ring,
          s.text,
        )}
      >
        <span className="size-1 rounded-full bg-current" />
        {s.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
