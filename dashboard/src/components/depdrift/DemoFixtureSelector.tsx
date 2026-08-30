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
              "rounded-xl border bg-panel px-3.5 py-3 text-left transition-all active:scale-[0.98]",
              active === f.id
                ? "border-primary/80 bg-secondary shadow-sm"
                : "border-border hover:border-border-strong hover:bg-panel-raised",
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Boxes
                className={cn("size-4", active === f.id ? "text-primary" : "text-muted-foreground")}
              />
              {f.label}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground">{f.hint}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-panel p-1 shadow-sm">
      {FIXTURES.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => select(f.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-all active:scale-[0.97]",
            active === f.id
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
