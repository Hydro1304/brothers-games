// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
type AdminClient = any;

type PaymentMethod = "pix" | "card";
type LocalOrderStatus =
  | "pending_payment"
  | "paid"
  | "cancelled"
  | "expired"
  | "processing"
  | "completed"
  | "refunded";

interface CheckoutItemInput {
  productId?: unknown;
  quantity?: unknown;
}

interface CheckoutCardInput {
  token?: unknown;
  paymentMethodId?: unknown;
  installments?: unknown;
  identification?: {
    type?: unknown;
    number?: unknown;
  };
}

interface CheckoutBody {
  paymentMethod?: unknown;
  checkoutRequestId?: unknown;
  items?: CheckoutItemInput[];
  shippingServiceId?: unknown;
  card?: CheckoutCardInput;
}

interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  category: string | null;
  stock_quantity: number | string;
  delivery_type: string | null;
  shipping_weight_kg: number | string | null;
  shipping_width_cm: number | string | null;
  shipping_height_cm: number | string | null;
  shipping_length_cm: number | string | null;
  status: string;
  publish_at: string | null;
  remove_at: string | null;
}

interface OrderItemRow {
  product_id: string;
  unit_price: number | string;
  quantity: number;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  status: LocalOrderStatus | string;
  payment_method: PaymentMethod | string;
  subtotal: number | string;
  shipping: number | string;
  shipping_service_id?: string | null;
  shipping_service_name?: string | null;
  shipping_carrier?: string | null;
  shipping_delivery_days?: number | null;
  shipping_destination_postal_code?: string | null;
  total: number | string;
  provider_amount: number | string | null;
  payment_environment: string | null;
  provider_order_id: string | null;
  payment_id: string | null;
  payment_status_detail: string | null;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  pix_ticket_url: string | null;
  expires_at: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
}

interface MercadoPagoErrorData {
  errors?: Array<{ message?: unknown; code?: unknown }>;
  message?: unknown;
  error?: unknown;
  status_detail?: unknown;
}

interface MercadoPagoPayment {
  id?: unknown;
  amount?: unknown;
  status?: unknown;
  status_detail?: unknown;
  payment_method?: {
    id?: unknown;
    type?: unknown;
    qr_code?: string | null;
    qr_code_base64?: string | null;
    ticket_url?: string | null;
  };
}

interface MercadoPagoOrderResponse extends MercadoPagoErrorData {
  id?: unknown;
  status?: unknown;
  status_detail?: unknown;
  total_amount?: unknown;
  external_reference?: unknown;
  transactions?: {
    payments?: MercadoPagoPayment[];
  };
}

/* =========================================================
   BROTHER'S GAMES
   create-checkout-payment — hardened

   Secrets/env esperados:
   - SUPABASE_URL
   - SUPABASE_SECRET_KEYS (ou SUPABASE_SERVICE_ROLE_KEY)
   - MERCADO_PAGO_ACCESS_TOKEN
   - MERCADO_PAGO_MODE = test | production
   - ALLOWED_ORIGINS = https://seudominio.com,https://www.seudominio.com

   Em desenvolvimento, localhost:5173 e 127.0.0.1:5173 são aceitos.
========================================================= */

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
]);

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function configuredOrigins() {
  return String(Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((value: string) => value.trim())
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
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    ...(origin && isOriginAllowed(request)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {}),
  };
}

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      ...extraHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function readJsonBody(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("INVALID_JSON");
  }
}

