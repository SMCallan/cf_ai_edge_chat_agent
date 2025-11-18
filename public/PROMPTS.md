# cf_ai_edge_chat_agent

An AI-powered chat agent built for the Cloudflare Software Engineer Intern (Spring 2026) optional assignment.

This project demonstrates:

- An **LLM** running on **Cloudflare Workers AI** (Llama 3.3-style model).
- **Workflow / coordination** via an **Agent** built on **Durable Objects**.
- **User input** through a simple **chat UI** (HTML/JS) calling the Worker.
- **Memory / state** stored in the Agent's built-in state (conversation history).

## Architecture

- `ChatAgent` extends the Cloudflare `Agent` class and runs as a Durable Object.
- It keeps a rolling window of the last 10 conversation messages in persistent state.
- On each user message:
  - History is loaded from state.
  - A new prompt is built and sent to Workers AI (Llama-based model).
  - The reply is stored in state and returned to the client.
- A minimal static HTML page (`public/index.html`) acts as the frontend, sending `POST /chat` requests.

## Requirements satisfied

- **LLM**  
  Uses Workers AI via the `AI` binding (Llama-style model: `@cf/meta/llama-3.3-8b-instruct`).

- **Workflow / coordination**  
  Implemented using a Durable Object (`ChatAgent`) which coordinates requests and state.

- **User input (chat)**  
  Implemented as a text-based chat UI served by the Worker. The UI hits `/chat` with JSON payloads.

- **Memory / state**  
  Chat history (last 10 messages) is persisted inside the Agent state, providing contextual responses.

## Running locally

1. Install dependencies:

   ```bash
   npm install
