"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded border border-white/20 bg-black/30 px-2 py-1 hover:border-neon-magenta/60 hover:text-neon-magenta"
    >
      Logout
    </button>
  );
}
