import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const tactilePressClassName =
  "transition-[transform,box-shadow,filter] duration-150 active:translate-y-[2px] active:scale-[0.992]";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary px-4 py-2 !text-white shadow-lg shadow-primary/20 hover:bg-primary/90 [&_*]:!text-white",
        outline:
          "border border-border bg-white/70 px-4 py-2 text-foreground hover:bg-accent",
        secondary:
          "bg-accent px-4 py-2 text-accent-foreground hover:bg-accent/80",
        contrast:
          "border border-white/70 bg-[rgba(248,250,255,0.96)] px-4 py-2 text-[#182454] shadow-xl shadow-[#101938]/18 hover:bg-white",
        ghost: "px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground",
      },
      size: {
        default: "h-10",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
