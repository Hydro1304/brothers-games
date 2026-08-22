import { useEffect, useMemo, useRef, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "./lib/supabase";
import AdminPanel from "./AdminPanel";
import AIShoppingAssistant from "./AIShoppingAssistant";
import { useSitePopup } from "./SitePopup";
import { LANGUAGES, detectInitialLanguage, languageMeta, languageChangeCopy, translateDom, translateProductName, translateCategoryName } from "./i18n";
import "./styles.css";
import "./avatar-transitions.css";
import "./fulfillment.css";

const mercadoPagoPublicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
const mercadoPagoFrontendMode = String(
  import.meta.env.VITE_MERCADO_PAGO_MODE || ""
).trim().toLowerCase();
const mercadoPagoProductionEnabled = ["production", "prod", "live"].includes(
  mercadoPagoFrontendMode
);
const mercadoPagoUsesObviousTestKey = /^TEST-/i.test(
  String(mercadoPagoPublicKey || "").trim()
);

if (mercadoPagoPublicKey) {
  initMercadoPago(mercadoPagoPublicKey);
}

const CURRENCY_BY_LANGUAGE = {
  "pt-BR": { locale: "pt-BR", currency: "BRL" },
  "en-US": { locale: "en-US", currency: "USD" },
  "es-ES": { locale: "es-ES", currency: "EUR" },
  "zh-CN": { locale: "zh-CN", currency: "CNY" },
  "hi-IN": { locale: "hi-IN", currency: "INR" },
  "ar-SA": { locale: "ar-SA", currency: "SAR" },
  "fr-FR": { locale: "fr-FR", currency: "EUR" },
  "de-DE": { locale: "de-DE", currency: "EUR" },
};

const FALLBACK_BRL_RATES = {
  BRL: 1,
  USD: 0.185,
  EUR: 0.158,
  CNY: 1.33,
  INR: 16.1,
  SAR: 0.694,
};

function currencyMeta(language) {
  return CURRENCY_BY_LANGUAGE[language] || CURRENCY_BY_LANGUAGE["pt-BR"];
}

function formatLocalizedPrice(value, language, rates) {
  const { locale, currency } = currencyMeta(language);
  const baseValue = Number(value || 0);
  const rate = Number(rates?.[currency] ?? FALLBACK_BRL_RATES[currency] ?? 1);
  const converted = Number.isFinite(baseValue) ? baseValue * rate : 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

function formatCep(value) {
  const numbers = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

function phoneToDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value) {
  const numbers = phoneToDigits(value);
  if (!numbers) return "";
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function emptyPasswordRecoveryState(email = "") {
  return {
    active: false,
    step: "request",
    email,
    code: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    notice: "",
  };
}

function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isPeripheralCategory(category) {
  const normalized = String(category || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const peripheralTerms = [
    "mouse",
    "teclado",
    "monitor",
    "headset",
    "fone",
    "controle",
    "acessorio",
    "periferico",
    "webcam",
    "microfone",
    "cadeira",
    "volante",
  ];

  return peripheralTerms.some((term) => normalized.includes(term));
}

function CategoryHomeIcon({ category }) {
  const name = String(category || "").toLowerCase();

  if (name.includes("jogo")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 8.2h9.6a4.5 4.5 0 0 1 4.2 6.1l-1.2 3.1a2.2 2.2 0 0 1-3.7.7l-1.5-1.7H9.4l-1.5 1.7a2.2 2.2 0 0 1-3.7-.7L3 14.3a4.5 4.5 0 0 1 4.2-6.1Z" />
        <path d="M8 11v4M6 13h4M16.5 11.7h.01M18.5 14h.01" />
      </svg>
    );
  }

  if (name.includes("mouse")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6.2" y="2.5" width="11.6" height="19" rx="5.8" />
        <path d="M12 2.8v6.1M9.2 9h5.6" />
      </svg>
    );
  }

  if (name.includes("teclado")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2.4" />
        <path d="M6 9h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12.5h.01M9 12.5h.01M12 12.5h.01M15 12.5h.01M18 12.5h.01M7 16h10" />
      </svg>
    );
  }

  if (name.includes("monitor")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="3.5" width="19" height="13.5" rx="2.2" />
        <path d="M12 17v3.5M8.5 20.5h7" />
      </svg>
    );
  }

  if (name.includes("head") || name.includes("fone")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 12.5h2.2a1.8 1.8 0 0 1 1.8 1.8v3.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 17.7v-5.2ZM20 12.5h-2.2a1.8 1.8 0 0 0-1.8 1.8v3.4a1.8 1.8 0 0 0 1.8 1.8h.4a1.8 1.8 0 0 0 1.8-1.8v-5.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.8 8 4.5v9.4l-8 4.5-8-4.5V7.3l8-4.5Z" />
      <path d="m4.4 7.5 7.6 4.3 7.6-4.3M12 11.8v9" />
    </svg>
  );
}

function productImage(product) {
  if (Array.isArray(product?.image_urls) && product.image_urls.length) {
    return product.image_urls[0];
  }
  return product?.image || "";
}

function normalizeProduct(product) {
  const originalPrice =
    product.original_price === null ||
    product.original_price === undefined ||
    product.original_price === ""
      ? null
      : Number(product.original_price);

  return {
    ...product,
    price: Number(product.price || 0),
    original_price:
      Number.isFinite(originalPrice) && originalPrice > 0
        ? originalPrice
        : null,
    image: productImage(product),
  };
}

function isPhysicalProduct(product) {
  if (product?.delivery_type === "physical") return true;
  if (product?.delivery_type === "digital") return false;
  return String(product?.category || "").trim().toLowerCase() !== "jogos";
}

function getDiscountPercent(product) {
  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.original_price || 0);

  if (
    !product?.is_offer ||
    !Number.isFinite(price) ||
    !Number.isFinite(originalPrice) ||
    price <= 0 ||
    originalPrice <= price
  ) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

const PAID_ORDER_STATUSES = ["paid", "processing", "completed"];

function paymentStatusLabel(status) {
  const labels = {
    pending_payment: "Aguardando pagamento",
    paid: "Pagamento aprovado",
    processing: "Pagamento aprovado",
    completed: "Pagamento concluído",
    cancelled: "Cancelado",
    expired: "Expirado",
    refunded: "Reembolsado",
  };

  return labels[status] || "Status indisponível";
}

function normalizedFulfillmentStatus(order) {
  if (!order) return "awaiting_payment";

  if (["cancelled", "expired", "refunded"].includes(order.status)) {
    return "cancelled";
  }

  if (order.fulfillment_status) {
    return order.fulfillment_status;
  }

  return PAID_ORDER_STATUSES.includes(order.status)
    ? "preparing"
    : "awaiting_payment";
}

function fulfillmentStatusLabel(order) {
  const status = normalizedFulfillmentStatus(order);

  const labels = {
    awaiting_payment: "Aguardando pagamento",
    preparing: "Preparando pedido",
    shipped: "Pedido enviado",
    delivered: "Entregue",
    cancelled: "Pedido encerrado",
  };

  return labels[status] || "Aguardando atualização";
}

function fulfillmentStatusClass(order) {
  return normalizedFulfillmentStatus(order).replaceAll("_", "-");
}

const emptyUserData = {
  name: "",
  email: "",
  phone: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  avatarType: "preset",
  avatarValue: "gamer-red",
};

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
];

const avatarPresets = [
  { id: "gamer-red", label: "Gamer", emoji: "🎮", background: "linear-gradient(135deg, #7b0d16, #1a0608)" },
  { id: "arcade-purple", label: "Arcade", emoji: "👾", background: "linear-gradient(135deg, #5b21b6, #16082e)" },
  { id: "fire", label: "Fire", emoji: "🔥", background: "linear-gradient(135deg, #b91c1c, #3a0a0a)" },
  { id: "thunder", label: "Thunder", emoji: "⚡", background: "linear-gradient(135deg, #a16207, #2e2205)" },
  { id: "skull", label: "Skull", emoji: "💀", background: "linear-gradient(135deg, #374151, #0b0d10)" },
  { id: "robot", label: "Robot", emoji: "🤖", background: "linear-gradient(135deg, #155e75, #071e26)" },
  { id: "king", label: "King", emoji: "👑", background: "linear-gradient(135deg, #92400e, #281303)" },
  { id: "space", label: "Space", emoji: "🚀", background: "linear-gradient(135deg, #1d4ed8, #07142f)" },
  { id: "dragon", label: "Dragon", emoji: "🐉", background: "linear-gradient(135deg, #166534, #061d0d)" },
  { id: "headset", label: "Headset", emoji: "🎧", background: "linear-gradient(135deg, #be123c, #320713)" },
  { id: "champion", label: "Champion", emoji: "🏆", background: "linear-gradient(135deg, #a16207, #2c1c03)" },
  { id: "retro", label: "Retro", emoji: "🕹️", background: "linear-gradient(135deg, #6d28d9, #190735)" },
];

function avatarFileExtension(file) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[file?.type] || "";
}

function reviewImageExtension(file) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[file?.type] || "";
}

function reviewModerationLabel(review) {
  const labels = {
    pending: "Aguardando aprovação",
    approved: "Avaliação publicada",
    rejected: "Precisa ser revisada",
  };

  return labels[review?.moderation_status] || "Aguardando aprovação";
}

function orderIssueStatusLabel(status) {
  const labels = {
    pending: "Aguardando análise",
    in_review: "Em análise",
    chat: "Em conversa",
    refund_approved: "Reembolso aprovado",
    resolved: "Resolvido",
    rejected: "Solicitação rejeitada",
    closed: "Encerrado",
  };
  return labels[status] || "Aguardando análise";
}

function orderIssueDeadline(order) {
  if (!order?.delivered_at) return null;
  const deadline = new Date(order.delivered_at);
  deadline.setTime(deadline.getTime() + 5 * 24 * 60 * 60 * 1000);
  return deadline;
}

function canOpenOrderIssue(order) {
  if (normalizedFulfillmentStatus(order) !== "delivered" || !order?.delivered_at) return false;
  const deadline = orderIssueDeadline(order);
  return Boolean(deadline && Date.now() <= deadline.getTime());
}

// Avaliações visuais para homologação. Elas não são gravadas no Supabase e
// aparecem identificadas como demonstração para não se confundirem com clientes reais.
const DEMO_REVIEWS_ENABLED = true;
const DEMO_REVIEW_TEMPLATES = [
  {
    rating: 5,
    comment: "Produto muito bem apresentado, informações claras e processo de compra bem simples.",
    created_at: "2026-08-16T18:30:00.000Z",
  },
  {
    rating: 2,
    comment: "Senti falta de mais detalhes técnicos antes da compra. A descrição poderia ser mais completa.",
    created_at: "2026-08-15T15:10:00.000Z",
  },
  {
    rating: 4,
    comment: "Gostei do visual da página e encontrei rapidamente as principais informações do produto.",
    created_at: "2026-08-14T12:40:00.000Z",
  },
  {
    rating: 1,
    comment: "A experiência não atendeu ao que eu esperava e algumas etapas da compra ficaram confusas.",
    created_at: "2026-08-13T21:05:00.000Z",
  },
  {
    rating: 5,
    comment: "Compra rápida, página organizada e acompanhamento do pedido fácil de entender.",
    created_at: "2026-08-12T17:25:00.000Z",
  },
  {
    rating: 3,
    comment: "Experiência razoável, mas a descrição poderia explicar melhor os diferenciais do produto.",
    created_at: "2026-08-11T10:50:00.000Z",
  },
  {
    rating: 4,
    comment: "Bom custo-benefício e página funcionando muito bem tanto no computador quanto no celular.",
    created_at: "2026-08-10T19:35:00.000Z",
  },
  {
    rating: 2,
    comment: "O prazo e as condições da compra poderiam aparecer com mais destaque na página.",
    created_at: "2026-08-09T14:15:00.000Z",
  },
  {
    rating: 5,
    comment: "Tudo funcionou sem travamentos e encontrei o que precisava com bastante facilidade.",
    created_at: "2026-08-08T20:45:00.000Z",
  },
  {
    rating: 1,
    comment: "O produto não pareceu compatível com o que eu procurava e faltaram informações importantes.",
    created_at: "2026-08-07T09:30:00.000Z",
  },
  {
    rating: 3,
    comment: "Atendeu ao básico, porém poderiam existir mais imagens e exemplos de uso do produto.",
    created_at: "2026-08-05T16:20:00.000Z",
  },
  {
    rating: 4,
    comment: "Navegação simples, preço bem visível e finalização da compra organizada.",
    created_at: "2026-08-02T11:20:00.000Z",
  },
];

function demoReviewsForProduct(product) {
  if (!DEMO_REVIEWS_ENABLED || !product?.id) return [];

  const productKey = String(product.id);
  const offset = [...productKey].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0
  ) % DEMO_REVIEW_TEMPLATES.length;

  return Array.from({ length: DEMO_REVIEW_TEMPLATES.length }, (_, index) => {
    const template = DEMO_REVIEW_TEMPLATES[
      (offset + index) % DEMO_REVIEW_TEMPLATES.length
    ];

    return {
      id: `demo-${productKey}-${index + 1}`,
      product_id: product.id,
      ...template,
      updated_at: template.created_at,
      is_demo: true,
    };
  });
}

