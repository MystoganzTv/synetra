import { useId } from "react";

import { cn } from "@/lib/utils";

export function NexoraMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const orbitGradientA = `${id}-orbit-gradient-a`;
  const orbitGradientB = `${id}-orbit-gradient-b`;
  const nodeGradientA = `${id}-node-gradient-a`;
  const nodeGradientB = `${id}-node-gradient-b`;
  const coreGradient = `${id}-core-gradient`;
  const glowFilter = `${id}-glow-filter`;
  const softGlowFilter = `${id}-soft-glow-filter`;

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
      fill="none"
    >
      <defs>
        <linearGradient id={orbitGradientA} x1="18" y1="86" x2="103" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#63EEFF" />
          <stop offset="0.45" stopColor="#4C82FF" />
          <stop offset="1" stopColor="#CC77FF" />
        </linearGradient>
        <linearGradient id={orbitGradientB} x1="25" y1="21" x2="98" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#83F7FF" />
          <stop offset="0.48" stopColor="#4B72FF" />
          <stop offset="1" stopColor="#EF8DFF" />
        </linearGradient>
        <linearGradient id={nodeGradientA} x1="22" y1="88" x2="96" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7BF6FF" />
          <stop offset="1" stopColor="#D984FF" />
        </linearGradient>
        <linearGradient id={nodeGradientB} x1="20" y1="26" x2="99" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DF6FF" />
          <stop offset="1" stopColor="#ED93FF" />
        </linearGradient>
        <radialGradient id={coreGradient} cx="0" cy="0" r="1" gradientTransform="translate(60 60) rotate(90) scale(24)">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.16" stopColor="#C7F8FF" />
          <stop offset="0.42" stopColor="#65AEFF" />
          <stop offset="0.78" stopColor="#6A6DFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#6A6DFF" stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilter} x="-40" y="-40" width="200" height="200" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={softGlowFilter} x="-40" y="-40" width="200" height="200" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${softGlowFilter})`} opacity="0.65">
        <ellipse
          cx="60"
          cy="60"
          rx="18"
          ry="45"
          transform="rotate(-54 60 60)"
          stroke={`url(#${orbitGradientA})`}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <ellipse
          cx="60"
          cy="60"
          rx="18"
          ry="45"
          transform="rotate(54 60 60)"
          stroke={`url(#${orbitGradientB})`}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>

      <g filter={`url(#${glowFilter})`}>
        <ellipse
          cx="60"
          cy="60"
          rx="18"
          ry="45"
          transform="rotate(-54 60 60)"
          stroke={`url(#${orbitGradientA})`}
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <ellipse
          cx="60"
          cy="60"
          rx="18"
          ry="45"
          transform="rotate(54 60 60)"
          stroke={`url(#${orbitGradientB})`}
          strokeWidth="3.8"
          strokeLinecap="round"
        />
      </g>

      <circle cx="60" cy="60" r="13.5" fill={`url(#${coreGradient})`} />
      <circle cx="60" cy="60" r="5.6" fill="#F7FCFF" fillOpacity="0.98" />
      <path d="M52 60H68" stroke="#F7FCFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      <path d="M60 52V68" stroke="#F7FCFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />

      <circle cx="23.3" cy="86.6" r="4.3" fill={`url(#${nodeGradientA})`} />
      <circle cx="96.7" cy="33.4" r="4.3" fill={`url(#${nodeGradientA})`} />
      <circle cx="23.3" cy="33.4" r="4.3" fill={`url(#${nodeGradientB})`} />
      <circle cx="96.7" cy="86.6" r="4.3" fill={`url(#${nodeGradientB})`} />
      <circle cx="44.8" cy="43.7" r="3" fill="#6DEFFF" />
      <circle cx="75.2" cy="76.3" r="3" fill="#8E9CFF" />
    </svg>
  );
}

export function NexoraWordmark({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "select-none text-2xl font-semibold uppercase tracking-[0.2em]",
        inverse
          ? "bg-[linear-gradient(90deg,#ffffff_0%,#eaf0ff_56%,#d8cfff_100%)] bg-clip-text text-transparent"
          : "bg-[linear-gradient(90deg,#132257_0%,#3158ff_62%,#7657ff_100%)] bg-clip-text text-transparent",
        className,
      )}
    >
      Nexora
    </span>
  );
}

export function NexoraLogo({
  className,
  inverse = false,
  compact = false,
}: {
  className?: string;
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2.5", className)}>
      <NexoraMark className={cn(compact ? "h-10 w-10" : "h-12 w-12")} />
      <NexoraWordmark
        inverse={inverse}
        className={cn(compact ? "text-xl tracking-[0.18em]" : "text-[1.85rem] tracking-[0.22em]")}
      />
    </div>
  );
}
