import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ClientOnly } from "./ClientOnly";
import type { ReportSummary } from "@/lib/depdrift/reportAdapter";

export function HealthChart({ summary }: { summary: ReportSummary }) {
  const data = [
    { name: "High", value: summary.high, color: "var(--high)" },
    { name: "Medium", value: summary.medium, color: "var(--medium)" },
    { name: "Low", value: summary.low, color: "var(--low)" },
  ];
  const total = summary.total || 1;

  return (
    <section className="rounded-xl border border-border/90 bg-panel p-4.5 shadow-panel">
      <h2 className="text-sm font-bold tracking-tight text-foreground">Dependency Health</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Severity distribution across findings</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-[132px] shrink-0">
          <ClientOnly>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={64}
                  paddingAngle={4}
                  stroke="var(--panel)"
                  strokeWidth={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ClientOnly>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2.5xl font-bold leading-none text-foreground">{summary.total}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              findings
            </span>
          </div>
        </div>

        <ul className="flex-1 space-y-3">
          {data.map((d) => (
            <li key={d.name} className="text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {d.value}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                    ({Math.round((d.value / total) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4.5 grid grid-cols-2 gap-2 border-t border-border/70 pt-3 text-xs">
        <div>
          <div className="font-mono text-xl font-bold leading-none text-foreground">{summary.packages}</div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">packages affected</div>
        </div>
        <div>
          <div className="font-mono text-xl font-bold leading-none text-foreground">{summary.driftCommits}</div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">drift commits</div>
        </div>
      </div>
    </section>
  );
}
