// deno-lint-ignore-file no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2";

type ProfileRow = {
  id: string;
  role?: string | null;
  status?: string | null;
  name?: string | null;
  full_name?: string | null;
};

type IssueRow = {
  id: string;
  order_id: string;
  customer_id: string;
  description?: string | null;
  status?: string | null;
  image_path?: string | null;
  created_at?: string | null;
};

type OrderRow = {
  id: string;
  order_number?: string | null;
  total?: number | null;
  customer_id: string;
};

const LIVE_SITE =
  "https://brothers-games.brothersgames.workers.dev";

const LOCAL_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  LIVE_SITE,
]);

function configuredOrigins() {
  const values = String(
    Deno.env.get("ALLOWED_ORIGINS") || ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const publicSite = String(
    Deno.env.get("PUBLIC_SITE_URL") || ""
  ).trim();

  if (publicSite) {
    values.push(publicSite.replace(/\/$/, ""));
  }

  return [...new Set(values)];
}

function isOriginAllowed(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  return (
    LOCAL_ORIGINS.has(origin) ||
    configuredOrigins().includes(origin)
  );
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin =
    origin && isOriginAllowed(request)
      ? origin
      : LIVE_SITE;

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
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value: unknown, max = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function money(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function buildEmail(params: {
  staffName: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
  issueDescription: string;
  issueId: string;
  siteUrl: string;
}) {
  const {
    staffName,
    customerName,
    customerEmail,
    orderNumber,
    total,
    issueDescription,
    issueId,
    siteUrl,
  } = params;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#070708;font-family:Arial,Helvetica,sans-serif;color:#f5f5f7;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;background:#070708;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:620px;overflow:hidden;border:1px solid #242428;border-radius:18px;background:#0d0d0f;">
            <tr>
              <td style="height:4px;background:#e50914;"></td>
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
                <div style="color:#ff4a54;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;">
                  NOVA RECLAMAÇÃO
                </div>

                <h1 style="margin:10px 0 12px;color:#fff;font-size:28px;line-height:1.15;">
                  Um cliente abriu um chamado
                </h1>

                <p style="margin:0;color:#b8b8c1;font-size:15px;line-height:1.65;">
                  Olá, ${escapeHtml(staffName || "equipe")}. Um comprador abriu uma nova solicitação de suporte e ela já está disponível no painel administrativo.
                </p>

                <div style="margin:22px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Pedido:
                    <strong style="color:#fff;">${escapeHtml(orderNumber)}</strong>
                  </div>

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Cliente:
                    <strong style="color:#fff;">${escapeHtml(customerName)}</strong>
                  </div>

                  ${
                    customerEmail
                      ? `<div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                           E-mail:
                           <strong style="color:#fff;">${escapeHtml(customerEmail)}</strong>
                         </div>`
                      : ""
                  }

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Total do pedido:
                    <strong style="color:#fff;">${escapeHtml(money(total))}</strong>
                  </div>

                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Chamado:
                    <strong style="color:#fff;">${escapeHtml(issueId)}</strong>
                  </div>
                </div>

                <div style="margin:20px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
                  <div style="font-size:10px;color:#7f7f89;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px;">
                    Descrição do cliente
                  </div>

                  <div style="color:#f2f2f5;font-size:14px;line-height:1.65;white-space:pre-wrap;">
                    ${escapeHtml(issueDescription)}
                  </div>
                </div>

                <a href="${escapeHtml(siteUrl)}"
                  style="display:inline-block;margin-top:4px;padding:13px 18px;border-radius:10px;background:#e50914;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.04em;">
                  ABRIR PAINEL ADMINISTRATIVO
                </a>

                <p style="margin:22px 0 0;color:#73737d;font-size:11px;line-height:1.55;">
                  Este é um aviso automático do sistema de pós-venda da BROTHER'S GAMES.
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


function buildBuyerIssueConfirmationEmail(params: {
  customerName: string;
  orderNumber: string;
  issueDescription: string;
  issueId: string;
  siteUrl: string;
}) {
  const {
    customerName,
    orderNumber,
    issueDescription,
    issueId,
    siteUrl,
  } = params;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#070708;font-family:Arial,Helvetica,sans-serif;color:#f5f5f7;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;background:#070708;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:620px;overflow:hidden;border:1px solid #242428;border-radius:18px;background:#0d0d0f;">
            <tr><td style="height:4px;background:#e50914;"></td></tr>

            <tr>
              <td style="padding:30px 28px 8px;">
                <div style="font-size:22px;font-weight:900;letter-spacing:-.03em;">
                  BROTHER'S <span style="color:#e50914;">GAMES</span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px 30px;">
                <div style="color:#ff4a54;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;">
                  SUPORTE PÓS-VENDA
                </div>

                <h1 style="margin:10px 0 12px;color:#fff;font-size:28px;line-height:1.15;">
                  Recebemos sua reclamação
                </h1>

                <p style="margin:0;color:#b8b8c1;font-size:15px;line-height:1.65;">
                  Olá, ${escapeHtml(customerName)}. Seu chamado foi aberto com sucesso e nossa equipe já foi avisada por e-mail.
                </p>

                <div style="margin:22px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Pedido:
                    <strong style="color:#fff;">${escapeHtml(orderNumber)}</strong>
                  </div>
                  <div style="margin:6px 0;color:#c6c6cd;font-size:13px;">
                    Chamado:
                    <strong style="color:#fff;">${escapeHtml(issueId)}</strong>
                  </div>
                </div>

                <div style="margin:20px 0;padding:16px;border:1px solid #29292f;border-radius:12px;background:#111114;">
                  <div style="font-size:10px;color:#7f7f89;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px;">
                    Sua descrição
                  </div>
                  <div style="color:#f2f2f5;font-size:14px;line-height:1.65;white-space:pre-wrap;">
                    ${escapeHtml(issueDescription)}
                  </div>
                </div>

                <a href="${escapeHtml(siteUrl)}"
                  style="display:inline-block;margin-top:4px;padding:13px 18px;border-radius:10px;background:#e50914;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.04em;">
                  ACOMPANHAR CHAMADO
                </a>
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
  // PRIORIDADE 1: RESEND
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
        console.log(
          "RESEND EMAIL ACCEPTED",
          {
            recipient: to,
            status: response.status,
            id: data?.id || null,
          }
        );

        return {
          ok: true,
          provider: "resend",
          status: response.status,
          id: data?.id || null,
        };
      }

      console.warn(
        "Resend falhou; tentando fallback pela Brevo.",
        {
          recipient: to,
          status: response.status,
          error:
            data?.message ||
            data?.name ||
            `HTTP ${response.status}`,
        }
      );
    } catch (error) {
      console.warn(
        "Resend indisponível; tentando fallback pela Brevo.",
        {
          recipient: to,
          error:
            error instanceof Error
              ? error.message
              : "RESEND_REQUEST_FAILED",
        }
      );
    }
  }

  // PRIORIDADE 2: BREVO (fallback)
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
        console.log(
          "BREVO FALLBACK EMAIL ACCEPTED",
          {
            recipient: to,
            status: response.status,
            messageId: data?.messageId || null,
          }
        );

        return {
          ok: true,
          provider: "brevo",
          status: response.status,
          id: data?.messageId || null,
        };
      }

      console.error("Brevo fallback recusado:", {
        recipient: to,
        status: response.status,
        response: data,
      });

      return {
        ok: false,
        provider: "brevo",
        status: response.status,
        error:
          data?.message ||
          data?.code ||
          `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        provider: "brevo",
        error:
          error instanceof Error
            ? error.message
            : "BREVO_REQUEST_FAILED",
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
      headers: corsHeaders(request),
    });
  }

  if (!isOriginAllowed(request)) {
    return jsonResponse(
      request,
      { ok: false, error: "ORIGIN_NOT_ALLOWED" },
      403
    );
  }

  if (request.method !== "POST") {
    return jsonResponse(
      request,
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
  const fallbackNotificationEmail =
    String(
      Deno.env.get("SALE_NOTIFICATION_EMAIL") || ""
    ).trim();

  if (!fallbackNotificationEmail) {
    console.error(
      "notify-order-issue-opened: SALE_NOTIFICATION_EMAIL não configurado."
    );

    return jsonResponse(
      request,
      {
        ok: false,
        error: "SUPPORT_NOTIFICATION_EMAIL_NOT_CONFIGURED",
      },
      503
    );
  }
  const siteUrl =
    String(
      Deno.env.get("PUBLIC_SITE_URL") ||
        LIVE_SITE
    ).trim();

  if (!supabaseUrl || !secretKey) {
    return jsonResponse(
      request,
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
      request,
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
      request,
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

  if (
    authError ||
    !authData?.user?.id
  ) {
    return jsonResponse(
      request,
      { ok: false, error: "INVALID_AUTH" },
      401
    );
  }

  let body: { issue_id?: unknown };

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      request,
      { ok: false, error: "INVALID_JSON" },
      400
    );
  }

  const issueId =
    cleanText(body.issue_id, 80);

  if (!issueId) {
    return jsonResponse(
      request,
      { ok: false, error: "ISSUE_REQUIRED" },
      400
    );
  }

  const {
    data: issueData,
    error: issueError,
  } = await admin
    .from("order_issues")
    .select(
      "id,order_id,customer_id,description,status,image_path,created_at"
    )
    .eq("id", issueId)
    .maybeSingle();

  const issue = issueData as IssueRow | null;

  if (
    issueError ||
    !issue
  ) {
    return jsonResponse(
      request,
      { ok: false, error: "ISSUE_NOT_FOUND" },
      404
    );
  }

  // O cliente só pode disparar e-mail para o chamado que ele mesmo abriu.
  if (
    issue.customer_id !== authData.user.id
  ) {
    return jsonResponse(
      request,
      { ok: false, error: "FORBIDDEN" },
      403
    );
  }

  const {
    data: orderData,
    error: orderError,
  } = await admin
    .from("orders")
    .select(
      "id,order_number,total,customer_id"
    )
    .eq("id", issue.order_id)
    .maybeSingle();

  const order =
    orderData as OrderRow | null;

  if (
    orderError ||
    !order ||
    order.customer_id !== authData.user.id
  ) {
    return jsonResponse(
      request,
      { ok: false, error: "ORDER_NOT_FOUND" },
      404
    );
  }

  const {
    data: customerProfile,
  } = await admin
    .from("profiles")
    .select("name,full_name")
    .eq("id", issue.customer_id)
    .maybeSingle();

  const customerName =
    cleanText(
      customerProfile?.name ||
        customerProfile?.full_name ||
        authData.user.user_metadata?.name ||
        authData.user.user_metadata?.full_name ||
        authData.user.email?.split("@")[0] ||
        "Cliente",
      120
    );

  const customerEmail =
    cleanText(
      authData.user.email || "",
      180
    );

  const {
    data: staffData,
    error: staffError,
  } = await admin
    .from("profiles")
    .select("id,role,status,name,full_name")
    .in("role", ["admin", "owner"])
    .eq("status", "active");

  if (staffError) {
    console.error(
      "notify-order-issue-opened: erro buscando staff",
      staffError
    );
  }

  const staffProfiles =
    (staffData || []) as ProfileRow[];

  const recipients = new Map<
    string,
    { email: string; name: string }
  >();

  // A caixa principal da loja SEMPRE recebe o aviso.
  // Isso não depende de profile/role/auth de Admin/Owner.
  if (fallbackNotificationEmail) {
    const storeEmail =
      fallbackNotificationEmail.toLowerCase();

    recipients.set(storeEmail, {
      email: storeEmail,
      name: "Equipe BROTHER'S GAMES",
    });
  }

  // Além da caixa principal, tenta notificar todos
  // os perfis Admin/Owner ativos que possuam e-mail no Auth.
  for (const profile of staffProfiles) {
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

      if (email) {
        recipients.set(email, {
          email,
          name:
            cleanText(
              profile.name ||
                profile.full_name ||
                "Admin",
              120
            ) || "Admin",
        });
      }
    } catch (error) {
      console.error(
        "notify-order-issue-opened: erro lendo e-mail de staff",
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

  if (!recipients.size) {
    console.error(
      "notify-order-issue-opened: nenhum destinatário de suporte configurado."
    );

    return jsonResponse(
      request,
      { ok: false, error: "NO_STAFF_EMAILS" },
      503
    );
  }

  const sent: string[] = [];
  const failed: string[] = [];

  for (const recipient of recipients.values()) {
    console.log(
      "notify-order-issue-opened: enviando aviso de chamado",
      {
        issueId: issue.id,
        orderNumber: order.order_number,
        recipient: recipient.email,
      }
    );

    const html = buildEmail({
      staffName: recipient.name,
      customerName,
      customerEmail,
      orderNumber:
        cleanText(order.order_number, 100),
      total: Number(order.total || 0),
      issueDescription:
        cleanText(issue.description, 5000),
      issueId: issue.id,
      siteUrl,
    });

    const emailResult =
      await sendTransactionalEmail({
        to: recipient.email,
        toName: recipient.name,
        subject:
          `NOVA RECLAMAÇÃO • Pedido ${cleanText(
            order.order_number,
            100
          )}`,
        html,
      });

    if (emailResult.ok) {
      sent.push(recipient.email);
    } else {
      failed.push(recipient.email);

      console.error(
        "notify-order-issue-opened: falha enviando e-mail ao staff",
        {
          recipient: recipient.email,
          provider: emailResult.provider,
          status: emailResult.status || null,
          error: emailResult.error || null,
        }
      );
    }
  }


  // Confirmação para o próprio comprador.
  if (customerEmail) {
    const buyerHtml =
      buildBuyerIssueConfirmationEmail({
        customerName,
        orderNumber:
          cleanText(order.order_number, 100),
        issueDescription:
          cleanText(issue.description, 5000),
        issueId: issue.id,
        siteUrl,
      });

    const buyerResult =
      await sendTransactionalEmail({
        to: customerEmail,
        toName: customerName,
        subject:
          `CHAMADO RECEBIDO • Pedido ${cleanText(
            order.order_number,
            100
          )}`,
        html: buyerHtml,
      });

    if (buyerResult.ok) {
      sent.push(customerEmail);
    } else {
      failed.push(customerEmail);

      console.error(
        "notify-order-issue-opened: falha enviando confirmação ao comprador",
        {
          recipient: customerEmail,
          provider: buyerResult.provider,
          status: buyerResult.status || null,
          error: buyerResult.error || null,
        }
      );
    }
  }

  await admin
    .from("order_events")
    .insert({
      order_id: order.id,
      event_type:
        "order_issue_staff_email_notification",
      details: {
        issue_id: issue.id,
        sent,
        failed,
      },
    });

  if (!sent.length) {
    return jsonResponse(
      request,
      {
        ok: false,
        error: "EMAIL_SEND_FAILED",
        failed,
      },
      502
    );
  }

  return jsonResponse(request, {
    ok: true,
    sent,
    failed,
  });
});