/**
 * Dev seed — populates Supabase with sample clubs + robots across all 5 challenges.
 *
 * Usage:  npm run seed
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  try {
    const text = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // file missing — that's fine if env is already set
  }
}

loadEnvLocal();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const CLUBS = [
  "IEEE INSAT",
  "IEEE ENIT",
  "Robosoft Sfax",
  "Sup'Com Robotics",
  "ESPRIT Robotics",
  "ENISO Galaxy"
];

const ROBOTS = {
  soccer_senior: ["Nova", "Pulsar", "Quasar", "Vega", "Sirius", "Rigel"],
  soccer_junior: ["Apex", "Bolt", "Comet", "Drift", "Echo", "Flash"],
  all_terrain_senior: [
    "Tundra",
    "Magma",
    "Glacier",
    "Mesa",
    "Crater",
    "Ridge",
    "Dune",
    "Reef"
  ],
  all_terrain_junior: ["Pebble", "Ridge-J", "Sandy", "Mossy", "Cliff", "Cave"],
  line_follower: ["Vector", "Helix", "Photon", "Beam", "Trace", "Edge"]
} as const;

async function main() {
  console.log("Seeding clubs…");
  const clubs: { id: string; name: string }[] = [];
  for (const name of CLUBS) {
    const existing = await db
      .from("clubs")
      .select("*")
      .ilike("name", name)
      .maybeSingle();
    if (existing.data) {
      clubs.push(existing.data);
      continue;
    }
    const inserted = await db
      .from("clubs")
      .insert({ name })
      .select("*")
      .single();
    if (inserted.error) throw inserted.error;
    clubs.push(inserted.data);
  }

  console.log(`Seeded ${clubs.length} clubs.`);

  for (const [challenge, names] of Object.entries(ROBOTS)) {
    console.log(`Seeding ${names.length} robots for ${challenge}…`);
    for (let i = 0; i < names.length; i++) {
      const club = clubs[i % clubs.length];
      const { error } = await db.from("robots").insert({
        name: names[i],
        club_id: club.id,
        challenge
      });
      if (error && !/duplicate/.test(error.message)) {
        console.warn(`  ${names[i]}: ${error.message}`);
      }
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
