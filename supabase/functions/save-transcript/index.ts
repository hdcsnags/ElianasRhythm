// save-transcript Edge Function
// Persists one or more transcript messages for a session.
// Called by the relay or frontend after transcript finalization.
// TODO [Phase 2]: Called directly by Cloud Run relay after each turn finalization

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

interface MessagePayload {
  role: "user" | "assistant" | "system"
  content: string
  content_type?: string
  language_code?: string
  sequence_index?: number
  metadata?: Record<string, unknown>
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

    const body = await req.json() as { sessionId: string; messages: MessagePayload[] }

    if (!body.sessionId || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "sessionId and messages[] are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verify session ownership
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", body.sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get current max sequence index
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("sequence_index")
      .eq("session_id", body.sessionId)
      .order("sequence_index", { ascending: false })
      .limit(1)
      .maybeSingle()

    const baseIndex = (lastMsg?.sequence_index ?? -1) + 1

    const inserts = body.messages.map((msg, i) => ({
      session_id: body.sessionId,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      content_type: msg.content_type ?? "text",
      language_code: msg.language_code ?? null,
      sequence_index: msg.sequence_index ?? baseIndex + i,
      metadata: msg.metadata ?? null,
    }))

    const { data: saved, error: insertError } = await supabase
      .from("messages")
      .insert(inserts)
      .select()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ saved: saved?.length ?? 0, messages: saved }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[save-transcript] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
