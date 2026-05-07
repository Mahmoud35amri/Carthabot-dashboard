/**
 * Carthabot draw algorithm — pure, seedable, club-aware.
 *
 * For tour 1 and tour 2, robots from the same club must NOT share a group
 * unless that club has more robots than there are groups in the tour
 * (the explicit exception in the brief). From tour 3 on, no constraint.
 *
 * Byes: when robots.length is not divisible by groupSize, the surplus get
 * single-robot groups (auto-advance), drawn from the largest clubs first
 * so the remaining groups can satisfy the club-separation constraint.
 */

export type DrawRobot = {
  id: string;
  name: string;
  club_id: string;
};

export type DrawGroup = {
  ordinal: number;        // 0-based position within the tour
  robotIds: string[];     // length 1 (bye) or === groupSize
  isBye: boolean;
};

export type DrawTour = {
  tourNumber: number;
  groupSize: number;
  groups: DrawGroup[];
};

export type DrawInput = {
  robots: DrawRobot[];
  groupSize: 2 | 3 | 4;
  tourNumber: number;
  clubSeparationTours: number; // typically 2
  seed: string;
};

// ---------- seedable RNG (mulberry32) ----------

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function makeRng(seed: string): () => number {
  let a = hashSeed(seed);
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- club bucketing ----------

function bucketByClub(robots: DrawRobot[]): Map<string, DrawRobot[]> {
  const m = new Map<string, DrawRobot[]>();
  for (const r of robots) {
    const list = m.get(r.club_id) ?? [];
    list.push(r);
    m.set(r.club_id, list);
  }
  return m;
}

// ---------- main ----------

export function drawTour(input: DrawInput): DrawTour {
  const { robots, groupSize, tourNumber, clubSeparationTours, seed } = input;
  if (robots.length === 0) {
    return { tourNumber, groupSize, groups: [] };
  }

  const applyClubRule = tourNumber <= clubSeparationTours;
  const rng = makeRng(`${seed}::tour${tourNumber}`);

  // Endgame case: when the remaining field fits inside a single group,
  // run it as ONE decisive match (size 1..groupSize). No padding byes.
  // Examples: AT-S (max 4) with 3 robots left → one match of 3, not 3 byes.
  if (robots.length <= groupSize) {
    const ids = shuffle(
      robots.map((r) => r.id),
      rng
    );
    return {
      tourNumber,
      groupSize,
      groups: [
        {
          ordinal: 0,
          robotIds: ids,
          isBye: ids.length === 1
        }
      ]
    };
  }

  // 1. Bye count = leftover robots after packing as many full groups as possible.
  //    Each bye is a single-robot auto-advance group appended at the end.
  const byeCount = robots.length % groupSize;
  const fullGroupCount = (robots.length - byeCount) / groupSize;

  // 2. Bucket by club, shuffle each bucket for randomness within constraints.
  const buckets = bucketByClub(robots);
  for (const [k, v] of buckets) buckets.set(k, shuffle(v, rng));

  let sortedClubs = [...buckets.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  // 3. Pull byes from the largest clubs first — frees later groups to satisfy
  //    the club-separation rule.
  const byes: DrawRobot[] = [];
  for (let i = 0; i < byeCount; i++) {
    sortedClubs = [...buckets.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );
    const [, list] = sortedClubs[0];
    const r = list.pop()!;
    byes.push(r);
    if (list.length === 0) buckets.delete(sortedClubs[0][0]);
  }

  // 4. Build full groups via club-aware round-robin.
  //    For each group slot, pick from the largest remaining club that hasn't
  //    contributed to this group yet (when applyClubRule is true).
  //    When the largest club is unavoidable (more members than groups), allow
  //    duplicates within a group — the explicit exception.
  const groups: DrawGroup[] = [];
  for (let g = 0; g < fullGroupCount; g++) {
    const slot: DrawRobot[] = [];
    for (let s = 0; s < groupSize; s++) {
      sortedClubs = [...buckets.entries()].sort(
        (a, b) => b[1].length - a[1].length
      );
      const usedClubsInGroup = new Set(slot.map((r) => r.club_id));

      let chosenKey: string | null = null;
      if (applyClubRule) {
        for (const [k, list] of sortedClubs) {
          if (list.length === 0) continue;
          if (!usedClubsInGroup.has(k)) {
            chosenKey = k;
            break;
          }
        }
      }
      if (chosenKey === null) {
        // Either rule disabled (tour >= 3) OR every remaining robot is from
        // an already-represented club -> exception path: take from largest.
        for (const [k, list] of sortedClubs) {
          if (list.length > 0) {
            chosenKey = k;
            break;
          }
        }
      }
      if (chosenKey === null) break; // no robots left (shouldn't happen)
      const list = buckets.get(chosenKey)!;
      slot.push(list.pop()!);
      if (list.length === 0) buckets.delete(chosenKey);
    }
    groups.push({
      ordinal: g,
      robotIds: shuffle(
        slot.map((r) => r.id),
        rng
      ),
      isBye: false
    });
  }

  // 5. Append bye groups at the end so they're visually distinct.
  for (let i = 0; i < byes.length; i++) {
    groups.push({
      ordinal: fullGroupCount + i,
      robotIds: [byes[i].id],
      isBye: true
    });
  }

  return { tourNumber, groupSize, groups };
}

/**
 * Validate that a draw respects the club-separation rule for the given tour.
 * Returns null when valid, or an error message describing the first violation.
 *
 * Used by tests and (optionally) the admin UI to surface unexpected results.
 *
 * The rule is satisfied when, for each group, at most one robot per club —
 * UNLESS that club's total robot count > groupCount (exception path).
 */
export function validateClubSeparation(
  tour: DrawTour,
  robots: DrawRobot[]
): string | null {
  const robotsById = new Map(robots.map((r) => [r.id, r]));
  const buckets = bucketByClub(robots);
  const groupCount = tour.groups.filter((g) => !g.isBye).length;

  for (const g of tour.groups) {
    if (g.isBye) continue;
    const clubs: Record<string, number> = {};
    for (const id of g.robotIds) {
      const r = robotsById.get(id);
      if (!r) continue;
      clubs[r.club_id] = (clubs[r.club_id] ?? 0) + 1;
    }
    for (const [clubId, count] of Object.entries(clubs)) {
      if (count > 1) {
        const totalForClub = buckets.get(clubId)?.length ?? 0;
        if (totalForClub <= groupCount) {
          return `Group ${g.ordinal}: club ${clubId} appears ${count}x but has only ${totalForClub} robots (<= ${groupCount} groups)`;
        }
      }
    }
  }
  return null;
}
