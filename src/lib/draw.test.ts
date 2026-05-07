import { describe, expect, it } from "vitest";
import { drawTour, validateClubSeparation, type DrawRobot } from "./draw";

function mkRobots(spec: Record<string, number>): DrawRobot[] {
  const out: DrawRobot[] = [];
  let i = 0;
  for (const [clubId, count] of Object.entries(spec)) {
    for (let n = 0; n < count; n++) {
      out.push({ id: `r${i++}`, name: `${clubId}-${n}`, club_id: clubId });
    }
  }
  return out;
}

describe("drawTour", () => {
  it("8 robots / 4 clubs / 1v1 — no clubmates in tour 1 or 2", () => {
    const robots = mkRobots({ A: 2, B: 2, C: 2, D: 2 });
    for (const t of [1, 2]) {
      const tour = drawTour({
        robots,
        groupSize: 2,
        tourNumber: t,
        clubSeparationTours: 2,
        seed: "test-seed"
      });
      expect(tour.groups.length).toBe(4);
      expect(validateClubSeparation(tour, robots)).toBeNull();
    }
  });

  it("8 robots / 1 club / 1v1 — exception path: clubmates allowed", () => {
    const robots = mkRobots({ A: 8 });
    const tour = drawTour({
      robots,
      groupSize: 2,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "single-club"
    });
    expect(tour.groups.length).toBe(4);
    // Every group will be A vs A, but the validator should accept it
    // because totalForClub (8) > groupCount (4).
    expect(validateClubSeparation(tour, robots)).toBeNull();
    for (const g of tour.groups) {
      expect(g.isBye).toBe(false);
      expect(g.robotIds.length).toBe(2);
    }
  });

  it("10 robots / 3-per-round — 3 full groups + 1 bye", () => {
    const robots = mkRobots({ A: 4, B: 3, C: 3 });
    const tour = drawTour({
      robots,
      groupSize: 3,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "bye-test"
    });
    const fullGroups = tour.groups.filter((g) => !g.isBye);
    const byes = tour.groups.filter((g) => g.isBye);
    expect(fullGroups.length).toBe(3);
    expect(byes.length).toBe(1);
    expect(byes[0].robotIds.length).toBe(1);
    // Total robots placed = 10
    const placed = tour.groups.reduce((s, g) => s + g.robotIds.length, 0);
    expect(placed).toBe(10);
    expect(validateClubSeparation(tour, robots)).toBeNull();
  });

  it("16 robots / mixed clubs / 4-per-round — no clubmates tour 1-2, free tour 3", () => {
    const robots = mkRobots({ A: 4, B: 4, C: 4, D: 4 });
    for (const t of [1, 2]) {
      const tour = drawTour({
        robots,
        groupSize: 4,
        tourNumber: t,
        clubSeparationTours: 2,
        seed: `at-test-${t}`
      });
      expect(tour.groups.length).toBe(4);
      for (const g of tour.groups) expect(g.robotIds.length).toBe(4);
      expect(validateClubSeparation(tour, robots)).toBeNull();
    }
    // Tour 3 — rule no longer applies; just check structure.
    const tour3 = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 3,
      clubSeparationTours: 2,
      seed: "at-test-3"
    });
    expect(tour3.groups.length).toBe(4);
  });

  it("7 robots / 1v1 — 3 matches + 1 bye, bye from largest club", () => {
    const robots = mkRobots({ A: 3, B: 2, C: 2 });
    const tour = drawTour({
      robots,
      groupSize: 2,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "odd-count"
    });
    const fullGroups = tour.groups.filter((g) => !g.isBye);
    const byes = tour.groups.filter((g) => g.isBye);
    expect(fullGroups.length).toBe(3);
    expect(byes.length).toBe(1);
    // Bye should be from club A (the largest).
    const byeRobotId = byes[0].robotIds[0];
    const byeRobot = robots.find((r) => r.id === byeRobotId)!;
    expect(byeRobot.club_id).toBe("A");
    expect(validateClubSeparation(tour, robots)).toBeNull();
  });

  it("is deterministic for the same seed", () => {
    const robots = mkRobots({ A: 4, B: 4, C: 4, D: 4 });
    const a = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "fixed"
    });
    const b = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "fixed"
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("differs across seeds", () => {
    const robots = mkRobots({ A: 4, B: 4, C: 4, D: 4 });
    const a = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "seed-1"
    });
    const b = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "seed-2"
    });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("endgame: 3 robots / groupSize 4 → single match of 3 (no byes)", () => {
    const robots = mkRobots({ A: 1, B: 1, C: 1 });
    const tour = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 3,
      clubSeparationTours: 2,
      seed: "endgame-3-of-4"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(3);
  });

  it("endgame: 2 robots / groupSize 4 → single 1v1 final", () => {
    const robots = mkRobots({ A: 1, B: 1 });
    const tour = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 4,
      clubSeparationTours: 2,
      seed: "endgame-2-of-4"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(2);
  });

  it("endgame: 4 robots / groupSize 4 → single decisive match of 4", () => {
    const robots = mkRobots({ A: 1, B: 1, C: 1, D: 1 });
    const tour = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 3,
      clubSeparationTours: 2,
      seed: "endgame-4-of-4"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(4);
  });

  it("endgame AT-J: 3 robots / groupSize 3 → single decisive match of 3", () => {
    const robots = mkRobots({ A: 1, B: 1, C: 1 });
    const tour = drawTour({
      robots,
      groupSize: 3,
      tourNumber: 3,
      clubSeparationTours: 2,
      seed: "endgame-3-of-3"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(3);
  });

  it("endgame AT-J: 2 robots / groupSize 3 → 1v1 final (no bye)", () => {
    const robots = mkRobots({ A: 1, B: 1 });
    const tour = drawTour({
      robots,
      groupSize: 3,
      tourNumber: 4,
      clubSeparationTours: 2,
      seed: "endgame-2-of-3"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(2);
  });

  it("endgame: 1 robot remaining → single bye group (champion case)", () => {
    const robots = mkRobots({ A: 1 });
    const tour = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 5,
      clubSeparationTours: 2,
      seed: "endgame-champion"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(true);
    expect(tour.groups[0].robotIds.length).toBe(1);
  });

  it("endgame: 2 robots / 1v1 challenge → single match (the final)", () => {
    const robots = mkRobots({ A: 1, B: 1 });
    const tour = drawTour({
      robots,
      groupSize: 2,
      tourNumber: 4,
      clubSeparationTours: 2,
      seed: "endgame-2-of-2"
    });
    expect(tour.groups.length).toBe(1);
    expect(tour.groups[0].isBye).toBe(false);
    expect(tour.groups[0].robotIds.length).toBe(2);
  });

  it("partial-exception: club A has 5 of 12 robots in 4-per-round groups", () => {
    // 12 robots / 4-per-round = 3 groups. Club A has 5 — > groupCount (3),
    // so two A robots SHOULD share a group (exception path).
    const robots = mkRobots({ A: 5, B: 4, C: 3 });
    const tour = drawTour({
      robots,
      groupSize: 4,
      tourNumber: 1,
      clubSeparationTours: 2,
      seed: "partial-exception"
    });
    expect(tour.groups.length).toBe(3);
    expect(validateClubSeparation(tour, robots)).toBeNull();
  });
});
