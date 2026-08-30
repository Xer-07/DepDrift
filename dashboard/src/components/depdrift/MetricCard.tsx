import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "high" | "medium" | "low" | "neutral";

const TONE: Record<Tone, { text: string; bar: string; ring: string }> = {
  high: { text: "text-high", bar: "bg-high", ring: "border-high/30" },
  medium: { text: "text-medium", bar: "bg-medium", ring: "border-medium/30" },
  low: { text: "text-low", bar: "bg-low", ring: "border-low/30" },
  neutral: { text: "text-foreground", bar: "bg-primary", ring: "border-border-strong" },
};

export function MetricCard({
  label,
  value,
  subtitle,
  tone = "neutral",
  icon: Icon,
  share = 0,
}: {
  label: string;
  value: number | string;
  subtitle: string;
  tone?: Tone;
  icon?: LucideIcon;
  share?: number;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-panel p-4 shadow-panel transition-colors hover:border-border-strong",
        t.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className={cn("size-4 opacity-70", t.text)} />}
      </div>
      <div className={cn("mt-3 font-mono text-4xl font-semibold leading-none", t.text)}>
        {value}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel-raised">
        <div
          className={cn("h-full rounded-full transition-all duration-700", t.bar)}
          style={{ width: `${Math.max(4, Math.round(share * 100))}%` }}
        />
      </div>
    </div>
  );
}
