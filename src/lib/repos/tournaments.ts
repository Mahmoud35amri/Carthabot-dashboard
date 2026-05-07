import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Challenge } from "@/lib/challenges";
import type { Tournament, TournamentStatus } from "@/lib/supabase/types";

export async function getTournament(
  db: SupabaseClient,
  challenge: Challenge
): Promise<Tournament> {
  const { data, error } = await db
    .from("tournaments")
    .select("*")
    .eq("challenge", challenge)
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function listTournaments(
  db: SupabaseClient
): Promise<Tournament[]> {
  const { data, error } = await db.from("tournaments").select("*");
  if (error) throw error;
  return (data ?? []) as Tournament[];
}

export async function updateTournamentStatus(
  db: SupabaseClient,
  challenge: Challenge,
  status: TournamentStatus,
  extra: Partial<Pick<Tournament, "draw_seed" | "drawn_at" | "finished_at">> = {}
): Promise<Tournament> {
  const { data, error } = await db
    .from("tournaments")
    .update({ status, ...extra })
    .eq("challenge", challenge)
    .select("*")
    .single();
  if (error) throw error;
  return data as Tournament;
}
