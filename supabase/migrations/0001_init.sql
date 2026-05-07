-- Carthabot Dashboard — initial schema
-- Run this in the Supabase SQL editor (or via the CLI) after creating a fresh project.

-- =========================================================
-- ENUMS
-- =========================================================

DO $$ BEGIN
  CREATE TYPE challenge_type AS ENUM (
    'soccer_senior',
    'soccer_junior',
    'all_terrain_senior',
    'all_terrain_junior',
    'line_follower'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tournament_status AS ENUM ('setup', 'drawn', 'in_progress', 'finished');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE round_status AS ENUM ('pending', 'live', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM ('pending', 'live', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS clubs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS robots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  challenge   challenge_type NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, challenge)
);

CREATE INDEX IF NOT EXISTS idx_robots_challenge ON robots(challenge);
CREATE INDEX IF NOT EXISTS idx_robots_club ON robots(club_id);

CREATE TABLE IF NOT EXISTS tournaments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge     challenge_type NOT NULL UNIQUE,
  status        tournament_status NOT NULL DEFAULT 'setup',
  draw_seed     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  drawn_at      TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rounds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  tour_number     INT NOT NULL,
  group_size      INT NOT NULL CHECK (group_size BETWEEN 1 AND 8),
  status          round_status NOT NULL DEFAULT 'pending',
  ordinal         INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, tour_number)
);

CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON rounds(tournament_id);

CREATE TABLE IF NOT EXISTS matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  robot_ids       UUID[] NOT NULL,
  winner_ids      UUID[] NOT NULL DEFAULT '{}',
  advance_count   INT NOT NULL DEFAULT 1,
  status          match_status NOT NULL DEFAULT 'pending',
  ordinal         INT NOT NULL DEFAULT 0,
  played_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
-- The app uses the Supabase service-role key on the server only;
-- public reads happen through our /api/state/* route handler.
-- We still enable RLS and deny by default for safety; the service
-- role key bypasses RLS, so server code keeps working.

ALTER TABLE clubs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds      ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches     ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SEED ROW: pre-create tournaments for all 5 challenges in 'setup'
-- =========================================================

INSERT INTO tournaments (challenge) VALUES
  ('soccer_senior'),
  ('soccer_junior'),
  ('all_terrain_senior'),
  ('all_terrain_junior'),
  ('line_follower')
ON CONFLICT (challenge) DO NOTHING;
