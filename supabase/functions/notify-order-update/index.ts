// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

type ProfileRow = {
  id: string;
  role?: string | null;
  status?: string | null;
  name?: string | null;
  full_name?: string | null;
};

type EmailRecipient = {
  email: string;
  name: string;
  kind: "buyer" | "staff";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getSupabaseSecretKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (modern) {
    try {
      const parsed = JSON.parse(modern) as {
        default?: unknown;
      };

      if (
        typeof parsed.default === "string" &&
        parsed.default
      ) {
        return parsed.default;
      }
    } catch {
      console.error(
        "SUPABASE_SECRET_KEYS está em formato inválido."
      );
    }
  }

  return (
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );
}

function cleanText(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
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

function buyerCopy({
  reason,
  orderStatus,
  fulfillmentStatus,
  itemStatus,
  deliveryType,
}: {
  reason: string;
  orderStatus: string;
  fulfillmentStatus: string;
  itemStatus: string;
  deliveryType: string;
}) {
  if (reason === "order_created") {
    return {
      eyebrow: "PEDIDO RECEBIDO",
      title: "Recebemos seu pedido",
      message:
        "Seu pedido foi criado com sucesso. Você pode acompanhar o pagamento e todas as próximas etapas em Meus Pedidos.",
      accent: "#e50914",
    };
  }

  if (orderStatus === "refunded") {
    return {
      eyebrow: "REEMBOLSO",
      title: "Seu pedido foi reembolsado",
      message:
        "O reembolso foi processado. O prazo para o valor aparecer depende do método de pagamento e da instituição financeira.",
      accent: "#ffb020",
    };
  }

  if (
    orderStatus === "cancelled" ||
    orderStatus === "expired"
  ) {
    return {
      eyebrow: "PEDIDO ENCERRADO",
      title: "Seu pedido foi encerrado",
      message:
        "Seu pedido recebeu uma atualização e foi encerrado. Você pode consultar os detalhes em Meus Pedidos.",
      accent: "#ff5d65",
    };
  }

  if (
    deliveryType === "digital" &&
    itemStatus === "awaiting_delivery"
  ) {
    return {
      eyebrow: "ENTREGA DIGITAL",
      title: "Seu produto digital está sendo preparado",
      message:
        "O pagamento está aprovado e nossa equipe está preparando sua entrega digital. Avisaremos novamente assim que ela for liberada.",
      accent: "#58a9ff",
    };
  }

  if (
    deliveryType === "digital" &&
    itemStatus === "delivered"
  ) {
    return {
      eyebrow: "ENTREGA DIGITAL",
      title: "Seu produto digital foi liberado",
      message:
        "Sua entrega digital já está disponível em Meus Pedidos. Por segurança, chaves, links privados e credenciais não são enviados por e-mail.",
      accent: "#4fd07b",
    };
  }

  if (
    deliveryType === "physical" &&
    itemStatus === "preparing"
  ) {
    return {
      eyebrow: "PREPARANDO ENVIO",
      title: "Seu produto está sendo preparado",
      message:
        "Seu produto está sendo separado e preparado para envio. Você receberá outro aviso quando ele for postado.",
      accent: "#ff8b36",
    };
  }

  if (
    deliveryType === "physical" &&
    itemStatus === "shipped"
  ) {
    return {
      eyebrow: "PEDIDO ENVIADO",
      title: "Seu produto está a caminho",
      message:
        "Seu produto foi enviado. Confira abaixo as informações de rastreamento disponíveis.",
      accent: "#58a9ff",
    };
  }

  if (
    deliveryType === "physical" &&
    itemStatus === "delivered"
  ) {
    return {
      eyebrow: "ENTREGA CONCLUÍDA",
      title: "Seu produto foi entregue",
      message:
        "A entrega deste produto foi marcada como concluída. Se houver qualquer problema, use o suporte pós-venda em Meus Pedidos.",
      accent: "#4fd07b",
    };
  }

  if (fulfillmentStatus === "delivered") {
    return {
      eyebrow: "PEDIDO CONCLUÍDO",
      title: "Seu pedido foi entregue",
      message:
        "Todos os itens foram marcados como entregues. Obrigado por comprar na BROTHER'S GAMES.",
      accent: "#4fd07b",
    };
  }

  if (fulfillmentStatus === "shipped") {
    return {
      eyebrow: "EM TRANSPORTE",
      title: "Seu pedido está em transporte",
      message:
        "Seu pedido avançou para a etapa de envio. Você pode acompanhar os detalhes em Meus Pedidos.",
      accent: "#58a9ff",
    };
  }

  return {
    eyebrow: "ATUALIZAÇÃO DO PEDIDO",
    title: "Tem novidade no seu pedido",
    message:
      "A equipe da BROTHER'S GAMES atualizou o andamento do seu pedido. Confira os detalhes mais recentes em Meus Pedidos.",
    accent: "#e50914",
  };
}

function staffCopy({
  reason,
  orderStatus,
  itemStatus,
  deliveryType,
}: {
  reason: string;
  orderStatus: string;
  itemStatus: string;
  deliveryType: string;
}) {
  if (reason === "order_created") {
    return {
      eyebrow: "NOVO PEDIDO",
      title: "Um novo pedido foi criado",
      message:
        "Um cliente finalizou a criação de um pedido. Acompanhe o pagamento e o processamento pelo painel administrativo.",
      accent: "#e50914",
    };
  }

  if (orderStatus === "refunded") {
    return {
      eyebrow: "REEMBOLSO",
      title: "Pedido reembolsado",
      message:
        "Um pedido foi atualizado para reembolsado. O registro já está disponível no painel administrativo.",
      accent: "#ffb020",
    };
  }

  if (
    orderStatus === "cancelled" ||
    orderStatus === "expired"
  ) {
    return {
      eyebrow: "PEDIDO ENCERRADO",
      title: "Pedido encerrado",
      message:
        "Um pedido foi encerrado. Consulte o histórico e os detalhes no painel administrativo.",
      accent: "#ff5d65",
    };
  }

  const deliveryLabel =
    deliveryType === "digital"
      ? "produto digital"
      : deliveryType === "physical"
        ? "produto físico"
        : "pedido";

  const statusLabel = {
    awaiting_delivery: "aguardando entrega digital",
    preparing: "preparando envio",
    shipped: "enviado",
    delivered: "entregue",
  }[itemStatus] || "atualizado";

  return {
    eyebrow: "ATUALIZAÇÃO OPERACIONAL",
    title: "Status de pedido atualizado",
    message:
      `O ${deliveryLabel} foi marcado como ${statusLabel}. A atualização já está registrada no painel.`,
    accent:
      itemStatus === "delivered"
        ? "#4fd07b"
        : itemStatus === "shipped"
          ? "#58a9ff"
          : "#e50914",
  };
}

function buildEmail({
  recipientName,
  orderNumber,
  total,
  copy,
  productName,
  deliveryType,
  itemStatus,
  carrier,
  trackingCode,
  trackingUrl,
  siteUrl,
  staffMode,
  buyerName,
}: {
  recipientName: string;
  orderNumber: string;
  total: number;
  copy: {
    eyebrow: string;
    title: string;
    message: string;
    accent: string;
  };
  productName: string;
  deliveryType: string;
  itemStatus: string;
  carrier: string;
  trackingCode: string;
  trackingUrl: string;
  siteUrl: string;
  staffMode: boolean;
  buyerName: string;
}) {
  const itemBlock = productName
    ? `
      <div style="margin:20px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
        <div style="font-size:10px;color:#7f7f89;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px;">
          ${staffMode ? "Item atualizado" : "Produto"}
        </div>
        <div style="font-size:15px;color:#fff;font-weight:800;">
          ${escapeHtml(productName)}
        </div>
        ${
          deliveryType
            ? `<div style="margin-top:7px;color:#9b9ba5;font-size:12px;">
                 Tipo de entrega:
                 <strong style="color:#dadade;">
                   ${deliveryType === "digital" ? "Digital" : "Física"}
                 </strong>
               </div>`
            : ""
        }
      </div>`
    : "";

  const trackingBlock =
    deliveryType === "physical" &&
    ["shipped", "delivered"].includes(itemStatus)
      ? `
      <div style="margin:20px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
        <div style="font-size:10px;color:#7f7f89;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:9px;">
          Rastreamento
        </div>
        ${
          carrier
            ? `<div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                 Transportadora:
                 <strong style="color:#fff;">${escapeHtml(carrier)}</strong>
               </div>`
            : ""
        }
        ${
          trackingCode
            ? `<div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                 Código:
                 <strong style="color:#fff;">${escapeHtml(trackingCode)}</strong>
               </div>`
            : ""
        }
        ${
          trackingUrl
            ? `<a href="${escapeHtml(trackingUrl)}"
                  style="display:inline-block;margin-top:10px;color:#ff4b55;text-decoration:none;font-size:12px;font-weight:900;">
                 RASTREAR ENCOMENDA →
               </a>`
            : ""
        }
      </div>`
      : "";

  const staffBuyerBlock =
    staffMode && buyerName
      ? `
      <div style="margin:20px 0;padding:14px 16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
        <span style="color:#85858f;font-size:12px;">Cliente:</span>
        <strong style="margin-left:6px;color:#fff;font-size:13px;">
          ${escapeHtml(buyerName)}
        </strong>
      </div>`
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#070708;font-family:Arial,Helvetica,sans-serif;color:#f5f5f7;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;background:#070708;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:620px;overflow:hidden;border:1px solid #242428;border-radius:18px;background:#0d0d0f;">
            <tr>
              <td style="height:4px;background:${copy.accent};"></td>
            </tr>

            <tr>
              <td style="padding:30px 28px 8px;">
                <div style="font-size:22px;font-weight:900;letter-spacing:-.03em;">
                  BROTHER'S <span style="color:#e50914;">GAMES</span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px 30px;">
                <div style="color:${copy.accent};font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;">
                  ${escapeHtml(copy.eyebrow)}
                </div>

                <h1 style="margin:10px 0 12px;color:#fff;font-size:28px;line-height:1.15;">
                  ${escapeHtml(copy.title)}
                </h1>

                <p style="margin:0;color:#b8b8c1;font-size:15px;line-height:1.65;">
                  Olá, ${escapeHtml(recipientName || (staffMode ? "equipe" : "cliente"))}. ${escapeHtml(copy.message)}
                </p>

                ${staffBuyerBlock}

                <div style="margin:22px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
                  <div style="display:flex;justify-content:space-between;gap:12px;">
                    <span style="color:#85858f;font-size:12px;">Pedido</span>
                    <strong style="color:#fff;font-size:13px;">${escapeHtml(orderNumber)}</strong>
                  </div>
                  <div style="display:flex;justify-content:space-between;gap:12px;margin-top:9px;">
                    <span style="color:#85858f;font-size:12px;">Total</span>
                    <strong style="color:#fff;font-size:13px;">${escapeHtml(money(total))}</strong>
                  </div>
                </div>

                ${itemBlock}
                ${trackingBlock}

                <a href="${escapeHtml(siteUrl)}"
                  style="display:inline-block;margin-top:4px;padding:13px 18px;border-radius:10px;background:#e50914;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.04em;">
                  ${staffMode ? "ABRIR PAINEL / SITE" : "VER MEU PEDIDO"}
                </a>

                <p style="margin:22px 0 0;color:#73737d;font-size:11px;line-height:1.55;">
                  Este é um e-mail automático da BROTHER'S GAMES.
                  Por segurança, chaves digitais, links privados e credenciais nunca são enviados por e-mail.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}


type EmailProviderResult = {
  ok: boolean;
  provider: "brevo" | "resend" | "none";
  status?: number;
  id?: string | null;
  error?: string | null;
};

function parseResendFrom(value: string) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(.*)<([^>]+)>$/);

  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, "") || "BROTHER'S GAMES",
      email: match[2].trim(),
    };
  }

  return {
    name: "BROTHER'S GAMES",
    email: raw,
  };
}

