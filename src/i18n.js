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


export const LANGUAGE_CONFIRMATIONS = {
  "pt-BR": {
    eyebrow: "IDIOMA DO SITE",
    title: "Alterar idioma?",
    message: "Deseja alterar o idioma do site para {language}?",
    cancel: "Cancelar",
    confirm: "Alterar idioma",
  },
  "en-US": {
    eyebrow: "SITE LANGUAGE",
    title: "Change language?",
    message: "Would you like to change the site language to {language}?",
    cancel: "Cancel",
    confirm: "Change language",
  },
  "es-ES": {
    eyebrow: "IDIOMA DEL SITIO",
    title: "¿Cambiar idioma?",
    message: "¿Deseas cambiar el idioma del sitio a {language}?",
    cancel: "Cancelar",
    confirm: "Cambiar idioma",
  },
  "zh-CN": {
    eyebrow: "网站语言",
    title: "更改语言？",
    message: "是否将网站语言更改为 {language}？",
    cancel: "取消",
    confirm: "更改语言",
  },
  "hi-IN": {
    eyebrow: "साइट की भाषा",
    title: "भाषा बदलें?",
    message: "क्या आप साइट की भाषा {language} में बदलना चाहते हैं?",
    cancel: "रद्द करें",
    confirm: "भाषा बदलें",
  },
  "ar-SA": {
    eyebrow: "لغة الموقع",
    title: "تغيير اللغة؟",
    message: "هل تريد تغيير لغة الموقع إلى {language}؟",
    cancel: "إلغاء",
    confirm: "تغيير اللغة",
  },
  "fr-FR": {
    eyebrow: "LANGUE DU SITE",
    title: "Changer de langue ?",
    message: "Souhaitez-vous changer la langue du site en {language} ?",
    cancel: "Annuler",
    confirm: "Changer la langue",
  },
  "de-DE": {
    eyebrow: "WEBSITE-SPRACHE",
    title: "Sprache ändern?",
    message: "Möchtest du die Sprache der Website auf {language} ändern?",
    cancel: "Abbrechen",
    confirm: "Sprache ändern",
  },
};

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
];

const INDEX = { "en-US": 1, "es-ES": 2, "zh-CN": 3, "hi-IN": 4, "ar-SA": 5, "fr-FR": 6, "de-DE": 7 };
const LOOKUP = new Map(rows.map((row) => [row[0], row]));

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
