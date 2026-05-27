"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabase } from "@/lib/supabase";

/**
 * Inline editable text. Only renders edit button when admin.
 * Props:
 *   table, id, column  → où sauver
 *   value              → valeur actuelle
 *   onSaved(newVal)    → callback après save
 *   multiline          → textarea vs input
 *   className          → classes appliquées à l'affichage ET à l'éditeur
 */
export default function Editable({
  table,
  id,
  column,
  value,
  onSaved,
  multiline = false,
  className = "",
  placeholder = "",
  autoEdit = false,
}) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(autoEdit && isAdmin);
  const [val, setVal] = useState(value ?? "");

  useEffect(() => {
    if (autoEdit && isAdmin) setEditing(true);
  }, [autoEdit, isAdmin]);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => setVal(value ?? ""), [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select?.();
    }
  }, [editing]);

  const save = async () => {
    if (val === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const sb = getSupabase();
    const { error } = await sb.from(table).update({ [column]: val }).eq("id", id);
    setSaving(false);
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    onSaved?.(val);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span className="group relative inline">
        <span className={className}>{value || <span className="opacity-30">{placeholder}</span>}</span>
        {isAdmin && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 ml-2 font-mono text-[10px] tracking-widest uppercase text-rust hover:text-bone transition align-middle"
            title="éditer"
          >
            ✎
          </button>
        )}
      </span>
    );
  }

  const Tag = multiline ? "textarea" : "input";
  return (
    <span className="inline-flex flex-col gap-1 w-full">
      <Tag
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={multiline ? 4 : undefined}
        className={`${className} bg-ink/60 border border-rust/60 outline-none px-2 py-1 w-full`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
          if (e.key === "Enter" && !multiline) save();
        }}
      />
      <span className="flex gap-2 font-mono text-[10px] tracking-widest uppercase">
        <button
          onClick={save}
          disabled={saving}
          className="text-rust hover:text-bone"
        >
          {saving ? "..." : "✓ sauver"}
        </button>
        <button
          onClick={() => {
            setVal(value ?? "");
            setEditing(false);
          }}
          className="text-bone/40 hover:text-bone"
        >
          × annuler
        </button>
      </span>
    </span>
  );
}
