# cf_ai_edge_chat_agent

A lightweight, self-hosted chat agent running on **Cloudflare Workers**, **Durable Objects**, and **Workers AI**.  
It serves a minimal HTML/JS frontend and uses a Workers AI model (e.g. `@cf/meta/llama-3-8b-instruct`) with short-term conversational memory stored in a Durable Object.

---

## ✨ Features

- **Edge-native** – executes globally on Cloudflare's network for low-latency responses.
- **Stateless Worker + Stateful Durable Object** – keeps the Worker simple while persisting chat history.
- **Zero external backend** – frontend is static HTML/JS served directly from the Worker.
- **Configurable model & persona** – update the system prompt or model in `src/agent.ts`.
- **Minimal, readable codebase** – designed for clarity and easy extension.

---

## 🧱 Architecture Overview

### **Cloudflare Worker**
- Entrypoint: `src/agent.ts`
- Routes:
  - `GET /` → serves `public/index.html`
  - `POST /chat` → accepts `{ message }` and returns `{ reply }`

### **Durable Object: `ChatAgentDO`**
- Stores the last *N* messages in `state.storage`
- Builds the prompt history for the model
- Persists contextual memory per chat session

### **Workers AI**
- Default model: `@cf/meta/llama-3-8b-instruct`
- Receives:
  - A system prompt (agent persona)
  - Truncated conversation history
  - Latest user message

### **Frontend (`public/index.html`)**
- Minimal chat UI with:
  - Scrollable conversation window  
  - Input box  
  - JS `fetch()` calls to `/chat`

---

## 🚀 Getting Started

### **1. Clone & Install**

```bash
git clone https://github.com/SMCallan/cf_ai_edge_chat_agent.git
cd cf_ai_edge_chat_agent
npm install
````

### **2. Authenticate Wrangler**

```bash
npx wrangler login
```

### **3. Run Locally**

```bash
npm run dev
# Opens: http://localhost:8787
```

### **4. Deploy**

```bash
npx wrangler deploy
```

This provisions the Worker + Durable Object in your Cloudflare account and outputs your public URL.

---

## 🌐 Live Demo

**Hosted at:**
[https://cf_ai_edge_chat_agent.s035187n.workers.dev](https://cf_ai_edge_chat_agent.s035187n.workers.dev)

---

## 🗂 Project Structure

```
cf_ai_edge_chat_agent/
├── public/
│   ├── index.html
│   └── PROMPTS.md        # (optional) prompt engineering reference
├── src/
│   └── agent.ts          # Worker + Durable Object + Workers AI logic
├── wrangler.toml          # Bindings, migrations, config
├── package.json
└── README.md
```

---

## 🛠 Configuration Notes

* **Workers AI binding** is defined in `wrangler.toml`:

```toml
[ai]
binding = "AI"
```

* **Durable Object** setup:

```toml
[[durable_objects.bindings]]
name = "CHAT_AGENT"
class_name = "ChatAgentDO"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["ChatAgentDO"]   # required for free tier
```

* **Update the system prompt or model** in `src/agent.ts`.

---

## 📄 Licence

No Licence - This is a project made to demonstrate something. You can literally do whatever you want, granted to do no violate any laws or rules imposed upon you. Thank you.

```

