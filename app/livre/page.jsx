"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Editable from "@/components/Editable";
import { renderMarkdown } from "@/lib/markdown";

const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

export default function Livre() {
  const supabase = getSupabase();
  const { isAdmin } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editingBody, setEditingBody] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("book_chapters")
      .select("*")
      .order("position");
    setChapters(data || []);
    setLoading(false);
    if (data?.length && activeId == null) setActiveId(data[0].id);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () => chapters.find((c) => c.id === activeId),
    [chapters, activeId]
  );

  useEffect(() => {
    setDraft(active?.content || "");
    setEditingBody(false);
  }, [active?.id]);

  const addChapter = async () => {
    const next = (chapters[chapters.length - 1]?.position ?? 0) + 1;
    const { data } = await supabase
      .from("book_chapters")
      .insert({ position: next, title: "", content: "" })
      .select()
      .single();
    if (data) setActiveId(data.id);
    load();
  };

  const removeChapter = async (id) => {
    if (!confirm("Supprimer ce chapitre ?")) return;
    await supabase.from("book_chapters").delete().eq("id", id);
    if (activeId === id) setActiveId(null);
    load();
  };

  const move = async (id, dir) => {
    const idx = chapters.findIndex((c) => c.id === id);
    const swap = chapters[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("book_chapters").update({ position: swap.position }).eq("id", id),
      supabase.from("book_chapters").update({ position: chapters[idx].position }).eq("id", swap.id),
    ]);
    load();
  };

  const saveBody = async () => {
    if (!active) return;
    setSaving(true);
    await supabase
      .from("book_chapters")
      .update({ content: draft })
      .eq("id", active.id);
    setSaving(false);
    setEditingBody(false);
    load();
  };

  return (
    <section className="min-h-screen px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.4em] text-bone/40 uppercase mb-3">
        manuscrit · pages non datées
      </div>
      <h1 className="font-serif text-5xl md:text-6xl text-bone mb-2">
        Le Livre.
      </h1>
      <p className="handwritten text-2xl bleeding mb-12">
        ce qu'il écrit quand le journal ne suffit plus.
      </p>

      {loading ? (
        <div className="font-mono text-bone/30">chargement...</div>
      ) : chapters.length === 0 ? (
        <div className="border border-bone/10 bg-ink/40 px-10 py-20 text-center">
          <div className="handwritten text-3xl text-bone/30 animate-flicker mb-6">
            — les pages sont vierges —
          </div>
          {isAdmin && (
            <button
              onClick={addChapter}
              className="font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 py-2 hover:border-rust hover:text-rust transition"
            >
              + écrire le premier chapitre
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
          {/* TABLE DES MATIÈRES */}
          <aside className="border-r-0 md:border-r border-bone/10 pr-0 md:pr-6">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 mb-4">
              table des matières
            </div>
            <ol className="space-y-1">
              {chapters.map((c, i) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id} className="group">
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={`w-full text-left py-2 px-2 transition flex items-baseline gap-3 ${
                        active
                          ? "bg-rust/10 text-rust"
                          : "text-bone/60 hover:text-bone"
                      }`}
                    >
                      <span className="font-mono text-[10px] tracking-widest opacity-60 w-8 shrink-0">
                        {romans[i] || i + 1}
                      </span>
                      <span className="font-serif text-sm leading-tight truncate">
                        {c.title || "sans titre"}
                      </span>
                    </button>
                    {isAdmin && active && (
                      <div className="flex gap-2 px-2 mt-1 font-mono text-[10px] text-bone/30">
                        <button
                          onClick={() => move(c.id, -1)}
                          disabled={i === 0}
                          className="hover:text-rust disabled:opacity-20"
                          title="monter"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => move(c.id, 1)}
                          disabled={i === chapters.length - 1}
                          className="hover:text-rust disabled:opacity-20"
                          title="descendre"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeChapter(c.id)}
                          className="hover:text-rust ml-auto"
                          title="supprimer"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {isAdmin && (
              <button
                onClick={addChapter}
                className="mt-6 font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-3 py-2 hover:border-rust hover:text-rust transition w-full"
              >
                + nouveau chapitre
              </button>
            )}
          </aside>

          {/* CHAPITRE */}
          <article className="max-w-2xl">
            {active && (
              <>
                <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-bone/40 mb-2">
                  chapitre{" "}
                  {romans[chapters.findIndex((c) => c.id === active.id)] ||
                    chapters.findIndex((c) => c.id === active.id) + 1}
                </div>
                <h2 className="font-serif text-4xl text-bone mb-1">
                  <Editable
                    table="book_chapters"
                    id={active.id}
                    column="title"
                    value={active.title}
                    placeholder="(titre du chapitre)"
                    onSaved={load}
                  />
                </h2>
                <div className="h-px w-24 bg-rust/40 mb-10" />

                {/* corps */}
                {editingBody && isAdmin ? (
                  <div>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                      rows={28}
                      className="w-full bg-ink/60 border border-rust/40 outline-none p-4 font-serif text-lg text-bone/90 leading-relaxed resize-y"
                      placeholder="il commença par écrire ce qu'il n'osait dire à voix haute..."
                    />
                    <div className="mt-3 flex items-center gap-4 font-mono text-[10px] tracking-widest uppercase">
                      <button
                        onClick={saveBody}
                        disabled={saving}
                        className="text-rust hover:text-bone disabled:opacity-40"
                      >
                        {saving ? "..." : "✓ sauver"}
                      </button>
                      <button
                        onClick={() => {
                          setDraft(active.content || "");
                          setEditingBody(false);
                        }}
                        className="text-bone/40 hover:text-bone"
                      >
                        × annuler
                      </button>
                      <span className="ml-auto text-bone/30">
                        {draft.length} car · md : ** *_ ~ {">"} # --- pris en
                        charge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className="font-serif text-bone/85 text-lg"
                      style={{ lineHeight: 1.85 }}
                      dangerouslySetInnerHTML={{
                        __html:
                          renderMarkdown(active.content) ||
                          `<p class='handwritten text-2xl text-bone/30 animate-flicker'>— page blanche —</p>`,
                      }}
                    />
                    {isAdmin && (
                      <button
                        onClick={() => setEditingBody(true)}
                        className="mt-8 font-mono text-[10px] tracking-[0.3em] uppercase border border-bone/20 px-4 py-2 hover:border-rust hover:text-rust transition"
                      >
                        ✎ écrire / éditer
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