async function sendTransactionalEmail({
  to,
  toName,
  subject,
  html,
}: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}): Promise<EmailProviderResult> {
  const brevoApiKey = String(
    Deno.env.get("BREVO_API_KEY") || ""
  ).trim();

  const brevoSenderEmail = String(
    Deno.env.get("BREVO_SENDER_EMAIL") || ""
  ).trim();

  const brevoSenderName = String(
    Deno.env.get("BREVO_SENDER_NAME") ||
      "BROTHER'S GAMES"
  ).trim();

  if (brevoApiKey && brevoSenderEmail) {
    try {
      const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: brevoSenderName,
              email: brevoSenderEmail,
            },
            to: [
              {
                email: to,
                name: toName || undefined,
              },
            ],
            subject,
            htmlContent: html,
          }),
        }
      );

      let data: {
        messageId?: string;
        message?: string;
        code?: string;
      } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok) {
        return {
          ok: true,
          provider: "brevo",
          status: response.status,
          id: data?.messageId || null,
        };
      }

      console.error("E-mail Brevo recusado:", {
        recipient: to,
        status: response.status,
        response: data,
      });

      console.warn(
        "Brevo falhou; tentando fallback pelo Resend.",
        {
          recipient: to,
          status: response.status,
          error:
            data?.message ||
            data?.code ||
            `HTTP ${response.status}`,
        }
      );
    } catch (error) {
      console.error("Erro chamando Brevo:", {
        recipient: to,
        error:
          error instanceof Error
            ? error.message
            : "unknown",
      });

      console.warn(
        "Brevo indisponível; tentando fallback pelo Resend.",
        {
          recipient: to,
          error:
            error instanceof Error
              ? error.message
              : "BREVO_REQUEST_FAILED",
        }
      );
    }
  }

  // Fallback: mantém Resend funcionando caso já esteja configurado.
  const resendApiKey = String(
    Deno.env.get("RESEND_API_KEY") || ""
  ).trim();

  const resendFrom = String(
    Deno.env.get("SALE_EMAIL_FROM") ||
      Deno.env.get("ORDER_EMAIL_FROM") ||
      ""
  ).trim();

  if (resendApiKey && resendFrom) {
    try {
      const from = parseResendFrom(resendFrom);

      const response = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${from.name} <${from.email}>`,
            to: [to],
            subject,
            html,
          }),
        }
      );

      let data: {
        id?: string;
        message?: string;
        name?: string;
      } | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok) {
        return {
          ok: true,
          provider: "resend",
          status: response.status,
          id: data?.id || null,
        };
      }

      console.error("E-mail Resend recusado:", {
        recipient: to,
        status: response.status,
        response: data,
      });

      return {
        ok: false,
        provider: "resend",
        status: response.status,
        error:
          data?.message ||
          data?.name ||
          `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        provider: "resend",
        error:
          error instanceof Error
            ? error.message
            : "RESEND_REQUEST_FAILED",
      };
    }
  }

  return {
    ok: false,
    provider: "none",
    error: "EMAIL_PROVIDER_NOT_CONFIGURED",
  };
}


Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { ok: false, error: "METHOD_NOT_ALLOWED" },
      405
    );
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL") || "";
  const secretKey =
    getSupabaseSecretKey();
  const resendApiKey =
    String(Deno.env.get("RESEND_API_KEY") || "").trim();
  const fromEmail =
    String(
      Deno.env.get("SALE_EMAIL_FROM") ||
        Deno.env.get("ORDER_EMAIL_FROM") ||
        ""
    ).trim();
  const fallbackStaffEmail =
    String(
      Deno.env.get("SALE_NOTIFICATION_EMAIL") || ""
    ).trim();
  const siteUrl =
    String(
      Deno.env.get("PUBLIC_SITE_URL") ||
        "https://brothers-games.brothersgames.workers.dev"
    ).trim();

  if (!supabaseUrl || !secretKey) {
    return jsonResponse(
      { ok: false, error: "SUPABASE_NOT_CONFIGURED" },
      503
    );
  }

  const hasBrevo =
    Boolean(String(Deno.env.get("BREVO_API_KEY") || "").trim()) &&
    Boolean(String(Deno.env.get("BREVO_SENDER_EMAIL") || "").trim());

  const hasResend =
    Boolean(resendApiKey) &&
    Boolean(fromEmail);

  if (!hasBrevo && !hasResend) {
    return jsonResponse(
      { ok: false, error: "EMAIL_NOT_CONFIGURED" },
      503
    );
  }

  const authorization =
    request.headers.get("Authorization") || "";
  const token =
    authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return jsonResponse(
      { ok: false, error: "AUTH_REQUIRED" },
      401
    );
  }

  const admin = createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const {
    data: authData,
    error: authError,
  } = await admin.auth.getUser(token);

  if (authError || !authData?.user?.id) {
    return jsonResponse(
      { ok: false, error: "INVALID_AUTH" },
      401
    );
  }

  const callerId = authData.user.id;

  let body: {
    order_id?: unknown;
    order_item_id?: unknown;
    reason?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "INVALID_JSON" },
      400
    );
  }

  const orderId =
    cleanText(body.order_id, 80);
  const orderItemId =
    cleanText(body.order_item_id, 80);
  const reason =
    cleanText(body.reason, 80);

  if (!orderId) {
    return jsonResponse(
      { ok: false, error: "ORDER_REQUIRED" },
      400
    );
  }

  const {
    data: order,
    error: orderError,
  } = await admin
    .from("orders")
    .select(
      "id,order_number,customer_id,status,total,fulfillment_status"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return jsonResponse(
      { ok: false, error: "ORDER_NOT_FOUND" },
      404
    );
  }

  const {
    data: callerProfile,
  } = await admin
    .from("profiles")
    .select("id,role,status")
    .eq("id", callerId)
    .maybeSingle();

  const callerIsStaff =
    Boolean(callerProfile) &&
    ["owner", "admin"].includes(
      String(callerProfile?.role || "")
    ) &&
    String(
      callerProfile?.status || "active"
    ) === "active";

  const callerOwnsOrder =
    order.customer_id === callerId;

  if (reason === "order_created") {
    if (!callerOwnsOrder && !callerIsStaff) {
      return jsonResponse(
        { ok: false, error: "FORBIDDEN" },
        403
      );
    }

    const {
      data: existing,
    } = await admin
      .from("order_events")
      .select("id")
      .eq("order_id", order.id)
      .eq(
        "event_type",
        "order_created_email_notification"
      )
      .limit(1);

    if (existing?.length) {
      return jsonResponse({
        ok: true,
        skipped: true,
        reason: "ALREADY_SENT",
      });
    }
  } else if (!callerIsStaff) {
    return jsonResponse(
      { ok: false, error: "FORBIDDEN" },
      403
    );
  }

  const {
    data: buyerAuth,
    error: buyerAuthError,
  } = await admin.auth.admin.getUserById(
    order.customer_id
  );

  const buyerEmail =
    cleanText(
      buyerAuth?.user?.email || "",
      180
    ).toLowerCase();

  if (
    buyerAuthError ||
    !buyerEmail
  ) {
    return jsonResponse(
      { ok: false, error: "BUYER_EMAIL_NOT_FOUND" },
      404
    );
  }

  const {
    data: buyerProfile,
  } = await admin
    .from("profiles")
    .select("name,full_name")
    .eq("id", order.customer_id)
    .maybeSingle();

  const buyerName =
    cleanText(
      buyerProfile?.name ||
        buyerProfile?.full_name ||
        buyerAuth.user.user_metadata?.name ||
        buyerAuth.user.user_metadata?.full_name ||
        buyerEmail.split("@")[0] ||
        "cliente",
      120
    );

  let item: {
    id?: string;
    product_name?: string | null;
    delivery_type?: string | null;
  } | null = null;

  let fulfillment: {
    status?: string | null;
    delivery_type?: string | null;
    carrier?: string | null;
    tracking_code?: string | null;
    tracking_url?: string | null;
  } | null = null;

  if (orderItemId) {
    const {
      data: itemData,
      error: itemError,
    } = await admin
      .from("order_items")
      .select(
        "id,order_id,product_name,delivery_type"
      )
      .eq("id", orderItemId)
      .eq("order_id", orderId)
      .maybeSingle();

    if (itemError || !itemData) {
      return jsonResponse(
        { ok: false, error: "ORDER_ITEM_NOT_FOUND" },
        404
      );
    }

    item = itemData;

    const {
      data: fulfillmentData,
    } = await admin
      .from("order_item_fulfillments")
      .select(
        "status,delivery_type,carrier,tracking_code,tracking_url"
      )
      .eq("order_item_id", orderItemId)
      .maybeSingle();

    fulfillment = fulfillmentData || null;
  }

  const deliveryType =
    cleanText(
      fulfillment?.delivery_type ||
        item?.delivery_type,
      20
    );

  const itemStatus =
    cleanText(
      fulfillment?.status,
      40
    );

  const buyerEmailCopy = buyerCopy({
    reason,
    orderStatus:
      String(order.status || ""),
    fulfillmentStatus:
      String(order.fulfillment_status || ""),
    itemStatus,
    deliveryType,
  });

  const staffEmailCopy = staffCopy({
    reason,
    orderStatus:
      String(order.status || ""),
    itemStatus,
    deliveryType,
  });

  const {
    data: staffData,
  } = await admin
    .from("profiles")
    .select("id,role,status,name,full_name")
    .in("role", ["owner", "admin"])
    .eq("status", "active");

  const recipients = new Map<
    string,
    EmailRecipient
  >();

  recipients.set(buyerEmail, {
    email: buyerEmail,
    name: buyerName,
    kind: "buyer",
  });

  for (
    const profile of
      ((staffData || []) as ProfileRow[])
  ) {
    try {
      const {
        data: staffAuth,
      } = await admin.auth.admin.getUserById(
        profile.id
      );

      const email =
        cleanText(
          staffAuth?.user?.email || "",
          180
        ).toLowerCase();

      if (!email || email === buyerEmail) {
        continue;
      }

      recipients.set(email, {
        email,
        name:
          cleanText(
            profile.name ||
              profile.full_name ||
              "Admin",
            120
          ) || "Admin",
        kind: "staff",
      });
    } catch (error) {
      console.error(
        "notify-order-update: não foi possível obter e-mail de staff",
        {
          userId: profile.id,
          error:
            error instanceof Error
              ? error.message
              : "unknown",
        }
      );
    }
  }

  if (fallbackStaffEmail) {
    const fallback =
      fallbackStaffEmail.toLowerCase();

    if (
      fallback !== buyerEmail &&
      !recipients.has(fallback)
    ) {
      recipients.set(fallback, {
        email: fallback,
        name: "Equipe BROTHER'S GAMES",
        kind: "staff",
      });
    }
  }

  const sent: string[] = [];
  const failed: string[] = [];
  let buyerSent = false;
  let buyerFailure: {
    provider: string;
    status: number | null;
    error: string | null;
  } | null = null;

  // Envia primeiro para o comprador e valida separadamente.
  // Assim, o sistema não considera a notificação "bem-sucedida"
  // só porque o e-mail da loja chegou.
  const orderedRecipients = [
    ...Array.from(recipients.values()).filter(
      (recipient) => recipient.kind === "buyer"
    ),
    ...Array.from(recipients.values()).filter(
      (recipient) => recipient.kind === "staff"
    ),
  ];

  for (const recipient of orderedRecipients) {
    const copy =
      recipient.kind === "buyer"
        ? buyerEmailCopy
        : staffEmailCopy;

    const subject =
      `BROTHER'S GAMES • ${copy.title} • ` +
      cleanText(order.order_number, 80);

    const html = buildEmail({
      recipientName: recipient.name,
      orderNumber:
        cleanText(order.order_number, 80),
      total:
        Number(order.total || 0),
      copy,
      productName:
        cleanText(item?.product_name, 180),
      deliveryType,
      itemStatus,
      carrier:
        cleanText(fulfillment?.carrier, 120),
      trackingCode:
        cleanText(
          fulfillment?.tracking_code,
          180
        ),
      trackingUrl:
        cleanText(
          fulfillment?.tracking_url,
          1000
        ),
      siteUrl,
      staffMode:
        recipient.kind === "staff",
      buyerName,
    });

    console.log(
      "notify-order-update: enviando e-mail",
      {
        recipient: recipient.email,
        kind: recipient.kind,
        orderNumber: order.order_number,
        reason,
      }
    );

    const result =
      await sendTransactionalEmail({
        to: recipient.email,
        toName: recipient.name,
        subject,
        html,
      });

    if (result.ok) {
      sent.push(recipient.email);

      if (recipient.kind === "buyer") {
        buyerSent = true;
      }

      console.log(
        "notify-order-update: e-mail enviado",
        {
          recipient: recipient.email,
          kind: recipient.kind,
          provider: result.provider,
          status: result.status || null,
        }
      );
    } else {
      failed.push(recipient.email);

      if (recipient.kind === "buyer") {
        buyerFailure = {
          provider: result.provider,
          status: result.status || null,
          error: result.error || null,
        };
      }

      console.error(
        "notify-order-update: falha no envio",
        {
          recipient: recipient.email,
          kind: recipient.kind,
          provider: result.provider,
          status: result.status || null,
          error: result.error || null,
        }
      );
    }
  }

  const eventType =
    reason === "order_created"
      ? "order_created_email_notification"
      : "order_update_email_notification";

  await admin
    .from("order_events")
    .insert({
      order_id: order.id,
      event_type: eventType,
      details: {
        reason,
        order_item_id:
          orderItemId || null,
        sent,
        failed,
        sent_by: callerId,
      },
    });

  // O comprador é obrigatório. Antes, bastava o e-mail da loja
  // chegar para a função retornar sucesso, mascarando a falha do cliente.
  if (!buyerSent) {
    return jsonResponse(
      {
        ok: false,
        error: "BUYER_EMAIL_SEND_FAILED",
        buyer_email: buyerEmail,
        buyer_failure: buyerFailure,
        sent,
        failed,
      },
      502
    );
  }

  return jsonResponse({
    ok: true,
    buyer_sent: true,
    buyer_email: buyerEmail,
    sent,
    failed,
  });
});