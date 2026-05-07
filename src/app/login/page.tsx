"use client";
import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NeonButton from "@/components/NeonButton";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Login failed");
      }
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong w-full p-8 scanlines">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-neon-cyan/80 neon-text">
        Authorized Personnel Only
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">
        Admin Console
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Enter the mission passphrase to access tournament control.
      </p>

      <label className="mt-6 block">
        <span className="font-display text-xs uppercase tracking-widest text-white/60">
          Passphrase
        </span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full"
          required
        />
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6">
        <NeonButton type="submit" loading={loading} className="w-full">
          Engage
        </NeonButton>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
