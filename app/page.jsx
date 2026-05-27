"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const intrusions = [
  "tu n'es personne",
  "elle va le savoir",
  "rentre chez toi",
  "tu déçois",
  "ouvre la porte",
  "qui es-tu vraiment ?",
];

export default function Home() {
  const [word, setWord] = useState(intrusions[0]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWord(intrusions[Math.floor(Math.random() * intrusions.length)]);
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

      <div className="text-center max-w-2xl">
        <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-8 animate-flicker">
          // accès à la conscience — niveau 0
        </div>

        <h1
          className="glitch handwritten text-6xl md:text-8xl text-bone/90 mb-2"
          data-text="Chase"
        >
          Chase
        </h1>
        <h2 className="handwritten text-3xl md:text-5xl bleeding mb-12">
          Whitmore
        </h2>

        <p className="font-serif italic text-bone/70 text-lg md:text-xl leading-relaxed mb-4">
          22 ans. Concessionnaire automobile.<br />
          Fils de Courtney. Frère de Jimmy.<br />
          Habitant de Richman Lane.
        </p>

        <p className="font-serif text-bone/50 text-base md:text-lg leading-relaxed mb-16">
          Et puis quelque chose s'est <span className="bleeding">fissuré</span>.
        </p>

        <div className="h-12 flex items-center justify-center">
          <span
            key={tick}
            className="handwritten text-2xl bleeding animate-glitch"
          >
            « {word} »
          </span>
        </div>

        <div className="mt-20 flex flex-col gap-3 items-center">
          <Link
            href="/bio"
            className="font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-8 py-3 hover:border-rust hover:text-rust transition"
          >
            entrer dans la pièce
          </Link>
          <Link
            href="/pensees"
            className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/30 hover:text-rust transition"
          >
            ou rester dehors, écouter
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 heartbeat">
        <div className="w-3 h-3 bg-rust rounded-full" />
      </div>
    </section>
  );
}
