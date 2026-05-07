import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Challenge } from "@/lib/challenges";
import type { Robot, RobotWithClub } from "@/lib/supabase/types";

export async function listRobotsByChallenge(
  db: SupabaseClient,
  challenge: Challenge
): Promise<RobotWithClub[]> {
  const { data, error } = await db
    .from("robots")
    .select("*, club:clubs(*)")
    .eq("challenge", challenge)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as RobotWithClub[];
}

export async function listAllRobots(
  db: SupabaseClient
): Promise<RobotWithClub[]> {
  const { data, error } = await db
    .from("robots")
    .select("*, club:clubs(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as RobotWithClub[];
}

export async function createRobot(
  db: SupabaseClient,
  input: { name: string; club_id: string; challenge: Challenge }
): Promise<Robot> {
  const { data, error } = await db
    .from("robots")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Robot;
}

export async function deleteRobot(
  db: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await db.from("robots").delete().eq("id", id);
  if (error) throw error;
}
