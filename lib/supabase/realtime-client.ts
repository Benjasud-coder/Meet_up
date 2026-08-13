import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/** Singleton anonymous Supabase client used only for Realtime channels. */
export function getRealtimeClient(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Faltan las variables de entorno de Supabase.")
  }
  client = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 20 } },
    auth: { persistSession: false },
  })
  return client
}
