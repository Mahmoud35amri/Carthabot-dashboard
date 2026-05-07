"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NeonButton from "@/components/NeonButton";
import MatchCard from "@/components/MatchCard";
import type { ChallengeMeta } from "@/lib/challenges";
import type {
  Match,
  Round,
  RobotWithClub,
  Tournament
} from "@/lib/supabase/types";

interface Props {
  challenge: ChallengeMeta["id"];
  meta: ChallengeMeta;
  robots: RobotWithClub[];
  tournament: Tournament;
  rounds: Round[];
  matches: Match[];
}

export default function DrawClient({
  challenge,
  meta,
  robots,
  tournament,
  rounds,
  matches
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"draw" | "confirm" | null>(null);

  const tour1 = rounds.find((r) => r.tour_number === 1);
  const tour1Matches = useMemo(
    () => (tour1 ? matches.filter((m) => m.round_id === tour1.id) : []),
    [tour1, matches]
  );
  const robotsById = useMemo(
    () => Object.fromEntries(robots.map((r) => [r.id, r])),
    [robots]
  );
  const clubsById = useMemo(
    () => Object.fromEntries(robots.map((r) => [r.club_id, r.club])),
    [robots]
  );

  async function generate() {
    setError(null);
    setBusy("draw");
    try {
      const res = await fetch(`/api/admin/${challenge}/draw`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({})
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "draw failed");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "draw failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function confirm() {
    setError(null);
    setBusy("confirm");
    try {
      const res = await fetch(`/api/admin/${challenge}/draw/confirm`, {
        method: "POST"
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "confirm failed");
      router.push(`/admin/${challenge}/matches`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "confirm failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  const canRedraw = tournament.status === "setup" || tournament.status === "drawn";
  const canConfirm = tournament.status === "drawn";
  const lockedFromInProgress =
    tournament.status === "in_progress" || tournament.status === "finished";

  return (
    <div>
      <section className="glass mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg uppercase tracking-widest text-neon-cyan">
              Tour 1 · {robots.length} robot
              {robots.length === 1 ? "" : "s"} · {meta.groupSize} per group
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Status:{" "}
              <span className="font-display uppercase tracking-widest text-white/80">
                {tournament.status}
              </span>
              {tournament.draw_seed && (
                <>
                  {" "}
                  · seed{" "}
                  <span className="font-mono">{tournament.draw_seed}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canRedraw && robots.length >= 2 && (
              <NeonButton
                variant="cyan"
                onClick={generate}
                loading={busy === "draw"}
              >
                {tour1 ? "Re-roll Draw" : "Generate Draw"}
              </NeonButton>
            )}
            {canConfirm && (
              <NeonButton
                variant="gold"
                onClick={confirm}
                loading={busy === "confirm"}
              >
                Confirm & Lock
              </NeonButton>
            )}
            {lockedFromInProgress && (
              <p className="text-xs text-white/50">
                Tournament in progress — draw locked.
              </p>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {robots.length < 2 && (
          <p className="mt-4 text-sm text-yellow-300">
            Add at least 2 robots before drawing.
          </p>
        )}
      </section>

      {tour1Matches.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-sm uppercase tracking-widest text-white/60">
            Preview ({tour1Matches.length} group
            {tour1Matches.length === 1 ? "" : "s"})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tour1Matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                robotsById={robotsById}
                clubsById={clubsById}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
