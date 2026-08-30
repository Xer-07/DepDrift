import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import { TopHeader } from "@/components/depdrift/TopHeader";
import { RepositoryInput, type SourceMode } from "@/components/depdrift/RepositoryInput";
import { ScanProgress, SCAN_STEPS } from "@/components/depdrift/ScanProgress";
import { DemoFixtureSelector } from "@/components/depdrift/DemoFixtureSelector";
import { markScanned } from "@/lib/depdrift/useReport";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Repository — DepDrift" },
      {
        name: "description",
        content:
          "Point DepDrift at a GitHub URL or local path to analyze dependency health, drift and historical changes.",
      },
      { property: "og:title", content: "Scan Repository — DepDrift" },
      {
        property: "og:description",
        content: "Analyze dependency health, drift, and historical changes.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SourceMode>("github");
  const [value, setValue] = useState("https://github.com/depdrift/demo-project");
  const [step, setStep] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scanning = step >= 0 && step <= SCAN_STEPS.length;

  const startScan = () => {
    if (scanning) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(0);
    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), 700 * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        markScanned();
        navigate({ to: "/" });
      }, 700 * SCAN_STEPS.length + 650),
    );
  };

  return (
    <div className="animate-fade-up">
      <TopHeader
        title="Scan Repository"
        subtitle="Analyze dependency health, drift, and historical changes."
      />

      <div className="grid gap-6 px-5 py-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <RepositoryInput
            mode={mode}
            onModeChange={setMode}
            value={value}
            onValueChange={setValue}
            onScan={startScan}
            scanning={scanning}
          />

          <div className="rounded-xl border border-border/90 bg-panel p-5 shadow-panel">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Demo fixtures</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Load one of the bundled fixture reports to explore the dashboard instantly.
            </p>
            <div className="mt-3.5">
              <DemoFixtureSelector variant="grid" />
            </div>
          </div>

          <div className="rounded-xl border border-border/90 bg-panel p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-foreground">Equivalent CLI invocation</h2>
            </div>
            <pre className="mt-3.5 overflow-x-auto rounded-lg border border-border-strong bg-background p-3.5 font-mono text-xs font-medium text-foreground shadow-2xs">
              {`depdrift scan ${value || "<repository>"} \\
  --history \\
  --out depdrift-report.json`}
            </pre>
            <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">
              This dashboard renders the JSON report produced by that command.
            </p>
          </div>
        </div>

        <div>
          {step >= 0 ? (
            <ScanProgress step={step} target={value} />
          ) : (
            <div className="grid-backdrop rounded-xl border border-dashed border-border-strong/70 bg-panel/50 p-8 text-center shadow-panel">
              <p className="text-sm font-medium text-muted-foreground">
                Awaiting a repository. Progress and detected ecosystems will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
