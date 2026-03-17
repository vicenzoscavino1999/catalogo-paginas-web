import type { CSSProperties } from "react";
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
        <strong className={styles.brandName}>Catalogo Webs</strong>
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
        <img alt="" className={styles.backdropImage} decoding="async" fetchPriority="high" src={activeScene.image} />
      </div>
      <div className={styles.heroAura} />
      <div className={styles.heroViewport}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.surfaceBadge}>{catalog.badge}</span>
            <p className={styles.heroKicker}>{activeScene.eyebrow}</p>
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
              <article className={styles.spotlightCard}>
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
                <article className={styles.dossierPanel}>
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
                  className={styles.sidePreviewCard}
                  onClick={() => activateSite(sidePreviewSite.key)}
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
          <div className={styles.cardGrid}>
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
                  onFocusCapture={() => activateSite(site.key)}
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
            <p className={styles.sectionLabel}>Base tecnica</p>
            <h2>El sistema esta preparado para crecer sin perder consistencia visual ni velocidad de trabajo.</h2>
            <p>
              Esta portada no solo muestra demos. Tambien explica la base del proyecto: rutas
              separadas, features por dominio y contenido editable desde un workspace local.
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
                Ver destacado
              </Link>
            </div>
          </article>
        </div>
        <div className={styles.foundationGrid}>
          {catalog.foundation.map((item, index) => (
            <article
              className={styles.foundationCard}
              key={createCompositeKey("foundation", index, item.title)}
              style={{ ["--item-index" as string]: index } as CSSProperties}
            >
              <small>0{index + 1}</small>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.systemShowcaseGrid}>
          {systemShowcase.map((site, index) => (
            <article
              className={styles.systemShowcaseCard}
              key={site.key}
              style={{ ["--item-index" as string]: index } as CSSProperties}
            >
              <img
                alt={site.scene.alt}
                className={styles.systemShowcaseImage}
                decoding="async"
                fetchPriority="auto"
                loading="lazy"
                src={site.scene.image}
              />
              <div className={styles.systemShowcaseShade} />
              <div className={styles.systemShowcaseCopy}>
                <span>{site.category}</span>
                <strong>{site.title}</strong>
                <p>{site.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.pillarBand}>
          {catalog.pillars.map((pillar, index) => (
            <article
              className={styles.pillarCard}
              key={createCompositeKey("pillar", index, pillar.title)}
              style={{ ["--item-index" as string]: index } as CSSProperties}
            >
              <span>{pillar.title}</span>
              <p>{pillar.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
