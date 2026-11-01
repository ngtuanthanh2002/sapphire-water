import "server-only";
import { redirect } from "next/navigation";
import { supabaseReady } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

/** The signed-in admin's client, or null. Call it in every action: UI checks protect nothing. */
export async function getAdminClient() {
  if (!supabaseReady) return null;

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin ? supabase : null;
}

export async function requireAdmin() {
  const supabase = await getAdminClient();
  if (!supabase) redirect("/login");
  return supabase;
}
