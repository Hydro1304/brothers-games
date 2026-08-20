import { createClient } from "npm:@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
type AdminClient = any;

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_COMMENT_LENGTH = 1200;
const MAX_PHOTOS = 3;

function getSupabaseSecretKey() {
  const modernSecrets = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (modernSecrets) {
    try {
      const parsed = JSON.parse(modernSecrets);
      if (typeof parsed?.default === "string" && parsed.default) {
        return parsed.default;
      }
    } catch (error) {
      console.error("Erro lendo SUPABASE_SECRET_KEYS:", error);
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function allowedOrigins() {
  const configured = String(Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string) {
  return !origin || allowedOrigins().has(origin) || isLocalDevelopmentOrigin(origin);
}

function corsForRequest(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowed = isAllowedOrigin(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };

  if (origin && allowed) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return { allowed, headers };
}

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
) {
  const { headers } = corsForRequest(request);

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeModerationText(input: string) {
  const leetMap: Record<string, string> = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    "$": "s",
  };

  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split("")
    .map((character) => leetMap[character] || character)
    .join("")
    .replace(/(.)\1{3,}/g, "$1$1");
}

function hasBlockedContent(input: string) {
  const normalized = normalizeModerationText(input);
  const words = normalized
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const compact = normalized.replace(/[^a-z0-9]/g, "");

  const blockedTokens = [
    "caralho",
    "porra",
    "merda",
    "buceta",
    "putaria",
    "puta",
    "piranha",
    "vagabunda",
    "vagabundo",
    "viado",
    "foder",
    "fudido",
    "fudida",
    "fudeu",
    "foda",
    "cacete",
    "desgraca",
    "boquete",
    "masturbacao",
    "masturbar",
    "sexo",
    "sexual",
    "transar",
    "trepar",
    "porno",
    "pornografia",
    "nudes",
    "nudez",
    "onlyfans",
    "pornhub",
    "xvideos",
  ];

  const wordSet = new Set(words.split(" ").filter(Boolean));

  if (blockedTokens.some((token) => wordSet.has(token))) {
    return true;
  }

  const compactSensitive = blockedTokens.filter((token) => token.length >= 5);
  return compactSensitive.some((token) => compact.includes(token));
}

function uniqueStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  ];
}

async function checkRateLimit(
  admin: AdminClient,
  userId: string,
) {
  const { data, error } = await admin.rpc("check_edge_rate_limit", {
    p_key: `review-submit:${userId}`,
    p_window_seconds: 600,
    p_max_requests: 10,
  });

  if (error) {
    console.error("Rate limit da avaliação:", error);
    throw new Error("RATE_LIMIT_ERROR");
  }

  return data !== false;
}

Deno.serve(async (request: Request) => {
  const cors = corsForRequest(request);

  if (!cors.allowed) {
    return jsonResponse(
      request,
      { error: "Origem não permitida." },
      403,
    );
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors.headers });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      request,
      { error: "Método não permitido." },
      405,
    );
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return jsonResponse(
        request,
        { error: "Requisição muito grande." },
        413,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseSecretKey = getSupabaseSecretKey();

    if (!supabaseUrl || !supabaseSecretKey) {
      return jsonResponse(
        request,
        { error: "Configuração do servidor incompleta." },
        500,
      );
    }

    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return jsonResponse(
        request,
        { error: "Você precisa estar logado." },
        401,
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

    const admin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    const user = authData?.user || null;

    if (authError || !user) {
      return jsonResponse(
        request,
        { error: "Sua sessão expirou. Entre novamente." },
        401,
      );
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,status,suspended_until")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse(
        request,
        { error: "Perfil não encontrado." },
        403,
      );
    }

    if (profile.status === "blocked") {
      return jsonResponse(request, { error: "Conta bloqueada." }, 403);
    }

    if (profile.status === "suspended") {
      const until = profile.suspended_until
        ? new Date(profile.suspended_until).getTime()
        : Number.POSITIVE_INFINITY;

      if (until > Date.now()) {
        return jsonResponse(request, { error: "Conta suspensa." }, 403);
      }
    }

    if (!(await checkRateLimit(admin, user.id))) {
      return jsonResponse(
        request,
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        429,
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(request, { error: "JSON inválido." }, 400);
    }

    const reviewId = String(body?.reviewId || "").trim();
    const orderId = String(body?.orderId || "").trim();
    const productId = String(body?.productId || "").trim();
    const rating = Number(body?.rating);
    const comment = String(body?.comment || "").trim();
    const photoPaths = uniqueStringArray(body?.photoPaths);

    if (!UUID_RE.test(reviewId) || !UUID_RE.test(orderId) || !UUID_RE.test(productId)) {
      return jsonResponse(request, { error: "Dados da avaliação inválidos." }, 400);
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonResponse(request, { error: "Escolha uma nota entre 1 e 5." }, 400);
    }

    if (comment.length < 5 || comment.length > MAX_COMMENT_LENGTH) {
      return jsonResponse(
        request,
        { error: "O comentário deve ter entre 5 e 1200 caracteres." },
        400,
      );
    }

    if (hasBlockedContent(comment)) {
      return jsonResponse(
        request,
        {
          code: "CONTENT_NOT_ALLOWED",
          error:
            "Seu comentário contém conteúdo não permitido. Remova palavrões ou conteúdo +18 e tente novamente.",
        },
        422,
      );
    }

    if (photoPaths.length > MAX_PHOTOS) {
      return jsonResponse(
        request,
        { error: "Você pode anexar no máximo 3 fotos." },
        400,
      );
    }

    const expectedFolder = `${user.id}/${reviewId}/`;

    if (
      photoPaths.some(
        (path) =>
          !path.startsWith(expectedFolder) ||
          path.slice(expectedFolder.length).includes("/"),
      )
    ) {
      return jsonResponse(
        request,
        { error: "Caminho de foto inválido." },
        400,
      );
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id,customer_id,status,fulfillment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse(request, { error: "Pedido não encontrado." }, 404);
    }

    if (order.customer_id !== user.id) {
      return jsonResponse(
        request,
        { error: "Este pedido não pertence à sua conta." },
        403,
      );
    }

    if (
      !["paid", "processing", "completed"].includes(order.status) ||
      order.fulfillment_status !== "delivered"
    ) {
      return jsonResponse(
        request,
        { error: "A avaliação só é liberada depois que o pedido é entregue." },
        409,
      );
    }

    const { data: orderItem, error: orderItemError } = await admin
      .from("order_items")
      .select("id,product_id")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .limit(1)
      .maybeSingle();

    if (orderItemError || !orderItem) {
      return jsonResponse(
        request,
        { error: "Esse produto não faz parte do pedido informado." },
        403,
      );
    }

    const { data: existingReview, error: existingReviewError } = await admin
      .from("product_reviews")
      .select("id,product_id,user_id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReviewError) {
      console.error("Buscando avaliação existente:", existingReviewError);
      return jsonResponse(
        request,
        { error: "Não foi possível verificar sua avaliação." },
        500,
      );
    }

    if (existingReview && existingReview.id !== reviewId) {
      return jsonResponse(
        request,
        { error: "Esta avaliação já existe. Atualize a página e tente novamente." },
        409,
      );
    }

    if (photoPaths.length) {
      const folder = `${user.id}/${reviewId}`;
      const { data: storageObjects, error: listError } = await admin.storage
        .from("review-images")
        .list(folder, {
          limit: 20,
          sortBy: { column: "name", order: "asc" },
        });

      if (listError) {
        console.error("Listando fotos da avaliação:", listError);
        return jsonResponse(
          request,
          { error: "Não foi possível validar as fotos anexadas." },
          500,
        );
      }

      const existingPaths = new Set(
        (storageObjects || []).map((item: { name: string }) => `${folder}/${item.name}`),
      );

      if (photoPaths.some((path) => !existingPaths.has(path))) {
        return jsonResponse(
          request,
          { error: "Uma ou mais fotos não foram encontradas no armazenamento." },
          400,
        );
      }
    }

    const now = new Date().toISOString();
    const reviewPayload = {
      order_id: orderId,
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      is_approved: false,
      moderation_status: "pending",
      moderation_note: null,
      moderated_at: null,
      moderated_by: null,
      updated_at: now,
    };

    if (existingReview) {
      const { error: updateError } = await admin
        .from("product_reviews")
        .update(reviewPayload)
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Atualizando avaliação:", updateError);
        return jsonResponse(
          request,
          { error: "Não foi possível atualizar sua avaliação." },
          500,
        );
      }
    } else {
      const { error: insertError } = await admin
        .from("product_reviews")
        .insert({
          id: reviewId,
          ...reviewPayload,
        });

      if (insertError) {
        console.error("Criando avaliação:", insertError);
        return jsonResponse(
          request,
          { error: "Não foi possível criar sua avaliação." },
          500,
        );
      }
    }

    const { data: oldPhotos, error: oldPhotosError } = await admin
      .from("review_photos")
      .select("id,storage_path")
      .eq("review_id", reviewId);

    if (oldPhotosError) {
      console.error("Lendo fotos antigas:", oldPhotosError);
      return jsonResponse(
        request,
        { error: "Avaliação salva, mas houve erro ao organizar as fotos." },
        500,
      );
    }

    const oldPaths = (oldPhotos || []).map(
      (photo: { storage_path: string }) => photo.storage_path,
    );

    const { error: deleteRowsError } = await admin
      .from("review_photos")
      .delete()
      .eq("review_id", reviewId);

    if (deleteRowsError) {
      console.error("Limpando fotos antigas:", deleteRowsError);
      return jsonResponse(
        request,
        { error: "Avaliação salva, mas houve erro ao atualizar as fotos." },
        500,
      );
    }

    if (photoPaths.length) {
      const { error: insertPhotosError } = await admin
        .from("review_photos")
        .insert(
          photoPaths.map((path, index) => ({
            review_id: reviewId,
            storage_path: path,
            sort_order: index,
          })),
        );

      if (insertPhotosError) {
        console.error("Salvando fotos da avaliação:", insertPhotosError);
        return jsonResponse(
          request,
          { error: "Avaliação salva, mas houve erro ao registrar as fotos." },
          500,
        );
      }
    }

    const removedPaths = oldPaths.filter((path: string) => !photoPaths.includes(path));
    if (removedPaths.length) {
      const { error: removeStorageError } = await admin.storage
        .from("review-images")
        .remove(removedPaths);

      if (removeStorageError) {
        console.warn("Não foi possível remover fotos antigas:", removeStorageError);
      }
    }

    await admin.from("order_events").insert({
      order_id: orderId,
      event_type: existingReview ? "review_updated" : "review_submitted",
      details: {
        review_id: reviewId,
        product_id: productId,
        moderation_status: "pending",
        photo_count: photoPaths.length,
      },
    });

    return jsonResponse(
      request,
      {
        success: true,
        reviewId,
        moderationStatus: "pending",
      },
      existingReview ? 200 : 201,
    );
  } catch (error) {
    console.error("submit-product-review:", error);
    return jsonResponse(
      request,
      { error: "Erro interno ao enviar a avaliação." },
      500,
    );
  }
});
