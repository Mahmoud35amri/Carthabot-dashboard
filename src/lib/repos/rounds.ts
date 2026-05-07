import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Round, RoundStatus } from "@/lib/supabase/types";

export async function listRoundsByTournament(
  db: SupabaseClient,
  tournamentId: string
): Promise<Round[]> {
  const { data, error } = await db
    .from("rounds")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("tour_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Round[];
}

export async function deleteRoundsByTournament(
  db: SupabaseClient,
  tournamentId: string
): Promise<void> {
  const { error } = await db
    .from("rounds")
    .delete()
    .eq("tournament_id", tournamentId);
  if (error) throw error;
}

export async function createRound(
  db: SupabaseClient,
  input: {
    tournament_id: string;
    tour_number: number;
    group_size: number;
    ordinal?: number;
  }
): Promise<Round> {
  const { data, error } = await db
    .from("rounds")
    .insert({ ordinal: 0, ...input })
    .select("*")
    .single();
  if (error) throw error;
  return data as Round;
}

export async function setRoundStatus(
  db: SupabaseClient,
  id: string,
  status: RoundStatus
): Promise<void> {
  const { error } = await db.from("rounds").update({ status }).eq("id", id);
  if (error) throw error;
}
