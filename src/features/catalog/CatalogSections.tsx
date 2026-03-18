import { useMemo, useState, type CSSProperties, type PointerEventHandler, type RefObject } from "react";
import { Link } from "react-router-dom";
import type { CatalogScene } from "@/features/catalog/catalog.config";
import type {
  CatalogShowcaseSite,
  CatalogSignal,
} from "@/features/catalog/catalog.logic";
import type { CatalogContent } from "@/shared/content/contentTypes";
import type { SitePreview } from "@/shared/types/site";
import { getSiteScene } from "@/features/catalog/catalog.config";
import { createCompositeKey } from "@/shared/utils/compositeKey";
import styles from "@/features/catalog/catalog.module.css";

interface CatalogTopbarProps {
  activeSection: string;
  activeSite: SitePreview;
  isTopbarCompact: boolean;
  isTopbarHidden: boolean;
}

interface CatalogHeroSectionProps {
  activeDossier: CatalogSignal[];
  activeScene: CatalogScene;
  activeSite: SitePreview;
  catalog: CatalogContent;
  heroManifesto: Array<{ copy: string; index: string; title: string }>;
  marqueeItems: string[];
  previewSites: SitePreview[];
  sidePreviewScene: CatalogScene;
  sidePreviewSite: SitePreview;
  activateSite: (siteKey: string) => void;
}

interface CatalogListSectionProps {
  activeSite: SitePreview;
  categories: string[];
  category: string;
  clearHoveredSite: () => void;
  hoverSite: (siteKey: string) => void;
  query: string;
  visibleSites: SitePreview[];
  activateSite: (siteKey: string) => void;
  onQueryChange: (value: string) => void;
  onSelectCategory: (category: string) => void;
}

interface CatalogSystemSectionProps {
  catalog: CatalogContent;
  featuredSite: SitePreview;
  systemShowcase: CatalogShowcaseSite[];
}

interface CatalogIntroFrame {
  accent: string;
  category: string;
  description: string;
  eyebrow: string;
  headline: string;
  previewImage: string;
  summary: string;
  title: string;
  variant: "cover" | "site";
}

interface CatalogIntroOverlayProps {
  activeFrame: CatalogIntroFrame;
  activeIndex: number;
  cursorAuraRef: RefObject<HTMLDivElement | null>;
  cursorDotRef: RefObject<HTMLDivElement | null>;
  frames: CatalogIntroFrame[];
  isFinalFrame: boolean;
  introState: "playing" | "exiting";
  onContinue: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
}

export function CatalogTopbar({
  activeSection,
  activeSite,
  isTopbarCompact,
  isTopbarHidden,
}: CatalogTopbarProps) {
  return (
    <header
      className={`${styles.topbar}${isTopbarHidden ? ` ${styles.topbarHidden}` : ""}${
        isTopbarCompact ? ` ${styles.topbarCompact}` : ""
      }`}
      data-active-section={activeSection}
    >
      <Link className={styles.brandBlock} to="/">
        <span className={styles.brandTag}>Catalogo de experiencias / sistema vivo / edicion local</span>
        <strong className={styles.brandName}>HazTuWeb</strong>
      </Link>
      <nav className={styles.navLinks} aria-label="Secciones principales">
        <a className={activeSection === "hero" ? styles.navLinkActive : undefined} href="#hero">
          Inicio
        </a>
        <a className={activeSection === "catalogo" ? styles.navLinkActive : undefined} href="#catalogo">
          Demos
        </a>
        <a className={activeSection === "sistema" ? styles.navLinkActive : undefined} href="#sistema">
          Sistema
        </a>
      </nav>
      <div className={styles.topbarActions}>
        <Link className={styles.secondaryAction} to="/workspace">
          Editar contenido
        </Link>
        <Link className={styles.primaryAction} to={activeSite.route}>
          <span>Demo activa</span>
          <strong>{activeSite.title}</strong>
        </Link>
      </div>
    </header>
  );
}

