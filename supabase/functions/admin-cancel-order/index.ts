import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

/* =========================================================
   BROTHER'S GAMES
   admin-cancel-order

   Cancela um pedido JÁ PAGO pelo painel administrativo.
   O cancelamento financeiro é um REEMBOLSO TOTAL no Mercado Pago.

   Secrets/env esperados:
   - SUPABASE_URL
   - SUPABASE_SECRET_KEYS (ou SUPABASE_SERVICE_ROLE_KEY)
   - MERCADO_PAGO_ACCESS_TOKEN
   - ALLOWED_ORIGINS
   - PUBLIC_SITE_URL (opcional, recomendado)
========================================================= */

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://brothers-games.brothersgames.workers.dev",
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PAID_STATUSES = new Set(["paid", "processing", "completed"]);


type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonString(object: JsonObject | null, key: string) {
  const value = object?.[key];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function jsonObject(object: JsonObject | null, key: string) {
  const value = object?.[key];
  return isJsonObject(value) ? value : null;
}

function jsonArray(object: JsonObject | null, key: string) {
  const value = object?.[key];
  return Array.isArray(value) ? value : [];
}

function configuredOrigins() {
  const configured = String(
    Deno.env.get("ALLOWED_ORIGINS") || ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const publicSiteUrl = String(
    Deno.env.get("PUBLIC_SITE_URL") || ""
  )
    .trim()
    .replace(/\/$/, "");

  if (publicSiteUrl) {
    configured.push(publicSiteUrl);
  }

  return [...new Set(configured)];
}

function isOriginAllowed(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return LOCAL_ORIGINS.has(origin) || configuredOrigins().includes(origin);
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";

  const allowedOrigin =
    origin && isOriginAllowed(request)
      ? origin
      : "https://brothers-games.brothersgames.workers.dev";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  request: Request,
  body: Record<string, unknown>,
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

async function readJsonBody(request: Request, maxBytes = 16 * 1024) {
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

async function rateLimit(admin: SupabaseClient, userId: string) {
  const checks = [
    { key: `admin-refund:${userId}:minute`, window: 60, max: 5 },
    { key: `admin-refund:${userId}:hour`, window: 3600, max: 30 },
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

async function mercadoPagoJson(
  url: string,
  token: string,
  init: RequestInit = {}
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  let data: JsonObject | null = null;
  try {
    const parsed: unknown = await response.json();
    data = isJsonObject(parsed) ? parsed : null;
  } catch {
    data = null;
  }

  return { response, data };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(request),
    });
  }

  if (!isOriginAllowed(request)) {
    return jsonResponse(
      request,
      { error: "Origem não permitida." },
      403
    );
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Método não permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseSecretKey = getSupabaseSecretKey();
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";

    if (!supabaseUrl || !supabaseSecretKey || !mercadoPagoToken) {
      console.error("Configuração obrigatória ausente em admin-cancel-order.");
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
      return jsonResponse(request, { error: "Sua sessão é inválida. Entre novamente." }, 401);
    }

    const user = authData.user;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,role,status")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      !["admin", "owner"].includes(String(profile.role || "")) ||
      String(profile.status || "active") !== "active"
    ) {
      return jsonResponse(request, { error: "Apenas administradores ativos podem reembolsar pedidos." }, 403);
    }

    if (!(await rateLimit(admin, user.id))) {
      return jsonResponse(
        request,
        { error: "Muitas tentativas de reembolso. Aguarde e tente novamente." },
        429,
        { "Retry-After": "60" }
      );
    }

    let body: JsonObject;
    try {
      const parsedBody: unknown = await readJsonBody(request);
      if (!isJsonObject(parsedBody)) {
        return jsonResponse(request, { error: "Corpo da requisição inválido." }, 400);
      }
      body = parsedBody;
    } catch (error) {
      if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
        return jsonResponse(request, { error: "Requisição muito grande." }, 413);
      }
      return jsonResponse(request, { error: "Corpo da requisição inválido." }, 400);
    }

    const orderId = jsonString(body, "orderId").trim();
    if (!UUID_RE.test(orderId)) {
      return jsonResponse(request, { error: "Pedido não informado ou inválido." }, 400);
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id,order_number,customer_id,status,payment_method,payment_provider,provider_order_id,payment_id,provider_amount,total,payment_environment,paid_at,cancelled_at"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse(request, { error: "Pedido não encontrado." }, 404);
    }

    if (order.status === "refunded") {
      return jsonResponse(request, {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        status: "refunded",
        message: "Este pedido já estava reembolsado.",
      });
    }

    if (!PAID_STATUSES.has(String(order.status || ""))) {
      return jsonResponse(
        request,
        { error: "Este pedido não está em um status pago que permita reembolso por esta opção." },
        409
      );
    }

    if (order.payment_provider && order.payment_provider !== "mercado_pago") {
      return jsonResponse(
        request,
        { error: "O provedor deste pagamento não é suportado para reembolso automático." },
        409
      );
    }

    const providerOrderId = String(order.provider_order_id || "").trim();

    if (!providerOrderId) {
      return jsonResponse(
        request,
        { error: "Este pedido não possui o identificador da order do Mercado Pago." },
        409
      );
    }

    // Confere a Order diretamente na API de Orders do Mercado Pago.
    const orderCheck = await mercadoPagoJson(
      `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerOrderId)}`,
      mercadoPagoToken
    );

    if (!orderCheck.response.ok || !orderCheck.data) {
      console.error("Falha ao consultar order no Mercado Pago:", {
        orderId: order.id,
        providerOrderId,
        httpStatus: orderCheck.response.status,
        detail:
          jsonString(orderCheck.data, "message") ||
          jsonString(orderCheck.data, "error") ||
          "unknown",
      });

      return jsonResponse(
        request,
        { error: "Não foi possível consultar o pagamento no Mercado Pago." },
        502
      );
    }

    const providerExternalReference = jsonString(
      orderCheck.data,
      "external_reference"
    ).trim();

    if (
      providerExternalReference &&
      providerExternalReference !== order.order_number
    ) {
      await admin.from("order_events").insert({
        order_id: order.id,
        event_type: "admin_refund_integrity_rejected",
        details: {
          admin_user_id: user.id,
          provider: "mercado_pago",
          provider_order_id: providerOrderId,
          reason: "external_reference_mismatch",
        },
      });

      return jsonResponse(
        request,
        { error: "A order consultada no Mercado Pago não pertence a este pedido." },
        409
      );
    }

    const providerOrderStatus = jsonString(orderCheck.data, "status").toLowerCase();

    // Se já estiver reembolsada no Mercado Pago, apenas sincroniza o banco local.
    if (providerOrderStatus === "refunded") {
      const now = new Date().toISOString();

      const transactions = jsonObject(orderCheck.data, "transactions");
      const refunds = jsonArray(transactions, "refunds");
      const firstRefund =
        refunds.length > 0 && isJsonObject(refunds[0]) ? refunds[0] : null;

      const { error: reconcileError } = await admin
        .from("orders")
        .update({
          status: "refunded",
          cancelled_at: order.cancelled_at || now,
          payment_status_detail: "refunded_by_admin_reconciled",
        })
        .eq("id", order.id);

      if (reconcileError) {
        console.error("Falha ao reconciliar pedido já reembolsado:", {
          orderId: order.id,
          code: reconcileError.code || "unknown",
        });

        return jsonResponse(
          request,
          {
            error:
              "O Mercado Pago já considera o pedido reembolsado, mas não foi possível atualizar o pedido local.",
          },
          500
        );
      }

      await admin.from("order_events").insert({
        order_id: order.id,
        event_type: "refunded_by_admin_reconciled",
        details: {
          admin_user_id: user.id,
          provider: "mercado_pago",
          provider_order_id: providerOrderId,
          refund_id: jsonString(firstRefund, "id") || null,
        },
      });

      return jsonResponse(request, {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        status: "refunded",
        refundId: jsonString(firstRefund, "id") || null,
        message: "Reembolso já confirmado no Mercado Pago e reconciliado localmente.",
      });
    }

    // Orders normalmente ficam "processed" quando o pagamento foi concluído.
    if (!["processed", "approved"].includes(providerOrderStatus)) {
      return jsonResponse(
        request,
        {
          error: `O Mercado Pago não permite reembolso enquanto a order está com status ${providerOrderStatus || "desconhecido"}.`,
        },
        409
      );
    }

    // Reembolso TOTAL pela API de Orders.
    // Para reembolso total, o Mercado Pago orienta enviar POST sem body.
    const refund = await mercadoPagoJson(
      `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerOrderId)}/refund`,
      mercadoPagoToken,
      {
        method: "POST",
        headers: {
          "X-Idempotency-Key": `admin-refund-${order.id}`,
        },
      }
    );

    if (!refund.response.ok || !refund.data) {
      const cause = jsonArray(refund.data, "cause");
      const firstCause =
        cause.length > 0 && isJsonObject(cause[0]) ? cause[0] : null;

      const detail = String(
        jsonString(refund.data, "message") ||
          jsonString(refund.data, "error") ||
          jsonString(firstCause, "description") ||
          `HTTP ${refund.response.status}`
      ).slice(0, 400);

      console.error("Mercado Pago recusou reembolso administrativo:", {
        orderId: order.id,
        providerOrderId,
        httpStatus: refund.response.status,
        detail,
      });

      await admin.from("order_events").insert({
        order_id: order.id,
        event_type: "admin_refund_failed",
        details: {
          admin_user_id: user.id,
          provider: "mercado_pago",
          provider_order_id: providerOrderId,
          http_status: refund.response.status,
          detail,
        },
      });

      return jsonResponse(
        request,
        { error: `O Mercado Pago não confirmou o reembolso: ${detail}` },
        409
      );
    }

    const refundOrderStatus = jsonString(refund.data, "status").toLowerCase();

    if (refundOrderStatus !== "refunded") {
      return jsonResponse(
        request,
        {
          error:
            "O reembolso foi solicitado, mas o Mercado Pago ainda não confirmou o status como reembolsado.",
        },
        409
      );
    }

    const refundTransactions = jsonObject(refund.data, "transactions");
    const refundRows = jsonArray(refundTransactions, "refunds");
    const firstRefund =
      refundRows.length > 0 && isJsonObject(refundRows[0])
        ? refundRows[0]
        : null;

    const now = new Date().toISOString();
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "refunded",
        cancelled_at: now,
        payment_status_detail: "refunded_by_admin",
      })
      .eq("id", order.id)
      .in("status", ["paid", "processing", "completed"]);

    if (updateError) {
      console.error(
        "Reembolso confirmado, mas falhou atualização local:",
        updateError.code || "unknown"
      );
      return jsonResponse(
        request,
        {
          error:
            "O Mercado Pago confirmou o reembolso, mas houve erro ao atualizar o pedido local. Atualize o painel; o webhook também tentará reconciliar o status.",
        },
        500
      );
    }

    await admin.from("order_events").insert({
      order_id: order.id,
      event_type: "refunded_by_admin",
      details: {
        admin_user_id: user.id,
        provider: "mercado_pago",
        provider_order_id: providerOrderId,
        refund_id: jsonString(firstRefund, "id") || null,
        refund_amount: jsonString(firstRefund, "amount") || order.provider_amount || order.total,
      },
    });

    return jsonResponse(request, {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      status: "refunded",
      refundId: jsonString(firstRefund, "id") || null,
      message: "Pedido cancelado e reembolsado integralmente.",
    });
  } catch (error) {
    console.error("admin-cancel-order error:", error);
    return jsonResponse(
      request,
      { error: "Não foi possível concluir o cancelamento e reembolso." },
      500
    );
  }
});