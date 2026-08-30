import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "high" | "medium" | "low" | "neutral";

const TONE: Record<Tone, { text: string; bar: string; ring: string; badgeBg: string }> = {
  high: { text: "text-high", bar: "bg-high", ring: "border-high/30 hover:border-high/60", badgeBg: "bg-high/10" },
  medium: { text: "text-medium", bar: "bg-medium", ring: "border-medium/30 hover:border-medium/60", badgeBg: "bg-medium/10" },
  low: { text: "text-low", bar: "bg-low", ring: "border-low/30 hover:border-low/60", badgeBg: "bg-low/10" },
  neutral: { text: "text-foreground", bar: "bg-primary", ring: "border-border/80 hover:border-border-strong", badgeBg: "bg-secondary" },
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
        "group relative overflow-hidden rounded-xl border bg-panel p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-panel",
        t.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className={cn("flex size-7 items-center justify-center rounded-md transition-colors", t.badgeBg)}>
            <Icon className={cn("size-3.5", t.text)} />
          </div>
        )}
      </div>
      <div className={cn("mt-2.5 font-mono text-3.5xl font-bold tracking-tight leading-none", t.text)}>
        {value}
      </div>
      <p className="mt-2 text-xs font-normal text-muted-foreground">{subtitle}</p>
      <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-700", t.bar)}
          style={{ width: `${Math.max(4, Math.round(share * 100))}%` }}
        />
      </div>
    </div>
  );
}
