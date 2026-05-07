import type { Challenge } from "@/lib/challenges";

export type TournamentStatus = "setup" | "drawn" | "in_progress" | "finished";
export type RoundStatus = "pending" | "live" | "done";
export type MatchStatus = "pending" | "live" | "done";

export type Club = {
  id: string;
  name: string;
  created_at: string;
};

export type Robot = {
  id: string;
  name: string;
  club_id: string;
  challenge: Challenge;
  created_at: string;
};

export type RobotWithClub = Robot & { club: Club };

export type Tournament = {
  id: string;
  challenge: Challenge;
  status: TournamentStatus;
  draw_seed: string | null;
  created_at: string;
  drawn_at: string | null;
  finished_at: string | null;
};

export type Round = {
  id: string;
  tournament_id: string;
  tour_number: number;
  group_size: number;
  status: RoundStatus;
  ordinal: number;
  created_at: string;
};

export type Match = {
  id: string;
  round_id: string;
  robot_ids: string[];
  winner_ids: string[];
  advance_count: number;
  status: MatchStatus;
  ordinal: number;
  played_at: string | null;
  created_at: string;
};
