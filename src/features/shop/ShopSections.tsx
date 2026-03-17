import type { PointerEventHandler } from "react";
import { Link } from "react-router-dom";
import type { ShopBenefit, ShopProduct } from "@/shared/content/contentTypes";
import type { MetricItem, SitePreview } from "@/shared/types/site";
import { createCompositeKey } from "@/shared/utils/compositeKey";
import styles from "@/features/shop/shop.module.css";

interface MotionHandlers {
  onPointerLeave: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
}

interface ShopCollectionVisual {
  alt: string;
  eyebrow: string;
  headline: string;
  image: string;
  note: string;
}

interface ShopProductVisual {
  alt: string;
  image: string;
  material: string;
  note: string;
  palette: string;
  setting: string;
}

interface ShopSignalCard {
  copy: string;
  label: string;
  value: string;
}

interface ShopCollectionStat {
  averageTicket: number;
  count: number;
  lead: string;
  name: string;
  narrative: {
    eyebrow: string;
    promise: string;
  };
  note: string;
  visual: ShopCollectionVisual;
}

interface BenefitShowcaseItem extends ShopBenefit {
  alt: string;
  image: string;
  kicker: string;
  note: string;
}

interface ShopTopbarProps {
  activeSection: string;
  isTopbarCompact: boolean;
  isTopbarHidden: boolean;
  nextSite: SitePreview;
  siteMeta: SitePreview;
}

interface ShopHeroSectionProps extends MotionHandlers {
  addToCart: (productId: string) => void;
  activeCollectionVisual: ShopCollectionVisual;
  activeProduct?: ShopProduct;
  activeProductVisual: ShopProductVisual;
  cart: Record<string, number>;
  formatPrice: (value: number) => string;
  heroEditorialNotes: ShopSignalCard[];
  heroShowcase: ShopProduct[];
  marqueeItems: string[];
  metrics: MetricItem[];
  resolveProductVisual: (productId: string, collection: string) => ShopProductVisual;
  selectProduct: (productId: string) => void;
  siteMeta: SitePreview;
}

interface ShopClosingSectionProps extends MotionHandlers {
  benefitShowcase: BenefitShowcaseItem[];
  benefits: ShopBenefit[];
  closingCards: ShopCollectionStat[];
  nextSite: SitePreview;
  siteMeta: SitePreview;
}

export function ShopTopbar({
  activeSection,
  isTopbarCompact,
  isTopbarHidden,
  nextSite,
  siteMeta,
}: ShopTopbarProps) {
  return (
    <header
      className={`${styles.topbar}${isTopbarHidden ? ` ${styles.topbarHidden}` : ""}${
        isTopbarCompact ? ` ${styles.topbarCompact}` : ""
      }`}
    >
      <div className={styles.brandBlock}>
        <span className={styles.brandTag}>Boutique botanica / objetos curados / conversion suave</span>
        <strong className={styles.brandName}>{siteMeta.title}</strong>
      </div>

      <nav className={styles.navLinks} aria-label="Navegacion de tienda">
        <a className={activeSection === "colecciones" ? styles.navLinkActive : ""} href="#colecciones">
          Colecciones
        </a>
        <a className={activeSection === "piezas" ? styles.navLinkActive : ""} href="#piezas">
          Piezas
        </a>
        <a className={activeSection === "bolsa" ? styles.navLinkActive : ""} href="#bolsa">
          Bolsa
        </a>
        <a className={activeSection === "cierre" ? styles.navLinkActive : ""} href="#cierre">
          Cierre
        </a>
      </nav>

      <div className={styles.topbarActions}>
        <Link className={styles.backLink} to="/">
          Volver al catalogo
        </Link>
        <Link className={styles.workspaceLink} to="/workspace?site=shop">
          Editar contenido
        </Link>
        <Link className={styles.nextLink} to={nextSite.route}>
          <span>Siguiente demo</span>
          <strong>{nextSite.title}</strong>
        </Link>
      </div>
    </header>
  );
}

