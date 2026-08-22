import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import robotIcon from "./assets/brothers_assistant_robo.jpg";
import "./ai-assistant.css";

const COPY = {
  "pt-BR": {
    title: "Assistente BROTHER'S",
    subtitle: "Compras com IA",
    hello:
      "Olá! Posso encontrar produtos, comparar opções, montar seu setup e cuidar do seu carrinho.",
    placeholder: "Ex.: quero o GTA V e um teclado...",
    send: "Enviar",
    thinking: "Analisando seu pedido...",
    error: "Não consegui responder agora. Tente novamente em alguns instantes.",
    open: "Abrir assistente de compras",
    close: "Fechar",
    clear: "Limpar conversa",
    add: "Adicionar",
    added: "Adicionado",
    view: "Ver produto",
    stock: "em estoque",
    outOfStock: "sem estoque",
    disclaimer: "A IA pode ajudar com a loja, mas pagamentos sempre exigem sua confirmação.",
    quick: [
      "Monte um setup para mim",
      "Quais são as melhores ofertas?",
      "Quero um teclado",
      "Abra meu carrinho",
    ],
  },
  "en-US": {
    title: "BROTHER'S Assistant",
    subtitle: "AI shopping",
    hello:
      "Hi! I can find products, compare options, build your setup and manage your cart.",
    placeholder: "E.g. I want GTA V and a keyboard...",
    send: "Send",
    thinking: "Working on your request...",
    error: "I couldn't answer right now. Please try again in a moment.",
    open: "Open shopping assistant",
    close: "Close",
    clear: "Clear conversation",
    add: "Add",
    added: "Added",
    view: "View product",
    stock: "in stock",
    outOfStock: "out of stock",
    disclaimer: "AI can help with the store, but payments always require your confirmation.",
    quick: [
      "Build a setup for me",
      "What are the best deals?",
      "I want a keyboard",
      "Open my cart",
    ],
  },
  "es-ES": {
    title: "Asistente BROTHER'S",
    subtitle: "Compras con IA",
    hello:
      "¡Hola! Puedo buscar productos, comparar opciones, montar tu setup y gestionar tu carrito.",
    placeholder: "Ej.: quiero GTA V y un teclado...",
    send: "Enviar",
    thinking: "Analizando tu solicitud...",
    error: "No pude responder ahora. Inténtalo de nuevo en unos instantes.",
    open: "Abrir asistente de compras",
    close: "Cerrar",
    clear: "Limpiar conversación",
    add: "Añadir",
    added: "Añadido",
    view: "Ver producto",
    stock: "en stock",
    outOfStock: "sin stock",
    disclaimer: "La IA puede ayudarte con la tienda, pero los pagos siempre requieren tu confirmación.",
    quick: [
      "Monta un setup para mí",
      "¿Cuáles son las mejores ofertas?",
      "Quiero un teclado",
      "Abre mi carrito",
    ],
  },
  "zh-CN": {
    title: "BROTHER'S 智能助手",
    subtitle: "AI 购物",
    hello: "你好！我可以帮你找商品、比较选项、搭配设备并管理购物车。",
    placeholder: "例如：我想买 GTA V 和一个键盘...",
    send: "发送",
    thinking: "正在处理你的请求...",
    error: "暂时无法回复，请稍后再试。",
    open: "打开购物助手",
    close: "关闭",
    clear: "清空对话",
    add: "添加",
    added: "已添加",
    view: "查看商品",
    stock: "有库存",
    outOfStock: "无库存",
    disclaimer: "AI 可以协助购物，但付款始终需要你的确认。",
    quick: ["帮我搭配一套设备", "有哪些最佳优惠？", "我想要一个键盘", "打开我的购物车"],
  },
  "hi-IN": {
    title: "BROTHER'S सहायक",
    subtitle: "AI खरीदारी",
    hello:
      "नमस्ते! मैं उत्पाद ढूँढ सकता हूँ, विकल्पों की तुलना कर सकता हूँ, आपका सेटअप बना सकता हूँ और कार्ट संभाल सकता हूँ।",
    placeholder: "उदा.: मुझे GTA V और एक कीबोर्ड चाहिए...",
    send: "भेजें",
    thinking: "आपके अनुरोध पर काम हो रहा है...",
    error: "अभी उत्तर नहीं दे सका। कुछ देर बाद फिर कोशिश करें।",
    open: "शॉपिंग सहायक खोलें",
    close: "बंद करें",
    clear: "बातचीत साफ़ करें",
    add: "जोड़ें",
    added: "जोड़ा गया",
    view: "उत्पाद देखें",
    stock: "स्टॉक में",
    outOfStock: "स्टॉक खत्म",
    disclaimer: "AI स्टोर में मदद कर सकता है, लेकिन भुगतान के लिए हमेशा आपकी पुष्टि चाहिए।",
    quick: ["मेरे लिए सेटअप बनाएं", "सबसे अच्छे ऑफ़र कौन से हैं?", "मुझे कीबोर्ड चाहिए", "मेरा कार्ट खोलें"],
  },
  "ar-SA": {
    title: "مساعد BROTHER'S",
    subtitle: "تسوق بالذكاء الاصطناعي",
    hello:
      "مرحبًا! يمكنني العثور على المنتجات ومقارنة الخيارات وتجهيز إعدادك وإدارة سلة التسوق.",
    placeholder: "مثال: أريد GTA V ولوحة مفاتيح...",
    send: "إرسال",
    thinking: "جارٍ تحليل طلبك...",
    error: "تعذر الرد الآن. حاول مرة أخرى بعد قليل.",
    open: "فتح مساعد التسوق",
    close: "إغلاق",
    clear: "مسح المحادثة",
    add: "إضافة",
    added: "تمت الإضافة",
    view: "عرض المنتج",
    stock: "متوفر",
    outOfStock: "غير متوفر",
    disclaimer: "يمكن للذكاء الاصطناعي المساعدة في المتجر، لكن الدفع يتطلب دائمًا تأكيدك.",
    quick: ["جهّز لي إعدادًا", "ما أفضل العروض؟", "أريد لوحة مفاتيح", "افتح سلتي"],
  },
  "fr-FR": {
    title: "Assistant BROTHER'S",
    subtitle: "Shopping avec IA",
    hello:
      "Bonjour ! Je peux trouver des produits, comparer des options, composer votre setup et gérer votre panier.",
    placeholder: "Ex. : je veux GTA V et un clavier...",
    send: "Envoyer",
    thinking: "Analyse de votre demande...",
    error: "Je ne peux pas répondre pour le moment. Réessayez dans quelques instants.",
    open: "Ouvrir l’assistant d’achat",
    close: "Fermer",
    clear: "Effacer la conversation",
    add: "Ajouter",
    added: "Ajouté",
    view: "Voir le produit",
    stock: "en stock",
    outOfStock: "rupture de stock",
    disclaimer: "L’IA peut vous aider dans la boutique, mais tout paiement exige toujours votre confirmation.",
    quick: ["Composez un setup pour moi", "Quelles sont les meilleures offres ?", "Je veux un clavier", "Ouvrir mon panier"],
  },
  "de-DE": {
    title: "BROTHER'S Assistent",
    subtitle: "KI-Shopping",
    hello:
      "Hallo! Ich kann Produkte finden, Optionen vergleichen, dein Setup zusammenstellen und den Warenkorb verwalten.",
    placeholder: "Z. B.: Ich möchte GTA V und eine Tastatur...",
    send: "Senden",
    thinking: "Deine Anfrage wird bearbeitet...",
    error: "Ich kann gerade nicht antworten. Bitte versuche es gleich noch einmal.",
    open: "Shopping-Assistent öffnen",
    close: "Schließen",
    clear: "Unterhaltung löschen",
    add: "Hinzufügen",
    added: "Hinzugefügt",
    view: "Produkt ansehen",
    stock: "auf Lager",
    outOfStock: "nicht auf Lager",
    disclaimer: "Die KI kann im Shop helfen, aber Zahlungen benötigen immer deine Bestätigung.",
    quick: ["Stell mir ein Setup zusammen", "Was sind die besten Angebote?", "Ich möchte eine Tastatur", "Meinen Warenkorb öffnen"],
  },
};

