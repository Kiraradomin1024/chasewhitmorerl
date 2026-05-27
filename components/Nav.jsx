"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthBar from "./AuthBar";

const links = [
  { href: "/", label: "entrée" },
  { href: "/bio", label: "fiche" },
  { href: "/histoire", label: "journal" },
  { href: "/relations", label: "les autres" },
  { href: "/pensees", label: "pensées" },
];

const whispers = [
  "elle va le savoir",
  "tiens-toi droit",
  "Jimmy l'aurait mieux dit",
  "47 lattes",
  "qui décide vraiment",
  "souris",
  "Richman Lane regarde",
  "tu n'es personne",
  "ferme la porte",
  "non",
  "non",
  "rentre chez toi",
];

export default function Nav() {
  const path = usePathname();
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-ink/85 backdrop-blur-sm border-b border-bone/10">
        <div className="flex items-center justify-between px-4 md:px-8 h-11">
          {/* signature */}
          <Link href="/" className="flex items-baseline gap-2 group">
            <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-bone/70 group-hover:text-bone">
              c. whitmore
            </span>
            <span className="bleeding handwritten text-base leading-none -mb-[2px] animate-flicker">
              /
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/30">
              {time}
            </span>
          </Link>

          {/* links */}
          <nav className="flex items-center gap-1 md:gap-6">
            {links.map((l) => {
              const active = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase px-2 py-1 transition ${
                    active ? "text-rust" : "text-bone/55 hover:text-bone"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -left-2 top-1/2 -translate-y-1/2 bleeding animate-flicker"
                    >
                      ›
                    </span>
                  )}
                  <span
                    className={active ? "glitch" : ""}
                    data-text={l.label}
                  >
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* status + auth */}
          <div className="hidden md:flex items-center gap-4 font-mono text-[10px] tracking-[0.3em] uppercase text-bone/30">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rust animate-flicker" />
              sys: <span className="bleeding">unstable</span>
            </span>
            <span className="text-bone/20">|</span>
            <AuthBar />
          </div>
        </div>
      </header>

      {/* BOTTOM WHISPER TICKER */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-7 overflow-hidden border-t border-bone/10 bg-ink/85 backdrop-blur-sm pointer-events-none">
        <div className="ticker flex items-center h-full whitespace-nowrap will-change-transform">
          {Array.from({ length: 3 }).flatMap((_, k) =>
            whispers.map((w, i) => (
              <span
                key={`${k}-${i}`}
                className={`handwritten text-base mx-6 ${
                  (i + k) % 3 === 0 ? "bleeding" : "text-bone/40"
                }`}
              >
                {w} <span className="text-bone/20 mx-2">·</span>
              </span>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .ticker {
          animation: ticker 90s linear infinite;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