export function CatalogIntroOverlay({
  activeFrame,
  activeIndex,
  cursorAuraRef,
  cursorDotRef,
  frames,
  isFinalFrame,
  introState,
  onContinue,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  onPointerUp,
}: CatalogIntroOverlayProps) {
  return (
    <div
      aria-label="Intro del catalogo"
      aria-modal="true"
      className={styles.introOverlay}
      data-state={introState}
      data-variant={activeFrame.variant}
      onPointerDown={onPointerDown}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="dialog"
    >
      <div className={styles.introBackdropStack} aria-hidden="true">
        {frames.map((frame, index) => (
          <div
            className={`${styles.introFrame}${index === activeIndex ? ` ${styles.introFrameActive}` : ""}`}
            key={createCompositeKey("intro-frame", index, frame.title)}
            style={{ ["--frame-accent" as string]: frame.accent } as CSSProperties}
          >
            <img
              alt=""
              className={styles.introFrameImage}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              src={frame.previewImage}
            />
            <div className={styles.introFrameShade} />
          </div>
        ))}
      </div>

      <div className={styles.introPointerGlow} aria-hidden="true" />
      <div className={styles.introOverlayNoise} aria-hidden="true" />
      <div className={styles.introCursorAura} aria-hidden="true" ref={cursorAuraRef} />
      <div className={styles.introCursorDot} aria-hidden="true" ref={cursorDotRef} />

      <div className={styles.introContent}>
        <div className={styles.introHeader}>
          <div className={styles.introBadgeBlock}>
            <span className={styles.introBadge}>HazTuWeb</span>
            <strong className={styles.introStamp}>Sistema vivo / recorrido inicial</strong>
          </div>
        </div>

        {activeFrame.variant === "cover" ? (
          <div className={styles.introCover} key={createCompositeKey("intro-cover", activeFrame.title, activeFrame.summary)}>
            <p className={styles.introCoverEyebrow}>{activeFrame.eyebrow}</p>
            <h2 className={styles.introCoverTitle}>{activeFrame.title}</h2>
            <p className={styles.introCoverDescription}>{activeFrame.description}</p>
          </div>
        ) : (
          <div className={styles.introStage} key={createCompositeKey("intro-stage", activeFrame.title, activeFrame.summary)}>
            <div className={styles.introCopy}>
              <p className={styles.introEyebrow}>{activeFrame.category}</p>
              <h2 className={styles.introTitle}>{activeFrame.title}</h2>
            </div>

            <aside className={styles.introDetailPanel}>
              <small className={styles.introDetailLabel}>{activeFrame.eyebrow}</small>
              <strong className={styles.introDetailLead}>{activeFrame.summary}</strong>
              <p className={styles.introDetailBody}>{activeFrame.description}</p>
              <p className={styles.introDetailNote}>{activeFrame.headline}</p>
            </aside>
          </div>
        )}

        <div className={styles.introFooter}>
          {isFinalFrame ? (
            <button className={styles.introContinue} onClick={onContinue} type="button">
              Seguir
            </button>
          ) : (
            <p className={styles.introPrompt} aria-hidden="true">
              Scroll
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogHeroSection({
  activeDossier,
  activeScene,
  activeSite,
  activateSite,
  catalog,
  heroManifesto,
  marqueeItems,
  previewSites,
  sidePreviewScene,
  sidePreviewSite,
}: CatalogHeroSectionProps) {
  return (
    <section
      className={styles.hero}
      data-section-id="hero"
      data-visible="true"
      id="hero"
    >
      <div className={styles.heroBackdrop}>
        <div
          className={styles.heroBackdropMedia}
          key={createCompositeKey("hero-backdrop", activeSite.key, activeScene.image)}
        >
          <img alt="" className={styles.backdropImage} decoding="async" fetchPriority="high" src={activeScene.image} />
        </div>
      </div>
      <div className={styles.heroAura} />
      <div className={styles.heroViewport}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.surfaceBadge}>{catalog.badge}</span>
            <p
              className={`${styles.heroKicker} ${styles.heroSwapLabel}`}
              key={createCompositeKey("hero-kicker", activeSite.key, activeScene.eyebrow)}
            >
              {activeScene.eyebrow}
            </p>
            <h1 className={styles.heroTitle}>{catalog.title}</h1>
            <p className={styles.heroLead}>{catalog.story}</p>
            <div className={styles.actionRow}>
              <a className={styles.primaryAction} href="#catalogo">
                Explorar catalogo
              </a>
              <Link className={styles.secondaryAction} to="/workspace">
                Cargar datos reales
              </Link>
            </div>
            <div className={styles.heroManifesto}>
              {heroManifesto.map((item, index) => (
                <article
                  className={styles.heroManifestoCard}
                  key={createCompositeKey("hero-manifesto", index, item.index, item.title)}
                  style={{ ["--item-index" as string]: index } as CSSProperties}
                >
                  <small>{item.index}</small>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
            <div className={styles.motionTicker} aria-hidden="true">
              <div className={styles.motionTickerTrack}>
                {[...marqueeItems, ...marqueeItems].map((item, index) => (
                  <span className={styles.motionTickerItem} key={`${item}-${index}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.heroStage}>
            <div className={styles.stageRow}>
              <article
                className={`${styles.spotlightCard} ${styles.heroSwapCard}`}
                key={createCompositeKey("spotlight-card", activeSite.key, activeScene.image)}
              >
                <img alt={activeScene.alt} className={styles.spotlightImage} decoding="async" fetchPriority="high" src={activeScene.image} />
                <div className={styles.spotlightShade} />
                <div className={styles.spotlightMeta}>
                  <small>{activeSite.category}</small>
                  <small>{activeSite.summary}</small>
                </div>
                <div className={styles.spotlightCopy}>
                  <span>{activeSite.title}</span>
                  <strong>{activeScene.headline}</strong>
                  <p>{activeScene.note}</p>
                </div>
                <div className={styles.spotlightActions}>
                  <Link className={styles.primaryAction} to={activeSite.route}>
                    Abrir {activeSite.title}
                  </Link>
                  <Link className={styles.ghostAction} to={`/workspace?site=${activeSite.key}`}>
                    Editar demo
                  </Link>
                </div>
              </article>
              <div className={styles.stageSidecar}>
                <article
                  className={`${styles.dossierPanel} ${styles.heroSwapPanel}`}
                  key={createCompositeKey("dossier-panel", activeSite.key)}
                >
                  <div className={styles.dossierHead}>
                    <span>Dossier activo</span>
                    <strong>{activeSite.title}</strong>
                  </div>
                  <div className={styles.dossierList}>
                    {activeDossier.map((item, index) => (
                      <div
                        className={styles.dossierItem}
                        key={createCompositeKey("dossier", index, item.label, item.value)}
                        style={{ ["--item-index" as string]: index } as CSSProperties}
                      >
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                        <p>{item.copy}</p>
                      </div>
                    ))}
                  </div>
                </article>
                <button
                  type="button"
                  className={`${styles.sidePreviewCard} ${styles.heroSwapPanel}`}
                  onClick={() => activateSite(sidePreviewSite.key)}
                  key={createCompositeKey("side-preview", sidePreviewSite.key, sidePreviewScene.image)}
                >
                  <img
                    alt={sidePreviewScene.alt}
                    className={styles.sidePreviewImage}
                    decoding="async"
                    fetchPriority="auto"
                    loading="lazy"
                    src={sidePreviewScene.image}
                  />
                  <div className={styles.sidePreviewShade} />
                  <div className={styles.sidePreviewCopy}>
                    <span>Siguiente foco</span>
                    <strong>{sidePreviewSite.title}</strong>
                    <p>{sidePreviewSite.summary}</p>
                  </div>
                </button>
              </div>
            </div>
            <div className={styles.previewRail}>
              {previewSites.map((site, index) => {
                const scene = getSiteScene(site.key);

                return (
                  <button
                    key={site.key}
                    type="button"
                    className={`${styles.previewCard}${site.key === activeSite.key ? ` ${styles.previewCardActive}` : ""}`}
                    aria-pressed={site.key === activeSite.key}
                    onClick={() => activateSite(site.key)}
                    style={
                      {
                        ["--card-accent" as string]: site.accent,
                        ["--item-index" as string]: index,
                      } as CSSProperties
                    }
                  >
                    <img
                      alt={scene.alt}
                      className={styles.previewImage}
                      decoding="async"
                      fetchPriority="auto"
                      loading="lazy"
                      src={scene.image}
                    />
                    <div className={styles.previewShade} />
                    <div className={styles.previewIndex}>0{index + 1}</div>
                    <div className={styles.previewCopy}>
                      <span>{site.category}</span>
                      <strong>{site.title}</strong>
                      <p>{site.summary}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CatalogListSection({
  activeSite,
  activateSite,
  categories,
  category,
  clearHoveredSite,
  hoverSite,
  onQueryChange,
  onSelectCategory,
  query,
  visibleSites,
}: CatalogListSectionProps) {
  return (
    <section
      className={styles.catalogSection}
      data-section-id="catalogo"
      data-visible="false"
      id="catalogo"
    >
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCopy}>
            <p className={styles.sectionLabel}>Explorar demos</p>
            <h2>La home funciona como una portada de producto para descubrir experiencias completas.</h2>
            <p>
              Busca por industria, filtra por categoria y recorre cada tarjeta como si fuera una
              pieza editorial con su propia identidad visual.
            </p>
          </div>
          <article className={styles.livePanel}>
            <span>Vista activa</span>
            <strong>{visibleSites.length > 0 ? `${visibleSites.length} demos visibles` : "Sin resultados"}</strong>
            <p>
              {category === "Todos"
                ? "Estas viendo todo el portafolio activo con busqueda en tiempo real."
                : `La seleccion esta enfocada en ${category.toLowerCase()} con el mismo sistema de navegacion.`}
            </p>
          </article>
        </div>
        <div className={styles.controlsPanel}>
          <label className={styles.searchField}>
            <span>Buscar una experiencia</span>
            <input
              type="search"
              placeholder="Ejemplo: viajes, showroom, estudio, reservas"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <div className={styles.filterRow} aria-label="Filtros de categoria" role="group">
            {categories.map((item, index) => (
              <button
                key={createCompositeKey("category", index, item)}
                type="button"
                className={`${styles.filterChip}${item === category ? ` ${styles.filterChipActive}` : ""}`}
                aria-pressed={item === category}
                onClick={() => onSelectCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {visibleSites.length > 0 ? (
          <div className={styles.cardGrid} onPointerLeave={clearHoveredSite}>
            {visibleSites.map((site, index) => {
              const scene = getSiteScene(site.key);

              return (
                <article
                  className={`${styles.card}${site.key === activeSite.key ? ` ${styles.cardActive}` : ""}`}
                  key={site.key}
                  style={
                    {
                      ["--card-accent" as string]: site.accent,
                      ["--item-index" as string]: index,
                    } as CSSProperties
                  }
                  onFocusCapture={() => {
                    hoverSite(site.key);
                    activateSite(site.key);
                  }}
                  onPointerEnter={() => hoverSite(site.key)}
                >
                  <div className={styles.cardMedia}>
                    <img
                      alt={scene.alt}
                      className={styles.cardImage}
                      decoding="async"
                      fetchPriority="auto"
                      loading="lazy"
                      src={scene.image}
                    />
                    <div className={styles.cardShade} />
                    <div className={styles.cardMeta}>
                      <small>{site.category}</small>
                      <small>0{index + 1}</small>
                    </div>
                    <div className={styles.cardMediaCopy}>
                      <span>{scene.eyebrow}</span>
                      <strong>{site.title}</strong>
                      <p>{site.summary}</p>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardDescription}>{site.description}</p>
                    <div className={styles.tagRow}>
                      {(site.tags ?? []).map((tag, tagIndex) => (
                        <span
                          className={styles.tag}
                          key={createCompositeKey("site-tag", tagIndex, tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.cardActions}>
                      <Link className={styles.primaryAction} to={site.route}>
                        Abrir demo
                      </Link>
                      <Link className={styles.ghostAction} to={`/workspace?site=${site.key}`}>
                        Editar
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            No hay resultados para esta busqueda. Cambia el texto o vuelve a la vista completa.
          </div>
        )}
      </div>
    </section>
  );
}

export function CatalogSystemSection({
  catalog,
  featuredSite,
  systemShowcase,
}: CatalogSystemSectionProps) {
  const [activeSystemStepIndex, setActiveSystemStepIndex] = useState(0);
  const featuredSystemSite = useMemo(
    () => ({
      ...featuredSite,
      scene: getSiteScene(featuredSite.key),
    }),
    [featuredSite]
  );
  const primarySystemSite = systemShowcase[0] ?? featuredSystemSite;
  const secondarySystemSite = systemShowcase[1] ?? primarySystemSite;
  const tertiarySystemSite = systemShowcase[2] ?? secondarySystemSite;
  const foundation = catalog.foundation ?? [];
  const pillars = catalog.pillars ?? [];
  const systemJourney = useMemo(
    () => [
      {
        id: "base",
        index: "01",
        label: "Elegimos la base",
        summary: "Partimos de la demo que ya se parece a tu negocio.",
        eyebrow: "Punto de partida",
        title: "Primero elegimos la demo correcta para tu industria.",
        copy:
          "No empezamos con una plantilla vacia. Tomamos la experiencia que ya resuelve la logica mas cercana a tu negocio: reservas, catalogo, showroom, viajes o venta directa.",
        facts: [
          {
            label: "Cliente entiende",
            value: "que recibira una web ya pensada para su tipo de negocio.",
          },
          {
            label: "Base activa",
            value: `${primarySystemSite.title} como referencia inicial del sistema.`,
          },
          {
            label: "Beneficio",
            value: "menos tiempo de arranque y mejor direccion visual desde el inicio.",
          },
        ],
        primaryAction: {
          label: `Ver ${primarySystemSite.title}`,
          to: primarySystemSite.route,
          variant: "primary" as const,
        },
        secondaryAction: {
          label: "Abrir editor local",
          to: "/workspace",
          variant: "secondary" as const,
        },
        site: primarySystemSite,
        visualLabel: primarySystemSite.category,
        visualNote: primarySystemSite.summary,
        tags: primarySystemSite.tags,
      },
      {
        id: "content",
        index: "02",
        label: "Cambiamos el contenido",
        summary: "Reemplazamos los datos demo por contenido real sin rehacer la interfaz.",
        eyebrow: catalog.noteTitle,
        title: "Luego reemplazamos textos, imagenes y focos sin romper la direccion visual.",
        copy:
          "El sistema ya viene preparado para editar contenido desde un workspace local. Eso permite cambiar titulares, secciones, tarjetas y mensajes clave sin redibujar toda la pagina.",
        facts: [
          {
            label: "Se edita desde",
            value: "un editor local pensado para actualizar contenido real con rapidez.",
          },
          {
            label: "Se conserva",
            value: "la jerarquia visual, el tono de marca y la estructura que ya funciona.",
          },
          {
            label: "Resultado",
            value: catalog.noteCopy,
          },
        ],
        primaryAction: {
          label: "Abrir workspace",
          to: "/workspace",
          variant: "primary" as const,
        },
        secondaryAction: {
          label: `Ver ${secondarySystemSite.title}`,
          to: secondarySystemSite.route,
          variant: "ghost" as const,
        },
        site: secondarySystemSite,
        visualLabel: "Contenido vivo",
        visualNote: secondarySystemSite.description,
        tags: secondarySystemSite.tags,
      },
      {
        id: "system",
        index: "03",
        label: "Cada parte vive separada",
        summary: "La estructura ya esta ordenada para que cada negocio tenga su propia base.",
        eyebrow: "Sistema organizado",
        title: "Cada dominio vive en su propio modulo, por eso el sistema sigue claro y mantenible.",
        copy:
          foundation[1]?.copy ??
          "Cada dominio vive dentro de src/features con su propia data, interfaz y estilos.",
        facts: [
          {
            label: "Dentro del proyecto",
            value: "rutas, contenido, interfaz y estilos quedan separados por negocio.",
          },
          {
            label: "Para el cliente",
            value: "cada demo se siente propia, no como una plantilla repetida.",
          },
          {
            label: "Ventaja real",
            value: "los cambios se hacen mas rapido y con menos riesgo de romper otras paginas.",
          },
        ],
        primaryAction: {
          label: `Ver ${tertiarySystemSite.title}`,
          to: tertiarySystemSite.route,
          variant: "primary" as const,
        },
        secondaryAction: {
          label: "Abrir editor local",
          to: "/workspace",
          variant: "secondary" as const,
        },
        site: tertiarySystemSite,
        visualLabel: "Arquitectura modular",
        visualNote: tertiarySystemSite.summary,
        tags: tertiarySystemSite.tags,
      },
      {
        id: "scale",
        index: "04",
        label: "Escala sin rehacer",
        summary: "Cuando el negocio crece, el sistema ya esta listo para conectarse con datos reales.",
        eyebrow: "Siguiente paso natural",
        title: "Cuando quieras escalar, conectamos formularios, CMS o backend sin reiniciar el proyecto.",
        copy:
          foundation[2]?.copy ??
          "Conectar formularios reales, CMS o backend sin rehacer la estructura.",
        facts: [
          {
            label: "Ideal para",
            value: "negocios que primero validan rapido y despues suman operaciones reales.",
          },
          {
            label: "Que se mantiene",
            value:
              pillars[0]?.copy ??
              "La claridad visual, el sistema modular y el ritmo editorial del sitio.",
          },
          {
            label: "Lo importante",
            value: "el crecimiento llega como una capa nueva, no como una reconstruccion completa.",
          },
        ],
        primaryAction: {
          label: "Abrir workspace",
          to: "/workspace",
          variant: "primary" as const,
        },
        secondaryAction: {
          label: "Ver sistema aplicado",
          to: featuredSite.route,
          variant: "ghost" as const,
        },
        site: featuredSystemSite,
        visualLabel: "Escala preparada",
        visualNote: featuredSystemSite.summary,
        tags: featuredSystemSite.tags,
      },
    ],
    [catalog.noteCopy, catalog.noteTitle, featuredSite.route, featuredSystemSite, foundation, pillars, primarySystemSite, secondarySystemSite, tertiarySystemSite]
  );
  const activeSystemStep = systemJourney[activeSystemStepIndex] ?? systemJourney[0];

  return (
    <section
      className={styles.systemSection}
      data-section-id="sistema"
      data-visible="false"
      id="sistema"
    >
      <div className={styles.sectionInner}>
        <div className={styles.systemLead}>
          <div className={styles.sectionCopy}>
            <p className={styles.sectionLabel}>Como funciona el sistema</p>
            <h2>Asi convertimos una demo en una web lista para tu negocio sin perder consistencia visual.</h2>
            <p>
              Recorre el sistema como si fuera una explicacion comercial: primero elegimos la base,
              luego cambiamos el contenido, mantenemos la estructura ordenada y dejamos todo listo
              para escalar cuando el negocio lo necesite.
            </p>
          </div>
          <article className={styles.notePanel}>
            <span>{catalog.noteTitle}</span>
            <strong>{catalog.noteCopy}</strong>
            <div className={styles.noteActions}>
              <Link className={styles.primaryAction} to="/workspace">
                Abrir workspace
              </Link>
              <Link className={styles.ghostAction} to={featuredSite.route}>
                Ver sistema aplicado
              </Link>
            </div>
          </article>
        </div>
        <div className={styles.systemExperience}>
          <div className={styles.systemJourneyRail}>
            {systemJourney.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`${styles.systemJourneyStep}${index === activeSystemStepIndex ? ` ${styles.systemJourneyStepActive}` : ""}`}
                aria-pressed={index === activeSystemStepIndex}
                onClick={() => setActiveSystemStepIndex(index)}
                onPointerEnter={() => setActiveSystemStepIndex(index)}
              >
                <small>{step.index}</small>
                <strong>{step.label}</strong>
                <p>{step.summary}</p>
              </button>
            ))}
          </div>

          <div className={styles.systemStoryStage}>
            <article
              className={styles.systemStoryPanel}
              key={createCompositeKey("system-story", activeSystemStep.id, activeSystemStep.title)}
            >
              <p className={styles.systemStoryEyebrow}>{activeSystemStep.eyebrow}</p>
              <h3>{activeSystemStep.title}</h3>
              <p className={styles.systemStoryCopy}>{activeSystemStep.copy}</p>

              <div className={styles.systemFactGrid}>
                {activeSystemStep.facts.map((fact, index) => (
                  <article
                    className={styles.systemFact}
                    key={createCompositeKey("system-fact", activeSystemStep.id, index, fact.label)}
                  >
                    <span>{fact.label}</span>
                    <p>{fact.value}</p>
                  </article>
                ))}
              </div>

              <div className={styles.systemStoryActions}>
                <Link
                  className={activeSystemStep.primaryAction.variant === "primary" ? styles.primaryAction : styles.secondaryAction}
                  to={activeSystemStep.primaryAction.to}
                >
                  {activeSystemStep.primaryAction.label}
                </Link>
                <Link
                  className={
                    activeSystemStep.secondaryAction.variant === "ghost"
                      ? styles.ghostAction
                      : styles.secondaryAction
                  }
                  to={activeSystemStep.secondaryAction.to}
                >
                  {activeSystemStep.secondaryAction.label}
                </Link>
              </div>
            </article>

            <article
              className={styles.systemVisualCard}
              key={createCompositeKey("system-visual", activeSystemStep.id, activeSystemStep.site.key)}
            >
              <img
                alt={activeSystemStep.site.scene.alt}
                className={styles.systemVisualImage}
                decoding="async"
                fetchPriority="auto"
                loading="lazy"
                src={activeSystemStep.site.scene.image}
              />
              <div className={styles.systemVisualShade} />
              <div className={styles.systemVisualMeta}>
                <small>{activeSystemStep.visualLabel}</small>
                <strong>{activeSystemStep.site.title}</strong>
                <p>{activeSystemStep.visualNote}</p>
              </div>
              <div className={styles.systemVisualTags}>
                {activeSystemStep.tags.map((tag, index) => (
                  <span
                    className={styles.systemVisualTag}
                    key={createCompositeKey("system-visual-tag", activeSystemStep.id, index, tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
