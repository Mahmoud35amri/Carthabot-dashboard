import { cn } from "@/lib/cn";
import type { Match, Robot, Club } from "@/lib/supabase/types";

type Props = {
  match: Match;
  robotsById: Record<string, Robot>;
  clubsById: Record<string, Club>;
  highlighted?: boolean;
};

export default function MatchCard({
  match,
  robotsById,
  clubsById,
  highlighted = false
}: Props) {
  const isLive = match.status === "live" || highlighted;
  const isDone = match.status === "done";
  const isBye = match.robot_ids.length === 1;

  return (
    <div
      className={cn(
        "glass relative px-3 py-3 transition-all duration-200",
        isLive && "border-neon-cyan/70 shadow-neon animate-pulseGlow",
        isDone && "border-neon-gold/40",
        isBye && "border-dashed opacity-80"
      )}
    >
      {isLive && (
        <span className="absolute -top-2 left-3 rounded-full bg-neon-cyan/90 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-black">
          Live
        </span>
      )}
      {isBye && (
        <span className="absolute -top-2 left-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-white/80">
          Bye
        </span>
      )}
      <ul className="space-y-1">
        {match.robot_ids.map((rid) => {
          const r = robotsById[rid];
          const c = r ? clubsById[r.club_id] : undefined;
          const isWinner = match.winner_ids.includes(rid);
          return (
            <li
              key={rid}
              className={cn(
                "flex items-center justify-between gap-2 rounded px-2 py-1",
                isWinner && "bg-neon-gold/10 text-neon-gold"
              )}
            >
              <span className="font-display text-sm">
                {r?.name ?? "—"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                {c?.name ?? "·"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