function StarRating({ value = 0, size = "normal" }) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return (
    <div
      className={`stars ${size === "large" ? "stars-large" : ""}`}
      aria-label={`${safeValue} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(safeValue) ? "star filled" : "star"}>
          ★
        </span>
      ))}
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}


function getProductHoverAnimationType(product) {
  const text = `${product?.slug || ""} ${product?.name || ""}`.toLowerCase();

  if (text.includes("call of duty") || text.includes("call-of-duty")) return "soldier";
  if (
    text.includes("fc 26") ||
    text.includes("ea sports fc") ||
    text.includes("eafc") ||
    text.includes("fifa")
  ) return "football";
  if (text.includes("gta") || text.includes("grand theft auto")) return "car";
  if (text.includes("red dead") || text.includes("red-dead")) return "cowboy";
  if (text.includes("resident evil") || text.includes("resident-evil")) return "flashlight";
  if (text.includes("monitor")) return "monitor";
  if (text.includes("mousepad") || text.includes("mouse pad")) return "mousepad";
  if (text.includes("mouse")) return "mouse";
  if (text.includes("headset") || text.includes("fone")) return "headset";
  if (text.includes("teclado") || text.includes("keyboard")) return "keyboard";
  if (text.includes("controle") || text.includes("controller") || text.includes("gamepad")) return "controller";

  return "spark";
}

function ProductHoverAnimation({ product, size = "card" }) {
  const type = getProductHoverAnimationType(product);
  const commonProps = {
    viewBox: "0 0 64 40",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  return (
    <span
      className={`product-hover-animation product-hover-animation-${type} ${
        size === "detail" ? "is-detail" : ""
      }`}
      aria-hidden="true"
    >
      {type === "soldier" && (
        <svg {...commonProps}>
          <g className="anim-soldier-body">
            <circle cx="20" cy="10" r="4.2" />
            <path d="M18 14.5l-3.5 10 6.5 2.5 4.5-10.5-3.5-2" />
            <path d="M16.5 24.5l-4 10M21.5 26.5l2 8.5" />
            <path d="M22.5 17l9 3.5" />
            <path d="M18 17.5l10 1" />
          </g>
          <g className="anim-soldier-rifle">
            <path d="M28 18.5l22-3" />
            <path d="M38 17.2l2.5 4" />
            <path d="M47 15.8l5 1" />
            <path d="M29 18.5l-3.5 2.5" />
          </g>
          <path className="anim-muzzle" d="M54 15l5-2M54 16l5 1M54 14l3-4" />
        </svg>
      )}

      {type === "football" && (
        <svg {...commonProps}>
          <g className="anim-football-ball">
            <circle cx="30" cy="21" r="10" />
            <path d="M27 17l5-2 4 4-2 5-6 1-3-4 2-4z" />
            <path d="M32 15l1-4M36 19l4-2M34 24l3 4M28 25l-2 4M25 21l-5-1" />
          </g>
          <path className="anim-football-shadow" d="M18 34c8 2 18 2 25 0" />
        </svg>
      )}

      {type === "car" && (
        <svg {...commonProps}>
          <g className="anim-car-body">
            <path d="M9 25h43l-4-9H25l-6 5H9z" />
            <path d="M26 16l5-7h11l6 7" />
            <circle cx="20" cy="27" r="4" />
            <circle cx="44" cy="27" r="4" />
            <path d="M11 21h8M48 21h5" />
          </g>
          <path className="anim-car-speed anim-car-speed-1" d="M3 14h10" />
          <path className="anim-car-speed anim-car-speed-2" d="M1 20h8" />
          <path className="anim-car-speed anim-car-speed-3" d="M4 27h7" />
        </svg>
      )}

      {type === "cowboy" && (
        <svg {...commonProps}>
          <g className="anim-cowboy-hat">
            <path d="M15 24c7 5 29 5 36 0-7-2-12-3-18-3s-11 1-18 3z" />
            <path d="M24 21c0-8 4-12 9-12s9 4 9 12" />
            <path d="M25 17c5 2 11 2 16 0" />
          </g>
          <path className="anim-cowboy-dust anim-cowboy-dust-1" d="M10 32h12" />
          <path className="anim-cowboy-dust anim-cowboy-dust-2" d="M39 34h13" />
        </svg>
      )}

      {type === "flashlight" && (
        <svg {...commonProps}>
          <g className="anim-flashlight">
            <path d="M10 17h16l7 5-7 5H10z" />
            <path d="M13 17v10M24 18v8" />
          </g>
          <path className="anim-flashlight-beam" d="M33 18l25-8v24l-25-8z" />
        </svg>
      )}

      {type === "monitor" && (
        <svg {...commonProps}>
          <rect className="anim-monitor-screen" x="9" y="5" width="44" height="25" rx="3" />
          <path d="M27 31h8M31 31v5M23 36h16" />
          <path className="anim-monitor-scan" d="M13 11h36" />
        </svg>
      )}

      {type === "mouse" && (
        <svg {...commonProps}>
          <g className="anim-mouse">
            <path d="M22 5c-8 2-12 10-12 19 0 8 6 12 14 12s14-4 14-12c0-9-4-17-12-19z" />
            <path d="M24 6v11M11 18h26" />
            <rect x="22" y="9" width="4" height="6" rx="2" />
          </g>
          <path className="anim-mouse-rgb" d="M12 27c8 6 17 6 24 0" />
        </svg>
      )}

      {type === "mousepad" && (
        <svg {...commonProps}>
          <rect x="8" y="9" width="45" height="25" rx="4" />
          <path className="anim-mousepad-cursor" d="M27 14l12 10-7 1 3 7-4 2-3-7-5 5z" />
          <path className="anim-mousepad-trail" d="M15 27c4-8 9-12 15-13" />
        </svg>
      )}

      {type === "headset" && (
        <svg {...commonProps}>
          <g className="anim-headset">
            <path d="M16 24v-4c0-9 6-15 16-15s16 6 16 15v4" />
            <rect x="12" y="20" width="8" height="13" rx="3" />
            <rect x="44" y="20" width="8" height="13" rx="3" />
            <path d="M48 31c0 4-4 5-9 5" />
          </g>
          <path className="anim-headset-wave anim-headset-wave-1" d="M5 17c-2 3-2 7 0 10" />
          <path className="anim-headset-wave anim-headset-wave-2" d="M59 17c2 3 2 7 0 10" />
        </svg>
      )}

      {type === "keyboard" && (
        <svg {...commonProps}>
          <g className="anim-keyboard">
            <rect x="5" y="10" width="54" height="23" rx="3" />
            {[11, 19, 27, 35, 43, 51].map((x, index) => (
              <rect key={`key-top-${x}`} className={`anim-key anim-key-${index + 1}`} x={x} y="15" width="5" height="4" rx="1" />
            ))}
            {[11, 19, 27, 35, 43, 51].map((x, index) => (
              <rect key={`key-bottom-${x}`} className={`anim-key anim-key-${index + 3}`} x={x} y="23" width="5" height="4" rx="1" />
            ))}
          </g>
        </svg>
      )}

      {type === "controller" && (
        <svg {...commonProps}>
          <g className="anim-controller">
            <path d="M18 13c-7 0-11 7-12 15-1 7 5 8 9 4l6-6h22l6 6c4 4 10 3 9-4-1-8-5-15-12-15z" />
            <path d="M18 19v10M13 24h10" />
            <circle className="anim-controller-button anim-controller-button-a" cx="45" cy="21" r="2" />
            <circle className="anim-controller-button anim-controller-button-b" cx="50" cy="26" r="2" />
            <circle className="anim-controller-stick" cx="29" cy="25" r="3" />
            <circle cx="37" cy="25" r="3" />
          </g>
        </svg>
      )}

      {type === "spark" && (
        <svg {...commonProps}>
          <g className="anim-spark">
            <path d="M32 5v9M32 26v9M15 20h10M39 20h10" />
            <path d="M20 8l7 7M37 25l7 7M44 8l-7 7M27 25l-7 7" />
          </g>
        </svg>
      )}
    </span>
  );
}

function App() {
  const {
    showSiteAlert,
    showSiteLoading,
    hideSiteLoading,
  } = useSitePopup();

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("brothersGamesTheme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const [language, setLanguage] = useState(() => detectInitialLanguage());
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(() => ({ ...FALLBACK_BRL_RATES }));
  const [exchangeRatesUpdatedAt, setExchangeRatesUpdatedAt] = useState(null);
  const languageRef = useRef(language);
  const languageMenuRef = useRef(null);
  const i18nTextMemoryRef = useRef(new WeakMap());
  const i18nAttrMemoryRef = useRef(new WeakMap());

  const [page, setPage] = useState("home");
  const [previousPage, setPreviousPage] = useState("products");

  // Sincroniza a navegação interna com Voltar/Avançar do navegador.
  const browserHistoryReadyRef = useRef(false);
  const browserHistoryPopRef = useRef(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("relevance");
  const [offersOnly, setOffersOnly] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const [institutionalPage, setInstitutionalPage] = useState(null);
  const [accountMode, setAccountMode] = useState("login");
  const [accountPage, setAccountPage] = useState("home");
  const [accountForm, setAccountForm] = useState({ name: "", email: "", password: "" });
  const [authNotice, setAuthNotice] = useState("");
  const [authActionOverlay, setAuthActionOverlay] = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(() =>
    emptyPasswordRecoveryState()
  );
  const [userData, setUserData] = useState({ ...emptyUserData });
  const [myOrders, setMyOrders] = useState([]);
  const [myOrderFulfillments, setMyOrderFulfillments] = useState([]);
  const [myOrderItems, setMyOrderItems] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewPhotos, setMyReviewPhotos] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [myOrderIssues, setMyOrderIssues] = useState([]);
  const [issueOrderId, setIssueOrderId] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [issueImageFile, setIssueImageFile] = useState(null);
  const [issueImagePreview, setIssueImagePreview] = useState("");
  const [issueImageUrl, setIssueImageUrl] = useState("");
  const [issueMessages, setIssueMessages] = useState([]);
  const [issueMessage, setIssueMessage] = useState("");
  const [issueBusy, setIssueBusy] = useState(false);
  const [issueMessagesLoading, setIssueMessagesLoading] = useState(false);

  const [publicReviews, setPublicReviews] = useState([]);
  const [publicReviewPhotos, setPublicReviewPhotos] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewExistingPhotos, setReviewExistingPhotos] = useState([]);
  const [reviewNewPhotos, setReviewNewPhotos] = useState([]);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");

  const [lastOrder, setLastOrder] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ ...emptyUserData });
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [checkoutCepLoading, setCheckoutCepLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentOverlay, setPaymentOverlay] = useState(null);
  const [pixCancelConfirmOpen, setPixCancelConfirmOpen] = useState(false);
  const [pixPayment, setPixPayment] = useState(null);
  const [pixSecondsLeft, setPixSecondsLeft] = useState(0);
  const [cardBrickReady, setCardBrickReady] = useState(false);

  const analyticsSessionId = useRef(null);
  const checkoutRequestIds = useRef({ pix: null, card: null });

  useEffect(() => {
    const key = "customer-review";
    if (reviewBusy) {
      showSiteLoading(key, {
        eyebrow: "AVALIAÇÃO VERIFICADA",
        title: "Enviando sua avaliação...",
        message: "Estamos salvando seu comentário e preparando as fotos para análise.",
        status: "Enviando avaliação",
        note: "Mantenha esta tela aberta até a confirmação.",
      });
    } else {
      hideSiteLoading(key);
    }

    return () => hideSiteLoading(key);
  }, [hideSiteLoading, reviewBusy, showSiteLoading]);

  useEffect(() => {
    const key = "customer-avatar";
    if (avatarBusy) {
      showSiteLoading(key, {
        eyebrow: "MINHA CONTA",
        title: "Atualizando seu avatar...",
        message: "Estamos salvando a nova imagem do seu perfil com segurança.",
        status: "Salvando avatar",
        note: "Não feche esta janela enquanto a imagem é enviada.",
      });
    } else {
      hideSiteLoading(key);
    }

    return () => hideSiteLoading(key);
  }, [avatarBusy, hideSiteLoading, showSiteLoading]);

  useEffect(() => {
    const key = "customer-profile";
    if (profileBusy) {
      showSiteLoading(key, {
        eyebrow: "DADOS DA CONTA",
        title: "Salvando seus dados...",
        message: "Estamos atualizando suas informações pessoais e de entrega.",
        status: "Protegendo suas informações",
        note: "Aguarde a confirmação antes de sair desta tela.",
      });
    } else {
      hideSiteLoading(key);
    }

    return () => hideSiteLoading(key);
  }, [hideSiteLoading, profileBusy, showSiteLoading]);

  const user = authUser
    ? {
        id: authUser.id,
        name:
          userData.name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "Usuário",
        email: profile?.email || authUser.email || "",
      }
    : null;

  const isAdmin =
    profile?.status === "active" && ["admin", "owner"].includes(profile?.role);
  const isOwner = profile?.status === "active" && profile?.role === "owner";

  useEffect(() => {
    languageRef.current = language;
    const meta = languageMeta(language);

    try {
      localStorage.setItem("brothersGamesLanguage", language);
    } catch {}

    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
    document.body?.setAttribute("dir", meta.dir);

    const root = document.getElementById("root");
    if (root) {
      requestAnimationFrame(() => {
        translateDom(
          root,
          language,
          i18nTextMemoryRef.current,
          i18nAttrMemoryRef.current
        );
      });
    }
  }, [language]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    let scheduled = false;
    const apply = () => {
      scheduled = false;
      translateDom(
        root,
        languageRef.current,
        i18nTextMemoryRef.current,
        i18nAttrMemoryRef.current
      );
    };

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(apply);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    requestAnimationFrame(apply);

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};

    // A entrada atual representa a Home; isso habilita o histórico sem duplicar a página inicial.
    window.history.replaceState(
      {
        ...currentState,
        brothersGames: true,
        brothersGamesPage: "home",
      },
      "",
      window.location.href
    );

    browserHistoryReadyRef.current = true;

    function handleBrowserPopState(event) {
      const state = event.state || {};
      const requestedPage =
        state.brothersGames && state.brothersGamesPage
          ? state.brothersGamesPage
          : "home";

      browserHistoryPopRef.current = true;

      // Fecha overlays para o botão do navegador retornar à tela anterior de forma limpa.
      setAccountOpen(false);
      setInstitutionalPage(null);

      if (requestedPage === "admin" && !isAdmin) {
        setPage("home");
      } else {
        setPage(requestedPage);
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    }

    window.addEventListener("popstate", handleBrowserPopState);

    return () => {
      window.removeEventListener("popstate", handleBrowserPopState);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!browserHistoryReadyRef.current) return;

    // Se a troca de página veio do próprio histórico, não criamos outra entrada.
    if (browserHistoryPopRef.current) {
      browserHistoryPopRef.current = false;
      return;
    }

    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};

    if (
      currentState.brothersGames &&
      currentState.brothersGamesPage === page
    ) {
      return;
    }

    window.history.pushState(
      {
        ...currentState,
        brothersGames: true,
        brothersGamesPage: page,
      },
      "",
      window.location.href
    );
  }, [page]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function getAnalyticsSessionId() {
    if (analyticsSessionId.current) return analyticsSessionId.current;

    const key = "brothersGamesAnalyticsSession";
    let value = localStorage.getItem(key);

    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(key, value);
    }

    analyticsSessionId.current = value;
    return value;
  }

  function trackProductEvent(productId, eventType) {
    if (!productId) return;

    void supabase
      .rpc("track_product_event", {
        p_product_id: productId,
        p_event_type: eventType,
        p_session_id: getAnalyticsSessionId(),
      })
      .then(({ error }) => {
        if (error) console.error("Erro ao registrar analytics:", error);
      });
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = Date.now();
      const visible = (data || [])
        .filter((product) => {
          const published = !product.publish_at || new Date(product.publish_at).getTime() <= now;
          const notRemoved = !product.remove_at || new Date(product.remove_at).getTime() > now;
          return published && notRemoved;
        })
        .map(normalizeProduct);

      setProducts(visible);

      if (selectedProduct) {
        const updated = visible.find((product) => product.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      }
    } catch (error) {
      console.error(error);
      setProductsError(error?.message || "Não foi possível carregar os produtos.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadPublicReviews() {
    setReviewsLoading(true);

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("approved_product_reviews")
        .select("id,product_id,rating,comment,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (reviewsError) throw reviewsError;

      const reviewIds = (reviewsData || []).map((review) => review.id);
      let photosData = [];

      if (reviewIds.length) {
        const { data, error } = await supabase
          .from("approved_review_photos")
          .select("id,review_id,storage_path,sort_order,created_at")
          .in("review_id", reviewIds)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        photosData = data || [];
      }

      setPublicReviews(reviewsData || []);
      setPublicReviewPhotos(photosData);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      setPublicReviews([]);
      setPublicReviewPhotos([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  function reviewPhotoPublicUrl(path) {
    if (!path) return "";
    const { data } = supabase.storage.from("review-images").getPublicUrl(path);
    return data?.publicUrl || "";
  }

  const publicReviewsByProduct = useMemo(() => {
    const map = new Map();

    for (const review of publicReviews) {
      const list = map.get(review.product_id) || [];
      list.push(review);
      map.set(review.product_id, list);
    }

    return map;
  }, [publicReviews]);

  function approvedReviewsForProduct(product) {
    if (!product?.id) return [];
    const verifiedReviews = publicReviewsByProduct.get(product.id) || [];
    return [...verifiedReviews, ...demoReviewsForProduct(product)];
  }

  function getProductRating(product) {
    const rows = approvedReviewsForProduct(product);
    if (!rows.length) return 0;
    return rows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / rows.length;
  }

  function getReviewCount(product) {
    return approvedReviewsForProduct(product).length;
  }

  function photosForPublicReview(reviewId) {
    return publicReviewPhotos
      .filter((photo) => photo.review_id === reviewId)
      .map((photo) => ({
        ...photo,
        publicUrl: reviewPhotoPublicUrl(photo.storage_path),
      }));
  }

  async function hydrateUser(supabaseUser) {
    try {
      setAuthLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id,email,role,status,suspended_until")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Perfil da conta não encontrado.");

      let effectiveProfile = profileData;

      if (profileData.status === "blocked") {
        await supabase.auth.signOut();
        setAccountForm((current) => ({ ...current, password: "" }));
        showSiteAlert("Esta conta está bloqueada e não pode acessar o site.", {
          title: "Conta bloqueada",
          eyebrow: "ACESSO NEGADO",
          variant: "error",
        });
        return false;
      }

      if (profileData.status === "suspended") {
        const suspensionEnds = profileData.suspended_until
          ? new Date(profileData.suspended_until)
          : null;
        const stillActive = !suspensionEnds || suspensionEnds.getTime() > Date.now();

        if (stillActive) {
          await supabase.auth.signOut();
          setAccountForm((current) => ({ ...current, password: "" }));
          showSiteAlert(
            suspensionEnds
              ? `Esta conta está suspensa até ${suspensionEnds.toLocaleString("pt-BR")}.`
              : "Esta conta está temporariamente suspensa.",
            {
              title: "Conta suspensa",
              eyebrow: "ACESSO TEMPORARIAMENTE INDISPONÍVEL",
              variant: "warning",
            }
          );
          return false;
        }

        // Uma suspensão com prazo vencido não deve continuar bloqueando a conta
        // enquanto o administrador ainda não atualizou o registro no painel.
        effectiveProfile = {
          ...profileData,
          status: "active",
          suspended_until: null,
        };
      }

      const { data: privateData, error: privateError } = await supabase
        .from("customer_private")
        .select("full_name,phone,cep,address,number,complement,neighborhood,city,state,avatar_type,avatar_value")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (privateError) throw privateError;

      setAuthUser(supabaseUser);
      setProfile(effectiveProfile);
      setUserData({
        name: privateData?.full_name || supabaseUser.user_metadata?.full_name || "",
        email: effectiveProfile.email || supabaseUser.email || "",
        phone: formatPhone(privateData?.phone || ""),
        cep: privateData?.cep || "",
        address: privateData?.address || "",
        number: privateData?.number || "",
        complement: privateData?.complement || "",
        neighborhood: privateData?.neighborhood || "",
        city: privateData?.city || "",
        state: privateData?.state || "",
        avatarType: privateData?.avatar_type || "preset",
        avatarValue: privateData?.avatar_value || "gamer-red",
      });

      return true;
    } catch (error) {
      console.error("Erro ao carregar conta:", error);
      showSiteAlert("Não foi possível carregar os dados da sua conta.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem("brothersGamesTheme", theme);
    } catch {
      // O tema continua funcionando mesmo se o navegador bloquear o storage.
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#08090b" : "#f5f7fb");
    }
  }, [theme]);

  useEffect(() => {
    void loadProducts();
    void loadPublicReviews();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error(error);
        if (!mounted) return;

        if (session?.user) await hydrateUser(session.user);
        else setAuthLoading(false);
      } catch (error) {
        console.error(error);
        if (mounted) setAuthLoading(false);
      }
    }

    void startAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery((current) => ({
          ...current,
          active: true,
          step: "new-password",
          error: "",
          notice: "E-mail confirmado. Agora crie sua nova senha.",
        }));
        setAccountOpen(true);
        setAuthLoading(false);
      }

      if (session?.user) {
        setTimeout(() => {
          if (mounted) void hydrateUser(session.user);
        }, 0);
      } else {
        setAuthUser(null);
        setProfile(null);
        setUserData({ ...emptyUserData });
        setAuthLoading(false);
        if (page === "admin") setPage("home");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (page !== "pixPayment" || !pixPayment?.expiresAt) return undefined;

    const updateCountdown = () => {
      const expiresAt = new Date(pixPayment.expiresAt).getTime();
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setPixSecondsLeft(seconds);

      if (seconds <= 0) {
        setPixPayment((current) =>
          current ? { ...current, status: current.status === "paid" ? "paid" : "expired" } : current
        );
      }
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [page, pixPayment?.expiresAt]);

  useEffect(() => {
    if (page !== "pixPayment" || !pixPayment?.orderId) return undefined;

    const interval = window.setInterval(() => {
      void refreshPixStatus(true);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [page, pixPayment?.orderId]);

  useEffect(() => {
    let cancelled = false;

    async function loadExchangeRates() {
      const cacheKey = "brothersGamesExchangeRatesV1";
      const maxAge = 12 * 60 * 60 * 1000;

      try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const cachedAt = Number(cached?.updatedAt || 0);
          if (
            cached?.rates &&
            Number.isFinite(cachedAt) &&
            Date.now() - cachedAt < maxAge
          ) {
            if (!cancelled) {
              setExchangeRates({ ...FALLBACK_BRL_RATES, ...cached.rates, BRL: 1 });
              setExchangeRatesUpdatedAt(cachedAt);
            }
            return;
          }
        }
      } catch {
        // Cache indisponível: continua para a consulta online.
      }

      try {
        const response = await fetch("https://open.er-api.com/v6/latest/BRL", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("EXCHANGE_RATE_HTTP_ERROR");

        const payload = await response.json();
        const onlineRates = payload?.rates || {};
        const nextRates = {
          ...FALLBACK_BRL_RATES,
          BRL: 1,
          USD: Number(onlineRates.USD) || FALLBACK_BRL_RATES.USD,
          EUR: Number(onlineRates.EUR) || FALLBACK_BRL_RATES.EUR,
          CNY: Number(onlineRates.CNY) || FALLBACK_BRL_RATES.CNY,
          INR: Number(onlineRates.INR) || FALLBACK_BRL_RATES.INR,
          SAR: Number(onlineRates.SAR) || FALLBACK_BRL_RATES.SAR,
        };
        const updatedAt = Date.now();

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ rates: nextRates, updatedAt })
          );
        } catch {
          // O site continua normalmente mesmo sem localStorage.
        }

        if (!cancelled) {
          setExchangeRates(nextRates);
          setExchangeRatesUpdatedAt(updatedAt);
        }
      } catch (error) {
        console.warn("Câmbio: usando taxas de fallback para exibição.", error);
      }
    }

    void loadExchangeRates();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatPrice(value) {
    return formatLocalizedPrice(value, language, exchangeRates);
  }

  function displayCurrencyToBRL(value) {
    if (value === "" || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    const { currency } = currencyMeta(language);
    const rate = Number(exchangeRates?.[currency] ?? FALLBACK_BRL_RATES[currency] ?? 1);
    return rate > 0 ? numeric / rate : numeric;
  }

  function freeShippingThresholdLabel() {
    return formatPrice(299);
  }

  const categories = useMemo(
    () => ["Todos", ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const productFilterCategories = useMemo(
    () => [
      "Todos",
      "Periféricos",
      ...categories.filter((item) => item !== "Todos" && item !== "Periféricos"),
    ],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        category === "Todos" ||
        (category === "Periféricos" && isPeripheralCategory(product.category)) ||
        product.category === category;
      const translatedName = translateProductName(product.name || "", language);
      const translatedCategory = translateCategoryName(product.category || "", language);
      const text = `${product.name || ""} ${translatedName} ${product.description || ""} ${
        product.category || ""
      } ${translatedCategory}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const price = Number(product.price || 0);
      const minimumBRL = displayCurrencyToBRL(priceMin);
      const maximumBRL = displayCurrencyToBRL(priceMax);
      const minimum = priceMin === "" || minimumBRL === null || price >= minimumBRL;
      const maximum = priceMax === "" || maximumBRL === null || price <= maximumBRL;
      const matchesOffer = !offersOnly || Boolean(product.is_offer);

      return matchesCategory && matchesSearch && minimum && maximum && matchesOffer;
    });

    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "name") {
      result = [...result].sort((a, b) => translateProductName(a.name, language).localeCompare(translateProductName(b.name, language)));
    }

    return result;
  }, [products, category, search, priceMin, priceMax, sort, offersOnly, language, exchangeRates]);

  const offerSummary = useMemo(() => {
    const activeOffers = products.filter((product) => Boolean(product.is_offer));
    const maximumDiscount = activeOffers.reduce(
      (maximum, product) => Math.max(maximum, getDiscountPercent(product)),
      0
    );

    return {
      count: activeOffers.length,
      maximumDiscount,
    };
  }, [products]);

  function goTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setPage("home");
    setSearch("");
    setCategory("Todos");
    setPriceMin("");
    setPriceMax("");
    setSort("relevance");
    setOffersOnly(false);
    goTop();
  }

  function openProducts(selectedCategory = "Todos") {
    setCategory(selectedCategory);
    setOffersOnly(false);
    setPage("products");
    goTop();
  }

  function openOffers() {
    setCategory("Todos");
    setOffersOnly(true);
    setSort("relevance");
    setPage("products");
    goTop();
  }

  function openProduct(product) {
    if (!product) return;
    setPreviousPage(page);
    setSelectedProduct(product);
    setPage("product");
    trackProductEvent(product.id, "view");
    goTop();
  }

  function closeProduct() {
    if (previousPage === "home") setPage("home");
    else if (previousPage === "cart") setPage("cart");
    else setPage("products");
    goTop();
  }

  function insertProduct(currentCart, product) {
    const existing = currentCart.find((item) => item.id === product.id);
    if (existing) {
      return currentCart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    }
    return [...currentCart, { ...product, quantity: 1 }];
  }

  function resetShippingSelection() {
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError("");
  }

  function addToCart(product) {
    if (!product) return;
    setCart((currentCart) => insertProduct(currentCart, product));
    resetShippingSelection();
    trackProductEvent(product.id, "add_to_cart");
  }

  function aiAddToCart(product, quantity = 1) {
    if (!product) return;
    const safeQuantity = Math.max(1, Math.min(10, Number(quantity) || 1));

    setCart((currentCart) => {
      let next = currentCart;
      for (let index = 0; index < safeQuantity; index += 1) {
        next = insertProduct(next, product);
      }
      return next;
    });

    resetShippingSelection();
    trackProductEvent(product.id, "add_to_cart");
  }

  function aiRemoveFromCart(productId) {
    if (!productId) return;
    setCart((currentCart) =>
      currentCart.filter((item) => String(item.id) !== String(productId))
    );
    resetShippingSelection();
  }

  function aiSetCartQuantity(productId, quantity) {
    if (!productId) return;
    const safeQuantity = Math.max(0, Math.min(20, Number(quantity) || 0));

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          String(item.id) === String(productId)
            ? { ...item, quantity: safeQuantity }
            : item
        )
        .filter((item) => Number(item.quantity || 0) > 0)
    );

    resetShippingSelection();
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
    resetShippingSelection();
  }

  function cartQuantity() {
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  function cartSubtotal() {
    return cart.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }

  function physicalCartSubtotal() {
    return cart.reduce((total, item) => {
      if (!isPhysicalProduct(item)) return total;
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }

  function hasPhysicalProducts() {
    return cart.some((item) => isPhysicalProduct(item));
  }

  function shippingIsReady() {
    if (!hasPhysicalProducts()) return true;
    return Boolean(selectedShipping?.serviceId);
  }

  function cartShipping() {
    if (!hasPhysicalProducts()) return 0;
    if (physicalCartSubtotal() >= 299) return 0;
    if (selectedShipping?.serviceId) return Number(selectedShipping.price || 0);
    return null;
  }

  function cartTotal() {
    return cartSubtotal() + (cartShipping() ?? 0);
  }

  async function calculateShipping(postalCode = checkoutData.cep) {
    const cleanPostalCode = String(postalCode || "").replace(/\D/g, "");

    if (!hasPhysicalProducts()) {
      setShippingOptions([]);
      setSelectedShipping({
        serviceId: "digital",
        name: "Entrega digital",
        carrier: "BROTHER'S GAMES",
        price: 0,
        deliveryDays: 0,
        isFree: true,
      });
      setShippingError("");
      return;
    }

    if (cleanPostalCode.length !== 8) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingError("Informe um CEP válido com 8 números para calcular o frete.");
      return;
    }

    if (!authUser) {
      setShippingError("Entre na sua conta para calcular o frete.");
      return;
    }

    setShippingLoading(true);
    setShippingError("");
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const { data, error } = await supabase.functions.invoke("calculate-shipping", {
        body: {
          postalCode: cleanPostalCode,
          items: checkoutItemsPayload(),
        },
      });

      if (error) {
        throw new Error(
          await getFunctionErrorMessage(error, "Não foi possível calcular o frete.")
        );
      }

      if (!data?.success) {
        throw new Error(data?.error || "Não foi possível calcular o frete.");
      }

      if (data.digitalOnly) {
        setSelectedShipping({
          serviceId: "digital",
          name: "Entrega digital",
          carrier: "BROTHER'S GAMES",
          price: 0,
          deliveryDays: 0,
          isFree: true,
        });
        return;
      }

      const options = Array.isArray(data.options) ? data.options : [];
      if (!options.length) {
        throw new Error("Nenhuma opção de frete está disponível para este CEP.");
      }

      setShippingOptions(options);
      setSelectedShipping(options.length === 1 && data.freeShipping ? options[0] : null);
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      setShippingError(error?.message || "Não foi possível calcular o frete.");
    } finally {
      setShippingLoading(false);
    }
  }

  function openCart() {
    setPage("cart");
    goTop();
  }

  function openAccount() {
    setAccountOpen(true);
    setAccountPage("home");
  }

  function openFooterMyData() {
    setAccountOpen(true);
    setAccountPage(authUser ? "data" : "home");
  }

  function openFooterMyOrders() {
    setAccountOpen(true);
    setTrackingOrderId(null);
    setAccountPage(authUser ? "orders" : "home");
    if (authUser) void loadMyOrders(true);
  }

  function openInstitutionalPage(section) {
    setInstitutionalPage(section);
  }

  function closeInstitutionalPage() {
    setInstitutionalPage(null);
  }

  function closeAccount() {
    if (passwordRecovery.active && passwordRecovery.step === "new-password") {
      void supabase.auth.signOut();
    }

    setAccountOpen(false);
    setAccountPage("home");
    setIssueOrderId(null);
    setIssueMessages([]);
    setIssueImageUrl("");
    cleanupIssueImagePreview();
    setPasswordRecovery(emptyPasswordRecoveryState(accountForm.email));
  }

  function openMyData() {
    setAccountPage("data");
  }

  async function loadMyOrders(withOverlay = false) {
    if (!authUser) return;
    const overlayKey = "customer-orders";

    if (withOverlay) {
      showSiteLoading(overlayKey, {
        eyebrow: "MINHA CONTA",
        title: "Atualizando seus pedidos...",
        message: "Estamos buscando os pagamentos, produtos e o andamento das suas entregas.",
        status: "Sincronizando pedidos",
        note: "Isso normalmente leva apenas alguns segundos.",
      });
    }

    setMyOrdersLoading(true);

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", authUser.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const ids = (ordersData || []).map((order) => order.id);
      let itemsData = [];

      if (ids.length) {
        const { data, error } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", ids);
        if (error) throw error;
        itemsData = data || [];
      }

      let fulfillmentData = [];

      if (ids.length) {
        const { data, error } = await supabase
          .from("order_item_fulfillments")
          .select("*")
          .in("order_id", ids);

        if (error) throw error;
        fulfillmentData = data || [];
      }

      const { data: issuesData, error: issuesError } = await supabase
        .from("order_issues")
        .select("*")
        .eq("customer_id", authUser.id)
        .order("created_at", { ascending: false });

      if (issuesError) throw issuesError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("product_reviews")
        .select("id,product_id,order_id,rating,comment,is_approved,moderation_status,moderation_note,created_at,updated_at")
        .eq("user_id", authUser.id)
        .order("updated_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewIds = (reviewsData || []).map((review) => review.id);
      let reviewPhotosData = [];

      if (reviewIds.length) {
        const { data, error } = await supabase
          .from("review_photos")
          .select("id,review_id,storage_path,sort_order,created_at")
          .in("review_id", reviewIds)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        reviewPhotosData = data || [];
      }

      setMyOrders(ordersData || []);
      setMyOrderItems(itemsData);
      setMyOrderFulfillments(fulfillmentData);
      setMyOrderIssues(issuesData || []);
      setMyReviews(reviewsData || []);
      setMyReviewPhotos(reviewPhotosData);
    } catch (error) {
      console.error(error);
      showSiteAlert("Não foi possível carregar seus pedidos.");
    } finally {
      setMyOrdersLoading(false);
      if (withOverlay) hideSiteLoading(overlayKey);
    }
  }

  function openMyOrders() {
    setAccountOpen(true);
    setTrackingOrderId(null);
    setAccountPage("orders");
    void loadMyOrders(true);
  }

  function openOrderTracking(order) {
    if (!order?.id) return;
    setTrackingOrderId(order.id);
    setAccountPage("orderTracking");
    void loadMyOrders(true);
  }


  function issueForOrder(orderId) {
    return myOrderIssues.find((issue) => issue.order_id === orderId) || null;
  }

  function cleanupIssueImagePreview() {
    if (issueImagePreview) URL.revokeObjectURL(issueImagePreview);
    setIssueImagePreview("");
    setIssueImageFile(null);
  }

  async function loadIssueImage(issue) {
    setIssueImageUrl("");
    if (!issue?.image_path) return;
    const { data, error } = await supabase.storage
      .from("order-issues")
      .createSignedUrl(issue.image_path, 60 * 10);
    if (!error && data?.signedUrl) setIssueImageUrl(data.signedUrl);
  }

  async function loadIssueMessages(issueId, silent = false) {
    if (!issueId) return;
    if (!silent) setIssueMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_issue_messages")
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setIssueMessages(data || []);
    } catch (error) {
      console.error(error);
      if (!silent) showSiteAlert("Não foi possível carregar a conversa.");
    } finally {
      if (!silent) setIssueMessagesLoading(false);
    }
  }

  async function openOrderIssue(order) {
    if (!order?.id) return;
    setIssueOrderId(order.id);
    setIssueDescription("");
    setIssueMessage("");
    cleanupIssueImagePreview();
    setIssueImageUrl("");
    setIssueMessages([]);
    setAccountPage("orderIssue");

    const existing = issueForOrder(order.id);
    if (existing) {
      await Promise.all([loadIssueMessages(existing.id), loadIssueImage(existing)]);
    }
  }

  function handleIssueImageChange(event) {
    const file = event.target.files?.[0] || null;
    cleanupIssueImagePreview();
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showSiteAlert("Envie uma imagem JPG, PNG ou WEBP.", { variant: "warning" });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSiteAlert("A imagem pode ter no máximo 5 MB.", { variant: "warning" });
      event.target.value = "";
      return;
    }

    setIssueImageFile(file);
    setIssueImagePreview(URL.createObjectURL(file));
  }

  async function submitOrderIssue(order) {
    if (!order?.id || issueBusy) return;
    const description = issueDescription.trim();
    if (description.length < 10) {
      showSiteAlert("Descreva o problema com pelo menos 10 caracteres.", { variant: "warning" });
      return;
    }

    setIssueBusy(true);
    showSiteLoading("order-issue", {
      eyebrow: "SUPORTE DO PEDIDO",
      title: "Enviando sua solicitação...",
      message: "Estamos registrando o problema e preparando o atendimento.",
      status: "Abrindo chamado",
    });

    try {
      const { data, error } = await supabase.rpc("customer_open_order_issue", {
        p_order_id: order.id,
        p_description: description,
      });
      if (error) throw error;

      const issue = Array.isArray(data) ? data[0] : data;
      if (!issue?.id) throw new Error("O chamado foi criado, mas não foi possível identificá-lo.");

      if (issueImageFile) {
        const extension = issueImageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const imagePath = `${authUser.id}/${issue.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("order-issues")
          .upload(imagePath, issueImageFile, { upsert: false, contentType: issueImageFile.type });
        if (uploadError) throw uploadError;

        const { error: attachError } = await supabase.rpc("customer_attach_issue_image", {
          p_issue_id: issue.id,
          p_image_path: imagePath,
        });
        if (attachError) throw attachError;
      }

      // Avisa Admin/Owner por e-mail após o chamado estar completamente criado,
      // inclusive depois de anexar a imagem, quando houver.
      try {
        const { error: notifyError } = await supabase.functions.invoke(
          "notify-order-issue-opened",
          {
            body: {
              issue_id: issue.id,
            },
          }
        );

        if (notifyError) {
          console.error(
            "Chamado criado, mas não foi possível enviar a notificação por e-mail ao suporte:",
            notifyError
          );
        }
      } catch (notifyError) {
        // O chamado continua válido mesmo se o serviço de e-mail estiver indisponível.
        console.error(
          "Chamado criado, mas a notificação por e-mail ao suporte falhou:",
          notifyError
        );
      }

      cleanupIssueImagePreview();
      setIssueDescription("");
      await loadMyOrders(false);
      showSiteAlert("Solicitação enviada. Nossa equipe irá analisar o seu caso.", {
        title: "Chamado aberto",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível abrir a solicitação.");
    } finally {
      hideSiteLoading("order-issue");
      setIssueBusy(false);
    }
  }

  async function sendIssueMessage(issue) {
    const message = issueMessage.trim();
    if (!issue?.id || !message || issueBusy) return;

    setIssueBusy(true);
    try {
      const { error } = await supabase.from("order_issue_messages").insert({
        issue_id: issue.id,
        sender_id: authUser.id,
        sender_role: "customer",
        message,
      });
      if (error) throw error;
      setIssueMessage("");
      await loadIssueMessages(issue.id, true);
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível enviar a mensagem.");
    } finally {
      setIssueBusy(false);
    }
  }

  useEffect(() => {
    const issue = issueForOrder(issueOrderId);
    if (!issue?.id || accountPage !== "orderIssue") return undefined;

    const channel = supabase
      .channel(`order-issue-${issue.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_issue_messages", filter: `issue_id=eq.${issue.id}` },
        () => void loadIssueMessages(issue.id, true)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "order_issues", filter: `id=eq.${issue.id}` },
        () => void loadMyOrders(false)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [accountPage, issueOrderId, myOrderIssues]);

  function cleanupReviewNewPhotos() {
    for (const photo of reviewNewPhotos) {
      if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
    }
    setReviewNewPhotos([]);
  }

  function closeReviewModal() {
    if (reviewBusy) return;
    cleanupReviewNewPhotos();
    setReviewModal(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewExistingPhotos([]);
    setReviewError("");
  }

  function openReviewModal(order, item) {
    if (!authUser || !order?.id || !item?.product_id) return;
    if (normalizedFulfillmentStatus(order) !== "delivered") return;

    cleanupReviewNewPhotos();

    const existingReview = myReviews.find(
      (review) => review.product_id === item.product_id
    );

    const reviewId = existingReview?.id || crypto.randomUUID();
    const photos = existingReview
      ? myReviewPhotos
          .filter((photo) => photo.review_id === existingReview.id)
          .map((photo) => ({
            ...photo,
            publicUrl: reviewPhotoPublicUrl(photo.storage_path),
          }))
      : [];

    setReviewModal({
      reviewId,
      orderId: order.id,
      productId: item.product_id,
      productName: item.product_name,
      existingReview: existingReview || null,
    });
    setReviewRating(Number(existingReview?.rating || 5));
    setReviewComment(existingReview?.comment || "");
    setReviewExistingPhotos(photos);
    setReviewError("");
  }

  function handleReviewFiles(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length) return;

    const slotsLeft = 3 - reviewExistingPhotos.length - reviewNewPhotos.length;
    if (slotsLeft <= 0) {
      setReviewError("Você pode anexar no máximo 3 fotos.");
      return;
    }

    const accepted = [];

    for (const file of selected.slice(0, slotsLeft)) {
      const extension = reviewImageExtension(file);
      if (!extension) {
        setReviewError("Use somente imagens JPG, PNG ou WEBP.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setReviewError("Cada foto pode ter no máximo 5 MB.");
        continue;
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        extension,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length) {
      setReviewNewPhotos((current) => [...current, ...accepted]);
      setReviewError("");
    }
  }

  function removeNewReviewPhoto(photoId) {
    setReviewNewPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  }

  function removeExistingReviewPhoto(photoId) {
    setReviewExistingPhotos((current) =>
      current.filter((photo) => photo.id !== photoId)
    );
  }

  async function submitProductReview(event) {
    event.preventDefault();
    if (!authUser || !reviewModal || reviewBusy) return;

    const cleanComment = reviewComment.trim();
    if (!Number.isInteger(Number(reviewRating)) || reviewRating < 1 || reviewRating > 5) {
      setReviewError("Escolha uma nota entre 1 e 5 estrelas.");
      return;
    }
    if (cleanComment.length < 5) {
      setReviewError("Escreva pelo menos 5 caracteres sobre sua compra.");
      return;
    }
    if (cleanComment.length > 1200) {
      setReviewError("O comentário pode ter no máximo 1200 caracteres.");
      return;
    }

    setReviewBusy(true);
    setReviewError("");

    const uploadedPaths = [];

    try {
      for (const photo of reviewNewPhotos) {
        const path = `${authUser.id}/${reviewModal.reviewId}/${crypto.randomUUID()}.${photo.extension}`;
        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(path, photo.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: photo.file.type,
          });

        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }

      const photoPaths = [
        ...reviewExistingPhotos.map((photo) => photo.storage_path),
        ...uploadedPaths,
      ];

      const reviewPayload = {
        reviewId: reviewModal.reviewId,
        orderId: reviewModal.orderId,
        productId: reviewModal.productId,
        rating: Number(reviewRating),
        comment: cleanComment,
        photoPaths,
      };

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sua sessão expirou. Entre novamente antes de enviar a avaliação.");
      }

      const invokeReviewFunction = () =>
        supabase.functions.invoke("submit-product-review", {
          body: reviewPayload,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

      let { data, error } = await invokeReviewFunction();

      // Uma nova tentativa corrige falhas momentâneas de rede/CORS sem duplicar
      // a avaliação, pois o mesmo reviewId é reutilizado pela função.
      if (
        error?.name === "FunctionsFetchError" ||
        String(error?.message || "").toLowerCase().includes("failed to send") ||
        String(error?.message || "").toLowerCase().includes("failed to fetch")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        ({ data, error } = await invokeReviewFunction());
      }

      if (error) {
        throw new Error(
          await getFunctionErrorMessage(
            error,
            "Não foi possível enviar sua avaliação."
          )
        );
      }

      if (!data?.success) {
        throw new Error(data?.error || "Não foi possível enviar sua avaliação.");
      }

      cleanupReviewNewPhotos();
      setReviewModal(null);
      setReviewNotice(
        "Avaliação enviada para análise. Ela será publicada após a aprovação da equipe."
      );
      void loadMyOrders();
      void loadPublicReviews();
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from("review-images").remove(uploadedPaths);
      }
      setReviewError(error?.message || "Não foi possível enviar sua avaliação.");
    } finally {
      setReviewBusy(false);
    }
  }

  function startAuthActionOverlay(action) {
    const content = {
      login: {
        icon: "→",
        eyebrow: "ACESSO SEGURO",
        title: "Entrando na sua conta...",
        message: "Estamos verificando seus dados e preparando sua área de cliente.",
        status: "Autenticando suas informações",
        note: "Aguarde alguns segundos. Não feche ou atualize esta página.",
      },
      logout: {
        icon: "←",
        eyebrow: "SESSÃO SEGURA",
        title: "Saindo da sua conta...",
        message: "Estamos encerrando sua sessão com segurança neste dispositivo.",
        status: "Finalizando sua sessão",
        note: "Aguarde até que o processo seja concluído automaticamente.",
      },
      "reset-code": {
        icon: "✉",
        eyebrow: "RECUPERAÇÃO SEGURA",
        title: "Enviando o código...",
        message: "Estamos preparando um código seguro para redefinir sua senha.",
        status: "Enviando código para seu e-mail",
        note: "Aguarde alguns segundos antes de solicitar um novo código.",
      },
      password: {
        icon: "◆",
        eyebrow: "PROTEÇÃO DA CONTA",
        title: "Redefinindo sua senha...",
        message: "Estamos salvando sua nova senha e protegendo novamente sua conta.",
        status: "Atualizando suas credenciais",
        note: "Quando terminarmos, entre novamente usando a nova senha.",
      },
    }[action];

    setAuthActionOverlay(content || null);
    return Date.now();
  }

  async function finishAuthActionOverlay(startedAt, minimumDuration = 1000) {
    const remainingTime = minimumDuration - (Date.now() - startedAt);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    setAuthActionOverlay(null);
  }

  async function handleAccountSubmit(event) {
    event.preventDefault();
    if (authBusy) return;
    setAuthNotice("");

    const email = accountForm.email.trim().toLowerCase();
    const password = accountForm.password;

    if (!email || !password) return showSiteAlert("Preencha o e-mail e a senha.", { variant: "warning" });
    if (password.length < 6) return showSiteAlert("A senha precisa ter pelo menos 6 caracteres.", { variant: "warning" });
    if (accountMode === "register" && !accountForm.name.trim()) {
      return showSiteAlert("Digite seu nome.", { variant: "warning" });
    }

    setAuthBusy(true);
    const overlayStartedAt =
      accountMode === "login" ? startAuthActionOverlay("login") : null;
    let overlayFinished = false;
    let loginCompleted = false;

    try {
      if (accountMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: accountForm.name.trim() } },
        });

        if (error) throw error;

        setAccountForm({ name: "", email: "", password: "" });
        setAccountMode("login");

        if (data.session && data.user) {
          await hydrateUser(data.user);
          setAccountPage("home");
          showSiteAlert("Conta criada com sucesso!");
        } else {
          showSiteAlert("Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.", {
            title: "Confirme seu e-mail",
            variant: "success",
          });
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const success = await hydrateUser(data.user);
        if (success) {
          setAccountForm({ name: "", email: "", password: "" });
          setAccountPage("home");
          loginCompleted = true;
        }
      }
    } catch (error) {
      if (overlayStartedAt !== null) {
        await finishAuthActionOverlay(overlayStartedAt);
        overlayFinished = true;
      }

      console.error("Erro de autenticação:", error);
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("invalid login credentials")) showSiteAlert("E-mail ou senha incorretos.");
      else if (message.includes("email not confirmed")) showSiteAlert("Seu e-mail ainda não foi confirmado.");
      else if (message.includes("user already registered")) {
        showSiteAlert("Já existe uma conta cadastrada com esse e-mail.", { variant: "warning" });
      } else showSiteAlert(error?.message || "Não foi possível realizar a autenticação.");
    } finally {
      if (overlayStartedAt !== null && !overlayFinished) {
        await finishAuthActionOverlay(overlayStartedAt);
      }

      setAuthBusy(false);
    }

    if (loginCompleted) {
      showSiteAlert("Você entrou na sua conta com sucesso.", {
        title: "Login realizado",
        eyebrow: "BEM-VINDO DE VOLTA",
        variant: "success",
      });
    }
  }

  function openPasswordRecovery() {
    setAuthNotice("");
    setPasswordRecovery({
      ...emptyPasswordRecoveryState(accountForm.email.trim().toLowerCase()),
      active: true,
    });
  }

  async function cancelPasswordRecovery() {
    if (passwordRecovery.step === "new-password") {
      await supabase.auth.signOut();
    }

    setPasswordRecovery(emptyPasswordRecoveryState(accountForm.email));
    setAccountMode("login");
  }

  function recoveryErrorMessage(error, fallback) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("rate limit") || message.includes("security purposes")) {
      return "Aguarde um pouco antes de solicitar outro link ou código.";
    }

    if (message.includes("expired") || message.includes("invalid")) {
      return "O link ou código é inválido ou expirou. Faça uma nova solicitação.";
    }

    return fallback;
  }

  async function sendPasswordResetCode(event) {
    event?.preventDefault();
    if (authBusy) return;

    const email = passwordRecovery.email.trim().toLowerCase();

    if (!email) {
      setPasswordRecovery((current) => ({
        ...current,
        error: "Digite o e-mail cadastrado na conta.",
        notice: "",
      }));
      return;
    }

    const overlayStartedAt = startAuthActionOverlay("reset-code");
    setAuthBusy(true);
    setPasswordRecovery((current) => ({ ...current, error: "", notice: "" }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setPasswordRecovery((current) => ({
        ...current,
        email,
        step: "verify",
        code: "",
        error: "",
        notice: "Enviamos um código de segurança para o e-mail informado.",
      }));
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      setPasswordRecovery((current) => ({
        ...current,
        error: recoveryErrorMessage(
          error,
          "Não foi possível enviar o código. Confira o e-mail e tente novamente."
        ),
        notice: "",
      }));
    } finally {
      await finishAuthActionOverlay(overlayStartedAt);
      setAuthBusy(false);
    }
  }

  async function verifyPasswordResetCode(event) {
    event.preventDefault();
    if (authBusy) return;

    const token = passwordRecovery.code.replace(/\D/g, "");
    const email = passwordRecovery.email.trim().toLowerCase();

    if (token.length < 6) {
      setPasswordRecovery((current) => ({
        ...current,
        error: "Digite o código recebido.",
        notice: "",
      }));
      return;
    }

    setAuthBusy(true);
    setPasswordRecovery((current) => ({ ...current, error: "", notice: "" }));

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });
      if (error) throw error;

      setPasswordRecovery((current) => ({
        ...current,
        step: "new-password",
        code: "",
        error: "",
        notice: "Código confirmado. Agora crie sua nova senha.",
      }));
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      setPasswordRecovery((current) => ({
        ...current,
        error: recoveryErrorMessage(error, "O código é inválido ou expirou."),
        notice: "",
      }));
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveNewPassword(event) {
    event.preventDefault();
    if (authBusy) return;

    const newPassword = passwordRecovery.newPassword;
    const confirmation = passwordRecovery.confirmPassword;

    if (newPassword.length < 8) {
      setPasswordRecovery((current) => ({
        ...current,
        error: "A nova senha precisa ter pelo menos 8 caracteres.",
        notice: "",
      }));
      return;
    }

    if (newPassword !== confirmation) {
      setPasswordRecovery((current) => ({
        ...current,
        error: "As duas senhas não são iguais.",
        notice: "",
      }));
      return;
    }

    const overlayStartedAt = startAuthActionOverlay("password");
    setAuthBusy(true);
    setPasswordRecovery((current) => ({ ...current, error: "", notice: "" }));
    let passwordChanged = false;

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      await supabase.auth.signOut();
      setAccountForm({ name: "", email: passwordRecovery.email, password: "" });
      setPasswordRecovery(emptyPasswordRecoveryState(passwordRecovery.email));
      setAccountMode("login");
      setAuthNotice("Senha alterada com sucesso. Entre usando sua nova senha.");
      passwordChanged = true;
    } catch (error) {
      console.error("Erro ao salvar nova senha:", error);
      setPasswordRecovery((current) => ({
        ...current,
        error: recoveryErrorMessage(error, "Não foi possível salvar a nova senha."),
        notice: "",
      }));
    } finally {
      await finishAuthActionOverlay(overlayStartedAt, 1200);
      setAuthBusy(false);
    }

    if (passwordChanged) {
      showSiteAlert("Sua senha foi redefinida. Agora você já pode entrar usando a nova senha.", {
        title: "Senha atualizada",
        eyebrow: "CONTA PROTEGIDA",
        variant: "success",
      });
    }
  }

  async function logout() {
    if (authBusy) return;

    const overlayStartedAt = startAuthActionOverlay("logout");
    let logoutError = null;
    setAuthBusy(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthUser(null);
      setProfile(null);
      setUserData({ ...emptyUserData });
      setAccountOpen(false);
      setAccountPage("home");
      setPage("home");
    } catch (error) {
      logoutError = error;
    } finally {
      await finishAuthActionOverlay(overlayStartedAt);
      setAuthBusy(false);
    }

    if (logoutError) {
      console.error(logoutError);
      showSiteAlert("Não foi possível sair da conta.");
      return;
    }

    showSiteAlert("Você saiu da sua conta com segurança.", {
      title: "Sessão encerrada",
      eyebrow: "ATÉ A PRÓXIMA",
      variant: "success",
    });
  }

  function currentAvatarPreset() {
    return avatarPresets.find((preset) => preset.id === userData.avatarValue) || avatarPresets[0];
  }

  function currentAvatarPublicUrl() {
    if (userData.avatarType !== "upload" || !userData.avatarValue) return "";
    const { data } = supabase.storage.from("avatars").getPublicUrl(userData.avatarValue);
    return data?.publicUrl || "";
  }

  function UserAvatar({ className = "", title = "" }) {
    const preset = currentAvatarPreset();
    const uploadedUrl = currentAvatarPublicUrl();

    return (
      <span
        className={`user-avatar ${className}`}
        title={title || (userData.avatarType === "upload" ? "Foto de perfil" : preset.label)}
        aria-label={title || "Avatar do usuário"}
        style={userData.avatarType === "preset" ? { background: preset.background } : undefined}
      >
        {userData.avatarType === "upload" && uploadedUrl ? (
          <img src={uploadedUrl} alt="Foto de perfil" />
        ) : (
          <span className="avatar-preset-emoji">{preset.emoji}</span>
        )}
      </span>
    );
  }

  async function saveAvatarChoice(type, value) {
    if (!authUser) throw new Error("Entre na sua conta novamente.");

    const { error } = await supabase.from("customer_private").upsert(
      { id: authUser.id, avatar_type: type, avatar_value: value },
      { onConflict: "id" }
    );

    if (error) throw error;

    setUserData((current) => ({ ...current, avatarType: type, avatarValue: value }));
  }

  async function removeUploadedAvatar(path) {
    if (!path) return;
    const { error } = await supabase.storage.from("avatars").remove([path]);
    if (error) console.warn("Não foi possível remover o avatar antigo:", error);
  }

  async function selectPresetAvatar(presetId) {
    if (avatarBusy || !authUser) return;
    const preset = avatarPresets.find((item) => item.id === presetId);
    if (!preset) return;
    const previousUpload = userData.avatarType === "upload" ? userData.avatarValue : "";

    setAvatarBusy(true);
    try {
      await saveAvatarChoice("preset", preset.id);
      if (previousUpload) await removeUploadedAvatar(previousUpload);
    } catch (error) {
      console.error("Erro ao trocar avatar:", error);
      showSiteAlert(error?.message || "Não foi possível trocar o avatar.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || avatarBusy || !authUser) return;

    const extension = avatarFileExtension(file);
    if (!extension) return showSiteAlert("Envie uma imagem JPG, PNG ou WEBP.", { variant: "warning" });
    if (file.size > 5 * 1024 * 1024) return showSiteAlert("A foto precisa ter no máximo 5 MB.", { variant: "warning" });

    const previousUpload = userData.avatarType === "upload" ? userData.avatarValue : "";
    const path = `${authUser.id}/avatar-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

    setAvatarBusy(true);
    try {
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      try {
        await saveAvatarChoice("upload", path);
      } catch (databaseError) {
        await supabase.storage.from("avatars").remove([path]);
        throw databaseError;
      }

      if (previousUpload && previousUpload !== path) await removeUploadedAvatar(previousUpload);
    } catch (error) {
      console.error("Erro ao enviar avatar:", error);
      showSiteAlert(error?.message || "Não foi possível enviar sua foto.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function resetAvatarToDefault() {
    if (avatarBusy || !authUser) return;
    const previousUpload = userData.avatarType === "upload" ? userData.avatarValue : "";

    setAvatarBusy(true);
    try {
      await saveAvatarChoice("preset", "gamer-red");
      if (previousUpload) await removeUploadedAvatar(previousUpload);
    } catch (error) {
      console.error("Erro ao restaurar avatar:", error);
      showSiteAlert(error?.message || "Não foi possível restaurar o avatar padrão.");
    } finally {
      setAvatarBusy(false);
    }
  }

  function openAvatarSettings() {
    setAccountOpen(true);
    setAccountPage("avatar");
  }

  async function handleCepChange(value) {
    const formatted = formatCep(value);
    const onlyNumbers = formatted.replace(/\D/g, "");
    setUserData((current) => ({ ...current, cep: formatted }));

    if (onlyNumbers.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
      const data = await response.json();
      if (data.erro) return showSiteAlert("CEP não encontrado.", { variant: "warning" });

      setUserData((current) => ({
        ...current,
        cep: formatted,
        address: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
    } catch (error) {
      console.error(error);
      showSiteAlert("Não foi possível consultar o CEP.");
    }
  }

  async function saveUserData(event) {
    event.preventDefault();
    if (profileBusy) return;
    if (!authUser) return showSiteAlert("Entre na sua conta novamente.", { variant: "warning" });

    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanName = userData.name.trim();
    const cleanPhone = phoneToDigits(userData.phone);

    if (!cleanName) return showSiteAlert("Informe seu nome.", { variant: "warning" });
    if (!cleanEmail) return showSiteAlert("Informe seu e-mail.", { variant: "warning" });

    setProfileBusy(true);

    try {
      const authChanges = { data: { full_name: cleanName } };
      const emailChanged = cleanEmail !== String(authUser.email || "").toLowerCase();
      if (emailChanged) authChanges.email = cleanEmail;

      const { error: authError } = await supabase.auth.updateUser(authChanges);
      if (authError) throw authError;

      const { error: privateError } = await supabase.from("customer_private").upsert(
        {
          id: authUser.id,
          full_name: cleanName,
          phone: cleanPhone,
          cep: userData.cep.trim(),
          address: userData.address.trim(),
          number: userData.number.trim(),
          complement: userData.complement.trim(),
          neighborhood: userData.neighborhood.trim(),
          city: userData.city.trim(),
          state: userData.state.trim(),
          avatar_type: userData.avatarType || "preset",
          avatar_value: userData.avatarValue || "gamer-red",
        },
        { onConflict: "id" }
      );

      if (privateError) throw privateError;

      setUserData((current) => ({
        ...current,
        name: cleanName,
        email: cleanEmail,
        phone: formatPhone(cleanPhone),
      }));

      showSiteAlert(
        emailChanged
          ? "Dados salvos. O Supabase pode enviar uma confirmação para concluir a alteração do e-mail."
          : "Seus dados foram salvos com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      showSiteAlert(error?.message || "Não foi possível salvar seus dados.");
    } finally {
      setProfileBusy(false);
    }
  }

  function prepareCheckoutData() {
    setCheckoutData({
      ...emptyUserData,
      ...userData,
      name: userData.name || user?.name || "",
      email: userData.email || user?.email || "",
      phone: formatPhone(userData.phone),
    });
  }

  function openCheckout() {
    if (!cart.length) return showSiteAlert("Seu carrinho está vazio.", { variant: "warning" });

    if (!user) {
      showSiteAlert("Entre na sua conta para continuar para o checkout.", { variant: "warning" });
      setAccountOpen(true);
      setAccountPage("home");
      return;
    }

    for (const item of cart) trackProductEvent(item.id, "checkout_started");

    prepareCheckoutData();
    setPaymentMethod("pix");
    setPage("checkout");
    goTop();
  }

  function buyNow(product) {
    if (!product) return;
    setCart((currentCart) => insertProduct(currentCart, product));
    resetShippingSelection();
    trackProductEvent(product.id, "add_to_cart");

    if (!user) {
      showSiteAlert("O produto foi adicionado ao carrinho. Entre na sua conta para continuar.", {
        title: "Produto adicionado",
        variant: "success",
      });
      setAccountOpen(true);
      return;
    }

    trackProductEvent(product.id, "checkout_started");
    prepareCheckoutData();
    setPaymentMethod("pix");
    setPage("checkout");
    goTop();
  }

  function updateCheckoutField(field, value) {
    setCheckoutData((current) => ({ ...current, [field]: value }));
  }

  async function handleCheckoutCepChange(value) {
    const formatted = formatCep(value);
    const onlyNumbers = formatted.replace(/\D/g, "");
    setCheckoutData((current) => ({ ...current, cep: formatted }));
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError("");

    if (onlyNumbers.length !== 8) return;
    setCheckoutCepLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
      const data = await response.json();
      if (data.erro) {
        setShippingError("CEP não encontrado.");
        return;
      }

      setCheckoutData((current) => ({
        ...current,
        cep: formatted,
        address: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));

      await calculateShipping(onlyNumbers);
    } catch (error) {
      console.error(error);
      setShippingError("Não foi possível consultar o CEP.");
    } finally {
      setCheckoutCepLoading(false);
    }
  }

  function validateCheckout() {
    const required = [
      [checkoutData.name, "nome"],
      [checkoutData.email, "e-mail"],
      [checkoutData.phone, "telefone"],
      ...(hasPhysicalProducts()
        ? [
            [checkoutData.cep, "CEP"],
            [checkoutData.address, "endereço"],
            [checkoutData.number, "número"],
            [checkoutData.neighborhood, "bairro"],
            [checkoutData.city, "cidade"],
            [checkoutData.state, "estado"],
          ]
        : []),
    ];

    const missing = required.find(([value]) => !String(value || "").trim());
    if (missing) {
      showSiteAlert(`Preencha o campo ${missing[1]}.`, { variant: "warning" });
      return false;
    }

    if (phoneToDigits(checkoutData.phone).length < 10) {
      showSiteAlert("Digite um telefone válido com DDD.", { variant: "warning" });
      return false;
    }

    return true;
  }

  async function getFunctionErrorMessage(error, fallback) {
    try {
      if (error?.context?.clone) {
        const payload = await error.context.clone().json();
        return payload?.error || payload?.message || payload?.detail || fallback;
      }
    } catch {
      // Mantém a mensagem padrão abaixo.
    }

    const technicalMessage = String(error?.message || "").toLowerCase();
    if (
      error?.name === "FunctionsFetchError" ||
      technicalMessage.includes("failed to send") ||
      technicalMessage.includes("failed to fetch") ||
      technicalMessage.includes("networkerror")
    ) {
      return "Não foi possível conectar ao servidor. Confira sua internet, recarregue a página e tente novamente.";
    }

    return error?.message || fallback;
  }

  function checkoutItemsPayload() {
    return cart.map((item) => ({
      productId: item.id,
      quantity: Number(item.quantity || 1),
    }));
  }

  function checkoutRequestIdFor(method, extra = {}) {
    const fingerprint = JSON.stringify({
      userId: authUser?.id || null,
      method,
      items: checkoutItemsPayload()
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
        .sort((a, b) => a.productId.localeCompare(b.productId)),
      shippingServiceId: hasPhysicalProducts()
        ? selectedShipping?.serviceId || null
        : "digital",
      ...extra,
    });

    const current = checkoutRequestIds.current[method];

    if (!current || current.fingerprint !== fingerprint) {
      checkoutRequestIds.current[method] = {
        id: crypto.randomUUID(),
        fingerprint,
      };
    }

    return checkoutRequestIds.current[method].id;
  }

  function resetCheckoutRequestId(method) {
    if (method === "pix" || method === "card") {
      checkoutRequestIds.current[method] = null;
    }
  }

  async function saveCheckoutCustomerData() {
    if (!validateCheckout()) return false;
    if (!authUser) {
      showSiteAlert("Sua sessão expirou. Entre novamente.");
      return false;
    }

    const cleanPhone = phoneToDigits(checkoutData.phone);
    const { error } = await supabase.from("customer_private").upsert(
      {
        id: authUser.id,
        full_name: checkoutData.name.trim(),
        phone: cleanPhone,
        cep: checkoutData.cep.trim(),
        address: checkoutData.address.trim(),
        number: checkoutData.number.trim(),
        complement: checkoutData.complement.trim(),
        neighborhood: checkoutData.neighborhood.trim(),
        city: checkoutData.city.trim(),
        state: checkoutData.state.trim(),
      },
      { onConflict: "id" }
    );

    if (error) throw error;

    setUserData((current) => ({
      ...current,
      name: checkoutData.name,
      phone: formatPhone(cleanPhone),
      cep: checkoutData.cep,
      address: checkoutData.address,
      number: checkoutData.number,
      complement: checkoutData.complement,
      neighborhood: checkoutData.neighborhood,
      city: checkoutData.city,
      state: checkoutData.state,
    }));

    return true;
  }

  function ensurePaymentCanStart() {
    if (!mercadoPagoPublicKey) {
      setPaymentError("A Public Key do Mercado Pago não foi carregada. Reinicie o Vite após configurar o .env.local.");
      return false;
    }

    if (mercadoPagoUsesObviousTestKey) {
      setPaymentError(
        "O checkout ainda está usando uma Public Key de teste. Configure as credenciais de produção do Mercado Pago para receber pagamentos reais."
      );
      return false;
    }

    if (!mercadoPagoProductionEnabled) {
      setPaymentError(
        "Os pagamentos reais ainda não foram ativados no site. Configure VITE_MERCADO_PAGO_MODE=production e publique novamente."
      );
      return false;
    }

    if (!cart.length) {
      setPaymentError("Seu carrinho está vazio.");
      return false;
    }

    if (!shippingIsReady()) {
      setPaymentError(
        "Calcule o frete e escolha uma opção de entrega antes de iniciar o pagamento."
      );
      return false;
    }

    if (cartShipping() === null) {
      setPaymentError("O frete ainda não foi calculado para este carrinho.");
      return false;
    }

    return true;
  }

  function showPaymentOverlay(title, message, mode = "loading") {
    setPaymentOverlay({
      title,
      message,
      mode,
    });
  }

  function hidePaymentOverlay() {
    setPaymentOverlay(null);
  }


  async function notifyOrderCreatedByEmail(orderId) {
    if (!orderId) return;

    try {
      const { error } = await supabase.functions.invoke(
        "notify-order-update",
        {
          body: {
            order_id: orderId,
            reason: "order_created",
          },
        }
      );

      if (error) {
        console.error(
          "Pedido criado, mas não foi possível enviar os e-mails de confirmação:",
          error
        );
      }
    } catch (error) {
      // O checkout não pode falhar só porque o provedor de e-mail está indisponível.
      console.error(
        "Pedido criado, mas a notificação por e-mail falhou:",
        error
      );
    }
  }

  function completePaidOrder(result, method) {
    resetCheckoutRequestId(method);

    setLastOrder({
      id: result.orderId,
      orderNumber: result.orderNumber,
      createdAt: new Date().toLocaleString("pt-BR"),
      subtotal: Number(result.subtotal || cartSubtotal()),
      shipping: Number(result.shipping || 0),
      total: Number(result.total || cartTotal()),
      paymentMethod: method,
      status: "paid",
      paymentId: result.paymentId || null,
      providerOrderId: result.providerOrderId || null,
    });

    setCart([]);
    setPixPayment(null);
    setPaymentError("");

    showPaymentOverlay(
      "Pagamento confirmado!",
      method === "pix"
        ? "Recebemos a confirmação do seu PIX. Seu pedido já foi registrado."
        : "Seu cartão foi aprovado e o pedido já foi registrado.",
      "success"
    );

    setPage("orderSuccess");
    goTop();
    void loadMyOrders();

    window.setTimeout(() => {
      hidePaymentOverlay();
    }, 1200);
  }

  async function startPixPayment() {
    if (paymentBusy || !ensurePaymentCanStart()) return;

    setPaymentBusy(true);
    setPaymentError("");
    showPaymentOverlay(
      "Gerando seu PIX...",
      "Estamos criando o pagamento com segurança. Não feche esta página."
    );

    try {
      const saved = await saveCheckoutCustomerData();
      if (!saved) {
        hidePaymentOverlay();
        return;
      }

      const checkoutRequestId = checkoutRequestIdFor("pix");

      const { data, error } = await supabase.functions.invoke("create-checkout-payment", {
        body: {
          checkoutRequestId,
          paymentMethod: "pix",
          items: checkoutItemsPayload(),
          shippingServiceId: hasPhysicalProducts() ? selectedShipping?.serviceId : null,
        },
      });

      if (error) {
        throw new Error(await getFunctionErrorMessage(error, "Não foi possível gerar o PIX."));
      }

      if (!data?.success || !data?.orderId) {
        throw new Error(data?.error || "O servidor não retornou os dados do pedido.");
      }

      void notifyOrderCreatedByEmail(data.orderId);

      if (data.status === "paid") {
        completePaidOrder(data, "pix");
        return;
      }

      if (data.status === "cancelled" || data.status === "expired") {
        resetCheckoutRequestId("pix");
        throw new Error(data?.paymentStatusDetail || "O Mercado Pago não conseguiu gerar este PIX.");
      }

      if (!data?.pix?.qrCode) {
        throw new Error("O Mercado Pago criou o pedido, mas não retornou o código PIX.");
      }

      setPixPayment({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        providerOrderId: data.providerOrderId || null,
        paymentId: data.paymentId || null,
        status: data.status || "pending_payment",
        qrCode: data.pix.qrCode,
        ticketUrl: data.pix.ticketUrl || null,
        expiresAt: data.expiresAt,
        subtotal: Number(data.subtotal || cartSubtotal()),
        shipping: Number(data.shipping || 0),
        total: Number(data.total || cartTotal()),
      });

      setPage("pixPayment");
      goTop();
      void loadMyOrders();
      hidePaymentOverlay();
    } catch (error) {
      const functionStatus = Number(error?.context?.status || 0);
      if ([400, 401, 403, 404, 413].includes(functionStatus)) {
        resetCheckoutRequestId("pix");
      }

      console.error("Erro PIX:", error);
      setPaymentError(error?.message || "Não foi possível gerar o PIX.");
      hidePaymentOverlay();
    } finally {
      setPaymentBusy(false);
    }
  }

  async function handleCardPaymentSubmit(formData, additionalData) {
    if (paymentBusy || !ensurePaymentCanStart()) {
      throw new Error("Não foi possível iniciar o pagamento.");
    }

    if (additionalData?.paymentTypeId && additionalData.paymentTypeId !== "credit_card") {
      const message = "Neste checkout estamos aceitando somente cartão de crédito.";
      setPaymentError(message);
      throw new Error(message);
    }

    setPaymentBusy(true);
    setPaymentError("");
    showPaymentOverlay(
      "Processando pagamento...",
      "Estamos enviando os dados ao Mercado Pago e aguardando a confirmação. Não feche esta página."
    );

    try {
      const saved = await saveCheckoutCustomerData();
      if (!saved) throw new Error("Confira seus dados antes de continuar.");

      const identification = formData?.payer?.identification || {};
      const checkoutRequestId = checkoutRequestIdFor("card", {
        paymentMethodId: formData?.payment_method_id || "",
        installments: Number(formData?.installments || 1),
        identificationType: identification?.type || "",
        identificationNumber: String(identification?.number || "").replace(/\D/g, ""),
      });

      const { data, error } = await supabase.functions.invoke("create-checkout-payment", {
        body: {
          checkoutRequestId,
          paymentMethod: "card",
          items: checkoutItemsPayload(),
          shippingServiceId: hasPhysicalProducts() ? selectedShipping?.serviceId : null,
          card: {
            token: formData?.token,
            paymentMethodId: formData?.payment_method_id,
            installments: Number(formData?.installments || 1),
            identification: {
              type: identification?.type || "",
              number: identification?.number || "",
            },
          },
        },
      });

      if (error) {
        throw new Error(
          await getFunctionErrorMessage(error, "Não foi possível processar o cartão.")
        );
      }

      if (!data?.success) {
        throw new Error(data?.error || "Não foi possível processar o cartão.");
      }

      if (data?.orderId) {
        void notifyOrderCreatedByEmail(data.orderId);
      }

      if (data.status === "paid") {
        completePaidOrder(data, "card");
        return;
      }

      if (data.status === "pending_payment") {
        setLastOrder({
          id: data.orderId,
          orderNumber: data.orderNumber,
          createdAt: new Date().toLocaleString("pt-BR"),
          subtotal: Number(data.subtotal || cartSubtotal()),
          shipping: Number(data.shipping || 0),
          total: Number(data.total || cartTotal()),
          paymentMethod: "card",
          status: "pending_payment",
          paymentStatusDetail: data.paymentStatusDetail || "processing",
        });
        setPaymentError(
          "O Mercado Pago deixou o pagamento em análise/pendente. Não tente pagar novamente agora; confira o status em Meus Pedidos."
        );
        hidePaymentOverlay();
        void loadMyOrders();
        return;
      }

      resetCheckoutRequestId("card");
      throw new Error(
        data?.paymentStatusDetail || "O pagamento com cartão não foi aprovado."
      );
    } catch (error) {
      const functionStatus = Number(error?.context?.status || 0);
      if ([400, 401, 403, 404, 413].includes(functionStatus)) {
        resetCheckoutRequestId("card");
      }

      console.error("Erro cartão:", error);
      setPaymentError(error?.message || "Não foi possível processar o cartão.");
      hidePaymentOverlay();
      throw error;
    } finally {
      setPaymentBusy(false);
    }
  }

  async function refreshPixStatus(silent = false) {
    if (!pixPayment?.orderId) return;

    if (!silent) {
      showPaymentOverlay(
        "Confirmando pagamento...",
        "Estamos verificando a confirmação do seu PIX. Isso pode levar alguns segundos."
      );
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,status,subtotal,shipping,total,payment_id,provider_order_id,payment_status_detail,paid_at,expires_at")
        .eq("id", pixPayment.orderId)
        .single();

      if (error) throw error;

      if (data.status === "paid" || data.status === "processing" || data.status === "completed") {
        completePaidOrder(
          {
            orderId: data.id,
            orderNumber: data.order_number,
            subtotal: data.subtotal,
            shipping: data.shipping,
            total: data.total,
            paymentId: data.payment_id,
            providerOrderId: data.provider_order_id,
          },
          "pix"
        );
        return;
      }

      if (["cancelled", "expired", "refunded"].includes(data.status)) {
        resetCheckoutRequestId("pix");
        setPixPayment((current) =>
          current
            ? {
                ...current,
                status: data.status,
              }
            : current
        );
        if (!silent) {
          setPaymentError(
            `Pedido ${data.status === "expired" ? "expirado" : "cancelado"}.`
          );
          hidePaymentOverlay();
        }
        return;
      }

      if (!silent) {
        setPaymentError("Pagamento ainda não confirmado. Aguarde alguns instantes.");
        hidePaymentOverlay();
      }
    } catch (error) {
      console.error("Erro atualizando PIX:", error);
      if (!silent) {
        setPaymentError("Não foi possível atualizar o status agora.");
        hidePaymentOverlay();
      }
    }
  }

  async function cancelPixPayment() {
    if (!pixPayment?.orderId || paymentBusy) return;

    setPixCancelConfirmOpen(false);
    setPaymentBusy(true);
    setPaymentError("");
    showPaymentOverlay(
      "Cancelando pedido...",
      "Estamos confirmando o cancelamento do PIX. Aguarde."
    );

    try {
      const { data, error } = await supabase.functions.invoke("cancel-checkout-payment", {
        body: { orderId: pixPayment.orderId },
      });

      if (error) {
        throw new Error(await getFunctionErrorMessage(error, "Não foi possível cancelar o pedido."));
      }

      if (data?.status === "paid") {
        await refreshPixStatus();
        return;
      }

      resetCheckoutRequestId("pix");
      setPixPayment((current) =>
        current ? { ...current, status: data?.status || "cancelled" } : current
      );
      setPaymentError("Pedido PIX cancelado. Nenhuma cobrança pendente deve ser reutilizada.");
      hidePaymentOverlay();
      void loadMyOrders();
    } catch (error) {
      console.error("Erro ao cancelar PIX:", error);
      setPaymentError(error?.message || "Não foi possível cancelar o pedido.");
      hidePaymentOverlay();
    } finally {
      setPaymentBusy(false);
    }
  }

  function copyPixCode() {
    if (!pixPayment?.qrCode) return;
    void navigator.clipboard
      .writeText(pixPayment.qrCode)
      .then(() => showSiteAlert("Código PIX copiado!"))
      .catch(() => showSiteAlert("Não foi possível copiar automaticamente. Selecione o código e copie manualmente."));
  }

  function openInstagram() {
    window.open("https://www.instagram.com/souzx._.a/", "_blank", "noopener,noreferrer");
  }

  function openAdminPanel() {
    if (!isAdmin) return;
    setAccountOpen(false);
    setPage("admin");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  useEffect(() => {
    if (!languageMenuOpen) return undefined;

    function handleLanguageMenuPointerDown(event) {
      if (!languageMenuRef.current?.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    }

    function handleLanguageMenuKeyDown(event) {
      if (event.key === "Escape") {
        setLanguageMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleLanguageMenuPointerDown);
    window.addEventListener("keydown", handleLanguageMenuKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleLanguageMenuPointerDown);
      window.removeEventListener("keydown", handleLanguageMenuKeyDown);
    };
  }, [languageMenuOpen]);

  function requestLanguageChange(nextLanguage) {
    setLanguageMenuOpen(false);
    if (!nextLanguage || nextLanguage === language) return;
    setPendingLanguage(nextLanguage);
  }

  function cancelLanguageChange() {
    setPendingLanguage(null);
  }

  function confirmLanguageChange() {
    if (!pendingLanguage) return;
    setLanguage(pendingLanguage);
    setPendingLanguage(null);
  }

  function LanguageConfirmationModal() {
    if (!pendingLanguage) return null;

    const target = languageMeta(pendingLanguage);
    const copy = languageChangeCopy(language);
    const message = copy.message(target.label);

    return (
      <div
        className="language-confirm-overlay"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) cancelLanguageChange();
        }}
      >
        <div
          className="language-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-confirm-title"
          aria-describedby="language-confirm-message"
          dir={languageMeta(language).dir}
        >
          <button
            type="button"
            className="language-confirm-close"
            onClick={cancelLanguageChange}
            aria-label={copy.cancel}
            title={copy.cancel}
          >
            ×
          </button>

          <div className="language-confirm-icon" aria-hidden="true">🌐</div>

          <div className="language-confirm-copy">
            <span>{copy.eyebrow}</span>
            <h3 id="language-confirm-title">{copy.title}</h3>
            <p id="language-confirm-message">{message}</p>
          </div>

          <div className="language-confirm-target">
            <span>{target.short}</span>
            <strong>{target.label}</strong>
          </div>

          <div className="language-confirm-actions">
            <button
              type="button"
              className="language-confirm-cancel"
              onClick={cancelLanguageChange}
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              className="language-confirm-accept"
              onClick={confirmLanguageChange}
              autoFocus
            >
              {copy.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function LanguageSelector({ compact = false }) {
    const current = languageMeta(language);

    return (
      <div
        ref={languageMenuRef}
        className={`language-selector ${compact ? "language-selector-compact" : ""} ${languageMenuOpen ? "is-open" : ""}`}
      >
        <button
          type="button"
          className="language-selector-trigger"
          onClick={() => setLanguageMenuOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={languageMenuOpen}
          aria-label="Selecionar idioma"
          title="Idioma / Language"
        >
          <span className="language-selector-icon" aria-hidden="true">🌐</span>
          <span className="language-selector-current">
            {compact ? current.short : current.label}
          </span>
          <span className="language-selector-chevron" aria-hidden="true">⌄</span>
        </button>

        {languageMenuOpen && (
          <div
            className="language-dropdown"
            role="listbox"
            aria-label="Idiomas disponíveis"
          >
            <div className="language-dropdown-header">
              <span>IDIOMA</span>
              <small>{current.short}</small>
            </div>

            <div className="language-dropdown-list">
              {LANGUAGES.map((item) => {
                const selected = item.code === language;

                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`language-dropdown-option ${selected ? "selected" : ""}`}
                    onClick={() => requestLanguageChange(item.code)}
                  >
                    <span className="language-dropdown-check" aria-hidden="true">
                      {selected ? "✓" : ""}
                    </span>
                    <span className="language-dropdown-name">{item.label}</span>
                    <span className="language-dropdown-code">{item.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function ThemeToggle({ compact = false }) {
    const nextModeLabel = theme === "dark" ? "claro" : "escuro";

    return (
      <button
        type="button"
        className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}
        onClick={toggleTheme}
        aria-label={`Ativar modo ${nextModeLabel}`}
        title={`Ativar modo ${nextModeLabel}`}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {theme === "dark" ? "☀" : "☾"}
        </span>
        {!compact && (
          <span className="theme-toggle-text">
            {theme === "dark" ? "CLARO" : "ESCURO"}
          </span>
        )}
      </button>
    );
  }

  function Header() {
    const checkoutMode = page === "checkout" || page === "pixPayment" || page === "orderSuccess";

    return (
      <header className={`header storefront-header ${checkoutMode ? "checkout-header" : ""}`}>
        <div className="header-inner">
          <button className="logo storefront-logo" onClick={goHome} aria-label="Ir para o início">
            <span className="logo-word">
              BROTHER<span className="logo-accent">'S</span>
            </span>
            <strong>GAMES</strong>
          </button>

          {checkoutMode ? (
            <div className="checkout-header-center">
              <span>CHECKOUT</span>
              <strong>BROTHER'S GAMES</strong>
            </div>
          ) : (
            <>
              <nav className="storefront-nav" aria-label="Navegação principal">
                <button className={page === "home" ? "active" : ""} onClick={goHome}>Início</button>
                <button
                  className={page === "products" && category === "Jogos" && !offersOnly ? "active" : ""}
                  onClick={() => openProducts("Jogos")}
                >
                  Jogos
                </button>
                <button
                  className={
                    page === "products" &&
                    !offersOnly &&
                    category !== "Todos" &&
                    category !== "Jogos" &&
                    isPeripheralCategory(category)
                      ? "active"
                      : ""
                  }
                  onClick={() => openProducts("Periféricos")}
                >
                  Periféricos
                </button>
                <button className={offersOnly ? "active" : ""} onClick={openOffers}>Ofertas</button>
                <button className={institutionalPage === "about" ? "active" : ""} onClick={() => openInstitutionalPage("about")}>Sobre nós</button>
                <button className={institutionalPage === "contact" ? "active" : ""} onClick={() => openInstitutionalPage("contact")}>Contato</button>
              </nav>

              <div className="search-box storefront-search">
                <span className="storefront-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4 4" />
                  </svg>
                </span>
                <input
                  type="search"
                  aria-label="Buscar jogos e periféricos"
                  placeholder="Buscar jogos e periféricos"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setOffersOnly(false);
                    if (page !== "products") setPage("products");
                  }}
                />
              </div>
            </>
          )}

          {checkoutMode ? (
            <div className="checkout-header-actions">
              <LanguageSelector compact />
              <ThemeToggle compact />
              <button
                className="checkout-header-back"
                onClick={page === "checkout" ? openCart : page === "pixPayment" ? () => setPage("checkout") : goHome}
              >
                {page === "checkout" ? "← Voltar ao carrinho" : page === "pixPayment" ? "← Voltar ao checkout" : "Voltar à loja"}
              </button>
            </div>
          ) : (
            <div className="header-actions">
              <LanguageSelector />
              <ThemeToggle />
              <button
                className="account-button"
                onClick={openAccount}
                aria-label={user ? "Abrir minha conta" : "Entrar ou criar conta"}
                title={user ? "Minha conta" : "Entrar ou criar conta"}
              >
                {user ? (
                  <UserAvatar className="user-avatar-header" title="Abrir minha conta" />
                ) : (
                  <span className="account-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.25" />
                      <path d="M6.5 20v-1.7a5.5 5.5 0 0 1 11 0V20" />
                    </svg>
                  </span>
                )}
                <span className="account-text">
                  {authLoading ? "..." : user?.name ? user.name.split(" ")[0] : "Conta"}
                </span>
              </button>

              <button className="cart-button" onClick={openCart} aria-label="Abrir carrinho" title="Carrinho">
                <svg className="storefront-cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l1.6 9.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4L20 8H6" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="17" cy="19" r="1" />
                </svg>
                {cartQuantity() > 0 && <span className="cart-count">{cartQuantity()}</span>}
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  function ProductCard({ product }) {
    const rating = getProductRating(product);
    const reviewCount = getReviewCount(product);
    const discountPercent = getDiscountPercent(product);
    const hasDiscount = discountPercent > 0;

    return (
      <article className="product-card">
        <button className="product-image" onClick={() => openProduct(product)}>
          {hasDiscount && (
            <span className="offer-discount-badge">-{discountPercent}%</span>
          )}
          {product.image ? <img src={product.image} alt={translateProductName(product.name, language)} /> : <span>🎮</span>}
        </button>

        <div className="product-info">
          <span className="product-category">{translateCategoryName(product.category, language)}</span>
          <button className="product-name-button" onClick={() => openProduct(product)}>
            <span className="product-name-hover-row">
              <span className="product-name-text">{translateProductName(product.name, language)}</span>
              <ProductHoverAnimation product={product} />
            </span>
          </button>

          <div className="card-rating">
            <StarRating value={rating} />
            <span>{reviewCount ? rating.toFixed(1) : "Novo"}</span>
            <small>({reviewCount})</small>
          </div>

          <div className="product-bottom">
            <div className="offer-price-stack">
              {hasDiscount && (
                <small className="product-original-price">
                  {formatPrice(product.original_price)}
                </small>
              )}
              <strong className={hasDiscount ? "product-offer-price" : ""}>
                {formatPrice(product.price)}
              </strong>
            </div>
            <button className="add-button" onClick={() => addToCart(product)}>+</button>
          </div>
        </div>
      </article>
    );
  }

  function ProductsLoadingBlock() {
    if (productsLoading) {
      return (
        <div className="empty-results">
          <div className="empty-results-icon">◌</div>
          <h3>Carregando produtos...</h3>
          <p>Buscando o catálogo no Supabase.</p>
        </div>
      );
    }

    if (productsError) {
      return (
        <div className="empty-results">
          <div className="empty-results-icon">!</div>
          <h3>Não foi possível carregar a loja</h3>
          <p>{productsError}</p>
          <button className="hero-button" onClick={loadProducts}>TENTAR NOVAMENTE</button>
        </div>
      );
    }

    return null;
  }

  function HomePage() {
    return (
      <>
        <section className="hero gaming-hero">
          <div className="hero-content">
            <span className="hero-label">SEU JOGO. SEU SETUP. SEU PRÓXIMO NÍVEL.</span>
            <h1>
              O PRÓXIMO NÍVEL DA SUA<br />
              EXPERIÊNCIA <span>COMEÇA AQUI.</span>
            </h1>
            <p>
              Encontre seus jogos favoritos e os melhores periféricos para montar o setup perfeito.
            </p>
            <div className="hero-buttons">
              <button className="hero-button" onClick={() => openProducts("Todos")}>COMPRAR AGORA</button>
              <button className="hero-button secondary" onClick={openOffers}>VER OFERTAS</button>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <div className="section-container benefits-grid">
            <div className="benefit"><strong>🚚</strong><div><b>Frete grátis</b><span>Nas compras acima de {freeShippingThresholdLabel()}</span></div></div>
            <div className="benefit"><strong>🎮</strong><div><b>Jogos digitais</b><span>Entrega por e-mail</span></div></div>
            <div className="benefit"><strong>🔒</strong><div><b>Sua conta</b><span>Autenticação com Supabase</span></div></div>
          </div>
        </section>

        <section className="categories-section category-showcase">
          <div className="section-container">
            <div className="category-showcase-heading">
              <div>
                <span>MONTE SEU SETUP</span>
                <h2>Categorias</h2>
                <p>Encontre tudo o que precisa para jogar, competir e evoluir.</p>
              </div>
              <button onClick={() => openProducts("Todos")}>VER TODOS OS PRODUTOS <span>↗</span></button>
            </div>

            <div className="category-home-grid category-showcase-grid">
              {categories.filter((item) => item !== "Todos").map((item) => (
                <button key={item} className="category-home-card" onClick={() => openProducts(item)}>
                  <span className="category-card-glow" aria-hidden="true" />
                  <span className="category-home-icon">
                    <CategoryHomeIcon category={item} />
                  </span>
                  <span className="category-home-copy">
                    <strong>{translateCategoryName(item, language)}</strong>
                    <small>Explorar categoria</small>
                  </span>
                  <span className="category-home-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>

            <button
              className="weekly-offers-banner"
              onClick={() =>
                offerSummary.count > 0 ? openOffers() : openProducts("Todos")
              }
            >
              <span className="weekly-offers-pattern" aria-hidden="true" />
              <span className="weekly-offers-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M13.3 2.5c.7 3.5-.8 5.1-2.1 6.5-1.2 1.3-2.2 2.4-1.4 4.5.7-1.3 1.8-2.2 3-3.1-.1 2.2 1.6 3.2 1.6 5.3a3.9 3.9 0 0 1-7.8 0c0-1.1.3-2.1.9-3.1-2.1 1.3-3.5 3.5-3.5 6A5.1 5.1 0 0 0 9.1 23h5.1a6 6 0 0 0 5.9-6.1c0-5.1-3.3-9.4-6.8-14.4Z" />
                </svg>
              </span>
              <span className="weekly-offers-copy">
                <small>
                  {offerSummary.count > 0
                    ? "PREÇOS ESPECIAIS POR TEMPO LIMITADO"
                    : "ENCONTRE O PRODUTO IDEAL PARA O SEU SETUP"}
                </small>
                <strong>
                  {offerSummary.count > 0 ? "Ofertas da semana" : "Produtos em destaque"}
                </strong>
                <span>
                  {offerSummary.count > 0
                    ? `${offerSummary.count} ${
                        offerSummary.count === 1 ? "produto selecionado" : "produtos selecionados"
                      } com preços especiais.`
                    : "Jogos e periféricos selecionados para você."}
                </span>
              </span>
              <span className="weekly-offers-discount" aria-hidden="true">
                {offerSummary.maximumDiscount > 0 ? (
                  <>
                    ATÉ <strong>{offerSummary.maximumDiscount}%</strong> OFF
                  </>
                ) : offerSummary.count > 0 ? (
                  <>
                    <strong>{offerSummary.count}</strong>{" "}
                    {offerSummary.count === 1 ? "OFERTA" : "OFERTAS"}
                  </>
                ) : (
                  <>
                    VEJA <strong>AGORA</strong>
                  </>
                )}
              </span>
              <span className="weekly-offers-cta">
                {offerSummary.count > 0 ? "VER OFERTAS" : "VER PRODUTOS"} <b>→</b>
              </span>
            </button>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-container">
            <div className="section-heading products-heading">
              <div><span>DESTAQUES</span><h2>PRODUTOS</h2></div>
              <button className="see-all-button" onClick={() => openProducts("Todos")}>VER TUDO →</button>
            </div>

            {productsLoading || productsError ? (
              ProductsLoadingBlock()
            ) : (
              <div className="products-grid">
                {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  function ProductsPage() {
    return (
      <main className="products-page">
        <div className="section-container">
          <div className="products-page-top">
            <button className="back-button" onClick={goHome}>← Voltar para início</button>
            <div>
              <span>{offersOnly ? "OFERTAS" : "LOJA"}</span>
              <h1>
                {offersOnly
                  ? "Produtos em oferta"
                  : category === "Todos"
                    ? "Todos os produtos"
                    : category}
              </h1>
              <p>
                {category === "Periféricos" && !offersOnly
                  ? "Encontre teclados, mouses, monitores, headsets, controles e acessórios para o seu setup."
                  : "Encontre jogos, periféricos e acessórios para o seu setup."}
              </p>
            </div>
          </div>

          <div className="products-layout">
            <aside className="filters">
              <div className="filters-header">
                <h3>Filtros</h3>
                <button onClick={() => {
                  setCategory("Todos");
                  setPriceMin("");
                  setPriceMax("");
                  setSort("relevance");
                  setOffersOnly(false);
                }}>Limpar</button>
              </div>

              <div className="filter-group">
                <span className="filter-title">Categoria</span>
                <div className="filter-options">
                  {productFilterCategories.map((item) => (
                    <button
                      key={item}
                      className={category === item ? "filter-option active" : "filter-option"}
                      onClick={() => setCategory(item)}
                    >
                      <span className="filter-radio">{category === item ? "●" : "○"}</span>
                      {translateCategoryName(item, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title">Faixa de preço</span>
                <div className="price-inputs">
                  <label><span>De ({currencyMeta(language).currency})</span><input type="number" placeholder={formatPrice(0)} value={priceMin} onChange={(event) => setPriceMin(event.target.value)} /></label>
                  <label><span>Até ({currencyMeta(language).currency})</span><input type="number" placeholder={formatPrice(9999)} value={priceMax} onChange={(event) => setPriceMax(event.target.value)} /></label>
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title">Ordenar por</span>
                <select className="sort-select-mobile" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="relevance">Relevância</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="name">Nome</option>
                </select>
              </div>
            </aside>

            <section className="products-results">
              <div className="products-results-header">
                <div><strong>{filteredProducts.length}</strong><span> produtos encontrados</span></div>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="relevance">Relevância</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="name">Nome</option>
                </select>
              </div>

              {productsLoading || productsError ? (
                ProductsLoadingBlock()
              ) : filteredProducts.length === 0 ? (
                <div className="empty-results">
                  <div className="empty-results-icon">🔎</div>
                  <h3>Nenhum produto encontrado</h3>
                  <p>Tente mudar os filtros ou procurar por outro produto.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    );
  }

  function ProductPage() {
    if (!selectedProduct) return null;

    const productReviews = approvedReviewsForProduct(selectedProduct);
    const rating = getProductRating(selectedProduct);
    const reviewCount = getReviewCount(selectedProduct);
    const ratingRows = [5, 4, 3, 2, 1].map((stars) => {
      const count = productReviews.filter((review) => Number(review.rating) === stars).length;
      const percent = reviewCount ? Math.round((count / reviewCount) * 100) : 0;
      return { stars, count, percent };
    });
    const relatedProducts = products
      .filter((item) => item.id !== selectedProduct.id && item.category === selectedProduct.category)
      .slice(0, 3);

    return (
      <main className="product-page">
        <div className="product-page-container">
          <button className="back-button product-page-back" onClick={closeProduct}>← Voltar para produtos</button>

          <div className="product-breadcrumb">
            <button onClick={goHome}>Início</button><span>/</span>
            <button onClick={() => openProducts(selectedProduct.category)}>{selectedProduct.category}</button><span>/</span>
            <strong>{translateProductName(selectedProduct.name, language)}</strong>
          </div>

          <section className="product-detail">
            <div className="product-detail-image">
              {selectedProduct.image ? <img src={selectedProduct.image} alt={translateProductName(selectedProduct.name, language)} /> : <span>🎮</span>}
            </div>

            <div className="product-detail-info">
              <span className="detail-category">{selectedProduct.category}</span>
              <div className="product-detail-title-row">
                <h1>{translateProductName(selectedProduct.name, language)}</h1>
                <ProductHoverAnimation product={selectedProduct} size="detail" />
              </div>

              <div className="product-main-rating">
                <StarRating value={rating} size="large" />
                <strong>{reviewCount ? rating.toFixed(1) : "—"}</strong>
                <button onClick={() => document.getElementById("avaliacoes")?.scrollIntoView({ behavior: "smooth" })}>
                  {reviewCount ? `${reviewCount} avaliações` : "Ainda sem avaliações"}
                </button>
              </div>

              <div className="detail-divider" />
              <div className="product-detail-price">
                <span>{getDiscountPercent(selectedProduct) > 0 ? "OFERTA LIMITADA" : "POR APENAS"}</span>
                {getDiscountPercent(selectedProduct) > 0 && (
                  <div className="product-detail-offer-meta">
                    <small className="product-detail-original-price">
                      {formatPrice(selectedProduct.original_price)}
                    </small>
                    <b className="product-detail-discount">
                      -{getDiscountPercent(selectedProduct)}%
                    </b>
                  </div>
                )}
                <strong>{formatPrice(selectedProduct.price)}</strong>
                <small>preço do produto</small>
              </div>
              <p className="product-detail-description">{selectedProduct.description}</p>

              <div className="product-purchase-benefits">
                <div><span>✓</span><p><strong>Conta integrada</strong><small>Login com Supabase</small></p></div>
                <div><span>✓</span><p><strong>Meus dados</strong><small>Salvos na conta</small></p></div>
                <div><span>✓</span><p><strong>Pagamento</strong><small>PIX e cartão serão integrados juntos</small></p></div>
              </div>

              <div className="product-detail-actions">
                <button className="buy-now-button" onClick={() => buyNow(selectedProduct)}>COMPRAR AGORA</button>
                <button className="detail-cart-button" onClick={() => addToCart(selectedProduct)}>🛒 ADICIONAR AO CARRINHO</button>
              </div>
            </div>
          </section>

          <section className="reviews-section" id="avaliacoes">
            <div className="reviews-title">
              <span>AVALIAÇÕES DOS CLIENTES</span>
              <h2>Avaliações do produto</h2>
              <p>Somente clientes com pedido entregue podem avaliar. Todo comentário passa por moderação antes de ser publicado.</p>
            </div>

            {DEMO_REVIEWS_ENABLED && (
              <div className="reviews-demo-notice">
                <span>AMBIENTE DE TESTE</span>
                <p>As avaliações marcadas como demonstração são exemplos visuais e não representam clientes reais.</p>
              </div>
            )}

            <div className="reviews-overview">
              <div className="rating-score-card">
                <strong>{reviewCount ? rating.toFixed(1) : "—"}</strong>
                <StarRating value={rating} size="large" />
                <span>{reviewCount ? `Baseado em ${reviewCount} avaliação(ões)` : "Este produto ainda não recebeu avaliações"}</span>
              </div>

              <div className="rating-bars">
                {ratingRows.map((row) => (
                  <div key={row.stars}>
                    <span>{row.stars} estrelas</span>
                    <div className="rating-bar"><i style={{ width: `${row.percent}%` }} /></div>
                    <small>{row.percent}%</small>
                  </div>
                ))}
              </div>
            </div>

            {reviewsLoading ? (
              <div className="reviews-empty-state">Carregando avaliações...</div>
            ) : productReviews.length === 0 ? (
              <div className="reviews-empty-state">
                <strong>Ainda não há avaliações publicadas.</strong>
                <p>Depois que uma compra for entregue, o cliente poderá avaliar o produto em “Meus pedidos”.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {productReviews.map((review) => {
                  const photos = photosForPublicReview(review.id);
                  return (
                    <article className={`review-card ${review.is_demo ? "demo" : ""}`} key={review.id}>
                      <div className="review-card-top">
                        <div className="review-avatar">{review.is_demo ? "T" : "✓"}</div>
                        <div className="review-customer">
                          <strong>{review.is_demo ? "Cliente de demonstração" : "Cliente verificado"}</strong>
                          <span>{review.is_demo ? "Avaliação de teste" : "✓ Compra verificada"}</span>
                        </div>
                        <time>{new Date(review.created_at).toLocaleDateString("pt-BR")}</time>
                      </div>

                      <StarRating value={Number(review.rating)} />
                      {review.comment && <p>{review.comment}</p>}

                      {photos.length > 0 && (
                        <div className="review-public-photo-grid">
                          {photos.map((photo) => (
                            <a
                              key={photo.id}
                              href={photo.publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="review-public-photo"
                            >
                              <img src={photo.publicUrl} alt="Foto enviada pelo cliente" />
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {relatedProducts.length > 0 && (
            <section className="related-section">
              <div className="section-heading"><span>VOCÊ TAMBÉM PODE GOSTAR</span><h2>Produtos relacionados</h2></div>
              <div className="products-grid">{relatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            </section>
          )}
        </div>
      </main>
    );
  }

  function CartPage() {
    return (
      <main className="cart-page">
        <div className="section-container">
          <button className="back-button" onClick={() => openProducts("Todos")}>← Continuar comprando</button>
          <div className="section-heading"><span>SEU PEDIDO</span><h1>CARRINHO</h1></div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Seu carrinho está vazio</h3>
              <p>Adicione produtos para começar seu pedido.</p>
              <button className="hero-button" onClick={() => openProducts("Todos")}>VER PRODUTOS</button>
            </div>
          ) : (
            <div className="cart-container">
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <button className="cart-image-button" onClick={() => openProduct(item)}>
                      {item.image ? <img src={item.image} alt={translateProductName(item.name, language)} /> : <span>🎮</span>}
                    </button>
                    <div className="cart-item-info"><span>{item.category}</span><button className="cart-product-name" onClick={() => openProduct(item)}>{translateProductName(item.name, language)}</button><strong>{formatPrice(item.price)}</strong></div>
                    <div className="quantity"><button onClick={() => removeFromCart(item.id)}>−</button><strong>{item.quantity}</strong><button onClick={() => addToCart(item)}>+</button></div>
                    <strong className="item-total">{formatPrice(Number(item.price) * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <aside className="cart-summary">
                <span>SUBTOTAL</span><strong>{formatPrice(cartSubtotal())}</strong>
                <small className="cart-shipping-note">Produtos digitais não pagam frete. Para físicos, o valor é calculado pelo CEP no checkout.</small>
                <button className="checkout-button" onClick={openCheckout}>FINALIZAR PEDIDO</button>
              </aside>
            </div>
          )}
        </div>
      </main>
    );
  }

  function CheckoutPage() {
    const shipping = cartShipping();
    const amount = shipping === null ? 0 : cartTotal();

    return (
      <main className="checkout-page">
        <div className="checkout-page-container">
          <div className="checkout-title">
            <span>FINALIZAÇÃO</span>
            <h1>Checkout</h1>
            <p>Confira seus dados e escolha como deseja pagar.</p>
          </div>

          <div className="checkout-layout">
            <div className="checkout-content">
              <section className="checkout-section">
                <div className="checkout-section-header">
                  <div className="checkout-step">01</div>
                  <div><span>CLIENTE</span><h2>Seus dados</h2><p>Informações para contato.</p></div>
                </div>
                <div className="checkout-form-grid">
                  <label><span>Nome completo *</span><input type="text" value={checkoutData.name} onChange={(event) => updateCheckoutField("name", event.target.value)} /></label>
                  <label><span>E-mail *</span><input type="email" value={checkoutData.email} readOnly /></label>
                  <label><span>Telefone *</span><input type="tel" inputMode="numeric" maxLength={15} placeholder="(11) 99999-9999" value={checkoutData.phone} onChange={(event) => updateCheckoutField("phone", formatPhone(event.target.value))} /></label>
                </div>
              </section>

              {hasPhysicalProducts() ? (
                <>
                  <section className="checkout-section">
                    <div className="checkout-section-header">
                      <div className="checkout-step">02</div>
                      <div><span>ENTREGA</span><h2>Endereço de entrega</h2><p>O CEP completa os dados automaticamente.</p></div>
                    </div>
                    <div className="checkout-form-grid">
                      <label><span>CEP *</span><div className="checkout-cep-wrapper"><input type="text" inputMode="numeric" maxLength={9} placeholder="00000-000" value={checkoutData.cep} onChange={(event) => handleCheckoutCepChange(event.target.value)} />{checkoutCepLoading && <small>Buscando...</small>}</div></label>
                      <label className="checkout-wide"><span>Endereço *</span><input type="text" value={checkoutData.address} onChange={(event) => updateCheckoutField("address", event.target.value)} /></label>
                      <label><span>Número *</span><input type="text" value={checkoutData.number} onChange={(event) => updateCheckoutField("number", event.target.value)} /></label>
                      <label><span>Complemento</span><input type="text" value={checkoutData.complement} onChange={(event) => updateCheckoutField("complement", event.target.value)} /></label>
                      <label><span>Bairro *</span><input type="text" value={checkoutData.neighborhood} onChange={(event) => updateCheckoutField("neighborhood", event.target.value)} /></label>
                      <label><span>Cidade *</span><input type="text" value={checkoutData.city} onChange={(event) => updateCheckoutField("city", event.target.value)} /></label>
                      <label><span>Estado *</span><select value={checkoutData.state} onChange={(event) => updateCheckoutField("state", event.target.value)}><option value="">Selecione</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
                    </div>
                  </section>

                  <section className="checkout-section shipping-checkout-section">
                    <div className="checkout-section-header">
                      <div className="checkout-step">03</div>
                      <div><span>FRETE</span><h2>Escolha a entrega</h2><p>Valores e prazos calculados em tempo real pelo Melhor Envio.</p></div>
                    </div>

                    <div className="shipping-calculate-row shipping-calculate-editable">
                      <label className="shipping-postal-code-field">
                        <span>CEP DE DESTINO</span>
                        <div className="shipping-postal-code-input-wrap">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="00000-000"
                            value={checkoutData.cep}
                            onChange={(event) => handleCheckoutCepChange(event.target.value)}
                            aria-label="CEP de destino para cálculo do frete"
                          />
                          {checkoutCepLoading && <small>BUSCANDO CEP...</small>}
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => calculateShipping()}
                        disabled={shippingLoading || checkoutCepLoading || String(checkoutData.cep || "").replace(/\D/g, "").length !== 8}
                      >
                        {shippingLoading ? "CALCULANDO..." : "RECALCULAR FRETE"}
                      </button>
                    </div>

                    {physicalCartSubtotal() >= 299 && (
                      <div className="shipping-free-banner">
                        <span>✓</span>
                        <div>
                          <strong>FRETE GRÁTIS</strong>
                          <small>Seu subtotal de produtos físicos atingiu {freeShippingThresholdLabel()}. Usaremos a opção disponível de menor custo.</small>
                        </div>
                      </div>
                    )}

                    {shippingError && <div className="shipping-inline-error">{shippingError}</div>}

                    {!shippingLoading && !shippingError && shippingOptions.length === 0 && (
                      <div className="shipping-empty-state">
                        Informe um CEP válido para consultar as opções de entrega.
                      </div>
                    )}

                    {shippingOptions.length > 0 && (
                      <div className="shipping-options-list">
                        {shippingOptions.map((option) => (
                          <label
                            key={option.serviceId}
                            className={`shipping-option-card ${selectedShipping?.serviceId === option.serviceId ? "selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="shipping-service"
                              checked={selectedShipping?.serviceId === option.serviceId}
                              onChange={() => {
                                setSelectedShipping(option);
                                setPaymentError("");
                                resetCheckoutRequestId("pix");
                                resetCheckoutRequestId("card");
                              }}
                            />
                            <div className="shipping-option-main">
                              <div className="shipping-carrier-line">
                                <div className="shipping-carrier-icon" aria-hidden="true">🚚</div>
                                <div className="shipping-carrier-copy">
                                  <span>TRANSPORTADORA</span>
                                  <strong>{option.carrier || "Transportadora"}</strong>
                                </div>
                              </div>

                              <div className="shipping-service-line">
                                <span>SERVIÇO</span>
                                <strong>{option.name}</strong>
                                <small>
                                  {Number(option.deliveryDays || 0) > 0
                                    ? `Prazo estimado: ${option.deliveryDays} dia(s) útil(eis)`
                                    : "Prazo informado pela transportadora"}
                                </small>
                              </div>
                            </div>
                            <div className="shipping-option-price">
                              {Number(option.price || 0) === 0 ? (
                                <strong className="free-shipping">GRÁTIS</strong>
                              ) : (
                                <strong>{formatPrice(option.price)}</strong>
                              )}
                              <span>{selectedShipping?.serviceId === option.serviceId ? "SELECIONADO" : "ESCOLHER"}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <section className="checkout-section digital-delivery-section">
                  <div className="checkout-section-header">
                    <div className="checkout-step">02</div>
                    <div><span>ENTREGA</span><h2>Entrega digital</h2><p>Este carrinho não possui produtos físicos e não cobra frete.</p></div>
                  </div>
                  <div className="digital-delivery-card"><span>⚡</span><div><strong>SEM FRETE</strong><small>O pedido será tratado como entrega digital.</small></div></div>
                </section>
              )}

              <section className="checkout-section">
                <div className="checkout-section-header">
                  <div className="checkout-step">{hasPhysicalProducts() ? "04" : "03"}</div>
                  <div><span>PAGAMENTO</span><h2>Forma de pagamento</h2><p>O pagamento é processado pelo Mercado Pago em ambiente de teste nesta etapa.</p></div>
                </div>

                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === "pix" ? "selected" : ""}`}>
                    <input type="radio" name="payment" value="pix" checked={paymentMethod === "pix"} onChange={(event) => { setPaymentMethod(event.target.value); setPaymentError(""); }} />
                    <div className="payment-symbol pix-symbol">PIX</div>
                    <div className="payment-info"><strong>PIX</strong><span>QR Code e Pix Copia e Cola</span></div>
                    <div className="payment-check">✓</div>
                  </label>

                  <label className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={(event) => { setPaymentMethod(event.target.value); setPaymentError(""); }} />
                    <div className="payment-symbol">💳</div>
                    <div className="payment-info"><strong>Cartão de crédito</strong><span>Dados do cartão preenchidos no Brick do Mercado Pago</span></div>
                    <div className="payment-check">✓</div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="mercado-card-area">
                    <div className="mercado-card-heading">
                      <span>CARTÃO DE CRÉDITO</span>
                      <p>Preencha os dados abaixo. A loja não recebe nem armazena o número completo do cartão ou o CVV.</p>
                      <small className="card-installment-hint">
                        As opções de parcelamento aparecem conforme as parcelas disponibilizadas pelo Mercado Pago para o cartão informado.
                      </small>
                    </div>

                    {!mercadoPagoPublicKey ? (
                      <div className="payment-inline-error">Public Key do Mercado Pago não carregada.</div>
                    ) : !mercadoPagoProductionEnabled || mercadoPagoUsesObviousTestKey ? (
                      <div className="payment-inline-error">
                        Checkout real ainda não ativado. Configure as credenciais produtivas do Mercado Pago.
                      </div>
                    ) : !shippingIsReady() || shipping === null ? (
                      <div className="payment-inline-warning">Calcule o frete e escolha a entrega antes de iniciar uma cobrança.</div>
                    ) : amount > 0 ? (
                      <>
                        {!cardBrickReady && <div className="payment-brick-loading">Carregando formulário do cartão...</div>}
                        <CardPayment
                          key={`${amount}-${authUser?.id || "guest"}`}
                          initialization={{ amount }}
                          customization={{
                            paymentMethods: {
                              minInstallments: 1,
                              maxInstallments: 12,
                              types: {
                                excluded: ["debit_card", "prepaid_card"],
                              },
                            },
                          }}
                          onReady={() => setCardBrickReady(true)}
                          onError={(error) => {
                            console.error("Mercado Pago Brick:", error);
                            setPaymentError("Não foi possível carregar o formulário do cartão.");
                          }}
                          onSubmit={handleCardPaymentSubmit}
                        />
                      </>
                    ) : null}
                  </div>
                )}

                {paymentError && <div className="payment-inline-error">{paymentError}</div>}
              </section>
            </div>

            <aside className="checkout-summary">
              <div className="checkout-summary-header"><span>RESUMO</span><h2>Seu pedido</h2><p>{cartQuantity()} {cartQuantity() === 1 ? "item" : "itens"}</p></div>
              <div className="checkout-items">
                {cart.map((item) => (
                  <div className="checkout-item" style={{ gridTemplateColumns: "minmax(0, 1fr) auto" }} key={item.id}>
                    <div className="checkout-item-info"><strong>{translateProductName(item.name, language)}</strong><span>{item.quantity}x {formatPrice(item.price)}</span></div>
                    <b>{formatPrice(Number(item.price) * item.quantity)}</b>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-price-line"><span>Subtotal</span><strong>{formatPrice(cartSubtotal())}</strong></div>
              <div className="checkout-price-line">
                <span>Frete</span>
                <strong className={shipping === 0 ? "free-shipping" : ""}>
                  {shipping === null ? "A CALCULAR" : shipping === 0 ? "GRÁTIS" : formatPrice(shipping)}
                </strong>
              </div>
              {selectedShipping?.serviceId && hasPhysicalProducts() && (
                <div className="checkout-shipping-summary">
                  <span>{selectedShipping.carrier || "Transportadora"}</span>
                  <strong>{selectedShipping.name}</strong>
                  {Number(selectedShipping.deliveryDays || 0) > 0 && <small>{selectedShipping.deliveryDays} dia(s) útil(eis)</small>}
                </div>
              )}
              <div className="checkout-summary-divider" />
              <div className="checkout-grand-total"><span>{shipping === null ? "TOTAL PARCIAL" : "TOTAL"}</span><strong>{formatPrice(cartTotal())}</strong></div>

              {paymentMethod === "pix" ? (
                <button type="button" className="finish-order-button" onClick={startPixPayment} disabled={paymentBusy || !shippingIsReady() || shipping === null}>
                  <span>{paymentBusy ? "GERANDO PIX..." : "GERAR PIX"}</span><strong>→</strong>
                </button>
              ) : (
                <div className="card-submit-note">Finalize o cartão pelo botão exibido no formulário do Mercado Pago.</div>
              )}

              <div className="checkout-security">
                <span>◈</span>
                <p>
                  {mercadoPagoProductionEnabled && !mercadoPagoUsesObviousTestKey
                    ? "Pagamento seguro processado pelo Mercado Pago."
                    : "Integração em modo de teste. Use somente credenciais e dados de teste do Mercado Pago."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  function PixPaymentPage() {
    if (!pixPayment) return null;

    const isExpired = pixPayment.status === "expired" || pixSecondsLeft <= 0;
    const isCancelled = pixPayment.status === "cancelled";
    const canPay = !isExpired && !isCancelled;

    return (
      <main className="pix-payment-page">
        <div className="pix-payment-shell">
          <div className="pix-payment-heading">
            <span>PIX GERADO</span>
            <h1>{canPay ? "Aguardando pagamento" : isExpired ? "PIX expirado" : "Pedido cancelado"}</h1>
            <p>Pedido <strong>#{pixPayment.orderNumber}</strong></p>
          </div>

          <div className="pix-payment-grid">
            <section className="pix-code-card">
              <div className={`pix-timer ${!canPay ? "ended" : ""}`}>
                <span>Tempo restante</span>
                <strong>{canPay ? formatCountdown(pixSecondsLeft) : "00:00"}</strong>
              </div>

              {canPay ? (
                <>
                  <div className="pix-qr-box">
                    <QRCodeSVG value={pixPayment.qrCode} size={230} level="M" includeMargin />
                  </div>
                  <p className="pix-instruction">Escaneie o QR Code pelo aplicativo do seu banco ou use o Pix Copia e Cola.</p>
                  <div className="pix-copy-box">
                    <textarea readOnly value={pixPayment.qrCode} aria-label="Código Pix Copia e Cola" />
                    <button type="button" onClick={copyPixCode}>COPIAR CÓDIGO PIX</button>
                  </div>
                  {pixPayment.ticketUrl && (
                    <a className="pix-ticket-link" href={pixPayment.ticketUrl} target="_blank" rel="noreferrer">Abrir instruções do Mercado Pago ↗</a>
                  )}
                </>
              ) : (
                <div className="pix-ended-message">
                  <strong>{isExpired ? "O prazo deste PIX terminou." : "Este pedido foi cancelado."}</strong>
                  <p>Volte ao checkout para gerar uma nova cobrança.</p>
                </div>
              )}
            </section>

            <aside className="pix-order-card">
              <span>RESUMO DO PEDIDO</span>
              <div><small>Total</small><strong>{formatPrice(pixPayment.total)}</strong></div>
              <div><small>Forma de pagamento</small><strong>PIX</strong></div>
              <div><small>Status</small><strong>{canPay ? "Aguardando pagamento" : isExpired ? "Expirado" : "Cancelado"}</strong></div>

              {paymentError && <div className="payment-inline-error">{paymentError}</div>}

              {canPay && (
                <>
                  <button type="button" className="pix-refresh-button" onClick={() => refreshPixStatus(false)} disabled={paymentBusy}>
                    ATUALIZAR STATUS
                  </button>
                  <button type="button" className="pix-cancel-button" onClick={() => setPixCancelConfirmOpen(true)} disabled={paymentBusy}>
                    {paymentBusy ? "AGUARDE..." : "CANCELAR PEDIDO"}
                  </button>
                </>
              )}

              {!canPay && (
                <button type="button" className="pix-refresh-button" onClick={() => { setPixPayment(null); setPaymentError(""); setPage("checkout"); goTop(); }}>
                  VOLTAR AO CHECKOUT
                </button>
              )}

              <p className="pix-auto-note">O status é atualizado automaticamente pelo webhook do Mercado Pago e também verificado periodicamente pelo site.</p>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  function OrderSuccessPage() {
    if (!lastOrder) return null;

    return (
      <main className="order-success-page">
        <div className="order-success-card">
          <div className="order-success-icon">✓</div>
          <span className="order-success-label">PAGAMENTO APROVADO</span>
          <h1>Pedido confirmado</h1>
          <p>O pagamento foi aprovado e o pedido foi registrado na Brother's Games.</p>
          <div className="success-order-number"><span>PEDIDO</span><strong>#{lastOrder.orderNumber || lastOrder.id}</strong></div>
          <div className="success-order-info">
            <div><span>TOTAL</span><strong>{formatPrice(lastOrder.total)}</strong></div>
            <div><span>PAGAMENTO</span><strong>{lastOrder.paymentMethod === "pix" ? "PIX" : "Cartão de crédito"}</strong></div>
            <div><span>STATUS</span><strong>Pago</strong></div>
          </div>
          <div className="success-actions">
            <button className="success-primary-button" onClick={goHome}>VOLTAR À LOJA</button>
            <button className="success-secondary-button" onClick={openMyOrders}>VER MEUS PEDIDOS</button>
          </div>
        </div>
      </main>
    );
  }

  function ReviewModal() {
    if (!reviewModal) return null;

    const allPhotoCount = reviewExistingPhotos.length + reviewNewPhotos.length;
    const existingReview = reviewModal.existingReview;

    return (
      <div
        className="review-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeReviewModal();
        }}
      >
        <form className="review-modal-card" onSubmit={submitProductReview}>
          <button
            type="button"
            className="review-modal-close"
            onClick={closeReviewModal}
            disabled={reviewBusy}
            aria-label="Fechar"
          >
            ×
          </button>

          <div className="review-modal-heading">
            <span>COMPRA VERIFICADA</span>
            <h2 id="review-modal-title">Avaliar produto</h2>
            <p>{reviewModal.productName}</p>
          </div>

          {existingReview && (
            <div className={`review-current-status ${existingReview.moderation_status || "pending"}`}>
              <strong>{reviewModerationLabel(existingReview)}</strong>
              {existingReview.moderation_note && <p>{existingReview.moderation_note}</p>}
              <small>Ao editar, a avaliação volta para análise.</small>
            </div>
          )}

          <div className="review-form-section">
            <label>NOTA DA COMPRA</label>
            <div className="review-star-selector" role="radiogroup" aria-label="Nota da avaliação">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= reviewRating ? "active" : ""}
                  onClick={() => setReviewRating(star)}
                  disabled={reviewBusy}
                  aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="review-form-section">
            <div className="review-label-row">
              <label htmlFor="review-comment">SEU COMENTÁRIO</label>
              <small>{reviewComment.length}/1200</small>
            </div>
            <textarea
              id="review-comment"
              value={reviewComment}
              maxLength={1200}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Conte como foi sua experiência com o produto..."
              disabled={reviewBusy}
              rows={6}
            />
            <div className="review-moderation-info">
              <span>🛡</span>
              <p>Comentários com palavrões, conteúdo sexual/+18 ou tentativas de burlar o filtro são bloqueados automaticamente.</p>
            </div>
          </div>

          <div className="review-form-section">
            <div className="review-label-row">
              <label>FOTOS DA COMPRA</label>
              <small>{allPhotoCount}/3</small>
            </div>

            {(reviewExistingPhotos.length > 0 || reviewNewPhotos.length > 0) && (
              <div className="review-photo-grid">
                {reviewExistingPhotos.map((photo) => (
                  <div className="review-photo-preview" key={photo.id}>
                    <img src={photo.publicUrl} alt="Foto anexada à avaliação" />
                    <button
                      type="button"
                      onClick={() => removeExistingReviewPhoto(photo.id)}
                      disabled={reviewBusy}
                      aria-label="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {reviewNewPhotos.map((photo) => (
                  <div className="review-photo-preview" key={photo.id}>
                    <img src={photo.previewUrl} alt="Nova foto da avaliação" />
                    <button
                      type="button"
                      onClick={() => removeNewReviewPhoto(photo.id)}
                      disabled={reviewBusy}
                      aria-label="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {allPhotoCount < 3 && (
              <label className={`review-photo-upload ${reviewBusy ? "disabled" : ""}`}>
                <span>＋</span>
                <div>
                  <strong>ANEXAR FOTO</strong>
                  <small>JPG, PNG ou WEBP • até 5 MB cada</small>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleReviewFiles}
                  disabled={reviewBusy}
                />
              </label>
            )}

            <p className="review-photo-safety-note">
              As fotos também passam pela aprovação da equipe antes de aparecerem na loja.
            </p>
          </div>

          {reviewError && <div className="review-form-error">{reviewError}</div>}

          <div className="review-modal-actions">
            <button type="button" onClick={closeReviewModal} disabled={reviewBusy}>
              VOLTAR
            </button>
            <button type="submit" disabled={reviewBusy}>
              {reviewBusy ? "ENVIANDO..." : existingReview ? "SALVAR E ENVIAR PARA ANÁLISE" : "ENVIAR AVALIAÇÃO"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  function PixCancelConfirmationModal() {
    if (!pixCancelConfirmOpen) return null;

    return (
      <div
        className="pix-cancel-confirm-overlay"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pix-cancel-confirm-title"
        aria-describedby="pix-cancel-confirm-description"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !paymentBusy) {
            setPixCancelConfirmOpen(false);
          }
        }}
      >
        <div className="pix-cancel-confirm-card">
          <button
            type="button"
            className="pix-cancel-confirm-close"
            aria-label="Fechar"
            onClick={() => setPixCancelConfirmOpen(false)}
            disabled={paymentBusy}
          >
            ×
          </button>

          <div className="pix-cancel-confirm-icon" aria-hidden="true">!</div>

          <span className="pix-cancel-confirm-eyebrow">CONFIRMAR CANCELAMENTO</span>

          <h2 id="pix-cancel-confirm-title">Cancelar este pedido PIX?</h2>

          <p id="pix-cancel-confirm-description">
            O carrinho será mantido. Antes de cancelar, vamos consultar o Mercado Pago
            para garantir que o pagamento ainda não foi aprovado.
          </p>

          <div className="pix-cancel-confirm-warning">
            <span>◈</span>
            <small>
              Se o pagamento já tiver sido confirmado, o pedido não será cancelado.
            </small>
          </div>

          <div className="pix-cancel-confirm-actions">
            <button
              type="button"
              className="pix-cancel-confirm-back"
              onClick={() => setPixCancelConfirmOpen(false)}
              disabled={paymentBusy}
            >
              VOLTAR
            </button>

            <button
              type="button"
              className="pix-cancel-confirm-submit"
              onClick={cancelPixPayment}
              disabled={paymentBusy}
            >
              {paymentBusy ? "AGUARDE..." : "SIM, CANCELAR PEDIDO"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ShippingCalculationOverlay() {
    if (!shippingLoading) return null;

    return (
      <div
        className="shipping-loading-overlay"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label="Calculando frete"
      >
        <div className="shipping-loading-backdrop" />

        <div className="shipping-loading-card">
          <div className="shipping-loading-route" aria-hidden="true">
            <div className="shipping-loading-point origin">
              <span />
            </div>

            <div className="shipping-loading-road">
              <span className="shipping-loading-road-line" />
              <div className="shipping-loading-truck">🚚</div>
            </div>

            <div className="shipping-loading-point destination">
              <span />
            </div>
          </div>

          <span className="shipping-loading-eyebrow">MELHOR ENVIO</span>
          <h2>Calculando seu frete...</h2>
          <p>
            Estamos consultando as transportadoras e buscando as melhores opções de preço e prazo para o seu pedido.
          </p>

          <div className="shipping-loading-progress" aria-hidden="true">
            <span />
          </div>

          <div className="shipping-loading-status">
            <span className="shipping-loading-status-dot" />
            <small>Consultando transportadoras em tempo real</small>
          </div>

          <div className="shipping-loading-note">
            <span>◈</span>
            <small>Aguarde alguns segundos. O valor será atualizado automaticamente.</small>
          </div>
        </div>
      </div>
    );
  }

  function AuthActionOverlay() {
    if (!authActionOverlay) return null;

    return (
      <div
        className="shipping-loading-overlay auth-action-overlay"
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
        aria-label={authActionOverlay.title}
      >
        <div className="shipping-loading-backdrop" />

        <div className="shipping-loading-card auth-action-card">
          <div className="auth-action-visual" aria-hidden="true">
            <span className="auth-action-ring outer" />
            <span className="auth-action-ring inner" />
            <div className="auth-action-icon">{authActionOverlay.icon}</div>
          </div>

          <span className="shipping-loading-eyebrow">
            {authActionOverlay.eyebrow}
          </span>
          <h2>{authActionOverlay.title}</h2>
          <p>{authActionOverlay.message}</p>

          <div className="shipping-loading-progress" aria-hidden="true">
            <span />
          </div>

          <div className="shipping-loading-status">
            <span className="shipping-loading-status-dot" />
            <small>{authActionOverlay.status}</small>
          </div>

          <div className="shipping-loading-note">
            <span>◈</span>
            <small>{authActionOverlay.note}</small>
          </div>
        </div>
      </div>
    );
  }

  function PaymentProcessingOverlay() {
    if (!paymentOverlay) return null;

    const isSuccess = paymentOverlay.mode === "success";

    return (
      <div
        className={`payment-processing-overlay ${isSuccess ? "is-success" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
        aria-label={paymentOverlay.title}
      >
        <div className="payment-processing-backdrop" />
        <div className="payment-processing-card">
          <div className="payment-processing-visual" aria-hidden="true">
            {isSuccess ? (
              <div className="payment-success-check">✓</div>
            ) : (
              <div className="payment-loading-rings">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <span className="payment-processing-eyebrow">
            {isSuccess ? "PAGAMENTO APROVADO" : "AMBIENTE SEGURO"}
          </span>

          <h2>{paymentOverlay.title}</h2>
          <p>{paymentOverlay.message}</p>

          {!isSuccess && (
            <div className="payment-processing-note">
              <span>◈</span>
              <small>Evite atualizar a página ou clicar novamente enquanto processamos.</small>
            </div>
          )}
        </div>
      </div>
    );
  }

  function Footer() {
    if (page === "checkout" || page === "pixPayment" || page === "orderSuccess") {
      return <footer className="checkout-footer"><div className="checkout-footer-inner"><span>BROTHER'S GAMES</span><p>Pagamento via Mercado Pago</p></div></footer>;
    }

    return (
      <footer className="site-footer">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <button type="button" className="site-footer-brand-logo" onClick={goHome} aria-label="Voltar para o início">
              <span>BROTHER</span><strong>'S</strong><span> GAMES</span>
            </button>

            <p>Seu jogo. Seu setup. Seu próximo nível.</p>

            <div className="site-footer-socials">
              <button
                type="button"
                className="site-footer-social-button"
                onClick={openInstagram}
                aria-label="Abrir Instagram @souzx._.a"
                title="Instagram · @souzx._.a"
              >
                <InstagramIcon />
              </button>

              <button
                type="button"
                className="site-footer-social-contact"
                onClick={() => openInstitutionalPage("contact")}
              >
                FALE CONOSCO
              </button>
            </div>

            <small>@souzx._.a</small>
          </div>

          <div className="site-footer-column">
            <h3>LOJA</h3>
            <button type="button" onClick={() => openProducts("Todos")}>Todos os produtos</button>
            <button type="button" onClick={() => openProducts("Jogos")}>Jogos</button>
            <button type="button" onClick={() => openProducts("Periféricos")}>Periféricos</button>
            <button type="button" onClick={openOffers}>Ofertas</button>
          </div>

          <div className="site-footer-column">
            <h3>INSTITUCIONAL</h3>
            <button type="button" onClick={() => openInstitutionalPage("about")}>Sobre nós</button>
            <button type="button" onClick={() => openInstitutionalPage("contact")}>Contato</button>
            <button type="button" onClick={() => openInstitutionalPage("terms")}>Termos de uso</button>
            <button type="button" onClick={() => openInstitutionalPage("privacy")}>Política de privacidade</button>
            <button type="button" onClick={() => openInstitutionalPage("returns")}>Trocas e devoluções</button>
          </div>

          <div className="site-footer-column">
            <h3>MINHA CONTA</h3>
            <button type="button" onClick={openFooterMyData}>Meus dados</button>
            <button type="button" onClick={openFooterMyOrders}>Meus pedidos</button>
            <button type="button" onClick={openCart}>Carrinho</button>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 BROTHER'S GAMES. Todos os direitos reservados.</span>
          <span className="site-footer-bottom-note">Compra segura · Pagamentos via Mercado Pago</span>
        </div>
      </footer>
    );
  }

  function InstitutionalModal() {
    if (!institutionalPage) return null;

    const content = {
      about: {
        eyebrow: "BROTHER'S GAMES",
        title: "Sobre nós",
        intro:
          "A BROTHER'S GAMES nasceu para reunir jogos, periféricos e acessórios em uma experiência de compra simples, segura e feita para quem gosta do universo gamer.",
        sections: [
          {
            title: "Nossa proposta",
            text:
              "Oferecer uma loja organizada, com informações claras sobre produtos, pedidos e pagamentos, mantendo o cliente no controle de cada etapa da compra.",
          },
          {
            title: "Experiência gamer",
            text:
              "Do catálogo ao pós-venda, buscamos uma identidade direta, moderna e voltada para jogadores que querem encontrar tudo em um só lugar.",
          },
        ],
      },
      contact: {
        eyebrow: "ATENDIMENTO",
        title: "Contato",
        intro:
          "Precisa falar com a BROTHER'S GAMES? Nosso canal de contato disponível no site é o Instagram.",
        sections: [
          {
            title: "Instagram",
            text:
              "Envie uma mensagem para @souzx._.a. Para agilizar o atendimento sobre uma compra, informe o número do pedido sem enviar senhas, dados completos do cartão ou códigos de autenticação.",
          },
        ],
        action: "instagram",
      },
      terms: {
        eyebrow: "INSTITUCIONAL",
        title: "Termos de uso",
        intro:
          "Ao utilizar a BROTHER'S GAMES, o cliente concorda em fornecer informações verdadeiras, utilizar a plataforma de forma legítima e respeitar as condições apresentadas no momento da compra.",
        sections: [
          {
            title: "Conta e segurança",
            text:
              "O acesso à conta é pessoal. O cliente deve manter suas credenciais protegidas e comunicar qualquer uso suspeito assim que possível.",
          },
          {
            title: "Pedidos e pagamentos",
            text:
              "Preços, itens, descontos e valores finais são validados pelo servidor. A confirmação de um pedido depende da aprovação do meio de pagamento e das verificações aplicáveis.",
          },
          {
            title: "Uso da plataforma",
            text:
              "Não é permitido tentar manipular preços, pedidos, avaliações, pagamentos, acessos ou qualquer funcionalidade da loja.",
          },
        ],
      },
      privacy: {
        eyebrow: "PRIVACIDADE",
        title: "Política de privacidade",
        intro:
          "A BROTHER'S GAMES utiliza os dados necessários para criar e proteger contas, processar pedidos, prestar atendimento e viabilizar a entrega ou disponibilização dos produtos comprados.",
        sections: [
          {
            title: "Dados da conta e do pedido",
            text:
              "Podem ser utilizados dados como nome, e-mail, telefone, endereço e informações relacionadas aos pedidos, sempre de acordo com a finalidade do serviço.",
          },
          {
            title: "Pagamentos",
            text:
              "Os pagamentos são processados pelo Mercado Pago. A loja não armazena número completo do cartão nem código de segurança do cartão.",
          },
          {
            title: "Segurança",
            text:
              "Aplicamos controles de acesso e validações para reduzir uso indevido da plataforma. O cliente também deve proteger sua senha e seus dispositivos.",
          },
        ],
      },
      returns: {
        eyebrow: "PÓS-VENDA",
        title: "Trocas e devoluções",
        intro:
          "Solicitações de troca, devolução ou reembolso são analisadas conforme o tipo de produto, o estado do pedido, as condições da compra e a legislação aplicável.",
        sections: [
          {
            title: "Produtos físicos",
            text:
              "Em caso de problema, produto divergente ou necessidade de devolução, entre em contato informando o número do pedido e descrevendo a situação. Poderão ser solicitadas fotos para análise.",
          },
          {
            title: "Produtos digitais",
            text:
              "Pedidos de jogos ou outros itens digitais podem exigir análise específica, especialmente quando uma chave, código ou conteúdo já tiver sido disponibilizado ou utilizado.",
          },
          {
            title: "Como solicitar",
            text:
              "Entre em contato pelo Instagram @souzx._.a com o número do pedido. Nunca envie senha da conta, código de autenticação ou dados completos do cartão.",
          },
        ],
        action: "instagram",
      },
    };

    const current = content[institutionalPage];
    if (!current) return null;

    return (
      <div
        className="institutional-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="institutional-modal-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeInstitutionalPage();
        }}
      >
        <article className="institutional-modal">
          <button
            type="button"
            className="institutional-close"
            onClick={closeInstitutionalPage}
            aria-label="Fechar"
          >
            ×
          </button>

          <div className="institutional-header">
            <span>{current.eyebrow}</span>
            <h2 id="institutional-modal-title">{current.title}</h2>
            <p>{current.intro}</p>
          </div>

          <div className="institutional-content">
            {current.sections.map((section) => (
              <section key={section.title} className="institutional-section">
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </section>
            ))}
          </div>

          {current.action === "instagram" && (
            <button
              type="button"
              className="institutional-instagram-button"
              onClick={openInstagram}
            >
              <InstagramIcon />
              FALAR PELO INSTAGRAM
            </button>
          )}

          <div className="institutional-security-note">
            <span>◈</span>
            <p>A BROTHER'S GAMES nunca deve solicitar sua senha ou código de segurança do cartão por mensagem.</p>
          </div>
        </article>
      </div>
    );
  }

  function PasswordRecoveryContent() {
    return (
      <div className="password-recovery">
        <div className="account-header password-recovery-header">
          <div className="account-large-icon">⌁</div>
          <span>SEGURANÇA DA CONTA</span>
          <h2>
            {passwordRecovery.step === "new-password"
              ? "NOVA SENHA"
              : passwordRecovery.step === "verify"
                ? "CONFIRMAR CÓDIGO"
                : "REDEFINIR SENHA"}
          </h2>
          <p>
            {passwordRecovery.step === "new-password"
              ? "Crie uma senha nova e segura para sua conta."
              : passwordRecovery.step === "verify"
                ? "Digite o código enviado para seu e-mail."
                : "Receba um código seguro no e-mail cadastrado."}
          </p>
        </div>

        {passwordRecovery.step === "request" && (
          <form className="account-form recovery-form" onSubmit={sendPasswordResetCode}>
            <div className="recovery-methods" aria-label="Recuperação por e-mail">
              <button type="button" className="active" tabIndex={-1} aria-pressed="true">
                <span>✉</span>
                <strong>CÓDIGO POR E-MAIL</strong>
                <small>Gratuito e enviado para sua caixa de entrada</small>
              </button>
            </div>

            <label>
              E-mail cadastrado
              <input
                type="email"
                placeholder="seuemail@email.com"
                autoComplete="email"
                value={passwordRecovery.email}
                onChange={(event) =>
                  setPasswordRecovery((current) => ({
                    ...current,
                    email: event.target.value,
                    error: "",
                  }))
                }
              />
            </label>

            {passwordRecovery.error && (
              <p className="recovery-message error" role="alert">{passwordRecovery.error}</p>
            )}
            {passwordRecovery.notice && (
              <p className="recovery-message success">{passwordRecovery.notice}</p>
            )}

            <button type="submit" className="account-submit" disabled={authBusy}>
              {authBusy ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
            </button>
          </form>
        )}

        {passwordRecovery.step === "verify" && (
          <form className="account-form recovery-form" onSubmit={verifyPasswordResetCode}>
            <div className="recovery-destination">
              <span>CÓDIGO ENVIADO PARA</span>
              <strong>{passwordRecovery.email}</strong>
            </div>

            <label>
              Código de segurança
              <input
                className="recovery-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="000000"
                value={passwordRecovery.code}
                onChange={(event) =>
                  setPasswordRecovery((current) => ({
                    ...current,
                    code: event.target.value.replace(/\D/g, "").slice(0, 8),
                    error: "",
                  }))
                }
                autoFocus
              />
            </label>

            {passwordRecovery.error && (
              <p className="recovery-message error" role="alert">{passwordRecovery.error}</p>
            )}
            {passwordRecovery.notice && (
              <p className="recovery-message success">{passwordRecovery.notice}</p>
            )}

            <button type="submit" className="account-submit" disabled={authBusy}>
              {authBusy ? "VERIFICANDO..." : "CONFIRMAR CÓDIGO"}
            </button>
            <button
              type="button"
              className="recovery-secondary-button"
              onClick={sendPasswordResetCode}
              disabled={authBusy}
            >
              REENVIAR CÓDIGO
            </button>
          </form>
        )}

        {passwordRecovery.step === "new-password" && (
          <form className="account-form recovery-form" onSubmit={saveNewPassword}>
            <label>
              Nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Mínimo de 8 caracteres"
                value={passwordRecovery.newPassword}
                onChange={(event) =>
                  setPasswordRecovery((current) => ({
                    ...current,
                    newPassword: event.target.value,
                    error: "",
                  }))
                }
              />
            </label>
            <label>
              Confirmar nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Digite a senha novamente"
                value={passwordRecovery.confirmPassword}
                onChange={(event) =>
                  setPasswordRecovery((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                    error: "",
                  }))
                }
              />
            </label>

            <div className="password-strength-hint">
              Use pelo menos 8 caracteres e evite senhas utilizadas em outros sites.
            </div>

            {passwordRecovery.error && (
              <p className="recovery-message error" role="alert">{passwordRecovery.error}</p>
            )}
            {passwordRecovery.notice && (
              <p className="recovery-message success">{passwordRecovery.notice}</p>
            )}

            <button type="submit" className="account-submit" disabled={authBusy}>
              {authBusy ? "SALVANDO..." : "SALVAR NOVA SENHA"}
            </button>
          </form>
        )}

        <button
          type="button"
          className="recovery-back-button"
          onClick={cancelPasswordRecovery}
          disabled={authBusy}
        >
          ← VOLTAR PARA O LOGIN
        </button>
      </div>
    );
  }

  function AccountModal() {
    if (!accountOpen) return null;

    const itemsByOrder = new Map();
    for (const item of myOrderItems) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    const reviewByProduct = new Map(
      myReviews.map((review) => [review.product_id, review])
    );

    const issueByOrder = new Map(
      myOrderIssues.map((issue) => [issue.order_id, issue])
    );

    const fulfillmentByOrderItem = new Map(
      myOrderFulfillments.map((item) => [
        item.order_item_id,
        item,
      ])
    );

    function orderItemDeliveryType(item) {
      if (
        item?.delivery_type === "digital" ||
        item?.delivery_type === "physical"
      ) {
        return item.delivery_type;
      }

      return "physical";
    }

    function itemFulfillmentStatusLabel(
      fulfillment,
      deliveryType
    ) {
      const labels = {
        awaiting_payment: "Aguardando pagamento",
        awaiting_delivery: "Aguardando entrega digital",
        preparing: "Preparando envio",
        shipped: "Enviado",
        delivered: "Entregue",
        cancelled: "Encerrado",
      };

      return (
        labels[fulfillment?.status] ||
        (deliveryType === "digital"
          ? "Aguardando entrega digital"
          : "Preparando envio")
      );
    }

    return (
      <div className="modal-overlay account-overlay" onClick={closeAccount}>
        <div className="account-modal" onClick={(event) => event.stopPropagation()}>
          <button className="close-modal" onClick={closeAccount}>×</button>

          {authLoading && !passwordRecovery.active ? (
            <div className="account-header"><div className="account-large-icon">◌</div><span>BROTHER'S GAMES</span><h2>CARREGANDO</h2><p>Verificando sua sessão...</p></div>
          ) : passwordRecovery.active ? (
            PasswordRecoveryContent()
          ) : !user ? (
            <>
              <div className="account-header">
                <div className="account-large-icon">♙</div><span>BROTHER'S GAMES</span>
                <h2>{accountMode === "login" ? "ENTRAR" : "CRIAR CONTA"}</h2>
                <p>{accountMode === "login" ? "Entre na sua conta para continuar." : "Crie sua conta para acompanhar suas compras."}</p>
              </div>

              <form className="account-form" onSubmit={handleAccountSubmit}>
                {accountMode === "register" && <label>Nome<input type="text" placeholder="Seu nome" value={accountForm.name} onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))} /></label>}
                <label>E-mail<input type="email" placeholder="seuemail@email.com" autoComplete="email" value={accountForm.email} onChange={(event) => setAccountForm((current) => ({ ...current, email: event.target.value }))} /></label>
                <label>Senha<input type="password" placeholder="Sua senha" autoComplete={accountMode === "login" ? "current-password" : "new-password"} value={accountForm.password} onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))} /></label>
                <button type="submit" className="account-submit" disabled={authBusy}>{authBusy ? "AGUARDE..." : accountMode === "login" ? "ENTRAR" : "CRIAR CONTA"}</button>
              </form>

              {authNotice && <p className="auth-notice success">{authNotice}</p>}

              {accountMode === "login" && (
                <button type="button" className="forgot-password-button" onClick={openPasswordRecovery}>
                  Esqueci minha senha
                </button>
              )}

              <div className="account-switch">
                {accountMode === "login" ? <>Ainda não possui uma conta? <button onClick={() => { setAccountMode("register"); setAuthNotice(""); }}>Criar conta</button></> : <>Já possui uma conta? <button onClick={() => { setAccountMode("login"); setAuthNotice(""); }}>Entrar</button></>}
              </div>
            </>
          ) : (
            <div className="logged-account">
              {accountPage === "home" && (
                <>
                  <div className="account-avatar-summary">
                    <UserAvatar className="user-avatar-large" />
                    <button type="button" className="avatar-change-link" onClick={openAvatarSettings}>
                      Alterar foto / avatar
                    </button>
                  </div>
                  <span>{isOwner ? "CONTA OWNER" : isAdmin ? "CONTA ADMIN" : "MINHA CONTA"}</span>
                  <h2>Olá, {user.name}!</h2><p>{user.email}</p>
                  <div className="account-options">
                    {isAdmin && <button onClick={openAdminPanel}>🛡️ Painel administrativo</button>}
                    <button onClick={openMyOrders}>📦 Meus pedidos</button>
                    <button onClick={openMyData}>👤 Meus dados</button>
                    <button onClick={openAvatarSettings}>🖼️ Foto e avatar</button>
                    <button onClick={logout}>↪ Sair da conta</button>
                  </div>
                </>
              )}

              {accountPage === "orders" && (
                <div className="account-page">
                  <button className="account-back" onClick={() => setAccountPage("home")}>← Voltar</button>
                  <div className="account-page-title">
                    <span>MINHA CONTA</span>
                    <h3>Meus pedidos</h3>
                    <p>Acompanhe o pagamento, a entrega e avalie produtos já recebidos.</p>
                  </div>

                  {reviewNotice && (
                    <div className="review-account-notice">
                      <span>✓</span>
                      <p>{reviewNotice}</p>
                      <button type="button" onClick={() => setReviewNotice("")}>×</button>
                    </div>
                  )}

                  {myOrdersLoading ? (
                    <div className="account-empty"><div>◌</div><strong>Carregando...</strong></div>
                  ) : myOrders.length === 0 ? (
                    <div className="account-empty">
                      <div>📦</div>
                      <strong>Nenhum pedido ainda</strong>
                      <p>Quando você finalizar uma compra, ela aparecerá aqui.</p>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {myOrders.map((order) => {
                        const paymentLabel = paymentStatusLabel(order.status);
                        const fulfillmentLabel = fulfillmentStatusLabel(order);
                        const paid = PAID_ORDER_STATUSES.includes(order.status);

                        return (
                          <article className="order-card" key={order.id}>
                            <div className="order-card-header">
                              <div>
                                <span>PEDIDO</span>
                                <strong>#{order.order_number || String(order.id).slice(0, 8)}</strong>
                              </div>
                              <div className={`order-status order-payment-${order.status}`}>
                                {paymentLabel}
                              </div>
                            </div>

                            <div className="order-card-date">
                              {new Date(order.created_at).toLocaleString("pt-BR")}
                            </div>

                            <div className="order-products">
                              {(itemsByOrder.get(order.id) || []).map((item) => (
                                <div key={item.id}>
                                  <span>{item.quantity}x {translateProductName(item.product_name, language)}</span>
                                  <strong>
                                    {formatPrice(Number(item.unit_price) * item.quantity)}
                                  </strong>
                                </div>
                              ))}
                            </div>

                            {normalizedFulfillmentStatus(order) === "delivered" && (
                              <div className="order-review-actions">
                                <div className="order-review-heading">
                                  <span>ENTREGA CONFIRMADA</span>
                                  <strong>Agora você já pode avaliar os produtos deste pedido</strong>
                                  <small>Escolha um item abaixo. A avaliação será enviada para análise antes da publicação.</small>
                                </div>
                                {(itemsByOrder.get(order.id) || [])
                                  .filter((item) => item.product_id)
                                  .map((item) => {
                                    const existingReview = reviewByProduct.get(item.product_id);
                                    return (
                                      <button
                                        type="button"
                                        key={`review-${item.id}`}
                                        className={`order-review-button ${existingReview?.moderation_status || "new"}`}
                                        onClick={() => openReviewModal(order, item)}
                                      >
                                        <strong>{existingReview ? "EDITAR AVALIAÇÃO" : "AVALIAR PRODUTO"}</strong>
                                        <small>
                                          {existingReview
                                            ? reviewModerationLabel(existingReview)
                                            : translateProductName(item.product_name, language)}
                                        </small>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}

                            {normalizedFulfillmentStatus(order) === "delivered" && (() => {
                              const issue = issueByOrder.get(order.id);
                              const deadline = orderIssueDeadline(order);
                              const canOpen = canOpenOrderIssue(order) && !issue;

                              return (
                                <div className="order-issue-summary">
                                  <div>
                                    <span>SUPORTE PÓS-ENTREGA</span>
                                    {issue ? (
                                      <>
                                        <strong>{orderIssueStatusLabel(issue.status)}</strong>
                                        <small>Solicitação aberta em {new Date(issue.created_at).toLocaleString("pt-BR")}.</small>
                                      </>
                                    ) : canOpen ? (
                                      <>
                                        <strong>Teve algum problema com o pedido?</strong>
                                        <small>Você pode informar um problema até {deadline?.toLocaleString("pt-BR")}.</small>
                                      </>
                                    ) : (
                                      <>
                                        <strong>Prazo para suporte encerrado</strong>
                                        <small>O prazo de 5 dias após a entrega terminou.</small>
                                      </>
                                    )}
                                  </div>
                                  {(issue || canOpen) && (
                                    <button type="button" onClick={() => openOrderIssue(order)}>
                                      {issue ? "VER SOLICITAÇÃO / CHAT" : "TIVE UM PROBLEMA"}
                                    </button>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="order-card-progress-summary">
                              <span>{paid ? "ANDAMENTO" : "STATUS DO PEDIDO"}</span>
                              <strong className={`fulfillment-text ${fulfillmentStatusClass(order)}`}>
                                {fulfillmentLabel}
                              </strong>
                            </div>

                            <div className="order-card-total">
                              <span>TOTAL</span>
                              <strong>{formatPrice(order.total)}</strong>
                            </div>

                            <button
                              type="button"
                              className="track-order-button"
                              onClick={() => openOrderTracking(order)}
                            >
                              ACOMPANHAR PEDIDO
                              <span>→</span>
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {accountPage === "orderTracking" && (() => {
                const order = myOrders.find((item) => item.id === trackingOrderId);

                if (!order) {
                  return (
                    <div className="account-page">
                      <button className="account-back" onClick={openMyOrders}>← Voltar</button>
                      <div className="account-empty">
                        <div>📦</div>
                        <strong>Pedido não encontrado</strong>
                        <p>Atualize a lista de pedidos e tente novamente.</p>
                      </div>
                    </div>
                  );
                }

                const fulfillment = normalizedFulfillmentStatus(order);
                const paid = PAID_ORDER_STATUSES.includes(order.status);
                const cancelled = ["cancelled", "expired", "refunded"].includes(order.status);
                const progressOrder = ["preparing", "shipped", "delivered"];
                const progressIndex = progressOrder.indexOf(fulfillment);
                const trackingItems = itemsByOrder.get(order.id) || [];

                const deliverySteps = [
                  {
                    id: "payment",
                    title: paid ? "Pagamento confirmado" : paymentStatusLabel(order.status),
                    description: paid
                      ? "O pagamento deste pedido foi aprovado."
                      : cancelled
                        ? "Este pedido não seguirá para preparação."
                        : "Estamos aguardando a confirmação do pagamento.",
                    state: paid ? "done" : cancelled ? "cancelled" : "current",
                  },
                  {
                    id: "preparing",
                    title: "Preparando pedido",
                    description: "A Brother's Games está preparando o pedido para envio ou entrega.",
                    state: cancelled || !paid
                      ? "waiting"
                      : progressIndex > 0
                        ? "done"
                        : fulfillment === "preparing"
                          ? "current"
                          : "waiting",
                  },
                  {
                    id: "shipped",
                    title: "Pedido enviado",
                    description: "O pedido saiu para a etapa de entrega.",
                    state: cancelled || !paid
                      ? "waiting"
                      : progressIndex > 1
                        ? "done"
                        : fulfillment === "shipped"
                          ? "current"
                          : "waiting",
                  },
                  {
                    id: "delivered",
                    title: "Entregue",
                    description: "O pedido foi marcado como entregue.",
                    state: cancelled || !paid
                      ? "waiting"
                      : fulfillment === "delivered"
                        ? "done"
                        : "waiting",
                  },
                ];

                return (
                  <div className="account-page order-tracking-page">
                    <button className="account-back" onClick={openMyOrders}>← Voltar aos pedidos</button>

                    <div className="account-page-title">
                      <span>ACOMPANHAMENTO</span>
                      <h3>Pedido #{order.order_number || String(order.id).slice(0, 8)}</h3>
                      <p>{new Date(order.created_at).toLocaleString("pt-BR")}</p>
                    </div>

                    <div className="tracking-summary-card">
                      <div>
                        <span>PAGAMENTO</span>
                        <strong>{paymentStatusLabel(order.status)}</strong>
                      </div>
                      <div>
                        <span>ANDAMENTO</span>
                        <strong>{fulfillmentStatusLabel(order)}</strong>
                      </div>
                      <div>
                        <span>TOTAL</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>

                    <div className={`tracking-timeline ${cancelled ? "is-cancelled" : ""}`}>
                      {deliverySteps.map((step, index) => (
                        <div className={`tracking-step ${step.state}`} key={step.id}>
                          <div className="tracking-step-rail">
                            <span className="tracking-step-dot">
                              {step.state === "done" ? "✓" : step.state === "cancelled" ? "×" : index + 1}
                            </span>
                            {index < deliverySteps.length - 1 && <i />}
                          </div>
                          <div className="tracking-step-copy">
                            <strong>{step.title}</strong>
                            <p>{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tracking-products">
                      <span>ITENS DO PEDIDO</span>

                      {trackingItems.map((item) => {
                        const deliveryType =
                          orderItemDeliveryType(item);
                        const fulfillment =
                          fulfillmentByOrderItem.get(item.id) ||
                          null;
                        const fulfillmentStatus =
                          itemFulfillmentStatusLabel(
                            fulfillment,
                            deliveryType
                          );

                        return (
                          <div
                            className="order-item-delivery-box"
                            key={item.id}
                          >
                            <div>
                              <span>
                                {item.quantity}x{" "}
                                {translateProductName(
                                  item.product_name,
                                  language
                                )}
                              </span>
                              <strong>
                                {formatPrice(
                                  Number(item.unit_price) *
                                    item.quantity
                                )}
                              </strong>
                            </div>

                            <div className="order-item-delivery-box-head">
                              <span
                                className={`fulfillment-type-badge ${deliveryType}`}
                              >
                                {deliveryType === "digital"
                                  ? "⚡ DIGITAL"
                                  : "📦 FÍSICO"}
                              </span>

                              <span
                                className={`fulfillment-status-badge ${
                                  fulfillment?.status || ""
                                }`}
                              >
                                {fulfillmentStatus}
                              </span>
                            </div>

                            {deliveryType === "digital" ? (
                              fulfillment?.status ===
                                "delivered" &&
                              fulfillment?.digital_content ? (
                                <details className="digital-delivery-details">
                                  <summary>
                                    REVELAR ENTREGA DIGITAL
                                  </summary>
                                  <pre>
                                    {fulfillment.digital_content}
                                  </pre>
                                </details>
                              ) : (
                                <p>
                                  Assim que a equipe liberar a
                                  chave, link ou instruções, a
                                  entrega digital aparecerá aqui.
                                </p>
                              )
                            ) : (
                              <div className="physical-tracking-data">
                                <span>
                                  Transportadora:{" "}
                                  <strong>
                                    {fulfillment?.carrier ||
                                      "A definir"}
                                  </strong>
                                </span>

                                <span>
                                  Rastreio:{" "}
                                  <strong>
                                    {fulfillment?.tracking_code ||
                                      "Ainda não informado"}
                                  </strong>
                                </span>

                                {fulfillment?.tracking_url && (
                                  <a
                                    href={
                                      fulfillment.tracking_url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    RASTREAR ENCOMENDA →
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {fulfillment === "delivered" && (() => {
                      const issue = issueByOrder.get(order.id);
                      const deadline = orderIssueDeadline(order);
                      const canOpen = canOpenOrderIssue(order) && !issue;
                      return (
                        <div className="tracking-issue-card">
                          <span>SUPORTE PÓS-ENTREGA</span>
                          <strong>{issue ? orderIssueStatusLabel(issue.status) : canOpen ? "Problemas com o pedido" : "Prazo encerrado"}</strong>
                          <p>
                            {issue
                              ? "Acompanhe a análise e converse com a equipe da Brother's Games."
                              : canOpen
                                ? `Você pode abrir uma solicitação até ${deadline?.toLocaleString("pt-BR")}.`
                                : "O prazo de 5 dias após a entrega para informar problemas foi encerrado."}
                          </p>
                          {(issue || canOpen) && (
                            <button type="button" onClick={() => openOrderIssue(order)}>
                              {issue ? "ABRIR SOLICITAÇÃO / CHAT" : "TIVE UM PROBLEMA COM ESTE PEDIDO"}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <button
                      type="button"
                      className="tracking-refresh-button"
                      onClick={() => loadMyOrders(true)}
                      disabled={myOrdersLoading}
                    >
                      {myOrdersLoading ? "ATUALIZANDO..." : "ATUALIZAR ACOMPANHAMENTO"}
                    </button>
                  </div>
                );
              })()}

              {accountPage === "orderIssue" && (() => {
                const order = myOrders.find((item) => item.id === issueOrderId);
                if (!order) return null;
                const issue = issueByOrder.get(order.id);
                const deadline = orderIssueDeadline(order);
                const canOpen = canOpenOrderIssue(order) && !issue;
                const chatClosed = issue && ["rejected", "closed"].includes(issue.status);

                return (
                  <div className="account-page order-issue-page">
                    <button className="account-back" onClick={openMyOrders}>← Voltar aos pedidos</button>
                    <div className="account-page-title">
                      <span>SUPORTE DO PEDIDO</span>
                      <h3>Pedido #{order.order_number || String(order.id).slice(0, 8)}</h3>
                      <p>{issue ? orderIssueStatusLabel(issue.status) : "Informe o problema ocorrido após a entrega."}</p>
                    </div>

                    {!issue && canOpen && (
                      <div className="order-issue-form-card">
                        <div className="order-issue-deadline">
                          <span>PRAZO PARA ABERTURA</span>
                          <strong>até {deadline?.toLocaleString("pt-BR")}</strong>
                        </div>
                        <label>
                          <span>DESCRIÇÃO DO PROBLEMA *</span>
                          <textarea
                            value={issueDescription}
                            onChange={(event) => setIssueDescription(event.target.value)}
                            maxLength={3000}
                            placeholder="Explique o que aconteceu com o pedido, produto ou entrega..."
                          />
                          <small>{issueDescription.length}/3000</small>
                        </label>
                        <label className="order-issue-image-field">
                          <span>IMAGEM (OPCIONAL)</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleIssueImageChange} />
                          <small>JPG, PNG ou WEBP · até 5 MB</small>
                        </label>
                        {issueImagePreview && (
                          <div className="order-issue-preview">
                            <img src={issueImagePreview} alt="Prévia do problema" />
                            <button type="button" onClick={cleanupIssueImagePreview}>Remover imagem</button>
                          </div>
                        )}
                        <button
                          type="button"
                          className="order-issue-submit"
                          onClick={() => submitOrderIssue(order)}
                          disabled={issueBusy}
                        >
                          {issueBusy ? "ENVIANDO..." : "ENVIAR SOLICITAÇÃO"}
                        </button>
                      </div>
                    )}

                    {!issue && !canOpen && (
                      <div className="account-empty">
                        <div>⌛</div>
                        <strong>Prazo encerrado</strong>
                        <p>O prazo de 5 dias após a entrega para abrir um problema terminou.</p>
                      </div>
                    )}

                    {issue && (
                      <>
                        <div className="order-issue-details-card">
                          <div className="order-issue-status-row">
                            <span>STATUS</span>
                            <strong className={`issue-status ${issue.status}`}>{orderIssueStatusLabel(issue.status)}</strong>
                          </div>
                          <div>
                            <span>PROBLEMA INFORMADO</span>
                            <p>{issue.description}</p>
                          </div>
                          {issue.admin_note && (
                            <div className="order-issue-admin-note">
                              <span>RESPOSTA DA EQUIPE</span>
                              <p>{issue.admin_note}</p>
                            </div>
                          )}
                          {issue.image_path && (
                            <div className="order-issue-evidence">
                              <span>IMAGEM ENVIADA</span>
                              {issueImageUrl ? <img src={issueImageUrl} alt="Imagem enviada no chamado" /> : <small>Carregando imagem...</small>}
                            </div>
                          )}
                        </div>

                        <div className="order-issue-chat-card">
                          <div className="order-issue-chat-heading">
                            <div><span>CONVERSA</span><strong>Atendimento do pedido</strong></div>
                            <small>{chatClosed ? "Conversa encerrada" : "Mensagens em tempo real"}</small>
                          </div>

                          <div className="order-issue-messages">
                            {issueMessagesLoading ? (
                              <div className="order-issue-message-empty">Carregando conversa...</div>
                            ) : issueMessages.length === 0 ? (
                              <div className="order-issue-message-empty">Ainda não há mensagens. A equipe poderá iniciar uma conversa durante a análise.</div>
                            ) : issueMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`order-issue-message ${message.sender_role === "customer" ? "customer" : "support"}`}
                              >
                                <span>{message.sender_role === "customer" ? "Você" : "Suporte Brother's Games"}</span>
                                <p>{message.message}</p>
                                <small>{new Date(message.created_at).toLocaleString("pt-BR")}</small>
                              </div>
                            ))}
                          </div>

                          {!chatClosed && (
                            <div className="order-issue-chat-compose">
                              <textarea
                                value={issueMessage}
                                onChange={(event) => setIssueMessage(event.target.value)}
                                maxLength={3000}
                                placeholder="Digite uma mensagem para o suporte..."
                              />
                              <button type="button" onClick={() => sendIssueMessage(issue)} disabled={issueBusy || !issueMessage.trim()}>
                                ENVIAR
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {accountPage === "avatar" && (
                <div className="account-page avatar-settings-page">
                  <button className="account-back" onClick={() => setAccountPage("home")}>← Voltar</button>
                  <div className="account-page-title">
                    <span>MINHA CONTA</span>
                    <h3>Foto e avatar</h3>
                    <p>Escolha um avatar da Brother&apos;s Games ou envie sua própria foto.</p>
                  </div>

                  <div className="avatar-current-card">
                    <UserAvatar className="user-avatar-current" />
                    <div>
                      <span>AVATAR ATUAL</span>
                      <strong>{userData.avatarType === "upload" ? "Foto personalizada" : currentAvatarPreset().label}</strong>
                    </div>
                  </div>

                  <section className="avatar-section">
                    <div className="avatar-section-heading">
                      <span>01</span>
                      <div><strong>Avatares padrão</strong><small>Escolha um estilo gamer para sua conta.</small></div>
                    </div>
                    <div className="avatar-preset-grid">
                      {avatarPresets.map((preset) => {
                        const active = userData.avatarType === "preset" && userData.avatarValue === preset.id;
                        return (
                          <button key={preset.id} type="button" className={`avatar-preset-option ${active ? "active" : ""}`} onClick={() => selectPresetAvatar(preset.id)} disabled={avatarBusy}>
                            <span className="avatar-preset-preview" style={{ background: preset.background }}>{preset.emoji}</span>
                            <span>{preset.label}</span>
                            {active && <small>SELECIONADO</small>}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="avatar-section">
                    <div className="avatar-section-heading">
                      <span>02</span>
                      <div><strong>Minha foto</strong><small>JPG, PNG ou WEBP com até 5 MB.</small></div>
                    </div>
                    <div className="avatar-upload-actions">
                      <label className={`avatar-upload-button ${avatarBusy ? "disabled" : ""}`}>
                        {avatarBusy ? "AGUARDE..." : "ENVIAR MINHA FOTO"}
                        <input className="avatar-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={avatarBusy} />
                      </label>
                      <button type="button" className="avatar-default-button" onClick={resetAvatarToDefault} disabled={avatarBusy}>USAR AVATAR PADRÃO</button>
                    </div>
                  </section>
                </div>
              )}

              {accountPage === "data" && (
                <div className="account-page">
                  <button className="account-back" onClick={() => setAccountPage("home")}>← Voltar</button>
                  <div className="data-header">
                    <div>
                      <span>MINHA CONTA</span>
                      <h3>Meus dados</h3>
                      <p>Esses dados são salvos no Supabase.</p>
                      <p>Você também pode alterar sua foto de perfil aqui.</p>
                    </div>
                    <button type="button" className="data-avatar-edit" onClick={openAvatarSettings} title="Alterar foto ou avatar">
                      <UserAvatar className="user-avatar-data" />
                      <span>✎</span>
                      <small>ALTERAR FOTO / AVATAR</small>
                    </button>
                  </div>

                  <form className="user-data-form" onSubmit={saveUserData}>
                    <div className="data-section">
                      <div className="data-section-title"><span>01</span><strong>Dados pessoais</strong></div>
                      <div className="data-grid">
                        <label className="data-input"><span>Nome completo</span><input type="text" value={userData.name} onChange={(event) => setUserData((current) => ({ ...current, name: event.target.value }))} /></label>
                        <label className="data-input"><span>E-mail</span><input type="email" value={userData.email} onChange={(event) => setUserData((current) => ({ ...current, email: event.target.value }))} /></label>
                        <label className="data-input"><span>Telefone</span><input type="tel" inputMode="numeric" maxLength={15} value={userData.phone} placeholder="(11) 99999-9999" onChange={(event) => setUserData((current) => ({ ...current, phone: formatPhone(event.target.value) }))} /></label>
                        <label className="data-input"><span>CEP</span><input type="text" value={userData.cep} placeholder="00000-000" maxLength={9} onChange={(event) => handleCepChange(event.target.value)} /></label>
                      </div>
                    </div>

                    <div className="data-section">
                      <div className="data-section-title"><span>02</span><strong>Endereço de entrega</strong></div>
                      <div className="data-grid">
                        <label className="data-input"><span>Endereço</span><input value={userData.address} onChange={(event) => setUserData((current) => ({ ...current, address: event.target.value }))} /></label>
                        <label className="data-input"><span>Número</span><input value={userData.number} onChange={(event) => setUserData((current) => ({ ...current, number: event.target.value }))} /></label>
                        <label className="data-input"><span>Complemento</span><input value={userData.complement} onChange={(event) => setUserData((current) => ({ ...current, complement: event.target.value }))} /></label>
                        <label className="data-input"><span>Bairro</span><input value={userData.neighborhood} onChange={(event) => setUserData((current) => ({ ...current, neighborhood: event.target.value }))} /></label>
                        <label className="data-input"><span>Cidade</span><input value={userData.city} onChange={(event) => setUserData((current) => ({ ...current, city: event.target.value }))} /></label>
                        <label className="data-input"><span>Estado</span><select value={userData.state} onChange={(event) => setUserData((current) => ({ ...current, state: event.target.value }))}><option value="">Selecione</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
                      </div>
                    </div>

                    <div className="data-save-area"><button type="submit" className="save-data-button">SALVAR ALTERAÇÕES</button></div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (page === "admin" && isAdmin) {
    return (
      <AdminPanel
        currentUser={authUser}
        isOwner={isOwner}
        language={language}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBack={() => {
          setPage("home");
          void loadProducts();
          void loadPublicReviews();
        }}
        onProductsChanged={loadProducts}
      />
    );
  }

  return (
    <div className="app">
      {Header()}
      {page === "home" && HomePage()}
      {page === "products" && ProductsPage()}
      {page === "product" && ProductPage()}
      {page === "cart" && CartPage()}
      {page === "checkout" && CheckoutPage()}
      {page === "pixPayment" && PixPaymentPage()}
      {page === "orderSuccess" && OrderSuccessPage()}
      {Footer()}
      {InstitutionalModal()}
      {AccountModal()}
      {ReviewModal()}
      {PixCancelConfirmationModal()}
      {ShippingCalculationOverlay()}
      {AuthActionOverlay()}
      {PaymentProcessingOverlay()}
      {LanguageConfirmationModal()}

      <AIShoppingAssistant
        language={language}
        page={page}
        products={products}
        cart={cart}
        formatPrice={formatPrice}
        onAddToCart={aiAddToCart}
        onRemoveFromCart={aiRemoveFromCart}
        onSetCartQuantity={aiSetCartQuantity}
        onOpenProducts={openProducts}
        onOpenProduct={openProduct}
        onOpenCart={openCart}
        onOpenCheckout={openCheckout}
        onOpenOffers={openOffers}
      />
    </div>
  );
}

export default App;