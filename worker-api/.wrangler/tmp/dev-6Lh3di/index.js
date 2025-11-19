var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// lib/cors.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  // Will be set dynamically
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400"
};
function getCorsHeaders(origin, allowedOrigins) {
  const isAllowed = origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*") || origin.includes("localhost") || origin.includes("pages.dev"));
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0]
  };
}
__name(getCorsHeaders, "getCorsHeaders");
function handleOptions(origin, allowedOrigins) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin, allowedOrigins)
  });
}
__name(handleOptions, "handleOptions");
function jsonResponse(data, origin, allowedOrigins, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin, allowedOrigins)
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(message, origin, allowedOrigins, status = 400) {
  return jsonResponse({ error: message }, origin, allowedOrigins, status);
}
__name(errorResponse, "errorResponse");

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = /* @__PURE__ */ __name((size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}, "nanoid");

// lib/db.ts
async function createSession(db) {
  const id = nanoid();
  const sessionToken = nanoid(32);
  await db.prepare(
    "INSERT INTO sessions (id, session_token, credits) VALUES (?, ?, 1)"
  ).bind(id, sessionToken).run();
  const session = await db.prepare(
    "SELECT * FROM sessions WHERE id = ?"
  ).bind(id).first();
  return session;
}
__name(createSession, "createSession");
async function getSessionByToken(db, token) {
  return db.prepare(
    "SELECT * FROM sessions WHERE session_token = ?"
  ).bind(token).first();
}
__name(getSessionByToken, "getSessionByToken");
async function updateCredits(db, sessionId, credits) {
  await db.prepare(
    "UPDATE sessions SET credits = ? WHERE id = ?"
  ).bind(credits, sessionId).run();
}
__name(updateCredits, "updateCredits");
async function createAura(db, sessionId, imageUrl, auraColor, auraDescription, personalityAnswers) {
  const id = nanoid();
  await db.prepare(
    "INSERT INTO auras (id, session_id, image_url, aura_color, aura_description, personality_answers) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, sessionId, imageUrl, auraColor, auraDescription, JSON.stringify(personalityAnswers)).run();
  const aura = await db.prepare(
    "SELECT * FROM auras WHERE id = ?"
  ).bind(id).first();
  return aura;
}
__name(createAura, "createAura");
async function getAuraById(db, id) {
  return db.prepare(
    "SELECT * FROM auras WHERE id = ?"
  ).bind(id).first();
}
__name(getAuraById, "getAuraById");

// routes/session.ts
async function handleSession(request, env, origin, allowedOrigins) {
  const method = request.method;
  if (method === "POST") {
    return handleCreateSession(request, env, origin, allowedOrigins);
  }
  if (method === "GET") {
    return handleGetSession(request, env, origin, allowedOrigins);
  }
  return errorResponse("Method not allowed", origin, allowedOrigins, 405);
}
__name(handleSession, "handleSession");
async function handleCreateSession(request, env, origin, allowedOrigins) {
  try {
    const session = await createSession(env.DB);
    const response = jsonResponse({
      session: {
        id: session.id,
        credits: session.credits,
        createdAt: session.created_at
      }
    }, origin, allowedOrigins);
    response.headers.append(
      "Set-Cookie",
      `aura_session=${session.session_token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=31536000`
    );
    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    return errorResponse("Failed to create session", origin, allowedOrigins, 500);
  }
}
__name(handleCreateSession, "handleCreateSession");
async function handleGetSession(request, env, origin, allowedOrigins) {
  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...vals] = c.trim().split("=");
        return [key, vals.join("=")];
      })
    );
    const sessionToken = cookies["aura_session"];
    if (!sessionToken) {
      return jsonResponse({ session: null }, origin, allowedOrigins);
    }
    const session = await getSessionByToken(env.DB, sessionToken);
    if (!session) {
      return jsonResponse({ session: null }, origin, allowedOrigins);
    }
    return jsonResponse({
      session: {
        id: session.id,
        credits: session.credits,
        createdAt: session.created_at
      }
    }, origin, allowedOrigins);
  } catch (error) {
    console.error("Error getting session:", error);
    return errorResponse("Failed to get session", origin, allowedOrigins, 500);
  }
}
__name(handleGetSession, "handleGetSession");

