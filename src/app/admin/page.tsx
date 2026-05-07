import Link from "next/link";
import { CHALLENGE_LIST } from "@/lib/challenges";
import ChallengeBadge from "@/components/ChallengeBadge";
import { supabaseServer } from "@/lib/supabase/server";
import { listTournaments } from "@/lib/repos/tournaments";
import { listAllRobots } from "@/lib/repos/robots";

const STATUS_STYLE: Record<string, string> = {
  setup: "text-white/60",
  drawn: "text-neon-cyan",
  in_progress: "text-neon-magenta neon-text-magenta",
  finished: "text-neon-gold neon-text-gold"
};

const STATUS_LABEL: Record<string, string> = {
  setup: "Awaiting Robots",
  drawn: "Draw Locked",
  in_progress: "Live",
  finished: "Finished"
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = supabaseServer();
  const [tournaments, allRobots] = await Promise.all([
    listTournaments(db),
    listAllRobots(db)
  ]);
  const robotsByChallenge = new Map<string, number>();
  for (const r of allRobots) {
    robotsByChallenge.set(r.challenge, (robotsByChallenge.get(r.challenge) ?? 0) + 1);
  }
  const tournamentByChallenge = new Map(tournaments.map((t) => [t.challenge, t]));

  return (
    <div>
      <header className="mb-8">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-neon-cyan/80">
          Tournament Control
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-tight">
          Mission Control
        </h1>
        <p className="mt-2 text-white/60">
          Five challenges. Click a tile to manage robots, draw, or run matches.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CHALLENGE_LIST.map((c) => {
          const t = tournamentByChallenge.get(c.id);
          const status = t?.status ?? "setup";
          const robotCount = robotsByChallenge.get(c.id) ?? 0;
          return (
            <div key={c.id} className="glass relative p-5 scanlines">
              <div className="flex items-start justify-between">
                <ChallengeBadge meta={c} size="sm" />
                <span
                  className={`font-display text-xs uppercase tracking-widest ${STATUS_STYLE[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-wide">
                {c.label}
              </h2>
              <p className="mt-1 text-xs text-white/50">
                {robotCount} robot{robotCount === 1 ? "" : "s"} ·{" "}
                {c.groupSize}/round
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs uppercase tracking-widest">
                <Link
                  href={`/admin/${c.id}/robots`}
                  className="rounded border border-white/15 bg-black/40 py-2 hover:border-neon-cyan/60 hover:text-neon-cyan"
                >
                  Robots
                </Link>
                <Link
                  href={`/admin/${c.id}/draw`}
                  className="rounded border border-white/15 bg-black/40 py-2 hover:border-neon-magenta/60 hover:text-neon-magenta"
                >
                  Draw
                </Link>
                <Link
                  href={`/admin/${c.id}/matches`}
                  className="rounded border border-white/15 bg-black/40 py-2 hover:border-neon-gold/60 hover:text-neon-gold"
                >
                  Matches
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
