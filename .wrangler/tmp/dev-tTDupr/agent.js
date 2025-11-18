var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-q7XNs5/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/agent.ts
var INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>cf_ai_edge_chat_agent \u2013 Cloudflare Workers AI</title>
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
  <\/script>
</body>
</html>
`;
var ChatAgentDO = class {
  state;
  env;
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async loadHistory() {
    const history = await this.state.storage.get("history");
    return history ?? [];
  }
  async saveHistory(history) {
    await this.state.storage.put("history", history);
  }
  async handleUserMessage(input) {
    const history = await this.loadHistory();
    const newHistory = [
      ...history.slice(-9),
      { role: "user", content: input }
    ];
    await this.saveHistory(newHistory);
    const prompt = buildPrompt(newHistory);
    const response = await this.env.AI.run("@cf/meta/llama-3.3-8b-instruct", {
      messages: [
        {
          role: "system",
          content: "You are a concise, friendly assistant running on Cloudflare Workers at the edge. Keep answers short and helpful."
        },
        { role: "user", content: prompt }
      ]
    });
    const anyResponse = response;
    let reply = anyResponse.response;
    const choices = anyResponse.choices;
    if (!reply && Array.isArray(choices) && choices.length > 0) {
      const first = choices[0];
      const msg = first.message || first.delta || {};
      reply = msg.content || msg.text;
    }
    if (!reply) {
      reply = "Sorry, I could not generate a response.";
    }
    const updatedHistory = [
      ...newHistory,
      { role: "assistant", content: reply }
    ];
    await this.saveHistory(updatedHistory);
    return reply;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/chat") {
      const data = await request.json().catch(() => null);
      const message = data?.message;
      if (!message || typeof message !== "string") {
        return new Response(JSON.stringify({ error: "Missing 'message' in body." }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const reply = await this.handleUserMessage(message);
      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (request.method === "GET" && url.pathname === "/history") {
      const history = await this.loadHistory();
      return new Response(JSON.stringify({ history }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Chat agent DO is running.", { status: 200 });
  }
};
__name(ChatAgentDO, "ChatAgentDO");
function buildPrompt(history) {
  return history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
}
__name(buildPrompt, "buildPrompt");
var agent_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(INDEX_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    if (url.pathname === "/chat" || url.pathname === "/history") {
      const id = env.CHAT_AGENT.idFromName("global-session");
      const stub = env.CHAT_AGENT.get(id);
      return stub.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-q7XNs5/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = agent_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-q7XNs5/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ChatAgentDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=agent.js.map
