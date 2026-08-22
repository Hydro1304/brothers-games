// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "npm:mercadopago@3.2.1";

// deno-lint-ignore no-explicit-any
type AdminClient = any;

interface WebhookBody {
  id?: unknown;
  type?: unknown;
  action?: unknown;
  live_mode?: unknown;
  application_id?: unknown;
  data?: { id?: unknown };
}

interface ProviderPayment {
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
  total: number | string;
  provider_amount: number | string | null;
  payment_environment: string | null;
  payment_status_detail: string | null;
  payment_id: string | null;
  provider_order_id: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
}

interface ProcessOrderNotificationParams {
  providerOrderId: string;
  notificationId: string | null;
  action: string | null;
  signatureEnvironment: string;
  liveMode: boolean | null;
  mercadoPagoAccessToken: string;
  supabaseUrl: string;
  supabaseSecretKey: string;
  resendApiKey: string;
  saleEmailFrom: string;
  saleNotificationEmail: string;
}

/* =========================================================
   BROTHER'S GAMES
   mercado-pago-webhook — hardened

   Deploy:
   npx supabase functions deploy mercado-pago-webhook --no-verify-jwt

   A autenticação deste endpoint é a assinatura x-signature
   do Mercado Pago. O endpoint NÃO usa JWT de cliente.
========================================================= */

const MAX_BODY_BYTES = 64 * 1024;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
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
      const parsed = JSON.parse(modernSecrets) as {
        default?: unknown;
      };
      if (typeof parsed?.default === "string" && parsed.default) {
        return parsed.default;
      }
    } catch {
      console.error("SUPABASE_SECRET_KEYS está em formato inválido.");
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}


function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

