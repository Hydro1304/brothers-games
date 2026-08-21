export const LANGUAGES = [
  { code: "pt-BR", short: "PT", label: "Português (Brasil)", dir: "ltr" },
  { code: "en-US", short: "EN", label: "English", dir: "ltr" },
  { code: "es-ES", short: "ES", label: "Español", dir: "ltr" },
  { code: "zh-CN", short: "中文", label: "中文", dir: "ltr" },
  { code: "hi-IN", short: "HI", label: "हिन्दी", dir: "ltr" },
  { code: "ar-SA", short: "AR", label: "العربية", dir: "rtl" },
  { code: "fr-FR", short: "FR", label: "Français", dir: "ltr" },
  { code: "de-DE", short: "DE", label: "Deutsch", dir: "ltr" },

];

export const LANGUAGE_CHANGE_COPY = {
  "pt-BR": {
    eyebrow: "IDIOMA DO SITE",
    title: "Alterar idioma?",
    message: (name) => `Deseja alterar o idioma do site para ${name}?`,
    cancel: "Cancelar",
    confirm: "Alterar idioma",
  },
  "en-US": {
    eyebrow: "SITE LANGUAGE",
    title: "Change language?",
    message: (name) => `Would you like to change the site language to ${name}?`,
    cancel: "Cancel",
    confirm: "Change language",
  },
  "es-ES": {
    eyebrow: "IDIOMA DEL SITIO",
    title: "¿Cambiar idioma?",
    message: (name) => `¿Deseas cambiar el idioma del sitio a ${name}?`,
    cancel: "Cancelar",
    confirm: "Cambiar idioma",
  },
  "zh-CN": {
    eyebrow: "网站语言",
    title: "更改语言？",
    message: (name) => `是否要将网站语言更改为 ${name}？`,
    cancel: "取消",
    confirm: "更改语言",
  },
  "hi-IN": {
    eyebrow: "साइट की भाषा",
    title: "भाषा बदलें?",
    message: (name) => `क्या आप साइट की भाषा ${name} में बदलना चाहते हैं?`,
    cancel: "रद्द करें",
    confirm: "भाषा बदलें",
  },
  "ar-SA": {
    eyebrow: "لغة الموقع",
    title: "تغيير اللغة؟",
    message: (name) => `هل تريد تغيير لغة الموقع إلى ${name}؟`,
    cancel: "إلغاء",
    confirm: "تغيير اللغة",
  },
  "fr-FR": {
    eyebrow: "LANGUE DU SITE",
    title: "Changer de langue ?",
    message: (name) => `Souhaitez-vous changer la langue du site en ${name} ?`,
    cancel: "Annuler",
    confirm: "Changer la langue",
  },
  "de-DE": {
    eyebrow: "WEBSITE-SPRACHE",
    title: "Sprache ändern?",
    message: (name) => `Möchtest du die Sprache der Website auf ${name} ändern?`,
    cancel: "Abbrechen",
    confirm: "Sprache ändern",
  },
};

export function languageChangeCopy(code) {
  return LANGUAGE_CHANGE_COPY[code] || LANGUAGE_CHANGE_COPY["pt-BR"];
}

