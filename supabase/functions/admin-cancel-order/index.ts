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

  if (
    LOCAL_ORIGINS.has(origin) ||
    configuredOrigins().includes(origin)
  ) {
    return true;
  }

  // Vite pode subir em 5174, 5175 etc. quando 5173 já está ocupado.
  // Permitimos localhost/127.0.0.1 em qualquer porta somente no ambiente local.
  try {
    const url = new URL(origin);

    if (
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" ||
        url.protocol === "https:")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
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

  const rawText = await response.text();

  let data: JsonObject | null = null;
  if (rawText) {
    try {
      const parsed: unknown = JSON.parse(rawText);
      data = isJsonObject(parsed) ? parsed : null;
    } catch {
      data = null;
    }
  }

  const retryAfterHeader =
    response.headers.get("Retry-After");

  const retryAfterSeconds = retryAfterHeader
    ? Number(retryAfterHeader)
    : null;

  return {
    response,
    data,
    rawText: rawText.slice(0, 4000),
    retryAfterSeconds:
      Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds
        : null,
  };
}

function mercadoPagoErrorInfo(
  data: JsonObject | null,
  rawText: string,
  httpStatus: number
) {
  const cause = jsonArray(data, "cause");
  const causes = jsonArray(data, "causes");
  const errors = jsonArray(data, "errors");

  const firstCause =
    cause.length > 0 && isJsonObject(cause[0])
      ? cause[0]
      : causes.length > 0 && isJsonObject(causes[0])
        ? causes[0]
        : errors.length > 0 && isJsonObject(errors[0])
          ? errors[0]
          : null;

  const code = String(
    jsonString(data, "code") ||
      jsonString(data, "error") ||
      jsonString(firstCause, "code") ||
      jsonString(firstCause, "error") ||
      jsonString(firstCause, "id") ||
      ""
  ).trim();

  const providerMessage = String(
    jsonString(data, "message") ||
      jsonString(data, "status_detail") ||
      jsonString(firstCause, "description") ||
      jsonString(firstCause, "message") ||
      ""
  ).trim();

  const knownMessages: Record<string, string> = {
    payment_not_refundable:
      "Este pagamento não está elegível para reembolso no Mercado Pago.",
    amount_not_refundable:
      "O Mercado Pago informou que o valor desta order não pode ser reembolsado.",
    max_refunds_exceeded:
      "O limite de reembolsos permitido para esta order foi atingido.",
    order_payment_not_yet_enabled_for_refund:
      "O pagamento ainda não foi liberado pelo Mercado Pago para reembolso. Aguarde alguns minutos e tente novamente.",
    refund_in_progress:
      "Já existe um reembolso em processamento para esta order. Aguarde alguns minutos.",
    movement_operations_pending:
      "O Mercado Pago ainda possui movimentações pendentes nesta order. Aguarde alguns minutos e tente novamente.",
    order_already_refunded:
      "O Mercado Pago informa que esta order já foi reembolsada.",
    cannot_refund_order:
      "O status atual da order não permite reembolso.",
    action_not_allowed_for_current_state:
      "O estado atual do pagamento ainda não permite esta ação.",
    refund_period_exceeded:
      "O prazo permitido pelo Mercado Pago para reembolso foi excedido.",
    insufficient_money_for_refund:
      "O Mercado Pago informou saldo insuficiente para concluir o reembolso.",
    too_many_requests:
      "O Mercado Pago bloqueou temporariamente novas tentativas de reembolso porque o limite de movimentações foi atingido. Aguarde o tempo indicado e tente novamente.",
  };

  const friendly =
    knownMessages[code] ||
    providerMessage ||
    (rawText ? rawText.slice(0, 500) : "") ||
    `HTTP ${httpStatus}`;

  return {
    code: code || null,
    providerMessage: providerMessage || null,
    friendly: friendly.slice(0, 500),
  };
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

    // Na Orders API, o reembolso deve ser solicitado quando a order já foi processada.
    // Se o provedor ainda não chegou a "processed", não enviamos um refund que será recusado.
    if (providerOrderStatus !== "processed") {
      const providerOrderStatusDetail =
        jsonString(orderCheck.data, "status_detail") || "sem detalhe";

      return jsonResponse(
        request,
        {
          error:
            `O Mercado Pago ainda não liberou esta order para reembolso. ` +
            `Status atual: ${providerOrderStatus || "desconhecido"} ` +
            `(${providerOrderStatusDetail}). Aguarde a order ficar processed e tente novamente.`,
        },
        409
      );
    }

    // Reembolso TOTAL pela API de Orders.
    // Para reembolso total, o Mercado Pago orienta enviar POST sem body.
    //
    // A mesma intenção de reembolso usa uma chave de idempotência estável.
    // Isso evita criar várias movimentações no Mercado Pago quando o admin
    // clica novamente ou quando existe uma falha transitória.
    const refundEndpoint =
      `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerOrderId)}/refund`;

    const refundIdempotencyKey =
      `admin-refund-${order.id}`;

    const refund = await mercadoPagoJson(
      refundEndpoint,
      mercadoPagoToken,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": refundIdempotencyKey,
        },
      }
    );

    if (!refund.response.ok || !refund.data) {
      const providerError = mercadoPagoErrorInfo(
        refund.data,
        refund.rawText,
        refund.response.status
      );

      const providerStatusDetail =
        jsonString(orderCheck.data, "status_detail") || null;

      const isTooManyRequests =
        providerError.code === "too_many_requests" ||
        refund.response.status === 429 ||
        /movement limit|too many requests/i.test(
          `${providerError.providerMessage || ""} ${providerError.friendly || ""} ${refund.rawText || ""}`
        );

      const retryAfterSeconds =
        refund.retryAfterSeconds && refund.retryAfterSeconds > 0
          ? Math.ceil(refund.retryAfterSeconds)
          : isTooManyRequests
            ? 300
            : null;

      console.error("Mercado Pago recusou reembolso administrativo:", {
        orderId: order.id,
        providerOrderId,
        paymentId: order.payment_id || null,
        providerOrderStatus,
        providerStatusDetail,
        refundIdempotencyKey,
        httpStatus: refund.response.status,
        errorCode: providerError.code,
        providerMessage: providerError.providerMessage,
        detail: providerError.friendly,
        retryAfterSeconds,
        rawResponse: refund.rawText || null,
      });

      await admin.from("order_events").insert({
        order_id: order.id,
        event_type: "admin_refund_failed",
        details: {
          admin_user_id: user.id,
          provider: "mercado_pago",
          provider_order_id: providerOrderId,
          payment_id: order.payment_id || null,
          provider_order_status: providerOrderStatus || null,
          provider_order_status_detail: providerStatusDetail,
          refund_idempotency_key: refundIdempotencyKey,
          http_status: refund.response.status,
          provider_error_code: providerError.code,
          provider_message: providerError.providerMessage,
          detail: providerError.friendly,
          retry_after_seconds: retryAfterSeconds,
          raw_response: refund.rawText || null,
        },
      });

      if (isTooManyRequests) {
        const waitText =
          retryAfterSeconds && retryAfterSeconds >= 60
            ? `${Math.ceil(retryAfterSeconds / 60)} minuto(s)`
            : `${retryAfterSeconds || 300} segundo(s)`;

        return jsonResponse(
          request,
          {
            error:
              `O Mercado Pago atingiu o limite temporário de movimentações para este reembolso. ` +
              `Aguarde cerca de ${waitText} e tente novamente. Não clique várias vezes seguidas.`,
            mercadoPagoCode:
              providerError.code || "too_many_requests",
            mercadoPagoHttpStatus:
              refund.response.status,
            retryAfterSeconds:
              retryAfterSeconds || 300,
          },
          429,
          {
            "Retry-After":
              String(retryAfterSeconds || 300),
          }
        );
      }

      const errorPrefix = providerError.code
        ? `${providerError.code}: `
        : "";

      return jsonResponse(
        request,
        {
          error:
            `O Mercado Pago não confirmou o reembolso: ` +
            `${errorPrefix}${providerError.friendly}`,
          mercadoPagoCode: providerError.code,
          mercadoPagoHttpStatus: refund.response.status,
        },
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
        refund_idempotency_key: refundIdempotencyKey,
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