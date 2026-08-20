import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { useSitePopup } from "./SitePopup";
import "./admin.css";

const SUCCESS_ORDER_STATUSES = ["paid", "processing", "completed"];

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function inputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function slugify(value) {
  return String(value || "produto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "produto";
}

function safeFileName(name) {
  const pieces = String(name || "imagem").split(".");
  const ext = pieces.length > 1 ? pieces.pop().toLowerCase() : "jpg";
  const base = slugify(pieces.join("."));
  return `${base}.${ext.replace(/[^a-z0-9]/g, "") || "jpg"}`;
}

function storagePathFromPublicUrl(url) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = String(url || "").indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(String(url).slice(index + marker.length));
}

function productImage(product) {
  return Array.isArray(product?.image_urls) && product.image_urls.length
    ? product.image_urls[0]
    : "";
}

function productDiscountPercent(product) {
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

function newProductForm() {
  return {
    id: null,
    slug: "",
    name: "",
    description: "",
    category: "Jogos",
    price: "",
    original_price: "",
    stock_quantity: "0",
    is_offer: false,
    delivery_type: "digital",
    shipping_weight_kg: "",
    shipping_width_cm: "",
    shipping_height_cm: "",
    shipping_length_cm: "",
    status: "active",
    publish_at: "",
    remove_at: "",
    existing_images: [],
    original_images: [],
  };
}

function newBulkRow() {
  return {
    key: crypto.randomUUID(),
    name: "",
    price: "",
    original_price: "",
    stock_quantity: "0",
    category: "Jogos",
    description: "",
    is_offer: false,
    publish_at: "",
    remove_at: "",
    files: [],
  };
}

function statusLabel(status) {
  const map = {
    active: "Ativo",
    suspended: "Suspenso",
    blocked: "Bloqueado",
    draft: "Rascunho",
    scheduled: "Agendado",
    archived: "Arquivado",
    pending_payment: "Aguardando pagamento",
    paid: "Pagamento aprovado",
    cancelled: "Cancelado",
    expired: "Expirado",
    processing: "Pagamento aprovado",
    completed: "Pagamento concluído",
    refunded: "Reembolsado",
  };
  return map[status] || status || "—";
}

function normalizedFulfillmentStatus(order) {
  if (!order) return "awaiting_payment";

  if (["cancelled", "expired", "refunded"].includes(order.status)) {
    return "cancelled";
  }

  if (order.fulfillment_status) return order.fulfillment_status;

  return SUCCESS_ORDER_STATUSES.includes(order.status)
    ? "preparing"
    : "awaiting_payment";
}

function fulfillmentLabel(order) {
  const map = {
    awaiting_payment: "Aguardando pagamento",
    preparing: "Preparando pedido",
    shipped: "Pedido enviado",
    delivered: "Entregue",
    cancelled: "Pedido encerrado",
  };

  return map[normalizedFulfillmentStatus(order)] || "Aguardando atualização";
}

export default function AdminPanel({
  currentUser,
  isOwner,
  theme = "dark",
  onToggleTheme,
  onBack,
  onProductsChanged,
}) {
  const {
    showSiteAlert,
    showSiteConfirm,
    showSiteLoading,
    hideSiteLoading,
    runWithSiteLoading,
  } = useSitePopup();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [melhorEnvioBusy, setMelhorEnvioBusy] = useState(false);
  const [melhorEnvioError, setMelhorEnvioError] = useState("");
  const [melhorEnvioStatus, setMelhorEnvioStatus] = useState(null);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orderEvents, setOrderEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [reviewSavingId, setReviewSavingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [managedOrderId, setManagedOrderId] = useState(null);
  const [fulfillmentSaving, setFulfillmentSaving] = useState(false);
  const [orderRefundSaving, setOrderRefundSaving] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [productQuickFilter, setProductQuickFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productMinPrice, setProductMinPrice] = useState("");
  const [productMaxPrice, setProductMaxPrice] = useState("");
  const [productSort, setProductSort] = useState("recent");

  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [productForm, setProductForm] = useState(newProductForm());
  const [productFiles, setProductFiles] = useState([]);
  const [savingProduct, setSavingProduct] = useState(false);

  // Garante que uma oferta nunca abra com o preço promocional ocupando
  // o lugar do preço original. Isso também corrige registros antigos.
  useEffect(() => {
    if (!productEditorOpen || !productForm.is_offer) return;
    if (productForm.original_price !== "" || productForm.price === "") return;

    setProductForm((current) => {
      if (!current.is_offer || current.original_price !== "" || current.price === "") {
        return current;
      }

      return {
        ...current,
        original_price: current.price,
        price: "",
      };
    });
  }, [productEditorOpen, productForm.is_offer]);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([newBulkRow()]);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [chartDays, setChartDays] = useState(30);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const key = "admin-form-action";
    let content = null;

    if (savingProduct) {
      content = {
        eyebrow: "CATÁLOGO",
        title: "Salvando o produto...",
        message: "Estamos enviando as imagens e atualizando as informações da loja.",
        status: "Atualizando catálogo",
        note: "Não feche o painel até a confirmação.",
      };
    } else if (bulkSaving) {
      content = {
        eyebrow: "CADASTRO EM MASSA",
        title: "Cadastrando os produtos...",
        message: "Estamos processando os itens e enviando as imagens selecionadas.",
        status: "Criando produtos",
        note: "O tempo pode variar conforme a quantidade de imagens.",
      };
    } else if (fulfillmentSaving) {
      content = {
        eyebrow: "GESTÃO DE PEDIDOS",
        title: "Atualizando a entrega...",
        message: "Estamos registrando o novo andamento e atualizando a área do cliente.",
        status: "Salvando andamento",
        note: "Aguarde até o painel ser atualizado.",
      };
    } else if (reviewSavingId) {
      content = {
        eyebrow: "MODERAÇÃO",
        title: "Moderando a avaliação...",
        message: "Estamos salvando a decisão e atualizando as avaliações públicas.",
        status: "Atualizando avaliação",
        note: "Aguarde a confirmação da operação.",
      };
    } else if (melhorEnvioBusy) {
      content = {
        eyebrow: "INTEGRAÇÕES",
        title: "Conectando ao Melhor Envio...",
        message: "Estamos preparando a autorização segura da transportadora.",
        status: "Abrindo conexão",
        note: "Você será encaminhado assim que estiver tudo pronto.",
      };
    }

    if (content) showSiteLoading(key, content);
    else hideSiteLoading(key);

    return () => hideSiteLoading(key);
  }, [
    bulkSaving,
    fulfillmentSaving,
    hideSiteLoading,
    melhorEnvioBusy,
    reviewSavingId,
    savingProduct,
    showSiteLoading,
  ]);

  useEffect(() => {
    void loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "integrations" && isOwner) void loadMelhorEnvioStatus();
  }, [activeTab, isOwner]);

  async function refreshAdminPanel() {
    await runWithSiteLoading(
      () => loadAllData(true),
      {
        eyebrow: "PAINEL ADMINISTRATIVO",
        title: "Atualizando o painel...",
        message: "Estamos buscando os dados mais recentes da loja no Supabase.",
        status: "Sincronizando informações",
        note: "Pedidos, clientes, produtos e avaliações serão atualizados.",
      }
    );
  }

  async function runAdminMutation(task, options = {}) {
    return runWithSiteLoading(
      async () => {
        try {
          const result = await task();

          if (options.successMessage) {
            showSiteAlert(options.successMessage, {
              title: options.successTitle || "Alteração concluída",
              variant: "success",
            });
          }

          return result;
        } catch (error) {
          console.error(error);
          showSiteAlert(error?.message || options.errorMessage || "Não foi possível concluir esta ação.");
          return null;
        }
      },
      options
    );
  }

  async function loadAllData(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setErrorMessage("");

    try {
      const [
        productsResult,
        ordersResult,
        orderItemsResult,
        orderEventsResult,
        eventsResult,
        usersResult,
        reviewsResult,
        reviewPhotosResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("order_items").select("*").limit(3000),
        supabase
          .from("order_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3000),
        supabase
          .from("product_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10000),
        supabase
          .from("profiles")
          .select("id,email,role,status,suspended_until,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("product_reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("review_photos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3000),
      ]);

      const results = [
        productsResult,
        ordersResult,
        orderItemsResult,
        orderEventsResult,
        eventsResult,
        usersResult,
        reviewsResult,
        reviewPhotosResult,
      ];

      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;

      setProducts(productsResult.data || []);
      setOrders(ordersResult.data || []);
      setOrderItems(orderItemsResult.data || []);
      setOrderEvents(orderEventsResult.data || []);
      setEvents(eventsResult.data || []);
      setUsers(usersResult.data || []);
      setReviews(reviewsResult.data || []);
      setReviewPhotos(reviewPhotosResult.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.message || "Não foi possível carregar o painel.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function uploadFiles(files, folder) {
    const urls = [];

    for (const file of files) {
      const path = `products/${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(
        file.name
      )}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function removeStorageUrls(urls) {
    const paths = urls.map(storagePathFromPublicUrl).filter(Boolean);
    if (!paths.length) return;

    const { error } = await supabase.storage
      .from("product-images")
      .remove(paths);

    if (error) console.error("Não foi possível limpar algumas imagens:", error);
  }

  function openNewProduct() {
    setProductForm(newProductForm());
    setProductFiles([]);
    setProductEditorOpen(true);
  }

  function openEditProduct(product) {
    const isOffer = Boolean(product.is_offer);
    const savedPrice =
      product.price === null || product.price === undefined
        ? ""
        : String(product.price);
    const savedOriginalPrice =
      product.original_price === null || product.original_price === undefined
        ? ""
        : String(product.original_price);

    // Compatibilidade com ofertas antigas que foram salvas sem preço original:
    // ao abrir a edição, o preço atual vira o preço original e o promocional
    // fica vazio para o administrador informar apenas o novo valor da oferta.
    const shouldRecoverOriginalPrice =
      isOffer && savedOriginalPrice === "" && savedPrice !== "";

    setProductForm({
      id: product.id,
      slug: product.slug || "",
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Outros",
      price: shouldRecoverOriginalPrice ? "" : savedPrice,
      original_price: shouldRecoverOriginalPrice
        ? savedPrice
        : savedOriginalPrice,
      stock_quantity: String(Math.max(0, Number(product.stock_quantity ?? 0) || 0)),
      is_offer: isOffer,
      delivery_type:
        product.delivery_type ||
        (String(product.category || "").trim().toLowerCase() === "jogos" ? "digital" : "physical"),
      shipping_weight_kg: product.shipping_weight_kg ?? "",
      shipping_width_cm: product.shipping_width_cm ?? "",
      shipping_height_cm: product.shipping_height_cm ?? "",
      shipping_length_cm: product.shipping_length_cm ?? "",
      status: product.status || "active",
      publish_at: toLocalInput(product.publish_at),
      remove_at: toLocalInput(product.remove_at),
      existing_images: Array.isArray(product.image_urls) ? product.image_urls : [],
      original_images: Array.isArray(product.image_urls) ? product.image_urls : [],
    });
    setProductFiles([]);
    setProductEditorOpen(true);
  }

  async function saveProduct(event) {
    event.preventDefault();

    const name = productForm.name.trim();
    const description = productForm.description.trim();
    const category = productForm.category.trim();
    const price = Number(productForm.price);
    const originalPrice =
      productForm.original_price === ""
        ? null
        : Number(productForm.original_price);
    const stockQuantity = Number(productForm.stock_quantity);
    const publishAt = inputToIso(productForm.publish_at);
    const removeAt = inputToIso(productForm.remove_at);
    const deliveryType = productForm.delivery_type === "physical" ? "physical" : "digital";
    const shippingWeight = Number(productForm.shipping_weight_kg);
    const shippingWidth = Number(productForm.shipping_width_cm);
    const shippingHeight = Number(productForm.shipping_height_cm);
    const shippingLength = Number(productForm.shipping_length_cm);

    if (!name || !category || !Number.isFinite(price) || price < 0) {
      showSiteAlert("Preencha nome, categoria e preço corretamente.", { variant: "warning" });
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      showSiteAlert("Informe uma quantidade de estoque válida (0 ou maior).", { variant: "warning" });
      return;
    }

    if (
      productForm.is_offer &&
      (!Number.isFinite(originalPrice) || originalPrice <= price)
    ) {
      showSiteAlert("Em uma oferta, o preço original precisa ser maior que o preço promocional.", { variant: "warning" });
      return;
    }

    if (
      deliveryType === "physical" &&
      (!Number.isFinite(shippingWeight) || shippingWeight <= 0 ||
        !Number.isFinite(shippingWidth) || shippingWidth <= 0 ||
        !Number.isFinite(shippingHeight) || shippingHeight <= 0 ||
        !Number.isFinite(shippingLength) || shippingLength <= 0)
    ) {
      showSiteAlert("Para produto físico, informe peso, largura, altura e comprimento para o cálculo de frete.", { variant: "warning" });
      return;
    }

    if (shippingWeight > 200 || shippingWidth > 300 || shippingHeight > 300 || shippingLength > 300) {
      showSiteAlert("Confira peso e dimensões do produto. Os valores informados parecem fora do limite esperado.", { variant: "warning" });
      return;
    }

    if (productForm.status === "scheduled" && !publishAt) {
      showSiteAlert("Para deixar o produto como agendado, informe a data de publicação.", { variant: "warning" });
      return;
    }

    if (publishAt && removeAt && new Date(removeAt) <= new Date(publishAt)) {
      showSiteAlert("A data de remoção precisa ser posterior à data de publicação.", { variant: "warning" });
      return;
    }

    setSavingProduct(true);

    try {
      const newImages = productFiles.length
        ? await uploadFiles(productFiles, productForm.id || crypto.randomUUID())
        : [];

      const finalImages = [...productForm.existing_images, ...newImages];
      let finalStatus = productForm.status;

      if (publishAt && new Date(publishAt).getTime() > Date.now()) {
        finalStatus = "scheduled";
      }

      const payload = {
        name,
        description,
        category,
        price,
        original_price: productForm.is_offer ? originalPrice : null,
        stock_quantity: stockQuantity,
        image_urls: finalImages,
        is_offer: Boolean(productForm.is_offer),
        delivery_type: deliveryType,
        shipping_weight_kg: deliveryType === "physical" ? shippingWeight : null,
        shipping_width_cm: deliveryType === "physical" ? shippingWidth : null,
        shipping_height_cm: deliveryType === "physical" ? shippingHeight : null,
        shipping_length_cm: deliveryType === "physical" ? shippingLength : null,
        status: finalStatus,
        publish_at: publishAt,
        remove_at: removeAt,
      };

      if (productForm.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productForm.id);

        if (error) throw error;

        const removedUrls = productForm.original_images.filter(
          (url) => !productForm.existing_images.includes(url)
        );
        await removeStorageUrls(removedUrls);
      } else {
        const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;

        const { error } = await supabase.from("products").insert({
          ...payload,
          slug,
          created_by: currentUser.id,
        });

        if (error) throw error;
      }

      setProductEditorOpen(false);
      setProductForm(newProductForm());
      setProductFiles([]);
      await loadAllData(true);
      await onProductsChanged?.();
      showSiteAlert(productForm.id ? "Produto atualizado." : "Produto criado.");
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível salvar o produto.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function archiveProduct(product) {
    const confirmed = await showSiteConfirm(
      `Arquivar ${product.name}? Ele deixará de aparecer na loja.`,
      {
        title: "Arquivar produto",
        confirmLabel: "ARQUIVAR",
        cancelLabel: "MANTER PRODUTO",
      }
    );
    if (!confirmed) return;

    await runAdminMutation(
      async () => {
        const { error } = await supabase
          .from("products")
          .update({ status: "archived" })
          .eq("id", product.id);

        if (error) throw error;
        await loadAllData(true);
        await onProductsChanged?.();
      },
      {
        eyebrow: "CATÁLOGO",
        title: "Arquivando o produto...",
        message: `${product.name} será removido da vitrine da loja.`,
        status: "Atualizando catálogo",
        successMessage: "Produto arquivado com sucesso.",
      }
    );
  }

  async function deleteProduct(product) {
    const confirmed = await showSiteConfirm(
      `Excluir permanentemente ${product.name}? Essa ação remove o cadastro do produto e não poderá ser desfeita.`,
      {
        title: "Excluir produto permanentemente?",
        confirmLabel: "EXCLUIR PRODUTO",
        cancelLabel: "CANCELAR",
        variant: "error",
      }
    );
    if (!confirmed) return;

    await runAdminMutation(
      async () => {
        const { error } = await supabase.from("products").delete().eq("id", product.id);
        if (error) throw error;

        await removeStorageUrls(Array.isArray(product.image_urls) ? product.image_urls : []);
        await loadAllData(true);
        await onProductsChanged?.();
      },
      {
        eyebrow: "CATÁLOGO",
        title: "Excluindo o produto...",
        message: `Estamos removendo ${product.name} e suas imagens.`,
        status: "Removendo cadastro",
        successMessage: "Produto excluído permanentemente.",
      }
    );
  }

  function updateBulkRow(key, field, value) {
    setBulkRows((rows) =>
      rows.map((row) => {
        if (row.key !== key) return row;

        if (field === "is_offer") {
          const isOffer = Boolean(value);

          return {
            ...row,
            is_offer: isOffer,
            original_price: isOffer ? (row.original_price || row.price) : "",
          };
        }

        return { ...row, [field]: value };
      })
    );
  }

  async function saveBulkProducts() {
    const validRows = bulkRows.filter((row) => row.name.trim());

    if (!validRows.length) {
      showSiteAlert("Adicione pelo menos um produto.", { variant: "warning" });
      return;
    }

    for (const row of validRows) {
      const rowPrice = Number(row.price);
      const rowOriginalPrice =
        row.original_price === ""
          ? null
          : Number(row.original_price);
      const rowStock = Number(row.stock_quantity);

      if (!Number.isFinite(rowPrice) || rowPrice < 0) {
        showSiteAlert(`Preço inválido em: ${row.name}`, { variant: "warning" });
        return;
      }

      if (!Number.isInteger(rowStock) || rowStock < 0) {
        showSiteAlert(`Estoque inválido em: ${row.name}`, { variant: "warning" });
        return;
      }

      if (
        row.is_offer &&
        (!Number.isFinite(rowOriginalPrice) || rowOriginalPrice <= rowPrice)
      ) {
        showSiteAlert(
          `Em uma oferta, o preço original precisa ser maior que o promocional: ${row.name}`
        );
        return;
      }
    }

    setBulkSaving(true);

    try {
      const batchId = Date.now();
      const payload = [];

      for (let index = 0; index < validRows.length; index += 1) {
        const row = validRows[index];
        const images = row.files.length
          ? await uploadFiles(row.files, `bulk-${batchId}-${index}`)
          : [];

        const publishAt = inputToIso(row.publish_at);
        const removeAt = inputToIso(row.remove_at);

        if (publishAt && removeAt && new Date(removeAt) <= new Date(publishAt)) {
          throw new Error(`Datas inválidas em: ${row.name}`);
        }

        payload.push({
          slug: `${slugify(row.name)}-${batchId}-${index + 1}`,
          name: row.name.trim(),
          description: row.description.trim(),
          category: row.category.trim() || "Outros",
          price: Number(row.price),
          original_price: row.is_offer ? Number(row.original_price) : null,
          stock_quantity: Number(row.stock_quantity),
          image_urls: images,
          is_offer: Boolean(row.is_offer),
          delivery_type:
            String(row.category || "").trim().toLowerCase() === "jogos"
              ? "digital"
              : "physical",
          shipping_weight_kg: null,
          shipping_width_cm: null,
          shipping_height_cm: null,
          shipping_length_cm: null,
          status:
            publishAt && new Date(publishAt).getTime() > Date.now()
              ? "scheduled"
              : "active",
          publish_at: publishAt,
          remove_at: removeAt,
          created_by: currentUser.id,
        });
      }

      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;

      setBulkRows([newBulkRow()]);
      setBulkOpen(false);
      await loadAllData(true);
      await onProductsChanged?.();
      showSiteAlert(`${payload.length} produto(s) cadastrado(s).`);
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível fazer o cadastro em massa.");
    } finally {
      setBulkSaving(false);
    }
  }

  async function publishNow(product) {
    await runAdminMutation(
      async () => {
        const { error } = await supabase
          .from("products")
          .update({ status: "active", publish_at: null })
          .eq("id", product.id);

        if (error) throw error;
        await loadAllData(true);
        await onProductsChanged?.();
      },
      {
        eyebrow: "AGENDAMENTO",
        title: "Publicando o produto...",
        message: `${product.name} ficará disponível na loja agora.`,
        status: "Publicando na vitrine",
        successMessage: "Produto publicado com sucesso.",
      }
    );
  }

  async function removeNow(product) {
    await runAdminMutation(
      async () => {
        const { error } = await supabase
          .from("products")
          .update({ status: "archived", remove_at: new Date().toISOString() })
          .eq("id", product.id);

        if (error) throw error;
        await loadAllData(true);
        await onProductsChanged?.();
      },
      {
        eyebrow: "AGENDAMENTO",
        title: "Removendo da vitrine...",
        message: `${product.name} deixará de aparecer para os clientes.`,
        status: "Atualizando publicação",
        successMessage: "Produto removido da vitrine.",
      }
    );
  }

  async function cancelSchedule(product) {
    await runAdminMutation(
      async () => {
        const nextStatus = product.status === "scheduled" ? "draft" : product.status;
        const { error } = await supabase
          .from("products")
          .update({ status: nextStatus, publish_at: null, remove_at: null })
          .eq("id", product.id);

        if (error) throw error;
        await loadAllData(true);
        await onProductsChanged?.();
      },
      {
        eyebrow: "AGENDAMENTO",
        title: "Cancelando o agendamento...",
        message: `Estamos removendo as datas programadas de ${product.name}.`,
        status: "Atualizando produto",
        successMessage: "Agendamento cancelado.",
      }
    );
  }

  async function moderateUser(user, status, days = null) {
    let suspendedUntil = null;

    if (status === "suspended") {
      suspendedUntil = new Date(Date.now() + days * 86400000).toISOString();
    }

    const actionLabels = {
      active: "Ativando a conta...",
      blocked: "Bloqueando a conta...",
      suspended: "Suspendendo a conta...",
    };

    await runAdminMutation(
      async () => {
        const { error } = await supabase.rpc("admin_set_user_status", {
          p_user_id: user.id,
          p_status: status,
          p_suspended_until: suspendedUntil,
        });

        if (error) throw error;
        await loadAllData(true);
      },
      {
        eyebrow: "GESTÃO DE CLIENTES",
        title: actionLabels[status] || "Atualizando a conta...",
        message: `Estamos alterando o acesso de ${user.email}.`,
        status: "Salvando permissão",
        successMessage: "Situação da conta atualizada.",
      }
    );
  }

  async function promoteAdmin() {
    if (!isOwner) return;

    const email = adminEmail.trim().toLowerCase();
    const target = users.find((item) => String(item.email).toLowerCase() === email);

    if (!target) {
      showSiteAlert("Não encontrei uma conta cadastrada com esse e-mail.", { variant: "warning" });
      return;
    }

    if (target.role === "owner") {
      showSiteAlert("Essa conta já é OWNER.", { variant: "warning" });
      return;
    }

    await runAdminMutation(
      async () => {
        const { error } = await supabase.rpc("owner_set_user_role", {
          p_user_id: target.id,
          p_role: "admin",
        });

        if (error) throw error;
        setAdminEmail("");
        await loadAllData(true);
      },
      {
        eyebrow: "PERMISSÕES",
        title: "Adicionando administrador...",
        message: `Estamos liberando o painel administrativo para ${target.email}.`,
        status: "Atualizando permissão",
        successMessage: "Novo administrador adicionado.",
      }
    );
  }

  async function removeAdmin(user) {
    if (!isOwner) return;
    const confirmed = await showSiteConfirm(
      `Remover o acesso administrativo de ${user.email}? A conta continuará funcionando como cliente.`,
      {
        title: "Remover administrador?",
        confirmLabel: "REMOVER ADMIN",
        cancelLabel: "CANCELAR",
        variant: "error",
      }
    );
    if (!confirmed) return;

    await runAdminMutation(
      async () => {
        const { error } = await supabase.rpc("owner_set_user_role", {
          p_user_id: user.id,
          p_role: "customer",
        });

        if (error) throw error;
        await loadAllData(true);
      },
      {
        eyebrow: "PERMISSÕES",
        title: "Removendo administrador...",
        message: `Estamos retirando o acesso administrativo de ${user.email}.`,
        status: "Atualizando permissão",
        successMessage: "Acesso administrativo removido.",
      }
    );
  }

  async function refundAndCancelPaidOrder(order) {
    if (!order?.id || orderRefundSaving) return;

    if (!SUCCESS_ORDER_STATUSES.includes(order.status)) {
      showSiteAlert("Somente pedidos com pagamento aprovado podem ser reembolsados por esta opção.", {
        variant: "warning",
      });
      return;
    }

    const orderLabel = `#${order.order_number || String(order.id).slice(0, 8)}`;
    const confirmed = await showSiteConfirm(
      `Cancelar ${orderLabel}? O pagamento de ${money(order.total)} será reembolsado integralmente pelo Mercado Pago e o pedido será encerrado.`,
      {
        title: "Cancelar pedido pago?",
        confirmLabel: "CANCELAR E REEMBOLSAR",
        cancelLabel: "VOLTAR",
        variant: "error",
      }
    );

    if (!confirmed) return;

    setOrderRefundSaving(true);

    try {
      await runAdminMutation(
        async () => {
          const { data, error } = await supabase.functions.invoke("admin-cancel-order", {
            body: { orderId: order.id },
          });

          if (error) {
            let message = error.message || "Não foi possível cancelar e reembolsar o pedido.";
            try {
              const body = await error.context?.json?.();
              if (body?.error) message = body.error;
            } catch {
              // Mantém a mensagem original da Edge Function.
            }
            throw new Error(message);
          }

          if (!data?.success) {
            throw new Error(data?.error || "O reembolso não foi confirmado.");
          }

          await loadAllData(true);
          setManagedOrderId(null);
          return data;
        },
        {
          eyebrow: "PEDIDOS",
          title: "Cancelando e reembolsando...",
          message: `Estamos solicitando o reembolso de ${money(order.total)} ao Mercado Pago.`,
          status: "Processando reembolso",
          note: "Não feche o painel até a confirmação do provedor de pagamento.",
          successTitle: "Pedido reembolsado",
          successMessage: `${orderLabel} foi cancelado e o reembolso foi confirmado.`,
        }
      );
    } finally {
      setOrderRefundSaving(false);
    }
  }

  async function updateOrderFulfillment(orderId, nextStatus) {
    if (!orderId || fulfillmentSaving) return;

    const allowed = ["preparing", "shipped", "delivered"];
    if (!allowed.includes(nextStatus)) {
      showSiteAlert("Status de entrega inválido.", { variant: "warning" });
      return;
    }

    setFulfillmentSaving(true);

    try {
      const { error } = await supabase.rpc("admin_set_order_fulfillment", {
        p_order_id: orderId,
        p_status: nextStatus,
      });

      if (error) throw error;

      await loadAllData(true);
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível atualizar o andamento do pedido.");
    } finally {
      setFulfillmentSaving(false);
    }
  }

  const orderById = useMemo(() => {
    return new Map(orders.map((order) => [order.id, order]));
  }, [orders]);

  const userById = useMemo(() => {
    return new Map(users.map((user) => [user.id, user]));
  }, [users]);

  const productById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const itemsByOrder = useMemo(() => {
    const map = new Map();
    for (const item of orderItems) {
      const list = map.get(item.order_id) || [];
      list.push(item);
      map.set(item.order_id, list);
    }
    return map;
  }, [orderItems]);

  const interactionsByOrder = useMemo(() => {
    const map = new Map();
    for (const event of orderEvents) {
      map.set(event.order_id, (map.get(event.order_id) || 0) + 1);
    }
    return map;
  }, [orderEvents]);

  const paidOrderIds = useMemo(() => {
    return new Set(
      orders
        .filter((order) => SUCCESS_ORDER_STATUSES.includes(order.status))
        .map((order) => order.id)
    );
  }, [orders]);

  const analyticsRows = useMemo(() => {
    const eventMap = new Map();
    for (const event of events) {
      const bucket = eventMap.get(event.product_id) || {
        view: 0,
        add_to_cart: 0,
        checkout_started: 0,
        purchase: 0,
      };
      bucket[event.event_type] = (bucket[event.event_type] || 0) + 1;
      eventMap.set(event.product_id, bucket);
    }

    const salesMap = new Map();
    for (const item of orderItems) {
      if (!paidOrderIds.has(item.order_id) || !item.product_id) continue;
      salesMap.set(
        item.product_id,
        (salesMap.get(item.product_id) || 0) + Number(item.quantity || 0)
      );
    }

    return products.map((product) => {
      const bucket = eventMap.get(product.id) || {
        view: 0,
        add_to_cart: 0,
        checkout_started: 0,
        purchase: 0,
      };
      const sales = salesMap.get(product.id) || 0;
      const conversion = bucket.view > 0 ? (sales / bucket.view) * 100 : 0;

      let performance = "red";
      if (sales >= 2 || (sales >= 1 && conversion >= 5)) performance = "green";
      else if (bucket.view >= 10 && sales <= 1) performance = "yellow";
      else if (sales > 0) performance = "yellow";

      return {
        product,
        views: bucket.view,
        carts: bucket.add_to_cart,
        checkouts: bucket.checkout_started,
        purchases: sales,
        conversion,
        performance,
      };
    });
  }, [events, orderItems, paidOrderIds, products]);

  const successfulOrders = useMemo(
    () => orders.filter((order) => SUCCESS_ORDER_STATUSES.includes(order.status)),
    [orders]
  );

  const revenue = useMemo(
    () => successfulOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [successfulOrders]
  );

  const totalViews = useMemo(
    () => events.filter((event) => event.event_type === "view").length,
    [events]
  );

  const chartData = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = chartDays - 1; offset >= 0; offset -= 1) {
      const start = new Date(today);
      start.setDate(today.getDate() - offset);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      const value = successfulOrders
        .filter((order) => {
          const when = new Date(order.paid_at || order.created_at);
          return when >= start && when < end;
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      result.push({
        key: start.toISOString().slice(0, 10),
        label: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value,
      });
    }

    return result;
  }, [chartDays, successfulOrders]);

  const chartMax = Math.max(1, ...chartData.map((item) => item.value));

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderFilter === "all" || order.status === orderFilter;
      const email = userById.get(order.customer_id)?.email || "";
      const matchesSearch =
        !term ||
        String(order.order_number || order.id).toLowerCase().includes(term) ||
        String(email).toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch, userById]);

  const productCategories = useMemo(() => {
    return [...new Set(
      products
        .map((product) => String(product.category || "").trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);

  const productFilterCounts = useMemo(() => {
    return {
      all: products.length,
      offers: products.filter((product) => Boolean(product.is_offer)).length,
      active: products.filter((product) => product.status === "active").length,
      scheduled: products.filter((product) => product.status === "scheduled").length,
      draft: products.filter((product) => product.status === "draft").length,
      archived: products.filter((product) => product.status === "archived").length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    const minPrice =
      productMinPrice === "" ? null : Number(productMinPrice);
    const maxPrice =
      productMaxPrice === "" ? null : Number(productMaxPrice);

    let result = products.filter((product) => {
      const searchableText = `
        ${product.name || ""}
        ${product.description || ""}
        ${product.category || ""}
        ${product.slug || ""}
      `.toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      const matchesQuickFilter =
        productQuickFilter === "all" ||
        (productQuickFilter === "offers" && Boolean(product.is_offer)) ||
        (productQuickFilter !== "offers" && product.status === productQuickFilter);

      const matchesCategory =
        productCategoryFilter === "all" ||
        product.category === productCategoryFilter;

      const price = Number(product.price || 0);
      const matchesMin =
        minPrice === null || !Number.isFinite(minPrice) || price >= minPrice;
      const matchesMax =
        maxPrice === null || !Number.isFinite(maxPrice) || price <= maxPrice;

      return (
        matchesSearch &&
        matchesQuickFilter &&
        matchesCategory &&
        matchesMin &&
        matchesMax
      );
    });

    if (productSort === "name") {
      result = [...result].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "pt-BR")
      );
    }

    if (productSort === "price-low") {
      result = [...result].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    }

    if (productSort === "price-high") {
      result = [...result].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    }

    if (productSort === "discount") {
      result = [...result].sort(
        (a, b) => productDiscountPercent(b) - productDiscountPercent(a)
      );
    }

    if (productSort === "recent") {
      result = [...result].sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });
    }

    return result;
  }, [
    products,
    productSearch,
    productQuickFilter,
    productCategoryFilter,
    productMinPrice,
    productMaxPrice,
    productSort,
  ]);

  const hasActiveProductFilters =
    productSearch.trim() !== "" ||
    productQuickFilter !== "all" ||
    productCategoryFilter !== "all" ||
    productMinPrice !== "" ||
    productMaxPrice !== "" ||
    productSort !== "recent";

  function clearProductFilters() {
    setProductSearch("");
    setProductQuickFilter("all");
    setProductCategoryFilter("all");
    setProductMinPrice("");
    setProductMaxPrice("");
    setProductSort("recent");
  }

  const scheduledProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "scheduled" || product.publish_at || product.remove_at
      ),
    [products]
  );

  const customers = useMemo(
    () => users.filter((user) => user.role === "customer"),
    [users]
  );

  const admins = useMemo(
    () => users.filter((user) => ["admin", "owner"].includes(user.role)),
    [users]
  );

  function renderDashboard() {
    const activeProducts = products.filter((product) => product.status === "active").length;
    const pendingOrders = orders.filter((order) => order.status === "pending_payment").length;

    return (
      <>
        <div className="admin-heading">
          <div>
            <span>VISÃO GERAL</span>
            <h1>Dashboard</h1>
            <p>Resumo dos dados reais disponíveis no Supabase.</p>
          </div>
        </div>

        <div className="admin-stat-grid">
          <article className="admin-stat-card">
            <span>RECEITA CONFIRMADA</span>
            <strong>{money(revenue)}</strong>
            <small>{successfulOrders.length} pedido(s) pago(s)/concluído(s)</small>
          </article>
          <article className="admin-stat-card">
            <span>PEDIDOS</span>
            <strong>{orders.length}</strong>
            <small>{pendingOrders} aguardando pagamento</small>
          </article>
          <article className="admin-stat-card">
            <span>PRODUTOS ATIVOS</span>
            <strong>{activeProducts}</strong>
            <small>{products.length} cadastrados no total</small>
          </article>
          <article className="admin-stat-card">
            <span>VISUALIZAÇÕES</span>
            <strong>{totalViews}</strong>
            <small>eventos de visualização registrados</small>
          </article>
        </div>

        <section className="admin-card">
          <div className="admin-card-title admin-card-title-row">
            <div>
              <span>VENDAS</span>
              <h2>Receita por dia</h2>
            </div>
            <div className="admin-period-buttons">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  className={chartDays === days ? "active" : ""}
                  onClick={() => setChartDays(days)}
                >
                  {days} dias
                </button>
              ))}
            </div>
          </div>

          <div className="admin-chart" aria-label="Gráfico de receita por dia">
            {chartData.map((item) => (
              <div className="admin-chart-column" key={item.key} title={`${item.label}: ${money(item.value)}`}>
                <div className="admin-chart-track">
                  <i style={{ height: `${Math.max(2, (item.value / chartMax) * 100)}%` }} />
                </div>
                {chartDays <= 30 && <small>{item.label}</small>}
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-title">
            <span>DESEMPENHO</span>
            <h2>Produtos em destaque</h2>
          </div>
          <div className="admin-performance-list">
            {[...analyticsRows]
              .sort((a, b) => b.views + b.purchases * 20 - (a.views + a.purchases * 20))
              .slice(0, 6)
              .map((row) => (
                <div className="admin-performance-row" key={row.product.id}>
                  <span className={`performance-dot ${row.performance}`}>
                    {row.performance === "green" ? "✅" : row.performance === "yellow" ? "🟡" : "❌"}
                  </span>
                  <div>
                    <strong>{row.product.name}</strong>
                    <small>{row.views} views · {row.purchases} venda(s)</small>
                  </div>
                  <b>{row.conversion.toFixed(1)}%</b>
                </div>
              ))}
          </div>
        </section>
      </>
    );
  }

  function renderOrders() {
    return (
      <>
        <div className="admin-heading">
          <div>
            <span>COMERCIAL</span>
            <h1>Pedidos e vendas</h1>
            <p>Acompanhe pagamentos e atualize o andamento de entrega dos pedidos.</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            value={orderSearch}
            onChange={(event) => setOrderSearch(event.target.value)}
            placeholder="Buscar por pedido ou e-mail..."
          />
          <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}>
            <option value="all">Todos os status</option>
            <option value="pending_payment">Aguardando pagamento</option>
            <option value="paid">Pagamento aprovado</option>
            <option value="processing">Pagamento aprovado</option>
            <option value="completed">Pagamento concluído</option>
            <option value="cancelled">Cancelado</option>
            <option value="expired">Expirado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>

        <div className="admin-order-list">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty">Nenhum pedido encontrado.</div>
          ) : (
            filteredOrders.map((order) => {
              const items = itemsByOrder.get(order.id) || [];
              const customerEmail = userById.get(order.customer_id)?.email || "E-mail indisponível";
              const fulfillment = normalizedFulfillmentStatus(order);

              return (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-top">
                    <div>
                      <span>PEDIDO</span>
                      <strong>#{order.order_number || String(order.id).slice(0, 8)}</strong>
                    </div>

                    <div className="admin-order-status-group">
                      <span className={`admin-status ${order.status}`}>
                        {statusLabel(order.status)}
                      </span>
                      <span className={`admin-fulfillment-badge ${fulfillment}`}>
                        {fulfillmentLabel(order)}
                      </span>
                    </div>
                  </div>

                  <div className="admin-order-meta">
                    <span>{customerEmail}</span>
                    <span>{dateTime(order.created_at)}</span>
                    <span>
                      {order.payment_method === "pix"
                        ? "PIX"
                        : order.payment_method === "card"
                          ? "Cartão de crédito"
                          : "Pagamento não informado"}
                    </span>
                    <span>{interactionsByOrder.get(order.id) || 0} interação(ões)</span>
                  </div>

                  <div className="admin-order-items">
                    {items.length === 0 ? (
                      <small>Sem itens registrados.</small>
                    ) : (
                      items.map((item) => (
                        <div key={item.id}>
                          <span>{item.quantity}x {item.product_name}</span>
                          <strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="admin-order-total">
                    <span>Total</span>
                    <strong>{money(order.total)}</strong>
                  </div>

                  <div className="admin-order-actions">
                    <button type="button" onClick={() => setManagedOrderId(order.id)}>
                      GERENCIAR PEDIDO
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderOrderManager() {
    if (!managedOrderId) return null;

    const order = orders.find((item) => item.id === managedOrderId);
    if (!order) return null;

    const items = itemsByOrder.get(order.id) || [];
    const customerEmail = userById.get(order.customer_id)?.email || "E-mail indisponível";
    const paid = SUCCESS_ORDER_STATUSES.includes(order.status);
    const currentFulfillment = normalizedFulfillmentStatus(order);

    return (
      <div className="admin-modal-overlay" onClick={() => setManagedOrderId(null)}>
        <div className="admin-modal admin-order-manager-modal" onClick={(event) => event.stopPropagation()}>
          <div className="admin-modal-header">
            <div>
              <span>GERENCIAR PEDIDO</span>
              <h2>#{order.order_number || String(order.id).slice(0, 8)}</h2>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setManagedOrderId(null)}
            >
              ×
            </button>
          </div>

          <div className="admin-order-manager-summary">
            <div>
              <span>CLIENTE</span>
              <strong>{customerEmail}</strong>
            </div>
            <div>
              <span>PAGAMENTO</span>
              <strong>{statusLabel(order.status)}</strong>
            </div>
            <div>
              <span>ANDAMENTO</span>
              <strong>{fulfillmentLabel(order)}</strong>
            </div>
            <div>
              <span>TOTAL</span>
              <strong>{money(order.total)}</strong>
            </div>
          </div>

          <div className="admin-order-manager-items">
            <span>ITENS</span>
            {items.map((item) => (
              <div key={item.id}>
                <span>{item.quantity}x {item.product_name}</span>
                <strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong>
              </div>
            ))}
          </div>

          {paid ? (
            <div className="admin-fulfillment-editor">
              <span>ATUALIZAR ANDAMENTO</span>
              <p>
                A alteração aparece para o cliente em “Acompanhar pedido”.
              </p>

              <div className="admin-fulfillment-buttons">
                {[
                  ["preparing", "Preparando pedido"],
                  ["shipped", "Pedido enviado"],
                  ["delivered", "Entregue"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={currentFulfillment === value ? "active" : ""}
                    disabled={fulfillmentSaving}
                    onClick={() => updateOrderFulfillment(order.id, value)}
                  >
                    <span>
                      {value === "preparing" ? "01" : value === "shipped" ? "02" : "03"}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-order-payment-warning">
              {["refunded", "cancelled", "expired"].includes(order.status)
                ? order.status === "refunded"
                  ? "Pedido reembolsado e encerrado."
                  : "Pedido encerrado."
                : "O andamento da entrega será liberado quando o pagamento estiver aprovado."}
            </div>
          )}

          <div className="admin-modal-actions">
            {paid && (
              <button
                type="button"
                className="admin-danger-button"
                disabled={orderRefundSaving || fulfillmentSaving}
                onClick={() => refundAndCancelPaidOrder(order)}
              >
                {orderRefundSaving ? "REEMBOLSANDO..." : "CANCELAR PEDIDO E REEMBOLSAR"}
              </button>
            )}

            <button
              type="button"
              className="admin-secondary"
              disabled={orderRefundSaving}
              onClick={() => setManagedOrderId(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderProductEditor() {
    if (!productEditorOpen) return null;

    return (
      <div className="admin-modal-overlay" onClick={() => setProductEditorOpen(false)}>
        <form className="admin-modal" onSubmit={saveProduct} onClick={(event) => event.stopPropagation()}>
          <div className="admin-modal-header">
            <div>
              <span>{productForm.id ? "EDITAR" : "NOVO"}</span>
              <h2>{productForm.id ? "Editar produto" : "Cadastrar produto"}</h2>
            </div>
            <button type="button" className="admin-icon-button" onClick={() => setProductEditorOpen(false)}>×</button>
          </div>

          <div className="admin-form-grid">
            <label className="admin-field admin-field-wide">
              <span>Nome *</span>
              <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="admin-field">
              <span>{productForm.is_offer ? "Preço promocional *" : "Preço *"}</span>
              <input type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
            </label>
            <label className="admin-field">
              <span>Preço original {productForm.is_offer ? "*" : ""}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.original_price}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    original_price: event.target.value,
                  }))
                }
                disabled={!productForm.is_offer}
                placeholder={productForm.is_offer ? "Ex.: 100,00" : "Marque como oferta"}
              />
              <small>Usado para calcular automaticamente a porcentagem de desconto.</small>
            </label>
            <label className="admin-field">
              <span>Categoria *</span>
              <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} />
            </label>
            <label className="admin-field">
              <span>Quantidade em estoque *</span>
              <input
                type="number"
                min="0"
                step="1"
                value={productForm.stock_quantity}
                onChange={(event) => setProductForm((current) => ({ ...current, stock_quantity: event.target.value }))}
                placeholder="Ex.: 10"
              />
              <small>Use 0 para produto esgotado. O cliente não poderá comprar acima desta quantidade.</small>
            </label>
            <label className="admin-field">
              <span>Tipo de entrega *</span>
              <select
                value={productForm.delivery_type}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    delivery_type: event.target.value,
                    ...(event.target.value === "digital"
                      ? {
                          shipping_weight_kg: "",
                          shipping_width_cm: "",
                          shipping_height_cm: "",
                          shipping_length_cm: "",
                        }
                      : {}),
                  }))
                }
              >
                <option value="digital">Digital — sem frete</option>
                <option value="physical">Físico — calcular frete</option>
              </select>
            </label>

            {productForm.delivery_type === "physical" && (
              <div className="admin-shipping-fields admin-field-wide">
                <div className="admin-shipping-fields-heading">
                  <span>🚚</span>
                  <div>
                    <strong>Dados para cálculo de frete</strong>
                    <small>Informe as medidas do produto já considerando a embalagem individual.</small>
                  </div>
                </div>
                <div className="admin-shipping-fields-grid">
                  <label className="admin-field">
                    <span>Peso (kg) *</span>
                    <input type="number" min="0.001" max="200" step="0.001" value={productForm.shipping_weight_kg} onChange={(event) => setProductForm((current) => ({ ...current, shipping_weight_kg: event.target.value }))} placeholder="Ex.: 0.350" />
                  </label>
                  <label className="admin-field">
                    <span>Largura (cm) *</span>
                    <input type="number" min="0.1" max="300" step="0.1" value={productForm.shipping_width_cm} onChange={(event) => setProductForm((current) => ({ ...current, shipping_width_cm: event.target.value }))} placeholder="Ex.: 15" />
                  </label>
                  <label className="admin-field">
                    <span>Altura (cm) *</span>
                    <input type="number" min="0.1" max="300" step="0.1" value={productForm.shipping_height_cm} onChange={(event) => setProductForm((current) => ({ ...current, shipping_height_cm: event.target.value }))} placeholder="Ex.: 8" />
                  </label>
                  <label className="admin-field">
                    <span>Comprimento (cm) *</span>
                    <input type="number" min="0.1" max="300" step="0.1" value={productForm.shipping_length_cm} onChange={(event) => setProductForm((current) => ({ ...current, shipping_length_cm: event.target.value }))} placeholder="Ex.: 20" />
                  </label>
                </div>
              </div>
            )}

            <label className="admin-field admin-field-wide">
              <span>Descrição</span>
              <textarea rows="6" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select value={productForm.status} onChange={(event) => setProductForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendado</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
            <label className="admin-check-field">
              <input
                type="checkbox"
                checked={productForm.is_offer}
                onChange={(event) => {
                  const isOffer = event.target.checked;

                  setProductForm((current) => {
                    if (isOffer) {
                      return {
                        ...current,
                        is_offer: true,
                        original_price: current.price,
                        price: "",
                      };
                    }

                    return {
                      ...current,
                      is_offer: false,
                      price: current.original_price || current.price,
                      original_price: "",
                    };
                  });
                }}
              />
              <span>Marcar como oferta</span>
            </label>
            <label className="admin-field">
              <span>Publicar em</span>
              <input type="datetime-local" value={productForm.publish_at} onChange={(event) => setProductForm((current) => ({ ...current, publish_at: event.target.value }))} />
            </label>
            <label className="admin-field">
              <span>Remover em</span>
              <input type="datetime-local" value={productForm.remove_at} onChange={(event) => setProductForm((current) => ({ ...current, remove_at: event.target.value }))} />
            </label>
            <label className="admin-field admin-field-wide">
              <span>Adicionar imagens</span>
              <input type="file" accept="image/*" multiple onChange={(event) => setProductFiles(Array.from(event.target.files || []))} />
              <small>Você pode selecionar várias imagens.</small>
            </label>
          </div>

          {productForm.existing_images.length > 0 && (
            <div className="admin-existing-images">
              {productForm.existing_images.map((url) => (
                <div key={url}>
                  <img src={url} alt="Produto" />
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm((current) => ({
                        ...current,
                        existing_images: current.existing_images.filter((item) => item !== url),
                      }))
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary" onClick={() => setProductEditorOpen(false)}>Cancelar</button>
            <button type="submit" className="admin-primary" disabled={savingProduct}>{savingProduct ? "Salvando..." : "Salvar produto"}</button>
          </div>
        </form>
      </div>
    );
  }

  function renderBulkEditor() {
    if (!bulkOpen) return null;

    return (
      <div className="admin-modal-overlay" onClick={() => setBulkOpen(false)}>
        <div className="admin-modal admin-modal-large" onClick={(event) => event.stopPropagation()}>
          <div className="admin-modal-header">
            <div>
              <span>CADASTRO EM MASSA</span>
              <h2>Adicionar vários produtos</h2>
            </div>
            <button type="button" className="admin-icon-button" onClick={() => setBulkOpen(false)}>×</button>
          </div>

          <div className="bulk-products">
            {bulkRows.map((row, index) => (
              <article className="bulk-product-row" key={row.key}>
                <div className="bulk-product-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="admin-form-grid">
                  <label className="admin-field admin-field-wide"><span>Nome *</span><input value={row.name} onChange={(event) => updateBulkRow(row.key, "name", event.target.value)} /></label>
                  <label className="admin-field"><span>{row.is_offer ? "Preço promocional *" : "Preço *"}</span><input type="number" min="0" step="0.01" value={row.price} onChange={(event) => updateBulkRow(row.key, "price", event.target.value)} /></label>
                  <label className="admin-field"><span>Preço original {row.is_offer ? "*" : ""}</span><input type="number" min="0" step="0.01" value={row.original_price} disabled={!row.is_offer} placeholder={row.is_offer ? "Ex.: 100,00" : "Marque como oferta"} onChange={(event) => updateBulkRow(row.key, "original_price", event.target.value)} /></label>
                  <label className="admin-field"><span>Categoria</span><input value={row.category} onChange={(event) => updateBulkRow(row.key, "category", event.target.value)} /></label>
                  <label className="admin-field"><span>Estoque *</span><input type="number" min="0" step="1" value={row.stock_quantity} onChange={(event) => updateBulkRow(row.key, "stock_quantity", event.target.value)} /></label>
                  <label className="admin-field admin-field-wide"><span>Descrição</span><textarea rows="3" value={row.description} onChange={(event) => updateBulkRow(row.key, "description", event.target.value)} /></label>
                  <label className="admin-field"><span>Publicar em</span><input type="datetime-local" value={row.publish_at} onChange={(event) => updateBulkRow(row.key, "publish_at", event.target.value)} /></label>
                  <label className="admin-field"><span>Remover em</span><input type="datetime-local" value={row.remove_at} onChange={(event) => updateBulkRow(row.key, "remove_at", event.target.value)} /></label>
                  <label className="admin-field admin-field-wide"><span>Imagens</span><input type="file" accept="image/*" multiple onChange={(event) => updateBulkRow(row.key, "files", Array.from(event.target.files || []))} /></label>
                  <label className="admin-check-field"><input type="checkbox" checked={row.is_offer} onChange={(event) => {
                    const isOffer = event.target.checked;
                    setBulkRows((rows) =>
                      rows.map((item) => {
                        if (item.key !== row.key) return item;

                        if (isOffer) {
                          return {
                            ...item,
                            is_offer: true,
                            original_price: item.price,
                            price: "",
                          };
                        }

                        return {
                          ...item,
                          is_offer: false,
                          price: item.original_price || item.price,
                          original_price: "",
                        };
                      })
                    );
                  }} /><span>Oferta</span></label>
                </div>
                {bulkRows.length > 1 && (
                  <button className="bulk-remove" type="button" onClick={() => setBulkRows((rows) => rows.filter((item) => item.key !== row.key))}>Remover linha</button>
                )}
              </article>
            ))}
          </div>

          <div className="bulk-footer">
            <button type="button" className="admin-secondary" onClick={() => setBulkRows((rows) => [...rows, newBulkRow()])}>+ Adicionar outro produto</button>
            <button type="button" className="admin-primary" onClick={saveBulkProducts} disabled={bulkSaving}>{bulkSaving ? "Cadastrando..." : `Cadastrar ${bulkRows.filter((row) => row.name.trim()).length} produto(s)`}</button>
          </div>
        </div>
      </div>
    );
  }

  function reviewPhotoUrl(path) {
    if (!path) return "";
    const { data } = supabase.storage.from("review-images").getPublicUrl(path);
    return data?.publicUrl || "";
  }

  function reviewStatusText(status) {
    const labels = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Rejeitada",
    };
    return labels[status] || "Pendente";
  }

  async function moderateReview(review, nextStatus) {
    if (!review?.id || reviewSavingId) return;

    setReviewSavingId(review.id);

    try {
      const { error } = await supabase.rpc("admin_set_review_status", {
        p_review_id: review.id,
        p_status: nextStatus,
        p_note: String(reviewNotes[review.id] || "").trim() || null,
      });

      if (error) throw error;
      await loadAllData(true);
    } catch (error) {
      console.error(error);
      showSiteAlert(error?.message || "Não foi possível moderar a avaliação.");
    } finally {
      setReviewSavingId(null);
    }
  }

  function renderReviews() {
    const filtered = reviews.filter((review) =>
      reviewFilter === "all"
        ? true
        : (review.moderation_status || "pending") === reviewFilter
    );

    const pendingCount = reviews.filter(
      (review) => (review.moderation_status || "pending") === "pending"
    ).length;

    return (
      <>
        <div className="admin-page-title">
          <div>
            <span>MODERAÇÃO</span>
            <h1>Avaliações</h1>
            <p>Aprove somente avaliações adequadas. Fotos e comentários ficam pendentes até sua decisão.</p>
          </div>
          <button className="admin-refresh-button" onClick={refreshAdminPanel} disabled={refreshing}>
            {refreshing ? "ATUALIZANDO..." : "ATUALIZAR"}
          </button>
        </div>

        <section className="admin-review-summary">
          <div><span>PENDENTES</span><strong>{pendingCount}</strong></div>
          <div><span>TOTAL</span><strong>{reviews.length}</strong></div>
          <div><span>PUBLICADAS</span><strong>{reviews.filter((review) => review.moderation_status === "approved").length}</strong></div>
        </section>

        <div className="admin-review-filters">
          {[
            ["pending", "Pendentes"],
            ["approved", "Aprovadas"],
            ["rejected", "Rejeitadas"],
            ["all", "Todas"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={reviewFilter === value ? "active" : ""}
              onClick={() => setReviewFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-review-list">
          {filtered.length === 0 ? (
            <div className="admin-empty">Nenhuma avaliação neste filtro.</div>
          ) : (
            filtered.map((review) => {
              const product = productById.get(review.product_id);
              const order = orderById.get(review.order_id);
              const user = userById.get(review.user_id);
              const photos = reviewPhotos.filter((photo) => photo.review_id === review.id);
              const status = review.moderation_status || "pending";

              return (
                <article className="admin-review-card" key={review.id}>
                  <div className="admin-review-card-top">
                    <div>
                      <span>{product?.name || "Produto removido"}</span>
                      <strong>{"★".repeat(Number(review.rating || 0))}{"☆".repeat(Math.max(0, 5 - Number(review.rating || 0)))}</strong>
                    </div>
                    <span className={`admin-review-status ${status}`}>{reviewStatusText(status)}</span>
                  </div>

                  <div className="admin-review-meta">
                    <span>Cliente: {user?.email || "E-mail indisponível"}</span>
                    <span>Pedido: #{order?.order_number || String(review.order_id || "").slice(0, 8) || "—"}</span>
                    <span>{new Date(review.updated_at || review.created_at).toLocaleString("pt-BR")}</span>
                  </div>

                  <p className="admin-review-comment">{review.comment || "Sem comentário."}</p>

                  {photos.length > 0 && (
                    <div className="admin-review-photos">
                      {photos.map((photo) => {
                        const url = reviewPhotoUrl(photo.storage_path);
                        return (
                          <a key={photo.id} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="Foto da avaliação" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {review.moderation_note && (
                    <div className="admin-review-existing-note">
                      <strong>Observação atual:</strong> {review.moderation_note}
                    </div>
                  )}

                  <label className="admin-review-note-field">
                    <span>OBSERVAÇÃO PARA O CLIENTE (OPCIONAL)</span>
                    <textarea
                      value={reviewNotes[review.id] || ""}
                      onChange={(event) =>
                        setReviewNotes((current) => ({
                          ...current,
                          [review.id]: event.target.value,
                        }))
                      }
                      placeholder="Ex.: remova uma foto inadequada e envie novamente."
                      maxLength={500}
                    />
                  </label>

                  <div className="admin-review-actions">
                    <button
                      type="button"
                      className="admin-review-reject"
                      onClick={() => moderateReview(review, "rejected")}
                      disabled={reviewSavingId === review.id}
                    >
                      REJEITAR
                    </button>
                    <button
                      type="button"
                      className="admin-review-approve"
                      onClick={() => moderateReview(review, "approved")}
                      disabled={reviewSavingId === review.id}
                    >
                      {reviewSavingId === review.id ? "AGUARDE..." : "APROVAR E PUBLICAR"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </>
    );
  }

  function renderProducts() {
    const quickFilters = [
      ["all", "Todos", productFilterCounts.all],
      ["offers", "Em oferta", productFilterCounts.offers],
      ["active", "Ativos", productFilterCounts.active],
      ["scheduled", "Agendados", productFilterCounts.scheduled],
      ["draft", "Rascunhos", productFilterCounts.draft],
      ["archived", "Arquivados", productFilterCounts.archived],
    ];

    return (
      <>
        <div className="admin-heading admin-heading-actions">
          <div>
            <span>CATÁLOGO</span>
            <h1>Produtos</h1>
            <p>Gerencie, encontre e filtre rapidamente os produtos da loja.</p>
          </div>
          <div className="admin-heading-buttons">
            <button className="admin-secondary" onClick={() => setBulkOpen(true)}>
              Cadastro em massa
            </button>
            <button className="admin-primary" onClick={openNewProduct}>
              + Novo produto
            </button>
          </div>
        </div>

        <section className="admin-product-filters">
          <div className="admin-product-filter-top">
            <div className="admin-product-search">
              <span>⌕</span>
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Buscar por nome, categoria, descrição ou slug..."
              />
            </div>

            <div className="admin-product-result-count">
              <strong>{filteredProducts.length}</strong>
              <span>
                {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </span>
            </div>
          </div>

          <div className="admin-product-quick-filters">
            {quickFilters.map(([value, label, count]) => (
              <button
                type="button"
                key={value}
                className={productQuickFilter === value ? "active" : ""}
                onClick={() => setProductQuickFilter(value)}
              >
                <span>{label}</span>
                <b>{count}</b>
              </button>
            ))}
          </div>

          <div className="admin-product-filter-controls">
            <label>
              <span>Categoria</span>
              <select
                value={productCategoryFilter}
                onChange={(event) => setProductCategoryFilter(event.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {productCategories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Preço mínimo</span>
              <div className="admin-price-filter-input">
                <i>R$</i>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productMinPrice}
                  onChange={(event) => setProductMinPrice(event.target.value)}
                  placeholder="0,00"
                />
              </div>
            </label>

            <label>
              <span>Preço máximo</span>
              <div className="admin-price-filter-input">
                <i>R$</i>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productMaxPrice}
                  onChange={(event) => setProductMaxPrice(event.target.value)}
                  placeholder="Sem limite"
                />
              </div>
            </label>

            <label>
              <span>Ordenar por</span>
              <select
                value={productSort}
                onChange={(event) => setProductSort(event.target.value)}
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A–Z</option>
                <option value="price-low">Menor preço</option>
                <option value="price-high">Maior preço</option>
                <option value="discount">Maior desconto</option>
              </select>
            </label>
          </div>

          <div className="admin-product-filter-footer">
            <span>
              {productQuickFilter === "offers"
                ? "Exibindo somente produtos marcados como oferta."
                : productQuickFilter === "all"
                  ? "Exibindo produtos de todos os status."
                  : `Status selecionado: ${statusLabel(productQuickFilter)}.`}
            </span>

            <button
              type="button"
              className="admin-clear-product-filters"
              onClick={clearProductFilters}
              disabled={!hasActiveProductFilters}
            >
              Limpar filtros
            </button>
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <div className="admin-product-empty-filter">
            <div>⌕</div>
            <strong>Nenhum produto encontrado</strong>
            <p>Tente alterar a busca, categoria, preço ou status selecionado.</p>
            {hasActiveProductFilters && (
              <button type="button" onClick={clearProductFilters}>
                LIMPAR FILTROS
              </button>
            )}
          </div>
        ) : (
          <div className="admin-product-grid">
            {filteredProducts.map((product) => {
              const discountPercent = productDiscountPercent(product);
              const hasOfferPrice = discountPercent > 0;

              return (
                <article className="admin-product-card" key={product.id}>
                  <div className="admin-product-image">
                    {productImage(product) ? (
                      <img src={productImage(product)} alt={product.name} />
                    ) : (
                      <span>🎮</span>
                    )}

                    <span className={`admin-status ${product.status}`}>
                      {statusLabel(product.status)}
                    </span>

                    {product.is_offer && (
                      <span className="admin-product-offer-badge">
                        {hasOfferPrice ? `-${discountPercent}%` : "OFERTA"}
                      </span>
                    )}
                  </div>

                  <div className="admin-product-body">
                    <small>{product.category}</small>
                    <h3>{product.name}</h3>
                    <div className="admin-product-delivery-badges">
                      <span className={product.delivery_type === "physical" ? "physical" : "digital"}>
                        {product.delivery_type === "physical" ? "📦 FÍSICO" : "⚡ DIGITAL"}
                      </span>
                      {product.delivery_type === "physical" &&
                        (!Number(product.shipping_weight_kg) || !Number(product.shipping_width_cm) || !Number(product.shipping_height_cm) || !Number(product.shipping_length_cm)) && (
                          <span className="shipping-missing">⚠ FRETE PENDENTE</span>
                        )}
                    </div>

                    <div className="admin-product-dates">
                      <span>Estoque disponível: <strong>{Math.max(0, Number(product.stock_quantity ?? 0) || 0)}</strong></span>
                    </div>

                    <div className="admin-product-price-block">
                      {hasOfferPrice && (
                        <span>{money(product.original_price)}</span>
                      )}
                      <strong>{money(product.price)}</strong>
                    </div>

                    <div className="admin-product-dates">
                      {product.publish_at && (
                        <span>Publica: {dateTime(product.publish_at)}</span>
                      )}
                      {product.remove_at && (
                        <span>Remove: {dateTime(product.remove_at)}</span>
                      )}
                    </div>

                    <div className="admin-product-actions">
                      <button onClick={() => openEditProduct(product)}>Editar</button>
                      <button onClick={() => archiveProduct(product)}>Arquivar</button>
                      <button className="danger" onClick={() => deleteProduct(product)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {renderProductEditor()}
        {renderBulkEditor()}
      </>
    );
  }


  function renderSchedules() {
    return (
      <>
        <div className="admin-heading">
          <div>
            <span>AUTOMAÇÃO</span>
            <h1>Agendamentos</h1>
            <p>Publicação e remoção automática dos produtos.</p>
          </div>
        </div>

        <div className="admin-schedule-list">
          {scheduledProducts.length === 0 ? (
            <div className="admin-empty">Nenhum agendamento ativo.</div>
          ) : (
            scheduledProducts.map((product) => (
              <article className="admin-schedule-card" key={product.id}>
                <div className="admin-schedule-main">
                  <div className="admin-schedule-image">
                    {productImage(product) ? <img src={productImage(product)} alt={product.name} /> : <span>🎮</span>}
                  </div>
                  <div>
                    <span>{statusLabel(product.status)}</span>
                    <h3>{product.name}</h3>
                    <p>Publicar: <strong>{dateTime(product.publish_at)}</strong></p>
                    <p>Remover: <strong>{dateTime(product.remove_at)}</strong></p>
                  </div>
                </div>
                <div className="admin-schedule-actions">
                  <button onClick={() => publishNow(product)}>Publicar agora</button>
                  <button onClick={() => cancelSchedule(product)}>Cancelar agendamento</button>
                  <button className="danger" onClick={() => removeNow(product)}>Retirar agora</button>
                </div>
              </article>
            ))
          )}
        </div>
      </>
    );
  }

  function renderAnalytics() {
    return (
      <>
        <div className="admin-heading">
          <div>
            <span>MÉTRICAS</span>
            <h1>Analytics</h1>
            <p>Visualizações, carrinho, checkout, vendas e conversão por produto.</p>
          </div>
        </div>

        <div className="analytics-legend">
          <span>✅ Bom: possui vendas e/ou boa conversão.</span>
          <span>🟡 Atenção: bastante interesse, mas poucas vendas.</span>
          <span>❌ Fraco: sem vendas e com pouco tráfego.</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Criado em</th>
                <th>Views</th>
                <th>Carrinho</th>
                <th>Checkout</th>
                <th>Vendas</th>
                <th>Conversão</th>
                <th>Análise</th>
              </tr>
            </thead>
            <tbody>
              {analyticsRows.map((row) => (
                <tr key={row.product.id}>
                  <td><strong>{row.product.name}</strong></td>
                  <td>{dateTime(row.product.created_at)}</td>
                  <td>{row.views}</td>
                  <td>{row.carts}</td>
                  <td>{row.checkouts}</td>
                  <td>{row.purchases}</td>
                  <td>{row.conversion.toFixed(1)}%</td>
                  <td className="analytics-status-cell">
                    {row.performance === "green" ? "✅" : row.performance === "yellow" ? "🟡" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderUsers() {
    return (
      <>
        <div className="admin-heading">
          <div>
            <span>MODERAÇÃO</span>
            <h1>Usuários</h1>
            <p>O painel mostra somente o e-mail e informações de moderação.</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Status</th>
                <th>Suspenso até</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.email}</strong></td>
                  <td><span className={`admin-status ${user.status}`}>{statusLabel(user.status)}</span></td>
                  <td>{dateTime(user.suspended_until)}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => moderateUser(user, "suspended", 1)}>1 dia</button>
                      <button onClick={() => moderateUser(user, "suspended", 7)}>7 dias</button>
                      <button onClick={() => moderateUser(user, "suspended", 30)}>30 dias</button>
                      <button className="danger" onClick={() => moderateUser(user, "blocked")}>Bloquear</button>
                      {user.status !== "active" && <button className="success" onClick={() => moderateUser(user, "active")}>Reativar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderAdmins() {
    if (!isOwner) {
      return <div className="admin-empty">Somente a conta OWNER pode acessar esta área.</div>;
    }

    return (
      <>
        <div className="admin-heading">
          <div>
            <span>OWNER</span>
            <h1>Administradores</h1>
            <p>Promova contas já cadastradas ou remova o papel de administrador.</p>
          </div>
        </div>

        <section className="admin-card">
          <div className="admin-card-title">
            <span>NOVO ADMIN</span>
            <h2>Promover uma conta existente</h2>
          </div>
          <div className="admin-promote-form">
            <input type="email" placeholder="email@exemplo.com" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
            <button className="admin-primary" onClick={promoteAdmin}>Tornar ADMIN</button>
          </div>
        </section>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Função</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.email}</strong></td>
                  <td>{user.role === "owner" ? "OWNER" : "ADMIN"}</td>
                  <td><span className={`admin-status ${user.status}`}>{statusLabel(user.status)}</span></td>
                  <td>
                    {user.role === "admin" ? (
                      <button className="admin-danger-button" onClick={() => removeAdmin(user)}>Remover ADMIN</button>
                    ) : (
                      <span className="admin-owner-lock">Conta principal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  async function loadMelhorEnvioStatus() {
    if (!isOwner) return;
    try {
      const { data, error } = await supabase.rpc("owner_melhor_envio_connection_status");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      setMelhorEnvioStatus(row || null);
    } catch (error) {
      console.error("Erro ao consultar status do Melhor Envio:", error);
      setMelhorEnvioStatus(null);
    }
  }

  async function connectMelhorEnvio() {
    if (!isOwner || melhorEnvioBusy) return;

    setMelhorEnvioBusy(true);
    setMelhorEnvioError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Sua sessão expirou. Entre novamente na conta owner.");
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/melhor-envio-oauth-start`;
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.authorizationUrl) {
        throw new Error(data?.error || "Não foi possível iniciar a conexão com o Melhor Envio.");
      }

      window.location.assign(data.authorizationUrl);
    } catch (error) {
      console.error("Erro ao conectar Melhor Envio:", error);
      setMelhorEnvioError(error?.message || "Não foi possível iniciar a conexão com o Melhor Envio.");
      setMelhorEnvioBusy(false);
    }
  }

  function renderIntegrations() {
    return (
      <section className="admin-integration-page">
        <div className="admin-section-title">
          <div>
            <span>INTEGRAÇÕES</span>
            <h2>Frete e transportadoras</h2>
            <p>Conecte a conta da BROTHER'S GAMES ao Melhor Envio usando OAuth 2.0.</p>
          </div>
        </div>

        <article className="admin-integration-card">
          <div className="admin-integration-logo" aria-hidden="true">🚚</div>

          <div className="admin-integration-copy">
            <span>MELHOR ENVIO · SANDBOX</span>
            <h3>Conectar cálculo de frete</h3>
            <p>
              A autorização será feita diretamente no Melhor Envio. O Client Secret e os tokens
              permanecem somente no backend do Supabase e não são enviados para o navegador.
            </p>

            <div className="admin-integration-scopes">
              <strong>Permissão solicitada agora</strong>
              <span>shipping-calculate · cálculo de fretes</span>
            </div>

            {melhorEnvioStatus?.connected && (
              <div className="admin-integration-connected">
                <span>✓</span>
                <div>
                  <strong>Melhor Envio conectado</strong>
                  <small>
                    Ambiente: {melhorEnvioStatus.environment || "sandbox"} · token válido até {dateTime(melhorEnvioStatus.access_token_expires_at)}
                  </small>
                </div>
              </div>
            )}

            {melhorEnvioError && (
              <div className="admin-integration-error">{melhorEnvioError}</div>
            )}

            <button
              type="button"
              className="admin-integration-connect"
              onClick={connectMelhorEnvio}
              disabled={melhorEnvioBusy}
            >
              {melhorEnvioBusy ? "ABRINDO MELHOR ENVIO..." : melhorEnvioStatus?.connected ? "RECONECTAR MELHOR ENVIO" : "CONECTAR MELHOR ENVIO"}
            </button>
          </div>
        </article>

        <div className="admin-integration-security">
          <span>🔒</span>
          <div>
            <strong>Conexão protegida</strong>
            <p>
              O fluxo usa state de uso único contra CSRF e o callback valida a autorização antes
              de armazenar os tokens criptografados no banco.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const navItems = [
    ["dashboard", "📊", "Dashboard"],
    ["orders", "📦", "Pedidos e vendas"],
    ["products", "🎮", "Produtos"],
    ["schedules", "🕒", "Agendamentos"],
    ["analytics", "📈", "Analytics"],
    ["reviews", "⭐", "Avaliações"],
    ["users", "👥", "Usuários"],
    ...(isOwner ? [["integrations", "🔌", "Integrações"], ["admins", "👑", "Administradores"]] : []),
  ];

  function renderContent() {
    if (activeTab === "orders") return renderOrders();
    if (activeTab === "products") return renderProducts();
    if (activeTab === "schedules") return renderSchedules();
    if (activeTab === "analytics") return renderAnalytics();
    if (activeTab === "reviews") return renderReviews();
    if (activeTab === "integrations") return renderIntegrations();
    if (activeTab === "users") return renderUsers();
    if (activeTab === "admins") return renderAdmins();
    return renderDashboard();
  }

  return (
    <>
      <div className="admin-app">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={onBack}>
          <span>BROTHER'S</span>
          <strong>GAMES</strong>
        </button>

        <div className="admin-account-badge">
          <span>{isOwner ? "OWNER" : "ADMIN"}</span>
          <strong>{currentUser?.email}</strong>
        </div>

        <button
          type="button"
          className="admin-theme-toggle"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          <span className="admin-theme-toggle-icon" aria-hidden="true">
            {theme === "dark" ? "☀" : "☾"}
          </span>
          <span className="admin-theme-toggle-copy">
            <strong>{theme === "dark" ? "Modo claro" : "Modo escuro"}</strong>
            <small>Alterar aparência</small>
          </span>
        </button>

        <nav className="admin-nav">
          {navItems.map(([id, icon, label]) => (
            <button
              key={id}
              className={activeTab === id ? "active" : ""}
              onClick={() => setActiveTab(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-back-store" onClick={onBack}>← Voltar para a loja</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <span>PAINEL ADMINISTRATIVO</span>
            <strong>BROTHER'S GAMES</strong>
          </div>
          <button onClick={refreshAdminPanel} disabled={refreshing}>
            {refreshing ? "Atualizando..." : "↻ Atualizar"}
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">Carregando dados do Supabase...</div>
          ) : errorMessage ? (
            <div className="admin-error">
              <strong>Não foi possível carregar o painel.</strong>
              <span>{errorMessage}</span>
              <button onClick={() => loadAllData()}>Tentar novamente</button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
      </div>

      {renderOrderManager()}
    </>
  );
}
