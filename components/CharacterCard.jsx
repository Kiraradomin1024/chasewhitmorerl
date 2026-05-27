"use client";
import Editable from "./Editable";
import ImageUpload from "./ImageUpload";
import { useAuth } from "./AuthProvider";

export default function CharacterCard({ c, onRemove, onReload }) {
  const { isAdmin } = useAuth();

  return (
    <article className="relative bg-ink/60 border border-bone/15 p-5 transform hover:rotate-0 transition-transform duration-500"
      style={{ rotate: `${((c.id * 13) % 7) - 3}deg` }}
    >
      {/* "scotch" en haut */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-bone/15 rotate-1 opacity-60" />

      <div className="portrait aspect-square bg-ink border border-bone/10 mb-4">
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.image_url}
            alt={c.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bone/20 handwritten text-4xl">
            ?
          </div>
        )}
        {c.is_chase && (
          <div className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.3em] uppercase bleeding bg-ink/80 px-2 py-0.5">
            sujet
          </div>
        )}
      </div>

      <ImageUpload
        value={c.image_url}
        characterId={c.id}
        onUploaded={onReload}
      />

      <h3 className={`font-serif text-2xl leading-tight mt-3 ${c.color_class || "text-bone/80"}`}>
        <Editable
          table="characters"
          id={c.id}
          column="name"
          value={c.name}
          placeholder="(nom)"
          onSaved={onReload}
        />
      </h3>

      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/40 mt-1">
        <Editable
          table="characters"
          id={c.id}
          column="role"
          value={c.role}
          placeholder="(rôle)"
          onSaved={onReload}
        />
        {(c.weight || isAdmin) && (
          <>
            {" · "}
            <Editable
              table="characters"
              id={c.id}
              column="weight"
              value={c.weight}
              placeholder="(poids)"
              onSaved={onReload}
            />
          </>
        )}
      </div>

      <p className="font-serif text-bone/70 text-sm leading-relaxed mt-4 whitespace-pre-line min-h-[3rem]">
        <Editable
          table="characters"
          id={c.id}
          column="description"
          value={c.description}
          multiline
          placeholder="(description)"
          onSaved={onReload}
        />
      </p>

      {(c.quote_them || isAdmin) && (
        <blockquote className="mt-4 border-l-2 border-bone/30 pl-3 italic text-bone/60 text-sm">
          «{" "}
          <Editable
            table="characters"
            id={c.id}
            column="quote_them"
            value={c.quote_them}
            placeholder="(ce qu'iel dit)"
            onSaved={onReload}
          />{" "}
          »
        </blockquote>
      )}
      {(c.quote_him || isAdmin) && !c.is_chase && (
        <blockquote className="mt-2 border-l-2 border-rust pl-3 handwritten text-base bleeding">
          «{" "}
          <Editable
            table="characters"
            id={c.id}
            column="quote_him"
            value={c.quote_him}
            placeholder="(ce que Chase pense)"
            onSaved={onReload}
          />{" "}
          »
          <div className="text-[9px] font-mono tracking-widest uppercase text-bone/30 mt-1 not-italic">
            — lui, à voix basse
          </div>
        </blockquote>
      )}

      {isAdmin && !c.is_chase && (
        <button
          onClick={() => onRemove?.(c.id)}
          className="absolute top-2 right-2 font-mono text-[10px] text-bone/30 hover:text-rust"
        >
          ×
        </button>
      )}
    </article>
  );
}
