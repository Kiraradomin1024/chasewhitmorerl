"use client";
import { useEffect, useState } from "react";

// Un message pour chaque visite — escalade progressive
const whispers = {
  1: "tu es entré.",
  2: "tu es revenu.",
  3: "encore.",
  4: "tu n'as pas eu assez ?",
  5: "qu'est-ce que tu cherches ici ?",
  6: "tu ne trouveras pas.",
  7: "tu lis ça comme s'il s'agissait de quelqu'un d'autre.",
  8: "ce n'est pas quelqu'un d'autre.",
  9: "regarde mieux.",
  10: "tu te reconnais ?",
  11: "tu mens.",
  12: "tu te mens.",
  13: "il sait que tu reviens.",
  14: "il t'attend.",
  15: "tu es son seul lecteur.",
  16: "personne d'autre ne sait.",
  17: "tu as les mêmes silences que lui.",
  18: "les mêmes 3h du matin.",
  19: "les mêmes maisons qui regardent.",
  20: "47.",
  21: "ferme l'onglet.",
  22: "tu ne le fermeras pas.",
  23: "tu sais que tu reviendras.",
  24: "comme lui.",
  25: "tu es lui maintenant.",
};

const loopWhispers = [
  "encore toi.",
  "tu ne pars jamais vraiment.",
  "il pense à toi aussi.",
  "47.",
  "tu sais pourquoi tu es là.",
  "il n'y a plus de différence.",
  "ferme. l'onglet.",
];

const KEY = "chase_visits_v1";
const LAST_KEY = "chase_last_visit_v1";

// Flag module-level : protège contre la double-invocation du Strict Mode dev,
// mais se reset à chaque vrai chargement de page (F5).
let _alreadyCounted = false;

export default function VisitorWhisper() {
  const [msg, setMsg] = useState(null);
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  // Incrément du compteur + décision du message (synchronisé, pas de setTimeout)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (_alreadyCounted) {
      setCount(parseInt(localStorage.getItem(KEY) || "0", 10));
      return;
    }
    _alreadyCounted = true;

    const prev = parseInt(localStorage.getItem(KEY) || "0", 10);
    const newCount = prev + 1;
    const lastVisit = parseInt(localStorage.getItem(LAST_KEY) || "0", 10);
    const gapMs = lastVisit ? Date.now() - lastVisit : 0;
    localStorage.setItem(KEY, String(newCount));
    localStorage.setItem(LAST_KEY, String(Date.now()));
    setCount(newCount);

    let text = null;
    if (lastVisit && gapMs > 1000 * 60 * 60 * 24 * 3 && newCount > 2) {
      text = "ça faisait longtemps. il a attendu.";
    } else if (whispers[newCount]) {
      text = whispers[newCount];
    } else {
      text = loopWhispers[Math.floor(Math.random() * loopWhispers.length)];
    }

    if (text) {
      setMsg(text);
      setShow(true);
    }
  }, []);

  // Auto-hide après 7s puis suppression du DOM 1.2s plus tard
  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setShow(false), 7000);
    const t2 = setTimeout(() => setMsg(null), 7000 + 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [show]);

  if (!msg) return null;

  return (
    <div
      className={`fixed inset-x-0 top-24 z-[60] pointer-events-none flex justify-center transition-opacity duration-[1200ms] ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative px-8 py-4 text-center">
        {/* halo doux qui respire derrière le texte */}
        <div
          className="absolute inset-0 -m-8 animate-breathe pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,26,26,0.35), rgba(139,26,26,0.08) 45%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        {/* texte principal */}
        <div
          className="relative handwritten bleeding animate-flicker leading-none"
          style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)" }}
        >
          « {msg} »
        </div>
        {/* trait fin sous le texte */}
        <div className="relative mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-rust/60 to-transparent" />
        {/* numéro de visite, très discret */}
        <div className="relative font-mono text-[9px] tracking-[0.5em] uppercase text-bone/25 mt-2">
          n°{count}
        </div>
      </div>
    </div>
  );
}
