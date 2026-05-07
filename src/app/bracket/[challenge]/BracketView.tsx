"use client";
import useSWR from "swr";
import { useMemo } from "react";
import MatchCard from "@/components/MatchCard";
import type { Challenge } from "@/lib/challenges";
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

export default function BracketView({ challenge }: { challenge: Challenge }) {
  const { data, error, isLoading } = useSWR<StateResponse>(
    `/api/state/${challenge}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const robotsById = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.robots.map((r) => [r.id, r])) as Record<
      string,
      Robot
    >;
  }, [data]);

  const clubsById = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.robots.map((r) => [r.club_id, r.club]));
  }, [data]);

  const matchesByRound = useMemo(() => {
    if (!data) return new Map<string, Match[]>();
    const m = new Map<string, Match[]>();
    for (const match of data.matches) {
      const arr = m.get(match.round_id) ?? [];
      arr.push(match);
      m.set(match.round_id, arr);
    }
    return m;
  }, [data]);

  if (isLoading || !data) {
    return <p className="text-white/50">Connecting to mission control…</p>;
  }
  if (error) {
    return (
      <p className="text-red-400">
        Couldn&apos;t load tournament state. Try refreshing.
      </p>
    );
  }

  const status = data.tournament.status;
  const liveMatch = data.currentMatch;
  const liveRobots = liveMatch
    ? liveMatch.robot_ids.map((id) => robotsById[id]).filter(Boolean)
    : [];

  return (
    <>
      {liveMatch && (
        <section className="glass-strong mb-6 border-neon-cyan/70 p-5 shadow-neon animate-pulseGlow">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-neon-cyan neon-text">
            ◉ Now Playing
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">
            {liveRobots.map((r) => r.name).join("  vs  ")}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {liveRobots
              .map((r) => clubsById[r.club_id]?.name ?? "")
              .join("  ·  ")}
          </p>
        </section>
      )}

      {status === "setup" && (
        <p className="glass p-6 text-white/60">
          Roster is being prepared. Check back when the draw is announced.
        </p>
      )}
      {status === "drawn" && (
        <p className="glass mb-6 border-neon-cyan/30 p-4 text-sm text-neon-cyan">
          Draw announced — awaiting kick-off.
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="flex min-w-max items-stretch gap-4 pb-4">
          {data.rounds.map((round) => {
            const ms = matchesByRound.get(round.id) ?? [];
            return (
              <div key={round.id} className="w-[280px] flex-shrink-0">
                <header className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-sm uppercase tracking-widest text-white/70">
                    Tour {round.tour_number}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    {ms.filter((m) => m.status === "done").length}/{ms.length}
                  </span>
                </header>
                <div className="space-y-3">
                  {ms.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      robotsById={robotsById}
                      clubsById={clubsById}
                      highlighted={m.id === liveMatch?.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-widest text-white/30">
        Live · refreshes every 5 seconds
      </p>
    </>
  );
}
