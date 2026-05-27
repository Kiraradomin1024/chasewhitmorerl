// Mini-parseur markdown maison, sans dépendance.
// Supporte : # H1, ## H2, ### H3, **gras**, *italique*, > citation, ---
// Paragraphes séparés par lignes vides.

function inline(s) {
  // Échappe d'abord le HTML
  let out = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // **gras**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong class='text-bone'>$1</strong>");
  // *italique*
  out = out.replace(/\*([^*]+)\*/g, "<em class='italic'>$1</em>");
  // _italique_
  out = out.replace(/_([^_]+)_/g, "<em class='italic'>$1</em>");
  // ~rayé~
  out = out.replace(/~([^~]+)~/g, "<span class='line-through opacity-50'>$1</span>");
  return out;
}

export function renderMarkdown(text) {
  if (!text) return "";
  const blocks = text.split(/\n\s*\n/);
  const html = blocks
    .map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return "";
      if (trimmed === "---" || trimmed === "***") {
        return "<hr class='border-bone/15 my-10' />";
      }
      if (trimmed.startsWith("### ")) {
        return `<h3 class='font-serif text-xl text-bone/90 mt-8 mb-3'>${inline(
          trimmed.slice(4)
        )}</h3>`;
      }
      if (trimmed.startsWith("## ")) {
        return `<h2 class='font-serif text-2xl text-bone mt-10 mb-4'>${inline(
          trimmed.slice(3)
        )}</h2>`;
      }
      if (trimmed.startsWith("# ")) {
        return `<h1 class='font-serif text-3xl text-bone mt-12 mb-5'>${inline(
          trimmed.slice(2)
        )}</h1>`;
      }
      if (trimmed.startsWith("> ")) {
        const inner = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s?/, ""))
          .join(" ");
        return `<blockquote class='border-l-2 border-rust pl-4 italic text-bone/60 my-5'>${inline(
          inner
        )}</blockquote>`;
      }
      // paragraphe simple, retours à la ligne préservés via <br>
      const html = inline(trimmed).replace(/\n/g, "<br/>");
      return `<p class='mb-5 leading-relaxed'>${html}</p>`;
    })
    .join("\n");
  return html;
}