function localCopy(language) {
  return COPY[language] || COPY["pt-BR"];
}

function aiErrorText(code, language) {
  const isPt = language === "pt-BR";
  const messages = {
    AI_ASSISTANT_NOT_CONFIGURED: isPt
      ? "A IA ainda não está configurada. Verifique a chave GROQ_API_KEY nos Secrets do Supabase."
      : "AI is not configured yet. Check the GROQ_API_KEY secret in Supabase.",
    GROQ_AUTH_FAILED: isPt
      ? "A chave da Groq foi recusada. Gere uma nova chave e atualize GROQ_API_KEY no Supabase."
      : "The Groq key was rejected. Create a new key and update GROQ_API_KEY in Supabase.",
    GROQ_RATE_LIMITED: isPt
      ? "O limite gratuito da IA foi atingido. Tente novamente mais tarde."
      : "The free AI usage limit was reached. Try again later.",
    GROQ_REQUEST_INVALID: isPt
      ? "A Groq recusou a solicitação da IA. A função precisa ser atualizada."
      : "Groq rejected the AI request. The function needs to be updated.",
    RATE_LIMITED: isPt
      ? "Muitas mensagens foram enviadas em pouco tempo. Aguarde alguns minutos."
      : "Too many messages were sent in a short time. Wait a few minutes.",
    CATALOG_UNAVAILABLE: isPt
      ? "Não consegui consultar os produtos da loja agora."
      : "I couldn't load the store products right now.",
    ORIGIN_NOT_ALLOWED: isPt
      ? "Este endereço do site ainda não está autorizado a usar a IA."
      : "This site address is not authorized to use the AI yet.",
  };

  return messages[code] || localCopy(language).error;
}

