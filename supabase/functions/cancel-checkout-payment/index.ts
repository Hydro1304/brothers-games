// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
type AdminClient = any;

interface CancelBody {
  orderId?: unknown;
}

interface ProviderPayment {
  id?: unknown;
  amount?: unknown;
  status?: unknown;
  status_detail?: unknown;
}

interface ProviderOrderData {
  status?: unknown;
  status_detail?: unknown;
  total_amount?: unknown;
  external_reference?: unknown;
  transactions?: { payments?: ProviderPayment[] };
}

interface LocalOrder {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_method: string;
  payment_provider: string | null;
  provider_order_id: string | null;
  payment_id: string | null;
  provider_amount: number | string | null;
  total: number | string;
  payment_environment: string | null;
  expires_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
}

/* =========================================================
   BROTHER'S GAMES
   cancel-checkout-payment — hardened

   Secrets/env esperados:
   - SUPABASE_URL
   - SUPABASE_SECRET_KEYS (ou SUPABASE_SERVICE_ROLE_KEY)
   - MERCADO_PAGO_ACCESS_TOKEN
   - ALLOWED_ORIGINS
========================================================= */

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

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

async function readJsonBody(request: Request, maxBytes = 16 * 1024): Promise<unknown> {
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

function priceToCents(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100);
}

function getProviderStatus(orderData: ProviderOrderData) {
  const payment = orderData?.transactions?.payments?.[0] || null;
  return {
    orderStatus: String(orderData?.status || "").trim().toLowerCase(),
    orderStatusDetail: String(orderData?.status_detail || "").trim(),
    payment,
    paymentStatus: String(payment?.status || "").trim().toLowerCase(),
    paymentStatusDetail: String(payment?.status_detail || "").trim(),
  };
}

function providerIsPaid(orderStatus: string, paymentStatus: string): boolean {
  return (
    ["processed", "approved"].includes(orderStatus) ||
    ["processed", "approved"].includes(paymentStatus)
  );
}

