"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function AuthBar() {
  const { profile, isAdmin, signOut, loading } = useAuth();
  if (loading) return null;

  if (!profile) {
    return (
      <Link
        href="/login"
        className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/50 hover:text-bone transition"
      >
        connexion
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase">
      <span className="text-bone/60">
        {profile.pseudo}
        {isAdmin && <span className="bleeding ml-2">[admin]</span>}
      </span>
      <button
        onClick={signOut}
        className="text-bone/40 hover:text-rust transition"
        title="déconnexion"
      >
        ×
      </button>
    </div>
  );
}