async function extractFunctionError(error, data, language) {
  let code = String(data?.error || "").trim();

  if (!code && error?.context) {
    try {
      const response = error.context;
      const payload =
        typeof response.clone === "function"
          ? await response.clone().json()
          : await response.json();
      code = String(payload?.error || "").trim();
    } catch {
      // Mantém a mensagem genérica quando a resposta não contém JSON.
    }
  }

  return aiErrorText(code, language);
}

function safeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && ["user", "assistant"].includes(item.role))
    .map((item) => ({
      role: item.role,
      content: String(item.content || "").slice(0, 3000),
    }))
    .filter((item) => item.content.trim())
    .slice(-12);
}


function normalizeAssistantText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function productAvailable(product) {
  const category = normalizeAssistantText(product?.category);
  const deliveryType = normalizeAssistantText(product?.delivery_type);
  const digital = deliveryType === "digital" || category === "jogos";
  const stock = Math.max(0, Number(product?.stock_quantity ?? product?.stock ?? 0) || 0);
  return digital || stock > 0;
}

function productSearchScore(product, query) {
  const q = normalizeAssistantText(query);
  if (!q) return 0;

  const name = normalizeAssistantText(product?.name);
  const category = normalizeAssistantText(product?.category);
  const description = normalizeAssistantText(product?.description);

  let score = 0;
  if (name === q) score += 100;
  if (name.includes(q)) score += 60;
  if (q.includes(name) && name.length > 3) score += 45;
  if (category.includes(q)) score += 25;
  if (description.includes(q)) score += 10;

  for (const word of q.split(/\s+/).filter((word) => word.length > 2)) {
    if (name.includes(word)) score += 12;
    if (category.includes(word)) score += 5;
    if (description.includes(word)) score += 2;
  }

  return score;
}

