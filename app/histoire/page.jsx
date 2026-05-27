"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Editable from "@/components/Editable";

const toneStyles = {
  calme: "text-bone/80",
  trouble: "text-bone/70 italic",
  sombre: "text-bone/60",
  fissure: "bleeding",
  fin: "bleeding handwritten text-2xl leading-relaxed animate-flicker",
};
const tones = ["calme", "trouble", "sombre", "fissure", "fin"];

export default function Histoire() {
  const supabase = getSupabase();
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justAddedId, setJustAddedId] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("position");
    setEntries(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const next = (entries[entries.length - 1]?.position ?? 0) + 1;
    const { data } = await supabase
      .from("journal_entries")
      .insert({ position: next, date_label: "", tone: "calme", text: "" })
      .select()
      .single();
    if (data) setJustAddedId(data.id);
    load();
  };
  const remove = async (id) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    await supabase.from("journal_entries").delete().eq("id", id);
    load();
  };
  const setTone = async (id, tone) => {
    await supabase.from("journal_entries").update({ tone }).eq("id", id);
    load();
  };

  return (
    <section className="min-h-screen px-6 md:px-20 py-24 max-w-3xl">
      <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-3">
        journal · non destiné à être lu
      </div>
      <h1 className="font-serif text-5xl md:text-6xl text-bone mb-2">
        Ce qu'il écrit.
      </h1>
      <p className="handwritten text-2xl bleeding mb-16">
        quand la maison dort.
      </p>

      {loading ? (
        <div className="font-mono text-bone/30">chargement...</div>
      ) : entries.length === 0 ? (
        <div className="border border-bone/10 bg-ink/40 px-10 py-20 text-center">
          <div className="handwritten text-3xl text-bone/30 animate-flicker">
            — pages arrachées —
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {entries.map((e, i) => (
            <article
              key={e.id}
              className="relative pl-6 border-l border-bone/10"
              style={{ marginLeft: `${(i % 3) * 8}px` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/30">
                  <Editable
                    table="journal_entries"
                    id={e.id}
                    column="date_label"
                    value={e.date_label}
                    onSaved={load}
                    placeholder="—"
                  />
                </div>
                {isAdmin && (
                  <>
                    <select
                      value={e.tone}
                      onChange={(ev) => setTone(e.id, ev.target.value)}
                      className="bg-ink border border-bone/20 text-bone/60 font-mono text-[10px] tracking-widest uppercase px-1"
                    >
                      {tones.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(e.id)}
                      className="font-mono text-[10px] text-bone/30 hover:text-rust ml-auto"
                    >
                      × suppr.
                    </button>
                  </>
                )}
              </div>
              <div
                className={`font-serif text-lg leading-loose whitespace-pre-line ${toneStyles[e.tone]}`}
              >
                <Editable
                  table="journal_entries"
                  id={e.id}
                  column="text"
                  value={e.text}
                  multiline
                  autoEdit={e.id === justAddedId}
                  placeholder="écris ici..."
                  onSaved={(v) => {
                    setJustAddedId(null);
                    load();
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <button
          onClick={add}
          className="mt-12 font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 py-2 hover:border-rust hover:text-rust transition"
        >
          + nouvelle entrée
        </button>
      )}

      <div className="mt-32 text-center">
        <a
          href="/relations"
          className="inline-block font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-6 py-2 hover:border-rust hover:text-rust transition"
        >
          → ceux qui restent
        </a>
      </div>
    </section>
  );
}
