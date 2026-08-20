// deno-lint-ignore no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const CLIENT_ID = Deno.env.get("MELHOR_ENVIO_CLIENT_ID") ?? "";
const REDIRECT_URI = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI") ?? "";
const BASE_URL = (Deno.env.get("MELHOR_ENVIO_BASE_URL") ?? "https://sandbox.melhorenvio.com.br").replace(/\/$/, "");

function getSecretKey(): string {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // fallback abaixo
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function getPublishableKey(): string {
  const modern = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // fallback abaixo
    }
  }

  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

function allowedOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const allowed = new Set([
    ...configured,
    "http://localhost:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
  ]);

  return allowed.has(origin) ? origin : null;
}

function corsHeaders(req: Request): HeadersInit {
  const origin = allowedOrigin(req);
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    const origin = allowedOrigin(req);
    if (!origin) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return json(req, 405, { error: "Método não permitido." });
  }

  if (req.headers.get("origin") && !allowedOrigin(req)) {
    return json(req, 403, { error: "Origem não permitida." });
  }

  if (!SUPABASE_URL || !CLIENT_ID || !REDIRECT_URI || !getSecretKey() || !getPublishableKey()) {
    return json(req, 500, { error: "Configuração do servidor incompleta." });
  }

  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return json(req, 401, { error: "Sessão não encontrada." });
  }

  const userClient = createClient(SUPABASE_URL, getPublishableKey(), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminClient = createClient(SUPABASE_URL, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return json(req, 401, { error: "Sessão inválida ou expirada." });
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role,status,suspended_until")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return json(req, 403, { error: "Perfil administrativo não encontrado." });
  }

  const suspendedUntil = profile.suspended_until ? new Date(profile.suspended_until) : null;
  const suspended = profile.status === "suspended" && suspendedUntil && suspendedUntil > new Date();

  if (profile.role !== "owner" || profile.status === "blocked" || suspended) {
    return json(req, 403, { error: "Somente a conta owner ativa pode conectar o Melhor Envio." });
  }

  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await adminClient
    .from("melhor_envio_oauth_states")
    .delete()
    .lt("expires_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

  const { error: stateError } = await adminClient
    .from("melhor_envio_oauth_states")
    .insert({ state, created_by: user.id, expires_at: expiresAt });

  if (stateError) {
    console.error("Falha ao criar OAuth state:", stateError.message);
    return json(req, 500, { error: "Não foi possível iniciar a autorização com segurança." });
  }

  const authorizeUrl = new URL(`${BASE_URL}/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "shipping-calculate");

  return json(req, 200, { authorizationUrl: authorizeUrl.toString() });
});
