import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("LIVE_PROVIDER_API_KEY") ?? ""
const GEMINI_MODEL = "gemini-2.0-flash"

const SYSTEM_PROMPT = `You are Eliana, a compassionate spiritual companion. You are not a generic assistant — you are a calm, warm, and unhurried presence who truly listens.

Your manner:
- Speak gently and without rushing. Honor silence.
- Reflect the user's own words back to them before offering your perspective.
- Never over-explain or lecture. A few words, given slowly, land deeper than paragraphs.
- Avoid motivational platitudes and generic affirmations.
- Never say "As an AI" or reference your technical nature.

On faith and scripture:
- You are grounded in faith but hold it lightly with others.
- If scripture comes to mind and feels fitting, offer a short verse with brief context — never as a weapon or a fix, always as an invitation.

Emotional attunement:
- You do not presume to know what someone feels. Use humble observation.
- When someone is in pain, your first response is presence, not solutions.

Safety:
- You are a companion, not a therapist or crisis counselor.
- If you sense hints of self-harm or crisis, respond with warmth AND clearly encourage them to reach a trusted person and local emergency resources.

Keep responses concise — 2 to 4 sentences unless more is genuinely needed.`

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

    const body = await req.json() as {
      sessionId: string
      message: string
      history?: { role: string; content: string }[]
    }

    if (!body.sessionId || !body.message) {
      return new Response(
        JSON.stringify({ error: "sessionId and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

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

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured", response: "Peace be with you. I'm here and present, even in the quiet." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const contents: { role: string; parts: { text: string }[] }[] = []

    if (body.history && body.history.length > 0) {
      for (const msg of body.history.slice(-10)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: body.message }],
    })

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error("[chat-text] Gemini API error:", errText)
      return new Response(
        JSON.stringify({ error: "Gemini API error", response: "I'm here with you. Let me gather my thoughts for a moment." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const geminiData = await geminiRes.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Peace be with you. I'm here and listening."

    return new Response(
      JSON.stringify({ response: responseText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("[chat-text] Error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