async function rateLimit(admin: AdminClient, userId: string): Promise<boolean> {
  const checks = [
    { key: `cancel:${userId}:minute`, window: 60, max: 10 },
    { key: `cancel:${userId}:hour`, window: 3600, max: 60 },
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

    if (!supabaseUrl || !supabaseSecretKey || !mercadoPagoToken) {
      console.error("Configuração obrigatória ausente em cancel-checkout-payment.");
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
        { error: "Sua sessão é inválida. Entre novamente." },
        401
      );
    }

    const user = authData.user;

    if (!(await rateLimit(admin, user.id))) {
      return jsonResponse(
        request,
        { error: "Muitas tentativas de cancelamento. Aguarde um pouco e tente novamente." },
        429,
        { "Retry-After": "60" }
      );
    }

    let body: CancelBody;
    try {
      body = (await readJsonBody(request)) as CancelBody;
    } catch (error) {
      if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
        return jsonResponse(request, { error: "Requisição muito grande." }, 413);
      }
      return jsonResponse(request, { error: "Corpo da requisição inválido." }, 400);
    }

    const orderId = String(body.orderId || "").trim();
    if (!UUID_RE.test(orderId)) {
      return jsonResponse(request, { error: "Pedido não informado ou inválido." }, 400);
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id,order_number,customer_id,status,payment_method,payment_provider,provider_order_id,payment_id,provider_amount,total,payment_environment,expires_at,paid_at,cancelled_at"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse(request, { error: "Pedido não encontrado." }, 404);
    }

    const localOrder = order as LocalOrder;

    if (localOrder.customer_id !== user.id) {
      return jsonResponse(request, { error: "Você não pode cancelar este pedido." }, 403);
    }

    if (localOrder.status === "cancelled") {
      return jsonResponse(request, {
        success: true,
        orderId: localOrder.id,
        orderNumber: localOrder.order_number,
        status: "cancelled",
        message: "O pedido já estava cancelado.",
      });
    }

    if (localOrder.status === "expired") {
      return jsonResponse(request, {
        success: true,
        orderId: localOrder.id,
        orderNumber: localOrder.order_number,
        status: "expired",
        message: "Este pedido já expirou.",
      });
    }

    if (["paid", "processing", "completed", "refunded"].includes(localOrder.status)) {
      return jsonResponse(
        request,
        {
          error:
            "Este pedido já foi pago ou processado e não pode ser cancelado por esta opção.",
        },
        409
      );
    }

    /* =====================================================
       Se existe Order no Mercado Pago, o provedor é sempre
       consultado ANTES de qualquer expiração/cancelamento local.
       Isso fecha a corrida: PIX pago no limite do vencimento.
    ===================================================== */
    if (localOrder.provider_order_id) {
      const providerId = String(localOrder.provider_order_id);
      let checkResponse;

      try {
        checkResponse = await fetch(
          `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${mercadoPagoToken}`,
            },
          }
        );
      } catch {
        return jsonResponse(
          request,
          { error: "Não foi possível confirmar o estado atual do pagamento. Tente novamente." },
          502
        );
      }

      let checkData = null;
      try {
        checkData = await checkResponse.json();
      } catch {
        checkData = null;
      }

      if (!checkResponse.ok || !checkData) {
        console.error("Falha consultando Mercado Pago antes do cancelamento:", {
          httpStatus: checkResponse.status,
          providerOrderId: providerId,
        });
        return jsonResponse(
          request,
          { error: "Não foi possível confirmar o estado atual do pagamento. Tente novamente." },
          502
        );
      }

      const {
        orderStatus,
        orderStatusDetail,
        payment,
        paymentStatus,
        paymentStatusDetail,
      } = getProviderStatus(checkData);

      const externalReference = String(checkData?.external_reference || "").trim();
      const providerTotalCents = priceToCents(checkData?.total_amount);
      const expectedProviderCents =
        localOrder.provider_amount === null || localOrder.provider_amount === undefined
          ? null
          : priceToCents(localOrder.provider_amount);

      if (externalReference && externalReference !== localOrder.order_number) {
        await admin.from("order_events").insert({
          order_id: localOrder.id,
          event_type: "cancel_integrity_rejected",
          details: {
            provider: "mercado_pago",
            provider_order_id: providerId,
            reason: "external_reference_mismatch",
          },
        });
        return jsonResponse(
          request,
          { error: "O pedido do provedor não corresponde ao pedido local. Cancelamento bloqueado." },
          409
        );
      }

      if (
        expectedProviderCents !== null &&
        providerTotalCents !== expectedProviderCents
      ) {
        await admin.from("order_events").insert({
          order_id: localOrder.id,
          event_type: "cancel_integrity_rejected",
          details: {
            provider: "mercado_pago",
            provider_order_id: providerId,
            reason: "provider_amount_mismatch",
          },
        });
        return jsonResponse(
          request,
          { error: "O valor do pagamento no provedor não corresponde ao pedido. Cancelamento bloqueado." },
          409
        );
      }

      const paymentId = payment?.id ? String(payment.id) : localOrder.payment_id;

      if (providerIsPaid(orderStatus, paymentStatus)) {
        const now = new Date().toISOString();

        await admin
          .from("orders")
          .update({
            status: "paid",
            payment_id: paymentId,
            paid_at: localOrder.paid_at || now,
            cancelled_at: null,
            payment_status_detail:
              paymentStatusDetail || orderStatusDetail || "processed",
          })
          .eq("id", localOrder.id);

        await admin.from("order_events").insert({
          order_id: localOrder.id,
          event_type: "payment_detected_before_cancel",
          details: {
            provider: "mercado_pago",
            provider_order_id: providerId,
            payment_id: paymentId,
            provider_status: orderStatus,
            payment_status: paymentStatus,
          },
        });

        return jsonResponse(
          request,
          {
            error: "Este pedido já foi pago e não pode mais ser cancelado.",
            status: "paid",
          },
          409
        );
      }

      if (["cancelled", "canceled"].includes(orderStatus)) {
        const now = new Date().toISOString();
        await admin
          .from("orders")
          .update({
            status: "cancelled",
            cancelled_at: now,
            payment_status_detail: orderStatusDetail || "cancelled",
          })
          .eq("id", localOrder.id);

        return jsonResponse(request, {
          success: true,
          orderId: localOrder.id,
          orderNumber: localOrder.order_number,
          status: "cancelled",
        });
      }

      if (orderStatus === "expired" || paymentStatus === "expired") {
        const now = new Date().toISOString();
        await admin
          .from("orders")
          .update({
            status: "expired",
            cancelled_at: now,
            payment_status_detail:
              paymentStatusDetail || orderStatusDetail || "expired",
          })
          .eq("id", localOrder.id);

        return jsonResponse(request, {
          success: true,
          orderId: localOrder.id,
          orderNumber: localOrder.order_number,
          status: "expired",
          message: "O pagamento já estava expirado no Mercado Pago.",
        });
      }

      const canCancelProvider = ["created", "action_required"].includes(orderStatus);
      if (!canCancelProvider) {
        return jsonResponse(
          request,
          {
            error:
              "O pagamento está sendo processado e não pode ser cancelado neste momento.",
            providerStatus: orderStatus || "unknown",
          },
          409
        );
      }

      let cancelResponse;
      try {
        cancelResponse = await fetch(
          `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerId)}/cancel`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${mercadoPagoToken}`,
              // Mesmo pedido = mesma operação de cancelamento = mesma chave.
              "X-Idempotency-Key": localOrder.id,
            },
            body: JSON.stringify({}),
          }
        );
      } catch {
        return jsonResponse(
          request,
          { error: "Não foi possível enviar o cancelamento ao Mercado Pago." },
          502
        );
      }

      let cancelData = null;
      try {
        cancelData = await cancelResponse.json();
      } catch {
        cancelData = null;
      }

      if (!cancelResponse.ok) {
        const detail = String(
          cancelData?.message ||
            cancelData?.error ||
            cancelData?.status_detail ||
            "cancel_failed"
        ).slice(0, 300);

        console.error("Mercado Pago não confirmou cancelamento:", {
          httpStatus: cancelResponse.status,
          providerOrderId: providerId,
          detail,
        });

        await admin.from("order_events").insert({
          order_id: localOrder.id,
          event_type: "cancel_failed",
          details: {
            provider: "mercado_pago",
            provider_order_id: providerId,
            http_status: cancelResponse.status,
            detail,
          },
        });

        return jsonResponse(
          request,
          { error: "O Mercado Pago não permitiu cancelar este pedido." },
          409
        );
      }

      const cancelledStatus = String(cancelData?.status || "cancelled");
      const cancelledDetail = String(
        cancelData?.status_detail || "cancelled_by_customer"
      ).slice(0, 300);
      const now = new Date().toISOString();

      const { error: updateError } = await admin
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: now,
          payment_status_detail: cancelledDetail,
        })
        .eq("id", localOrder.id)
        .eq("status", "pending_payment");

      if (updateError) {
        console.error("Cancelado no provedor, mas falhou atualização local:", updateError.code || "unknown");
        return jsonResponse(
          request,
          {
            error:
              "O Mercado Pago cancelou o pagamento, mas houve erro ao atualizar o pedido local.",
            providerStatus: cancelledStatus,
          },
          500
        );
      }

      await admin.from("order_events").insert({
        order_id: localOrder.id,
        event_type: "cancelled_by_customer",
        details: {
          provider: "mercado_pago",
          provider_order_id: providerId,
          provider_status: cancelledStatus,
          payment_method: localOrder.payment_method,
        },
      });

      return jsonResponse(request, {
        success: true,
        orderId: localOrder.id,
        orderNumber: localOrder.order_number,
        status: "cancelled",
        message: "Pedido cancelado com sucesso.",
      });
    }

    /* =====================================================
       Ainda não existe Order no Mercado Pago.
       Aqui sim é seguro decidir expiração apenas localmente.
    ===================================================== */
    if (localOrder.payment_method === "pix" && localOrder.expires_at) {
      const expiresAt = new Date(localOrder.expires_at).getTime();
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        const now = new Date().toISOString();

        await admin
          .from("orders")
          .update({
            status: "expired",
            payment_status_detail: "pix_expired",
            cancelled_at: now,
          })
          .eq("id", localOrder.id)
          .eq("status", "pending_payment");

        await admin.from("order_events").insert({
          order_id: localOrder.id,
          event_type: "pix_expired",
          details: { payment_method: "pix", local_only: true },
        });

        return jsonResponse(request, {
          success: true,
          orderId: localOrder.id,
          orderNumber: localOrder.order_number,
          status: "expired",
          message: "O prazo deste PIX terminou.",
        });
      }
    }

    const now = new Date().toISOString();
    const { error: localCancelError } = await admin
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: now,
        payment_status_detail: "cancelled_by_customer",
      })
      .eq("id", localOrder.id)
      .eq("status", "pending_payment");

    if (localCancelError) {
      console.error("Falha no cancelamento local:", localCancelError.code || "unknown");
      return jsonResponse(request, { error: "Não foi possível cancelar o pedido." }, 500);
    }

    await admin.from("order_events").insert({
      order_id: localOrder.id,
      event_type: "cancelled_by_customer",
      details: {
        provider_order_id: null,
        payment_method: localOrder.payment_method,
        local_only: true,
      },
    });

    return jsonResponse(request, {
      success: true,
      orderId: localOrder.id,
      orderNumber: localOrder.order_number,
      status: "cancelled",
      message: "Pedido cancelado com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT_UNAVAILABLE") {
      return jsonResponse(
        request,
        { error: "Proteção de segurança temporariamente indisponível. Tente novamente em instantes." },
        503
      );
    }

    console.error("cancel-checkout-payment: falha interna", {
      name: error instanceof Error ? error.name : "unknown",
    });

    return jsonResponse(request, { error: "Erro interno no servidor." }, 500);
  }
});
