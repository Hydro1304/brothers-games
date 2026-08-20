// deno-lint-ignore no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const CLIENT_ID = Deno.env.get("MELHOR_ENVIO_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET") ?? "";
const REDIRECT_URI = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI") ?? "";
const BASE_URL = (Deno.env.get("MELHOR_ENVIO_BASE_URL") ?? "https://sandbox.melhorenvio.com.br").replace(/\/$/, "");
const USER_AGENT = Deno.env.get("MELHOR_ENVIO_USER_AGENT") ?? "";
const FRONTEND_URL = (Deno.env.get("MELHOR_ENVIO_FRONTEND_URL") ?? "http://localhost:5175").replace(/\/$/, "");
const ENCRYPTION_KEY_B64 = Deno.env.get("MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY") ?? "";

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

function html(status: number, title: string, message: string, redirectTo?: string): Response {
  const safeTitle = title.replace(/[<>&\"]/g, "");
  const safeMessage = message.replace(/[<>&\"]/g, "");
  const redirectScript = redirectTo
    ? `<script>setTimeout(() => location.replace(${JSON.stringify(redirectTo)}), 1200);</script>`
    : "";

  return new Response(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${safeTitle}</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090909;color:#fff;font-family:Arial,sans-serif;padding:24px;box-sizing:border-box}
    main{width:min(520px,100%);padding:32px;border:1px solid #292929;border-radius:18px;background:#111;text-align:center;box-sizing:border-box;box-shadow:0 30px 90px rgba(0,0,0,.45)}
    b{display:block;color:#e50914;font-size:11px;letter-spacing:.13em;margin-bottom:10px}h1{font-size:26px;margin:0 0 12px}p{color:#b8b8b8;line-height:1.65;margin:0}
  </style>
  ${redirectScript}
</head>
<body><main><b>BROTHER'S GAMES</b><h1>${safeTitle}</h1><p>${safeMessage}</p></main></body>
</html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  return Uint8Array.from(value).buffer;
}

function importEncryptionKey(): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(ENCRYPTION_KEY_B64);
  if (keyBytes.byteLength !== 32) {
    throw new Error("MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY precisa ter 32 bytes em Base64.");
  }

  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(keyBytes),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
}

async function encryptToken(token: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(token);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(plaintext),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

function jwtExpiryIso(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (!payload.exp || !Number.isFinite(payload.exp)) return null;
    return new Date(payload.exp * 1000).toISOString();
  } catch {
    return null;
  }
}

interface TokenResponse {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  message?: string;
  error?: string;
  error_description?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return html(405, "Método não permitido", "Este endereço é usado apenas pelo retorno do Melhor Envio.");
  }

  if (!SUPABASE_URL || !getSecretKey() || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !USER_AGENT || !ENCRYPTION_KEY_B64) {
    return html(500, "Configuração incompleta", "A integração ainda não está totalmente configurada no servidor.");
  }

  const requestUrl = new URL(req.url);
  const providerError = requestUrl.searchParams.get("error");
  const providerErrorDescription = requestUrl.searchParams.get("error_description");
  const code = requestUrl.searchParams.get("code") ?? "";
  const state = requestUrl.searchParams.get("state") ?? "";

  if (providerError) {
    return html(400, "Autorização não concluída", providerErrorDescription || providerError);
  }

  if (!code || !state || code.length > 4096 || state.length > 200) {
    return html(400, "Retorno inválido", "O Melhor Envio não retornou os dados esperados para concluir a autorização.");
  }

  const adminClient = createClient(SUPABASE_URL, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: connectedBy, error: stateError } = await adminClient.rpc(
    "consume_melhor_envio_oauth_state",
    { p_state: state },
  );

  if (stateError || !connectedBy) {
    return html(400, "Autorização expirada", "Este link de autorização já foi usado, expirou ou não pertence à BROTHER'S GAMES.");
  }

  const tokenResponse = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: Number(CLIENT_ID),
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  const tokenData = (await tokenResponse.json().catch(() => ({}))) as TokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token || !tokenData.refresh_token) {
    console.error("Melhor Envio OAuth token exchange falhou:", {
      status: tokenResponse.status,
      error: tokenData.error,
      message: tokenData.message,
      description: tokenData.error_description,
    });

    return html(502, "Falha ao concluir conexão", "O Melhor Envio recusou a troca do código de autorização. Inicie a conexão novamente pelo painel administrativo.");
  }

  try {
    const key = await importEncryptionKey();
    const [accessEncrypted, refreshEncrypted] = await Promise.all([
      encryptToken(tokenData.access_token, key),
      encryptToken(tokenData.refresh_token, key),
    ]);

    const accessExpiresAt = jwtExpiryIso(tokenData.access_token)
      ?? new Date(Date.now() + Number(tokenData.expires_in || 2592000) * 1000).toISOString();
    const refreshExpiresAt = jwtExpiryIso(tokenData.refresh_token)
      ?? new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

    const { error: saveError } = await adminClient
      .from("melhor_envio_credentials")
      .upsert({
        id: 1,
        environment: BASE_URL.includes("sandbox") ? "sandbox" : "production",
        token_type: tokenData.token_type || "Bearer",
        scope: tokenData.scope || "shipping-calculate",
        access_token_ciphertext: accessEncrypted.ciphertext,
        access_token_iv: accessEncrypted.iv,
        refresh_token_ciphertext: refreshEncrypted.ciphertext,
        refresh_token_iv: refreshEncrypted.iv,
        access_token_expires_at: accessExpiresAt,
        refresh_token_expires_at: refreshExpiresAt,
        connected_by: connectedBy,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (saveError) {
      console.error("Falha ao salvar tokens criptografados:", saveError.message);
      return html(500, "Falha ao salvar conexão", "A autorização ocorreu, mas o servidor não conseguiu armazenar a conexão com segurança.");
    }
  } catch (error) {
    console.error("Falha ao criptografar tokens:", error instanceof Error ? error.message : "erro desconhecido");
    return html(500, "Falha de segurança", "Não foi possível proteger os tokens antes do armazenamento.");
  }

  const destination = `${FRONTEND_URL}/?melhor_envio=connected`;
  return html(200, "Melhor Envio conectado!", "A autorização foi concluída. Você será redirecionado para a loja.", destination);
});
