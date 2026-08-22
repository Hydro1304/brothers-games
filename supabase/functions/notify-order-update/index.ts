// deno-lint-ignore-file no-explicit-any no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

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
      const parsed = JSON.parse(modern);
      if (
        typeof parsed?.default === "string" &&
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

function statusCopy({
  orderStatus,
  fulfillmentStatus,
  itemStatus,
  deliveryType,
}: {
  orderStatus: string;
  fulfillmentStatus: string;
  itemStatus: string;
  deliveryType: string;
}) {
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
        "Seu pedido recebeu uma atualização e foi encerrado. Você pode consultar os detalhes na sua conta.",
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
        "O pagamento está aprovado e nossa equipe está preparando a entrega digital. Avisaremos você novamente assim que ela for liberada.",
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
        "A entrega digital já está disponível em Meus Pedidos. Por segurança, chaves, links privados e credenciais não são enviados por e-mail.",
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
      "A equipe da BROTHER'S GAMES atualizou o andamento do seu pedido. Confira os detalhes mais recentes na sua conta.",
    accent: "#e50914",
  };
}

function buildEmail({
  buyerName,
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
}: any) {
  const itemBlock = productName
    ? `
      <div style="margin:20px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
        <div style="font-size:10px;color:#7f7f89;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px;">
          Item atualizado
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
                  Olá, ${escapeHtml(buyerName || "cliente")}. ${escapeHtml(copy.message)}
                </p>

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
                  VER MEU PEDIDO
                </a>

                <p style="margin:22px 0 0;color:#73737d;font-size:11px;line-height:1.55;">
                  Este é um e-mail automático de atualização do seu pedido.
                  Por segurança, chaves digitais, links privados e credenciais nunca são enviados por e-mail.
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:620px;margin:14px auto 0;color:#5d5d66;font-size:10px;text-align:center;">
            BROTHER'S GAMES • Atualizações de pedido
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
  const resendApiKey = String(
    Deno.env.get("RESEND_API_KEY") || ""
  ).trim();

  // Usa o MESMO remetente já usado no seu e-mail de venda.
  const fromEmail = String(
    Deno.env.get("SALE_EMAIL_FROM") ||
      Deno.env.get("ORDER_EMAIL_FROM") ||
      ""
  ).trim();

  const siteUrl = String(
    Deno.env.get("PUBLIC_SITE_URL") ||
      "https://brothers-games.brothersgames.workers.dev"
  ).trim();

  if (!supabaseUrl || !secretKey) {
    return jsonResponse(
      { ok: false, error: "SUPABASE_NOT_CONFIGURED" },
      503
    );
  }

  if (!resendApiKey || !fromEmail) {
    console.error(
      "notify-order-update: RESEND_API_KEY ou SALE_EMAIL_FROM ausente."
    );

    return jsonResponse(
      { ok: false, error: "EMAIL_NOT_CONFIGURED" },
      503
    );
  }

  const authorization =
    request.headers.get("Authorization") || "";
  const token = authorization
    .replace(/^Bearer\s+/i, "")
    .trim();

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

  const {
    data: callerProfile,
    error: callerError,
  } = await admin
    .from("profiles")
    .select("id,role,status")
    .eq("id", callerId)
    .maybeSingle();

  if (
    callerError ||
    !callerProfile ||
    !["owner", "admin"].includes(
      String(callerProfile.role || "")
    ) ||
    String(
      callerProfile.status || "active"
    ) !== "active"
  ) {
    return jsonResponse(
      { ok: false, error: "FORBIDDEN" },
      403
    );
  }

  let body: any;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "INVALID_JSON" },
      400
    );
  }

  const orderId =
    cleanText(body?.order_id, 80);
  const orderItemId =
    cleanText(body?.order_item_id, 80);
  const reason =
    cleanText(body?.reason, 80);

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
    data: buyerAuth,
    error: buyerAuthError,
  } = await admin.auth.admin.getUserById(
    order.customer_id
  );

  const buyerEmail =
    buyerAuth?.user?.email || "";

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

  let item: any = null;
  let fulfillment: any = null;

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
      .eq(
        "order_item_id",
        orderItemId
      )
      .maybeSingle();

    fulfillment =
      fulfillmentData || null;
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

  const copy = statusCopy({
    orderStatus:
      String(order.status || ""),
    fulfillmentStatus:
      String(
        order.fulfillment_status || ""
      ),
    itemStatus,
    deliveryType,
  });

  const subject =
    `BROTHER'S GAMES • ${copy.title} • ` +
    cleanText(
      order.order_number,
      80
    );

  const html = buildEmail({
    buyerName,
    orderNumber:
      cleanText(
        order.order_number,
        80
      ),
    total:
      Number(order.total || 0),
    copy,
    productName:
      cleanText(
        item?.product_name,
        180
      ),
    deliveryType,
    itemStatus,
    carrier:
      cleanText(
        fulfillment?.carrier,
        120
      ),
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
  });

  const response =
    await fetch(
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
          to: [buyerEmail],
          subject,
          html,
        }),
      }
    );

  let resendData: any = null;

  try {
    resendData =
      await response.json();
  } catch {
    resendData = null;
  }

  if (!response.ok) {
    console.error(
      "notify-order-update: erro Resend",
      {
        status: response.status,
        response: resendData,
      }
    );

    return jsonResponse(
      { ok: false, error: "EMAIL_SEND_FAILED" },
      502
    );
  }

  await admin
    .from("order_events")
    .insert({
      order_id: order.id,
      event_type:
        "buyer_email_notification",
      details: {
        reason,
        order_item_id:
          orderItemId || null,
        recipient: buyerEmail,
        resend_id:
          resendData?.id || null,
        sent_by: callerId,
      },
    });

  return jsonResponse({
    ok: true,
    sent: true,
    email_id:
      resendData?.id || null,
  });
});