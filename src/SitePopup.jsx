import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./site-popup.css";

const SitePopupContext = createContext(null);

function inferVariant(message) {
  const text = String(message || "").toLowerCase();

  if (
    text.includes("não foi possível") ||
    text.includes("incorret") ||
    text.includes("inválid") ||
    text.includes("bloquead") ||
    text.includes("suspens") ||
    text.includes("expir") ||
    text.includes("erro")
  ) {
    return "error";
  }

  if (
    text.includes("sucesso") ||
    text.includes("salv") ||
    text.includes("criad") ||
    text.includes("copiado") ||
    text.includes("atualizad") ||
    text.includes("cadastrad")
  ) {
    return "success";
  }

  return "info";
}

function popupCopy(variant, confirmation) {
  if (confirmation) {
    return {
      icon: "!",
      eyebrow: "CONFIRMAÇÃO",
      title: "Confirme esta ação",
    };
  }

  const variants = {
    success: {
      icon: "✓",
      eyebrow: "TUDO CERTO",
      title: "Ação concluída",
    },
    error: {
      icon: "!",
      eyebrow: "ATENÇÃO",
      title: "Não foi possível continuar",
    },
    warning: {
      icon: "!",
      eyebrow: "ATENÇÃO",
      title: "Confira esta informação",
    },
    info: {
      icon: "i",
      eyebrow: "BROTHER'S GAMES",
      title: "Informação",
    },
  };

  return variants[variant] || variants.info;
}

export function SitePopupProvider({ children }) {
  const [popup, setPopup] = useState(null);
  const [loadingPopup, setLoadingPopup] = useState(null);

  const popupRef = useRef(null);
  const loadingTasksRef = useRef(new Map());
  const primaryButtonRef = useRef(null);

  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  const closePopup = useCallback((answer = false) => {
    const current = popupRef.current;

    popupRef.current = null;
    setPopup(null);

    current?.resolve?.(answer);
  }, []);

  const showSiteAlert = useCallback((message, options = {}) => {
    const variant = options.variant || inferVariant(message);
    const defaults = popupCopy(variant, false);

    setPopup({
      mode: "alert",
      message: String(message || ""),
      variant,
      icon: options.icon || defaults.icon,
      eyebrow: options.eyebrow || defaults.eyebrow,
      title: options.title || defaults.title,
      confirmLabel: options.confirmLabel || "ENTENDI",
      resolve: null,
    });
  }, []);

  const showSiteConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const variant = options.variant || "warning";
      const defaults = popupCopy(variant, true);

      setPopup({
        mode: "confirm",
        message: String(message || ""),
        variant,
        icon: options.icon || defaults.icon,
        eyebrow: options.eyebrow || defaults.eyebrow,
        title: options.title || defaults.title,
        confirmLabel: options.confirmLabel || "CONFIRMAR",
        cancelLabel: options.cancelLabel || "VOLTAR",
        resolve,
      });
    });
  }, []);

  const showSiteLoading = useCallback((key, options = {}) => {
    const taskKey = String(key || "site-action");

    const task = {
      key: taskKey,
      eyebrow: options.eyebrow || "BROTHER'S GAMES",
      title:
        options.title ||
        "Processando sua solicitação...",
      message:
        options.message ||
        "Aguarde enquanto concluímos esta ação com segurança.",
      status: options.status || "Processando",
      note: options.note || "Não feche esta página.",
    };

    loadingTasksRef.current.delete(taskKey);
    loadingTasksRef.current.set(taskKey, task);

    setLoadingPopup(task);

    return taskKey;
  }, []);

  const hideSiteLoading = useCallback((key) => {
    loadingTasksRef.current.delete(
      String(key || "site-action")
    );

    const remaining = Array.from(
      loadingTasksRef.current.values()
    );

    setLoadingPopup(remaining.at(-1) || null);
  }, []);

  const runWithSiteLoading = useCallback(
    async (task, options = {}) => {
      const key =
        `site-action-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const startedAt = Date.now();

      showSiteLoading(key, options);

      try {
        return await task();
      } finally {
        const minimumDuration = Number(
          options.minimumDuration ?? 500
        );

        const remaining =
          minimumDuration - (Date.now() - startedAt);

        if (remaining > 0) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, remaining);
          });
        }

        hideSiteLoading(key);
      }
    },
    [hideSiteLoading, showSiteLoading]
  );

  useEffect(() => {
    if (!popup && !loadingPopup) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = popup
      ? window.setTimeout(() => {
          primaryButtonRef.current?.focus();
        }, 40)
      : null;

    function handleKeyDown(event) {
      if (popup && event.key === "Escape") {
        closePopup(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      if (focusTimer !== null) {
        window.clearTimeout(focusTimer);
      }

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [popup, loadingPopup, closePopup]);

  return (
    <SitePopupContext.Provider
      value={{
        showSiteAlert,
        showSiteConfirm,
        showSiteLoading,
        hideSiteLoading,
        runWithSiteLoading,
      }}
    >
      {children}

      {loadingPopup && (
        <div
          className="site-action-loading-overlay"
          role="alert"
          aria-live="assertive"
          aria-busy="true"
        >
          <section className="site-action-loading-card">
            <div
              className="site-action-loading-visual"
              aria-hidden="true"
            >
              <span className="site-action-loading-ring ring-one" />
              <span className="site-action-loading-ring ring-two" />

              <strong>B</strong>
            </div>

            <span className="site-action-loading-eyebrow">
              {loadingPopup.eyebrow}
            </span>

            <h2>{loadingPopup.title}</h2>

            <p>{loadingPopup.message}</p>

            <div
              className="site-action-loading-progress"
              aria-hidden="true"
            >
              <span />
            </div>

            <div className="site-action-loading-status">
              <i aria-hidden="true" />

              <strong>
                {loadingPopup.status}
              </strong>
            </div>

            <small>
              {loadingPopup.note}
            </small>
          </section>
        </div>
      )}

      {popup && (
        <div
          className="site-popup-overlay"
          role={
            popup.mode === "confirm"
              ? "alertdialog"
              : "dialog"
          }
          aria-modal="true"
          aria-labelledby="site-popup-title"
          aria-describedby="site-popup-message"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closePopup(false);
            }
          }}
        >
          <section
            className={`site-popup-card ${popup.variant}`}
          >
            <button
              type="button"
              className="site-popup-close"
              onClick={() => closePopup(false)}
              aria-label="Fechar aviso"
            >
              ×
            </button>

            <div
              className="site-popup-icon"
              aria-hidden="true"
            >
              {popup.icon}
            </div>

            <span className="site-popup-eyebrow">
              {popup.eyebrow}
            </span>

            <h2 id="site-popup-title">
              {popup.title}
            </h2>

            <p id="site-popup-message">
              {popup.message}
            </p>

            <div className="site-popup-actions">
              {popup.mode === "confirm" && (
                <button
                  type="button"
                  className="site-popup-secondary"
                  onClick={() =>
                    closePopup(false)
                  }
                >
                  {popup.cancelLabel}
                </button>
              )}

              <button
                ref={primaryButtonRef}
                type="button"
                className="site-popup-primary"
                onClick={() => closePopup(true)}
              >
                {popup.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </SitePopupContext.Provider>
  );
}

export function useSitePopup() {
  const context = useContext(
    SitePopupContext
  );

  if (!context) {
    throw new Error(
      "useSitePopup precisa estar dentro de SitePopupProvider."
    );
  }

  return context;
}