function buildClientFallback({
  message,
  language,
  products,
  onAddToCart,
  onOpenCart,
  onOpenOffers,
}) {
  const text = normalizeAssistantText(message);
  const en = language === "en-US";
  const reply = (pt, english) => (en ? english : pt);

  if (text.includes("carrinho") || text.includes("cart")) {
    onOpenCart?.();
    return {
      content: reply("Abrindo seu carrinho.", "Opening your cart."),
      products: [],
    };
  }

  if (
    text.includes("oferta") ||
    text.includes("promoc") ||
    text.includes("deal")
  ) {
    onOpenOffers?.();
    return {
      content: reply(
        "Vou abrir as ofertas disponíveis.",
        "I'll open the available deals."
      ),
      products: [],
    };
  }

  const availableProducts = (products || []).filter(productAvailable);

  const gtaIntent =
    text.includes("gta v") ||
    text.includes("gta 5") ||
    text.includes("grand theft auto v") ||
    text.includes("grand theft auto 5");

  const keyboardIntent =
    text.includes("teclado") ||
    text.includes("keyboard");

  const setupIntent =
    text.includes("setup") ||
    text.includes("monte") ||
    text.includes("monta") ||
    text.includes("pc gamer");

  if (gtaIntent && keyboardIntent) {
    const gta = availableProducts
      .map((product) => ({
        product,
        score: Math.max(
          productSearchScore(product, "gta v"),
          productSearchScore(product, "gta 5"),
          productSearchScore(product, "grand theft auto v")
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const keyboards = availableProducts
      .map((product) => ({
        product,
        score: Math.max(
          productSearchScore(product, "teclado"),
          productSearchScore(product, "keyboard")
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.product);

    if (gta.length === 1) {
      onAddToCart?.(gta[0].product, 1);
    }

    return {
      content: reply(
        gta.length === 1
          ? "Encontrei o GTA V e adicionei ao carrinho. Também encontrei opções de teclado; escolha uma abaixo."
          : "Encontrei opções relacionadas ao GTA V e teclados. Veja abaixo.",
        gta.length === 1
          ? "I found GTA V and added it to your cart. I also found keyboard options; choose one below."
          : "I found options related to GTA V and keyboards. Check them below."
      ),
      products: keyboards.length
        ? keyboards
        : gta.slice(0, 8).map((item) => item.product),
    };
  }

  if (setupIntent) {
    const budgetMatch = String(message).match(
      /(?:r\$\s*)?(\d{2,6}(?:[.,]\d{1,2})?)/
    );
    const budget = budgetMatch
      ? Number(budgetMatch[1].replace(".", "").replace(",", "."))
      : null;

    const setupProducts = availableProducts
      .filter((product) =>
        budget && Number.isFinite(budget)
          ? Number(product?.price || 0) <= budget
          : true
      )
      .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0))
      .slice(0, 8);

    return {
      content: budget
        ? reply(
            `Separei opções reais da loja dentro de aproximadamente R$ ${budget
              .toFixed(2)
              .replace(".", ",")}.`,
            `I found real store options within roughly R$ ${budget.toFixed(2)}.`
          )
        : reply(
            "Separei algumas opções reais da loja para começar seu setup. Se você me disser o orçamento, consigo filtrar melhor.",
            "I found some real store options to start your setup. Tell me your budget and I can narrow them down."
          ),
      products: setupProducts,
    };
  }

  let query = "";
  if (gtaIntent) query = "gta v";
  else if (keyboardIntent) query = "teclado";
  else {
    query = String(message)
      .replace(
        /\b(quero|comprar|procuro|mostre|mostrar|me|um|uma|o|a|de|para|por favor|eu|want|buy|show|please)\b/gi,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  const matches = availableProducts
    .map((product) => ({
      product,
      score: productSearchScore(product, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.product);

  if (matches.length === 1) {
    const purchaseIntent =
      text.includes("quero") ||
      text.includes("comprar") ||
      text.includes("adicione") ||
      text.includes("add") ||
      text.includes("buy");

    if (purchaseIntent) {
      onAddToCart?.(matches[0], 1);
      return {
        content: reply(
          `${matches[0]?.name || "Produto"} foi adicionado ao carrinho.`,
          `${matches[0]?.name || "Product"} was added to your cart.`
        ),
        products: [matches[0]],
      };
    }
  }

  if (matches.length) {
    return {
      content: reply(
        "Encontrei estas opções reais no catálogo da loja.",
        "I found these real options in the store catalog."
      ),
      products: matches,
    };
  }

  return {
    content: reply(
      "Não encontrei um produto claro para esse pedido. Tente informar o nome do produto, categoria ou orçamento.",
      "I couldn't find a clear product for that request. Try the product name, category, or budget."
    ),
    products: [],
  };
}

export default function AIShoppingAssistant({
  language = "pt-BR",
  page = "home",
  products = [],
  cart = [],
  formatPrice,
  onAddToCart,
  onRemoveFromCart,
  onSetCartQuantity,
  onOpenProducts,
  onOpenProduct,
  onOpenCart,
  onOpenCheckout,
  onOpenOffers,
}) {
  const copy = localCopy(language);
  const isRTL = language === "ar-SA";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: "welcome", role: "assistant", content: localCopy(language).hello },
  ]);
  const [addedIds, setAddedIds] = useState(() => new Set());
  const listRef = useRef(null);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== "welcome") return current;
      return [{ id: "welcome", role: "assistant", content: copy.hello }];
    });
  }, [copy.hello]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 40);
  }, [open, messages, busy]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products]
  );

  function clearConversation() {
    setMessages([{ id: "welcome", role: "assistant", content: copy.hello }]);
    setAddedIds(new Set());
  }

  function executeAction(action) {
    if (!action || typeof action !== "object") return null;

    if (action.type === "add_to_cart") {
      const product = productMap.get(String(action.product_id));
      if (!product) return null;
      const quantity = Math.max(1, Math.min(10, Number(action.quantity) || 1));
      onAddToCart?.(product, quantity);
      setAddedIds((current) => {
        const next = new Set(current);
        next.add(String(product.id));
        return next;
      });
      return null;
    }

    if (action.type === "remove_from_cart") {
      onRemoveFromCart?.(String(action.product_id));
      return null;
    }

    if (action.type === "set_cart_quantity") {
      onSetCartQuantity?.(
        String(action.product_id),
        Math.max(0, Math.min(20, Number(action.quantity) || 0))
      );
      return null;
    }

    if (action.type === "open_category") {
      onOpenProducts?.(String(action.category || "Todos"));
      return null;
    }

    if (action.type === "open_cart") {
      onOpenCart?.();
      return null;
    }

    if (action.type === "open_checkout") {
      onOpenCheckout?.();
      return null;
    }

    if (action.type === "show_offers") {
      onOpenOffers?.();
      return null;
    }

    if (action.type === "open_product") {
      const product = productMap.get(String(action.product_id));
      if (product) onOpenProduct?.(product);
      return null;
    }

    if (action.type === "show_products") {
      const cards = (action.products || [])
        .map((snapshot) => {
          const local = productMap.get(String(snapshot.id));
          return {
            ...snapshot,
            ...(local || {}),
            id: String(snapshot.id),
          };
        })
        .slice(0, 8);

      return cards.length ? cards : null;
    }

    return null;
  }

  async function sendMessage(text = input) {
    const clean = String(text || "").trim();
    if (!clean || busy) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: clean.slice(0, 3000),
    };

    const history = safeMessages([...messages, userMessage]);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const body = {
        message: clean,
        language,
        page,
        history,
        cart: cart.slice(0, 30).map((item) => ({
          id: String(item.id),
          name: String(item.name || ""),
          category: String(item.category || ""),
          quantity: Number(item.quantity || 0),
          price_brl: Number(item.price || 0),
        })),
      };

      const { data, error } = await supabase.functions.invoke(
        "store-ai-assistant",
        { body }
      );

      if (error || !data || data.ok !== true) {
        const readableMessage = await extractFunctionError(
          error,
          data,
          language
        );
        const failure = new Error(readableMessage);
        failure.cause = error || data?.error || "AI_ASSISTANT_FAILED";
        throw failure;
      }

      const productCards = [];
      for (const action of data.actions || []) {
        const cards = executeAction(action);
        if (Array.isArray(cards)) productCards.push(...cards);
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: String(data.message || copy.error),
          products: productCards.slice(0, 8),
        },
      ]);
    } catch (error) {
      console.error("AI assistant:", error);

      const fallback = buildClientFallback({
        message: clean,
        language,
        products,
        onAddToCart,
        onOpenCart,
        onOpenOffers,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: fallback.content,
          products: fallback.products,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div
      className={`ai-shop ${open ? "is-open" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {open && (
        <section className="ai-shop-panel" aria-label={copy.title}>
          <header className="ai-shop-header">
            <div className="ai-shop-avatar" aria-hidden="true">
              <img src={robotIcon} alt="" />
            </div>
            <div className="ai-shop-heading">
              <strong>{copy.title}</strong>
              <small><i /> {copy.subtitle}</small>
            </div>
            <button
              type="button"
              className="ai-shop-clear"
              onClick={clearConversation}
              title={copy.clear}
              aria-label={copy.clear}
            >
              ↺
            </button>
            <button
              type="button"
              className="ai-shop-close"
              onClick={() => setOpen(false)}
              title={copy.close}
              aria-label={copy.close}
            >
              ×
            </button>
          </header>

          <div className="ai-shop-messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-shop-message ${message.role} ${
                  message.error ? "is-error" : ""
                }`}
              >
                <div className="ai-shop-bubble">{message.content}</div>

                {!!message.products?.length && (
                  <div className="ai-shop-products">
                    {message.products.map((product) => {
                      const stock = Math.max(
                        0,
                        Number(product.stock_quantity ?? 0) || 0
                      );
                      const isDigital =
                        product.delivery_type === "digital" ||
                        String(product.category || "").toLowerCase() === "jogos";
                      const available = isDigital || stock > 0;
                      const wasAdded = addedIds.has(String(product.id));

                      return (
                        <article
                          className="ai-shop-product-card"
                          key={String(product.id)}
                        >
                          <button
                            type="button"
                            className="ai-shop-product-image"
                            onClick={() => {
                              const local = productMap.get(String(product.id));
                              if (local) onOpenProduct?.(local);
                            }}
                          >
                            {product.image ? (
                              <img src={product.image} alt={product.name || ""} />
                            ) : (
                              <span>🎮</span>
                            )}
                          </button>
                          <div className="ai-shop-product-copy">
                            <strong>{product.name}</strong>
                            <span>{formatPrice?.(product.price) || product.price}</span>
                            <small>
                              {available
                                ? isDigital
                                  ? "Digital"
                                  : `${stock} ${copy.stock}`
                                : copy.outOfStock}
                            </small>
                          </div>
                          <button
                            type="button"
                            className="ai-shop-product-add"
                            disabled={!available}
                            onClick={() => {
                              const local = productMap.get(String(product.id));
                              if (!local) return;
                              onAddToCart?.(local, 1);
                              setAddedIds((current) => {
                                const next = new Set(current);
                                next.add(String(product.id));
                                return next;
                              });
                            }}
                          >
                            {wasAdded ? `✓ ${copy.added}` : `+ ${copy.add}`}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="ai-shop-message assistant">
                <div className="ai-shop-bubble ai-shop-thinking">
                  <span /><span /><span />
                  <em>{copy.thinking}</em>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="ai-shop-quick">
              {copy.quick.map((item) => (
                <button
                  type="button"
                  key={item}
                  disabled={busy}
                  onClick={() => void sendMessage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <footer className="ai-shop-composer">
            <div className="ai-shop-input-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 3000))}
                onKeyDown={onKeyDown}
                placeholder={copy.placeholder}
                rows={1}
                disabled={busy}
              />
              <button
                type="button"
                className="ai-shop-send"
                disabled={busy || !input.trim()}
                onClick={() => void sendMessage()}
                aria-label={copy.send}
                title={copy.send}
              >
                ➜
              </button>
            </div>
            <small>{copy.disclaimer}</small>
          </footer>
        </section>
      )}

      <button
        type="button"
        className="ai-shop-launcher"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
        title={open ? copy.close : copy.open}
      >
        <img
          className="ai-shop-launcher-image"
          src={robotIcon}
          alt=""
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
