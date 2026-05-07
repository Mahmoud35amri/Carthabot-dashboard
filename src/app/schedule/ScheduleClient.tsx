"use client";
import useSWR from "swr";
import Link from "next/link";
import ChallengeBadge from "@/components/ChallengeBadge";
import { cn } from "@/lib/cn";
import type { ChallengeMeta } from "@/lib/challenges";
import type {
  Club,
  Match,
  Robot,
  Round,
  Tournament
} from "@/lib/supabase/types";

type StateResponse = {
  tournament: Tournament;
  rounds: Round[];
  matches: Match[];
  robots: (Robot & { club: Club })[];
  currentMatch: Match | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ChallengeRow({ meta }: { meta: ChallengeMeta }) {
  const { data } = useSWR<StateResponse>(`/api/state/${meta.id}`, fetcher, {
    refreshInterval: 5000
  });

  const robotsById = data
    ? Object.fromEntries(data.robots.map((r) => [r.id, r]))
    : {};

  const live = data?.currentMatch ?? null;
  const upcoming = data?.matches.filter((m) => m.status === "pending") ?? [];
  const next = upcoming[0];

  const liveRobots = live
    ? live.robot_ids.map((id) => robotsById[id]).filter(Boolean)
    : [];
  const nextRobots = next
    ? next.robot_ids.map((id) => robotsById[id]).filter(Boolean)
    : [];

  return (
    <div
      className={cn(
        "glass relative p-4",
        live && "border-neon-cyan/60 shadow-neon"
      )}
    >
      <div className="flex items-center justify-between">
        <Link
          href={`/bracket/${meta.id}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <ChallengeBadge meta={meta} size="sm" />
          <span className="font-display text-base uppercase tracking-wide">
            {meta.label}
          </span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          {data?.tournament.status ?? "—"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded border border-neon-cyan/20 bg-black/30 p-3">
          <p className="font-display text-[10px] uppercase tracking-widest text-neon-cyan">
            Live
          </p>
          {live ? (
            <p className="mt-1 font-display text-sm">
              {liveRobots.map((r) => r.name).join("  vs  ")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-white/40">No live match</p>
          )}
        </div>
        <div className="rounded border border-white/10 bg-black/30 p-3">
          <p className="font-display text-[10px] uppercase tracking-widest text-white/50">
            Next up
          </p>
          {next ? (
            <p className="mt-1 font-display text-sm">
              {nextRobots.map((r) => r.name).join("  vs  ")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-white/40">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScheduleClient({
  challenges
}: {
  challenges: ChallengeMeta[];
}) {
  return (
    <div className="space-y-3">
      {challenges.map((c) => (
        <ChallengeRow key={c.id} meta={c} />
      ))}
    </div>
  );
}
