"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NeonButton from "@/components/NeonButton";
import { cn } from "@/lib/cn";
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

export default function MatchesClient({
  challenge,
  meta,
  robots,
  tournament,
  rounds,
  matches
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [advanceCounts, setAdvanceCounts] = useState<Record<string, number>>(
    {}
  );

  const robotsById = useMemo(
    () => Object.fromEntries(robots.map((r) => [r.id, r])),
    [robots]
  );

  const matchesByRound = useMemo(() => {
    const m = new Map<string, Match[]>();
    for (const match of matches) {
      const arr = m.get(match.round_id) ?? [];
      arr.push(match);
      m.set(match.round_id, arr);
    }
    return m;
  }, [matches]);

  const lastRound = rounds[rounds.length - 1];
  const lastRoundMatches = lastRound
    ? matchesByRound.get(lastRound.id) ?? []
    : [];
  const lastRoundDone =
    lastRoundMatches.length > 0 &&
    lastRoundMatches.every((m) => m.status === "done");

  function togglePick(matchId: string, robotId: string, max: number) {
    setPicks((prev) => {
      const cur = prev[matchId] ?? [];
      if (cur.includes(robotId)) {
        return { ...prev, [matchId]: cur.filter((x) => x !== robotId) };
      }
      if (cur.length >= max) return prev;
      return { ...prev, [matchId]: [...cur, robotId] };
    });
  }

  function setAdvance(matchId: string, n: number) {
    setAdvanceCounts((prev) => ({ ...prev, [matchId]: n }));
    setPicks((prev) => {
      const cur = prev[matchId] ?? [];
      if (cur.length > n) return { ...prev, [matchId]: cur.slice(0, n) };
      return prev;
    });
  }

  async function startMatch(id: string) {
    setError(null);
    setBusy(`start:${id}`);
    try {
      const res = await fetch(`/api/admin/matches/${id}/start`, {
        method: "POST"
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "start failed");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "start failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function submitResult(match: Match) {
    setError(null);
    const advanceCount =
      advanceCounts[match.id] ??
      (meta.variableAdvance
        ? Math.floor(match.robot_ids.length / 2)
        : 1);
    const winnerIds = picks[match.id] ?? [];
    if (winnerIds.length !== advanceCount) {
      setError(
        `Pick exactly ${advanceCount} winner${advanceCount === 1 ? "" : "s"}.`
      );
      return;
    }
    setBusy(`result:${match.id}`);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}/result`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ winnerIds, advanceCount })
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "result failed");
      setPicks((prev) => {
        const next = { ...prev };
        delete next[match.id];
        return next;
      });
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "result failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function nextRound() {
    setError(null);
    setBusy("next-round");
    try {
      const res = await fetch(`/api/admin/${challenge}/next-round`, {
        method: "POST"
      });
      const j = (await res.json()) as {
        error?: string;
        finished?: boolean;
      };
      if (!res.ok) throw new Error(j.error ?? "next-round failed");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "next-round failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  async function resetTournament() {
    if (
      !confirm(
        "Reset the entire tournament for this challenge?\n\nAll rounds and matches will be deleted. Registered robots are kept. You'll be sent back to the Draw screen to re-roll."
      )
    ) {
      return;
    }
    setError(null);
    setBusy("reset");
    try {
      const res = await fetch(`/api/admin/${challenge}/reset`, {
        method: "POST"
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "reset failed");
      router.push(`/admin/${challenge}/draw`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "reset failed";
      setError(message);
    } finally {
      setBusy(null);
    }
  }

  if (tournament.status === "setup") {
    return (
      <div className="glass p-6 text-white/70">
        <p>No draw yet — head to the Draw tab to generate Tour 1.</p>
      </div>
    );
  }

  if (tournament.status === "drawn") {
    return (
      <div className="glass p-6 text-white/70">
        <p>
          Draw is staged but not confirmed. Confirm the draw to start running
          matches.
        </p>
      </div>
    );
  }

  const champion =
    tournament.status === "finished" && lastRoundMatches.length === 1
      ? robotsById[lastRoundMatches[0].winner_ids[0]]
      : null;

  return (
    <div className="space-y-6">
      {champion && (
        <div className="glass-strong border-neon-gold/60 p-6 text-center shadow-neon-gold">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-neon-gold neon-text-gold">
            Champion
          </p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase neon-text-gold">
            {champion.name}
          </h2>
          <p className="mt-1 text-sm text-white/70">{champion.club.name}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-display text-xs uppercase tracking-widest text-white/40">
          Tournament status:{" "}
          <span className="text-white/70">{tournament.status}</span>
        </span>
        <NeonButton
          variant="magenta"
          onClick={resetTournament}
          loading={busy === "reset"}
          className="border-red-400/60 text-red-300 hover:bg-red-400/10 shadow-[0_0_20px_rgba(248,113,113,0.25)]"
        >
          ⟲ Reset · Redo Draw
        </NeonButton>
      </div>

      {error && (
        <div className="glass border-red-400/50 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {rounds.map((round) => {
        const rm = matchesByRound.get(round.id) ?? [];
        return (
          <section key={round.id} className="glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg uppercase tracking-widest text-neon-cyan">
                Tour {round.tour_number}
              </h2>
              <span className="text-xs uppercase tracking-widest text-white/50">
                {rm.filter((m) => m.status === "done").length}/{rm.length} done
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rm.map((m) => {
                const isBye = m.robot_ids.length === 1;
                const live = m.status === "live";
                const done = m.status === "done";
                const pickedHere = picks[m.id] ?? [];
                const adv =
                  advanceCounts[m.id] ??
                  (meta.variableAdvance
                    ? Math.floor(m.robot_ids.length / 2)
                    : 1);
                const maxAdv = Math.max(1, m.robot_ids.length - 1);

                return (
                  <li
                    key={m.id}
                    className={cn(
                      "rounded-lg border p-3 transition-all",
                      live
                        ? "border-neon-cyan/70 shadow-neon"
                        : done
                          ? "border-neon-gold/30 bg-black/20"
                          : "border-white/10 bg-black/30",
                      isBye && "border-dashed opacity-80"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs uppercase tracking-widest text-white/60">
                        Match {m.ordinal + 1}
                      </span>
                      <span
                        className={cn(
                          "font-display text-[10px] uppercase tracking-widest",
                          live && "text-neon-cyan",
                          done && "text-neon-gold",
                          !live && !done && "text-white/40"
                        )}
                      >
                        {isBye ? "BYE" : m.status}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {m.robot_ids.map((rid) => {
                        const r = robotsById[rid];
                        const isWinner = m.winner_ids.includes(rid);
                        const isPicked = pickedHere.includes(rid);
                        return (
                          <li
                            key={rid}
                            className={cn(
                              "flex items-center justify-between rounded px-2 py-1 text-sm",
                              done && isWinner && "bg-neon-gold/10 text-neon-gold",
                              live && isPicked && "bg-neon-cyan/10 text-neon-cyan",
                              live && !isPicked && "bg-black/30"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {live && (
                                <input
                                  type="checkbox"
                                  checked={isPicked}
                                  onChange={() =>
                                    togglePick(m.id, rid, adv)
                                  }
                                  className="accent-neon-cyan"
                                />
                              )}
                              <span className="font-display">
                                {r?.name ?? "—"}
                              </span>
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                              {r?.club.name ?? "·"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {!isBye && m.status === "pending" && (
                      <div className="mt-3">
                        <NeonButton
                          variant="cyan"
                          onClick={() => startMatch(m.id)}
                          loading={busy === `start:${m.id}`}
                          className="w-full"
                        >
                          Start Match
                        </NeonButton>
                      </div>
                    )}

                    {live && (
                      <div className="mt-3 space-y-2">
                        {meta.variableAdvance && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-display uppercase tracking-widest text-white/60">
                              Advance N
                            </span>
                            <div className="flex gap-1">
                              {Array.from({ length: maxAdv }, (_, i) => i + 1).map(
                                (n) => (
                                  <button
                                    key={n}
                                    onClick={() => setAdvance(m.id, n)}
                                    className={cn(
                                      "min-w-[28px] rounded border px-2 py-1 font-display",
                                      adv === n
                                        ? "border-neon-cyan bg-neon-cyan/20 text-neon-cyan"
                                        : "border-white/15 text-white/60 hover:border-white/30"
                                    )}
                                  >
                                    {n}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        <NeonButton
                          variant="gold"
                          onClick={() => submitResult(m)}
                          loading={busy === `result:${m.id}`}
                          className="w-full"
                          disabled={pickedHere.length !== adv}
                        >
                          {pickedHere.length === adv
                            ? `Confirm ${adv} winner${adv === 1 ? "" : "s"}`
                            : `Pick ${adv - pickedHere.length} more`}
                        </NeonButton>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {round.id === lastRound?.id &&
              lastRoundDone &&
              tournament.status === "in_progress" && (
                <div className="mt-4 text-right">
                  <NeonButton
                    variant="magenta"
                    onClick={nextRound}
                    loading={busy === "next-round"}
                  >
                    Generate Next Tour →
                  </NeonButton>
                </div>
              )}
          </section>
        );
      })}
    </div>
  );
}
