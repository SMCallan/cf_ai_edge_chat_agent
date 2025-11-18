// Minimal Cloudflare Worker + Durable Object chat agent using Workers AI.
//  - Serves a simple HTML chat UI directly from the Worker.
//  - Uses a Durable Object for conversation memory.
//  - Calls Workers AI (Llama-style model) for replies.

type Env = {
  AI: any;         // Workers AI binding
  CHAT_AGENT: any; // Durable Object namespace
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Very simple HTML UI as a string.
const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>cf_ai_edge_chat_agent – Cloudflare Workers AI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      margin: 0;
      background: #0f172a;
      color: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .app {
      background: #020617;
      border-radius: 12px;
      border: 1px solid #1f2937;
      max-width: 720px;
      width: 100%;
      padding: 16px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 90vh;
    }
    h1 {
      font-size: 1rem;
      margin: 0;
      color: #f97316;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .chat-log {
      flex: 1;
      border-radius: 8px;
      background: #020617;
      border: 1px solid #111827;
      padding: 10px;
      overflow-y: auto;
      font-size: 0.85rem;
    }
    .message {
      margin-bottom: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      max-width: 90%;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .message.user {
      background: #1e293b;
      margin-left: auto;
      border-bottom-right-radius: 2px;
    }
    .message.assistant {
      background: #111827;
      margin-right: auto;
      border-bottom-left-radius: 2px;
    }
    .message .role {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #9ca3af;
      margin-bottom: 2px;
    }
    .input-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    textarea {
      flex: 1;
      resize: none;
      border-radius: 8px;
      border: 1px solid #374151;
      background: #020617;
      color: #e5e7eb;
      padding: 8px;
      font-size: 0.85rem;
      min-height: 48px;
    }
    button {
      border-radius: 8px;
      border: none;
      background: #f97316;
      color: #111827;
      font-weight: 600;
      padding: 0 16px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
    }
    button:disabled {
      opacity: 0.6;
      cursor: default;
    }
    .status {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <h1>cf_ai_edge_chat_agent</h1>
      <div class="subtitle">
        Simple Llama-powered chat agent running on Cloudflare Workers AI + Durable Objects.
      </div>
    </header>

    <div id="chat-log" class="chat-log"></div>

    <div class="input-row">
      <textarea id="input" placeholder="Ask the agent something..."></textarea>
      <button id="send-btn">Send</button>
    </div>
    <div class="status" id="status">Ready.</div>
  </div>

  <script>
    const chatLogEl = document.getElementById("chat-log");
    const inputEl = document.getElementById("input");
    const sendBtn = document.getElementById("send-btn");
    const statusEl = document.getElementById("status");

    function addMessage(role, content) {
      const div = document.createElement("div");
      div.className = "message " + role;
      const roleEl = document.createElement("div");
      roleEl.className = "role";
      roleEl.textContent = role === "user" ? "You" : "Agent";
      const contentEl = document.createElement("div");
      contentEl.textContent = content;
      div.appendChild(roleEl);
      div.appendChild(contentEl);
      chatLogEl.appendChild(div);
      chatLogEl.scrollTop = chatLogEl.scrollHeight;
    }

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;
      addMessage("user", text);
      inputEl.value = "";
      sendBtn.disabled = true;
      statusEl.textContent = "Thinking at the edge...";

      try {
        const res = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });

        if (!res.ok) {
          const errText = await res.text();
          addMessage("assistant", "Error: " + errText);
        } else {
          const data = await res.json();
          addMessage("assistant", data.reply || "(no reply)");
        }
      } catch (err) {
        console.error(err);
        addMessage("assistant", "Network error. Please try again.");
      } finally {
        sendBtn.disabled = false;
        statusEl.textContent = "Ready.";
      }
    }

    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  </script>
</body>
</html>
`;

export class ChatAgentDO {
  state: any;
  env: Env;

  constructor(state: any, env: Env) {
    this.state = state;
    this.env = env;
  }

  private async loadHistory(): Promise<Message[]> {
    const history = (await this.state.storage.get("history")) as Message[] | undefined;
    return history ?? [];
  }

  private async saveHistory(history: Message[]): Promise<void> {
    await this.state.storage.put("history", history);
  }

  async handleUserMessage(input: string): Promise<string> {
    const history = await this.loadHistory();

    const newHistory: Message[] = [
      ...history.slice(-9),
      { role: "user", content: input },
    ];

    await this.saveHistory(newHistory);

    const prompt = buildPrompt(newHistory);

    const response = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        {
          role: "system",
          content:
            "You are a concise, friendly assistant running on Cloudflare Workers at the edge. Keep answers short and helpful.",
        },
        { role: "user", content: prompt },
      ],
    });

    const anyResponse: any = response;
    let reply: string | undefined = anyResponse.response;

    const choices = anyResponse.choices;
    if (!reply && Array.isArray(choices) && choices.length > 0) {
      const first = choices[0];
      const msg = first.message || first.delta || {};
      reply = msg.content || msg.text;
    }

    if (!reply) {
      reply = "Sorry, I could not generate a response.";
    }

    const updatedHistory: Message[] = [
      ...newHistory,
      { role: "assistant", content: reply },
    ];

    await this.saveHistory(updatedHistory);

    return reply;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/chat") {
      const data = await request.json().catch(() => null);
      const message = data?.message;
      if (!message || typeof message !== "string") {
        return new Response(JSON.stringify({ error: "Missing 'message' in body." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const reply = await this.handleUserMessage(message);
      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "GET" && url.pathname === "/history") {
      const history = await this.loadHistory();
      return new Response(JSON.stringify({ history }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Chat agent DO is running.", { status: 200 });
  }
}

function buildPrompt(history: Message[]): string {
  return history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

// Worker entrypoint: serve HTML at `/`, forward `/chat` to the Durable Object.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(INDEX_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/chat" || url.pathname === "/history") {
      const id = env.CHAT_AGENT.idFromName("global-session");
      const stub = env.CHAT_AGENT.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
