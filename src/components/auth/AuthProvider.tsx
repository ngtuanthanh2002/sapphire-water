"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Auth = {
  /** False until the browser has checked for a session. */
  ready: boolean;
  isAdmin: boolean;
  markSignedIn: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function useAuth() {
  const auth = use(AuthContext);
  if (!auth) throw new Error("useAuth must be used within AuthProvider");
  return auth;
}

// Lives in the browser so the home page stays fully prerendered, and imports
// Supabase only when a session cookie exists: visitors never download it.
// The login form rejects non-admins, so a session here means an admin.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      let signedIn = false;
      if (document.cookie.includes("sb-")) {
        const { createBrowserSupabase } = await import("@/lib/supabase/client");
        const { data } = await createBrowserSupabase().auth.getSession();
        signedIn = Boolean(data.session);
      }
      if (active) {
        setIsAdmin(signedIn);
        setReady(true);
      }
    }

    void check();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<Auth>(
    () => ({
      ready,
      isAdmin,
      markSignedIn: () => setIsAdmin(true),
      signOut: async () => {
        const { createBrowserSupabase } = await import("@/lib/supabase/client");
        await createBrowserSupabase().auth.signOut();
        setIsAdmin(false);
        if (window.location.pathname.startsWith("/admin")) router.push("/blog");
        else router.refresh();
      },
    }),
    [ready, isAdmin, router],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
