"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Editable from "@/components/Editable";

export default function Bio() {
  const supabase = getSupabase();
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justAddedId, setJustAddedId] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from("bio_fields")
      .select("*")
      .order("position");
    setFields(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const addField = async () => {
    const next = (fields[fields.length - 1]?.position ?? 0) + 1;
    const { data } = await supabase
      .from("bio_fields")
      .insert({ position: next, key: "", value: "" })
      .select()
      .single();
    if (data) setJustAddedId(data.id);
    load();
  };
  const removeField = async (id) => {
    if (!confirm("Supprimer ce champ ?")) return;
    await supabase.from("bio_fields").delete().eq("id", id);
    load();
  };

  return (
    <section className="min-h-screen px-6 md:px-20 py-24 max-w-4xl">
      <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-3">
        dossier · 001 · whitmore, c.
      </div>
      <h1 className="font-serif text-5xl md:text-6xl text-bone mb-2">
        Ce qu'on voit.
      </h1>
      <p className="handwritten text-2xl bleeding mb-16">
        (et ce qu'on choisit de ne pas voir)
      </p>

      {loading ? (
        <div className="font-mono text-bone/30">chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_40px] gap-y-5 gap-x-10 border-t border-bone/10 pt-10">
          {fields.map((f) => (
            <div key={f.id} className="contents">
              <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-bone/40">
                <Editable
                  table="bio_fields"
                  id={f.id}
                  column="key"
                  value={f.key}
                  autoEdit={f.id === justAddedId}
                  placeholder="(nom du champ)"
                  onSaved={() => {
                    setJustAddedId(null);
                    load();
                  }}
                />
              </div>
              <div className="font-serif text-bone/90 text-lg border-b border-bone/5 pb-3">
                <Editable
                  table="bio_fields"
                  id={f.id}
                  column="value"
                  value={f.value}
                  placeholder="(valeur)"
                  onSaved={load}
                />
              </div>
              <div className="flex items-start">
                {isAdmin && (
                  <button
                    onClick={() => removeField(f.id)}
                    className="font-mono text-[10px] text-bone/30 hover:text-rust"
                    title="supprimer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <button
          onClick={addField}
          className="mt-8 font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 py-2 hover:border-rust hover:text-rust transition"
        >
          + ajouter un champ
        </button>
      )}

      <div className="mt-20 border-l-2 border-rust pl-6 max-w-xl">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 mb-2">
          note manuscrite en marge
        </div>
        <p className="handwritten text-2xl text-bone/80 leading-snug">
          Le sourire est bon. La cravate est droite. Les chiffres sont là.
          <br />
          <span className="bleeding">
            Personne ne demande pourquoi il rentre à pied à 3h du matin.
          </span>
        </p>
      </div>

      <div className="mt-24 text-center">
        <a
          href="/histoire"
          className="inline-block mt-3 font-mono text-xs tracking-[0.3em] uppercase border border-bone/20 px-6 py-2 hover:border-rust hover:text-rust transition"
        >
          → journal
        </a>
      </div>
    </section>
  );
}
