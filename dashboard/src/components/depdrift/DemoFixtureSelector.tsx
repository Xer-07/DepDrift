import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIXTURES } from "@/lib/depdrift/fixtures";
import { useFixture } from "@/lib/depdrift/useReport";

export function DemoFixtureSelector({ variant = "inline" }: { variant?: "inline" | "grid" }) {
  const [active, select] = useFixture();

  if (variant === "grid") {
    return (
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {FIXTURES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => select(f.id)}
            className={cn(
              "rounded-lg border bg-panel px-3 py-2.5 text-left transition-colors",
              active === f.id
                ? "border-primary/60 shadow-glow"
                : "border-border hover:border-border-strong",
            )}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Boxes
                className={cn("size-4", active === f.id ? "text-primary" : "text-muted-foreground")}
              />
              {f.label}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{f.hint}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-panel p-0.5">
      {FIXTURES.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => select(f.id)}
          className={cn(
            "rounded px-2.5 py-1 text-xs transition-colors",
            active === f.id
              ? "bg-panel-raised text-foreground shadow-[inset_0_0_0_1px_var(--border-strong)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
