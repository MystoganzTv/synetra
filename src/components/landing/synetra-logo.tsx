"use client";

type SynetraLogoProps = {
  size?: number;
  className?: string;
};

export function SynetraLogo({ size = 32, className }: SynetraLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="synetra-orbit-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="100%" stopColor="#7b2fff" />
        </linearGradient>
        <linearGradient id="synetra-orbit-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f72585" />
          <stop offset="100%" stopColor="#7b2fff" />
        </linearGradient>
        <filter id="synetra-glow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke="url(#synetra-orbit-1)"
        strokeWidth="1.8"
        fill="none"
        filter="url(#synetra-glow)"
        transform="rotate(-30 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke="url(#synetra-orbit-2)"
        strokeWidth="1.8"
        fill="none"
        filter="url(#synetra-glow)"
        transform="rotate(30 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke="url(#synetra-orbit-1)"
        strokeWidth="1.5"
        fill="none"
        filter="url(#synetra-glow)"
        transform="rotate(90 20 20)"
        opacity="0.6"
      />
      <circle cx="20" cy="20" r="2.5" fill="white" filter="url(#synetra-glow)" />
      <circle cx="20" cy="20" r="1.5" fill="#00f5d4" />
      <circle cx="20" cy="3" r="1.5" fill="#00f5d4" filter="url(#synetra-glow)" />
      <circle cx="20" cy="37" r="1.5" fill="#7b2fff" filter="url(#synetra-glow)" />
      <circle cx="3" cy="20" r="1.5" fill="#f72585" filter="url(#synetra-glow)" />
      <circle cx="37" cy="20" r="1.5" fill="#00f5d4" filter="url(#synetra-glow)" />
    </svg>
  );
}

export default SynetraLogo;
