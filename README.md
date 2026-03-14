# Eliana's Rhythm

A real-time spiritual companion powered by Gemini Live. Eliana offers compassionate voice conversations, scripture study, and guidance through faith transitions — all through a calming, presence-first interface.

Built for the [Google Gemini API Developer Competition 2025](https://ai.google.dev/competition).

## Features

- **Live Voice Sessions** — Real-time bidirectional audio with Gemini Live API via the `@google/genai` SDK. Speak naturally; Eliana listens and responds with warmth.
- **Three Modes**
  - **Companion** — Reflective, empathetic spiritual conversation
  - **Bridge** — Guidance through faith transitions and spiritual crossroads
  - **Tutor** — Scripture study with historical and theological context
- **Holy Pause** — Interrupt mid-response to interject your thoughts. Eliana yields gracefully.
- **Text Fallback** — When live audio isn't available, seamless text chat with the same personality.
- **Session History** — Full transcripts stored and browsable.
- **Prayer Logs** — Personal prayer and reflection journal.
- **Scripture Explainability** — Contextual grounding for biblical references Eliana shares.

## Architecture

```
Browser (React)  ←WebSocket→  Cloud Run Relay  ←@google/genai SDK→  Gemini Live API
       ↕                              ↕
   Supabase Auth              Supabase PostgreSQL
       ↕
 Edge Functions (chat-text, start-session, relay-live-token)
```

See [docs/architecture.md](docs/architecture.md) for detailed Mermaid diagrams.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Live Relay | Node.js, Express, `@google/genai` SDK, WebSocket (`ws`) |
| AI Models | Gemini 2.5 Flash (text), Gemini 2.5 Flash Native Audio (live voice) |
| Database | PostgreSQL via Supabase (RLS enabled) |
| Auth | Supabase Auth (email/password + OAuth) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Frontend Hosting | Cloudflare Pages |
| Relay Hosting | Google Cloud Run |
| CI/CD | Google Cloud Build |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Google Cloud project with Gemini API enabled
- A Supabase project

### Frontend

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Relay Server

```bash
cd relay
cp .env.example .env
# Fill in LIVE_PROVIDER_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

npm install
npm run dev
```

The relay starts on port 8080. WebSocket endpoint: `ws://localhost:8080/live`.

### Supabase

```bash
supabase start          # Local development
supabase db push        # Apply migrations
supabase functions serve # Run edge functions locally
```

### Database Migrations

Migrations are in `supabase/migrations/`. They create the full schema: `profiles`, `sessions`, `messages`, `message_explainability`, `scripture_vault`, and `prayer_logs` — all with row-level security.

## Deployment

### Frontend → Cloudflare Pages

Connect the repo to Cloudflare Pages. Build command: `npm run build`, output directory: `dist`.

### Relay → Google Cloud Run

```bash
gcloud builds submit --config=relay/cloudbuild.yaml
```

Set secrets in Cloud Run:
- `LIVE_PROVIDER_API_KEY` — Gemini API key
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `ALLOWED_ORIGIN` — Frontend origin for CORS

### Edge Functions → Supabase

```bash
supabase functions deploy chat-text --project-ref <ref>
supabase functions deploy start-session --project-ref <ref>
supabase functions deploy relay-live-token --project-ref <ref>
```

Set secrets via `supabase secrets set GEMINI_API_KEY=...`.

## Project Structure

```
├── src/                    # React frontend
│   ├── pages/              # Route pages (Companion, History, Settings, etc.)
│   ├── components/         # UI components organized by feature
│   ├── hooks/              # Custom hooks (useAuth, useLive, useMessages)
│   ├── services/live/      # LiveService WebSocket client + audio pipeline
│   └── state/              # AuthContext
├── relay/                  # Cloud Run WebSocket relay
│   ├── src/                # Express server + Gemini Live SDK integration
│   ├── prompts/            # System prompts per mode (companion, bridge, tutor)
│   ├── Dockerfile
│   └── cloudbuild.yaml
├── supabase/
│   ├── functions/          # Edge functions (chat-text, start-session, etc.)
│   └── migrations/         # SQL schema + RLS policies
├── public/
│   └── mic-processor.js    # AudioWorklet for mic capture
└── docs/
    └── architecture.md     # Mermaid architecture diagrams
```

## How It Works

1. User signs in via Supabase Auth and starts a session.
2. The frontend requests a live token from the `relay-live-token` edge function.
3. A WebSocket connection opens to the Cloud Run relay server.
4. The relay authenticates the token, loads the mode-specific system prompt, and connects to Gemini Live via `@google/genai` SDK's `live.connect()`.
5. Audio streams bidirectionally: browser mic → relay → Gemini → relay → browser speaker.
6. Transcripts are displayed in real-time and stored in the database.
7. If live audio is unavailable, the UI falls back to text chat via the `chat-text` edge function.

## Security

- Provider API keys are **server-side only** — never sent to the browser.
- JWT tokens are verified by the relay before connecting to Gemini.
- All database tables use Supabase Row-Level Security — users can only access their own data.
- CORS is restricted to the configured frontend origin in production.

## License

All rights reserved.