const rows = [
  ["Início","Home","Inicio","首页","होम","الرئيسية","Accueil","Startseite"],
  ["Jogos","Games","Juegos","游戏","गेम्स","الألعاب","Jeux","Spiele"],
  ["Periféricos","Peripherals","Periféricos","外设","पेरिफेरल्स","الملحقات","Périphériques","Peripheriegeräte"],
  ["Ofertas","Deals","Ofertas","优惠","ऑफ़र","العروض","Offres","Angebote"],
  ["Sobre nós","About us","Sobre nosotros","关于我们","हमारे बारे में","من نحن","À propos","Über uns"],
  ["Contato","Contact","Contacto","联系","संपर्क","اتصل بنا","Contact","Kontakt"],
  ["Conta","Account","Cuenta","账户","खाता","الحساب","Compte","Konto"],
  ["Carrinho","Cart","Carrito","购物车","कार्ट","السلة","Panier","Warenkorb"],
  ["Minha conta","My account","Mi cuenta","我的账户","मेरा खाता","حسابي","Mon compte","Mein Konto"],
  ["Abrir minha conta","Open my account","Abrir mi cuenta","打开我的账户","मेरा खाता खोलें","فتح حسابي","Ouvrir mon compte","Mein Konto öffnen"],
  ["Entrar ou criar conta","Sign in or create account","Iniciar sesión o crear cuenta","登录或创建账户","साइन इन करें या खाता बनाएं","تسجيل الدخول أو إنشاء حساب","Se connecter ou créer un compte","Anmelden oder Konto erstellen"],
  ["Abrir carrinho","Open cart","Abrir carrito","打开购物车","कार्ट खोलें","فتح السلة","Ouvrir le panier","Warenkorb öffnen"],
  ["Buscar jogos e periféricos","Search games and peripherals","Buscar juegos y periféricos","搜索游戏和外设","गेम्स और पेरिफेरल्स खोजें","ابحث عن الألعاب والملحقات","Rechercher jeux et périphériques","Spiele und Peripheriegeräte suchen"],
  ["Navegação principal","Main navigation","Navegación principal","主导航","मुख्य नेविगेशन","التنقل الرئيسي","Navigation principale","Hauptnavigation"],
  ["Ir para o início","Go to home","Ir al inicio","返回首页","होम पर जाएं","الذهاب إلى الرئيسية","Aller à l'accueil","Zur Startseite"],
  ["CHECKOUT","CHECKOUT","CHECKOUT","结账","चेकआउट","الدفع","PAIEMENT","CHECKOUT"],
  ["← Voltar ao carrinho","← Back to cart","← Volver al carrito","← 返回购物车","← कार्ट पर वापस","← العودة إلى السلة","← Retour au panier","← Zurück zum Warenkorb"],
  ["← Voltar ao checkout","← Back to checkout","← Volver al checkout","← 返回结账","← चेकआउट पर वापस","← العودة إلى الدفع","← Retour au paiement","← Zurück zum Checkout"],
  ["Voltar à loja","Back to store","Volver a la tienda","返回商店","स्टोर पर वापस","العودة إلى المتجر","Retour à la boutique","Zurück zum Shop"],
  ["CLARO","LIGHT","CLARO","浅色","लाइट","فاتح","CLAIR","HELL"],
  ["ESCURO","DARK","OSCURO","深色","डार्क","داكن","SOMBRE","DUNKEL"],
  ["Ativar modo claro","Enable light mode","Activar modo claro","启用浅色模式","लाइट मोड चालू करें","تفعيل الوضع الفاتح","Activer le mode clair","Hellen Modus aktivieren"],
  ["Ativar modo escuro","Enable dark mode","Activar modo oscuro","启用深色模式","डार्क मोड चालू करें","تفعيل الوضع الداكن","Activer le mode sombre","Dunklen Modus aktivieren"],

  ["Carregando produtos...","Loading products...","Cargando productos...","正在加载商品...","उत्पाद लोड हो रहे हैं...","جارٍ تحميل المنتجات...","Chargement des produits...","Produkte werden geladen..."],
  ["Buscando o catálogo no Supabase.","Fetching the catalog from Supabase.","Buscando el catálogo en Supabase.","正在从 Supabase 获取目录。","Supabase से कैटलॉग लाया जा रहा है।","جارٍ جلب الكتالوج من Supabase.","Récupération du catalogue depuis Supabase.","Katalog wird aus Supabase geladen."],
  ["Não foi possível carregar a loja","Could not load the store","No se pudo cargar la tienda","无法加载商店","स्टोर लोड नहीं हो सका","تعذر تحميل المتجر","Impossible de charger la boutique","Shop konnte nicht geladen werden"],
  ["TENTAR NOVAMENTE","TRY AGAIN","INTENTAR DE NUEVO","重试","फिर कोशिश करें","حاول مجددًا","RÉESSAYER","ERNEUT VERSUCHEN"],
  ["SEU JOGO. SEU SETUP. SEU PRÓXIMO NÍVEL.","YOUR GAME. YOUR SETUP. YOUR NEXT LEVEL.","TU JUEGO. TU SETUP. TU PRÓXIMO NIVEL.","你的游戏。你的装备。你的下一个等级。","आपका गेम। आपका सेटअप। आपका अगला स्तर।","لعبتك. تجهيزك. مستواك التالي.","VOTRE JEU. VOTRE SETUP. VOTRE PROCHAIN NIVEAU.","DEIN SPIEL. DEIN SETUP. DEIN NÄCHSTES LEVEL."],
  ["COMEÇA AQUI.","STARTS HERE.","EMPIEZA AQUÍ.","从这里开始。","यहीं से शुरू होता है।","يبدأ من هنا.","ÇA COMMENCE ICI.","BEGINNT HIER."],
  ["COMPRAR AGORA","SHOP NOW","COMPRAR AHORA","立即购买","अभी खरीदें","اشترِ الآن","ACHETER MAINTENANT","JETZT KAUFEN"],
  ["VER OFERTAS","VIEW DEALS","VER OFERTAS","查看优惠","ऑफ़र देखें","عرض العروض","VOIR LES OFFRES","ANGEBOTE ANSEHEN"],
  ["Frete grátis","Free shipping","Envío gratis","免运费","मुफ़्त शिपिंग","شحن مجاني","Livraison gratuite","Kostenloser Versand"],
  ["Nas compras acima de R$ 299","On orders over R$ 299","En compras superiores a R$ 299","订单满 R$ 299","R$ 299 से अधिक की खरीद पर","للطلبات فوق R$ 299","Pour les achats de plus de R$ 299","Bei Bestellungen über R$ 299"],
  ["Jogos digitais","Digital games","Juegos digitales","数字游戏","डिजिटल गेम्स","ألعاب رقمية","Jeux numériques","Digitale Spiele"],
  ["Entrega por e-mail","Delivery by email","Entrega por correo electrónico","通过电子邮件交付","ईमेल द्वारा डिलीवरी","التسليم عبر البريد الإلكتروني","Livraison par e-mail","Lieferung per E-Mail"],
  ["Sua conta","Your account","Tu cuenta","你的账户","आपका खाता","حسابك","Votre compte","Dein Konto"],
  ["Autenticação com Supabase","Authentication with Supabase","Autenticación con Supabase","使用 Supabase 身份验证","Supabase प्रमाणीकरण","المصادقة عبر Supabase","Authentification avec Supabase","Authentifizierung mit Supabase"],
  ["MONTE SEU SETUP","BUILD YOUR SETUP","ARMA TU SETUP","打造你的装备","अपना सेटअप बनाएं","جهّز إعدادك","CRÉEZ VOTRE SETUP","BAUE DEIN SETUP"],
  ["Categorias","Categories","Categorías","分类","श्रेणियाँ","الفئات","Catégories","Kategorien"],
  ["Encontre tudo o que precisa para jogar, competir e evoluir.","Find everything you need to play, compete and improve.","Encuentra todo lo que necesitas para jugar, competir y mejorar.","找到游戏、竞技和提升所需的一切。","खेलने, प्रतिस्पर्धा करने और बेहतर बनने के लिए सब कुछ पाएं।","اعثر على كل ما تحتاجه للعب والمنافسة والتطور.","Trouvez tout ce qu'il vous faut pour jouer, concourir et progresser.","Finde alles, was du zum Spielen, Wettkämpfen und Verbessern brauchst."],
  ["VER TODOS OS PRODUTOS","VIEW ALL PRODUCTS","VER TODOS LOS PRODUCTOS","查看全部商品","सभी उत्पाद देखें","عرض جميع المنتجات","VOIR TOUS LES PRODUITS","ALLE PRODUKTE ANSEHEN"],
  ["Explorar categoria","Explore category","Explorar categoría","浏览分类","श्रेणी देखें","استعراض الفئة","Explorer la catégorie","Kategorie entdecken"],
  ["PREÇOS ESPECIAIS POR TEMPO LIMITADO","SPECIAL PRICES FOR A LIMITED TIME","PRECIOS ESPECIALES POR TIEMPO LIMITADO","限时特价","सीमित समय के लिए विशेष कीमतें","أسعار خاصة لفترة محدودة","PRIX SPÉCIAUX POUR UNE DURÉE LIMITÉE","SONDERPREISE FÜR KURZE ZEIT"],
  ["ENCONTRE O PRODUTO IDEAL PARA O SEU SETUP","FIND THE IDEAL PRODUCT FOR YOUR SETUP","ENCUENTRA EL PRODUCTO IDEAL PARA TU SETUP","找到适合你装备的理想商品","अपने सेटअप के लिए सही उत्पाद खोजें","اعثر على المنتج المثالي لتجهيزك","TROUVEZ LE PRODUIT IDÉAL POUR VOTRE SETUP","FINDE DAS IDEALE PRODUKT FÜR DEIN SETUP"],
  ["Ofertas da semana","Deals of the week","Ofertas de la semana","本周优惠","इस सप्ताह के ऑफ़र","عروض الأسبوع","Offres de la semaine","Angebote der Woche"],
  ["Produtos em destaque","Featured products","Productos destacados","精选商品","फ़ीचर्ड उत्पाद","منتجات مميزة","Produits en vedette","Empfohlene Produkte"],
  ["Jogos e periféricos selecionados para você.","Games and peripherals selected for you.","Juegos y periféricos seleccionados para ti.","为你精选的游戏和外设。","आपके लिए चुने गए गेम्स और पेरिफेरल्स।","ألعاب وملحقات مختارة لك.","Jeux et périphériques sélectionnés pour vous.","Ausgewählte Spiele und Peripheriegeräte für dich."],
  ["OFERTAS","DEALS","OFERTAS","优惠","ऑफ़र","العروض","OFFRES","ANGEBOTE"],
  ["VER PRODUTOS","VIEW PRODUCTS","VER PRODUCTOS","查看商品","उत्पाद देखें","عرض المنتجات","VOIR LES PRODUITS","PRODUKTE ANSEHEN"],
  ["Produtos em oferta","Products on sale","Productos en oferta","促销商品","ऑफ़र वाले उत्पाद","منتجات مخفضة","Produits en promotion","Produkte im Angebot"],
  ["Todos os produtos","All products","Todos los productos","全部商品","सभी उत्पाद","جميع المنتجات","Tous les produits","Alle Produkte"],
  ["Filtros","Filters","Filtros","筛选","फ़िल्टर","الفلاتر","Filtres","Filter"],
  ["Limpar","Clear","Limpiar","清除","साफ़ करें","مسح","Effacer","Zurücksetzen"],
  ["Categoria","Category","Categoría","分类","श्रेणी","الفئة","Catégorie","Kategorie"],
  ["Faixa de preço","Price range","Rango de precio","价格区间","मूल्य सीमा","نطاق السعر","Fourchette de prix","Preisspanne"],
  ["De","From","Desde","从","से","من","De","Von"],
  ["Até","To","Hasta","到","तक","إلى","À","Bis"],
  ["Ordenar por","Sort by","Ordenar por","排序方式","क्रमबद्ध करें","ترتيب حسب","Trier par","Sortieren nach"],
  ["Relevância","Relevance","Relevancia","相关性","प्रासंगिकता","الصلة","Pertinence","Relevanz"],
  ["Menor preço","Lowest price","Menor precio","最低价","सबसे कम कीमत","الأقل سعرًا","Prix le plus bas","Niedrigster Preis"],
  ["Maior preço","Highest price","Mayor precio","最高价","सबसे अधिक कीमत","الأعلى سعرًا","Prix le plus élevé","Höchster Preis"],
  ["Nome","Name","Nombre","名称","नाम","الاسم","Nom","Name"],
  ["Nenhum produto encontrado","No products found","No se encontraron productos","未找到商品","कोई उत्पाद नहीं मिला","لم يتم العثور على منتجات","Aucun produit trouvé","Keine Produkte gefunden"],
  ["Tente mudar os filtros ou procurar por outro produto.","Try changing the filters or searching for another product.","Intenta cambiar los filtros o buscar otro producto.","尝试更改筛选条件或搜索其他商品。","फ़िल्टर बदलें या कोई दूसरा उत्पाद खोजें।","جرّب تغيير الفلاتر أو البحث عن منتج آخر.","Essayez de modifier les filtres ou de rechercher un autre produit.","Ändere die Filter oder suche nach einem anderen Produkt."],
  ["← Voltar para produtos","← Back to products","← Volver a productos","← 返回商品","← उत्पादों पर वापस","← العودة إلى المنتجات","← Retour aux produits","← Zurück zu den Produkten"],
  ["Conta integrada","Integrated account","Cuenta integrada","集成账户","एकीकृत खाता","حساب متكامل","Compte intégré","Integriertes Konto"],
  ["Meus dados","My details","Mis datos","我的资料","मेरी जानकारी","بياناتي","Mes informations","Meine Daten"],
  ["Pagamento","Payment","Pago","支付","भुगतान","الدفع","Paiement","Zahlung"],
  ["🛒 ADICIONAR AO CARRINHO","🛒 ADD TO CART","🛒 AÑADIR AL CARRITO","🛒 加入购物车","🛒 कार्ट में जोड़ें","🛒 أضف إلى السلة","🛒 AJOUTER AU PANIER","🛒 IN DEN WARENKORB"],
  ["AVALIAÇÕES DOS CLIENTES","CUSTOMER REVIEWS","RESEÑAS DE CLIENTES","客户评价","ग्राहक समीक्षाएँ","تقييمات العملاء","AVIS CLIENTS","KUNDENBEWERTUNGEN"],
  ["Avaliações do produto","Product reviews","Reseñas del producto","商品评价","उत्पाद समीक्षाएँ","تقييمات المنتج","Avis sur le produit","Produktbewertungen"],
  ["Carregando avaliações...","Loading reviews...","Cargando reseñas...","正在加载评价...","समीक्षाएँ लोड हो रही हैं...","جارٍ تحميل التقييمات...","Chargement des avis...","Bewertungen werden geladen..."],
  ["Ainda não há avaliações publicadas.","There are no published reviews yet.","Aún no hay reseñas publicadas.","暂无已发布评价。","अभी कोई प्रकाशित समीक्षा नहीं है।","لا توجد تقييمات منشورة بعد.","Aucun avis publié pour le moment.","Noch keine veröffentlichten Bewertungen."],
  ["VOCÊ TAMBÉM PODE GOSTAR","YOU MAY ALSO LIKE","TAMBIÉN TE PUEDE GUSTAR","你可能也喜欢","आपको यह भी पसंद आ सकता है","قد يعجبك أيضًا","VOUS AIMEREZ AUSSI","DAS KÖNNTE DIR AUCH GEFALLEN"],
  ["Produtos relacionados","Related products","Productos relacionados","相关商品","संबंधित उत्पाद","منتجات ذات صلة","Produits associés","Ähnliche Produkte"],

  ["← Continuar comprando","← Continue shopping","← Seguir comprando","← 继续购物","← खरीदारी जारी रखें","← متابعة التسوق","← Continuer les achats","← Weiter einkaufen"],
  ["SEU PEDIDO","YOUR ORDER","TU PEDIDO","你的订单","आपका ऑर्डर","طلبك","VOTRE COMMANDE","DEINE BESTELLUNG"],
  ["CARRINHO","CART","CARRITO","购物车","कार्ट","السلة","PANIER","WARENKORB"],
  ["Seu carrinho está vazio","Your cart is empty","Tu carrito está vacío","你的购物车是空的","आपका कार्ट खाली है","سلتك فارغة","Votre panier est vide","Dein Warenkorb ist leer"],
  ["Adicione produtos para começar seu pedido.","Add products to start your order.","Añade productos para comenzar tu pedido.","添加商品以开始下单。","ऑर्डर शुरू करने के लिए उत्पाद जोड़ें।","أضف منتجات لبدء طلبك.","Ajoutez des produits pour commencer votre commande.","Füge Produkte hinzu, um deine Bestellung zu starten."],
  ["SUBTOTAL","SUBTOTAL","SUBTOTAL","小计","उप-योग","المجموع الفرعي","SOUS-TOTAL","ZWISCHENSUMME"],
  ["FINALIZAR PEDIDO","CHECKOUT","FINALIZAR PEDIDO","去结账","चेकआउट करें","إتمام الطلب","PASSER LA COMMANDE","ZUR KASSE"],
  ["FINALIZAÇÃO","CHECKOUT","FINALIZACIÓN","结账","चेकआउट","إتمام الطلب","FINALISATION","CHECKOUT"],
  ["Confira seus dados e escolha como deseja pagar.","Review your details and choose how you want to pay.","Revisa tus datos y elige cómo deseas pagar.","检查你的信息并选择付款方式。","अपनी जानकारी जांचें और भुगतान का तरीका चुनें।","راجع بياناتك واختر طريقة الدفع.","Vérifiez vos informations et choisissez votre mode de paiement.","Prüfe deine Daten und wähle die Zahlungsart."],
  ["CLIENTE","CUSTOMER","CLIENTE","客户","ग्राहक","العميل","CLIENT","KUNDE"],
  ["Seus dados","Your details","Tus datos","你的信息","आपकी जानकारी","بياناتك","Vos informations","Deine Daten"],
  ["Informações para contato.","Contact information.","Información de contacto.","联系信息。","संपर्क जानकारी।","معلومات الاتصال.","Informations de contact.","Kontaktinformationen."],
  ["Nome completo *","Full name *","Nombre completo *","全名 *","पूरा नाम *","الاسم الكامل *","Nom complet *","Vollständiger Name *"],
  ["E-mail *","Email *","Correo electrónico *","电子邮箱 *","ईमेल *","البريد الإلكتروني *","E-mail *","E-Mail *"],
  ["Telefone *","Phone *","Teléfono *","电话 *","फ़ोन *","الهاتف *","Téléphone *","Telefon *"],
  ["ENTREGA","DELIVERY","ENTREGA","配送","डिलीवरी","التوصيل","LIVRAISON","LIEFERUNG"],
  ["Endereço de entrega","Delivery address","Dirección de entrega","收货地址","डिलीवरी पता","عنوان التوصيل","Adresse de livraison","Lieferadresse"],
  ["CEP *","Postal code *","Código postal *","邮编 *","पिन कोड *","الرمز البريدي *","Code postal *","Postleitzahl *"],
  ["Buscando...","Searching...","Buscando...","正在查询...","खोजा जा रहा है...","جارٍ البحث...","Recherche...","Suche..."],
  ["Endereço *","Address *","Dirección *","地址 *","पता *","العنوان *","Adresse *","Adresse *"],
  ["Número *","Number *","Número *","门牌号 *","नंबर *","الرقم *","Numéro *","Hausnummer *"],
  ["Complemento","Additional info","Complemento","补充信息","अतिरिक्त जानकारी","تفاصيل إضافية","Complément","Adresszusatz"],
  ["Bairro *","Neighborhood *","Barrio *","街区 *","इलाका *","الحي *","Quartier *","Stadtteil *"],
  ["Cidade *","City *","Ciudad *","城市 *","शहर *","المدينة *","Ville *","Stadt *"],
  ["Estado *","State *","Estado *","州/省 *","राज्य *","الولاية/المنطقة *","État/Région *","Bundesland *"],
  ["Selecione","Select","Seleccionar","选择","चुनें","اختر","Sélectionner","Auswählen"],
  ["FRETE","SHIPPING","ENVÍO","配送","शिपिंग","الشحن","LIVRAISON","VERSAND"],
  ["Escolha a entrega","Choose delivery","Elige la entrega","选择配送方式","डिलीवरी चुनें","اختر التوصيل","Choisissez la livraison","Lieferung wählen"],
  ["FRETE GRÁTIS","FREE SHIPPING","ENVÍO GRATIS","免运费","मुफ़्त शिपिंग","شحن مجاني","LIVRAISON GRATUITE","KOSTENLOSER VERSAND"],
  ["TRANSPORTADORA","CARRIER","TRANSPORTISTA","承运商","कैरियर","شركة الشحن","TRANSPORTEUR","VERSANDDIENST"],
  ["SERVIÇO","SERVICE","SERVICIO","服务","सेवा","الخدمة","SERVICE","SERVICE"],
  ["GRÁTIS","FREE","GRATIS","免费","मुफ़्त","مجاني","GRATUIT","KOSTENLOS"],
  ["Entrega digital","Digital delivery","Entrega digital","数字交付","डिजिटल डिलीवरी","تسليم رقمي","Livraison numérique","Digitale Lieferung"],
  ["SEM FRETE","NO SHIPPING","SIN ENVÍO","无需配送","कोई शिपिंग नहीं","بدون شحن","SANS LIVRAISON","KEIN VERSAND"],
  ["PAGAMENTO","PAYMENT","PAGO","支付","भुगतान","الدفع","PAIEMENT","ZAHLUNG"],
  ["Forma de pagamento","Payment method","Forma de pago","付款方式","भुगतान का तरीका","طريقة الدفع","Mode de paiement","Zahlungsart"],
  ["PIX","PIX","PIX","PIX","PIX","PIX","PIX","PIX"],
  ["QR Code e Pix Copia e Cola","QR Code and PIX copy-and-paste","Código QR y Pix Copia y Pega","二维码和 PIX 复制粘贴","QR कोड और PIX कॉपी-पेस्ट","رمز QR ونسخ ولصق PIX","QR Code et PIX copier-coller","QR-Code und PIX Copy-and-Paste"],
  ["Cartão de crédito","Credit card","Tarjeta de crédito","信用卡","क्रेडिट कार्ड","بطاقة ائتمان","Carte de crédit","Kreditkarte"],
  ["CARTÃO DE CRÉDITO","CREDIT CARD","TARJETA DE CRÉDITO","信用卡","क्रेडिट कार्ड","بطاقة ائتمان","CARTE DE CRÉDIT","KREDITKARTE"],
  ["Carregando formulário do cartão...","Loading card form...","Cargando formulario de tarjeta...","正在加载银行卡表单...","कार्ड फ़ॉर्म लोड हो रहा है...","جارٍ تحميل نموذج البطاقة...","Chargement du formulaire de carte...","Kartenformular wird geladen..."],
  ["RESUMO","SUMMARY","RESUMEN","摘要","सारांश","الملخص","RÉSUMÉ","ZUSAMMENFASSUNG"],
  ["Seu pedido","Your order","Tu pedido","你的订单","आपका ऑर्डर","طلبك","Votre commande","Deine Bestellung"],
  ["Subtotal","Subtotal","Subtotal","小计","उप-योग","المجموع الفرعي","Sous-total","Zwischensumme"],
  ["Frete","Shipping","Envío","配送","शिपिंग","الشحن","Livraison","Versand"],
  ["PIX GERADO","PIX CREATED","PIX GENERADO","PIX 已生成","PIX जनरेट हुआ","تم إنشاء PIX","PIX GÉNÉRÉ","PIX ERSTELLT"],
  ["Pedido","Order","Pedido","订单","ऑर्डर","الطلب","Commande","Bestellung"],
  ["Tempo restante","Time remaining","Tiempo restante","剩余时间","शेष समय","الوقت المتبقي","Temps restant","Verbleibende Zeit"],
  ["COPIAR CÓDIGO PIX","COPY PIX CODE","COPIAR CÓDIGO PIX","复制 PIX 代码","PIX कोड कॉपी करें","نسخ رمز PIX","COPIER LE CODE PIX","PIX-CODE KOPIEREN"],
  ["RESUMO DO PEDIDO","ORDER SUMMARY","RESUMEN DEL PEDIDO","订单摘要","ऑर्डर सारांश","ملخص الطلب","RÉSUMÉ DE LA COMMANDE","BESTELLÜBERSICHT"],
  ["Total","Total","Total","总计","कुल","الإجمالي","Total","Gesamt"],
  ["Status","Status","Estado","状态","स्थिति","الحالة","Statut","Status"],
  ["PAGAMENTO APROVADO","PAYMENT APPROVED","PAGO APROBADO","付款已批准","भुगतान स्वीकृत","تمت الموافقة على الدفع","PAIEMENT APPROUVÉ","ZAHLUNG GENEHMIGT"],
  ["Pedido confirmado","Order confirmed","Pedido confirmado","订单已确认","ऑर्डर की पुष्टि हुई","تم تأكيد الطلب","Commande confirmée","Bestellung bestätigt"],
  ["Pago","Paid","Pagado","已付款","भुगतान किया गया","مدفوع","Payé","Bezahlt"],
  ["VOLTAR À LOJA","BACK TO STORE","VOLVER A LA TIENDA","返回商店","स्टोर पर वापस","العودة إلى المتجر","RETOUR À LA BOUTIQUE","ZURÜCK ZUM SHOP"],
  ["VER MEUS PEDIDOS","VIEW MY ORDERS","VER MIS PEDIDOS","查看我的订单","मेरे ऑर्डर देखें","عرض طلباتي","VOIR MES COMMANDES","MEINE BESTELLUNGEN"],

  ["COMPRA VERIFICADA","VERIFIED PURCHASE","COMPRA VERIFICADA","已验证购买","सत्यापित खरीद","عملية شراء موثقة","ACHAT VÉRIFIÉ","VERIFIZIERTER KAUF"],
  ["Avaliar produto","Review product","Valorar producto","评价商品","उत्पाद की समीक्षा करें","تقييم المنتج","Évaluer le produit","Produkt bewerten"],
  ["NOTA DA COMPRA","PURCHASE RATING","VALORACIÓN DE LA COMPRA","购买评分","खरीद रेटिंग","تقييم الشراء","NOTE DE L'ACHAT","KAUFBEWERTUNG"],
  ["SEU COMENTÁRIO","YOUR COMMENT","TU COMENTARIO","你的评论","आपकी टिप्पणी","تعليقك","VOTRE COMMENTAIRE","DEIN KOMMENTAR"],
  ["FOTOS DA COMPRA","PURCHASE PHOTOS","FOTOS DE LA COMPRA","购买照片","खरीद की तस्वीरें","صور الشراء","PHOTOS DE L'ACHAT","KAUFFOTOS"],
  ["ANEXAR FOTO","ATTACH PHOTO","ADJUNTAR FOTO","添加照片","फोटो जोड़ें","إرفاق صورة","JOINDRE UNE PHOTO","FOTO ANHÄNGEN"],
  ["CONFIRMAR CANCELAMENTO","CONFIRM CANCELLATION","CONFIRMAR CANCELACIÓN","确认取消","रद्दीकरण की पुष्टि करें","تأكيد الإلغاء","CONFIRMER L'ANNULATION","STORNIERUNG BESTÄTIGEN"],
  ["Cancelar este pedido PIX?","Cancel this PIX order?","¿Cancelar este pedido PIX?","取消此 PIX 订单？","इस PIX ऑर्डर को रद्द करें?","إلغاء طلب PIX هذا؟","Annuler cette commande PIX ?","Diese PIX-Bestellung stornieren?"],
  ["Calculando seu frete...","Calculating shipping...","Calculando tu envío...","正在计算运费...","शिपिंग की गणना हो रही है...","جارٍ حساب الشحن...","Calcul de la livraison...","Versand wird berechnet..."],
  ["Consultando transportadoras em tempo real","Checking carriers in real time","Consultando transportistas en tiempo real","正在实时查询承运商","रियल टाइम में कैरियर देखे जा रहे हैं","جارٍ التحقق من شركات الشحن لحظيًا","Consultation des transporteurs en temps réel","Versanddienste werden in Echtzeit geprüft"],

  ["LOJA","STORE","TIENDA","商店","स्टोर","المتجر","BOUTIQUE","SHOP"],
  ["INSTITUCIONAL","INFORMATION","INSTITUCIONAL","信息","जानकारी","معلومات","INFORMATIONS","INFORMATIONEN"],
  ["Termos de uso","Terms of use","Términos de uso","使用条款","उपयोग की शर्तें","شروط الاستخدام","Conditions d'utilisation","Nutzungsbedingungen"],
  ["Política de privacidade","Privacy policy","Política de privacidad","隐私政策","गोपनीयता नीति","سياسة الخصوصية","Politique de confidentialité","Datenschutzrichtlinie"],
  ["Trocas e devoluções","Exchanges and returns","Cambios y devoluciones","换货与退货","बदलाव और रिटर्न","الاستبدال والإرجاع","Échanges et retours","Umtausch und Rückgabe"],
  ["MINHA CONTA","MY ACCOUNT","MI CUENTA","我的账户","मेरा खाता","حسابي","MON COMPTE","MEIN KONTO"],
  ["Meus pedidos","My orders","Mis pedidos","我的订单","मेरे ऑर्डर","طلباتي","Mes commandes","Meine Bestellungen"],
  ["© 2026 BROTHER'S GAMES. Todos os direitos reservados.","© 2026 BROTHER'S GAMES. All rights reserved.","© 2026 BROTHER'S GAMES. Todos los derechos reservados.","© 2026 BROTHER'S GAMES. 保留所有权利。","© 2026 BROTHER'S GAMES. सर्वाधिकार सुरक्षित।","© 2026 BROTHER'S GAMES. جميع الحقوق محفوظة.","© 2026 BROTHER'S GAMES. Tous droits réservés.","© 2026 BROTHER'S GAMES. Alle Rechte vorbehalten."],
  ["Compra segura · Pagamentos via Mercado Pago","Secure shopping · Payments via Mercado Pago","Compra segura · Pagos mediante Mercado Pago","安全购物 · 通过 Mercado Pago 支付","सुरक्षित खरीदारी · Mercado Pago द्वारा भुगतान","تسوق آمن · الدفع عبر Mercado Pago","Achat sécurisé · Paiements via Mercado Pago","Sicher einkaufen · Zahlungen über Mercado Pago"],

  ["CARREGANDO","LOADING","CARGANDO","加载中","लोड हो रहा है","جارٍ التحميل","CHARGEMENT","LÄDT"],
  ["Verificando sua sessão...","Checking your session...","Verificando tu sesión...","正在检查会话...","आपका सत्र जांचा जा रहा है...","جارٍ التحقق من جلستك...","Vérification de votre session...","Sitzung wird geprüft..."],
  ["E-mail","Email","Correo electrónico","电子邮箱","ईमेल","البريد الإلكتروني","E-mail","E-Mail"],
  ["Senha","Password","Contraseña","密码","पासवर्ड","كلمة المرور","Mot de passe","Passwort"],
  ["Ainda não possui uma conta?","Don't have an account yet?","¿Aún no tienes una cuenta?","还没有账户？","अभी तक खाता नहीं है?","ليس لديك حساب بعد؟","Vous n'avez pas encore de compte ?","Noch kein Konto?"],
  ["Criar conta","Create account","Crear cuenta","创建账户","खाता बनाएं","إنشاء حساب","Créer un compte","Konto erstellen"],
  ["Já possui uma conta?","Already have an account?","¿Ya tienes una cuenta?","已有账户？","पहले से खाता है?","لديك حساب بالفعل؟","Vous avez déjà un compte ?","Bereits ein Konto?"],
  ["Entrar","Sign in","Entrar","登录","साइन इन","تسجيل الدخول","Se connecter","Anmelden"],
  ["🛡️ Painel administrativo","🛡️ Admin panel","🛡️ Panel administrativo","🛡️ 管理面板","🛡️ एडमिन पैनल","🛡️ لوحة الإدارة","🛡️ Panneau d'administration","🛡️ Admin-Bereich"],
  ["📦 Meus pedidos","📦 My orders","📦 Mis pedidos","📦 我的订单","📦 मेरे ऑर्डर","📦 طلباتي","📦 Mes commandes","📦 Meine Bestellungen"],
  ["👤 Meus dados","👤 My details","👤 Mis datos","👤 我的资料","👤 मेरी जानकारी","👤 بياناتي","👤 Mes informations","👤 Meine Daten"],
  ["🖼️ Foto e avatar","🖼️ Photo and avatar","🖼️ Foto y avatar","🖼️ 照片与头像","🖼️ फोटो और अवतार","🖼️ الصورة والصورة الرمزية","🖼️ Photo et avatar","🖼️ Foto und Avatar"],
  ["↪ Sair da conta","↪ Sign out","↪ Cerrar sesión","↪ 退出登录","↪ साइन आउट","↪ تسجيل الخروج","↪ Se déconnecter","↪ Abmelden"],
  ["← Voltar","← Back","← Volver","← 返回","← वापस","← رجوع","← Retour","← Zurück"],
  ["Carregando...","Loading...","Cargando...","加载中...","लोड हो रहा है...","جارٍ التحميل...","Chargement...","Lädt..."],
  ["Nenhum pedido ainda","No orders yet","Aún no hay pedidos","暂无订单","अभी कोई ऑर्डर नहीं","لا توجد طلبات بعد","Aucune commande pour le moment","Noch keine Bestellungen"],
  ["Quando você finalizar uma compra, ela aparecerá aqui.","When you complete a purchase, it will appear here.","Cuando completes una compra, aparecerá aquí.","完成购买后，订单会显示在这里。","खरीद पूरी करने पर वह यहाँ दिखाई देगी।","عند إكمال عملية شراء ستظهر هنا.","Lorsque vous terminerez un achat, il apparaîtra ici.","Wenn du einen Kauf abschließt, erscheint er hier."],
  ["ENTREGA CONFIRMADA","DELIVERY CONFIRMED","ENTREGA CONFIRMADA","已确认送达","डिलीवरी की पुष्टि हुई","تم تأكيد التسليم","LIVRAISON CONFIRMÉE","LIEFERUNG BESTÄTIGT"],
  ["SUPORTE PÓS-ENTREGA","POST-DELIVERY SUPPORT","SOPORTE POST-ENTREGA","售后支持","डिलीवरी के बाद सहायता","دعم ما بعد التسليم","SUPPORT APRÈS LIVRAISON","SUPPORT NACH LIEFERUNG"],
  ["Teve algum problema com o pedido?","Did you have a problem with the order?","¿Tuviste algún problema con el pedido?","订单有问题吗？","ऑर्डर में कोई समस्या हुई?","هل واجهت مشكلة في الطلب؟","Avez-vous rencontré un problème avec la commande ?","Gab es ein Problem mit der Bestellung?"],
  ["Prazo para suporte encerrado","Support period ended","Plazo de soporte finalizado","支持期限已结束","सपोर्ट अवधि समाप्त","انتهت فترة الدعم","Délai de support terminé","Supportfrist abgelaufen"],
  ["Pedido não encontrado","Order not found","Pedido no encontrado","未找到订单","ऑर्डर नहीं मिला","لم يتم العثور على الطلب","Commande introuvable","Bestellung nicht gefunden"],
  ["← Voltar aos pedidos","← Back to orders","← Volver a pedidos","← 返回订单","← ऑर्डर पर वापस","← العودة إلى الطلبات","← Retour aux commandes","← Zurück zu den Bestellungen"],
  ["ACOMPANHAMENTO","TRACKING","SEGUIMIENTO","跟踪","ट्रैकिंग","التتبع","SUIVI","SENDUNGSVERFOLGUNG"],
  ["ANDAMENTO","PROGRESS","PROGRESO","进度","प्रगति","التقدم","AVANCEMENT","FORTSCHRITT"],
  ["ITENS DO PEDIDO","ORDER ITEMS","ARTÍCULOS DEL PEDIDO","订单商品","ऑर्डर आइटम","عناصر الطلب","ARTICLES DE LA COMMANDE","BESTELLARTIKEL"],
  ["SUPORTE DO PEDIDO","ORDER SUPPORT","SOPORTE DEL PEDIDO","订单支持","ऑर्डर सहायता","دعم الطلب","SUPPORT DE COMMANDE","BESTELLSUPPORT"],
  ["PRAZO PARA ABERTURA","OPENING DEADLINE","PLAZO PARA APERTURA","提交期限","खोलने की समय सीमा","المهلة لفتح الطلب","DÉLAI D'OUVERTURE","FRIST ZUR ERÖFFNUNG"],
  ["DESCRIÇÃO DO PROBLEMA *","PROBLEM DESCRIPTION *","DESCRIPCIÓN DEL PROBLEMA *","问题描述 *","समस्या का विवरण *","وصف المشكلة *","DESCRIPTION DU PROBLÈME *","PROBLEMBESCHREIBUNG *"],
  ["IMAGEM (OPCIONAL)","IMAGE (OPTIONAL)","IMAGEN (OPCIONAL)","图片（可选）","छवि (वैकल्पिक)","صورة (اختياري)","IMAGE (FACULTATIVE)","BILD (OPTIONAL)"],
  ["Remover imagem","Remove image","Eliminar imagen","移除图片","छवि हटाएं","إزالة الصورة","Supprimer l'image","Bild entfernen"],
  ["Prazo encerrado","Deadline ended","Plazo finalizado","期限已结束","समय सीमा समाप्त","انتهت المهلة","Délai terminé","Frist abgelaufen"],
  ["PROBLEMA INFORMADO","REPORTED PROBLEM","PROBLEMA REPORTADO","已报告问题","रिपोर्ट की गई समस्या","المشكلة المبلغ عنها","PROBLÈME SIGNALÉ","GEMELDETES PROBLEM"],
  ["RESPOSTA DA EQUIPE","TEAM RESPONSE","RESPUESTA DEL EQUIPO","团队回复","टीम का जवाब","رد الفريق","RÉPONSE DE L'ÉQUIPE","ANTWORT DES TEAMS"],
  ["IMAGEM ENVIADA","UPLOADED IMAGE","IMAGEN ENVIADA","已上传图片","अपलोड की गई छवि","الصورة المرسلة","IMAGE ENVOYÉE","HOCHGELADENES BILD"],
  ["Carregando imagem...","Loading image...","Cargando imagen...","正在加载图片...","छवि लोड हो रही है...","جارٍ تحميل الصورة...","Chargement de l'image...","Bild wird geladen..."],
  ["CONVERSA","CHAT","CONVERSACIÓN","聊天","चैट","المحادثة","CONVERSATION","CHAT"],
  ["Atendimento do pedido","Order support","Atención del pedido","订单客服","ऑर्डर सहायता","دعم الطلب","Support de la commande","Bestellsupport"],
  ["Carregando conversa...","Loading chat...","Cargando conversación...","正在加载聊天...","चैट लोड हो रही है...","جارٍ تحميل المحادثة...","Chargement de la conversation...","Chat wird geladen..."],
  ["Foto e avatar","Photo and avatar","Foto y avatar","照片与头像","फोटो और अवतार","الصورة والصورة الرمزية","Photo et avatar","Foto und Avatar"],
  ["AVATAR ATUAL","CURRENT AVATAR","AVATAR ACTUAL","当前头像","वर्तमान अवतार","الصورة الرمزية الحالية","AVATAR ACTUEL","AKTUELLER AVATAR"],
  ["Avatares padrão","Default avatars","Avatares predeterminados","默认头像","डिफ़ॉल्ट अवतार","الصور الرمزية الافتراضية","Avatars par défaut","Standard-Avatare"],
  ["SELECIONADO","SELECTED","SELECCIONADO","已选择","चयनित","محدد","SÉLECTIONNÉ","AUSGEWÄHLT"],
  ["Minha foto","My photo","Mi foto","我的照片","मेरी फोटो","صورتي","Ma photo","Mein Foto"],
  ["USAR AVATAR PADRÃO","USE DEFAULT AVATAR","USAR AVATAR PREDETERMINADO","使用默认头像","डिफ़ॉल्ट अवतार उपयोग करें","استخدام الصورة الرمزية الافتراضية","UTILISER L'AVATAR PAR DÉFAUT","STANDARD-AVATAR VERWENDEN"],
  ["ALTERAR FOTO / AVATAR","CHANGE PHOTO / AVATAR","CAMBIAR FOTO / AVATAR","更改照片/头像","फोटो / अवतार बदलें","تغيير الصورة / الصورة الرمزية","CHANGER PHOTO / AVATAR","FOTO / AVATAR ÄNDERN"],
  ["Dados pessoais","Personal details","Datos personales","个人信息","व्यक्तिगत जानकारी","البيانات الشخصية","Informations personnelles","Persönliche Daten"],
  ["Nome completo","Full name","Nombre completo","全名","पूरा नाम","الاسم الكامل","Nom complet","Vollständiger Name"],
  ["Telefone","Phone","Teléfono","电话","फ़ोन","الهاتف","Téléphone","Telefon"],
  ["CEP","Postal code","Código postal","邮编","पिन कोड","الرمز البريدي","Code postal","Postleitzahl"],
  ["Endereço","Address","Dirección","地址","पता","العنوان","Adresse","Adresse"],
  ["Número","Number","Número","门牌号","नंबर","الرقم","Numéro","Hausnummer"],
  ["Bairro","Neighborhood","Barrio","街区","इलाका","الحي","Quartier","Stadtteil"],
  ["Cidade","City","Ciudad","城市","शहर","المدينة","Ville","Stadt"],
  ["Estado","State","Estado","州/省","राज्य","الولاية/المنطقة","État/Région","Bundesland"],
  ["SALVAR ALTERAÇÕES","SAVE CHANGES","GUARDAR CAMBIOS","保存更改","परिवर्तन सहेजें","حفظ التغييرات","ENREGISTRER LES MODIFICATIONS","ÄNDERUNGEN SPEICHERN"],

  ["Aguardando pagamento","Awaiting payment","Esperando pago","等待付款","भुगतान की प्रतीक्षा","بانتظار الدفع","En attente de paiement","Zahlung ausstehend"],
  ["Pagamento aprovado","Payment approved","Pago aprobado","付款已批准","भुगतान स्वीकृत","تمت الموافقة على الدفع","Paiement approuvé","Zahlung genehmigt"],
  ["Pagamento concluído","Payment completed","Pago completado","付款完成","भुगतान पूरा हुआ","اكتمل الدفع","Paiement terminé","Zahlung abgeschlossen"],
  ["Preparando pedido","Preparing order","Preparando pedido","正在准备订单","ऑर्डर तैयार हो रहा है","جارٍ تجهيز الطلب","Préparation de la commande","Bestellung wird vorbereitet"],
  ["Pedido enviado","Order shipped","Pedido enviado","订单已发货","ऑर्डर भेज दिया गया","تم شحن الطلب","Commande expédiée","Bestellung versendet"],
  ["Pedido encerrado","Order closed","Pedido cerrado","订单已关闭","ऑर्डर बंद","تم إغلاق الطلب","Commande clôturée","Bestellung geschlossen"],
  ["Aguardando atualização","Awaiting update","Esperando actualización","等待更新","अपडेट की प्रतीक्षा","بانتظار التحديث","En attente de mise à jour","Update ausstehend"],
  ["Aguardando análise","Awaiting review","Esperando análisis","等待审核","समीक्षा की प्रतीक्षा","بانتظار المراجعة","En attente d'analyse","Prüfung ausstehend"],
  ["Em análise","Under review","En análisis","审核中","समीक्षा में","قيد المراجعة","En cours d'analyse","In Prüfung"],
  ["Em conversa","In conversation","En conversación","沟通中","बातचीत में","قيد المحادثة","En conversation","Im Gespräch"],
  ["Reembolso aprovado","Refund approved","Reembolso aprobado","退款已批准","रिफंड स्वीकृत","تمت الموافقة على الاسترداد","Remboursement approuvé","Erstattung genehmigt"],
  ["Solicitação rejeitada","Request rejected","Solicitud rechazada","请求已拒绝","अनुरोध अस्वीकृत","تم رفض الطلب","Demande rejetée","Anfrage abgelehnt"],

  ["Código PIX copiado!","PIX code copied!","¡Código PIX copiado!","PIX 代码已复制！","PIX कोड कॉपी हो गया!","تم نسخ رمز PIX!","Code PIX copié !","PIX-Code kopiert!"],
  ["Não foi possível enviar a mensagem.","Could not send the message.","No se pudo enviar el mensaje.","无法发送消息。","संदेश भेजा नहीं जा सका।","تعذر إرسال الرسالة.","Impossible d'envoyer le message.","Nachricht konnte nicht gesendet werden."],
  ["Não foi possível carregar seus pedidos.","Could not load your orders.","No se pudieron cargar tus pedidos.","无法加载你的订单。","आपके ऑर्डर लोड नहीं हो सके।","تعذر تحميل طلباتك.","Impossible de charger vos commandes.","Bestellungen konnten nicht geladen werden."],
  ["Não foi possível carregar a conversa.","Could not load the chat.","No se pudo cargar la conversación.","无法加载聊天。","चैट लोड नहीं हो सकी।","تعذر تحميل المحادثة.","Impossible de charger la conversation.","Chat konnte nicht geladen werden."],
  ["Descreva o problema com pelo menos 10 caracteres.","Describe the problem using at least 10 characters.","Describe el problema con al menos 10 caracteres.","请至少用 10 个字符描述问题。","समस्या का कम से कम 10 अक्षरों में वर्णन करें।","صف المشكلة بما لا يقل عن 10 أحرف.","Décrivez le problème avec au moins 10 caractères.","Beschreibe das Problem mit mindestens 10 Zeichen."],
  ["Solicitação enviada. Nossa equipe irá analisar o seu caso.","Request sent. Our team will review your case.","Solicitud enviada. Nuestro equipo revisará tu caso.","请求已发送。我们的团队将审核你的情况。","अनुरोध भेज दिया गया है। हमारी टीम आपके मामले की समीक्षा करेगी।","تم إرسال الطلب. سيقوم فريقنا بمراجعة حالتك.","Demande envoyée. Notre équipe va examiner votre dossier.","Anfrage gesendet. Unser Team prüft deinen Fall."],
  ["Não foi possível abrir a solicitação.","Could not open the request.","No se pudo abrir la solicitud.","无法创建请求。","अनुरोध नहीं खोला जा सका।","تعذر فتح الطلب.","Impossible d'ouvrir la demande.","Anfrage konnte nicht geöffnet werden."],
  ["Seu carrinho está vazio.","Your cart is empty.","Tu carrito está vacío.","你的购物车是空的。","आपका कार्ट खाली है।","سلتك فارغة.","Votre panier est vide.","Dein Warenkorb ist leer."],
  ["Pagamento confirmado!","Payment confirmed!","¡Pago confirmado!","付款已确认！","भुगतान की पुष्टि हुई!","تم تأكيد الدفع!","Paiement confirmé !","Zahlung bestätigt!"],
  ["Processando pagamento...","Processing payment...","Procesando pago...","正在处理付款...","भुगतान प्रोसेस हो रहा है...","جارٍ معالجة الدفع...","Traitement du paiement...","Zahlung wird verarbeitet..."],
  ["Confirmando pagamento...","Confirming payment...","Confirmando pago...","正在确认付款...","भुगतान की पुष्टि हो रही है...","جارٍ تأكيد الدفع...","Confirmation du paiement...","Zahlung wird bestätigt..."],
  ["Cancelando pedido...","Cancelling order...","Cancelando pedido...","正在取消订单...","ऑर्डर रद्द हो रहा है...","جارٍ إلغاء الطلب...","Annulation de la commande...","Bestellung wird storniert..."],
  ["Conta criada com sucesso!","Account created successfully!","¡Cuenta creada con éxito!","账户创建成功！","खाता सफलतापूर्वक बन गया!","تم إنشاء الحساب بنجاح!","Compte créé avec succès !","Konto erfolgreich erstellt!"],
  ["E-mail ou senha incorretos.","Incorrect email or password.","Correo o contraseña incorrectos.","邮箱或密码错误。","ईमेल या पासवर्ड गलत है।","البريد الإلكتروني أو كلمة المرور غير صحيحة.","E-mail ou mot de passe incorrect.","E-Mail oder Passwort falsch."],
  ["Você entrou na sua conta com sucesso.","You signed in successfully.","Has iniciado sesión correctamente.","登录成功。","आप सफलतापूर्वक साइन इन हो गए।","تم تسجيل الدخول بنجاح.","Vous êtes connecté avec succès.","Du hast dich erfolgreich angemeldet."],
  ["Login realizado","Signed in","Sesión iniciada","已登录","लॉगिन सफल","تم تسجيل الدخول","Connexion réussie","Angemeldet"],
  ["Você saiu da sua conta com segurança.","You signed out safely.","Has cerrado sesión de forma segura.","已安全退出登录。","आप सुरक्षित रूप से साइन आउट हो गए।","تم تسجيل الخروج بأمان.","Vous avez été déconnecté en toute sécurité.","Du wurdest sicher abgemeldet."],
  ["Sessão encerrada","Session ended","Sesión cerrada","会话已结束","सत्र समाप्त","انتهت الجلسة","Session terminée","Sitzung beendet"],
  ["Dados salvos. O Supabase pode enviar uma confirmação para concluir a alteração do e-mail.","Data saved. Supabase may send a confirmation to complete the email change.","Datos guardados. Supabase puede enviar una confirmación para completar el cambio de correo.","数据已保存。Supabase 可能会发送确认邮件以完成邮箱更改。","डेटा सहेजा गया। ईमेल बदलने के लिए Supabase पुष्टि भेज सकता है।","تم حفظ البيانات. قد يرسل Supabase رسالة تأكيد لإكمال تغيير البريد الإلكتروني.","Données enregistrées. Supabase peut envoyer une confirmation pour finaliser le changement d'e-mail.","Daten gespeichert. Supabase kann eine Bestätigung zum Abschluss der E-Mail-Änderung senden."],
  ["Seus dados foram salvos com sucesso!","Your details were saved successfully!","¡Tus datos se guardaron correctamente!","你的信息已成功保存！","आपकी जानकारी सफलतापूर्वक सहेजी गई!","تم حفظ بياناتك بنجاح!","Vos informations ont été enregistrées avec succès !","Deine Daten wurden erfolgreich gespeichert!"],
  // Cobertura adicional da interface pública
  ["O PRÓXIMO NÍVEL DA SUA", "THE NEXT LEVEL OF YOUR", "EL PRÓXIMO NIVEL DE TU", "你的下一个", "आपके अनुभव का अगला", "المستوى التالي من", "LE PROCHAIN NIVEAU DE VOTRE", "DIE NÄCHSTE STUFE DEINES"],
  ["EXPERIÊNCIA", "EXPERIENCE", "EXPERIENCIA", "体验", "अनुभव", "تجربتك", "EXPÉRIENCE", "ERLEBNISSES"],
  ["Encontre seus jogos favoritos e os melhores periféricos para montar o setup perfeito.", "Find your favorite games and the best peripherals to build the perfect setup.", "Encuentra tus juegos favoritos y los mejores periféricos para montar el setup perfecto.", "找到你喜爱的游戏和最佳外设，打造完美装备。", "अपने पसंदीदा गेम और बेहतरीन पेरिफेरल्स पाएं और अपना परफेक्ट सेटअप बनाएं।", "اعثر على ألعابك المفضلة وأفضل الملحقات لبناء الإعداد المثالي.", "Trouvez vos jeux préférés et les meilleurs périphériques pour créer le setup parfait.", "Finde deine Lieblingsspiele und die besten Peripheriegeräte für das perfekte Setup."],
  ["ATÉ", "UP TO", "HASTA", "最高", "तक", "حتى", "JUSQU'À", "BIS ZU"],
  ["OFF", "OFF", "DTO.", "优惠", "छूट", "خصم", "DE RÉDUCTION", "RABATT"],
  ["VEJA", "VIEW", "VER", "查看", "देखें", "عرض", "VOIR", "ANSEHEN"],
  ["AGORA", "NOW", "AHORA", "现在", "अभी", "الآن", "MAINTENANT", "JETZT"],
  ["DESTAQUES", "FEATURED", "DESTACADOS", "精选", "विशेष", "مميز", "À LA UNE", "HIGHLIGHTS"],
  ["PRODUTOS", "PRODUCTS", "PRODUCTOS", "商品", "उत्पाद", "المنتجات", "PRODUITS", "PRODUKTE"],
  ["VER TUDO →", "VIEW ALL →", "VER TODO →", "查看全部 →", "सभी देखें →", "عرض الكل →", "TOUT VOIR →", "ALLE ANSEHEN →"],
  ["← Voltar para início", "← Back to home", "← Volver al inicio", "← 返回首页", "← होम पर वापस", "← العودة للرئيسية", "← Retour à l'accueil", "← Zurück zur Startseite"],
  ["produtos encontrados", "products found", "productos encontrados", "个商品", "उत्पाद मिले", "منتجات تم العثور عليها", "produits trouvés", "Produkte gefunden"],
  ["preço do produto", "product price", "precio del producto", "商品价格", "उत्पाद की कीमत", "سعر المنتج", "prix du produit", "Produktpreis"],
  ["Login com Supabase", "Login with Supabase", "Inicio de sesión con Supabase", "使用 Supabase 登录", "Supabase से लॉगिन", "تسجيل الدخول عبر Supabase", "Connexion avec Supabase", "Anmeldung mit Supabase"],
  ["Salvos na conta", "Saved to your account", "Guardados en tu cuenta", "已保存到账户", "खाते में सहेजा गया", "محفوظ في الحساب", "Enregistrés dans votre compte", "Im Konto gespeichert"],
  ["PIX e cartão serão integrados juntos", "PIX and card will be integrated together", "PIX y tarjeta se integrarán juntos", "PIX 和银行卡将一并集成", "PIX और कार्ड एक साथ इंटीग्रेट होंगे", "سيتم دمج PIX والبطاقة معًا", "PIX et carte seront intégrés ensemble", "PIX und Karte werden gemeinsam integriert"],
  ["Somente clientes com pedido entregue podem avaliar. Todo comentário passa por moderação antes de ser publicado.", "Only customers with a delivered order can leave a review. Every comment is moderated before publication.", "Solo los clientes con un pedido entregado pueden valorar. Todos los comentarios se moderan antes de publicarse.", "只有订单已送达的客户才能评价。所有评论发布前都会经过审核。", "केवल डिलीवर हुए ऑर्डर वाले ग्राहक समीक्षा कर सकते हैं। हर टिप्पणी प्रकाशित होने से पहले मॉडरेट की जाती है।", "يمكن فقط للعملاء الذين تم تسليم طلباتهم التقييم. تتم مراجعة كل تعليق قبل نشره.", "Seuls les clients dont la commande a été livrée peuvent laisser un avis. Chaque commentaire est modéré avant publication.", "Nur Kunden mit zugestellter Bestellung können bewerten. Jeder Kommentar wird vor der Veröffentlichung moderiert."],
  ["AMBIENTE DE TESTE", "TEST ENVIRONMENT", "ENTORNO DE PRUEBA", "测试环境", "टेस्ट वातावरण", "بيئة اختبار", "ENVIRONNEMENT DE TEST", "TESTUMGEBUNG"],
  ["As avaliações marcadas como demonstração são exemplos visuais e não representam clientes reais.", "Reviews marked as demonstrations are visual examples and do not represent real customers.", "Las reseñas marcadas como demostración son ejemplos visuales y no representan clientes reales.", "标记为演示的评价仅用于视觉示例，不代表真实客户。", "डेमो के रूप में चिह्नित समीक्षाएं केवल दृश्य उदाहरण हैं और वास्तविक ग्राहकों का प्रतिनिधित्व नहीं करतीं।", "التقييمات المعلّمة كعرض توضيحي هي أمثلة مرئية ولا تمثل عملاء حقيقيين.", "Les avis indiqués comme démonstration sont des exemples visuels et ne représentent pas de vrais clients.", "Als Demo gekennzeichnete Bewertungen sind visuelle Beispiele und stammen nicht von echten Kunden."],
  ["Depois que uma compra for entregue, o cliente poderá avaliar o produto em “Meus pedidos”.", "After a purchase is delivered, the customer can review the product under “My orders”.", "Después de que se entregue una compra, el cliente podrá valorar el producto en “Mis pedidos”.", "订单送达后，客户可以在“我的订单”中评价商品。", "खरीद डिलीवर होने के बाद ग्राहक “मेरे ऑर्डर” में उत्पाद की समीक्षा कर सकता है।", "بعد تسليم الطلب، يمكن للعميل تقييم المنتج من قسم «طلباتي».", "Une fois la commande livrée, le client pourra évaluer le produit dans « Mes commandes ».", "Nach der Lieferung kann der Kunde das Produkt unter „Meine Bestellungen“ bewerten."],
  ["Produtos digitais não pagam frete. Para físicos, o valor é calculado pelo CEP no checkout.", "Digital products have no shipping charge. For physical products, shipping is calculated from the postal code at checkout.", "Los productos digitales no pagan envío. Para los físicos, el costo se calcula por código postal en el checkout.", "数字商品无需运费。实体商品的运费会在结账时根据邮编计算。", "डिजिटल उत्पादों पर शिपिंग नहीं लगती। भौतिक उत्पादों के लिए चेकआउट पर पिन कोड से शुल्क गणना होती है।", "لا توجد رسوم شحن للمنتجات الرقمية. أما المنتجات المادية فيتم حساب الشحن حسب الرمز البريدي عند الدفع.", "Les produits numériques n'ont pas de frais de livraison. Pour les produits physiques, le montant est calculé selon le code postal au paiement.", "Für digitale Produkte fallen keine Versandkosten an. Bei physischen Produkten wird der Versand anhand der Postleitzahl im Checkout berechnet."],
  ["Checkout", "Checkout", "Checkout", "结账", "चेकआउट", "الدفع", "Paiement", "Checkout"],
  ["O CEP completa os dados automaticamente.", "The postal code fills in the address automatically.", "El código postal completa los datos automáticamente.", "邮编会自动补全地址信息。", "पिन कोड पता अपने आप भर देता है।", "يقوم الرمز البريدي بإكمال بيانات العنوان تلقائيًا.", "Le code postal complète automatiquement l'adresse.", "Die Postleitzahl ergänzt die Adressdaten automatisch."],
  ["Valores e prazos calculados em tempo real pelo Melhor Envio.", "Prices and delivery times calculated in real time by Melhor Envio.", "Precios y plazos calculados en tiempo real por Melhor Envio.", "价格和时效由 Melhor Envio 实时计算。", "कीमतें और डिलीवरी समय Melhor Envio द्वारा रियल टाइम में गणना किए जाते हैं।", "يتم حساب الأسعار ومواعيد التسليم لحظيًا عبر Melhor Envio.", "Tarifs et délais calculés en temps réel par Melhor Envio.", "Preise und Lieferzeiten werden in Echtzeit von Melhor Envio berechnet."],
  ["CEP DE DESTINO", "DESTINATION POSTAL CODE", "CÓDIGO POSTAL DE DESTINO", "目的地邮编", "गंतव्य पिन कोड", "الرمز البريدي للوجهة", "CODE POSTAL DE DESTINATION", "ZIEL-POSTLEITZAHL"],
  ["BUSCANDO CEP...", "LOOKING UP POSTAL CODE...", "BUSCANDO CÓDIGO POSTAL...", "正在查询邮编...", "पिन कोड खोजा जा रहा है...", "جارٍ البحث عن الرمز البريدي...", "RECHERCHE DU CODE POSTAL...", "POSTLEITZAHL WIRD GESUCHT..."],
  ["Seu subtotal de produtos físicos atingiu R$ 299. Usaremos a opção disponível de menor custo.", "Your physical-product subtotal reached R$ 299. We will use the lowest-cost available option.", "El subtotal de productos físicos alcanzó R$ 299. Usaremos la opción disponible de menor costo.", "实体商品小计已达到 R$ 299。我们将使用可用的最低成本配送方式。", "आपके भौतिक उत्पादों का सबटोटल R$ 299 तक पहुंच गया है। हम सबसे कम लागत वाला उपलब्ध विकल्प इस्तेमाल करेंगे।", "وصل المجموع الفرعي للمنتجات المادية إلى R$ 299. سنستخدم أقل خيار متاح تكلفةً.", "Le sous-total de vos produits physiques a atteint R$ 299. Nous utiliserons l'option disponible la moins chère.", "Die Zwischensumme der physischen Produkte hat R$ 299 erreicht. Wir verwenden die günstigste verfügbare Option."],
  ["Informe um CEP válido para consultar as opções de entrega.", "Enter a valid postal code to check delivery options.", "Introduce un código postal válido para consultar las opciones de entrega.", "请输入有效邮编以查看配送选项。", "डिलीवरी विकल्प देखने के लिए वैध पिन कोड दर्ज करें।", "أدخل رمزًا بريديًا صالحًا لعرض خيارات التسليم.", "Saisissez un code postal valide pour consulter les options de livraison.", "Gib eine gültige Postleitzahl ein, um Lieferoptionen anzuzeigen."],
  ["Este carrinho não possui produtos físicos e não cobra frete.", "This cart contains no physical products and has no shipping charge.", "Este carrito no contiene productos físicos y no cobra envío.", "此购物车不含实体商品，因此不收取运费。", "इस कार्ट में कोई भौतिक उत्पाद नहीं है और शिपिंग शुल्क नहीं लगेगा।", "لا تحتوي هذه السلة على منتجات مادية ولا تُفرض رسوم شحن.", "Ce panier ne contient aucun produit physique et ne comporte donc pas de frais de livraison.", "Dieser Warenkorb enthält keine physischen Produkte, daher fallen keine Versandkosten an."],
  ["O pedido será tratado como entrega digital.", "The order will be handled as a digital delivery.", "El pedido se gestionará como entrega digital.", "该订单将按数字交付处理。", "ऑर्डर को डिजिटल डिलीवरी के रूप में प्रोसेस किया जाएगा।", "سيتم التعامل مع الطلب كتسليم رقمي.", "La commande sera traitée comme une livraison numérique.", "Die Bestellung wird als digitale Lieferung behandelt."],
  ["O pagamento é processado pelo Mercado Pago em ambiente de teste nesta etapa.", "Payment is processed by Mercado Pago in a test environment at this stage.", "El pago se procesa mediante Mercado Pago en un entorno de prueba en esta etapa.", "此阶段付款由 Mercado Pago 在测试环境中处理。", "इस चरण में भुगतान Mercado Pago के टेस्ट वातावरण में प्रोसेस होता है।", "تتم معالجة الدفع عبر Mercado Pago في بيئة اختبار في هذه المرحلة.", "À cette étape, le paiement est traité par Mercado Pago dans un environnement de test.", "In diesem Schritt wird die Zahlung über Mercado Pago in einer Testumgebung verarbeitet."],
  ["Dados do cartão preenchidos no Brick do Mercado Pago", "Card details entered in the Mercado Pago Brick", "Datos de la tarjeta introducidos en el Brick de Mercado Pago", "银行卡信息在 Mercado Pago Brick 中填写", "कार्ड विवरण Mercado Pago Brick में भरे जाते हैं", "يتم إدخال بيانات البطاقة في Mercado Pago Brick", "Données de carte saisies dans le Brick Mercado Pago", "Kartendaten werden im Mercado-Pago-Brick eingegeben"],
  ["Preencha os dados abaixo. A loja não recebe nem armazena o número completo do cartão ou o CVV.", "Fill in the details below. The store does not receive or store the full card number or CVV.", "Completa los datos a continuación. La tienda no recibe ni almacena el número completo de la tarjeta ni el CVV.", "请填写以下信息。商店不会接收或保存完整卡号或 CVV。", "नीचे विवरण भरें। स्टोर पूरा कार्ड नंबर या CVV प्राप्त या स्टोर नहीं करता।", "أدخل البيانات أدناه. المتجر لا يستلم ولا يخزن رقم البطاقة الكامل أو رمز CVV.", "Renseignez les informations ci-dessous. La boutique ne reçoit ni ne stocke le numéro complet de la carte ni le CVV.", "Fülle die Angaben unten aus. Der Shop erhält oder speichert weder die vollständige Kartennummer noch den CVV."],
  ["As opções de parcelamento aparecem conforme as parcelas disponibilizadas pelo Mercado Pago para o cartão informado.", "Installment options are shown according to the plans Mercado Pago makes available for the entered card.", "Las opciones de cuotas aparecen según las que Mercado Pago ofrece para la tarjeta indicada.", "分期选项会根据 Mercado Pago 对所填银行卡提供的方案显示。", "किस्त विकल्प Mercado Pago द्वारा दर्ज कार्ड के लिए उपलब्ध योजनाओं के अनुसार दिखते हैं।", "تظهر خيارات التقسيط وفقًا للخطط التي يتيحها Mercado Pago للبطاقة المُدخلة.", "Les options de paiement en plusieurs fois s'affichent selon les échéances proposées par Mercado Pago pour la carte saisie.", "Ratenzahlungsoptionen werden entsprechend den von Mercado Pago für die angegebene Karte angebotenen Raten angezeigt."],
  ["Public Key do Mercado Pago não carregada.", "Mercado Pago Public Key was not loaded.", "No se cargó la Public Key de Mercado Pago.", "Mercado Pago 公钥未加载。", "Mercado Pago Public Key लोड नहीं हुई।", "لم يتم تحميل المفتاح العام لـ Mercado Pago.", "La clé publique Mercado Pago n'a pas été chargée.", "Der Mercado-Pago-Public-Key wurde nicht geladen."],
  ["Checkout real ainda não ativado. Configure as credenciais produtivas do Mercado Pago.", "Live checkout is not enabled yet. Configure the Mercado Pago production credentials.", "El checkout real aún no está activado. Configura las credenciales de producción de Mercado Pago.", "正式结账尚未启用。请配置 Mercado Pago 的生产凭据。", "लाइव चेकआउट अभी सक्रिय नहीं है। Mercado Pago की प्रोडक्शन क्रेडेंशियल्स कॉन्फ़िगर करें।", "لم يتم تفعيل الدفع الحقيقي بعد. قم بإعداد بيانات اعتماد Mercado Pago للإنتاج.", "Le paiement réel n'est pas encore activé. Configurez les identifiants de production Mercado Pago.", "Der Live-Checkout ist noch nicht aktiviert. Konfiguriere die Produktionszugangsdaten von Mercado Pago."],
  ["Calcule o frete e escolha a entrega antes de iniciar uma cobrança.", "Calculate shipping and choose a delivery option before starting a payment.", "Calcula el envío y elige la entrega antes de iniciar un cobro.", "请先计算运费并选择配送方式，再开始付款。", "भुगतान शुरू करने से पहले शिपिंग की गणना करें और डिलीवरी विकल्प चुनें।", "احسب الشحن واختر طريقة التسليم قبل بدء الدفع.", "Calculez la livraison et choisissez une option avant de lancer le paiement.", "Berechne den Versand und wähle eine Lieferoption, bevor du die Zahlung startest."],
  ["Finalize o cartão pelo botão exibido no formulário do Mercado Pago.", "Complete the card payment using the button shown in the Mercado Pago form.", "Finaliza el pago con tarjeta mediante el botón del formulario de Mercado Pago.", "请使用 Mercado Pago 表单中的按钮完成银行卡付款。", "Mercado Pago फ़ॉर्म में दिख रहे बटन से कार्ड भुगतान पूरा करें।", "أكمل الدفع بالبطاقة عبر الزر الظاهر في نموذج Mercado Pago.", "Finalisez le paiement par carte à l'aide du bouton affiché dans le formulaire Mercado Pago.", "Schließe die Kartenzahlung über die Schaltfläche im Mercado-Pago-Formular ab."],
  ["Escaneie o QR Code pelo aplicativo do seu banco ou use o Pix Copia e Cola.", "Scan the QR Code with your banking app or use Pix Copy and Paste.", "Escanea el código QR con la app de tu banco o usa Pix Copia y Pega.", "使用银行应用扫描二维码，或使用 Pix 复制粘贴。", "अपने बैंक ऐप से QR Code स्कैन करें या Pix Copy and Paste इस्तेमाल करें।", "امسح رمز QR عبر تطبيق البنك أو استخدم نسخ ولصق Pix.", "Scannez le QR Code avec l'application de votre banque ou utilisez Pix Copier-Coller.", "Scanne den QR-Code mit deiner Banking-App oder nutze Pix Copy & Paste."],
  ["Abrir instruções do Mercado Pago ↗", "Open Mercado Pago instructions ↗", "Abrir instrucciones de Mercado Pago ↗", "打开 Mercado Pago 说明 ↗", "Mercado Pago निर्देश खोलें ↗", "فتح تعليمات Mercado Pago ↗", "Ouvrir les instructions Mercado Pago ↗", "Mercado-Pago-Anweisungen öffnen ↗"],
  ["Volte ao checkout para gerar uma nova cobrança.", "Return to checkout to generate a new payment.", "Vuelve al checkout para generar un nuevo cobro.", "返回结账页面以生成新的付款。", "नया भुगतान बनाने के लिए चेकआउट पर वापस जाएं।", "عد إلى صفحة الدفع لإنشاء عملية دفع جديدة.", "Retournez au paiement pour générer une nouvelle transaction.", "Kehre zum Checkout zurück, um eine neue Zahlung zu erstellen."],
  ["ATUALIZAR STATUS", "REFRESH STATUS", "ACTUALIZAR ESTADO", "更新状态", "स्थिति अपडेट करें", "تحديث الحالة", "ACTUALISER LE STATUT", "STATUS AKTUALISIEREN"],
  ["VOLTAR AO CHECKOUT", "BACK TO CHECKOUT", "VOLVER AL CHECKOUT", "返回结账", "चेकआउट पर वापस", "العودة إلى الدفع", "RETOUR AU PAIEMENT", "ZURÜCK ZUM CHECKOUT"],
  ["O status é atualizado automaticamente pelo webhook do Mercado Pago e também verificado periodicamente pelo site.", "The status is updated automatically by the Mercado Pago webhook and periodically checked by the site.", "El estado se actualiza automáticamente mediante el webhook de Mercado Pago y el sitio también lo verifica periódicamente.", "状态会由 Mercado Pago webhook 自动更新，网站也会定期检查。", "स्थिति Mercado Pago webhook द्वारा अपने आप अपडेट होती है और साइट भी समय-समय पर जांच करती है।", "يتم تحديث الحالة تلقائيًا عبر webhook الخاص بـ Mercado Pago ويتحقق الموقع منها دوريًا أيضًا.", "Le statut est mis à jour automatiquement par le webhook Mercado Pago et vérifié périodiquement par le site.", "Der Status wird automatisch über den Mercado-Pago-Webhook aktualisiert und zusätzlich regelmäßig von der Website geprüft."],
  ["O pagamento foi aprovado e o pedido foi registrado na Brother's Games.", "Payment was approved and the order was registered with Brother's Games.", "El pago fue aprobado y el pedido se registró en Brother's Games.", "付款已批准，订单已在 Brother's Games 中登记。", "भुगतान स्वीकृत हो गया और ऑर्डर Brother's Games में दर्ज हो गया।", "تمت الموافقة على الدفع وتسجيل الطلب في Brother's Games.", "Le paiement a été approuvé et la commande enregistrée chez Brother's Games.", "Die Zahlung wurde genehmigt und die Bestellung bei Brother's Games registriert."],
  ["PEDIDO", "ORDER", "PEDIDO", "订单", "ऑर्डर", "الطلب", "COMMANDE", "BESTELLUNG"],
  ["TOTAL", "TOTAL", "TOTAL", "总计", "कुल", "الإجمالي", "TOTAL", "GESAMT"],
  ["STATUS", "STATUS", "ESTADO", "状态", "स्थिति", "الحالة", "STATUT", "STATUS"],
  ["Ao editar, a avaliação volta para análise.", "When edited, the review goes back to moderation.", "Al editarla, la reseña vuelve a revisión.", "编辑后，评价将重新进入审核。", "संपादन के बाद समीक्षा फिर से मॉडरेशन में जाएगी।", "عند التعديل، يعود التقييم للمراجعة.", "Après modification, l'avis repasse en modération.", "Nach einer Bearbeitung wird die Bewertung erneut geprüft."],
  ["Comentários com palavrões, conteúdo sexual/+18 ou tentativas de burlar o filtro são bloqueados automaticamente.", "Comments containing profanity, sexual/18+ content or attempts to bypass the filter are blocked automatically.", "Los comentarios con insultos, contenido sexual/+18 o intentos de eludir el filtro se bloquean automáticamente.", "包含脏话、色情/18+内容或试图绕过过滤器的评论会被自动屏蔽。", "गाली, यौन/18+ सामग्री या फ़िल्टर को बायपास करने की कोशिश वाले कमेंट अपने आप ब्लॉक होते हैं।", "يتم حظر التعليقات التي تحتوي على ألفاظ نابية أو محتوى جنسي/+18 أو محاولات لتجاوز الفلتر تلقائيًا.", "Les commentaires contenant des insultes, du contenu sexuel/+18 ou des tentatives de contourner le filtre sont automatiquement bloqués.", "Kommentare mit Schimpfwörtern, sexuellen/18+-Inhalten oder Versuchen, den Filter zu umgehen, werden automatisch blockiert."],
  ["JPG, PNG ou WEBP • até 5 MB cada", "JPG, PNG or WEBP • up to 5 MB each", "JPG, PNG o WEBP • hasta 5 MB cada una", "JPG、PNG 或 WEBP • 每张最多 5 MB", "JPG, PNG या WEBP • प्रत्येक अधिकतम 5 MB", "JPG أو PNG أو WEBP • حتى 5 MB لكل صورة", "JPG, PNG ou WEBP • jusqu'à 5 Mo chacune", "JPG, PNG oder WEBP • jeweils bis zu 5 MB"],
  ["As fotos também passam pela aprovação da equipe antes de aparecerem na loja.", "Photos are also reviewed by the team before appearing in the store.", "Las fotos también pasan por la aprobación del equipo antes de aparecer en la tienda.", "照片也会经过团队审核后才会显示在商店中。", "फोटो भी स्टोर में दिखने से पहले टीम की मंजूरी से गुजरते हैं।", "تخضع الصور أيضًا لموافقة الفريق قبل ظهورها في المتجر.", "Les photos sont également validées par l'équipe avant d'apparaître dans la boutique.", "Auch Fotos werden vom Team geprüft, bevor sie im Shop erscheinen."],
  ["VOLTAR", "BACK", "VOLVER", "返回", "वापस", "رجوع", "RETOUR", "ZURÜCK"],
  ["O carrinho será mantido. Antes de cancelar, vamos consultar o Mercado Pago para garantir que o pagamento ainda não foi aprovado.", "Your cart will be kept. Before cancelling, we will check Mercado Pago to make sure the payment has not already been approved.", "El carrito se mantendrá. Antes de cancelar, consultaremos Mercado Pago para asegurarnos de que el pago aún no haya sido aprobado.", "购物车会保留。取消前，我们会查询 Mercado Pago，确认付款尚未获批。", "कार्ट बना रहेगा। रद्द करने से पहले हम Mercado Pago से जांचेंगे कि भुगतान पहले ही स्वीकृत तो नहीं हुआ।", "سيتم الاحتفاظ بالسلة. قبل الإلغاء، سنتحقق من Mercado Pago للتأكد من أن الدفع لم تتم الموافقة عليه بعد.", "Le panier sera conservé. Avant d'annuler, nous vérifierons auprès de Mercado Pago que le paiement n'a pas déjà été approuvé.", "Der Warenkorb bleibt erhalten. Vor der Stornierung prüfen wir bei Mercado Pago, ob die Zahlung noch nicht genehmigt wurde."],
  ["Se o pagamento já tiver sido confirmado, o pedido não será cancelado.", "If payment has already been confirmed, the order will not be cancelled.", "Si el pago ya fue confirmado, el pedido no se cancelará.", "如果付款已确认，订单将不会被取消。", "अगर भुगतान पहले ही पुष्टि हो चुका है, तो ऑर्डर रद्द नहीं होगा।", "إذا تم تأكيد الدفع بالفعل، فلن يتم إلغاء الطلب.", "Si le paiement a déjà été confirmé, la commande ne sera pas annulée.", "Wenn die Zahlung bereits bestätigt wurde, wird die Bestellung nicht storniert."],
  ["MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO", "MELHOR ENVIO"],
  ["Estamos consultando as transportadoras e buscando as melhores opções de preço e prazo para o seu pedido.", "We are checking carriers and finding the best price and delivery-time options for your order.", "Estamos consultando transportistas y buscando las mejores opciones de precio y plazo para tu pedido.", "我们正在查询承运商，为你的订单寻找最佳价格和时效方案。", "हम कैरियर्स की जांच कर रहे हैं और आपके ऑर्डर के लिए सबसे अच्छी कीमत और डिलीवरी समय के विकल्प खोज रहे हैं।", "نحن نتحقق من شركات الشحن ونبحث عن أفضل خيارات السعر ووقت التسليم لطلبك.", "Nous consultons les transporteurs afin de trouver les meilleures options de prix et de délai pour votre commande.", "Wir prüfen Versanddienstleister und suchen die besten Preis- und Lieferzeitoptionen für deine Bestellung."],
  ["Aguarde alguns segundos. O valor será atualizado automaticamente.", "Please wait a few seconds. The amount will update automatically.", "Espera unos segundos. El importe se actualizará automáticamente.", "请稍等几秒。金额会自动更新。", "कुछ सेकंड प्रतीक्षा करें। राशि अपने आप अपडेट हो जाएगी।", "انتظر بضع ثوانٍ. سيتم تحديث المبلغ تلقائيًا.", "Patientez quelques secondes. Le montant sera mis à jour automatiquement.", "Warte ein paar Sekunden. Der Betrag wird automatisch aktualisiert."],
  ["Evite atualizar a página ou clicar novamente enquanto processamos.", "Avoid refreshing the page or clicking again while we process your request.", "Evita actualizar la página o hacer clic de nuevo mientras procesamos.", "处理期间请勿刷新页面或重复点击。", "प्रोसेसिंग के दौरान पेज रीफ्रेश या दोबारा क्लिक न करें।", "تجنب تحديث الصفحة أو النقر مرة أخرى أثناء المعالجة.", "Évitez d'actualiser la page ou de cliquer à nouveau pendant le traitement.", "Aktualisiere die Seite nicht und klicke nicht erneut, während wir verarbeiten."],
  ["Pagamento via Mercado Pago", "Payment via Mercado Pago", "Pago mediante Mercado Pago", "通过 Mercado Pago 付款", "Mercado Pago से भुगतान", "الدفع عبر Mercado Pago", "Paiement via Mercado Pago", "Zahlung über Mercado Pago"],
  ["Seu jogo. Seu setup. Seu próximo nível.", "Your game. Your setup. Your next level.", "Tu juego. Tu setup. Tu próximo nivel.", "你的游戏。你的装备。你的下一个等级。", "आपका गेम। आपका सेटअप। आपका अगला स्तर।", "لعبتك. تجهيزك. مستواك التالي.", "Votre jeu. Votre setup. Votre prochain niveau.", "Dein Spiel. Dein Setup. Dein nächstes Level."],
  ["FALE CONOSCO", "CONTACT US", "HABLA CON NOSOTROS", "联系我们", "हमसे संपर्क करें", "تواصل معنا", "CONTACTEZ-NOUS", "KONTAKTIERE UNS"],
  ["FALAR PELO INSTAGRAM", "CONTACT VIA INSTAGRAM", "HABLAR POR INSTAGRAM", "通过 INSTAGRAM 联系", "INSTAGRAM पर संपर्क करें", "التواصل عبر INSTAGRAM", "CONTACTER VIA INSTAGRAM", "ÜBER INSTAGRAM KONTAKTIEREN"],
  ["A BROTHER'S GAMES nunca deve solicitar sua senha ou código de segurança do cartão por mensagem.", "BROTHER'S GAMES should never ask for your password or card security code by message.", "BROTHER'S GAMES nunca debe pedirte tu contraseña ni el código de seguridad de tu tarjeta por mensaje.", "BROTHER'S GAMES 绝不会通过消息索要你的密码或银行卡安全码。", "BROTHER'S GAMES कभी भी संदेश के जरिए आपका पासवर्ड या कार्ड सुरक्षा कोड नहीं मांगेगा।", "لن تطلب BROTHER'S GAMES أبدًا كلمة مرورك أو رمز أمان البطاقة عبر الرسائل.", "BROTHER'S GAMES ne vous demandera jamais votre mot de passe ou le code de sécurité de votre carte par message.", "BROTHER'S GAMES wird dich niemals per Nachricht nach deinem Passwort oder Karten-Sicherheitscode fragen."],
  ["SEGURANÇA DA CONTA", "ACCOUNT SECURITY", "SEGURIDAD DE LA CUENTA", "账户安全", "खाता सुरक्षा", "أمان الحساب", "SÉCURITÉ DU COMPTE", "KONTOSICHERHEIT"],
  ["CÓDIGO POR E-MAIL", "CODE BY EMAIL", "CÓDIGO POR CORREO", "邮件验证码", "ईमेल कोड", "رمز عبر البريد الإلكتروني", "CODE PAR E-MAIL", "CODE PER E-MAIL"],
  ["Gratuito e enviado para sua caixa de entrada", "Free and sent to your inbox", "Gratis y enviado a tu bandeja de entrada", "免费发送到你的收件箱", "मुफ़्त और आपके इनबॉक्स में भेजा जाएगा", "مجاني ويتم إرساله إلى صندوق الوارد", "Gratuit et envoyé dans votre boîte de réception", "Kostenlos und an deinen Posteingang gesendet"],
  ["E-mail cadastrado", "Registered email", "Correo registrado", "已注册邮箱", "रजिस्टर्ड ईमेल", "البريد الإلكتروني المسجل", "E-mail enregistré", "Registrierte E-Mail"],
  ["CÓDIGO ENVIADO PARA", "CODE SENT TO", "CÓDIGO ENVIADO A", "验证码已发送至", "कोड भेजा गया", "تم إرسال الرمز إلى", "CODE ENVOYÉ À", "CODE GESENDET AN"],
  ["Código de segurança", "Security code", "Código de seguridad", "安全码", "सुरक्षा कोड", "رمز الأمان", "Code de sécurité", "Sicherheitscode"],
  ["REENVIAR CÓDIGO", "RESEND CODE", "REENVIAR CÓDIGO", "重新发送验证码", "कोड फिर भेजें", "إعادة إرسال الرمز", "RENVOYER LE CODE", "CODE ERNEUT SENDEN"],
  ["Nova senha", "New password", "Nueva contraseña", "新密码", "नया पासवर्ड", "كلمة مرور جديدة", "Nouveau mot de passe", "Neues Passwort"],
  ["Confirmar nova senha", "Confirm new password", "Confirmar nueva contraseña", "确认新密码", "नया पासवर्ड पुष्टि करें", "تأكيد كلمة المرور الجديدة", "Confirmer le nouveau mot de passe", "Neues Passwort bestätigen"],
  ["Use pelo menos 8 caracteres e evite senhas utilizadas em outros sites.", "Use at least 8 characters and avoid passwords used on other sites.", "Usa al menos 8 caracteres y evita contraseñas utilizadas en otros sitios.", "请至少使用 8 个字符，并避免使用在其他网站用过的密码。", "कम से कम 8 अक्षर इस्तेमाल करें और अन्य साइटों पर इस्तेमाल किए गए पासवर्ड से बचें।", "استخدم 8 أحرف على الأقل وتجنب كلمات المرور المستخدمة في مواقع أخرى.", "Utilisez au moins 8 caractères et évitez les mots de passe déjà utilisés sur d'autres sites.", "Verwende mindestens 8 Zeichen und keine Passwörter, die du auf anderen Websites benutzt."],
  ["← VOLTAR PARA O LOGIN", "← BACK TO LOGIN", "← VOLVER AL LOGIN", "← 返回登录", "← लॉगिन पर वापस", "← العودة لتسجيل الدخول", "← RETOUR À LA CONNEXION", "← ZURÜCK ZUM LOGIN"],
  ["Esqueci minha senha", "Forgot my password", "Olvidé mi contraseña", "忘记密码", "पासवर्ड भूल गए", "نسيت كلمة المرور", "Mot de passe oublié", "Passwort vergessen"],
  ["Alterar foto / avatar", "Change photo / avatar", "Cambiar foto / avatar", "更改照片/头像", "फोटो / अवतार बदलें", "تغيير الصورة / الصورة الرمزية", "Changer photo / avatar", "Foto / Avatar ändern"],
  ["Acompanhe o pagamento, a entrega e avalie produtos já recebidos.", "Track payment and delivery, and review products you have received.", "Sigue el pago y la entrega, y valora los productos que ya recibiste.", "跟踪付款和配送，并评价已收到的商品。", "भुगतान और डिलीवरी ट्रैक करें और मिले हुए उत्पादों की समीक्षा करें।", "تابع الدفع والتسليم وقيّم المنتجات التي استلمتها.", "Suivez le paiement et la livraison, puis évaluez les produits reçus.", "Verfolge Zahlung und Lieferung und bewerte bereits erhaltene Produkte."],
  ["Agora você já pode avaliar os produtos deste pedido", "You can now review the products in this order", "Ahora ya puedes valorar los productos de este pedido", "你现在可以评价此订单中的商品", "अब आप इस ऑर्डर के उत्पादों की समीक्षा कर सकते हैं", "يمكنك الآن تقييم منتجات هذا الطلب", "Vous pouvez maintenant évaluer les produits de cette commande", "Du kannst jetzt die Produkte dieser Bestellung bewerten"],
  ["Escolha um item abaixo. A avaliação será enviada para análise antes da publicação.", "Choose an item below. The review will be sent for moderation before publication.", "Elige un artículo a continuación. La reseña se enviará a revisión antes de publicarse.", "请选择下面的商品。评价将在发布前提交审核。", "नीचे एक आइटम चुनें। समीक्षा प्रकाशित होने से पहले मॉडरेशन के लिए भेजी जाएगी।", "اختر عنصرًا أدناه. سيتم إرسال التقييم للمراجعة قبل نشره.", "Choisissez un article ci-dessous. L'avis sera envoyé en modération avant publication.", "Wähle unten einen Artikel. Die Bewertung wird vor der Veröffentlichung geprüft."],
  ["O prazo de 5 dias após a entrega terminou.", "The 5-day period after delivery has ended.", "El plazo de 5 días después de la entrega terminó.", "送达后的 5 天期限已结束。", "डिलीवरी के बाद 5 दिन की अवधि समाप्त हो गई है।", "انتهت فترة الخمسة أيام بعد التسليم.", "Le délai de 5 jours après la livraison est terminé.", "Die 5-Tage-Frist nach der Lieferung ist abgelaufen."],
  ["ACOMPANHAR PEDIDO", "TRACK ORDER", "SEGUIR PEDIDO", "跟踪订单", "ऑर्डर ट्रैक करें", "تتبع الطلب", "SUIVRE LA COMMANDE", "BESTELLUNG VERFOLGEN"],
  ["Atualize a lista de pedidos e tente novamente.", "Refresh the order list and try again.", "Actualiza la lista de pedidos e inténtalo de nuevo.", "刷新订单列表并重试。", "ऑर्डर सूची रीफ्रेश करके फिर कोशिश करें।", "حدّث قائمة الطلبات وحاول مرة أخرى.", "Actualisez la liste des commandes et réessayez.", "Aktualisiere die Bestellliste und versuche es erneut."],
  ["JPG, PNG ou WEBP · até 5 MB", "JPG, PNG or WEBP · up to 5 MB", "JPG, PNG o WEBP · hasta 5 MB", "JPG、PNG 或 WEBP · 最大 5 MB", "JPG, PNG या WEBP · अधिकतम 5 MB", "JPG أو PNG أو WEBP · حتى 5 MB", "JPG, PNG ou WEBP · jusqu'à 5 Mo", "JPG, PNG oder WEBP · bis zu 5 MB"],
  ["O prazo de 5 dias após a entrega para abrir um problema terminou.", "The 5-day period after delivery for opening an issue has ended.", "El plazo de 5 días después de la entrega para abrir un problema terminó.", "送达后用于提交问题的 5 天期限已结束。", "डिलीवरी के बाद समस्या खोलने की 5 दिन की अवधि समाप्त हो गई है।", "انتهت مهلة الخمسة أيام بعد التسليم لفتح مشكلة.", "Le délai de 5 jours après la livraison pour ouvrir un problème est terminé.", "Die 5-Tage-Frist nach der Lieferung zum Melden eines Problems ist abgelaufen."],
  ["Ainda não há mensagens. A equipe poderá iniciar uma conversa durante a análise.", "There are no messages yet. The team may start a conversation during the review.", "Aún no hay mensajes. El equipo podrá iniciar una conversación durante la revisión.", "暂时还没有消息。团队可能会在审核过程中发起对话。", "अभी कोई संदेश नहीं है। समीक्षा के दौरान टीम बातचीत शुरू कर सकती है।", "لا توجد رسائل بعد. قد يبدأ الفريق محادثة أثناء المراجعة.", "Il n'y a pas encore de messages. L'équipe pourra démarrer une conversation pendant l'analyse.", "Es gibt noch keine Nachrichten. Das Team kann während der Prüfung eine Unterhaltung starten."],
  ["ENVIAR", "SEND", "ENVIAR", "发送", "भेजें", "إرسال", "ENVOYER", "SENDEN"],
  ["Escolha um avatar da Brother&apos;s Games ou envie sua própria foto.", "Choose a Brother&apos;s Games avatar or upload your own photo.", "Elige un avatar de Brother&apos;s Games o sube tu propia foto.", "选择 Brother&apos;s Games 头像或上传自己的照片。", "Brother&apos;s Games का अवतार चुनें या अपनी फोटो अपलोड करें।", "اختر صورة رمزية من Brother&apos;s Games أو ارفع صورتك الخاصة.", "Choisissez un avatar Brother&apos;s Games ou importez votre propre photo.", "Wähle einen Brother&apos;s-Games-Avatar oder lade dein eigenes Foto hoch."],
  ["Escolha um estilo gamer para sua conta.", "Choose a gamer style for your account.", "Elige un estilo gamer para tu cuenta.", "为你的账户选择游戏风格。", "अपने खाते के लिए गेमर स्टाइल चुनें।", "اختر نمطًا للألعاب لحسابك.", "Choisissez un style gamer pour votre compte.", "Wähle einen Gamer-Stil für dein Konto."],
  ["JPG, PNG ou WEBP com até 5 MB.", "JPG, PNG or WEBP up to 5 MB.", "JPG, PNG o WEBP de hasta 5 MB.", "JPG、PNG 或 WEBP，最大 5 MB。", "JPG, PNG या WEBP, अधिकतम 5 MB।", "JPG أو PNG أو WEBP حتى 5 MB.", "JPG, PNG ou WEBP jusqu'à 5 Mo.", "JPG, PNG oder WEBP bis zu 5 MB."],
  ["Esses dados são salvos no Supabase.", "These details are saved in Supabase.", "Estos datos se guardan en Supabase.", "这些数据会保存在 Supabase 中。", "ये डेटा Supabase में सहेजे जाते हैं।", "يتم حفظ هذه البيانات في Supabase.", "Ces données sont enregistrées dans Supabase.", "Diese Daten werden in Supabase gespeichert."],
  ["Você também pode alterar sua foto de perfil aqui.", "You can also change your profile photo here.", "También puedes cambiar tu foto de perfil aquí.", "你也可以在这里更改头像。", "आप यहां अपनी प्रोफ़ाइल फोटो भी बदल सकते हैं।", "يمكنك أيضًا تغيير صورة ملفك الشخصي هنا.", "Vous pouvez également modifier votre photo de profil ici.", "Du kannst hier auch dein Profilbild ändern."],
  ["Conte como foi sua experiência com o produto...", "Tell us about your experience with the product...", "Cuéntanos cómo fue tu experiencia con el producto...", "说说你使用该商品的体验...", "उत्पाद के साथ अपने अनुभव के बारे में बताएं...", "أخبرنا عن تجربتك مع المنتج...", "Racontez-nous votre expérience avec le produit...", "Erzähle uns von deiner Erfahrung mit dem Produkt..."],
  ["Mínimo de 8 caracteres", "Minimum 8 characters", "Mínimo 8 caracteres", "至少 8 个字符", "कम से कम 8 अक्षर", "8 أحرف على الأقل", "8 caractères minimum", "Mindestens 8 Zeichen"],
  ["Digite a senha novamente", "Enter the password again", "Escribe la contraseña de nuevo", "再次输入密码", "पासवर्ड फिर दर्ज करें", "أدخل كلمة المرور مرة أخرى", "Saisissez à nouveau le mot de passe", "Passwort erneut eingeben"],
  ["Seu nome", "Your name", "Tu nombre", "你的姓名", "आपका नाम", "اسمك", "Votre nom", "Dein Name"],
  ["Sua senha", "Your password", "Tu contraseña", "你的密码", "आपका पासवर्ड", "كلمة مرورك", "Votre mot de passe", "Dein Passwort"],
  ["Explique o que aconteceu com o pedido, produto ou entrega...", "Explain what happened with the order, product or delivery...", "Explica qué ocurrió con el pedido, producto o entrega...", "请说明订单、商品或配送发生了什么...", "बताएं कि ऑर्डर, उत्पाद या डिलीवरी में क्या हुआ...", "اشرح ما حدث مع الطلب أو المنتج أو التسليم...", "Expliquez ce qui s'est passé avec la commande, le produit ou la livraison...", "Beschreibe, was mit Bestellung, Produkt oder Lieferung passiert ist..."],
  ["Digite uma mensagem para o suporte...", "Type a message to support...", "Escribe un mensaje para soporte...", "给客服输入消息...", "सपोर्ट के लिए संदेश लिखें...", "اكتب رسالة للدعم...", "Écrivez un message au support...", "Nachricht an den Support eingeben..."],
  ["Idioma / Language", "Language", "Idioma", "语言", "भाषा", "اللغة", "Langue", "Sprache"],
  ["Alterar foto ou avatar", "Change photo or avatar", "Cambiar foto o avatar", "更改照片或头像", "फोटो या अवतार बदलें", "تغيير الصورة أو الصورة الرمزية", "Changer la photo ou l'avatar", "Foto oder Avatar ändern"],
  ["Selecionar idioma", "Select language", "Seleccionar idioma", "选择语言", "भाषा चुनें", "اختيار اللغة", "Sélectionner la langue", "Sprache auswählen"],
  ["CEP de destino para cálculo do frete", "Destination postal code for shipping calculation", "Código postal de destino para calcular el envío", "用于计算运费的目的地邮编", "शिपिंग गणना के लिए गंतव्य पिन कोड", "الرمز البريدي للوجهة لحساب الشحن", "Code postal de destination pour calculer la livraison", "Ziel-Postleitzahl zur Versandberechnung"],
  ["Código Pix Copia e Cola", "Pix Copy and Paste code", "Código Pix Copia y Pega", "Pix 复制粘贴代码", "Pix कॉपी और पेस्ट कोड", "رمز Pix للنسخ واللصق", "Code Pix Copier-Coller", "Pix Copy-&-Paste-Code"],
  ["Fechar", "Close", "Cerrar", "关闭", "बंद करें", "إغلاق", "Fermer", "Schließen"],
  ["Nota da avaliação", "Review rating", "Puntuación de la reseña", "评价评分", "समीक्षा रेटिंग", "تقييم المراجعة", "Note de l'avis", "Bewertungsnote"],
  ["Remover foto", "Remove photo", "Eliminar foto", "移除照片", "फोटो हटाएं", "إزالة الصورة", "Supprimer la photo", "Foto entfernen"],
  ["Calculando frete", "Calculating shipping", "Calculando envío", "正在计算运费", "शिपिंग की गणना हो रही है", "جارٍ حساب الشحن", "Calcul de la livraison", "Versand wird berechnet"],
  ["Voltar para o início", "Back to home", "Volver al inicio", "返回首页", "होम पर वापस", "العودة إلى الرئيسية", "Retour à l'accueil", "Zurück zur Startseite"],
  ["Recuperação por e-mail", "Email recovery", "Recuperación por correo", "邮件恢复", "ईमेल रिकवरी", "الاسترداد عبر البريد الإلكتروني", "Récupération par e-mail", "Wiederherstellung per E-Mail"],

];

