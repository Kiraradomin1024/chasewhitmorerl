import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true } }
    );
  }
  return client;
}

// Pseudo -> email synthétique (Supabase exige un email valide)
export function pseudoToEmail(pseudo) {
  const clean = pseudo.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const domain = process.env.NEXT_PUBLIC_PSEUDO_DOMAIN || "chasewhitmore.app";
  return `${clean}@${domain}`;
}

export function emailToPseudo(email) {
  return email?.split("@")[0] || "";
}
