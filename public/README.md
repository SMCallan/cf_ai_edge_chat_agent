# cf_ai_edge_chat_agent

Simple LLM-powered chat agent running on Cloudflare Workers + Durable Objects + Workers AI.

## Tech stack

- Cloudflare Workers (Wrangler 3)
- Durable Object for per-session memory (`ChatAgentDO`)
- Workers AI model: `@cf/meta/llama-3-8b-instruct`
- Plain HTML/CSS/JS frontend served from `/`

## How it works

- The Worker serves a minimal chat UI at `/`.
- The UI sends `POST /chat` requests with `{ message }`.
- A Durable Object stores the last N messages in `state.storage`.
- The DO calls Workers AI with the conversation history and returns the model’s reply.
- The reply is appended to history and streamed back to the UI.

## Run locally

```bash
npm install
npx wrangler login
npm run dev
# open http://localhost:8787

https://cf_ai_edge_chat_agent.s035187n.workers.dev