function getSupabaseSecretKey() {
  const modernSecrets = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (modernSecrets) {
    try {
      const parsed = JSON.parse(modernSecrets);
      if (typeof parsed?.default === "string" && parsed.default) {
        return parsed.default;
      }
    } catch {
      console.error("SUPABASE_SECRET_KEYS está em formato inválido.");
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function isProductionMode() {
  const value = String(Deno.env.get("MERCADO_PAGO_MODE") || "test")
    .trim()
    .toLowerCase();
  return ["production", "prod", "live"].includes(value);
}

function priceToCents(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100);
}

function generateOrderNumber() {
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `BG${Date.now()}${random}`;
}

function getMercadoPagoErrorMessage(data: MercadoPagoErrorData | null): string {
  const firstError = Array.isArray(data?.errors) ? data.errors[0] : null;
  return String(
    firstError?.message ||
      firstError?.code ||
      data?.message ||
      data?.error ||
      data?.status_detail ||
      "mercado_pago_error"
  ).slice(0, 300);
}

function mapProviderStatus(orderStatusRaw: unknown, paymentStatusRaw: unknown): LocalOrderStatus {
  const orderStatus = String(orderStatusRaw || "").trim().toLowerCase();
  const paymentStatus = String(paymentStatusRaw || "").trim().toLowerCase();

  if (
    ["processed", "approved"].includes(orderStatus) ||
    ["processed", "approved"].includes(paymentStatus)
  ) {
    return "paid";
  }

  if (orderStatus === "expired" || paymentStatus === "expired") {
    return "expired";
  }

  if (orderStatus === "refunded" || paymentStatus === "refunded") {
    return "refunded";
  }

  if (
    ["canceled", "cancelled", "failed", "rejected"].includes(orderStatus) ||
    ["canceled", "cancelled", "failed", "rejected"].includes(paymentStatus)
  ) {
    return "cancelled";
  }

  return "pending_payment";
}

async function rateLimit(admin: AdminClient, userId: string): Promise<boolean> {
  const checks = [
    { key: `checkout:${userId}:minute`, window: 60, max: 6 },
    { key: `checkout:${userId}:hour`, window: 3600, max: 30 },
  ];

  for (const check of checks) {
    const { data, error } = await admin.rpc("check_edge_rate_limit", {
      p_key: check.key,
      p_window_seconds: check.window,
      p_max_requests: check.max,
    });

    if (error) {
      console.error("Rate limit indisponível:", error.code || "unknown");
      throw new Error("RATE_LIMIT_UNAVAILABLE");
    }

    if (data !== true) return false;
  }

  return true;
}

function existingOrderResponse(order: OrderRow, testMode: boolean) {
  return {
    success: true,
    reused: true,
    testMode,
    orderId: order.id,
    orderNumber: order.order_number,
    status: order.status,
    providerOrderId: order.provider_order_id || null,
    paymentId: order.payment_id || null,
    paymentStatus: order.payment_status_detail || order.status,
    paymentStatusDetail: order.payment_status_detail || null,
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    total: Number(order.total || 0),
    providerAmount:
      order.provider_amount === null || order.provider_amount === undefined
        ? null
        : Number(order.provider_amount),
    expiresAt: order.expires_at || null,
    pix:
      order.payment_method === "pix"
        ? {
            qrCode: order.pix_qr_code || null,
            qrCodeBase64: order.pix_qr_code_base64 || null,
            ticketUrl: order.pix_ticket_url || null,
          }
        : null,
  };
}

async function loadOrderItems(admin: AdminClient, orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await admin
    .from("order_items")
    .select("product_id,unit_price,quantity")
    .eq("order_id", orderId);

  if (error) throw new Error("ORDER_ITEMS_READ_FAILED");
  return (data || []) as OrderItemRow[];
}

function cartMatchesExisting(
  items: OrderItemRow[],
  quantities: Map<string, number>,
  dbProducts: ProductRow[]
): boolean {
  if (items.length !== dbProducts.length) return false;

  const expected = new Map<string, { quantity: number; cents: number | null }>(
    dbProducts.map((product: ProductRow) => [
      String(product.id),
      {
        quantity: quantities.get(String(product.id)) || 0,
        cents: priceToCents(product.price),
      },
    ])
  );

  for (const item of items) {
    const current = expected.get(String(item.product_id));
    if (!current) return false;
    if (Number(item.quantity) !== current.quantity) return false;
    if (priceToCents(item.unit_price) !== current.cents) return false;
  }

  return true;
}


interface MelhorEnvioCredentialsRow {
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
  company?: { name?: unknown };
}

interface ShippingResolution {
  shippingCents: number;
  serviceId: string | null;
  serviceName: string | null;
  carrier: string | null;
  deliveryDays: number | null;
  destinationPostalCode: string | null;
}

class ShippingCheckoutError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 409, code = "SHIPPING_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function onlyDigits(value: unknown): string {
  return String(value || "").replace(/\D/g, "");
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

function importMelhorEnvioEncryptionKey(): Promise<CryptoKey> {
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

async function decryptMelhorEnvioToken(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(iv)) },
    key,
    toArrayBuffer(base64ToBytes(ciphertext)),
  );
  return new TextDecoder().decode(decrypted);
}

async function encryptMelhorEnvioToken(token: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(new TextEncoder().encode(token)),
  );
  return { ciphertext: bytesToBase64(new Uint8Array(encrypted)), iv: bytesToBase64(iv) };
}

