import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="glass mx-auto mt-4 flex max-w-7xl items-center justify-between px-6 py-3">
        <Link
          href="/admin"
          className="font-display text-sm uppercase tracking-[0.3em] text-neon-cyan neon-text"
        >
          ◈ Carthabot · Admin
        </Link>
        <nav className="flex items-center gap-4 text-xs uppercase tracking-widest text-white/70">
          <Link href="/admin" className="hover:text-neon-cyan">
            Dashboard
          </Link>
          <Link href="/" className="hover:text-neon-cyan">
            Public
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