const INDEX = { "en-US": 1, "es-ES": 2, "zh-CN": 3, "hi-IN": 4, "ar-SA": 5, "fr-FR": 6, "de-DE": 7 };
const LOOKUP = new Map(rows.map((row) => [row[0], row]));


const PRODUCT_NAME_REPLACEMENTS = {
  "en-US": [
    ["mousepad gamer", "gaming mouse pad"],
    ["mouse gamer", "gaming mouse"],
    ["teclado gamer", "gaming keyboard"],
    ["headset gamer", "gaming headset"],
    ["monitor gamer", "gaming monitor"],
    ["controle gamer", "gaming controller"],
    ["controle sem fio", "wireless controller"],
    ["sem fio", "wireless"],
    ["com fio", "wired"],
    ["mecânico", "mechanical"],
    ["mecânico", "mechanical"],
    ["teclado", "keyboard"],
    ["mousepad", "mouse pad"],
    ["controle", "controller"],
    ["monitor", "monitor"],
    ["headset", "headset"],
    ["gamer", "gaming"],
    ["teste", "test"],
    ["velocidade", "speed"],
    ["preto", "black"],
    ["branco", "white"],
    ["vermelho", "red"],
    ["azul", "blue"],
  ],
  "es-ES": [
    ["mousepad gamer", "alfombrilla gaming"],
    ["mouse gamer", "ratón gaming"],
    ["teclado gamer", "teclado gaming"],
    ["headset gamer", "auriculares gaming"],
    ["monitor gamer", "monitor gaming"],
    ["controle gamer", "mando gaming"],
    ["controle sem fio", "mando inalámbrico"],
    ["sem fio", "inalámbrico"],
    ["com fio", "con cable"],
    ["mecânico", "mecánico"],
    ["mecânico", "mecánico"],
    ["teclado", "teclado"],
    ["mousepad", "alfombrilla"],
    ["controle", "mando"],
    ["monitor", "monitor"],
    ["headset", "auriculares"],
    ["gamer", "gaming"],
    ["teste", "prueba"],
    ["velocidade", "velocidad"],
    ["preto", "negro"],
    ["branco", "blanco"],
    ["vermelho", "rojo"],
    ["azul", "azul"],
  ],
  "zh-CN": [
    ["mousepad gamer", "游戏鼠标垫"],
    ["mouse gamer", "游戏鼠标"],
    ["teclado gamer", "游戏键盘"],
    ["headset gamer", "游戏耳机"],
    ["monitor gamer", "游戏显示器"],
    ["controle gamer", "游戏手柄"],
    ["controle sem fio", "无线手柄"],
    ["sem fio", "无线"],
    ["com fio", "有线"],
    ["mecânico", "机械"],
    ["mecânico", "机械"],
    ["teclado", "键盘"],
    ["mousepad", "鼠标垫"],
    ["controle", "手柄"],
    ["monitor", "显示器"],
    ["headset", "耳机"],
    ["gamer", "游戏"],
    ["teste", "测试"],
    ["velocidade", "速度"],
    ["preto", "黑色"],
    ["branco", "白色"],
    ["vermelho", "红色"],
    ["azul", "蓝色"],
  ],
  "hi-IN": [
    ["mousepad gamer", "गेमिंग माउसपैड"],
    ["mouse gamer", "गेमिंग माउस"],
    ["teclado gamer", "गेमिंग कीबोर्ड"],
    ["headset gamer", "गेमिंग हेडसेट"],
    ["monitor gamer", "गेमिंग मॉनिटर"],
    ["controle gamer", "गेमिंग कंट्रोलर"],
    ["controle sem fio", "वायरलेस कंट्रोलर"],
    ["sem fio", "वायरलेस"],
    ["com fio", "वायर्ड"],
    ["mecânico", "मैकेनिकल"],
    ["mecânico", "मैकेनिकल"],
    ["teclado", "कीबोर्ड"],
    ["mousepad", "माउसपैड"],
    ["controle", "कंट्रोलर"],
    ["monitor", "मॉनिटर"],
    ["headset", "हेडसेट"],
    ["gamer", "गेमिंग"],
    ["teste", "परीक्षण"],
    ["velocidade", "स्पीड"],
    ["preto", "काला"],
    ["branco", "सफेद"],
    ["vermelho", "लाल"],
    ["azul", "नीला"],
  ],
  "ar-SA": [
    ["mousepad gamer", "لوحة فأرة للألعاب"],
    ["mouse gamer", "فأرة ألعاب"],
    ["teclado gamer", "لوحة مفاتيح ألعاب"],
    ["headset gamer", "سماعة ألعاب"],
    ["monitor gamer", "شاشة ألعاب"],
    ["controle gamer", "وحدة تحكم ألعاب"],
    ["controle sem fio", "وحدة تحكم لاسلكية"],
    ["sem fio", "لاسلكي"],
    ["com fio", "سلكي"],
    ["mecânico", "ميكانيكي"],
    ["mecânico", "ميكانيكي"],
    ["teclado", "لوحة مفاتيح"],
    ["mousepad", "لوحة فأرة"],
    ["controle", "وحدة تحكم"],
    ["monitor", "شاشة"],
    ["headset", "سماعة"],
    ["gamer", "للألعاب"],
    ["teste", "اختبار"],
    ["velocidade", "سرعة"],
    ["preto", "أسود"],
    ["branco", "أبيض"],
    ["vermelho", "أحمر"],
    ["azul", "أزرق"],
  ],
  "fr-FR": [
    ["mousepad gamer", "tapis de souris gaming"],
    ["mouse gamer", "souris gaming"],
    ["teclado gamer", "clavier gaming"],
    ["headset gamer", "casque gaming"],
    ["monitor gamer", "écran gaming"],
    ["controle gamer", "manette gaming"],
    ["controle sem fio", "manette sans fil"],
    ["sem fio", "sans fil"],
    ["com fio", "filaire"],
    ["mecânico", "mécanique"],
    ["mecânico", "mécanique"],
    ["teclado", "clavier"],
    ["mousepad", "tapis de souris"],
    ["controle", "manette"],
    ["monitor", "écran"],
    ["headset", "casque"],
    ["gamer", "gaming"],
    ["teste", "test"],
    ["velocidade", "vitesse"],
    ["preto", "noir"],
    ["branco", "blanc"],
    ["vermelho", "rouge"],
    ["azul", "bleu"],
  ],
  "de-DE": [
    ["mousepad gamer", "Gaming-Mauspad"],
    ["mouse gamer", "Gaming-Maus"],
    ["teclado gamer", "Gaming-Tastatur"],
    ["headset gamer", "Gaming-Headset"],
    ["monitor gamer", "Gaming-Monitor"],
    ["controle gamer", "Gaming-Controller"],
    ["controle sem fio", "kabelloser Controller"],
    ["sem fio", "kabellos"],
    ["com fio", "kabelgebunden"],
    ["mecânico", "mechanisch"],
    ["mecânico", "mechanisch"],
    ["teclado", "Tastatur"],
    ["mousepad", "Mauspad"],
    ["controle", "Controller"],
    ["monitor", "Monitor"],
    ["headset", "Headset"],
    ["gamer", "Gaming"],
    ["teste", "Test"],
    ["velocidade", "Geschwindigkeit"],
    ["preto", "schwarz"],
    ["branco", "weiß"],
    ["vermelho", "rot"],
    ["azul", "blau"],
  ],
};

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function preserveProductCase(source, translated) {
  const original = String(source || "");
  if (!original) return translated;

  // Keep translations readable instead of forcing uppercase for scripts
  // where case does not exist.
  if (/^[A-ZÀ-Ý0-9\s\-_/]+$/.test(original) && /[A-Za-zÀ-ÿ]/.test(translated)) {
    return translated.toUpperCase();
  }

  if (
    original[0] === original[0]?.toUpperCase() &&
    original.slice(1) === original.slice(1).toLowerCase() &&
    /[A-Za-zÀ-ÿ]/.test(translated[0] || "")
  ) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  return translated;
}

