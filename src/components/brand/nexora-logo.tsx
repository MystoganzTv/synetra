import Image from "next/image";

import { cn } from "@/lib/utils";

export function NexoraMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-12 w-12 overflow-hidden rounded-2xl", className)}>
      <Image
        src="/synetra-logo.png"
        alt="Synetra"
        fill
        sizes="48px"
        className="object-cover object-[20%_50%]"
        priority
      />
    </div>
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
          : "bg-[linear-gradient(90deg,#1d2866_0%,#3978ff_54%,#7d5cff_100%)] bg-clip-text text-transparent",
        className,
      )}
    >
      Synetra
    </span>
  );
}

export function NexoraLogo({
  className,
  compact = false,
}: {
  className?: string;
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[24px]", className)}>
      <Image
        src="/synetra-logo.png"
        alt="Synetra"
        width={compact ? 220 : 320}
        height={compact ? 70 : 96}
        className={cn(
          "h-auto object-contain",
          compact ? "w-[188px] sm:w-[204px]" : "w-[240px] sm:w-[280px]",
        )}
        priority
      />
    </div>
  );
}
