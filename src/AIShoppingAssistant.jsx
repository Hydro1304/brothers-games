import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import robotIcon from "./assets/brothers_assistant_robo.jpg";
import "./ai-assistant.css";

const COPY = {
  "pt-BR": {
    availabilityFound: "Sim — encontrei {count} opção(ões) que combinam com o que você pediu. Separei abaixo para você dar uma olhada.",
    availabilityOne: "Sim, temos! Encontrei este produto no catálogo e deixei ele aqui embaixo para você.",
    availabilityNone: "No momento não encontrei esse produto disponível no catálogo. Posso procurar uma alternativa parecida para você.",
    sectionFound: "Encontrei todos os produtos disponíveis nas seções: {sections}. Escolha os que quiser abaixo.",
    gtaSectionFound: "Encontrei o GTA V e adicionei ao carrinho. Também mostrei todos os produtos das seções: {sections}.",
    sectionNotFound: "Não encontrei produtos cadastrados nas seções: {sections}.",
    gtaNoKeyboard: "Encontrei e adicionei o GTA V, mas não encontrei nenhum teclado no catálogo agora.",
    checkoutCta: "IR PARA O CHECKOUT",
    checkoutHint: "Produto adicionado. Quando quiser, você pode finalizar a compra.",
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
    availabilityFound: "Yes — I found {count} option(s) matching what you asked for. I listed them below for you.",
    availabilityOne: "Yes, we do! I found this product in the catalog and placed it below for you.",
    availabilityNone: "I couldn't find that product available in the catalog right now. I can look for a similar alternative for you.",
    sectionFound: "I found all products currently listed in these sections: {sections}. Choose any option below.",
    gtaSectionFound: "I found GTA V and added it to your cart. I also showed all products from these sections: {sections}.",
    sectionNotFound: "I couldn't find products listed in these sections: {sections}.",
    gtaNoKeyboard: "I found and added GTA V, but I couldn't find any keyboards in the catalog right now.",
    checkoutCta: "GO TO CHECKOUT",
    checkoutHint: "Product added. When you're ready, you can complete your purchase.",
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
    availabilityFound: "Sí — encontré {count} opción(es) que coinciden con lo que pediste. Te las muestro abajo.",
    availabilityOne: "¡Sí, tenemos! Encontré este producto en el catálogo y te lo dejo abajo.",
    availabilityNone: "Ahora mismo no encontré ese producto disponible en el catálogo. Puedo buscar una alternativa parecida.",
    sectionFound: "Encontré todos los productos disponibles en estas secciones: {sections}. Elige los que quieras abajo.",
    gtaSectionFound: "Encontré GTA V y lo añadí al carrito. También mostré todos los productos de estas secciones: {sections}.",
    sectionNotFound: "No encontré productos registrados en estas secciones: {sections}.",
    gtaNoKeyboard: "Encontré y añadí GTA V, pero no encontré ningún teclado en el catálogo ahora.",
    checkoutCta: "IR AL CHECKOUT",
    checkoutHint: "Producto añadido. Cuando quieras, puedes finalizar la compra.",
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
    availabilityFound: "有的——我找到了 {count} 个符合你需求的商品，已经列在下面。",
    availabilityOne: "有的！我在商品目录中找到了这个商品，已经放在下面。",
    availabilityNone: "目前目录中没有找到这个商品。我可以帮你找类似的替代商品。",
    sectionFound: "我找到了这些分类中的所有商品：{sections}。请在下面选择你想要的商品。",
    gtaSectionFound: "我找到了 GTA V 并已加入购物车。同时显示了这些分类中的所有商品：{sections}。",
    sectionNotFound: "这些分类中暂时没有找到商品：{sections}。",
    gtaNoKeyboard: "我找到了 GTA V 并已加入购物车，但当前目录中没有找到键盘。",
    checkoutCta: "前往结账",
    checkoutHint: "商品已加入购物车。准备好后即可完成购买。",
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
    availabilityFound: "हाँ — मुझे {count} मिलते-जुलते विकल्प मिले हैं। मैंने उन्हें नीचे दिखाया है।",
    availabilityOne: "हाँ, हमारे पास है! मुझे यह उत्पाद कैटलॉग में मिला और नीचे दिखाया है।",
    availabilityNone: "अभी यह उत्पाद कैटलॉग में उपलब्ध नहीं मिला। मैं कोई मिलता-जुलता विकल्प ढूँढ सकता हूँ।",
    sectionFound: "मुझे इन सेक्शन के सभी उपलब्ध उत्पाद मिले: {sections}। नीचे से अपनी पसंद चुनें।",
    gtaSectionFound: "मुझे GTA V मिला और मैंने उसे कार्ट में जोड़ दिया। साथ ही इन सेक्शन के सभी उत्पाद दिखाए: {sections}।",
    sectionNotFound: "इन सेक्शन में कोई उत्पाद नहीं मिला: {sections}।",
    gtaNoKeyboard: "मुझे GTA V मिला और मैंने उसे कार्ट में जोड़ दिया, लेकिन अभी कैटलॉग में कोई कीबोर्ड नहीं मिला।",
    checkoutCta: "चेकआउट पर जाएँ",
    checkoutHint: "उत्पाद कार्ट में जोड़ दिया गया है। तैयार होने पर खरीदारी पूरी करें।",
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
    availabilityFound: "نعم — وجدت {count} خيارًا مطابقًا لطلبك. عرضتها لك أدناه.",
    availabilityOne: "نعم، متوفر! وجدت هذا المنتج في الكتالوج وعرضته أدناه.",
    availabilityNone: "لم أجد هذا المنتج متاحًا في الكتالوج حاليًا. يمكنني البحث عن بديل مشابه.",
    sectionFound: "وجدت جميع المنتجات الموجودة في هذه الأقسام: {sections}. اختر ما تريده أدناه.",
    gtaSectionFound: "وجدت GTA V وأضفته إلى السلة. كما عرضت جميع المنتجات في هذه الأقسام: {sections}.",
    sectionNotFound: "لم أجد منتجات مسجلة في هذه الأقسام: {sections}.",
    gtaNoKeyboard: "عثرت على GTA V وأضفته إلى السلة، لكنني لم أجد أي لوحة مفاتيح في الكتالوج الآن.",
    checkoutCta: "الانتقال إلى الدفع",
    checkoutHint: "تمت إضافة المنتج. عندما تكون جاهزًا يمكنك إكمال الشراء.",
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
    availabilityFound: "Oui — j’ai trouvé {count} option(s) correspondant à votre demande. Je les affiche ci-dessous.",
    availabilityOne: "Oui, nous l’avons ! J’ai trouvé ce produit dans le catalogue et je vous le montre ci-dessous.",
    availabilityNone: "Je n’ai pas trouvé ce produit disponible pour le moment. Je peux chercher une alternative similaire.",
    sectionFound: "J’ai trouvé tous les produits disponibles dans ces sections : {sections}. Choisissez ceux que vous voulez ci-dessous.",
    gtaSectionFound: "J’ai trouvé GTA V et je l’ai ajouté au panier. J’ai aussi affiché tous les produits de ces sections : {sections}.",
    sectionNotFound: "Je n’ai trouvé aucun produit dans ces sections : {sections}.",
    gtaNoKeyboard: "J’ai trouvé GTA V et je l’ai ajouté au panier, mais je n’ai trouvé aucun clavier dans le catalogue pour le moment.",
    checkoutCta: "PASSER AU PAIEMENT",
    checkoutHint: "Produit ajouté. Lorsque vous êtes prêt, vous pouvez finaliser l’achat.",
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
    availabilityFound: "Ja — ich habe {count} passende Option(en) gefunden. Ich zeige sie dir unten.",
    availabilityOne: "Ja, haben wir! Ich habe das Produkt im Katalog gefunden und zeige es dir unten.",
    availabilityNone: "Dieses Produkt ist aktuell nicht im Katalog verfügbar. Ich kann nach einer ähnlichen Alternative suchen.",
    sectionFound: "Ich habe alle Produkte in diesen Bereichen gefunden: {sections}. Wähle unten die gewünschten Produkte aus.",
    gtaSectionFound: "Ich habe GTA V gefunden und zum Warenkorb hinzugefügt. Außerdem zeige ich alle Produkte aus diesen Bereichen: {sections}.",
    sectionNotFound: "Ich habe in diesen Bereichen keine Produkte gefunden: {sections}.",
    gtaNoKeyboard: "Ich habe GTA V gefunden und zum Warenkorb hinzugefügt, aber derzeit keine Tastatur im Katalog gefunden.",
    checkoutCta: "ZUR KASSE",
    checkoutHint: "Produkt hinzugefügt. Wenn du bereit bist, kannst du den Kauf abschließen.",
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



const FALLBACK_TEXT = {
  "pt-BR": {
    cart: "Abrindo seu carrinho.",
    offers: "Vou abrir as ofertas disponíveis.",
    gtaKeyboardAdded:
      "Encontrei o GTA V e adicionei ao carrinho. Também encontrei opções de teclado; escolha uma abaixo.",
    gtaKeyboardFound:
      "Encontrei opções relacionadas ao GTA V e teclados. Veja abaixo.",
    setupBudget:
      "Separei opções reais da loja dentro de aproximadamente {budget}.",
    setup:
      "Separei algumas opções reais da loja para começar seu setup. Se você me disser o orçamento, consigo filtrar melhor.",
    added: "{product} foi adicionado ao carrinho.",
    found: "Encontrei estas opções reais no catálogo da loja.",
    notFound:
      "Não encontrei um produto claro para esse pedido. Tente informar o nome do produto, categoria ou orçamento.",
  },
  "en-US": {
    cart: "Opening your cart.",
    offers: "I'll open the available deals.",
    gtaKeyboardAdded:
      "I found GTA V and added it to your cart. I also found keyboard options; choose one below.",
    gtaKeyboardFound:
      "I found options related to GTA V and keyboards. Check them below.",
    setupBudget:
      "I found real store options within approximately {budget}.",
    setup:
      "I found some real store options to start your setup. Tell me your budget and I can narrow them down.",
    added: "{product} was added to your cart.",
    found: "I found these real options in the store catalog.",
    notFound:
      "I couldn't find a clear product for that request. Try the product name, category, or budget.",
  },
  "es-ES": {
    cart: "Abriendo tu carrito.",
    offers: "Voy a abrir las ofertas disponibles.",
    gtaKeyboardAdded:
      "Encontré GTA V y lo añadí al carrito. También encontré opciones de teclado; elige una abajo.",
    gtaKeyboardFound:
      "Encontré opciones relacionadas con GTA V y teclados. Míralas abajo.",
    setupBudget:
      "Separé opciones reales de la tienda dentro de aproximadamente {budget}.",
    setup:
      "Separé algunas opciones reales de la tienda para empezar tu setup. Si me dices tu presupuesto, puedo filtrar mejor.",
    added: "{product} fue añadido al carrito.",
    found: "Encontré estas opciones reales en el catálogo de la tienda.",
    notFound:
      "No encontré un producto claro para ese pedido. Intenta indicar el nombre del producto, la categoría o tu presupuesto.",
  },
  "zh-CN": {
    cart: "正在打开你的购物车。",
    offers: "正在打开当前可用优惠。",
    gtaKeyboardAdded:
      "我找到了 GTA V 并已加入购物车。我也找到了键盘选项，请在下面选择一个。",
    gtaKeyboardFound:
      "我找到了与 GTA V 和键盘相关的商品，请在下面查看。",
    setupBudget:
      "我筛选了价格约在 {budget} 以内的真实商品。",
    setup:
      "我筛选了一些真实商品来开始搭配你的设备。如果你告诉我预算，我可以进一步筛选。",
    added: "{product} 已加入购物车。",
    found: "我在商店目录中找到了这些真实商品。",
    notFound:
      "没有找到明确匹配的商品。请尝试提供商品名称、类别或预算。",
  },
  "hi-IN": {
    cart: "आपका कार्ट खोला जा रहा है।",
    offers: "उपलब्ध ऑफ़र खोले जा रहे हैं।",
    gtaKeyboardAdded:
      "मुझे GTA V मिल गया और मैंने उसे कार्ट में जोड़ दिया। कीबोर्ड के विकल्प भी मिले हैं; नीचे से एक चुनें।",
    gtaKeyboardFound:
      "मुझे GTA V और कीबोर्ड से जुड़े विकल्प मिले हैं। नीचे देखें।",
    setupBudget:
      "मैंने लगभग {budget} के भीतर स्टोर के वास्तविक विकल्प चुने हैं।",
    setup:
      "मैंने आपके सेटअप के लिए स्टोर के कुछ वास्तविक विकल्प चुने हैं। बजट बताएं तो मैं बेहतर फ़िल्टर कर सकता हूँ।",
    added: "{product} कार्ट में जोड़ दिया गया है।",
    found: "मुझे स्टोर कैटलॉग में ये वास्तविक विकल्प मिले हैं।",
    notFound:
      "इस अनुरोध के लिए कोई स्पष्ट उत्पाद नहीं मिला। उत्पाद का नाम, श्रेणी या बजट बताने की कोशिश करें।",
  },
  "ar-SA": {
    cart: "جارٍ فتح سلة التسوق.",
    offers: "سأفتح العروض المتاحة.",
    gtaKeyboardAdded:
      "عثرت على GTA V وأضفته إلى السلة. كما وجدت خيارات للوحة المفاتيح؛ اختر أحدها أدناه.",
    gtaKeyboardFound:
      "عثرت على خيارات مرتبطة بـ GTA V ولوحات المفاتيح. راجعها أدناه.",
    setupBudget:
      "اخترت منتجات حقيقية من المتجر ضمن حوالي {budget}.",
    setup:
      "اخترت بعض المنتجات الحقيقية من المتجر لبدء تجهيز إعدادك. إذا أخبرتني بالميزانية يمكنني التصفية بشكل أفضل.",
    added: "تمت إضافة {product} إلى السلة.",
    found: "عثرت على هذه الخيارات الحقيقية في كتالوج المتجر.",
    notFound:
      "لم أجد منتجًا واضحًا لهذا الطلب. حاول ذكر اسم المنتج أو الفئة أو الميزانية.",
  },
  "fr-FR": {
    cart: "Ouverture de votre panier.",
    offers: "Je vais ouvrir les offres disponibles.",
    gtaKeyboardAdded:
      "J’ai trouvé GTA V et je l’ai ajouté au panier. J’ai aussi trouvé des claviers ; choisissez-en un ci-dessous.",
    gtaKeyboardFound:
      "J’ai trouvé des options liées à GTA V et aux claviers. Consultez-les ci-dessous.",
    setupBudget:
      "J’ai sélectionné des produits réels de la boutique autour de {budget}.",
    setup:
      "J’ai sélectionné quelques produits réels de la boutique pour commencer votre setup. Donnez-moi votre budget pour affiner la sélection.",
    added: "{product} a été ajouté au panier.",
    found: "J’ai trouvé ces options réelles dans le catalogue de la boutique.",
    notFound:
      "Je n’ai pas trouvé de produit clairement correspondant. Essayez d’indiquer le nom du produit, la catégorie ou votre budget.",
  },
  "de-DE": {
    cart: "Dein Warenkorb wird geöffnet.",
    offers: "Ich öffne die verfügbaren Angebote.",
    gtaKeyboardAdded:
      "Ich habe GTA V gefunden und zum Warenkorb hinzugefügt. Außerdem habe ich Tastaturen gefunden; wähle unten eine aus.",
    gtaKeyboardFound:
      "Ich habe passende Optionen zu GTA V und Tastaturen gefunden. Sieh sie dir unten an.",
    setupBudget:
      "Ich habe echte Shop-Produkte bis ungefähr {budget} ausgewählt.",
    setup:
      "Ich habe einige echte Produkte aus dem Shop für dein Setup ausgewählt. Wenn du mir dein Budget nennst, kann ich genauer filtern.",
    added: "{product} wurde zum Warenkorb hinzugefügt.",
    found: "Ich habe diese echten Optionen im Shop-Katalog gefunden.",
    notFound:
      "Ich konnte kein eindeutiges Produkt für diese Anfrage finden. Nenne bitte Produktname, Kategorie oder Budget.",
  },
};

function fallbackText(language, key, vars = {}) {
  const dictionary = FALLBACK_TEXT[language] || FALLBACK_TEXT["pt-BR"];
  let value = dictionary[key] || FALLBACK_TEXT["pt-BR"][key] || "";

  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }

  return value;
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



const SETUP_WIZARD_COPY = {
  "pt-BR": {
    intro: "Vamos montar seu setup por etapas. Primeiro, escolha um mouse.",
    sections: {
      mouse: {
        title: "1. Mouse",
        found: "Escolha um mouse para o seu setup.",
        empty: "No momento não temos mouses disponíveis, mas teremos novidades em breve.",
      },
      teclado: {
        title: "2. Teclado",
        found: "Agora escolha um teclado para o seu setup.",
        empty: "No momento não temos teclados disponíveis, mas teremos novidades em breve.",
      },
      pc: {
        title: "3. PC",
        found: "Por último, escolha um PC para completar o seu setup.",
        empty: "No momento não temos PCs disponíveis, mas teremos novidades em breve.",
      },
    },
    continue: "CONTINUAR MONTAGEM DE SETUP",
    checkout: "IR PARA O CHECKOUT",
    finished: "Montagem concluída. Você pode revisar o carrinho e seguir para o checkout.",
  },
  "en-US": {
    intro: "Let's build your setup step by step. First, choose a mouse.",
    sections: {
      mouse: {
        title: "1. Mouse",
        found: "Choose a mouse for your setup.",
        empty: "We don't have mice available right now, but more will be available soon.",
      },
      teclado: {
        title: "2. Keyboard",
        found: "Now choose a keyboard for your setup.",
        empty: "We don't have keyboards available right now, but more will be available soon.",
      },
      pc: {
        title: "3. PC",
        found: "Finally, choose a PC to complete your setup.",
        empty: "We don't have PCs available right now, but more will be available soon.",
      },
    },
    continue: "CONTINUE BUILDING SETUP",
    checkout: "GO TO CHECKOUT",
    finished: "Setup complete. You can review your cart and continue to checkout.",
  },
  "es-ES": {
    intro: "Vamos a montar tu setup por etapas. Primero, elige un mouse.",
    sections: {
      mouse: {
        title: "1. Mouse",
        found: "Elige un mouse para tu setup.",
        empty: "Ahora mismo no tenemos mouses disponibles, pero tendremos novedades pronto.",
      },
      teclado: {
        title: "2. Teclado",
        found: "Ahora elige un teclado para tu setup.",
        empty: "Ahora mismo no tenemos teclados disponibles, pero tendremos novedades pronto.",
      },
      pc: {
        title: "3. PC",
        found: "Por último, elige un PC para completar tu setup.",
        empty: "Ahora mismo no tenemos PCs disponibles, pero tendremos novedades pronto.",
      },
    },
    continue: "CONTINUAR MONTAJE DEL SETUP",
    checkout: "IR AL CHECKOUT",
    finished: "Montaje terminado. Puedes revisar el carrito y continuar al checkout.",
  },
  "zh-CN": {
    intro: "我们将分步骤搭配你的设备。首先选择鼠标。",
    sections: {
      mouse: { title: "1. 鼠标", found: "为你的设备选择一个鼠标。", empty: "目前暂无鼠标商品，但很快会有新品上架。" },
      teclado: { title: "2. 键盘", found: "现在为你的设备选择一个键盘。", empty: "目前暂无键盘商品，但很快会有新品上架。" },
      pc: { title: "3. PC", found: "最后选择一台 PC 来完成你的设备搭配。", empty: "目前暂无 PC 商品，但很快会有新品上架。" },
    },
    continue: "继续搭配设备",
    checkout: "前往结账",
    finished: "设备搭配完成。你可以检查购物车并前往结账。",
  },
  "hi-IN": {
    intro: "हम आपका सेटअप चरणों में बनाएँगे। पहले एक माउस चुनें।",
    sections: {
      mouse: { title: "1. माउस", found: "अपने सेटअप के लिए एक माउस चुनें।", empty: "अभी माउस उपलब्ध नहीं हैं, लेकिन जल्द ही नए उत्पाद आएँगे।" },
      teclado: { title: "2. कीबोर्ड", found: "अब अपने सेटअप के लिए एक कीबोर्ड चुनें।", empty: "अभी कीबोर्ड उपलब्ध नहीं हैं, लेकिन जल्द ही नए उत्पाद आएँगे।" },
      pc: { title: "3. PC", found: "अंत में अपना सेटअप पूरा करने के लिए एक PC चुनें।", empty: "अभी PC उपलब्ध नहीं हैं, लेकिन जल्द ही नए उत्पाद आएँगे।" },
    },
    continue: "सेटअप बनाना जारी रखें",
    checkout: "चेकआउट पर जाएँ",
    finished: "सेटअप पूरा हो गया। आप कार्ट की समीक्षा करके चेकआउट पर जा सकते हैं।",
  },
  "ar-SA": {
    intro: "سنقوم ببناء إعدادك على مراحل. أولاً اختر الماوس.",
    sections: {
      mouse: { title: "1. الماوس", found: "اختر ماوسًا لإعدادك.", empty: "لا تتوفر أجهزة ماوس حالياً، لكن ستتوفر منتجات جديدة قريباً." },
      teclado: { title: "2. لوحة المفاتيح", found: "الآن اختر لوحة مفاتيح لإعدادك.", empty: "لا تتوفر لوحات مفاتيح حالياً، لكن ستتوفر منتجات جديدة قريباً." },
      pc: { title: "3. الكمبيوتر", found: "أخيراً اختر جهاز كمبيوتر لإكمال إعدادك.", empty: "لا تتوفر أجهزة كمبيوتر حالياً، لكن ستتوفر منتجات جديدة قريباً." },
    },
    continue: "متابعة بناء الإعداد",
    checkout: "الانتقال إلى الدفع",
    finished: "اكتمل الإعداد. يمكنك مراجعة السلة والانتقال إلى الدفع.",
  },
  "fr-FR": {
    intro: "Nous allons composer votre setup étape par étape. Commencez par choisir une souris.",
    sections: {
      mouse: { title: "1. Souris", found: "Choisissez une souris pour votre setup.", empty: "Aucune souris n’est disponible pour le moment, mais de nouveaux produits arriveront bientôt." },
      teclado: { title: "2. Clavier", found: "Choisissez maintenant un clavier pour votre setup.", empty: "Aucun clavier n’est disponible pour le moment, mais de nouveaux produits arriveront bientôt." },
      pc: { title: "3. PC", found: "Enfin, choisissez un PC pour compléter votre setup.", empty: "Aucun PC n’est disponible pour le moment, mais de nouveaux produits arriveront bientôt." },
    },
    continue: "CONTINUER LE MONTAGE DU SETUP",
    checkout: "PASSER AU PAIEMENT",
    finished: "Setup terminé. Vous pouvez vérifier le panier et passer au paiement.",
  },
  "de-DE": {
    intro: "Wir stellen dein Setup Schritt für Schritt zusammen. Wähle zuerst eine Maus.",
    sections: {
      mouse: { title: "1. Maus", found: "Wähle eine Maus für dein Setup.", empty: "Derzeit sind keine Mäuse verfügbar, aber bald kommen neue Produkte." },
      teclado: { title: "2. Tastatur", found: "Wähle jetzt eine Tastatur für dein Setup.", empty: "Derzeit sind keine Tastaturen verfügbar, aber bald kommen neue Produkte." },
      pc: { title: "3. PC", found: "Wähle zum Schluss einen PC, um dein Setup zu vervollständigen.", empty: "Derzeit sind keine PCs verfügbar, aber bald kommen neue Produkte." },
    },
    continue: "SETUP WEITER ZUSAMMENSTELLEN",
    checkout: "ZUR KASSE",
    finished: "Setup abgeschlossen. Du kannst den Warenkorb prüfen und zur Kasse gehen.",
  },
};

function setupWizardCopy(language) {
  return SETUP_WIZARD_COPY[language] || SETUP_WIZARD_COPY["pt-BR"];
}

const SETUP_WIZARD_SECTIONS = [
  {
    id: "mouse",
    productTerms: ["mouse"],
  },
  {
    id: "teclado",
    productTerms: ["teclad", "keyboard"],
  },
  {
    id: "pc",
    productTerms: [
      "pc",
      "desktop",
      "computador",
      "computer",
      "gabinete completo",
      "prebuilt",
      "pre-built",
    ],
  },
];

function setupProductsForSection(products, sectionId) {
  const section = SETUP_WIZARD_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return [];

  const seen = new Set();

  return (products || []).filter((product) => {
    const haystack = normalizeAssistantText(
      [
        product?.category,
        product?.subcategory,
        product?.name,
        product?.description,
        product?.tags,
      ]
        .filter(Boolean)
        .join(" ")
    );

    const matches = section.productTerms.some((term) => haystack.includes(term));
    if (!matches) return false;

    // No wizard do setup, produto sem estoque NÃO é exibido como opção.
    // Se todos os itens da seção estiverem sem estoque, a mensagem
    // "não temos disponível no momento, mas teremos em breve" aparece.
    if (!productAvailable(product)) return false;

    const id = String(product?.id || "");
    if (!id || seen.has(id)) return false;

    seen.add(id);
    return true;
  });
}

function isSetupWizardRequest(message, copy) {
  const normalized = normalizeAssistantText(message);

  return (
    String(message || "").trim() === copy.quick?.[0] ||
    normalized.includes("monte um setup") ||
    normalized.includes("monta um setup") ||
    normalized.includes("montar um setup") ||
    normalized.includes("build a setup") ||
    normalized.includes("monta un setup") ||
    normalized.includes("composez un setup") ||
    normalized.includes("stell mir ein setup") ||
    normalized.includes("setup बन") ||
    normalized.includes("إعداد") ||
    normalized.includes("搭配")
  );
}


const SHOP_SECTION_DEFINITIONS = [
  {
    id: "mouse",
    requestTerms: ["mouse", "mouses"],
    productTerms: ["mouse"],
  },
  {
    id: "teclado",
    requestTerms: ["teclado", "teclados", "keyboard", "keyboards"],
    productTerms: ["teclad", "keyboard"],
  },
  {
    id: "monitor",
    requestTerms: ["monitor", "monitores", "display", "displays"],
    productTerms: ["monitor", "display"],
  },
];

const SHOP_SECTION_LABELS = {
  "pt-BR": { mouse: "Mouse", teclado: "Teclado", monitor: "Monitor" },
  "en-US": { mouse: "Mouse", teclado: "Keyboard", monitor: "Monitor" },
  "es-ES": { mouse: "Mouse", teclado: "Teclado", monitor: "Monitor" },
  "zh-CN": { mouse: "鼠标", teclado: "键盘", monitor: "显示器" },
  "hi-IN": { mouse: "माउस", teclado: "कीबोर्ड", monitor: "मॉनिटर" },
  "ar-SA": { mouse: "الماوس", teclado: "لوحة المفاتيح", monitor: "الشاشة" },
  "fr-FR": { mouse: "Souris", teclado: "Clavier", monitor: "Écran" },
  "de-DE": { mouse: "Maus", teclado: "Tastatur", monitor: "Monitor" },
};

function requestedShopSections(message) {
  const normalized = normalizeAssistantText(message);

  return SHOP_SECTION_DEFINITIONS.filter((section) =>
    section.requestTerms.some((term) => normalized.includes(term))
  );
}

function productBelongsToShopSection(product, section) {
  const category = normalizeAssistantText(product?.category);
  const name = normalizeAssistantText(product?.name);
  const description = normalizeAssistantText(product?.description);

  // Prioriza a seção/categoria real cadastrada no produto.
  if (section.productTerms.some((term) => category.includes(term))) {
    return true;
  }

  // Compatibilidade caso produtos antigos estejam em "Periféricos"
  // e a identificação exista somente no nome/descrição.
  return section.productTerms.some(
    (term) => name.includes(term) || description.includes(term)
  );
}

function productsFromRequestedSections(products, sections) {
  const seen = new Set();
  const result = [];

  for (const section of sections) {
    for (const product of products || []) {
      if (!productBelongsToShopSection(product, section)) continue;

      const id = String(product?.id || "");
      if (!id || seen.has(id)) continue;

      seen.add(id);
      result.push(product);
    }
  }

  return result;
}

function localizedSectionNames(language, sections) {
  const labels =
    SHOP_SECTION_LABELS[language] || SHOP_SECTION_LABELS["pt-BR"];

  return sections.map((section) => labels[section.id] || section.id).join(", ");
}

function isGtaRequest(message) {
  const text = normalizeAssistantText(message);
  return (
    text.includes("gta v") ||
    text.includes("gta 5") ||
    text.includes("grand theft auto v") ||
    text.includes("grand theft auto 5")
  );
}

function findClearGtaProduct(products) {
  const candidates = (products || [])
    .filter(productAvailable)
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

  if (!candidates.length) return null;

  // Só adiciona automaticamente quando a primeira opção é claramente a melhor.
  if (
    candidates.length === 1 ||
    candidates[0].score >= candidates[1].score + 20
  ) {
    return candidates[0].product;
  }

  return null;
}

function buildDeterministicSectionResponse({
  message,
  language,
  products,
  onAddToCart,
}) {
  const sections = requestedShopSections(message);
  if (!sections.length) return null;

  const sectionProducts = productsFromRequestedSections(products, sections);
  const sectionNames = localizedSectionNames(language, sections);
  const gtaRequested = isGtaRequest(message);

  let gtaAdded = false;

  if (gtaRequested) {
    const gtaProduct = findClearGtaProduct(products);

    if (gtaProduct) {
      onAddToCart?.(gtaProduct, 1);
      gtaAdded = true;
    }
  }

  if (!sectionProducts.length) {
    return {
      content: fallbackText(language, "sectionNotFound", {
        sections: sectionNames,
      }),
      products: [],
      addedProductIds: [],
    };
  }

  return {
    content: fallbackText(
      language,
      gtaAdded ? "gtaSectionFound" : "sectionFound",
      { sections: sectionNames }
    ),
    // Importante: sem slice. Mostra TODOS os produtos cadastrados
    // nas seções solicitadas (Mouse, Teclado e/ou Monitor).
    products: sectionProducts,
    addedProductIds: gtaAdded
      ? [String(findClearGtaProduct(products)?.id || "")].filter(Boolean)
      : [],
  };
}


function availabilityIntent(message) {
  const text = normalizeAssistantText(message);

  return (
    text.includes("tem ") ||
    text.startsWith("tem ") ||
    text.includes("voces tem") ||
    text.includes("vocês têm") ||
    text.includes("possui ") ||
    text.includes("vende ") ||
    text.includes("disponivel") ||
    text.includes("disponível") ||
    text.includes("do you have") ||
    text.includes("have any") ||
    text.includes("hay ") ||
    text.includes("tienen ") ||
    text.includes("avez-vous") ||
    text.includes("habt ihr") ||
    text.includes("有") ||
    text.includes("هل يوجد")
  );
}

function availabilityQuery(message) {
  return String(message || "")
    .replace(/[?!.,;:]/g, " ")
    .replace(
      /\b(voc[eê]s?|tem|t[eê]m|possui|possuem|vende|vendem|dispon[ií]vel|disponiveis|disponíveis|algum|alguma|alguns|algumas|do|you|have|any|is|there|hay|tienen|avez|vous|habt|ihr|bitte|por|favor)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function findProductsForNaturalQuestion(products, query) {
  if (!query) return [];

  const normalizedQuery = normalizeAssistantText(query);

  return (products || [])
    .map((product) => {
      const searchable = normalizeAssistantText(
        [
          product?.name,
          product?.category,
          product?.subcategory,
          product?.description,
          product?.tags,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const words = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length > 2);

      let score = productSearchScore(product, query);

      if (searchable.includes(normalizedQuery)) {
        score += 70;
      }

      for (const word of words) {
        if (searchable.includes(word)) score += 12;
      }

      return { product, score };
    })
    .filter((item) => item.score > 0 && productAvailable(item.product))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => item.product);
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

  if (text.includes("carrinho") || text.includes("cart")) {
    onOpenCart?.();
    return {
      content: fallbackText(language, "cart"),
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
      content: fallbackText(language, "offers"),
      products: [],
    };
  }

  const availableProducts = (products || []).filter(productAvailable);

  const requestedSections = requestedShopSections(message);
  if (requestedSections.length) {
    const sectionProducts = productsFromRequestedSections(
      products,
      requestedSections
    );
    const sectionNames = localizedSectionNames(language, requestedSections);

    return {
      content: sectionProducts.length
        ? fallbackText(language, "sectionFound", { sections: sectionNames })
        : fallbackText(language, "sectionNotFound", { sections: sectionNames }),
      products: sectionProducts,
    };
  }

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

    const keyboards = (products || [])
      .map((product) => {
        const haystack = normalizeAssistantText(
          [
            product?.name,
            product?.category,
            product?.description,
            product?.subcategory,
            product?.tags,
          ]
            .filter(Boolean)
            .join(" ")
        );

        const keywordMatch =
          haystack.includes("teclad") ||
          haystack.includes("keyboard");

        const score = Math.max(
          productSearchScore(product, "teclado"),
          productSearchScore(product, "keyboard"),
          keywordMatch ? 80 : 0
        );

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.product);

    if (gta.length === 1) {
      onAddToCart?.(gta[0].product, 1);
    }

    return {
      content:
        gta.length === 1 && keyboards.length === 0
          ? fallbackText(language, "gtaNoKeyboard")
          : fallbackText(
              language,
              gta.length === 1 ? "gtaKeyboardAdded" : "gtaKeyboardFound"
            ),
      // GTA já foi adicionado. Aqui mostramos somente as opções de teclado.
      products: keyboards,
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
        ? fallbackText(language, "setupBudget", {
            budget: `R$ ${budget.toFixed(2).replace(".", ",")}`,
          })
        : fallbackText(language, "setup"),
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
        content: fallbackText(language, "added", {
          product: matches[0]?.name || "Produto",
        }),
        products: [matches[0]],
      };
    }
  }

  if (matches.length) {
    return {
      content: fallbackText(language, "found"),
      products: matches,
    };
  }

  return {
    content: fallbackText(language, "notFound"),
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
  const [setupWizard, setSetupWizard] = useState({
    active: false,
    step: -1,
  });
  const listRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${language}`,
        role: "assistant",
        content: copy.hello,
      },
    ]);
    setInput("");
    setAddedIds(new Set());
    setSetupWizard({ active: false, step: -1 });
  }, [language, copy.hello]);

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
    setSetupWizard({ active: false, step: -1 });
  }


  function appendSetupSection(step) {
    const wizardCopy = setupWizardCopy(language);
    const section = SETUP_WIZARD_SECTIONS[step];
    if (!section) return;

    const sectionProducts = setupProductsForSection(products, section.id);
    const sectionCopy = wizardCopy.sections[section.id];
    const isLast = step === SETUP_WIZARD_SECTIONS.length - 1;

    setMessages((current) => [
      ...current,
      {
        id: `setup-section-${section.id}-${Date.now()}`,
        role: "assistant",
        content: sectionProducts.length
          ? `${sectionCopy.title} — ${sectionCopy.found}`
          : `${sectionCopy.title} — ${sectionCopy.empty}`,
        products: sectionProducts,
        setupActions: true,
        setupStep: step,
        setupFinal: isLast,
      },
    ]);

    setSetupWizard({
      active: true,
      step,
    });
  }

  function startSetupWizard() {
    const wizardCopy = setupWizardCopy(language);

    setSetupWizard({
      active: true,
      step: 0,
    });

    setMessages((current) => [
      ...current,
      {
        id: `setup-intro-${Date.now()}`,
        role: "assistant",
        content: wizardCopy.intro,
      },
    ]);

    window.setTimeout(() => {
      appendSetupSection(0);
    }, 80);
  }

  function continueSetupWizard(step) {
    const nextStep = Number(step) + 1;

    if (nextStep >= SETUP_WIZARD_SECTIONS.length) {
      const wizardCopy = setupWizardCopy(language);

      setMessages((current) => [
        ...current,
        {
          id: `setup-finished-${Date.now()}`,
          role: "assistant",
          content: wizardCopy.finished,
          setupCheckoutOnly: true,
        },
      ]);

      setSetupWizard({
        active: false,
        step: SETUP_WIZARD_SECTIONS.length - 1,
      });
      return;
    }

    appendSetupSection(nextStep);
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

    // Fluxo guiado de montagem de setup:
    // Mouse -> Teclado -> PC, uma seção por vez.
    if (isSetupWizardRequest(clean, copy)) {
      startSetupWizard();
      return;
    }

    // Perguntas naturais de disponibilidade:
    // "vocês têm GTA V?", "tem mouse gamer?", "vende monitor?"
    // Respondemos de forma humana e exibimos os produtos encontrados.
    if (availabilityIntent(clean)) {
      const query = availabilityQuery(clean);
      const matches = findProductsForNaturalQuestion(
        products,
        query
      );

      setMessages((current) => [
        ...current,
        {
          id: `assistant-availability-${Date.now()}`,
          role: "assistant",
          content:
            matches.length === 0
              ? fallbackText(
                  language,
                  "availabilityNone"
                )
              : matches.length === 1
                ? fallbackText(
                    language,
                    "availabilityOne"
                  )
                : fallbackText(
                    language,
                    "availabilityFound",
                    { count: matches.length }
                  ),
          products: matches,
        },
      ]);

      return;
    }

    // Pedidos de Mouse / Teclado / Monitor são determinísticos:
    // sempre mostramos TODOS os produtos cadastrados nessas seções,
    // sem deixar a IA escolher apenas um item aleatório.
    const deterministicSectionResponse = buildDeterministicSectionResponse({
      message: clean,
      language,
      products,
      onAddToCart,
    });

    if (deterministicSectionResponse) {
      if (deterministicSectionResponse.addedProductIds?.length) {
        setAddedIds((current) => {
          const next = new Set(current);
          for (const id of deterministicSectionResponse.addedProductIds) {
            next.add(String(id));
          }
          return next;
        });
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-sections-${Date.now()}`,
          role: "assistant",
          content: deterministicSectionResponse.content,
          products: deterministicSectionResponse.products,
        },
      ]);

      return;
    }

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

                {message.setupActions && (
                  <div className="ai-shop-setup-actions">
                    {!message.setupFinal && (
                      <button
                        type="button"
                        className="ai-shop-setup-continue"
                        onClick={() => continueSetupWizard(message.setupStep)}
                      >
                        {setupWizardCopy(language).continue}
                      </button>
                    )}

                    <button
                      type="button"
                      className="ai-shop-setup-checkout"
                      onClick={() => onOpenCheckout?.()}
                    >
                      {setupWizardCopy(language).checkout}
                    </button>
                  </div>
                )}

                {message.setupCheckoutOnly && (
                  <div className="ai-shop-setup-actions is-final">
                    <button
                      type="button"
                      className="ai-shop-setup-checkout"
                      onClick={() => onOpenCheckout?.()}
                    >
                      {setupWizardCopy(language).checkout}
                    </button>
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

          {addedIds.size > 0 && !busy && !setupWizard.active && (
            <div className="ai-shop-checkout-cta">
              <div className="ai-shop-checkout-cta-copy">
                <span>✓</span>
                <p>{copy.checkoutHint}</p>
              </div>

              <button
                type="button"
                className="ai-shop-checkout-button"
                onClick={() => onOpenCheckout?.()}
              >
                <span>{copy.checkoutCta}</span>
                <strong>→</strong>
              </button>
            </div>
          )}

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
