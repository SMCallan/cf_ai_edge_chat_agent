# **cf_ai_edge_chat_agent**

<p align="center">
  <img src="./LOGOAG.png" width="160" alt="Project Logo"/>
</p>

A lightweight, edge-native AI chat agent built using **Cloudflare Workers**, **Durable Objects**, and **Workers AI**.
The application serves a minimal HTML/JS chat interface and uses a stateful Durable Object to maintain conversational memory while running Llama-3.3 inference on Workers AI.

This project is submitted as part of the **Cloudflare AI Optional Assignment**.

---

## 🚀 Live Demo

**Agent running on Workers:**
👉 [https://cf_ai_edge_chat_agent.s035187n.workers.dev](https://cf_ai_edge_chat_agent.s035187n.workers.dev)

**GitHub Repository:**
👉 [https://github.com/SMCallan/cf_ai_edge_chat_agent](https://github.com/SMCallan/cf_ai_edge_chat_agent)

---

## ✨ Features

* **⚡ Edge-native inference** — powered by Workers AI (`@cf/meta/llama-3.3-8b-instruct`).
* **🧠 Stateful memory** — conversation history stored in a Durable Object.
* **🧩 Minimal, clear codebase** — single Worker + DO + tiny static frontend.
* **🌍 Globally distributed** — runs close to users automatically.
* **📦 No external backend required** — all logic runs inside Cloudflare's platform.

---

## 🧱 Architecture Overview

### **1. Cloudflare Worker**

Handles routing and serves static assets.

* `GET /` → returns `public/index.html`
* `POST /chat` → receives `{ message }`, forwards to DO, returns `{ reply }`

### **2. Durable Object — `ChatAgentDO`**

Provides per-session memory and conversation management.

* Stores the last N messages in `state.storage`
* Builds a prompt from history
* Calls Workers AI
* Saves and returns assistant output

### **3. Workers AI**

Current model:

```
@cf/meta/llama-3.3-8b-instruct
```

Receives:

* A configurable **system prompt**
* The reconstructed conversation history
* The user’s newest message

### **4. Frontend**

A simple HTML/JS chat UI located in:

```
public/index.html
```

---

## 📁 Directory Structure

```
cf_ai_edge_chat_agent/
│
├── public/
│   ├── index.html        # Chat UI
│   ├── README.md         # (legacy placeholder)
│   ├── PROMPTS.md        # Build prompts (copied to root)
│
├── src/
│   └── agent.ts          # Worker + Durable Object logic
│
├── wrangler.toml         # Cloudflare configuration
├── README.md             # You are here
├── PROMPTS.md            # AI prompts used during development
├── LOGOAG.png            # Project logo
└── package.json
```

---

## 🛠️ Getting Started

### **Prerequisites**

* Node.js 18+
* Cloudflare account
* Workers AI enabled
* Durable Objects enabled
* Wrangler (via `npx` or as a dev dependency)

---

### **1. Clone and install**

```bash
git clone https://github.com/SMCallan/cf_ai_edge_chat_agent.git
cd cf_ai_edge_chat_agent
npm install
```

---

### **2. Log in to Cloudflare**

```bash
npx wrangler login
```

---

### **3. Run locally**

```bash
npm run dev
```

Then open:
👉 [http://localhost:8787](http://localhost:8787)

---

### **4. Deploy**

```bash
npx wrangler deploy
```

Your Worker will be deployed to:

```
https://<worker-name>.<your-account>.workers.dev
```

---

## ⚙️ Configuration

### Change the system prompt or model

Modify in `src/agent.ts`:

```ts
const response = await env.AI.run("@cf/meta/llama-3.3-8b-instruct", {
  messages: [
    {
      role: "system",
      content: "You are a concise, friendly assistant running on Cloudflare Workers at the edge.",
    },
    { role: "user", content: prompt },
  ],
});
```

---

## 🧪 Example Request (from the UI)

```js
fetch("/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hello!" }),
});
```

Response:

```json
{
  "reply": "Hi! How can I help you today?"
}
```

---

## 📌 Assignment Compliance (Cloudflare Optional AI Project)

This project includes:

✔ **LLM** — Workers AI (Llama 3.3 8B Instruct)
✔ **Workflow / Coordination** — Durable Object controlling prompt + memory
✔ **User input via chat** — HTML/JS chat UI
✔ **Memory / State** — DO stores conversation history
✔ **Repo prefix** — `cf_ai_…`
✔ **README.md** — clear documentation + run instructions
✔ **PROMPTS.md** — transparent prompt history
✔ **Live deployment** — linked above

**→ Fully meets assignment criteria.**

---

## 🚧 Future Enhancements

These are optional but demonstrate engineering foresight:

* WebSocket streaming responses
* Realtime client sync using `useAgent()`
* Vectorize-powered long-term memory
* Multiple personas selectable in UI
* Cloudflare Pages frontend
* Integration with Cloudflare Workflows for async tasks

---

## 📄 License

This repository may be used for Cloudflare’s optional assignment or for educational purposes.
You are free to fork or reuse the structure.

---

## 👤 Author

**Callan Smith MacDonald**
GitHub: [https://github.com/SMCallan](https://github.com/SMCallan)
Cloudflare Workers / AI Engineering Enthusiast
