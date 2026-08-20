// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

// O client usa tabelas criadas por migrações locais que não possuem tipos gerados.
// O alias evita inferência incorreta de `never` pelo TypeScript do editor.
// deno-lint-ignore no-explicit-any
type AdminClient = any;

interface ShippingItemInput {
  productId?: unknown;
  quantity?: unknown;
}

interface ShippingBody {
  postalCode?: unknown;
  items?: ShippingItemInput[];
}

interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  category: string | null;
  delivery_type: string | null;
  shipping_weight_kg: number | string | null;
  shipping_width_cm: number | string | null;
  shipping_height_cm: number | string | null;
  shipping_length_cm: number | string | null;
  status: string;
  publish_at: string | null;
  remove_at: string | null;
}

interface CredentialsRow {
  environment: string;
  token_type: string;
  scope: string | null;
  access_token_ciphertext: string;
  access_token_iv: string;
  refresh_token_ciphertext: string;
  refresh_token_iv: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string | null;
}

interface MelhorEnvioQuote {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  custom_price?: unknown;
  delivery_time?: unknown;
  custom_delivery_time?: unknown;
  error?: unknown;
  company?: {
    name?: unknown;
  };
}

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSupabaseSecretKey(): string {
  const direct = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (direct) return direct;

  const modern = Deno.env.get("SUPABASE_SECRET_KEYS") || "";
  if (!modern) return "";

  try {
    const parsed = JSON.parse(modern) as Record<string, string>;
    return parsed.default || Object.values(parsed)[0] || "";
  } catch {
    return modern;
  }
}

function configuredOrigins(): string[] {
  return String(Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return LOCAL_ORIGINS.has(origin) || configuredOrigins().includes(origin);
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    ...(origin && isOriginAllowed(request)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {}),
  };
}

function jsonResponse(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function readJsonBody(request: Request, maxBytes = 32 * 1024): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  return text ? JSON.parse(text) : {};
}

function digits(value: unknown): string {
  return String(value || "").replace(/\D/g, "");
}

function priceToCents(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round((number + Number.EPSILON) * 100);
}

function productIsPhysical(product: ProductRow): boolean {
  if (product.delivery_type === "physical") return true;
  if (product.delivery_type === "digital") return false;
  return String(product.category || "").trim().toLowerCase() !== "jogos";
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
  const keyB64 = Deno.env.get("MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY") || "";
  const keyBytes = base64ToBytes(keyB64);
  if (keyBytes.byteLength !== 32) throw new Error("TOKEN_ENCRYPTION_KEY_INVALID");
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(keyBytes),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

async function decryptToken(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(iv)) },
    key,
    toArrayBuffer(base64ToBytes(ciphertext)),
  );
  return new TextDecoder().decode(decrypted);
}