export function ShopHeroSection({
  addToCart,
  activeCollectionVisual,
  activeProduct,
  activeProductVisual,
  cart,
  formatPrice,
  heroEditorialNotes,
  heroShowcase,
  marqueeItems,
  metrics,
  onPointerLeave,
  onPointerMove,
  resolveProductVisual,
  selectProduct,
  siteMeta,
}: ShopHeroSectionProps) {
  return (
    <section
      className={styles.hero}
      data-section-id="hero"
      data-visible="true"
      id="hero"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div className={styles.heroBackdrop}>
        <img alt="" className={styles.backdropImage} decoding="async" src={activeCollectionVisual.image} />
      </div>
      <div className={styles.heroBackdropAccent}>
        <img alt="" className={styles.backdropImage} decoding="async" src={activeProductVisual.image} />
      </div>

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <div className={styles.heroHeader}>
            <span className={styles.brandLine}>Home objects / living edit / tactile commerce</span>
            <p className={styles.eyebrow}>{siteMeta.category}</p>
          </div>

          <h1 className={styles.heroTitle}>
            Verde Vivo vende piezas de casa como escenas que ya se quieren habitar.
          </h1>

          <p className={styles.heroLead}>
            {siteMeta.description} Esta version se comporta como una boutique digital:
            fotografias con atmosfera, colecciones que cambian el clima visual y una bolsa que
            acompana la compra sin romper el relato.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="#colecciones">
              Ver colecciones
            </a>
            <a className={styles.secondaryCta} href="#bolsa">
              Revisar bolsa
            </a>
          </div>

          {metrics.length > 0 ? (
            <div className={styles.metricRail}>
              {metrics.map((metric, index) => (
                <article
                  className={styles.metricCard}
                  key={createCompositeKey("metric", index, metric.label, metric.value)}
                >
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>
          ) : null}

          <div className={styles.heroTags}>
            {siteMeta.tags.map((tag, index) => (
              <span key={createCompositeKey("site-tag", index, tag)}>{tag}</span>
            ))}
          </div>

          <div className={styles.heroEditorialStrip}>
            {heroEditorialNotes.map((note, index) => (
              <article
                className={styles.heroEditorialCard}
                key={createCompositeKey("hero-note", index, note.label, note.value)}
              >
                <span>{note.label}</span>
                <strong>{note.value}</strong>
                <p>{note.copy}</p>
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
          <article className={styles.sceneCard} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove}>
            <img
              alt={activeCollectionVisual.alt}
              className={styles.sceneImage}
              decoding="async"
              src={activeCollectionVisual.image}
            />
            <div className={styles.sceneShade} />
            <div className={styles.sceneCopy}>
              <span>{activeCollectionVisual.eyebrow}</span>
              <strong>{activeCollectionVisual.headline}</strong>
              <p>{activeCollectionVisual.note}</p>
            </div>
          </article>

          <div className={styles.heroMiniGrid}>
            {heroShowcase.map((product) => {
              const visual = resolveProductVisual(product.id, product.collection);

              return (
                <button
                  key={product.id}
                  type="button"
                  className={`${styles.miniProductCard}${
                    product.id === activeProduct?.id ? ` ${styles.miniProductCardActive}` : ""
                  }`}
                  aria-pressed={product.id === activeProduct?.id}
                  onClick={() => selectProduct(product.id)}
                  onPointerLeave={onPointerLeave}
                  onPointerMove={onPointerMove}
                >
                  <img
                    alt={visual.alt}
                    className={styles.miniProductImage}
                    decoding="async"
                    src={visual.image}
                  />
                  <div className={styles.miniProductShade} />
                  <div className={styles.miniProductCopy}>
                    <span>{product.badge}</span>
                    <strong>{product.name}</strong>
                    <p>{formatPrice(product.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {activeProduct ? (
            <article className={styles.focusCard}>
              <div className={styles.focusHeader}>
                <div>
                  <span className={styles.focusBadge}>{activeProduct.badge}</span>
                  <h2>{activeProduct.name}</h2>
                </div>
                <span className={styles.pricePill}>{formatPrice(activeProduct.price)}</span>
              </div>

              <p className={styles.focusCopy}>{activeProduct.description}</p>

              <div className={styles.focusMeta}>
                <div>
                  <small>Material</small>
                  <strong>{activeProductVisual.material}</strong>
                </div>
                <div>
                  <small>Escena</small>
                  <strong>{activeProductVisual.setting}</strong>
                </div>
                <div>
                  <small>Paleta</small>
                  <strong>{activeProductVisual.palette}</strong>
                </div>
              </div>

              <div className={styles.focusFooter}>
                <div className={styles.focusStatus}>
                  <small>Bolsa actual</small>
                  <strong>
                    {cart[activeProduct.id]
                      ? `${cart[activeProduct.id]} piezas en bolsa`
                      : "Lista para sumar"}
                  </strong>
                </div>

                <button className={styles.primaryCta} type="button" onClick={() => addToCart(activeProduct.id)}>
                  Agregar pieza
                </button>
              </div>
            </article>
          ) : (
            <div className={styles.emptyState}>Agrega productos reales desde el editor local.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ShopClosingSection({
  benefitShowcase,
  benefits,
  closingCards,
  nextSite,
  onPointerLeave,
  onPointerMove,
  siteMeta,
}: ShopClosingSectionProps) {
  return (
    <section
      className={styles.closingSection}
      data-section-id="cierre"
      data-visible="false"
      id="cierre"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div className={styles.sectionBackdrop}>
        <img
          alt=""
          className={styles.backdropImage}
          decoding="async"
          src="/images/tablecor/hospitality-lobby.jpg"
        />
      </div>

      <div className={styles.sectionInner}>
        <div className={styles.closingLead}>
          <div className={styles.sectionCopy}>
            <p className={styles.sectionLabel}>Cierre</p>
            <h2>Verde Vivo ya se siente como una boutique digital de interiores y no como un e-commerce generico.</h2>
            <p>
              Puedes cambiar productos, colecciones y beneficios desde el editor local y la
              pagina conserva escena, ritmo y una lectura comercial mas premium.
            </p>

            <div className={styles.heroTags}>
              {benefits.map((benefit, index) => (
                <span key={createCompositeKey("benefit-tag", index, benefit.title)}>
                  {benefit.title}
                </span>
              ))}
            </div>

            <div className={styles.closingActions}>
              <Link className={styles.primaryCta} to="/workspace?site=shop">
                Editar Verde Vivo
              </Link>
              <Link className={styles.secondaryCta} to="/">
                Volver al catalogo
              </Link>
            </div>
          </div>

          <article className={styles.closingStatement}>
            <span>Lectura final</span>
            <strong>{siteMeta.summary}</strong>
            <p>
              Las pocas piezas dejan de sentirse escasas porque ahora viven dentro de un sistema
              visual con foto, scroll, tono y compra en continuidad.
            </p>
          </article>
        </div>

        {benefitShowcase.length > 0 ? (
          <div className={styles.benefitGallery}>
            {benefitShowcase.map((benefit, index) => (
              <article
                className={styles.benefitCard}
                key={createCompositeKey("benefit-showcase", index, benefit.title)}
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
              >
                <img alt={benefit.alt} className={styles.benefitImage} decoding="async" src={benefit.image} />
                <div className={styles.benefitShade} />
                <div className={styles.benefitMeta}>
                  <span>{benefit.kicker}</span>
                  <strong>{benefit.title}</strong>
                  <p>{benefit.copy}</p>
                  <small>{benefit.note}</small>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className={styles.moodboardGrid}>
          {closingCards.map((collection, index) => (
            <article
              className={styles.moodCard}
              key={createCompositeKey("closing-card", index, collection.name)}
              onPointerLeave={onPointerLeave}
              onPointerMove={onPointerMove}
            >
              <img
                alt={collection.visual.alt}
                className={styles.moodImage}
                decoding="async"
                src={collection.visual.image}
              />
              <div className={styles.moodShade} />
              <div className={styles.moodCopy}>
                <span>{collection.name}</span>
                <strong>{collection.lead}</strong>
                <p>{collection.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.closingActions}>
          <Link className={styles.primaryCta} to="/workspace?site=shop">
            Ajustar datos reales
          </Link>
          <Link className={styles.secondaryCta} to={nextSite.route}>
            Ver {nextSite.title}
          </Link>
        </div>
      </div>
    </section>
  );
}