// lib/r2.ts
async function uploadImage(r2, key, data, contentType) {
  await r2.put(key, data, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000"
      // 1 year cache
    }
  });
}
__name(uploadImage, "uploadImage");
function parseBase64Image(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image format");
  }
  const contentType = matches[1];
  const base64Data = matches[2];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return {
    buffer: bytes.buffer,
    contentType
  };
}
__name(parseBase64Image, "parseBase64Image");

// routes/aura.ts
async function analyzeAuraWithGemini(imageBase64, energy, element, apiKey) {
  const prompt = `You are an aura reader. Analyze this person's photo and determine their aura color.

The person described their energy as: ${energy}
The person chose this element: ${element}

Based on the photo and these inputs, determine which aura color best fits this person.

Available colors: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, WHITE

Meanings:
- RED: Passion, Energy, Drive, Leadership
- ORANGE: Creativity, Joy, Enthusiasm, Adventure
- YELLOW: Optimism, Intellect, Happiness, Confidence
- GREEN: Growth, Healing, Balance, Compassion
- BLUE: Peace, Calm, Communication, Intuition
- PURPLE: Spirituality, Wisdom, Creativity, Mysticism
- PINK: Love, Tenderness, Affection, Empathy
- WHITE: Purity, Clarity, New beginnings, Spiritual awakening

Respond with ONLY valid JSON in this exact format:
{"color": "COLOR_NAME", "description": "A 1-2 sentence personalized description about this person's aura energy."}

Make the description fun, personal, and slightly mystical but relatable. Keep it short and punchy.`;
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256
        }
      })
    }
  );
  if (!response.ok) {
    console.error("Gemini API error:", await response.text());
    throw new Error("Failed to analyze image");
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format");
  }
  const result = JSON.parse(jsonMatch[0]);
  const validColors = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "PURPLE", "PINK", "WHITE"];
  if (!validColors.includes(result.color)) {
    result.color = "PURPLE";
  }
  return result;
}
__name(analyzeAuraWithGemini, "analyzeAuraWithGemini");
async function analyzeAura(request, env, origin, allowedOrigins) {
  try {
    const body = await request.json();
    if (!body.imageData) {
      return errorResponse("Image data required", origin, allowedOrigins, 400);
    }
    let auraResult;
    try {
      auraResult = await analyzeAuraWithGemini(
        body.imageData,
        body.energy || "Good",
        body.element || "Energy",
        env.GEMINI_API_KEY
      );
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      auraResult = {
        color: "PURPLE",
        description: "A unique and vibrant soul with endless potential."
      };
    }
    return jsonResponse({
      color: auraResult.color,
      description: auraResult.description
    }, origin, allowedOrigins);
  } catch (error) {
    console.error("Error analyzing aura:", error);
    return errorResponse("Failed to analyze aura", origin, allowedOrigins, 500);
  }
}
__name(analyzeAura, "analyzeAura");
async function handleAura(request, env, origin, allowedOrigins, auraId) {
  const method = request.method;
  if (method === "POST" && !auraId) {
    return handleCreateAura(request, env, origin, allowedOrigins);
  }
  if (method === "GET" && auraId) {
    return handleGetAura(request, env, origin, allowedOrigins, auraId);
  }
  return errorResponse("Method not allowed", origin, allowedOrigins, 405);
}
__name(handleAura, "handleAura");
async function handleCreateAura(request, env, origin, allowedOrigins) {
  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...vals] = c.trim().split("=");
        return [key, vals.join("=")];
      })
    );
    const sessionToken = cookies["aura_session"];
    if (!sessionToken) {
      return errorResponse("No session found", origin, allowedOrigins, 401);
    }
    const session = await getSessionByToken(env.DB, sessionToken);
    if (!session) {
      return errorResponse("Invalid session", origin, allowedOrigins, 401);
    }
    if (session.credits < 1) {
      return errorResponse("No credits remaining", origin, allowedOrigins, 402);
    }
    const body = await request.json();
    if (!body.imageData) {
      return errorResponse("Image data required", origin, allowedOrigins, 400);
    }
    const energy = body.personalityAnswers?.energy || "Good";
    const element = body.personalityAnswers?.element || "Energy";
    let auraResult;
    try {
      auraResult = await analyzeAuraWithGemini(
        body.imageData,
        energy,
        element,
        env.GEMINI_API_KEY
      );
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      auraResult = {
        color: "PURPLE",
        description: "A unique and vibrant soul with endless potential."
      };
    }
    const imageKey = `auras/${nanoid()}.jpg`;
    const { buffer, contentType } = parseBase64Image(body.imageData);
    await uploadImage(env.IMAGES, imageKey, buffer, contentType);
    const aura = await createAura(
      env.DB,
      session.id,
      imageKey,
      auraResult.color,
      auraResult.description,
      body.personalityAnswers || {}
    );
    await updateCredits(env.DB, session.id, session.credits - 1);
    return jsonResponse({
      aura: {
        id: aura.id,
        imageUrl: aura.image_url,
        auraColor: aura.aura_color,
        auraDescription: aura.aura_description,
        createdAt: aura.created_at
      },
      credits: session.credits - 1
    }, origin, allowedOrigins);
  } catch (error) {
    console.error("Error creating aura:", error);
    return errorResponse("Failed to create aura", origin, allowedOrigins, 500);
  }
}
__name(handleCreateAura, "handleCreateAura");
async function handleGetAura(request, env, origin, allowedOrigins, auraId) {
  try {
    const aura = await getAuraById(env.DB, auraId);
    if (!aura) {
      return errorResponse("Aura not found", origin, allowedOrigins, 404);
    }
    return jsonResponse({
      aura: {
        id: aura.id,
        imageUrl: aura.image_url,
        auraColor: aura.aura_color,
        auraDescription: aura.aura_description,
        personalityAnswers: aura.personality_answers ? JSON.parse(aura.personality_answers) : {},
        createdAt: aura.created_at
      }
    }, origin, allowedOrigins);
  } catch (error) {
    console.error("Error getting aura:", error);
    return errorResponse("Failed to get aura", origin, allowedOrigins, 500);
  }
}
__name(handleGetAura, "handleGetAura");

