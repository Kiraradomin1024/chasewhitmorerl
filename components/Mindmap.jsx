"use client";
import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

const intensityWidth = { strong: 3, normal: 1.5, weak: 0.7 };
const colorHex = {
  rust: "#c14040",
  blood: "#8b1a1a",
  bone: "#867a66",
};

// dispo auto si pas de position : cercle autour du chase
function autoLayout(chars, w, h) {
  const chase = chars.find((c) => c.is_chase);
  const others = chars.filter((c) => !c.is_chase);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.36;
  const result = {};
  if (chase) result[chase.id] = { x: chase.x ?? cx, y: chase.y ?? cy };
  others.forEach((c, i) => {
    if (c.x != null && c.y != null) {
      result[c.id] = { x: c.x, y: c.y };
    } else {
      const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
      result[c.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    }
  });
  return result;
}

export default function Mindmap({ characters, relations, onReload }) {
  const { isAdmin } = useAuth();
  const supabase = getSupabase();
  const boardRef = useRef(null);
  const [box, setBox] = useState({ w: 800, h: 600 });
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const [editingRel, setEditingRel] = useState(null);
  const [addingFrom, setAddingFrom] = useState(null);

  // mesure + recalcul positions
  useEffect(() => {
    const measure = () => {
      const r = boardRef.current?.getBoundingClientRect();
      if (r) setBox({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setPositions(autoLayout(characters, box.w, box.h));
  }, [characters, box.w, box.h]);

  // drag
  const onMouseDown = (e, id) => {
    if (!isAdmin) return;
    if (addingFrom != null) {
      // mode "création de lien" : second clic = cible
      if (addingFrom !== id) {
        createRelation(addingFrom, id);
      }
      setAddingFrom(null);
      return;
    }
    e.preventDefault();
    setDragging({ id, offsetX: 0, offsetY: 0 });
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const r = boardRef.current?.getBoundingClientRect();
      if (!r) return;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      setPositions((p) => ({ ...p, [dragging.id]: { x, y } }));
    };
    const onUp = async () => {
      const pos = positions[dragging.id];
      if (pos) {
        await supabase
          .from("characters")
          .update({ x: pos.x, y: pos.y })
          .eq("id", dragging.id);
      }
      setDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, positions, supabase]);

  const createRelation = async (from_id, to_id) => {
    await supabase
      .from("character_relations")
      .insert({ from_id, to_id, label: "?", intensity: "normal", color: "rust" });
    onReload?.();
  };
  const removeRelation = async (id) => {
    await supabase.from("character_relations").delete().eq("id", id);
    setEditingRel(null);
    onReload?.();
  };
  const updateRelation = async (id, patch) => {
    await supabase.from("character_relations").update(patch).eq("id", id);
    onReload?.();
  };

  return (
    <div className="space-y-3">
      {/* aide admin */}
      {isAdmin && (
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40 flex items-center gap-4 flex-wrap">
          <span>· glisser un nœud pour le déplacer</span>
          <span>· clic sur un lien pour l'éditer/supprimer</span>
          <button
            onClick={() => setAddingFrom(addingFrom ? null : "WAIT")}
            className={`px-3 py-1 border ${
              addingFrom
                ? "border-rust text-rust"
                : "border-bone/20 hover:border-rust hover:text-rust"
            } transition`}
          >
            {addingFrom === "WAIT"
              ? "→ clic sur le 1er nœud..."
              : addingFrom
              ? "→ clic sur le 2e nœud (esc pour annuler)"
              : "+ créer un lien"}
          </button>
          {addingFrom && (
            <button
              onClick={() => setAddingFrom(null)}
              className="text-bone/40 hover:text-rust"
            >
              annuler
            </button>
          )}
        </div>
      )}

      <div
        ref={boardRef}
        className="relative w-full h-[75vh] bg-ink/50 border border-bone/15 overflow-hidden select-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(139,26,26,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        onClick={(e) => {
          if (addingFrom === "WAIT") setAddingFrom(null);
        }}
      >
        {/* SVG ficelles */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="blur-line">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>
          {relations.map((r) => {
            const a = positions[r.from_id];
            const b = positions[r.to_id];
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={r.id} className="pointer-events-auto">
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={colorHex[r.color] || colorHex.rust}
                  strokeWidth={intensityWidth[r.intensity] || 1.5}
                  strokeOpacity={r.intensity === "weak" ? 0.4 : 0.75}
                  strokeDasharray={r.intensity === "weak" ? "4 4" : undefined}
                  filter="url(#blur-line)"
                  style={isAdmin ? { cursor: "pointer" } : undefined}
                  onClick={() => isAdmin && setEditingRel(r.id)}
                />
                {r.label && (
                  <g
                    transform={`translate(${mx} ${my})`}
                    style={isAdmin ? { cursor: "pointer" } : undefined}
                    onClick={() => isAdmin && setEditingRel(r.id)}
                  >
                    <rect
                      x={-r.label.length * 3.5 - 6}
                      y={-9}
                      width={r.label.length * 7 + 12}
                      height={18}
                      fill="#0a0a0a"
                      fillOpacity="0.85"
                      stroke={colorHex[r.color] || colorHex.rust}
                      strokeOpacity="0.4"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="var(--font-hand)"
                      fontSize="13"
                      fill={colorHex[r.color] || colorHex.rust}
                    >
                      {r.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nœuds */}
        {characters.map((c) => {
          const p = positions[c.id];
          if (!p) return null;
          const isSelected = addingFrom === c.id;
          return (
            <div
              key={c.id}
              onMouseDown={(e) => onMouseDown(e, c.id)}
              onClick={() => {
                if (addingFrom === "WAIT") setAddingFrom(c.id);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-${
                isAdmin ? (addingFrom ? "crosshair" : "grab") : "default"
              } transition-transform`}
              style={{
                left: p.x,
                top: p.y,
                rotate: `${((c.id * 11) % 9) - 4}deg`,
              }}
            >
              {/* polaroid */}
              <div
                className={`bg-bone/95 p-1 pb-3 shadow-2xl ${
                  c.is_chase ? "ring-2 ring-rust" : ""
                } ${isSelected ? "ring-2 ring-rust animate-pulse" : ""}`}
              >
                <div className="portrait w-20 h-20 bg-ink">
                  {c.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image_url}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/40 handwritten text-3xl">
                      ?
                    </div>
                  )}
                </div>
                <div className="handwritten text-ink text-center text-sm mt-1 leading-tight">
                  {c.name}
                </div>
              </div>
              {/* "punaise" */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-rust shadow-lg" />
            </div>
          );
        })}

        {/* Éditeur de lien */}
        {editingRel && isAdmin && (
          <RelEditor
            rel={relations.find((r) => r.id === editingRel)}
            onClose={() => setEditingRel(null)}
            onChange={(patch) => updateRelation(editingRel, patch)}
            onDelete={() => removeRelation(editingRel)}
          />
        )}
      </div>
    </div>
  );
}

function RelEditor({ rel, onClose, onChange, onDelete }) {
  if (!rel) return null;
  return (
    <div className="absolute top-3 right-3 bg-ink/95 border border-rust/60 p-4 w-72 space-y-3 z-10">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone/40">
          lien #{rel.id}
        </div>
        <button onClick={onClose} className="text-bone/40 hover:text-bone">
          ×
        </button>
      </div>
      <label className="block">
        <span className="font-mono text-[10px] tracking-widest uppercase text-bone/40">
          étiquette
        </span>
        <input
          defaultValue={rel.label || ""}
          onBlur={(e) => onChange({ label: e.target.value })}
          className="mt-1 w-full bg-transparent border-b border-bone/30 focus:border-rust outline-none py-1 handwritten text-lg text-bone"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] tracking-widest uppercase text-bone/40">
          intensité
        </span>
        <select
          defaultValue={rel.intensity}
          onChange={(e) => onChange({ intensity: e.target.value })}
          className="mt-1 w-full bg-ink border border-bone/20 p-1 font-mono text-xs"
        >
          <option value="weak">faible (pointillés)</option>
          <option value="normal">normal</option>
          <option value="strong">fort (épais)</option>
        </select>
      </label>
      <label className="block">
        <span className="font-mono text-[10px] tracking-widest uppercase text-bone/40">
          couleur
        </span>
        <select
          defaultValue={rel.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="mt-1 w-full bg-ink border border-bone/20 p-1 font-mono text-xs"
        >
          <option value="rust">rouge (lien vif)</option>
          <option value="blood">sang (lien lourd)</option>
          <option value="bone">os (lien neutre)</option>
        </select>
      </label>
      <button
        onClick={onDelete}
        className="w-full font-mono text-[10px] tracking-[0.3em] uppercase border border-rust/40 text-rust py-2 hover:bg-rust hover:text-ink transition"
      >
        × supprimer le lien
      </button>
    </div>
  );
}
