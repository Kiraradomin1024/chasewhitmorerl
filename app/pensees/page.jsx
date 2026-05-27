"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Editable from "@/components/Editable";

export default function Pensees() {
  const supabase = getSupabase();
  const { isAdmin } = useAuth();
  const [thoughts, setThoughts] = useState([]);
  const [items, setItems] = useState([]);
  const [newThought, setNewThought] = useState("");
  const [decay, setDecay] = useState(0); // 0 → 1 sur 3 minutes
  const ref = useRef(null);

  // dégradation progressive : plafonne à 1 après ~90s
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = (Date.now() - start) / 1000;
      setDecay(Math.min(t / 90, 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // paliers narratifs (atteints rapidement pour que l'effet soit visible)
  const warning = useMemo(() => {
    if (decay > 0.8) return "tu es entré trop loin.";
    if (decay > 0.55) return "tu enfonces.";
    if (decay > 0.3) return "ta présence l'altère.";
    if (decay > 0.08) return "il sait que tu écoutes.";
    return null;
  }, [decay]);

  const load = async () => {
    const { data } = await supabase.from("thoughts").select("*").order("id");
    setThoughts(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  // animation : intervalle, durée de vie, agressivité s'intensifient avec decay
  useEffect(() => {
    if (thoughts.length === 0) return;

    const rectsOverlap = (a, b, pad = 1) =>
      !(
        a.x + a.w / 2 + pad < b.x - b.w / 2 ||
        a.x - a.w / 2 - pad > b.x + b.w / 2 ||
        a.y + a.h / 2 + pad < b.y - b.h / 2 ||
        a.y - a.h / 2 - pad > b.y + b.h / 2
      );

    const interval = 900 - decay * 650; // 900ms → 250ms
    const lifeMs = 7000 + decay * 5000; // 7s → 12s
    const rotAmp = 22 + decay * 25; // 22° → 47°
    const redChance = 0.45 + decay * 0.5; // 0.45 → 0.95
    const sizeBoost = decay * 6; // un peu plus gros à la fin

    const spawn = () => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;

      setItems((prev) => {
        const visibleTexts = new Set(prev.map((p) => p.t));
        const pool = thoughts.filter((th) => !visibleTexts.has(th.text));
        if (pool.length === 0) return prev;
        const t = pool[Math.floor(Math.random() * pool.length)].text;

        const size = 14 + Math.random() * 24 + sizeBoost;
        const wPx = t.length * size * 0.5 + 16;
        const hPx = size * 1.4;
        const w = (wPx / box.width) * 100;
        const h = (hPx / box.height) * 100;

        let chosen = null;
        for (let i = 0; i < 40; i++) {
          const x = w / 2 + 2 + Math.random() * (96 - w);
          const y = h / 2 + 2 + Math.random() * (96 - h);
          const candidate = { x, y, w, h };
          if (!prev.some((p) => rectsOverlap(candidate, p))) {
            chosen = candidate;
            break;
          }
        }
        if (!chosen) return prev;

        const item = {
          id: crypto.randomUUID(),
          t,
          x: chosen.x,
          y: chosen.y,
          w,
          h,
          rot: (Math.random() - 0.5) * rotAmp,
          size,
          red: Math.random() < redChance,
        };
        setTimeout(
          () => setItems((curr) => curr.filter((c) => c.id !== item.id)),
          lifeMs
        );
        return [...prev, item];
      });
    };

    spawn();
    const id = setInterval(spawn, interval);
    return () => clearInterval(id);
  }, [thoughts, decay]);

  const add = async (e) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    await supabase.from("thoughts").insert({ text: newThought.trim() });
    setNewThought("");
    load();
  };
  const remove = async (id) => {
    await supabase.from("thoughts").delete().eq("id", id);
    load();
  };

  // valeurs CSS dérivées du decay
  const scanOp = 0.2 + decay * 0.45;
  const tremble = decay > 0.6 ? "tremble" : "";
  const redPulse = decay > 0.7;

  return (
    <section className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 scanlines pointer-events-none transition-opacity duration-1000"
        style={{ opacity: scanOp }}
      />
      {/* halo rouge qui pulse aux paliers profonds */}
      {redPulse && (
        <div
          className="absolute inset-0 pointer-events-none animate-breathe"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,26,26,0.18), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      )}

      <div className={`relative z-10 px-6 md:px-20 py-24 ${tremble}`}>
        <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-3 animate-flicker">
          accès · niveau profond · ne pas rester trop longtemps
        </div>
        <h1
          className="glitch font-serif text-5xl md:text-6xl text-bone mb-2"
          data-text="Ce qui crie."
          style={{
            filter: decay > 0.5 ? `blur(${(decay - 0.5) * 1.5}px)` : "none",
          }}
        >
          Ce qui crie.
        </h1>
        <p className="handwritten text-2xl bleeding mb-8">
          (en permanence. même quand il sourit.)
        </p>

        {/* avertissement narratif qui change avec la décroissance */}
        <div className="h-8 mb-12">
          {warning && (
            <div
              key={warning}
              className="handwritten text-xl bleeding animate-flicker"
            >
              « {warning} »
            </div>
          )}
        </div>

        <div
          ref={ref}
          className="relative w-full h-[70vh] border border-bone/10 bg-ink/40 overflow-hidden"
        >
          {items.map((it) => (
            <span
              key={it.id}
              className={`absolute handwritten select-none animate-flicker ${
                it.red ? "bleeding" : "text-bone/70"
              }`}
              style={{
                top: `${it.y}%`,
                left: `${it.x}%`,
                transform: `translate(-50%, -50%) rotate(${it.rot}deg)`,
                transformOrigin: "center",
                fontSize: `${it.size}px`,
                whiteSpace: "nowrap",
                transition: "opacity 1s",
              }}
            >
              {it.t}
            </span>
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div
                className="heartbeat bg-rust rounded-full mx-auto mb-4"
                style={{
                  width: `${24 + decay * 18}px`,
                  height: `${24 + decay * 18}px`,
                  animationDuration: `${1.8 - decay * 1}s`,
                }}
              />
              <div className="handwritten text-bone/30 text-lg">
                {thoughts.length > 0
                  ? decay > 0.8
                    ? "tu n'aurais pas dû rester."
                    : "c'est toujours comme ça, là-dedans."
                  : "silence. (l'admin n'a rien écrit.)"}
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-12 border border-bone/15 bg-ink/60 p-6 max-w-2xl">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 mb-4">
              console · pensées intrusives
            </div>
            <form onSubmit={add} className="flex gap-2 mb-6">
              <input
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="une nouvelle voix dans sa tête..."
                className="flex-1 bg-transparent border-b border-bone/30 focus:border-rust outline-none py-2 font-serif handwritten text-xl text-bone"
              />
              <button
                type="submit"
                className="font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 hover:border-rust hover:text-rust transition"
              >
                + ajouter
              </button>
            </form>
            <ul className="space-y-1 max-h-64 overflow-y-auto pr-2">
              {thoughts.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-3 group py-1"
                >
                  <div className="handwritten text-lg text-bone/70 group-hover:text-bone flex-1">
                    <Editable
                      table="thoughts"
                      id={t.id}
                      column="text"
                      value={t.text}
                      onSaved={load}
                      placeholder="(vide)"
                    />
                  </div>
                  <button
                    onClick={() => remove(t.id)}
                    className="font-mono text-[10px] text-bone/30 hover:text-rust opacity-0 group-hover:opacity-100 mt-2"
                  >
                    × suppr.
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-16 max-w-xl">
          <p className="font-serif italic text-bone/60 text-lg leading-relaxed">
            Il dit qu'il va bien. Il dit qu'il a juste mal dormi. Il dit qu'il a
            juste eu une longue semaine.
          </p>
          <p className="handwritten text-2xl bleeding mt-4">
            Il dit beaucoup de choses.
          </p>
        </div>

        <div className="mt-24 text-center">
          <a
            href="/"
            className="inline-block font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-6 py-2 hover:border-rust hover:text-rust transition"
          >
            ← refermer la porte
          </a>
        </div>
      </div>
    </section>
  );
}