// index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get("Origin");
    const allowedOrigins = [
      env.APP_URL,
      "http://localhost:3000",
      "https://aura-canvas.pages.dev"
    ];
    if (method === "OPTIONS") {
      return handleOptions(origin, allowedOrigins);
    }
    try {
      if (path === "/session") {
        return handleSession(request, env, origin, allowedOrigins);
      }
      if (path === "/analyze" && method === "POST") {
        return analyzeAura(request, env, origin, allowedOrigins);
      }
      if (path === "/aura" && method === "POST") {
        return handleAura(request, env, origin, allowedOrigins);
      }
      const auraMatch = path.match(/^\/aura\/([a-zA-Z0-9_-]+)$/);
      if (auraMatch && method === "GET") {
        return handleAura(request, env, origin, allowedOrigins, auraMatch[1]);
      }
      const imageMatch = path.match(/^\/image\/(.+)$/);
      if (imageMatch && method === "GET") {
        return handleImage(env.IMAGES, imageMatch[1]);
      }
      if (path === "/credits") {
        return errorResponse("Not implemented", origin, allowedOrigins, 501);
      }
      if (path === "/webhook/stripe") {
        return errorResponse("Not implemented", origin, allowedOrigins, 501);
      }
      return errorResponse("Not found", origin, allowedOrigins, 404);
    } catch (error) {
      console.error("Unhandled error:", error);
      return errorResponse("Internal server error", origin, allowedOrigins, 500);
    }
  }
};
async function handleImage(r2, key) {
  const object = await r2.get(key);
  if (!object) {
    return new Response("Image not found", { status: 404 });
  }
  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
  headers.set("Cache-Control", "public, max-age=31536000");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(object.body, { headers });
}
__name(handleImage, "handleImage");

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

// .wrangler/tmp/bundle-a1UsWK/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

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

// .wrangler/tmp/bundle-a1UsWK/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
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
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
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
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
