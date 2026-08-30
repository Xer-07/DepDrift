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
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-md border border-border-strong bg-panel-raised">
          <ShieldCheck className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-sm font-semibold tracking-tight">DepDrift</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            dependency intel
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{
              className:
                "!bg-sidebar-accent !text-foreground shadow-[inset_2px_0_0_0_var(--primary)]",
            }}
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {label === "Findings" && (
              <span className="ml-auto rounded border border-border bg-panel px-1.5 font-mono text-[11px] text-muted-foreground">
                {summary.total}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="m-3 rounded-lg border border-border bg-panel p-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Active report
        </div>
        <div className="mt-1 truncate font-mono text-xs text-foreground">
          {report.repository.name}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] font-medium">
          <span className="text-high">{summary.high} high</span>
          <span className="text-medium">{summary.medium} med</span>
          <span className="text-low">{summary.low} low</span>
        </div>
      </div>
    </aside>
  );
}
