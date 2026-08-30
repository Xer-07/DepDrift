import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Radar, ListTree, GitBranch, ShieldCheck } from "lucide-react";
import { useReport } from "@/lib/depdrift/useReport";
import { summarize } from "@/lib/depdrift/reportAdapter";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/scan", label: "Scan Repository", icon: Radar, exact: false },
  { to: "/findings", label: "Findings", icon: ListTree, exact: false },
  { to: "/history", label: "Git History", icon: GitBranch, exact: false },
] as const;

export function Sidebar() {
  const report = useReport();
  const summary = summarize(report);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border-strong bg-panel shadow-sm">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-sm font-semibold tracking-tight text-foreground">DepDrift</div>
          <div className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Dependency Intel
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-all active:scale-[0.98] hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{
              className:
                "!bg-panel !text-foreground font-semibold shadow-sm border border-border/80 border-l-2 border-l-primary",
            }}
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {label === "Findings" && (
              <span className="ml-auto rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                {summary.total}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="m-3.5 rounded-xl border border-border/90 bg-panel p-3.5 shadow-sm">
        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Active Report
        </div>
        <div className="mt-1 truncate font-mono text-xs font-medium text-foreground">
          {report.repository.name}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold">
          <span className="text-high">{summary.high} high</span>
          <span className="text-medium">{summary.medium} med</span>
          <span className="text-low">{summary.low} low</span>
        </div>
      </div>
    </aside>
  );
}
