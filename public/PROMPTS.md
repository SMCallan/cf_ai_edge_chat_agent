# **PROMPTS.md**

### *Minimal prompt log for reproducing the Cloudflare Edge AI Chat Agent*

This file documents the **core prompts** used to generate the Worker, Durable Object, frontend, and configuration needed to build this demo.
It is intentionally concise — it shows the workflow and the agent instructions used, without implementation noise.

---

## **1. Project Scaffolding Prompt**

**Goal:** Create a minimal Cloudflare Workers AI chat agent with memory.

```
Create a minimal Cloudflare Workers project with:

- Cloudflare Worker as the main entrypoint
- A Durable Object for per-session conversational memory
- Workers AI calling an instruct model (`@cf/meta/llama-3-8b-instruct`)
- A simple HTML/CSS/JS UI using fetch('/chat') POST calls
- No SDKs or frameworks, keep everything lightweight
- Project structure:
  wrangler.toml
  src/agent.ts
  public/index.html
  README.md
  PROMPTS.md
```

---

## **2. Durable Object Logic Prompt**

**Goal:** Generate the conversation-memory engine.

```
Write a Durable Object class (ChatAgentDO) that:
- stores the last N messages in state.storage
- loads/saves history
- receives a user message
- builds a prompt from history
- calls Workers AI
- appends the assistant reply
- returns the reply
```

---

## **3. Workers AI Integration Prompt**

**Goal:** Ensure the DO uses Workers AI correctly.

```
Show code that calls Workers AI using env.AI.run(...) with:
- a system prompt for a concise assistant
- conversation history as 'messages'
- fallback logic for different Workers AI response formats
- returning reply as plain text
```

---

## **4. Worker Routing Prompt**

**Goal:** Build the Worker fetch handler.

```
Add a Worker fetch handler that:
- serves index.html from public/
- POST /chat → forwards message to the Durable Object
- GET /history → returns stored messages
- routes all chat logic through a single DO instance
```

---

## **5. Frontend Prompt**

**Goal:** Build the minimal chat UI.

```
Create a simple HTML/CSS/JS chat UI with:
- message window
- input box + send button
- POST to /chat with JSON
- append assistant replies to the DOM
- no framework, no build step
```

---

## **6. Wrangler Config Prompt**

**Goal:** Finalise the wrangler.toml.

```
Write wrangler.toml with:
name, main, compatibility_date
AI binding
Durable Object binding (ChatAgentDO)
sqlite migration (new_sqlite_classes for free tier)
assets directory = ./public
```

---

## **7. Debug/Fix Prompt**

**Goal:** Remove TypeScript errors + simplify environment.

```
Remove all Cloudflare-specific TypeScript types.
Use "any" for env, state, and Workers AI responses.
Fix precedence error with ?? and ||.
Ensure the DO class name matches wrangler.toml.
```

---

## **8. Deployment Prompt**

**Goal:** Deploy correctly on free plan.

```
Show commands for:
npm install
npx wrangler login
npm run dev
npx wrangler deploy

Note: free tier DO requires new_sqlite_classes migration.
```

---

## **9. README + Repo Setup Prompt**

**Goal:** Produce a professional README.

```
Write a concise README explaining:
- architecture (Worker, DO, Workers AI)
- local development steps
- deployment steps
- model used
- link to live worker
- project structure
```

---

## **Purpose of This File**

This file exists so contributors can see the **prompt lineage** used to generate the demo and recreate/extend the project using the same workflow.

