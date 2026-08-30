import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRIFT_TYPE_LABEL, type DriftType, type Ecosystem, type Severity } from "@/lib/depdrift/types";

export interface Filters {
  query: string;
  severity: Severity | "ALL";
  ecosystem: Ecosystem | "ALL";
  type: DriftType | "ALL";
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  severity: "ALL",
  ecosystem: "ALL",
  type: "ALL",
};

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="flex rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all active:scale-[0.97]",
              value === o.value
                ? "bg-panel text-foreground font-semibold shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border/80 bg-panel-raised/50 px-4.5 py-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
        <input
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search dependency, package, reasoning, commit…"
          className="w-full rounded-lg border border-border/80 bg-panel py-2 pl-9 pr-3 font-mono text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/80 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <Segmented
        label="Severity"
        value={filters.severity}
        onChange={(v) => set({ severity: v })}
        options={[
          { value: "ALL", label: "All" },
          { value: "HIGH", label: "High" },
          { value: "MEDIUM", label: "Medium" },
          { value: "LOW", label: "Low" },
        ]}
      />

      <Segmented
        label="Ecosystem"
        value={filters.ecosystem}
        onChange={(v) => set({ ecosystem: v })}
        options={[
          { value: "ALL", label: "All" },
          { value: "node", label: "Node" },
          { value: "python", label: "Python" },
        ]}
      />

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Type</span>
        <select
          value={filters.type}
          onChange={(e) => set({ type: e.target.value as Filters["type"] })}
          className="rounded-lg border border-border/80 bg-panel px-2.5 py-1.5 font-sans text-xs font-medium text-foreground outline-none transition-all focus:border-primary/80"
        >
          <option value="ALL">All types</option>
          {(Object.keys(DRIFT_TYPE_LABEL) as DriftType[]).map((t) => (
            <option key={t} value={t}>
              {DRIFT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <span className="ml-auto font-mono text-[11px] font-semibold text-muted-foreground">
        {resultCount} result{resultCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export function applyFilters<T extends {
  dependency: string;
  fromPackage: string;
  reasoning: string;
  severity: Severity;
  ecosystem: Ecosystem;
  type: DriftType;
  introducedCommit?: { hash: string };
}>(items: T[], f: Filters): T[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((i) => {
    if (f.severity !== "ALL" && i.severity !== f.severity) return false;
    if (f.ecosystem !== "ALL" && i.ecosystem !== f.ecosystem) return false;
    if (f.type !== "ALL" && i.type !== f.type) return false;
    if (!q) return true;
    return [i.dependency, i.fromPackage, i.reasoning, i.introducedCommit?.hash ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}
