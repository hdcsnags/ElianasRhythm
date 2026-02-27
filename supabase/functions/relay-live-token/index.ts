// relay-live-token Edge Function
// Issues a short-lived relay token for initiating a live session.
// Provider API keys NEVER leave the server.
// TODO [Phase 2]: Generate ephemeral tokens for actual live provider (e.g. Gemini Live API)
// TODO [Phase 2]: Enforce token TTL, session binding, rate limiting

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json() as { sessionId?: string; mode?: string }
    if (!body.sessionId) {
      return new Response(
        JSON.stringify({ error: "sessionId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, user_id, mode, status")
      .eq("id", body.sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const jwt = authHeader.replace(/^Bearer\s+/i, '')

    return new Response(
      JSON.stringify({
        token: jwt,
        relayUrl: Deno.env.get("LIVE_RELAY_URL") ?? null,
        expiresIn: 300,
        sessionId: session.id,
        mode: session.mode,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[relay-live-token] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