async function sendSaleNotificationEmail(
  admin: AdminClient,
  order: LocalOrder,
  resendApiKey: string,
  fromEmail: string,
  notificationEmail: string
): Promise<void> {
  if (
    !resendApiKey ||
    !fromEmail ||
    !notificationEmail
  ) {
    console.warn(
      "Webhook: e-mail de venda não configurado.",
      {
        hasResendApiKey: Boolean(resendApiKey),
        hasFromEmail: Boolean(fromEmail),
        hasNotificationEmail: Boolean(notificationEmail),
      }
    );
    return;
  }

  try {
    const { data: items, error: itemsError } =
      await admin
        .from("order_items")
        .select(
          "product_name, quantity, unit_price"
        )
        .eq("order_id", order.id);

    if (itemsError) {
      console.error(
        "Webhook: erro buscando itens para e-mail de venda:",
        itemsError.code || "unknown"
      );
    }

    const { data: customerProfile } =
      await admin
        .from("profiles")
        .select("name, full_name, email")
        .eq("id", order.customer_id)
        .maybeSingle();

    const customerName =
      String(
        customerProfile?.name ||
          customerProfile?.full_name ||
          "Cliente"
      ).trim() || "Cliente";

    const customerEmail =
      String(
        customerProfile?.email || ""
      ).trim();

    const itemsHtml =
      (items || [])
        .map(
          (item: {
            product_name?: string | null;
            quantity?: number | string | null;
            unit_price?: number | string | null;
          }) => `
            <tr>
              <td style="padding:8px 0;color:#f4f4f6;font-size:13px;">
                ${escapeHtml(item.quantity)}x ${escapeHtml(item.product_name)}
              </td>
              <td style="padding:8px 0;color:#f4f4f6;font-size:13px;text-align:right;">
                ${escapeHtml(
                  money(
                    Number(item.unit_price || 0) *
                      Number(item.quantity || 0)
                  )
                )}
              </td>
            </tr>
          `
        )
        .join("") ||
      `
        <tr>
          <td colspan="2" style="padding:8px 0;color:#8f8f98;font-size:13px;">
            Itens não disponíveis para exibição.
          </td>
        </tr>
      `;

    const subject =
      `NOVA VENDA • Pedido ${String(
        order.order_number || ""
      ).trim()}`;

    const html = `
<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#070708;
      font-family:Arial,Helvetica,sans-serif;
      color:#f5f5f7;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="padding:28px 14px;background:#070708;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width:620px;
              overflow:hidden;
              border:1px solid #242428;
              border-radius:18px;
              background:#0d0d0f;
            "
          >
            <tr>
              <td style="height:4px;background:#e50914;"></td>
            </tr>

            <tr>
              <td style="padding:30px 28px 8px;">
                <div
                  style="
                    font-size:22px;
                    font-weight:900;
                    letter-spacing:-.03em;
                  "
                >
                  BROTHER'S
                  <span style="color:#e50914;">
                    GAMES
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px 30px;">
                <div
                  style="
                    color:#ff4a54;
                    font-size:10px;
                    font-weight:900;
                    letter-spacing:.13em;
                    text-transform:uppercase;
                  "
                >
                  NOVA VENDA CONFIRMADA
                </div>

                <h1
                  style="
                    margin:10px 0 12px;
                    color:#ffffff;
                    font-size:28px;
                    line-height:1.15;
                  "
                >
                  Pagamento aprovado
                </h1>

                <p
                  style="
                    margin:0;
                    color:#b8b8c1;
                    font-size:15px;
                    line-height:1.65;
                  "
                >
                  Uma nova venda foi confirmada na BROTHER'S GAMES.
                </p>

                <div
                  style="
                    margin:22px 0;
                    padding:16px;
                    border:1px solid #29292f;
                    border-radius:12px;
                    background:#111114;
                  "
                >
                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Pedido:
                    <strong style="color:#fff;">
                      ${escapeHtml(order.order_number)}
                    </strong>
                  </div>

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Cliente:
                    <strong style="color:#fff;">
                      ${escapeHtml(customerName)}
                    </strong>
                  </div>

                  ${
                    customerEmail
                      ? `
                    <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                      E-mail:
                      <strong style="color:#fff;">
                        ${escapeHtml(customerEmail)}
                      </strong>
                    </div>
                  `
                      : ""
                  }

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Pagamento:
                    <strong style="color:#fff;">
                      ${escapeHtml(order.payment_method || "")}
                    </strong>
                  </div>

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Total:
                    <strong style="color:#fff;">
                      ${escapeHtml(money(order.total))}
                    </strong>
                  </div>
                </div>

                <div
                  style="
                    margin:20px 0;
                    padding:16px;
                    border:1px solid #29292f;
                    border-radius:12px;
                    background:#111114;
                  "
                >
                  <div
                    style="
                      font-size:10px;
                      color:#7f7f89;
                      font-weight:800;
                      letter-spacing:.09em;
                      text-transform:uppercase;
                      margin-bottom:8px;
                    "
                  >
                    Itens do pedido
                  </div>

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                  >
                    ${itemsHtml}
                  </table>
                </div>

                <p
                  style="
                    margin:22px 0 0;
                    color:#73737d;
                    font-size:11px;
                    line-height:1.55;
                  "
                >
                  Este é um aviso automático de nova venda.
                </p>
              </td>
            </tr>
          </table>

          <div
            style="
              max-width:620px;
              margin:14px auto 0;
              color:#5d5d66;
              font-size:10px;
              text-align:center;
            "
          >
            BROTHER'S GAMES • Notificação de venda
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${resendApiKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          subject,
          html,
        }),
      }
    );

    let resendData: {
      id?: string;
      message?: string;
      name?: string;
    } | null = null;

    try {
      resendData = await response.json();
    } catch {
      resendData = null;
    }

    if (!response.ok) {
      console.error(
        "Webhook: falha enviando e-mail de nova venda",
        {
          status: response.status,
          response: resendData,
        }
      );
      return;
    }

    console.log(
      "Webhook: e-mail de nova venda enviado",
      {
        orderNumber: order.order_number,
        to: notificationEmail,
        resendId: resendData?.id || null,
      }
    );

    await admin
      .from("order_events")
      .insert({
        order_id: order.id,
        event_type: "sale_notification_email_sent",
        details: {
          recipient: notificationEmail,
          resend_id: resendData?.id || null,
        },
      });
  } catch (error) {
    console.error(
      "Webhook: erro inesperado enviando e-mail de venda",
      {
        message:
          error instanceof Error
            ? error.message
            : "unknown",
      }
    );
  }
}


function priceToCents(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100);
}

function mapMercadoPagoOrderStatus(
  orderStatusRaw: unknown,
  orderStatusDetailRaw: unknown,
  paymentStatusRaw: unknown,
  paymentStatusDetailRaw: unknown
): string {
  const orderStatus = String(orderStatusRaw || "").trim().toLowerCase();
  const orderStatusDetail = String(orderStatusDetailRaw || "").trim().toLowerCase();
  const paymentStatus = String(paymentStatusRaw || "").trim().toLowerCase();
  const paymentStatusDetail = String(paymentStatusDetailRaw || "").trim().toLowerCase();

  if (
    ["processed", "approved"].includes(orderStatus) ||
    ["processed", "approved"].includes(paymentStatus)
  ) {
    return "paid";
  }

  if (
    orderStatus === "refunded" ||
    paymentStatus === "refunded" ||
    orderStatusDetail === "refunded" ||
    paymentStatusDetail === "refunded"
  ) {
    return "refunded";
  }

  if (orderStatus === "expired" || paymentStatus === "expired") {
    return "expired";
  }

  if (
    ["canceled", "cancelled", "failed", "rejected"].includes(orderStatus) ||
    ["canceled", "cancelled", "failed", "rejected"].includes(paymentStatus)
  ) {
    return "cancelled";
  }

  return "pending_payment";
}

async function webhookRateLimit(
  admin: AdminClient,
  providerOrderId: string
): Promise<boolean | null> {
  const { data, error } = await admin.rpc("check_edge_rate_limit", {
    p_key: `webhook:${providerOrderId}`,
    p_window_seconds: 300,
    p_max_requests: 30,
  });

  if (error) {
    console.error("Webhook: rate limit indisponível:", error.code || "unknown");
    return null;
  }

  return data === true;
}

async function recordIntegrityRejection(
  admin: AdminClient,
  localOrder: LocalOrder,
  providerOrderId: string,
  problems: string[],
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await admin.from("order_events").insert({
    order_id: localOrder.id,
    event_type: "payment_integrity_rejected",
    details: {
      provider: "mercado_pago",
      provider_order_id: providerOrderId,
      problems,
      ...metadata,
    },
  });

  if (error) {
    console.error("Webhook: falha gravando rejeição de integridade:", error.code || "unknown");
  }
}

async function processOrderNotification(
  params: ProcessOrderNotificationParams
): Promise<void> {
  const {
    providerOrderId,
    notificationId,
    action,
    signatureEnvironment,
    liveMode,
    mercadoPagoAccessToken,
    supabaseUrl,
    supabaseSecretKey,
    resendApiKey,
    saleEmailFrom,
    saleNotificationEmail,
  } = params;

  try {
    const admin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    let mercadoPagoResponse;
    try {
      mercadoPagoResponse = await fetch(
        `https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerOrderId)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${mercadoPagoAccessToken}`,
          },
        }
      );
    } catch {
      console.error("Webhook: Mercado Pago indisponível ao consultar order", {
        providerOrderId,
      });
      return;
    }

    let mercadoPagoOrder: ProviderOrderData | null = null;
    try {
      mercadoPagoOrder = (await mercadoPagoResponse.json()) as ProviderOrderData;
    } catch {
      mercadoPagoOrder = null;
    }

    if (!mercadoPagoResponse.ok || !mercadoPagoOrder) {
      console.error("Webhook: erro consultando order no Mercado Pago", {
        providerOrderId,
        httpStatus: mercadoPagoResponse.status,
      });
      return;
    }

    const providerPayment = mercadoPagoOrder?.transactions?.payments?.[0] || null;
    const providerOrderStatus = String(mercadoPagoOrder?.status || "");
    const providerOrderStatusDetail = String(mercadoPagoOrder?.status_detail || "");
    const providerPaymentStatus = String(providerPayment?.status || "");
    const providerPaymentStatusDetail = String(providerPayment?.status_detail || "");
    const mappedStatus = mapMercadoPagoOrderStatus(
      providerOrderStatus,
      providerOrderStatusDetail,
      providerPaymentStatus,
      providerPaymentStatusDetail
    );

    const externalReference = String(
      mercadoPagoOrder?.external_reference || ""
    ).trim();
    const providerTotalCents = priceToCents(mercadoPagoOrder?.total_amount);
    const providerPaymentAmountCents =
      providerPayment?.amount === null || providerPayment?.amount === undefined
        ? null
        : priceToCents(providerPayment.amount);
    const providerPaymentMethod = providerPayment?.payment_method || {};
    const providerPaymentMethodId = String(providerPaymentMethod?.id || "")
      .trim()
      .toLowerCase();
    const providerPaymentMethodType = String(providerPaymentMethod?.type || "")
      .trim()
      .toLowerCase();
    const paymentId = providerPayment?.id ? String(providerPayment.id) : null;
    const statusDetail =
      providerPaymentStatusDetail ||
      providerOrderStatusDetail ||
      providerPaymentStatus ||
      providerOrderStatus ||
      null;

    const selectColumns = `
      id,
      order_number,
      customer_id,
      status,
      payment_method,
      total,
      provider_amount,
      payment_environment,
      payment_status_detail,
      payment_id,
      provider_order_id,
      paid_at,
      cancelled_at
    `;

    let localOrder = null;

    const byProvider = await admin
      .from("orders")
      .select(selectColumns)
      .eq("provider_order_id", providerOrderId)
      .maybeSingle();

    if (byProvider.error) {
      console.error("Webhook: erro procurando provider_order_id:", byProvider.error.code || "unknown");
    }

    localOrder =
      (byProvider.data as LocalOrder | null) || null;

    if (!localOrder && externalReference) {
      const byReference = await admin
        .from("orders")
        .select(selectColumns)
        .eq("order_number", externalReference)
        .maybeSingle();

      if (byReference.error) {
        console.error("Webhook: erro procurando external_reference:", byReference.error.code || "unknown");
      }

      localOrder = (byReference.data as LocalOrder | null) || null;
    }

    if (!localOrder) {
      console.warn("Webhook: pedido local não encontrado", {
        providerOrderId,
        externalReference,
      });
      return;
    }

    const integrityProblems: string[] = [];

    if (!externalReference || externalReference !== localOrder.order_number) {
      integrityProblems.push("external_reference_mismatch");
    }

    if (
      localOrder.provider_order_id &&
      String(localOrder.provider_order_id) !== providerOrderId
    ) {
      integrityProblems.push("provider_order_id_mismatch");
    }

    const expectedProviderCents =
      localOrder.provider_amount === null || localOrder.provider_amount === undefined
        ? null
        : priceToCents(localOrder.provider_amount);

    // Pedidos novos sempre têm provider_amount. Para pedidos legados,
    // a checagem de valor é omitida e registrada nos logs de segurança.
    if (expectedProviderCents !== null) {
      if (providerTotalCents !== expectedProviderCents) {
        integrityProblems.push("total_amount_mismatch");
      }

      if (
        providerPaymentAmountCents !== null &&
        providerPaymentAmountCents !== expectedProviderCents
      ) {
        integrityProblems.push("payment_amount_mismatch");
      }
    }

    if (localOrder.payment_method === "pix") {
      if (providerPaymentMethodId && providerPaymentMethodId !== "pix") {
        integrityProblems.push("payment_method_mismatch");
      }
      if (
        providerPaymentMethodType &&
        providerPaymentMethodType !== "bank_transfer"
      ) {
        integrityProblems.push("payment_type_mismatch");
      }
    }

    if (localOrder.payment_method === "card") {
      if (
        providerPaymentMethodType &&
        providerPaymentMethodType !== "credit_card"
      ) {
        integrityProblems.push("payment_type_mismatch");
      }
    }

    const expectedEnvironment = String(localOrder.payment_environment || "").trim();

    if (
      expectedEnvironment &&
      signatureEnvironment !== "legacy" &&
      signatureEnvironment !== expectedEnvironment
    ) {
      integrityProblems.push("webhook_environment_mismatch");
    }

    if (expectedEnvironment && typeof liveMode === "boolean") {
      const shouldBeLive = expectedEnvironment === "production";
      if (liveMode !== shouldBeLive) {
        integrityProblems.push("live_mode_mismatch");
      }
    }

    if (integrityProblems.length) {
      console.error("Webhook: atualização financeira bloqueada por integridade", {
        orderNumber: localOrder.order_number,
        providerOrderId,
        problems: integrityProblems,
      });

      await recordIntegrityRejection(
        admin,
        localOrder,
        providerOrderId,
        integrityProblems,
        {
          notification_id: notificationId,
          action,
          signature_environment: signatureEnvironment,
        }
      );
      return;
    }

    let nextStatus = mappedStatus;

    // Uma consulta GET é feita no provedor, então o estado usado aqui é atual.
    // Ainda assim, não rebaixamos estados de venda concluída por estados pendentes.
    if (
      ["paid", "processing", "completed"].includes(localOrder.status) &&
      mappedStatus === "pending_payment"
    ) {
      nextStatus = localOrder.status;
    }

    if (localOrder.status === "refunded" && mappedStatus !== "refunded") {
      nextStatus = "refunded";
    }

    if (localOrder.status === "completed" && mappedStatus === "paid") {
      nextStatus = "completed";
    }

    const nowIso = new Date().toISOString();
    const updatePayload = {
      status: nextStatus,
      provider_order_id: providerOrderId,
      payment_id: paymentId || localOrder.payment_id || null,
      payment_status_detail: statusDetail,
      ...(nextStatus === "paid" && !localOrder.paid_at
        ? { paid_at: nowIso, cancelled_at: null }
        : {}),
      ...(["cancelled", "expired"].includes(nextStatus) &&
      !localOrder.cancelled_at
        ? { cancelled_at: nowIso }
        : {}),
      ...(providerPaymentMethod?.qr_code
        ? { pix_qr_code: providerPaymentMethod.qr_code }
        : {}),
      ...(providerPaymentMethod?.qr_code_base64
        ? { pix_qr_code_base64: providerPaymentMethod.qr_code_base64 }
        : {}),
      ...(providerPaymentMethod?.ticket_url
        ? { pix_ticket_url: providerPaymentMethod.ticket_url }
        : {}),
    };

    const changed =
      localOrder.status !== nextStatus ||
      String(localOrder.payment_status_detail || "") !== String(statusDetail || "") ||
      String(localOrder.payment_id || "") !== String(paymentId || "") ||
      String(localOrder.provider_order_id || "") !== providerOrderId;

    const { error: updateError } = await admin
      .from("orders")
      .update(updatePayload)
      .eq("id", localOrder.id);

    if (updateError) {
      console.error("Webhook: erro atualizando pedido local:", updateError.code || "unknown");
      return;
    }

    if (
      nextStatus === "paid" &&
      localOrder.status !== "paid"
    ) {
      await sendSaleNotificationEmail(
        admin,
        {
          ...localOrder,
          status: nextStatus,
        },
        resendApiKey,
        saleEmailFrom,
        saleNotificationEmail
      );
    }

    if (changed) {
      const { error: eventError } = await admin.from("order_events").insert({
        order_id: localOrder.id,
        event_type: "mercado_pago_webhook",
        details: {
          notification_id: notificationId,
          action,
          provider_order_id: providerOrderId,
          previous_status: localOrder.status,
          new_status: nextStatus,
          provider_order_status: providerOrderStatus,
          provider_order_status_detail: providerOrderStatusDetail,
          provider_payment_status: providerPaymentStatus,
          provider_payment_status_detail: providerPaymentStatusDetail,
          signature_environment: signatureEnvironment,
        },
      });

      if (eventError) {
        console.error("Webhook: erro gravando order_event:", eventError.code || "unknown");
      }
    }

    console.log("Webhook Mercado Pago processado:", {
      orderNumber: localOrder.order_number,
      providerOrderId,
      previousStatus: localOrder.status,
      newStatus: nextStatus,
      changed,
    });
  } catch (error) {
    console.error("Webhook: falha no processamento em background", {
      name: error instanceof Error ? error.name : "unknown",
    });
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseSecretKey = getSupabaseSecretKey();
  const resendApiKey = String(
    Deno.env.get("RESEND_API_KEY") || ""
  ).trim();
  const saleEmailFrom = String(
    Deno.env.get("SALE_EMAIL_FROM") || ""
  ).trim();
  const saleNotificationEmail = String(
    Deno.env.get("SALE_NOTIFICATION_EMAIL") || ""
  ).trim();
  const mercadoPagoAccessToken = String(
    Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || ""
  ).trim();
  const webhookSecretTest = String(
    Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET_TEST") || ""
  ).trim();
  const webhookSecretProd = String(
    Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET_PROD") || ""
  ).trim();
  const webhookSecretLegacy = String(
    Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET") || ""
  ).trim();

  const availableWebhookSecrets = [
    { environment: "test", secret: webhookSecretTest },
    { environment: "production", secret: webhookSecretProd },
    { environment: "legacy", secret: webhookSecretLegacy },
  ].filter(
    (item, index, array) =>
      Boolean(item.secret) &&
      array.findIndex((candidate) => candidate.secret === item.secret) === index
  );

  if (
    !supabaseUrl ||
    !supabaseSecretKey ||
    !mercadoPagoAccessToken ||
    availableWebhookSecrets.length === 0
  ) {
    console.error("Webhook: configuração obrigatória ausente.");
    return jsonResponse({ ok: false, error: "Configuração do servidor incompleta." }, 500);
  }

  let body;
  try {
    body = (await readJsonBody(request)) as WebhookBody;
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return jsonResponse({ ok: false, error: "Requisição muito grande." }, 413);
    }
    return jsonResponse({ ok: false, error: "JSON inválido." }, 400);
  }

  const xSignature = request.headers.get("x-signature") || "";
  const xRequestId = request.headers.get("x-request-id") || "";

  if (!xSignature || !xRequestId) {
    return jsonResponse({ ok: false, error: "Assinatura ausente." }, 401);
  }

  const url = new URL(request.url);
  const providerOrderId = String(
    url.searchParams.get("data.id") ||
      url.searchParams.get("data_id") ||
      body?.data?.id ||
      ""
  ).trim();

  if (!providerOrderId || providerOrderId.length > 150) {
    return jsonResponse({ ok: false, error: "data.id inválido." }, 400);
  }

  const possibleDataIds = [{ mode: "original", value: providerOrderId }];
  const lowercaseProviderOrderId = providerOrderId.toLowerCase();

  if (lowercaseProviderOrderId !== providerOrderId) {
    possibleDataIds.push({
      mode: "lowercase-data-id",
      value: lowercaseProviderOrderId,
    });
  }

  let signatureMatched = false;
  let signatureEnvironment = "";
  let signatureValidationMode = "";

  for (const secretCandidate of availableWebhookSecrets) {
    for (const dataIdCandidate of possibleDataIds) {
      try {
        WebhookSignatureValidator.validate({
          xSignature,
          xRequestId,
          dataId: dataIdCandidate.value,
          secret: secretCandidate.secret,
        });

        signatureMatched = true;
        signatureEnvironment = secretCandidate.environment;
        signatureValidationMode = dataIdCandidate.mode;
        break;
      } catch (error) {
        if (!(error instanceof InvalidWebhookSignatureError)) {
          console.error("Webhook: erro inesperado validando assinatura", {
            environment: secretCandidate.environment,
            validationMode: dataIdCandidate.mode,
            name: error instanceof Error ? error.name : "unknown",
          });
          return jsonResponse({ ok: false, error: "Falha ao validar assinatura." }, 500);
        }
      }
    }

    if (signatureMatched) break;
  }

  if (!signatureMatched) {
    console.warn("Webhook Mercado Pago rejeitado: assinatura inválida", {
      hasSignature: Boolean(xSignature),
      hasRequestId: Boolean(xRequestId),
      type: body?.type || null,
      action: body?.action || null,
    });
    return jsonResponse({ ok: false, error: "Assinatura inválida." }, 401);
  }

  const type = String(body?.type || "").trim().toLowerCase();
  if (type && type !== "order" && type !== "orders") {
    return jsonResponse({ ok: true, ignored: true });
  }

  const liveMode = typeof body?.live_mode === "boolean" ? body.live_mode : null;

  // Coerência entre secret usado e ambiente declarado no webhook.
  if (
    signatureEnvironment === "test" &&
    liveMode === true
  ) {
    return jsonResponse({ ok: false, error: "Ambiente do webhook inválido." }, 401);
  }

  if (
    signatureEnvironment === "production" &&
    liveMode === false
  ) {
    return jsonResponse({ ok: false, error: "Ambiente do webhook inválido." }, 401);
  }

  const admin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const allowed = await webhookRateLimit(admin, providerOrderId);
  if (allowed === null) {
    return jsonResponse({ ok: false, error: "Proteção temporariamente indisponível." }, 503);
  }
  if (!allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas notificações para esta order." },
      429
    );
  }

  const notificationId =
    body?.id === null || body?.id === undefined ? null : String(body.id).slice(0, 150);
  const action = body?.action ? String(body.action).slice(0, 150) : null;

  console.log("Webhook Mercado Pago: assinatura validada", {
    environment: signatureEnvironment,
    validationMode: signatureValidationMode,
    liveMode,
    type: type || null,
    action,
  });

  EdgeRuntime.waitUntil(
    processOrderNotification({
      providerOrderId,
      notificationId,
      action,
      signatureEnvironment,
      liveMode,
      mercadoPagoAccessToken,
      supabaseUrl,
      supabaseSecretKey,
      resendApiKey,
      saleEmailFrom,
      saleNotificationEmail,
    })
  );

  return jsonResponse({ ok: true, received: true });
});