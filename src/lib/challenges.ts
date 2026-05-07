export const CHALLENGES = [
  "soccer_senior",
  "soccer_junior",
  "all_terrain_senior",
  "all_terrain_junior",
  "line_follower"
] as const;

export type Challenge = (typeof CHALLENGES)[number];

export type ChallengeMeta = {
  id: Challenge;
  label: string;
  short: string;
  groupSize: 2 | 3 | 4;
  category: "senior" | "junior" | "all";
  family: "soccer" | "all_terrain" | "line_follower";
  variableAdvance: boolean;
  tagline: string;
};

export const CHALLENGE_META: Record<Challenge, ChallengeMeta> = {
  soccer_senior: {
    id: "soccer_senior",
    label: "Soccer Cup — Senior",
    short: "Soccer S",
    groupSize: 2,
    category: "senior",
    family: "soccer",
    variableAdvance: false,
    tagline: "1v1 elimination on the orbital pitch"
  },
  soccer_junior: {
    id: "soccer_junior",
    label: "Soccer Cup — Junior",
    short: "Soccer J",
    groupSize: 2,
    category: "junior",
    family: "soccer",
    variableAdvance: false,
    tagline: "Rookie pilots, full-throttle goals"
  },
  all_terrain_senior: {
    id: "all_terrain_senior",
    label: "All-Terrain — Senior",
    short: "AT-S",
    groupSize: 4,
    category: "senior",
    family: "all_terrain",
    variableAdvance: true,
    tagline: "Four bots. One asteroid course. Pick your survivors."
  },
  all_terrain_junior: {
    id: "all_terrain_junior",
    label: "All-Terrain — Junior",
    short: "AT-J",
    groupSize: 3,
    category: "junior",
    family: "all_terrain",
    variableAdvance: true,
    tagline: "Three rovers, one challenge — scout's choice on advancers"
  },
  line_follower: {
    id: "line_follower",
    label: "Line Follower",
    short: "LF",
    groupSize: 2,
    category: "all",
    family: "line_follower",
    variableAdvance: false,
    tagline: "Razor-precise, neon-fast, head to head"
  }
};

export const CHALLENGE_LIST: ChallengeMeta[] = CHALLENGES.map(
  (c) => CHALLENGE_META[c]
);

export const isChallenge = (s: string): s is Challenge =>
  (CHALLENGES as readonly string[]).includes(s);

export const CLUB_SEPARATION_TOURS = 2 as const;
