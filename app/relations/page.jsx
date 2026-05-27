"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import CharacterCard from "@/components/CharacterCard";
import Mindmap from "@/components/Mindmap";

export default function Relations() {
  const supabase = getSupabase();
  const { isAdmin } = useAuth();
  const [view, setView] = useState("cards");
  const [characters, setCharacters] = useState([]);
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: c }, { data: r }] = await Promise.all([
      supabase.from("characters").select("*").order("position"),
      supabase.from("character_relations").select("*"),
    ]);
    setCharacters(c || []);
    setRels(r || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const addCharacter = async () => {
    const next = (characters[characters.length - 1]?.position ?? 0) + 1;
    await supabase.from("characters").insert({
      position: next,
      name: "",
      role: "",
      weight: "",
      description: "",
      quote_them: "",
      quote_him: "",
      color_class: "text-bone/70",
    });
    load();
  };
  const removeCharacter = async (id) => {
    if (!confirm("Supprimer ce personnage et tous ses liens ?")) return;
    await supabase.from("characters").delete().eq("id", id);
    load();
  };

  return (
    <section className="min-h-screen px-6 md:px-20 py-24 max-w-7xl">
      <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-3">
        gravité · qui le retient encore
      </div>
      <h1 className="font-serif text-5xl md:text-6xl text-bone mb-2">
        Ceux qui restent.
      </h1>
      <p className="handwritten text-2xl bleeding mb-10">
        et ce qu'ils ne savent pas.
      </p>

      {/* toggle */}
      <div className="flex items-center gap-2 mb-10 border-y border-bone/10 py-3">
        {[
          ["cards", "fiches"],
          ["board", "tableau"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`font-mono text-[11px] tracking-[0.3em] uppercase px-4 py-2 border transition ${
              view === k
                ? "border-rust text-rust"
                : "border-bone/15 text-bone/50 hover:text-bone"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto font-mono text-[10px] tracking-widest uppercase text-bone/30">
          {characters.length} sujets · {rels.length} liens
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-bone/30">chargement...</div>
      ) : view === "cards" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.map((c) => (
              <CharacterCard
                key={c.id}
                c={c}
                onRemove={removeCharacter}
                onReload={load}
              />
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={addCharacter}
              className="mt-10 font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 py-2 hover:border-rust hover:text-rust transition"
            >
              + ajouter un personnage
            </button>
          )}
        </>
      ) : (
        <Mindmap characters={characters} relations={rels} onReload={load} />
      )}

      <div className="mt-32 text-center">
        <a
          href="/pensees"
          className="inline-block font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-6 py-2 hover:border-rust hover:text-rust transition"
        >
          → ce qui crie dedans
        </a>
      </div>
    </section>
  );
}
