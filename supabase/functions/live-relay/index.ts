// live-relay Edge Function
// WebSocket relay scaffold: browser ↔ this relay ↔ Live Provider WebSocket
// Phase 1: Accepts WebSocket connections, emits mock streaming events for demo resilience.
// TODO [Phase 2]: Wire LIVE_PROVIDER_API_KEY (server-side only) to connect to Gemini Live API.
// TODO [Phase 2]: Implement bidirectional audio chunk forwarding.
// TODO [Phase 2]: Implement VAD event forwarding and interruption handling.
// TODO [Phase 2]: Add per-session rate limiting and abuse protection.
// SECURITY: Provider API keys must NEVER be sent to the client. This relay holds them server-side.

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

  const upgrade = req.headers.get("upgrade")
  if (upgrade?.toLowerCase() !== "websocket") {
    return new Response(
      JSON.stringify({ status: "live-relay online", phase: 1, note: "Connect via WebSocket" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  const url = new URL(req.url)
  const sessionId = url.searchParams.get("sessionId")
  const mode = url.searchParams.get("mode") ?? "companion"
  const token = url.searchParams.get("token")

  // Basic token validation placeholder
  // TODO [Phase 2]: Validate relay token issued by relay-live-token function
  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 })
  }

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req)

  clientSocket.onopen = () => {
    console.log(`[live-relay] Client connected: session=${sessionId} mode=${mode}`)
    clientSocket.send(JSON.stringify({
      type: "session_ready",
      payload: { sessionId, mode, phase: 1 },
      timestamp: Date.now(),
    }))

    // Phase 1 mock: emit a simulated listening → speaking cycle
    // TODO [Phase 2]: Replace with actual Gemini Live API WebSocket connection
    setTimeout(() => {
      if (clientSocket.readyState !== WebSocket.OPEN) return
      clientSocket.send(JSON.stringify({
        type: "assistant_start",
        payload: {},
        timestamp: Date.now(),
      }))

      setTimeout(() => {
        if (clientSocket.readyState !== WebSocket.OPEN) return
        clientSocket.send(JSON.stringify({
          type: "transcript_final",
          payload: {
            text: "Peace be with you. I'm here and listening — your presence is a gift.",
            speaker: "assistant",
          },
          timestamp: Date.now(),
        }))

        setTimeout(() => {
          if (clientSocket.readyState !== WebSocket.OPEN) return
          clientSocket.send(JSON.stringify({
            type: "assistant_end",
            payload: {},
            timestamp: Date.now(),
          }))
        }, 500)
      }, 1200)
    }, 800)
  }

  clientSocket.onmessage = (evt) => {
    // TODO [Phase 2]: Forward audio chunks to live provider WebSocket
    // TODO [Phase 2]: Forward session_start config to provider
    try {
      const msg = JSON.parse(evt.data as string) as { type: string }
      console.log(`[live-relay] Received from client: type=${msg.type}`)
    } catch {
      // Binary audio chunk — forward to provider in Phase 2
    }
  }

  clientSocket.onclose = () => {
    console.log(`[live-relay] Client disconnected: session=${sessionId}`)
    // TODO [Phase 2]: Close provider WebSocket connection gracefully
    // TODO [Phase 2]: Trigger save-transcript for any buffered messages
  }

  clientSocket.onerror = (err) => {
    console.error(`[live-relay] WebSocket error: session=${sessionId}`, err)
  }

  void token

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (supabaseUrl && serviceKey) {
    const adminClient = createClient(supabaseUrl, serviceKey)
    await adminClient
      .from("sessions")
      .update({ metadata: { relay_connected_at: new Date().toISOString(), phase: 1 } })
      .eq("id", sessionId)
      .catch(console.error)
  }

  return response
})
