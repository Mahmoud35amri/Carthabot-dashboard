import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Club } from "@/lib/supabase/types";

export async function listClubs(db: SupabaseClient): Promise<Club[]> {
  const { data, error } = await db
    .from("clubs")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Club[];
}

export async function getOrCreateClub(
  db: SupabaseClient,
  name: string
): Promise<Club> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Club name required");
  const existing = await db
    .from("clubs")
    .select("*")
    .ilike("name", trimmed)
    .maybeSingle();
  if (existing.data) return existing.data as Club;

  const inserted = await db
    .from("clubs")
    .insert({ name: trimmed })
    .select("*")
    .single();
  if (inserted.error) throw inserted.error;
  return inserted.data as Club;
}
