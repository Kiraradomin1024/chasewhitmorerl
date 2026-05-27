"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabase, pseudoToEmail } from "@/lib/supabase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const supabase = getSupabase();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (uid) => {
      if (!uid) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();
      setProfile(data || null);
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user?.id).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const signIn = async (pseudo, password) => {
    const email = pseudoToEmail(pseudo);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (pseudo, password) => {
    const email = pseudoToEmail(pseudo);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const uid = data.user?.id;
    if (uid) {
      const { error: pErr } = await supabase
        .from("profiles")
        .insert({ id: uid, pseudo: pseudo.trim(), role: "visitor" });
      if (pErr && pErr.code !== "23505") throw pErr;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthCtx.Provider
      value={{ user, profile, loading, isAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
