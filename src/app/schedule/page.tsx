import Link from "next/link";
import { CHALLENGE_LIST } from "@/lib/challenges";
import ScheduleClient from "./ScheduleClient";

export default function SchedulePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-white/50 hover:text-neon-cyan"
        >
          ← Galactic Arena
        </Link>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">
          Live Schedule
        </h1>
        <p className="mt-2 text-white/60">
          Now playing and what&apos;s up next, across all five challenges.
        </p>
      </header>
      <ScheduleClient challenges={CHALLENGE_LIST} />
    </main>
  );
}
