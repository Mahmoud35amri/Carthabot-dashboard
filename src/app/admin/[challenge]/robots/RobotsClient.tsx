"use client";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import NeonButton from "@/components/NeonButton";
import type { Challenge } from "@/lib/challenges";
import type { Club, RobotWithClub } from "@/lib/supabase/types";

interface Props {
  challenge: Challenge;
  initialRobots: RobotWithClub[];
  initialClubs: Club[];
}

type ImportResult = {
  inserted: number;
  errors: { row: number; message: string }[];
};

export default function RobotsClient({
  challenge,
  initialRobots,
  initialClubs
}: Props) {
  const router = useRouter();
  const [robots, setRobots] = useState<RobotWithClub[]>(initialRobots);
  const [clubs] = useState<Club[]>(initialClubs);
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const robotsByClub = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of robots) m.set(r.club_id, (m.get(r.club_id) ?? 0) + 1);
    return m;
  }, [robots]);

  async function addRobot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !club.trim()) {
      setError("Name and club are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/robots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, club, challenge })
      });
      const j = (await res.json()) as {
        robot?: RobotWithClub;
        club?: Club;
        error?: string | object;
      };
      if (!res.ok) {
        const msg =
          typeof j.error === "string" ? j.error : "Could not create robot";
        throw new Error(msg);
      }
      if (j.robot && j.club) {
        setRobots((prev) => [...prev, { ...j.robot!, club: j.club! }]);
      }
      setName("");
      setClub("");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "create failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRobot(id: string) {
    if (!confirm("Remove this robot from the challenge?")) return;
    const res = await fetch(`/api/admin/robots/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRobots((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    }
  }

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const text = await file.text();
      const res = await fetch("/api/admin/robots/import", {
        method: "POST",
        headers: { "content-type": "text/csv" },
        body: text
      });
      const j = (await res.json()) as ImportResult & { error?: string };
      if (!res.ok) throw new Error(j.error ?? "import failed");
      setImportResult(j);
      // refresh list
      const listRes = await fetch(`/api/admin/robots?challenge=${challenge}`);
      const listJson = (await listRes.json()) as { robots: RobotWithClub[] };
      setRobots(listJson.robots);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "import failed";
      setError(message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="glass p-5 lg:col-span-1">
        <h2 className="font-display text-lg uppercase tracking-widest text-neon-cyan">
          Register Robot
        </h2>
        <form onSubmit={addRobot} className="mt-4 space-y-3">
          <label className="block">
            <span className="font-display text-xs uppercase tracking-widest text-white/60">
              Robot name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full"
              placeholder="e.g. Cosmos-7"
              required
            />
          </label>
          <label className="block">
            <span className="font-display text-xs uppercase tracking-widest text-white/60">
              Club
            </span>
            <input
              value={club}
              onChange={(e) => setClub(e.target.value)}
              list="club-suggestions"
              className="mt-1 w-full"
              placeholder="e.g. IEEE INSAT"
              required
            />
            <datalist id="club-suggestions">
              {clubs.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <NeonButton type="submit" loading={loading} className="w-full">
            Add Robot
          </NeonButton>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4">
          <h3 className="font-display text-xs uppercase tracking-widest text-white/60">
            Bulk import (CSV)
          </h3>
          <p className="mt-1 text-xs text-white/50">
            CSV header: <code>name,club,challenge</code>
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsv}
            disabled={importing}
            className="mt-2 block w-full text-xs"
          />
          {importing && (
            <p className="mt-2 text-xs text-neon-cyan">Importing…</p>
          )}
          {importResult && (
            <div className="mt-2 text-xs">
              <p className="text-neon-gold">
                Inserted: {importResult.inserted}
              </p>
              {importResult.errors.length > 0 && (
                <ul className="mt-1 list-disc pl-4 text-red-300">
                  {importResult.errors.slice(0, 5).map((e) => (
                    <li key={e.row}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>…and {importResult.errors.length - 5} more</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="glass p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-widest text-neon-cyan">
            Roster · {robots.length}
          </h2>
        </div>
        {robots.length === 0 ? (
          <p className="mt-6 text-sm text-white/50">
            No robots registered yet.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {robots.map((r) => (
              <li
                key={r.id}
                className="group flex items-center justify-between gap-3 rounded border border-white/10 bg-black/30 px-3 py-2 hover:border-neon-cyan/40"
              >
                <div>
                  <div className="font-display text-sm uppercase tracking-wide">
                    {r.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {r.club.name}{" "}
                    <span className="text-white/30">
                      · {robotsByClub.get(r.club_id) ?? 0} from this club
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteRobot(r.id)}
                  className="rounded border border-transparent px-2 py-1 text-xs text-white/30 hover:border-red-400/40 hover:text-red-400"
                  aria-label={`Remove ${r.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
