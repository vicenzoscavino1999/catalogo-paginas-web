import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import type { MvpContent, SiteMeta } from "@/shared/content/contentTypes";
import {
  validateContentDraft,
  validateSiteMeta,
  type SiteMetaValidationResult,
  type SiteMetaField,
} from "@/features/workspace/workspaceValidation";
import type { SiteKey } from "@/shared/types/site";
import styles from "@/features/workspace/workspace.module.css";

type EditorTab = Exclude<keyof MvpContent, "sites">;
type EditableSiteKey = SiteKey;

const siteTabs: EditorTab[] = [
  "catalog",
  "restaurant",
  "studio",
  "shop",
  "tablecor",
  "travel",
  "moto",
];

const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function isEditorTab(value: string | null): value is EditorTab {
  return (
    value === "catalog" ||
    value === "restaurant" ||
    value === "studio" ||
    value === "shop" ||
    value === "tablecor" ||
    value === "travel" ||
    value === "moto"
  );
}

function isSiteKey(value: EditorTab): value is EditableSiteKey {
  return value !== "catalog";
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSafeAccentColor(value: string) {
  return hexColorPattern.test(value) ? value : "#1d2b43";
}

interface FeedbackState {
  kind: "ok" | "error";
  message: string;
}

const emptyMetaValidation: SiteMetaValidationResult = {
  errors: [],
  fieldErrors: {},
};

export function WorkspacePage() {
  const { content, saveContentSection, resetContentSection, resetAllContent, getSiteByKey } =
    useMvpContent();
  const defaults = useMemo(() => createDefaultMvpContent(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<EditorTab>(() => {
    const requestedTab = searchParams.get("site");
    return isEditorTab(requestedTab) ? requestedTab : "catalog";
  });
  const [jsonDraft, setJsonDraft] = useState(() => formatJson(content[activeTab]));
  const [metaDraft, setMetaDraft] = useState<SiteMeta | null>(
    isSiteKey(activeTab) ? content.sites[activeTab] : null
  );
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const requestedTab = searchParams.get("site");

    if (isEditorTab(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    setJsonDraft(formatJson(content[activeTab]));
    setMetaDraft(isSiteKey(activeTab) ? content.sites[activeTab] : null);
  }, [activeTab, content]);

  useEffect(() => {
    setFeedback(null);
    setShowValidation(false);
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.set("site", activeTab);
      return nextParams;
    });
  }, [activeTab, setSearchParams]);

  const activeLabel = isSiteKey(activeTab) ? getSiteByKey(activeTab).title : "Catalogo";
  const contentValidation = useMemo(
    () => validateContentDraft(activeTab, jsonDraft),
    [activeTab, jsonDraft]
  );
  const metaValidation = useMemo(() => {
    if (!isSiteKey(activeTab) || !metaDraft) {
      return emptyMetaValidation;
    }

    return validateSiteMeta(metaDraft);
  }, [activeTab, metaDraft]);

  function handleTabChange(nextTab: EditorTab) {
    setActiveTab(nextTab);
  }

  function getMetaFieldError(field: SiteMetaField) {
    return showValidation ? metaValidation.fieldErrors[field] : undefined;
  }

  function handleSave() {
    setShowValidation(true);

    if (contentValidation.errors.length > 0) {
      setFeedback({
        kind: "error",
        message: `Corrige el contenido JSON de ${activeLabel} antes de guardar.`,
      });
      return;
    }

    let nextSiteMeta = metaDraft;

    if (isSiteKey(activeTab) && metaDraft) {
      if (metaValidation.errors.length > 0) {
        setFeedback({
          kind: "error",
          message: `Corrige la ficha base de ${activeLabel} antes de guardar.`,
        });
        return;
      }

      nextSiteMeta = {
        ...metaDraft,
        tags: [...metaDraft.tags],
      };
    }

    if (!contentValidation.parsed) {
      setFeedback({
        kind: "error",
        message: "No se pudo preparar el contenido para guardar.",
      });
      return;
    }

    saveContentSection(activeTab, contentValidation.parsed);

    if (isSiteKey(activeTab) && nextSiteMeta) {
      saveContentSection("sites", {
        ...content.sites,
        [activeTab]: nextSiteMeta,
      });
    }

    setFeedback({
      kind: "ok",
      message: `Se guardo el contenido local de ${activeLabel}.`,
    });
    setShowValidation(false);
  }

  function handleResetSection() {
    resetContentSection(activeTab);

    if (isSiteKey(activeTab)) {
      saveContentSection("sites", {
        ...content.sites,
        [activeTab]: defaults.sites[activeTab],
      });
    }

    setFeedback({
      kind: "ok",
      message: `Se restauro el bloque demo de ${activeLabel}.`,
    });
    setShowValidation(false);
  }

  function handleResetAll() {
    resetAllContent();
    setFeedback({
      kind: "ok",
      message: "Se restauro todo el contenido demo del MVP.",
    });
    setShowValidation(false);
  }

  return (
    <main className={`page-shell ${styles.page}`}>
      <div className="page-stack">
        <header className="topbar">
          <Link className="topbar-link" to="/">
            Volver al catalogo
          </Link>

          <div className="topbar-meta">
            <span className="topbar-label">Editor local</span>
            <button className="topbar-link is-strong" type="button" onClick={handleResetAll}>
              Restaurar todo
            </button>
          </div>
        </header>

        <section className={`section-card ${styles.hero}`}>
          <span className="surface-badge">Modo MVP sin mocks obligatorios</span>
          <h1>Reemplaza el demo por datos reales y prueba el flujo sin tocar codigo.</h1>
          <p>
            Este editor guarda el contenido en tu navegador. Puedes cambiar textos,
            metricas, catalogos, modelos, destinos o cualquier bloque de cada industria y
            ver el resultado en las paginas del MVP.
          </p>

          <div className={styles.heroActions}>
            <Link className="button-primary" to={isSiteKey(activeTab) ? `/${activeTab}` : "/"}>
              Abrir vista actual
            </Link>
            <button className="button-ghost" type="button" onClick={handleResetSection}>
              Restaurar bloque actual
            </button>
          </div>
        </section>

        <section className="section-card">
          <div className={styles.tabRail} aria-label="Pestanas del editor">
            {siteTabs.map((tab) => (
              <button
                className={`${styles.tabButton}${tab === activeTab ? ` ${styles.tabButtonActive}` : ""}`}
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
              >
                {tab === "catalog" ? "Catalogo" : getSiteByKey(tab).title}
              </button>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className={styles.editorLayout}>
            <aside className={styles.metaPanel}>
              <div>
                <p className="eyebrow">Panel base</p>
                <h2>{activeLabel}</h2>
                <p>
                  Edita el bloque visible en el catalogo y luego ajusta el JSON completo de
                  la pagina.
                </p>
              </div>

              {isSiteKey(activeTab) && metaDraft ? (
                <div className={styles.metaGrid}>
                  <label className={styles.field}>
                    <span>Titulo</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("title"))}
                      className={getMetaFieldError("title") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.title}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, title: event.target.value } : current
                        )
                      }
                    />
                    {getMetaFieldError("title") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("title")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Industria</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("category"))}
                      className={getMetaFieldError("category") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.category}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, category: event.target.value } : current
                        )
                      }
                    />
                    {getMetaFieldError("category") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("category")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Descripcion del catalogo</span>
                    <textarea
                      aria-invalid={Boolean(getMetaFieldError("description"))}
                      className={getMetaFieldError("description") ? styles.inputInvalid : ""}
                      value={metaDraft.description}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, description: event.target.value } : current
                        )
                      }
                    />
                    {getMetaFieldError("description") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("description")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Resumen corto</span>
                    <textarea
                      aria-invalid={Boolean(getMetaFieldError("summary"))}
                      className={getMetaFieldError("summary") ? styles.inputInvalid : ""}
                      value={metaDraft.summary}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, summary: event.target.value } : current
                        )
                      }
                    />
                    {getMetaFieldError("summary") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("summary")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Tags del catalogo</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("tags"))}
                      className={getMetaFieldError("tags") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.tags.join(", ")}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current
                            ? { ...current, tags: parseTags(event.target.value) }
                            : current
                        )
                      }
                    />
                    {getMetaFieldError("tags") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("tags")}</small>
                    ) : null}
                  </label>

                  <div className={styles.field}>
                    <span>Color acento</span>
                    <div className={styles.colorRow}>
                      <input
                        aria-invalid={Boolean(getMetaFieldError("accent"))}
                        className={`${styles.colorPicker}${getMetaFieldError("accent") ? ` ${styles.inputInvalid}` : ""}`}
                        type="color"
                        value={getSafeAccentColor(metaDraft.accent)}
                        onChange={(event) =>
                          setMetaDraft((current) =>
                            current ? { ...current, accent: event.target.value } : current
                          )
                        }
                      />
                      <input
                        aria-invalid={Boolean(getMetaFieldError("accent"))}
                        className={getMetaFieldError("accent") ? styles.inputInvalid : ""}
                        type="text"
                        value={metaDraft.accent}
                        onChange={(event) =>
                          setMetaDraft((current) =>
                            current ? { ...current, accent: event.target.value } : current
                          )
                        }
                      />
                    </div>
                    {getMetaFieldError("accent") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("accent")}</small>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className={styles.codeNote}>
                  El catalogo usa este bloque para la presentacion general de la app. El
                  detalle de cada industria se edita en el JSON de la derecha.
                </div>
              )}
            </aside>

            <div className={styles.jsonPanel}>
              <div>
                <p className="eyebrow">JSON editable</p>
                <h2>Contenido completo</h2>
                <p>
                  Pega aqui tus datos reales. Lo que guardes se persiste en local y pasa a
                  alimentar la pagina elegida.
                </p>
              </div>

              <textarea
                aria-invalid={showValidation && contentValidation.errors.length > 0}
                className={`${styles.jsonArea}${
                  showValidation && contentValidation.errors.length > 0 ? ` ${styles.jsonAreaInvalid}` : ""
                }`}
                spellCheck={false}
                value={jsonDraft}
                onChange={(event) => setJsonDraft(event.target.value)}
              />

              {showValidation && contentValidation.errors.length > 0 ? (
                <div className={styles.fieldErrorPanel}>
                  <strong className={styles.fieldErrorTitle}>Corrige este bloque JSON</strong>
                  <ul className={styles.statusList}>
                    {contentValidation.errors.slice(0, 6).map((detail, index) => (
                      <li key={`${detail}-${index}`}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {feedback ? (
                <div className={feedback.kind === "ok" ? styles.statusOk : styles.statusError}>
                  <strong className={styles.statusTitle}>{feedback.message}</strong>
                </div>
              ) : null}

              <div className={styles.panelActions}>
                <button className="button-primary" type="button" onClick={handleSave}>
                  Guardar cambios
                </button>
                <button className="button-ghost" type="button" onClick={handleResetSection}>
                  Restaurar bloque
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
