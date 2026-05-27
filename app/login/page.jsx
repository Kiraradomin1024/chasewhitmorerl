"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [pseudo, setPseudo] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "signin") await signIn(pseudo, pwd);
      else await signUp(pseudo, pwd);
      router.push("/");
    } catch (e) {
      setErr(e.message || "erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-bone/15 bg-ink/60 p-10 space-y-6"
      >
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-2">
            accès · console
          </div>
          <h1 className="handwritten text-4xl text-bone">
            {mode === "signin" ? "se reconnaître" : "se déclarer"}
          </h1>
          <p className="handwritten text-base bleeding mt-1">
            {mode === "signin" ? "il faut bien rentrer un jour." : "donne-toi un nom."}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/50">
              pseudo
            </span>
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 w-full bg-transparent border-b border-bone/30 focus:border-rust outline-none py-2 font-serif text-lg text-bone"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/50">
              mot de passe
            </span>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="mt-1 w-full bg-transparent border-b border-bone/30 focus:border-rust outline-none py-2 font-serif text-lg text-bone tracking-widest"
            />
          </label>
        </div>

        {err && (
          <div className="bleeding handwritten text-base animate-flicker">
            « {err} »
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-6 py-3 hover:border-rust hover:text-rust transition disabled:opacity-40"
        >
          {busy ? "..." : mode === "signin" ? "→ entrer" : "→ créer"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="block w-full font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 hover:text-bone transition"
        >
          {mode === "signin"
            ? "je n'ai pas encore de nom →"
            : "← je me souviens déjà"}
        </button>
      </form>
    </section>
  );
}