async function melhorEnvioAccessToken(admin: AdminClient): Promise<string> {
  const { data, error } = await admin
    .from("melhor_envio_credentials")
    .select("scope,access_token_ciphertext,access_token_iv,refresh_token_ciphertext,refresh_token_iv,access_token_expires_at,refresh_token_expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) throw new ShippingCheckoutError("Melhor Envio não está conectado.", 503, "MELHOR_ENVIO_NOT_CONNECTED");

  const credentials = data as MelhorEnvioCredentialsRow;
  const key = await importMelhorEnvioEncryptionKey();
  const expiresAt = new Date(credentials.access_token_expires_at).getTime();

  if (Number.isFinite(expiresAt) && expiresAt > Date.now() + 5 * 60 * 1000) {
    return decryptMelhorEnvioToken(credentials.access_token_ciphertext, credentials.access_token_iv, key);
  }

  const refreshExpiry = credentials.refresh_token_expires_at
    ? new Date(credentials.refresh_token_expires_at).getTime()
    : null;
  if (refreshExpiry && refreshExpiry <= Date.now()) {
    throw new ShippingCheckoutError("A conexão com o Melhor Envio expirou. Reconecte no painel Owner.", 503, "MELHOR_ENVIO_REAUTH_REQUIRED");
  }

  const refreshToken = await decryptMelhorEnvioToken(
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
    throw new ShippingCheckoutError("Configuração do Melhor Envio incompleta.", 500, "MELHOR_ENVIO_CONFIG_INCOMPLETE");
  }

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": userAgent },
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
    throw new ShippingCheckoutError("Não foi possível renovar a conexão com o Melhor Envio.", 503, "MELHOR_ENVIO_REFRESH_FAILED");
  }

  const [accessEncrypted, refreshEncrypted] = await Promise.all([
    encryptMelhorEnvioToken(accessToken, key),
    encryptMelhorEnvioToken(newRefreshToken, key),
  ]);

  const expiresIn = Math.max(60, Number(refreshed.expires_in || 2592000));
  const { error: updateError } = await admin
    .from("melhor_envio_credentials")
    .update({
      token_type: String(refreshed.token_type || "Bearer"),
      scope: String(refreshed.scope || credentials.scope || "shipping-calculate"),
      access_token_ciphertext: accessEncrypted.ciphertext,
      access_token_iv: accessEncrypted.iv,
      refresh_token_ciphertext: refreshEncrypted.ciphertext,
      refresh_token_iv: refreshEncrypted.iv,
      access_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      refresh_token_expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (updateError) throw new ShippingCheckoutError("Não foi possível atualizar o token de frete.", 500, "MELHOR_ENVIO_TOKEN_SAVE_FAILED");
  return accessToken;
}

async function resolveShippingForCheckout(
  admin: AdminClient,
  userId: string,
  products: ProductRow[],
  quantities: Map<string, number>,
  physicalSubtotalCents: number,
  selectedServiceId: string,
): Promise<ShippingResolution> {
  const physicalProducts = products.filter(productIsPhysical);
  if (!physicalProducts.length) {
    return {
      shippingCents: 0,
      serviceId: null,
      serviceName: "Entrega digital",
      carrier: "BROTHER'S GAMES",
      deliveryDays: 0,
      destinationPostalCode: null,
    };
  }

  if (!selectedServiceId) {
    throw new ShippingCheckoutError("Escolha uma opção de frete antes de pagar.", 409, "SHIPPING_SERVICE_REQUIRED");
  }

  const incomplete = physicalProducts.filter((product) =>
    !Number(product.shipping_weight_kg) ||
    !Number(product.shipping_width_cm) ||
    !Number(product.shipping_height_cm) ||
    !Number(product.shipping_length_cm)
  );
  if (incomplete.length) {
    throw new ShippingCheckoutError(
      `Dados de frete incompletos para: ${incomplete.map((item) => item.name).join(", ")}.`,
      409,
      "SHIPPING_PROFILE_INCOMPLETE",
    );
  }

  const { data: customer, error: customerError } = await admin
    .from("customer_private")
    .select("cep")
    .eq("id", userId)
    .maybeSingle();

  const destinationPostalCode = onlyDigits(customer?.cep);
  if (customerError || destinationPostalCode.length !== 8) {
    throw new ShippingCheckoutError("Salve um CEP de entrega válido antes de pagar.", 409, "SHIPPING_POSTAL_CODE_REQUIRED");
  }

  const originPostalCode = onlyDigits(Deno.env.get("MELHOR_ENVIO_ORIGIN_POSTAL_CODE") || "08440470");
  const baseUrl = (Deno.env.get("MELHOR_ENVIO_BASE_URL") || "https://sandbox.melhorenvio.com.br").replace(/\/$/, "");
  const userAgent = Deno.env.get("MELHOR_ENVIO_USER_AGENT") || "";
  if (originPostalCode.length !== 8 || !userAgent) {
    throw new ShippingCheckoutError("Configuração de frete incompleta no servidor.", 500, "SHIPPING_CONFIG_INCOMPLETE");
  }

  const accessToken = await melhorEnvioAccessToken(admin);
  const quoteProducts = physicalProducts.map((product) => ({
    id: product.id,
    width: Number(product.shipping_width_cm),
    height: Number(product.shipping_height_cm),
    length: Number(product.shipping_length_cm),
    weight: Number(product.shipping_weight_kg),
    insurance_value: Number(Number(product.price).toFixed(2)),
    quantity: quantities.get(product.id) || 1,
  }));

  const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
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
      products: quoteProducts,
      options: { receipt: false, own_hand: false },
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data)) {
    throw new ShippingCheckoutError("Não foi possível validar o frete no Melhor Envio.", 502, "SHIPPING_PROVIDER_FAILED");
  }

  const quotes = (data as MelhorEnvioQuote[])
    .filter((quote) => !quote.error)
    .map((quote) => {
      const serviceId = String(quote.id ?? "").trim();
      const priceCents = priceToCents(quote.custom_price ?? quote.price);
      const delivery = Math.max(0, Number(quote.custom_delivery_time ?? quote.delivery_time ?? 0));
      if (!serviceId || priceCents === null) return null;
      return {
        serviceId,
        priceCents,
        serviceName: String(quote.name || `Serviço ${serviceId}`),
        carrier: String(quote.company?.name || "Transportadora"),
        deliveryDays: Number.isFinite(delivery) ? Math.round(delivery) : 0,
      };
    })
    .filter((quote): quote is NonNullable<typeof quote> => quote !== null)
    .sort((a, b) => a.priceCents - b.priceCents);

  if (!quotes.length) {
    throw new ShippingCheckoutError("Nenhuma opção de frete está disponível para este CEP.", 422, "SHIPPING_UNAVAILABLE");
  }

  const freeShipping = physicalSubtotalCents >= 29900;
  const chosen = freeShipping
    ? quotes[0]
    : quotes.find((quote) => quote.serviceId === selectedServiceId);

  if (!chosen) {
    throw new ShippingCheckoutError("A opção de frete selecionada não está mais disponível. Recalcule o frete.", 409, "SHIPPING_SERVICE_CHANGED");
  }

  if (freeShipping && selectedServiceId !== chosen.serviceId) {
    throw new ShippingCheckoutError("A opção de frete grátis mudou. Recalcule antes de pagar.", 409, "SHIPPING_FREE_SERVICE_CHANGED");
  }

  return {
    shippingCents: freeShipping ? 0 : chosen.priceCents,
    serviceId: chosen.serviceId,
    serviceName: chosen.serviceName,
    carrier: chosen.carrier,
    deliveryDays: chosen.deliveryDays,
    destinationPostalCode,
  };
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
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";
    const productionMode = isProductionMode();
    const testMode = !productionMode;
    const paymentEnvironment = productionMode ? "production" : "test";

    if (!supabaseUrl || !supabaseSecretKey || !mercadoPagoToken) {
      console.error("Configuração obrigatória ausente em create-checkout-payment.");
      return jsonResponse(request, { error: "Configuração do servidor incompleta." }, 500);
    }

    const authHeader = request.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse(request, { error: "Você precisa estar logado." }, 401);
    }

    const userToken = authHeader.slice("Bearer ".length).trim();
    if (!userToken || userToken.length > 4096) {
      return jsonResponse(request, { error: "Sessão inválida." }, 401);
    }

    const admin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(userToken);
    if (authError || !authData.user) {
      return jsonResponse(
        request,
        { error: "Sessão inválida. Entre novamente na sua conta." },
        401
      );
    }

    const user = authData.user;
    if (!user.email) {
      return jsonResponse(request, { error: "Sua conta não possui e-mail." }, 400);
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,status,suspended_until")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse(request, { error: "Perfil não encontrado." }, 403);
    }

    if (profile.status === "blocked") {
      return jsonResponse(request, { error: "Esta conta está bloqueada." }, 403);
    }

    if (profile.status === "suspended") {
      const suspendedUntil = profile.suspended_until
        ? new Date(profile.suspended_until)
        : null;
      const stillSuspended =
        !suspendedUntil || suspendedUntil.getTime() > Date.now();

      if (stillSuspended) {
        return jsonResponse(request, { error: "Esta conta está suspensa." }, 403);
      }

      await admin
        .from("profiles")
        .update({ status: "active", suspended_until: null })
        .eq("id", user.id);
    }

    if (!(await rateLimit(admin, user.id))) {
      return jsonResponse(
        request,
        { error: "Muitas tentativas de pagamento. Aguarde um pouco e tente novamente." },
        429,
        { "Retry-After": "60" }
      );
    }

    let body: CheckoutBody;
    try {
      body = (await readJsonBody(request)) as CheckoutBody;
    } catch (error) {
      if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
        return jsonResponse(request, { error: "Requisição muito grande." }, 413);
      }
      return jsonResponse(request, { error: "Corpo da requisição inválido." }, 400);
    }

    const paymentMethod = String(body.paymentMethod || "").trim().toLowerCase() as PaymentMethod;
    const checkoutRequestId = String(body.checkoutRequestId || "").trim();
    const shippingServiceId = String(body.shippingServiceId || "").trim();
    const items: CheckoutItemInput[] = Array.isArray(body.items) ? body.items : [];

    if (shippingServiceId && !/^[A-Za-z0-9._:-]{1,64}$/.test(shippingServiceId)) {
      return jsonResponse(request, { error: "Serviço de frete inválido." }, 400);
    }

    if (!UUID_V4_RE.test(checkoutRequestId)) {
      return jsonResponse(request, { error: "Identificador do checkout inválido." }, 400);
    }

    if (!["pix", "card"].includes(paymentMethod)) {
      return jsonResponse(request, { error: "Forma de pagamento inválida." }, 400);
    }

    if (items.length === 0 || items.length > 50) {
      return jsonResponse(request, { error: "Carrinho inválido." }, 400);
    }

    let cardToken = "";
    let cardPaymentMethodId = "";
    let cardInstallments = 1;
    let identificationType = "";
    let identificationNumber = "";

    if (paymentMethod === "card") {
      const card: CheckoutCardInput = body.card || {};
      cardToken = String(card?.token || "").trim();
      cardPaymentMethodId = String(card?.paymentMethodId || "").trim().toLowerCase();
      cardInstallments = Number(card?.installments);
      identificationType = String(card?.identification?.type || "").trim().toUpperCase();
      identificationNumber = String(card?.identification?.number || "")
        .replace(/\D/g, "")
        .trim();

      if (!cardToken || cardToken.length > 512) {
        return jsonResponse(request, { error: "Token do cartão inválido." }, 400);
      }

      if (!/^[a-z0-9_-]{1,50}$/.test(cardPaymentMethodId)) {
        return jsonResponse(request, { error: "Bandeira do cartão inválida." }, 400);
      }

      if (!Number.isInteger(cardInstallments) || cardInstallments < 1 || cardInstallments > 12) {
        return jsonResponse(request, { error: "Quantidade de parcelas inválida." }, 400);
      }

      if (!/^[A-Z0-9_-]{1,20}$/.test(identificationType)) {
        return jsonResponse(request, { error: "Tipo de documento inválido." }, 400);
      }

      if (!/^\d{5,20}$/.test(identificationNumber)) {
        return jsonResponse(request, { error: "Documento do titular inválido." }, 400);
      }
    }

    const quantities = new Map<string, number>();

    for (const item of items) {
      const productId = String(item?.productId || "").trim();
      const quantity = Number(item?.quantity);

      if (!UUID_RE.test(productId)) {
        return jsonResponse(request, { error: "Produto inválido." }, 400);
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return jsonResponse(request, { error: "Quantidade inválida." }, 400);
      }

      const newQuantity = (quantities.get(productId) || 0) + quantity;
      if (newQuantity > 50) {
        return jsonResponse(
          request,
          { error: "Quantidade máxima excedida para um produto." },
          400
        );
      }

      quantities.set(productId, newQuantity);
    }

    if (quantities.size > 50) {
      return jsonResponse(request, { error: "Carrinho possui produtos demais." }, 400);
    }

    const productIds = [...quantities.keys()];
    const { data: dbProducts, error: productsError } = await admin
      .from("products")
      .select("id,name,price,category,stock_quantity,delivery_type,shipping_weight_kg,shipping_width_cm,shipping_height_cm,shipping_length_cm,status,publish_at,remove_at")
      .in("id", productIds);

    if (productsError) {
      console.error("Falha consultando produtos:", productsError.code || "unknown");
      return jsonResponse(request, { error: "Não foi possível verificar os produtos." }, 500);
    }

    if (!dbProducts || dbProducts.length !== productIds.length) {
      return jsonResponse(request, { error: "Um ou mais produtos não existem." }, 400);
    }

    const now = Date.now();

    for (const product of dbProducts as ProductRow[]) {
      const publishAt = product.publish_at ? new Date(product.publish_at).getTime() : null;
      const removeAt = product.remove_at ? new Date(product.remove_at).getTime() : null;

      if (product.status !== "active") {
        return jsonResponse(request, { error: `${product.name} não está disponível.` }, 409);
      }
      if (publishAt && publishAt > now) {
        return jsonResponse(request, { error: `${product.name} ainda não foi publicado.` }, 409);
      }
      if (removeAt && removeAt <= now) {
        return jsonResponse(request, { error: `${product.name} não está mais disponível.` }, 409);
      }
    }

    for (const product of dbProducts as ProductRow[]) {
      const requested = quantities.get(String(product.id)) || 0;
      const available = Math.max(0, Math.floor(Number(product.stock_quantity || 0)));

      if (requested > available) {
        return jsonResponse(
          request,
          {
            code: "INSUFFICIENT_STOCK",
            error: `${product.name} possui apenas ${available} unidade(s) disponível(is).`,
            productId: product.id,
            requested,
            available,
          },
          409
        );
      }
    }

    let subtotalCents = 0;
    let physicalSubtotalCents = 0;

    for (const product of dbProducts as ProductRow[]) {
      const quantity = quantities.get(String(product.id)) || 0;
      const unitPriceCents = priceToCents(product.price);

      if (unitPriceCents === null || unitPriceCents < 0) {
        console.error("Preço inválido cadastrado no produto:", product.id);
        return jsonResponse(request, { error: "Um produto possui preço inválido." }, 500);
      }

      subtotalCents += unitPriceCents * quantity;
      if (productIsPhysical(product)) {
        physicalSubtotalCents += unitPriceCents * quantity;
      }
    }

    let shippingResolution: ShippingResolution;
    try {
      shippingResolution = await resolveShippingForCheckout(
        admin,
        user.id,
        dbProducts as ProductRow[],
        quantities,
        physicalSubtotalCents,
        shippingServiceId,
      );
    } catch (error) {
      if (error instanceof ShippingCheckoutError) {
        return jsonResponse(
          request,
          { code: error.code, error: error.message },
          error.status,
        );
      }
      console.error("Falha validando frete:", error instanceof Error ? error.message : "unknown");
      return jsonResponse(request, { error: "Não foi possível validar o frete." }, 500);
    }

    const shippingCents = shippingResolution.shippingCents;
    const totalCents = subtotalCents + shippingCents;

    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
      return jsonResponse(request, { error: "Valor do pedido inválido." }, 400);
    }

    const subtotal = subtotalCents / 100;
    const shipping = shippingCents / 100;
    const total = totalCents / 100;
    const providerTotal = testMode && paymentMethod === "pix" ? 50 : total;
    const providerTotalCents = priceToCents(providerTotal);
    const providerTotalString = providerTotal.toFixed(2);
    const expiresAt =
      paymentMethod === "pix"
        ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
        : null;

    const existingQuery = await admin
      .from("orders")
      .select(
        "id,order_number,customer_id,status,payment_method,subtotal,shipping,shipping_service_id,shipping_service_name,shipping_carrier,shipping_delivery_days,shipping_destination_postal_code,total,provider_amount,payment_environment,provider_order_id,payment_id,payment_status_detail,pix_qr_code,pix_qr_code_base64,pix_ticket_url,expires_at,paid_at,cancelled_at"
      )
      .eq("checkout_request_id", checkoutRequestId)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (existingQuery.error) {
      console.error("Falha consultando idempotência:", existingQuery.error.code || "unknown");
      return jsonResponse(request, { error: "Não foi possível validar a tentativa de checkout." }, 500);
    }

    let localOrder: OrderRow | null = (existingQuery.data as OrderRow | null) || null;
    let reusedPendingOrder = false;

    if (localOrder) {
      const sameRequest =
        localOrder.payment_method === paymentMethod &&
        priceToCents(localOrder.subtotal) === subtotalCents &&
        priceToCents(localOrder.shipping) === shippingCents &&
        String(localOrder.shipping_service_id || "") === String(shippingResolution.serviceId || "") &&
        priceToCents(localOrder.total) === totalCents &&
        (localOrder.provider_amount === null ||
          priceToCents(localOrder.provider_amount) === providerTotalCents) &&
        (!localOrder.payment_environment ||
          localOrder.payment_environment === paymentEnvironment);

      if (!sameRequest) {
        return jsonResponse(
          request,
          { error: "Este identificador de checkout já foi usado com dados diferentes." },
          409
        );
      }

      const existingItems = await loadOrderItems(admin, localOrder.id);
      if (!cartMatchesExisting(existingItems, quantities, dbProducts as ProductRow[])) {
        return jsonResponse(
          request,
          { error: "A tentativa de checkout existente possui itens diferentes." },
          409
        );
      }

      if (
        localOrder.provider_order_id ||
        localOrder.status !== "pending_payment" ||
        (paymentMethod === "pix" && localOrder.pix_qr_code)
      ) {
        return jsonResponse(request, existingOrderResponse(localOrder, testMode), 200);
      }

      reusedPendingOrder = true;
    }

    if (!localOrder) {
      const orderNumber = generateOrderNumber();
      const { data, error } = await admin
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: user.id,
          status: "pending_payment",
          payment_method: paymentMethod,
          payment_provider: "mercado_pago",
          subtotal,
          shipping,
          shipping_service_id: shippingResolution.serviceId,
          shipping_service_name: shippingResolution.serviceName,
          shipping_carrier: shippingResolution.carrier,
          shipping_delivery_days: shippingResolution.deliveryDays,
          shipping_destination_postal_code: shippingResolution.destinationPostalCode,
          total,
          provider_amount: providerTotal,
          payment_environment: paymentEnvironment,
          checkout_request_id: checkoutRequestId,
          expires_at: expiresAt,
        })
        .select("id,order_number")
        .single();

      if (error || !data) {
        if (error?.code === "23505") {
          return jsonResponse(
            request,
            { error: "Esta tentativa de checkout já está sendo processada. Aguarde alguns segundos." },
            409
          );
        }

        console.error("Falha criando pedido local:", error?.code || "unknown");
        return jsonResponse(request, { error: "Não foi possível criar o pedido." }, 500);
      }

      const createdOrder: OrderRow = {
        ...(data as { id: string; order_number: string }),
        customer_id: user.id,
        status: "pending_payment",
        payment_method: paymentMethod,
        subtotal,
        shipping,
        shipping_service_id: shippingResolution.serviceId,
        shipping_service_name: shippingResolution.serviceName,
        shipping_carrier: shippingResolution.carrier,
        shipping_delivery_days: shippingResolution.deliveryDays,
        shipping_destination_postal_code: shippingResolution.destinationPostalCode,
        total,
        provider_amount: providerTotal,
        payment_environment: paymentEnvironment,
        provider_order_id: null,
        payment_id: null,
        payment_status_detail: null,
        pix_qr_code: null,
        pix_qr_code_base64: null,
        pix_ticket_url: null,
        expires_at: expiresAt,
      };

      localOrder = createdOrder;

      const orderItems = (dbProducts as ProductRow[]).map((product: ProductRow) => ({
        order_id: createdOrder.id,
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price),
        quantity: quantities.get(String(product.id)) || 1,
      }));

      const { error: itemsError } = await admin.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Falha criando itens do pedido:", itemsError.code || "unknown");
        await admin.from("orders").delete().eq("id", createdOrder.id);
        return jsonResponse(request, { error: "Não foi possível salvar os itens do pedido." }, 500);
      }

      const { data: stockReservation, error: stockReservationError } = await admin.rpc(
        "reserve_order_stock",
        { p_order_id: createdOrder.id }
      );

      if (stockReservationError || !stockReservation?.success) {
        const unavailableName = String(stockReservation?.product_name || "Produto");
        const available = Math.max(0, Number(stockReservation?.available || 0));
        const requested = Math.max(0, Number(stockReservation?.requested || 0));

        console.error("Reserva de estoque recusada:", {
          orderId: createdOrder.id,
          code: stockReservationError?.code || stockReservation?.code || "unknown",
          productId: stockReservation?.product_id || null,
        });

        await admin.from("order_items").delete().eq("order_id", createdOrder.id);
        await admin.from("orders").delete().eq("id", createdOrder.id);

        return jsonResponse(
          request,
          {
            code: "INSUFFICIENT_STOCK",
            error: stockReservation?.product_name
              ? `${unavailableName} possui apenas ${available} unidade(s) disponível(is); você solicitou ${requested}.`
              : "O estoque mudou enquanto o pedido era criado. Atualize o carrinho e tente novamente.",
            productId: stockReservation?.product_id || null,
            requested,
            available,
          },
          409
        );
      }

      await admin.from("order_events").insert({
        order_id: createdOrder.id,
        event_type: "order_created",
        details: {
          payment_method: paymentMethod,
          mercado_pago_mode: paymentEnvironment,
          provider_amount: providerTotal,
          checkout_request_id: checkoutRequestId,
        },
      });
    }

    if (!localOrder) {
      return jsonResponse(request, { error: "Não foi possível recuperar o pedido criado." }, 500);
    }

    const activeOrder: OrderRow = localOrder;
    const orderNumber = activeOrder.order_number;
    const mercadoPagoBody =
      paymentMethod === "pix"
        ? {
            type: "online",
            processing_mode: "automatic",
            total_amount: providerTotalString,
            external_reference: orderNumber,
            payer: testMode
              ? { email: "test_user_br@testuser.com", first_name: "APRO" }
              : { email: user.email },
            transactions: {
              payments: [
                {
                  amount: providerTotalString,
                  payment_method: { id: "pix", type: "bank_transfer" },
                  expiration_time: "PT30M",
                },
              ],
            },
          }
        : {
            type: "online",
            processing_mode: "automatic",
            total_amount: providerTotalString,
            external_reference: orderNumber,
            payer: {
              email: testMode ? "test@testuser.com" : user.email,
              identification: {
                type: identificationType,
                number: identificationNumber,
              },
            },
            transactions: {
              payments: [
                {
                  amount: providerTotalString,
                  payment_method: {
                    id: cardPaymentMethodId,
                    type: "credit_card",
                    token: cardToken,
                    installments: cardInstallments,
                  },
                },
              ],
            },
          };

    let mercadoPagoResponse;
    try {
      mercadoPagoResponse = await fetch("https://api.mercadopago.com/v1/orders", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${mercadoPagoToken}`,
          "X-Idempotency-Key": checkoutRequestId,
        },
        body: JSON.stringify(mercadoPagoBody),
      });
    } catch {
      await admin.from("order_events").insert({
        order_id: activeOrder.id,
        event_type: "payment_provider_unreachable",
        details: { provider: "mercado_pago" },
      });

      return jsonResponse(
        request,
        {
          error:
            "Não foi possível confirmar a resposta do Mercado Pago. Não tente pagar novamente agora; aguarde alguns instantes e confira Meus Pedidos.",
          orderId: activeOrder.id,
          orderNumber,
        },
        502
      );
    }

    let mercadoPagoData: MercadoPagoOrderResponse | null = null;
    try {
      mercadoPagoData = (await mercadoPagoResponse.json()) as MercadoPagoOrderResponse;
    } catch {
      mercadoPagoData = null;
    }

    if (!mercadoPagoResponse.ok) {
      const detail = getMercadoPagoErrorMessage(mercadoPagoData);
      const idempotencyConflict =
        mercadoPagoResponse.status === 409 ||
        detail.toLowerCase().includes("idempotency");
      const temporary =
        idempotencyConflict ||
        mercadoPagoResponse.status === 429 ||
        mercadoPagoResponse.status >= 500;

      console.error("Mercado Pago recusou criação da order:", {
        httpStatus: mercadoPagoResponse.status,
        code: detail,
        orderNumber,
      });

      if (!temporary) {
        await admin
          .from("orders")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            payment_status_detail: detail,
          })
          .eq("id", activeOrder.id)
          .eq("status", "pending_payment");
      } else {
        await admin
          .from("orders")
          .update({ payment_status_detail: "provider_temporary_error" })
          .eq("id", activeOrder.id)
          .eq("status", "pending_payment");
      }

      await admin.from("order_events").insert({
        order_id: activeOrder.id,
        event_type: temporary ? "payment_provider_temporary_error" : "payment_creation_failed",
        details: {
          provider: "mercado_pago",
          http_status: mercadoPagoResponse.status,
          detail,
        },
      });

      return jsonResponse(
        request,
        {
          error: temporary
            ? "O Mercado Pago está temporariamente indisponível. Aguarde antes de tentar novamente."
            : "O Mercado Pago não conseguiu criar o pagamento.",
          detail: temporary ? undefined : detail,
          orderId: activeOrder.id,
          orderNumber,
          testMode,
        },
        temporary ? 502 : 400
      );
    }

    const providerPayment = mercadoPagoData?.transactions?.payments?.[0] || null;
    const providerOrderId = mercadoPagoData?.id ? String(mercadoPagoData.id) : "";
    const providerExternalReference = String(
      mercadoPagoData?.external_reference || ""
    ).trim();
    const providerOrderTotalCents = priceToCents(mercadoPagoData?.total_amount);
    const providerPaymentAmountCents = providerPayment?.amount
      ? priceToCents(providerPayment.amount)
      : null;

    const integrityProblems: string[] = [];
    if (!providerOrderId) integrityProblems.push("provider_order_id_missing");
    if (providerExternalReference !== orderNumber) integrityProblems.push("external_reference_mismatch");
    if (providerOrderTotalCents !== providerTotalCents) integrityProblems.push("total_amount_mismatch");
    if (
      providerPaymentAmountCents !== null &&
      providerPaymentAmountCents !== providerTotalCents
    ) {
      integrityProblems.push("payment_amount_mismatch");
    }

    const responsePaymentMethodId = String(
      providerPayment?.payment_method?.id || ""
    ).trim().toLowerCase();
    const responsePaymentMethodType = String(
      providerPayment?.payment_method?.type || ""
    ).trim().toLowerCase();

    if (paymentMethod === "pix") {
      if (responsePaymentMethodId && responsePaymentMethodId !== "pix") {
        integrityProblems.push("payment_method_mismatch");
      }
      if (
        responsePaymentMethodType &&
        responsePaymentMethodType !== "bank_transfer"
      ) {
        integrityProblems.push("payment_type_mismatch");
      }
    } else if (
      responsePaymentMethodType &&
      responsePaymentMethodType !== "credit_card"
    ) {
      integrityProblems.push("payment_type_mismatch");
    }

    if (integrityProblems.length) {
      console.error("Integridade da resposta do Mercado Pago rejeitada:", {
        orderNumber,
        providerOrderId: providerOrderId || null,
        problems: integrityProblems,
      });

      await admin
        .from("orders")
        .update({ payment_status_detail: "payment_integrity_mismatch" })
        .eq("id", activeOrder.id);

      await admin.from("order_events").insert({
        order_id: activeOrder.id,
        event_type: "payment_integrity_rejected",
        details: {
          provider: "mercado_pago",
          provider_order_id: providerOrderId || null,
          problems: integrityProblems,
        },
      });

      return jsonResponse(
        request,
        {
          error:
            "O pagamento recebeu uma resposta inconsistente do provedor e não foi confirmado automaticamente.",
          orderId: activeOrder.id,
          orderNumber,
        },
        502
      );
    }

    const providerOrderStatus = String(mercadoPagoData?.status || "");
    const providerOrderStatusDetail = String(mercadoPagoData?.status_detail || "");
    const providerPaymentStatus = String(providerPayment?.status || "");
    const providerPaymentStatusDetail = String(providerPayment?.status_detail || "");
    const localStatus = mapProviderStatus(providerOrderStatus, providerPaymentStatus);
    const nowIso = new Date().toISOString();
    const paymentId = providerPayment?.id ? String(providerPayment.id) : null;
    const statusDetail =
      providerPaymentStatusDetail ||
      providerOrderStatusDetail ||
      providerPaymentStatus ||
      providerOrderStatus ||
      null;
    const providerPaymentMethod = providerPayment?.payment_method || {};
    const pixQrCode =
      paymentMethod === "pix" ? providerPaymentMethod?.qr_code || null : null;
    const pixQrCodeBase64 =
      paymentMethod === "pix" ? providerPaymentMethod?.qr_code_base64 || null : null;
    const pixTicketUrl =
      paymentMethod === "pix" ? providerPaymentMethod?.ticket_url || null : null;

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: localStatus,
        provider_order_id: providerOrderId,
        payment_id: paymentId,
        payment_status_detail: statusDetail,
        provider_amount: providerTotal,
        payment_environment: paymentEnvironment,
        pix_qr_code: pixQrCode,
        pix_qr_code_base64: pixQrCodeBase64,
        pix_ticket_url: pixTicketUrl,
        paid_at: localStatus === "paid" ? nowIso : null,
        cancelled_at: localStatus === "cancelled" ? nowIso : null,
      })
      .eq("id", activeOrder.id);

    if (updateError) {
      console.error("Pagamento criado, mas pedido local não atualizou:", updateError.code || "unknown");
      return jsonResponse(
        request,
        {
          error:
            "O pagamento foi criado, mas houve um erro ao sincronizar o pedido. Não tente pagar novamente; confira Meus Pedidos.",
          orderId: activeOrder.id,
          orderNumber,
          providerOrderId,
          testMode,
        },
        500
      );
    }

    await admin.from("order_events").insert({
      order_id: activeOrder.id,
      event_type:
        localStatus === "paid"
          ? "payment_approved"
          : localStatus === "cancelled"
          ? "payment_rejected"
          : localStatus === "expired"
          ? "payment_expired"
          : reusedPendingOrder
          ? "payment_creation_retried"
          : "payment_created",
      details: {
        provider: "mercado_pago",
        mercado_pago_mode: paymentEnvironment,
        provider_order_id: providerOrderId,
        payment_id: paymentId,
        order_status: providerOrderStatus,
        payment_status: providerPaymentStatus,
        status_detail: statusDetail,
        local_total: total,
        provider_amount: providerTotal,
        checkout_request_id: checkoutRequestId,
      },
    });

    return jsonResponse(
      request,
      {
        success: true,
        testMode,
        orderId: activeOrder.id,
        orderNumber,
        status: localStatus,
        providerOrderId,
        paymentId,
        paymentStatus: providerPaymentStatus || providerOrderStatus,
        paymentStatusDetail: statusDetail,
        subtotal,
        shipping,
        total,
        providerAmount: providerTotal,
        expiresAt,
        pix:
          paymentMethod === "pix"
            ? {
                qrCode: pixQrCode,
                qrCodeBase64: pixQrCodeBase64,
                ticketUrl: pixTicketUrl,
              }
            : null,
      },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT_UNAVAILABLE") {
      return jsonResponse(
        request,
        { error: "Proteção de segurança temporariamente indisponível. Tente novamente em instantes." },
        503
      );
    }

    console.error("create-checkout-payment: falha interna", {
      name: error instanceof Error ? error.name : "unknown",
    });

    return jsonResponse(request, { error: "Erro interno no servidor." }, 500);
  }
});
