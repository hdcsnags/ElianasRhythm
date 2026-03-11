// start-session Edge Function
// Creates a new session record and returns its context.
// TODO [Phase 2]: Add persona config assembly, mode-specific system prompts, safety parameters.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    const body = await req.json() as { mode?: string; title?: string }
    const mode = body.mode ?? "companion"
    const title = body.title ?? null

    if (!["companion", "bridge", "tutor"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be companion, bridge, or tutor." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        mode,
        title,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // TODO [Phase 2]: Fetch user profile/preferences and assemble persona context
    // TODO [Phase 2]: Retrieve recent session context for continuity
    // TODO [Phase 2]: Build mode-specific system prompt from templates

    return new Response(
      JSON.stringify({
        session,
        context: {
          // Placeholder context — Phase 2 will populate with persona + history
          persona: "eliana-v1-placeholder",
          mode,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[start-session] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
