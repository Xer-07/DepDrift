import { useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Link } from "@tanstack/react-router";
import { Network, X } from "lucide-react";
import { ClientOnly } from "./ClientOnly";
import { GraphNode, type DriftNode } from "./GraphNode";
import { SeverityBadge } from "./SeverityBadge";
import type { DepDriftReport, EdgeState } from "@/lib/depdrift/types";

const EDGE_COLOR: Record<EdgeState, string> = {
  declared: "var(--ok)",
  missing: "var(--high)",
  conflict: "var(--medium)",
};

const nodeTypes = { drift: GraphNode };

function GraphInner({ report }: { report: DepDriftReport }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodes = useMemo<DriftNode[]>(
    () =>
      report.graph.nodes.map((n) => ({
        id: n.id,
        type: "drift" as const,
        position: n.position,
        data: {
          label: n.label,
          ecosystem: n.ecosystem,
          kind: n.kind,
          status: n.status,
          version: n.version,
        },
      })),
    [report],
  );

  const edges = useMemo<Edge[]>(
    () =>
      report.graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.state !== "declared",
        style: {
          stroke: EDGE_COLOR[e.state],
          strokeWidth: 1.8,
          strokeDasharray: e.state === "missing" ? "5 4" : undefined,
        },
        labelStyle: { fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500 },
        labelBgStyle: { fill: "var(--panel)" },
        labelBgPadding: [6, 3] as [number, number],
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR[e.state], width: 14, height: 14 },
      })),
    [report],
  );

  const selected = report.graph.nodes.find((n) => n.id === selectedId);
  const related = report.findings.filter(
    (f) => f.dependency === selected?.label || f.fromPackage === selected?.id,
  );

  return (
    <div className="relative h-[520px] w-full bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        minZoom={0.3}
        maxZoom={1.8}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--border-strong)" />
        <Controls className="!border !border-border/80 !bg-panel !shadow-panel" showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="oklch(0.978 0.007 85 / 65%)"
          style={{ background: "var(--panel)", border: "1px solid var(--border-strong)", borderRadius: "8px" }}
          nodeColor={(n) => {
            const status = (n.data as { status?: string }).status;
            if (status === "missing") return "var(--high)";
            if (status === "conflict") return "var(--medium)";
            if (status === "unused") return "var(--low)";
            return "var(--ok)";
          }}
        />
      </ReactFlow>

      {selected && (
        <div className="absolute right-4 top-4 w-76 animate-fade-up rounded-xl border border-border/90 bg-panel p-4.5 shadow-glow">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <div className="truncate font-mono text-sm font-bold text-foreground">{selected.label}</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {selected.ecosystem} · {selected.kind} · {selected.version ?? "—"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            {related.length === 0 && (
              <p className="text-xs text-muted-foreground">No drift recorded for this node.</p>
            )}
            {related.map((f) => (
              <Link
                key={f.id}
                to="/findings/$findingId"
                params={{ findingId: f.id }}
                className="block rounded-lg border border-border/80 bg-background px-3 py-2.5 transition-all hover:border-border-strong hover:bg-panel-raised"
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={f.severity} />
                  <span className="truncate font-mono text-[11px] font-semibold">{f.fromPackage}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {f.reasoning}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DependencyGraph({ report }: { report: DepDriftReport }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/90 bg-panel shadow-panel">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/80 bg-panel-raised/50 px-5 py-3.5">
        <Network className="size-4 text-primary" />
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">Dependency Graph</h2>
          <p className="text-xs text-muted-foreground">
            Package relationships and detected dependency drift
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3.5 font-mono text-[11px] font-medium text-muted-foreground">
          <Legend color="var(--ok)" label="declared & used" />
          <Legend color="var(--high)" label="missing" />
          <Legend color="var(--medium)" label="version conflict" />
        </div>
      </div>
      <ClientOnly
        fallback={
          <div className="flex h-[520px] items-center justify-center text-xs font-medium text-muted-foreground">
            Rendering graph…
          </div>
        }
      >
        <GraphInner report={report} />
      </ClientOnly>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1 w-3.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
