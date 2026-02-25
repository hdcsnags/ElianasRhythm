// get-session-context Edge Function
// Returns full session + messages for relay/LLM context assembly.
// TODO [Phase 2]: Used by relay to build conversation context window before each LLM turn.
// TODO [Phase 2]: Add summarization for long sessions to stay within context window limits.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    const url = new URL(req.url)
    const sessionId = url.searchParams.get("sessionId")
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "sessionId query param is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: messages, error: msgsError } = await supabase
      .from("messages")
      .select("id, role, content, content_type, sequence_index, created_at")
      .eq("session_id", sessionId)
      .order("sequence_index", { ascending: true })

    if (msgsError) throw msgsError

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_response_style, holy_pause_enabled, preferred_language_primary")
      .eq("id", user.id)
      .maybeSingle()

    return new Response(
      JSON.stringify({
        session,
        messages: messages ?? [],
        profile: profile ?? {},
        // TODO [Phase 2]: Add assembled system prompt for LLM turn
        // TODO [Phase 2]: Add summarized context window if messages exceed token budget
        context: {
          messageCount: messages?.length ?? 0,
          mode: session.mode,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[get-session-context] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
