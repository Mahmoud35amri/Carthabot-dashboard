import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CHALLENGE_META,
  CLUB_SEPARATION_TOURS,
  type Challenge
} from "@/lib/challenges";
import {
  drawTour,
  type DrawRobot,
  type DrawTour
} from "@/lib/draw";
import { listRobotsByChallenge } from "@/lib/repos/robots";
import {
  getTournament,
  updateTournamentStatus
} from "@/lib/repos/tournaments";
import {
  createRound,
  deleteRoundsByTournament,
  listRoundsByTournament
} from "@/lib/repos/rounds";
import {
  createMatch,
  listMatchesByRoundIds
} from "@/lib/repos/matches";

function defaultAdvanceCount(groupSize: number): number {
  // 1v1 always advances 1; AT defaults to floor(group/2). Admin can override.
  return Math.max(1, Math.floor(groupSize / 2));
}

function newSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function persistTour(
  db: SupabaseClient,
  tournamentId: string,
  tour: DrawTour
) {
  const round = await createRound(db, {
    tournament_id: tournamentId,
    tour_number: tour.tourNumber,
    group_size: tour.groupSize,
    ordinal: tour.tourNumber - 1
  });
  for (let i = 0; i < tour.groups.length; i++) {
    const g = tour.groups[i];
    await createMatch(db, {
      round_id: round.id,
      robot_ids: g.robotIds,
      ordinal: i,
      advance_count: g.isBye ? 1 : defaultAdvanceCount(tour.groupSize),
      status: g.isBye ? "done" : "pending",
      winner_ids: g.isBye ? g.robotIds : []
    });
  }
}

export async function generateInitialDraw(
  db: SupabaseClient,
  challenge: Challenge,
  seedInput?: string
) {
  const meta = CHALLENGE_META[challenge];
  const t = await getTournament(db, challenge);

  if (t.status === "in_progress" || t.status === "finished") {
    throw new Error(
      "Tournament already in progress; cannot regenerate the draw."
    );
  }

  const robots = await listRobotsByChallenge(db, challenge);
  if (robots.length < 2) {
    throw new Error("Need at least 2 robots before drawing.");
  }

  await deleteRoundsByTournament(db, t.id);

  const seed = seedInput ?? newSeed();
  const drawRobots: DrawRobot[] = robots.map((r) => ({
    id: r.id,
    name: r.name,
    club_id: r.club_id
  }));

  const tour1 = drawTour({
    robots: drawRobots,
    groupSize: meta.groupSize,
    tourNumber: 1,
    clubSeparationTours: CLUB_SEPARATION_TOURS,
    seed
  });

  await persistTour(db, t.id, tour1);

  await updateTournamentStatus(db, challenge, "drawn", {
    draw_seed: seed,
    drawn_at: new Date().toISOString()
  });

  return { seed, tour: tour1 };
}

export async function resetTournament(
  db: SupabaseClient,
  challenge: Challenge
) {
  const t = await getTournament(db, challenge);
  await deleteRoundsByTournament(db, t.id);
  return updateTournamentStatus(db, challenge, "setup", {
    draw_seed: null,
    drawn_at: null,
    finished_at: null
  });
}

export async function confirmDraw(db: SupabaseClient, challenge: Challenge) {
  const t = await getTournament(db, challenge);
  if (t.status !== "drawn") {
    throw new Error("Draw must be generated before confirming.");
  }
  return updateTournamentStatus(db, challenge, "in_progress");
}

export async function generateNextRound(
  db: SupabaseClient,
  challenge: Challenge
) {
  const meta = CHALLENGE_META[challenge];
  const t = await getTournament(db, challenge);
  if (t.status !== "in_progress") {
    throw new Error("Tournament not in progress.");
  }

  const rounds = await listRoundsByTournament(db, t.id);
  if (rounds.length === 0) throw new Error("No rounds exist yet.");
  const lastRound = rounds[rounds.length - 1];
  const lastRoundMatches = await listMatchesByRoundIds(db, [lastRound.id]);
  const undone = lastRoundMatches.filter((m) => m.status !== "done");
  if (undone.length > 0) {
    throw new Error(
      `Last round has ${undone.length} unfinished match(es). Resolve them first.`
    );
  }

  const winnerIds = lastRoundMatches.flatMap((m) => m.winner_ids);
  if (winnerIds.length < 1) {
    throw new Error("No winners recorded for the last round.");
  }

  // Tournament finished: only one robot left.
  if (winnerIds.length === 1) {
    await updateTournamentStatus(db, challenge, "finished", {
      finished_at: new Date().toISOString()
    });
    return { finished: true, championId: winnerIds[0] };
  }

  const robots = await listRobotsByChallenge(db, challenge);
  const byId = new Map(robots.map((r) => [r.id, r]));
  const winners: DrawRobot[] = winnerIds
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({ id: r.id, name: r.name, club_id: r.club_id }));

  const seed = t.draw_seed ?? newSeed();
  const nextTourNumber = lastRound.tour_number + 1;
  const tour = drawTour({
    robots: winners,
    groupSize: meta.groupSize,
    tourNumber: nextTourNumber,
    clubSeparationTours: CLUB_SEPARATION_TOURS,
    seed
  });

  await persistTour(db, t.id, tour);

  return { finished: false, tour };
}
