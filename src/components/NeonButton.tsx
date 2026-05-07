"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "cyan" | "magenta" | "gold" | "ghost";

export interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  cyan: "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.25)]",
  magenta:
    "border-neon-magenta/60 text-neon-magenta hover:bg-neon-magenta/10 shadow-[0_0_20px_rgba(255,43,214,0.25)]",
  gold: "border-neon-gold/60 text-neon-gold hover:bg-neon-gold/10 shadow-[0_0_20px_rgba(255,209,102,0.3)]",
  ghost: "border-white/15 text-white/80 hover:bg-white/5"
};

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ variant = "cyan", className, children, loading, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-md border bg-black/40 px-4 py-2",
          "font-display uppercase tracking-[0.18em] text-sm transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          VARIANT_CLASS[variant],
          className
        )}
        {...rest}
      >
        {loading ? <span className="animate-pulseGlow">…</span> : children}
      </button>
    );
  }
);
NeonButton.displayName = "NeonButton";

export default NeonButton;
