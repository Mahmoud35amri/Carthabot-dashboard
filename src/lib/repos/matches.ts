import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Match, MatchStatus } from "@/lib/supabase/types";

export async function listMatchesByRound(
  db: SupabaseClient,
  roundId: string
): Promise<Match[]> {
  const { data, error } = await db
    .from("matches")
    .select("*")
    .eq("round_id", roundId)
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function listMatchesByRoundIds(
  db: SupabaseClient,
  roundIds: string[]
): Promise<Match[]> {
  if (roundIds.length === 0) return [];
  const { data, error } = await db
    .from("matches")
    .select("*")
    .in("round_id", roundIds)
    .order("ordinal", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function createMatch(
  db: SupabaseClient,
  input: {
    round_id: string;
    robot_ids: string[];
    advance_count: number;
    ordinal: number;
    status?: MatchStatus;
    winner_ids?: string[];
  }
): Promise<Match> {
  const { data, error } = await db
    .from("matches")
    .insert({ status: "pending", winner_ids: [], ...input })
    .select("*")
    .single();
  if (error) throw error;
  return data as Match;
}

export async function updateMatch(
  db: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<Match, "status" | "winner_ids" | "advance_count" | "played_at">
  >
): Promise<Match> {
  const { data, error } = await db
    .from("matches")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Match;
}

export async function getMatch(
  db: SupabaseClient,
  id: string
): Promise<Match> {
  const { data, error } = await db
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Match;
}