async function encryptToken(token: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(new TextEncoder().encode(token)),
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

async function getMelhorEnvioAccessToken(admin: AdminClient): Promise<string> {
  const { data, error } = await admin
    .from("melhor_envio_credentials")
    .select("environment,token_type,scope,access_token_ciphertext,access_token_iv,refresh_token_ciphertext,refresh_token_iv,access_token_expires_at,refresh_token_expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) throw new Error("MELHOR_ENVIO_NOT_CONNECTED");

  const credentials = data as CredentialsRow;
  const key = await importEncryptionKey();
  const expiresAt = new Date(credentials.access_token_expires_at).getTime();

  if (Number.isFinite(expiresAt) && expiresAt > Date.now() + 5 * 60 * 1000) {
    return decryptToken(credentials.access_token_ciphertext, credentials.access_token_iv, key);
  }

  const refreshExpiresAt = credentials.refresh_token_expires_at
    ? new Date(credentials.refresh_token_expires_at).getTime()
    : null;

  if (refreshExpiresAt && refreshExpiresAt <= Date.now()) {
    throw new Error("MELHOR_ENVIO_REAUTH_REQUIRED");
  }

  const refreshToken = await decryptToken(
    credentials.refresh_token_ciphertext,
    credentials.refresh_token_iv,
    key,
  );

  const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET") || "";
  const redirectUri = Deno.env.get("MELHOR_ENVIO_REDIRECT_URI") || "";
  const baseUrl = (Deno.env.get("MELHOR_ENVIO_BASE_URL") || "https://sandbox.melhorenvio.com.br").replace(/\/$/, "");
  const userAgent = Deno.env.get("MELHOR_ENVIO_USER_AGENT") || "";

  if (!clientId || !clientSecret || !redirectUri || !userAgent) {
    throw new Error("MELHOR_ENVIO_CONFIG_INCOMPLETE");
  }

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: Number(clientId),
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      refresh_token: refreshToken,
    }),
  });

  const refreshed = await response.json().catch(() => ({})) as Record<string, unknown>;
  const accessToken = String(refreshed.access_token || "");
  const newRefreshToken = String(refreshed.refresh_token || "");

  if (!response.ok || !accessToken || !newRefreshToken) {
    throw new Error("MELHOR_ENVIO_REFRESH_FAILED");
  }

  const [accessEncrypted, refreshEncrypted] = await Promise.all([
    encryptToken(accessToken, key),
    encryptToken(newRefreshToken, key),
  ]);

  const expiresIn = Math.max(60, Number(refreshed.expires_in || 2592000));
  const newAccessExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const newRefreshExpiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await admin
    .from("melhor_envio_credentials")
    .update({
      token_type: String(refreshed.token_type || "Bearer"),
      scope: String(refreshed.scope || credentials.scope || "shipping-calculate"),
      access_token_ciphertext: accessEncrypted.ciphertext,
      access_token_iv: accessEncrypted.iv,
      refresh_token_ciphertext: refreshEncrypted.ciphertext,
      refresh_token_iv: refreshEncrypted.iv,
      access_token_expires_at: newAccessExpiresAt,
      refresh_token_expires_at: newRefreshExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (updateError) throw new Error("MELHOR_ENVIO_TOKEN_SAVE_FAILED");
  return accessToken;
}

async function rateLimit(admin: AdminClient, userId: string): Promise<boolean> {
  const { data, error } = await admin.rpc("check_edge_rate_limit", {
    p_key: `shipping_quote:${userId}`,
    p_window_seconds: 600,
    p_max_requests: 30,
  });
  if (error) {
    console.error("Rate limit de frete indisponível:", error.code || "unknown");
    return false;
  }
  return data === true;
}

Deno.serve(async (request: Request) => {
  if (!isOriginAllowed(request)) {
    return jsonResponse(request, { error: "Origem não permitida." }, 403);
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Método não permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseSecretKey = getSupabaseSecretKey();
    const originPostalCode = digits(Deno.env.get("MELHOR_ENVIO_ORIGIN_POSTAL_CODE") || "08440470");
    const baseUrl = (Deno.env.get("MELHOR_ENVIO_BASE_URL") || "https://sandbox.melhorenvio.com.br").replace(/\/$/, "");
    const userAgent = Deno.env.get("MELHOR_ENVIO_USER_AGENT") || "";

    if (!supabaseUrl || !supabaseSecretKey || originPostalCode.length !== 8 || !userAgent) {
      return jsonResponse(request, { error: "Configuração de frete incompleta no servidor." }, 500);
    }

    const authHeader = request.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse(request, { error: "Entre na sua conta para calcular o frete." }, 401);
    }

    const userToken = authHeader.slice("Bearer ".length).trim();
    const admin: AdminClient = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(userToken);
    if (authError || !authData.user) {
      return jsonResponse(request, { error: "Sessão inválida. Entre novamente." }, 401);
    }

    const user = authData.user;
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("status,suspended_until")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.status === "blocked") {
      return jsonResponse(request, { error: "Sua conta não pode calcular frete neste momento." }, 403);
    }

    if (profile.status === "suspended") {
      const until = profile.suspended_until ? new Date(profile.suspended_until).getTime() : null;
      if (!until || until > Date.now()) {
        return jsonResponse(request, { error: "Sua conta está suspensa." }, 403);
      }
    }

    if (!(await rateLimit(admin, user.id))) {
      return jsonResponse(request, { error: "Muitas consultas de frete. Aguarde alguns minutos." }, 429);
    }

    let body: ShippingBody;
    try {
      body = (await readJsonBody(request)) as ShippingBody;
    } catch (error) {
      if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
        return jsonResponse(request, { error: "Requisição muito grande." }, 413);
      }
      return jsonResponse(request, { error: "Dados de frete inválidos." }, 400);
    }

    const destinationPostalCode = digits(body.postalCode);
    const items = Array.isArray(body.items) ? body.items : [];

    if (destinationPostalCode.length !== 8) {
      return jsonResponse(request, { error: "CEP de destino inválido." }, 400);
    }

    if (!items.length || items.length > 50) {
      return jsonResponse(request, { error: "Carrinho inválido." }, 400);
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      const productId = String(item?.productId || "").trim();
      const quantity = Number(item?.quantity);
      if (!UUID_RE.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return jsonResponse(request, { error: "Item do carrinho inválido." }, 400);
      }
      const total = (quantities.get(productId) || 0) + quantity;
      if (total > 50) return jsonResponse(request, { error: "Quantidade máxima excedida." }, 400);
      quantities.set(productId, total);
    }

    const productIds = [...quantities.keys()];
    const { data: productsData, error: productsError } = await admin
      .from("products")
      .select("id,name,price,category,delivery_type,shipping_weight_kg,shipping_width_cm,shipping_height_cm,shipping_length_cm,status,publish_at,remove_at")
      .in("id", productIds);

    if (productsError || !productsData || productsData.length !== productIds.length) {
      return jsonResponse(request, { error: "Não foi possível validar os produtos do carrinho." }, 400);
    }

    const products = productsData as ProductRow[];
    const now = Date.now();
    const physicalProducts: ProductRow[] = [];
    let physicalSubtotalCents = 0;

    for (const product of products) {
      const publishAt = product.publish_at ? new Date(product.publish_at).getTime() : null;
      const removeAt = product.remove_at ? new Date(product.remove_at).getTime() : null;
      if (product.status !== "active" || (publishAt && publishAt > now) || (removeAt && removeAt <= now)) {
        return jsonResponse(request, { error: `${product.name} não está disponível.` }, 409);
      }

      if (!productIsPhysical(product)) continue;
      physicalProducts.push(product);
      const unitPriceCents = priceToCents(product.price);
      if (unitPriceCents === null) return jsonResponse(request, { error: "Produto com preço inválido." }, 500);
      physicalSubtotalCents += unitPriceCents * (quantities.get(product.id) || 0);
    }

    if (!physicalProducts.length) {
      return jsonResponse(request, {
        success: true,
        digitalOnly: true,
        freeShipping: true,
        physicalSubtotal: 0,
        options: [],
      });
    }

    const incomplete = physicalProducts.filter((product) =>
      !Number(product.shipping_weight_kg) ||
      !Number(product.shipping_width_cm) ||
      !Number(product.shipping_height_cm) ||
      !Number(product.shipping_length_cm)
    );

    if (incomplete.length) {
      return jsonResponse(request, {
        code: "SHIPPING_PROFILE_INCOMPLETE",
        error: `Dados de frete incompletos para: ${incomplete.map((item) => item.name).join(", ")}. O administrador precisa informar peso e dimensões.`,
      }, 409);
    }

    let accessToken: string;
    try {
      accessToken = await getMelhorEnvioAccessToken(admin);
    } catch (error) {
      console.error("Falha obtendo token Melhor Envio:", error instanceof Error ? error.message : "unknown");
      return jsonResponse(request, {
        code: "MELHOR_ENVIO_RECONNECT_REQUIRED",
        error: "A integração com o Melhor Envio precisa ser reconectada pelo administrador.",
      }, 503);
    }

    const requestProducts = physicalProducts.map((product) => ({
      id: product.id,
      width: Number(product.shipping_width_cm),
      height: Number(product.shipping_height_cm),
      length: Number(product.shipping_length_cm),
      weight: Number(product.shipping_weight_kg),
      insurance_value: Number(Number(product.price).toFixed(2)),
      quantity: quantities.get(product.id) || 1,
    }));

    const quoteResponse = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: originPostalCode },
        to: { postal_code: destinationPostalCode },
        products: requestProducts,
        options: { receipt: false, own_hand: false },
      }),
    });

    const quoteData = await quoteResponse.json().catch(() => null);
    if (!quoteResponse.ok || !Array.isArray(quoteData)) {
      console.error("Melhor Envio calculate falhou:", quoteResponse.status);
      return jsonResponse(request, { error: "O Melhor Envio não conseguiu calcular este frete agora." }, 502);
    }

    const parsedOptions = (quoteData as MelhorEnvioQuote[])
      .filter((quote) => !quote.error)
      .map((quote) => {
        const serviceId = String(quote.id ?? "").trim();
        const rawPrice = quote.custom_price ?? quote.price;
        const priceCents = priceToCents(rawPrice);
        const deliveryDays = Math.max(0, Number(quote.custom_delivery_time ?? quote.delivery_time ?? 0));
        if (!serviceId || priceCents === null) return null;
        return {
          serviceId,
          name: String(quote.name || `Serviço ${serviceId}`),
          carrier: String(quote.company?.name || "Transportadora"),
          providerPrice: priceCents / 100,
          deliveryDays: Number.isFinite(deliveryDays) ? Math.round(deliveryDays) : 0,
        };
      })
      .filter((option): option is NonNullable<typeof option> => option !== null)
      .sort((a, b) => a.providerPrice - b.providerPrice);

    if (!parsedOptions.length) {
      return jsonResponse(request, { error: "Nenhuma transportadora atende este CEP para os produtos do carrinho." }, 422);
    }

    const freeShipping = physicalSubtotalCents >= 29900;
    const customerOptions = freeShipping
      ? [{ ...parsedOptions[0], price: 0, isFree: true }]
      : parsedOptions.slice(0, 8).map((option) => ({ ...option, price: option.providerPrice, isFree: false }));

    return jsonResponse(request, {
      success: true,
      digitalOnly: false,
      freeShipping,
      freeShippingThreshold: 299,
      physicalSubtotal: physicalSubtotalCents / 100,
      originPostalCode,
      destinationPostalCode,
      options: customerOptions.map(({ providerPrice: _providerPrice, ...option }) => option),
    });
  } catch (error) {
    console.error("Erro inesperado calculate-shipping:", error instanceof Error ? error.message : "unknown");
    return jsonResponse(request, { error: "Não foi possível calcular o frete agora." }, 500);
  }
});
