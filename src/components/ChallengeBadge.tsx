import { cn } from "@/lib/cn";
import type { ChallengeMeta } from "@/lib/challenges";

const FAMILY_GLYPH: Record<ChallengeMeta["family"], string> = {
  soccer: "⚽",
  all_terrain: "🛰",
  line_follower: "⟶"
};

const FAMILY_COLOR: Record<ChallengeMeta["family"], string> = {
  soccer: "from-fuchsia-500/30 to-purple-700/30 border-fuchsia-400/40",
  all_terrain: "from-cyan-500/30 to-blue-700/30 border-cyan-400/40",
  line_follower: "from-amber-500/30 to-orange-700/30 border-amber-300/40"
};

export default function ChallengeBadge({
  meta,
  size = "md"
}: {
  meta: ChallengeMeta;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-2",
    lg: "text-base px-4 py-2 gap-2"
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-gradient-to-r font-display uppercase tracking-wider",
        FAMILY_COLOR[meta.family],
        sizes[size]
      )}
    >
      <span aria-hidden>{FAMILY_GLYPH[meta.family]}</span>
      <span>{meta.short}</span>
    </span>
  );
}
