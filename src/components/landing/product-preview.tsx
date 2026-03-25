import { BarChart3, Calendar, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type ProductPreviewProps = {
  variant: "hero" | "billing" | "platform";
  className?: string;
};

const previewCopy = {
  hero: {
    eyebrow: "Operations Command Center",
    title: "Synetra Workspace",
    metric: "98.2%",
    metricLabel: "claims accepted",
  },
  billing: {
    eyebrow: "Revenue Cycle",
    title: "Billing Readiness Engine",
    metric: "<1%",
    metricLabel: "denial rate",
  },
  platform: {
    eyebrow: "Clinical + Ops",
    title: "Platform Overview",
    metric: "Live",
    metricLabel: "validation layer",
  },
} as const;

export function ProductPreview({ variant, className }: ProductPreviewProps) {
  const content = previewCopy[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.94)_52%,rgba(237,237,255,0.92)_100%)] p-4 shadow-[0_30px_80px_-42px_rgba(34,48,130,0.35)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,94,255,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(0,245,212,0.12),transparent_28%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/80 px-4 py-3 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
              {content.eyebrow}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{content.title}</h3>
          </div>
          <div className="rounded-2xl bg-primary px-4 py-2 text-right text-primary-foreground shadow-lg shadow-primary/20">
            <p className="text-lg font-semibold">{content.metric}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary-foreground/75">
              {content.metricLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 rounded-[24px] border border-border/50 bg-white/76 p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Calendar, label: "Scheduling", value: "24 sessions" },
                { icon: FileText, label: "Notes", value: "4 pending" },
                { icon: ShieldCheck, label: "Compliance", value: "3 alerts" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/50 bg-background/80 p-3">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[22px] border border-border/50 bg-background/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Case: Intensive ABA</p>
                  <p className="text-xs text-muted-foreground">
                    Authorization, sessions, notes, and billing
                  </p>
                </div>
                <div className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Ready to bill
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  "Authorization active with units available",
                  "Progress note completed and signed",
                  "Claim checks passed before submission",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-border/50 bg-[linear-gradient(180deg,rgba(31,44,125,0.98)_0%,rgba(76,53,166,0.95)_100%)] p-4 text-white shadow-[0_20px_60px_-36px_rgba(52,54,160,0.8)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                Operational snapshot
              </p>
              <h4 className="mt-2 text-lg font-semibold">Today&apos;s priorities</h4>
            </div>

            <div className="space-y-3">
              {[
                { title: "Unsigned note", subtitle: "Elena Martinez • 5:00 PM session" },
                { title: "Authorization expiring", subtitle: "Marcus Reed • 2 units remaining" },
                { title: "Document missing", subtitle: "ROI packet still pending signature" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-6 text-white/70">{item.subtitle}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/12 p-2">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                    Collection velocity
                  </p>
                  <p className="text-base font-semibold text-white">8 days average payout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
