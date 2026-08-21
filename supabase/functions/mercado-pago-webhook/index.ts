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
  customer_id: string | null;
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
  sale_notification_sent_at?: string | null;
  sale_notification_claimed_at?: string | null;
}


interface StaffProfile {
  email?: string | null;
  role?: string | null;
  status?: string | null;
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


function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoneyBRL(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

function paymentMethodLabel(value: unknown): string {
  const method = String(value || "").trim().toLowerCase();
  if (method === "pix") return "PIX";
  if (method === "card") return "Cartão de crédito";
  return method || "Não informado";
}

function formatDateTimeBR(value: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  } catch {
    return value.toISOString();
  }
}

async function claimSaleNotification(
  admin: AdminClient,
  orderId: string
): Promise<boolean> {
  const { data, error } = await admin.rpc("claim_sale_notification", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("Webhook: não foi possível reservar o envio do e-mail de venda:", error.code || "unknown");
    return false;
  }

  return data === true;
}

async function releaseSaleNotificationClaim(
  admin: AdminClient,
  orderId: string
): Promise<void> {
  const { error } = await admin
    .from("orders")
    .update({ sale_notification_claimed_at: null })
    .eq("id", orderId)
    .is("sale_notification_sent_at", null);

  if (error) {
    console.error("Webhook: não foi possível liberar reserva do e-mail de venda:", error.code || "unknown");
  }
}

function buildSaleEmailHtml(params: {
  orderNumber: string;
  total: number | string;
  paymentMethod: string;
  customerEmail: string;
  saleDate: string;
  adminUrl: string;
}) {
  const orderNumber = escapeHtml(params.orderNumber);
  const total = escapeHtml(formatMoneyBRL(params.total));
  const paymentMethod = escapeHtml(paymentMethodLabel(params.paymentMethod));
  const customerEmail = escapeHtml(params.customerEmail || "Não informado");
  const saleDate = escapeHtml(params.saleDate);
  const adminUrl = escapeHtml(params.adminUrl);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Nova venda confirmada</title>
  </head>
  <body style="margin:0;padding:0;background:#070707;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#070707;padding:32px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#111111;border:1px solid #2b2b2b;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="height:5px;background:#ff202b;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:34px 34px 12px 34px;text-align:center;">
                <div style="font-size:25px;font-weight:900;letter-spacing:-0.6px;color:#ffffff;">BROTHER'S <span style="color:#ff202b;">GAMES</span></div>
                <div style="margin-top:16px;color:#ff3942;font-size:11px;font-weight:900;letter-spacing:2px;">NOVA VENDA CONFIRMADA</div>
                <h1 style="margin:12px 0 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Pedido ${orderNumber}</h1>
                <p style="margin:12px auto 0 auto;max-width:470px;color:#a9a9b0;font-size:14px;line-height:1.65;">Uma nova venda foi aprovada com sucesso. O pedido já está disponível no painel administrativo.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px 8px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#171717;border:1px solid #2d2d2d;border-radius:13px;">
                  <tr><td style="padding:17px 18px;color:#8f8f98;font-size:12px;border-bottom:1px solid #292929;">PEDIDO</td><td align="right" style="padding:17px 18px;color:#ffffff;font-size:14px;font-weight:800;border-bottom:1px solid #292929;">${orderNumber}</td></tr>
                  <tr><td style="padding:17px 18px;color:#8f8f98;font-size:12px;border-bottom:1px solid #292929;">VALOR</td><td align="right" style="padding:17px 18px;color:#ff3942;font-size:17px;font-weight:900;border-bottom:1px solid #292929;">${total}</td></tr>
                  <tr><td style="padding:17px 18px;color:#8f8f98;font-size:12px;border-bottom:1px solid #292929;">PAGAMENTO</td><td align="right" style="padding:17px 18px;color:#ffffff;font-size:13px;font-weight:700;border-bottom:1px solid #292929;">${paymentMethod}</td></tr>
                  <tr><td style="padding:17px 18px;color:#8f8f98;font-size:12px;border-bottom:1px solid #292929;">CLIENTE</td><td align="right" style="padding:17px 18px;color:#ffffff;font-size:13px;font-weight:700;border-bottom:1px solid #292929;">${customerEmail}</td></tr>
                  <tr><td style="padding:17px 18px;color:#8f8f98;font-size:12px;">DATA</td><td align="right" style="padding:17px 18px;color:#ffffff;font-size:13px;font-weight:700;">${saleDate}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px 34px 34px;text-align:center;">
                <a href="${adminUrl}" style="display:inline-block;background:#ff202b;color:#ffffff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.6px;padding:15px 24px;border-radius:9px;">ABRIR PAINEL ADMINISTRATIVO</a>
                <p style="margin:20px 0 0 0;color:#66666f;font-size:11px;line-height:1.55;">Mensagem automática da BROTHER'S GAMES. Este e-mail foi enviado porque uma venda foi confirmada no sistema.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendSaleNotificationEmail(
  admin: AdminClient,
  localOrder: LocalOrder
): Promise<boolean> {
  const resendApiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  const fromEmail = String(Deno.env.get("SALE_EMAIL_FROM") || "").trim();
  const siteUrl = String(
    Deno.env.get("PUBLIC_SITE_URL") ||
      "https://brothers-games.brothersgames.workers.dev/"
  ).trim();

  if (!resendApiKey || !fromEmail) {
    console.error("Webhook: RESEND_API_KEY ou SALE_EMAIL_FROM ausente; e-mail de venda não enviado.");
    return false;
  }

  const { data: staffProfiles, error: staffError } = await admin
    .from("profiles")
    .select("email,role,status")
    .in("role", ["admin", "owner"]);

  if (staffError) {
    console.error("Webhook: erro buscando e-mails de OWNER/ADMIN:", staffError.code || "unknown");
    return false;
  }

  const staffList: StaffProfile[] = Array.isArray(staffProfiles)
    ? (staffProfiles as StaffProfile[])
    : [];

  const recipients = Array.from(
    new Set(
      staffList
        .filter((profile) => {
          const status = String(profile.status || "active").toLowerCase();
          return !["blocked", "banned"].includes(status);
        })
        .map((profile) => String(profile.email || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (!recipients.length) {
    console.error("Webhook: nenhum OWNER/ADMIN com e-mail foi encontrado.");
    return false;
  }

  let customerEmail = "Não informado";
  if (localOrder.customer_id) {
    const { data: customerProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", localOrder.customer_id)
      .maybeSingle();

    if (customerProfile?.email) {
      customerEmail = String(customerProfile.email);
    }
  }

  const saleDate = formatDateTimeBR(new Date());
  const adminUrl = `${siteUrl.replace(/\/+$/, "")}/`;
  const subject = `Nova venda confirmada — Pedido ${localOrder.order_number}`;

  const html = buildSaleEmailHtml({
    orderNumber: localOrder.order_number,
    total: localOrder.total,
    paymentMethod: localOrder.payment_method,
    customerEmail,
    saleDate,
    adminUrl,
  });

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html,
      }),
    });
  } catch {
    console.error("Webhook: falha de rede ao enviar e-mail de venda.");
    return false;
  }

  if (!response.ok) {
    let providerMessage = "";
    try {
      providerMessage = (await response.text()).slice(0, 500);
    } catch {
      providerMessage = "";
    }

    console.error("Webhook: Resend recusou o e-mail de venda", {
      httpStatus: response.status,
      providerMessage,
    });
    return false;
  }

  const sentAt = new Date().toISOString();
  const { error: markError } = await admin
    .from("orders")
    .update({
      sale_notification_sent_at: sentAt,
      sale_notification_claimed_at: null,
    })
    .eq("id", localOrder.id);

  if (markError) {
    console.error("Webhook: e-mail foi enviado, mas falhou ao marcar como enviado:", markError.code || "unknown");
  }

  const { error: eventError } = await admin.from("order_events").insert({
    order_id: localOrder.id,
    event_type: "sale_notification_email_sent",
    details: {
      recipients_count: recipients.length,
      provider: "resend",
      order_number: localOrder.order_number,
    },
  });

  if (eventError) {
    console.error("Webhook: falha gravando evento do e-mail de venda:", eventError.code || "unknown");
  }

  console.log("Webhook: e-mail de nova venda enviado", {
    orderNumber: localOrder.order_number,
    recipientsCount: recipients.length,
  });

  return true;
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
      cancelled_at,
      sale_notification_sent_at,
      sale_notification_claimed_at
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

    localOrder = byProvider.data || null;

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

    // Dispara uma única notificação de venda quando o pagamento fica aprovado.
    // O RPC faz a reserva atômica do envio para evitar duplicidade em webhooks repetidos.
    if (["paid", "processing", "completed"].includes(nextStatus)) {
      const claimed = await claimSaleNotification(admin, localOrder.id);

      if (claimed) {
        const sent = await sendSaleNotificationEmail(admin, {
          ...localOrder,
          status: nextStatus,
        });

        if (!sent) {
          await releaseSaleNotificationClaim(admin, localOrder.id);
        }
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
    })
  );

  return jsonResponse({ ok: true, received: true });
});