export function translateProductName(value, language) {
  const raw = String(value ?? "");
  if (!raw || language === "pt-BR") return raw;

  const replacements = PRODUCT_NAME_REPLACEMENTS[language];
  if (!replacements?.length) return raw;

  let result = raw;

  for (const [source, translated] of replacements) {
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${escapeRegExp(source)})(?=$|[^\\p{L}\\p{N}])`,
      "giu"
    );

    result = result.replace(pattern, (match, prefix, matchedText) => {
      return `${prefix}${preserveProductCase(matchedText, translated)}`;
    });
  }

  return result;
}

export function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem("brothersGamesLanguage");
    if (LANGUAGES.some((item) => item.code === saved)) return saved;
  } catch {}

  const browser = String(navigator.language || navigator.languages?.[0] || "pt-BR").toLowerCase();
  if (browser.startsWith("en")) return "en-US";
  if (browser.startsWith("es")) return "es-ES";
  if (browser.startsWith("zh")) return "zh-CN";
  if (browser.startsWith("hi")) return "hi-IN";
  if (browser.startsWith("ar")) return "ar-SA";
  if (browser.startsWith("fr")) return "fr-FR";
  if (browser.startsWith("de")) return "de-DE";
  return "pt-BR";
}

export function languageMeta(code) {
  return LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];
}

export function translateUiText(value, language) {
  if (language === "pt-BR" || value === null || value === undefined) return String(value ?? "");
  const raw = String(value);
  const leading = raw.match(/^\s*/)?.[0] || "";
  const trailing = raw.match(/\s*$/)?.[0] || "";
  const core = raw.trim();
  if (!core) return raw;

  const row = LOOKUP.get(core);
  if (row) return `${leading}${row[INDEX[language]] || core}${trailing}`;

  // Dynamic counters and order labels.
  const productCount = core.match(/^(\d+) produtos encontrados$/i);
  if (productCount) {
    const n = productCount[1];
    const variants = {
      "en-US": `${n} products found`, "es-ES": `${n} productos encontrados`, "zh-CN": `找到 ${n} 个商品`,
      "hi-IN": `${n} उत्पाद मिले`, "ar-SA": `تم العثور على ${n} منتجات`, "fr-FR": `${n} produits trouvés`, "de-DE": `${n} Produkte gefunden`,
    };
    return `${leading}${variants[language] || core}${trailing}`;
  }

  const selectedProducts = core.match(/^(\d+)\s+(produto selecionado|produtos selecionados)\s+com preços especiais\.$/i);
  if (selectedProducts) {
    const n = Number(selectedProducts[1]);
    const variants = {
      "en-US": `${n} ${n === 1 ? "selected product" : "selected products"} with special prices.`,
      "es-ES": `${n} ${n === 1 ? "producto seleccionado" : "productos seleccionados"} con precios especiales.`,
      "zh-CN": `${n} 件精选商品享受特价。`,
      "hi-IN": `${n} चयनित ${n === 1 ? "उत्पाद" : "उत्पादों"} पर विशेष कीमतें।`,
      "ar-SA": `${n} ${n === 1 ? "منتج مختار" : "منتجات مختارة"} بأسعار خاصة.`,
      "fr-FR": `${n} ${n === 1 ? "produit sélectionné" : "produits sélectionnés"} à prix spécial.`,
      "de-DE": `${n} ${n === 1 ? "ausgewähltes Produkt" : "ausgewählte Produkte"} zu Sonderpreisen.`,
    };
    return `${leading}${variants[language] || core}${trailing}`;
  }

  const foundSuffix = core.match(/^produtos encontrados$/i);
  if (foundSuffix) {
    const variants = {
      "en-US": "products found", "es-ES": "productos encontrados", "zh-CN": "个商品",
      "hi-IN": "उत्पाद मिले", "ar-SA": "منتجات تم العثور عليها", "fr-FR": "produits trouvés", "de-DE": "Produkte gefunden",
    };
    return `${leading}${variants[language] || core}${trailing}`;
  }

  const orderNumber = core.match(/^Pedido\s+#(.+)$/i);
  if (orderNumber) {
    const id = orderNumber[1];
    const labels = { "en-US":"Order", "es-ES":"Pedido", "zh-CN":"订单", "hi-IN":"ऑर्डर", "ar-SA":"الطلب", "fr-FR":"Commande", "de-DE":"Bestellung" };
    return `${leading}${labels[language] || "Pedido"} #${id}${trailing}`;
  }

  return raw;
}

function shouldSkipTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) return true;
  if (parent.closest("[data-i18n-skip='true'], .admin-app")) return true;
  return false;
}

export function translateDom(root, language, textMemory, attrMemory) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!shouldSkipTextNode(node)) {
      const current = node.nodeValue || "";
      let state = textMemory.get(node);
      if (!state) {
        state = { source: current, last: current };
        textMemory.set(node, state);
      } else if (current !== state.last) {
        state.source = current;
      }

      const next = translateUiText(state.source, language);
      state.last = next;
      if (current !== next) node.nodeValue = next;
    }
    node = walker.nextNode();
  }

  const attributes = ["placeholder", "title", "aria-label"];
  root.querySelectorAll?.("*").forEach((element) => {
    if (element.closest?.("[data-i18n-skip=\"true\"], .admin-app")) return;
    let map = attrMemory.get(element);
    if (!map) {
      map = new Map();
      attrMemory.set(element, map);
    }

    attributes.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const current = element.getAttribute(attribute) || "";
      let state = map.get(attribute);
      if (!state) {
        state = { source: current, last: current };
        map.set(attribute, state);
      } else if (current !== state.last) {
        state.source = current;
      }

      const next = translateUiText(state.source, language);
      state.last = next;
      if (current !== next) element.setAttribute(attribute, next);
    });
  });
}
