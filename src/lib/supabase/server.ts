import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Acts as the signed-in admin, so row level security applies to every call. */
export async function createSessionClient() {
  // The auth client reads the clock as soon as it starts, which Cache Components
  // only allows once the render is committed to request time.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
