// safe-response-fallback Edge Function
// Returns a graceful, contextually appropriate response when the live provider is unavailable.
// This is a RESILIENCE path only — not a substitute for the live pipeline.
// TODO [Phase 2]: Enhance with session-aware context and persona prompt injection.
// TODO [Phase 2]: Add safety/care escalation language patterns here.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  companion: [
    "Peace be with you. I'm here and present, even in the quiet.",
    "I hear you. Let's hold this moment together before moving forward.",
    "Your words matter. I'm listening with care.",
    "There is no rush. Let's rest here for a moment.",
    "You are not alone in this. I'm with you.",
  ],
  bridge: [
    "I'm here to help bridge this conversation. Please continue.",
    "Take your time. I'm listening to both voices here.",
  ],
  tutor: [
    "Let's explore this together. What would you like to understand more deeply?",
    "This is a rich passage. Let's take it phrase by phrase.",
  ],
}

function pickResponse(mode: string): string {
  const pool = FALLBACK_RESPONSES[mode] ?? FALLBACK_RESPONSES.companion
  return pool[Math.floor(Math.random() * pool.length)]
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

    const body = await req.json() as { sessionId?: string; mode?: string; userMessage?: string }
    const mode = body.mode ?? "companion"
    const response = pickResponse(mode)

    // Optionally persist the fallback response as a message
    if (body.sessionId) {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("sequence_index")
        .eq("session_id", body.sessionId)
        .order("sequence_index", { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextIndex = (lastMsg?.sequence_index ?? -1) + 1

      await supabase.from("messages").insert({
        session_id: body.sessionId,
        user_id: user.id,
        role: "assistant",
        content: response,
        content_type: "text",
        sequence_index: nextIndex,
        metadata: { source: "safe-fallback" },
      })
    }

    return new Response(
      JSON.stringify({
        response,
        source: "safe-fallback",
        // TODO [Phase 2]: Replace with live-provider response when available
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[safe-response-fallback] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
