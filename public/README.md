# cf_ai_edge_chat_agent

Lightweight, self-hosted chat agent running on **Cloudflare Workers**, **Durable Objects**, and **Workers AI**.  
It serves a minimal HTML/JS frontend and uses a Workers AI model (e.g. `@cf/meta/llama-3-8b-instruct`) with per-session memory.

---

## ✨ Features

- **Edge-native** – runs on Cloudflare’s global network with low latency.
- **No external backend** – HTML/CSS/JS frontend is served directly by the Worker.
- **Per-session memory** – conversation history stored in a Durable Object (`ChatAgentDO`).
- **Configurable model & persona** – change the Workers AI model or system prompt in `src/agent.ts`.
- **Simple codebase** – ~1 file for the Worker logic and a small static frontend.

---

## 🧱 Architecture Overview

**Components**

- **Cloudflare Worker**  
  - Entry point: `src/agent.ts`  
  - Routes:
    - `GET /` – serves the static chat UI from `public/index.html`
    - `POST /chat` – JSON API endpoint: `{ message: string } → { reply: string }`

- **Durable Object – `ChatAgentDO`**  
  - One DO instance per chat session (via ID / session token).
  - Persists the last *N* messages in `state.storage`.
  - Reconstructs conversation history for each call to Workers AI.

- **Workers AI**  
  - Default model: `@cf/meta/llama-3-8b-instruct` (configurable).
  - Called with:
    - System prompt (agent persona & rules)
    - Truncated conversation history
    - Latest user message

- **Frontend** (`public/index.html`)  
  - Bare-bones chat UI:
    - Input box → POST `/chat`
    - Streaming / appended messages in a scrollable chat window.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and `npm`
- Cloudflare account
- `wrangler` installed (either globally or via `npx`)
- Workers AI + Durable Objects enabled on your account

### 1. Clone and install

```bash
git clone https://github.com/SMCallan/cf_ai_edge_chat_agent.git
cd cf_ai_edge_chat_agent
npm install

Demo here
## https://cf_ai_edge_chat_agent.s035187n.workers.dev
