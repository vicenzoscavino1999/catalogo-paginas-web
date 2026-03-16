import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import {
  ShopClosingSection,
  ShopHeroSection,
  ShopTopbar,
} from "@/features/shop/ShopSections";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { applySurfaceMotion, resetSurfaceMotion } from "@/shared/motion/surfaceMotion";
import styles from "@/features/shop/shop.module.css";

const collectionThemes = {
  Todos: { accent: "#55715e", soft: "#edf2ea", deep: "#183126", contrast: "#fffaf2", warm: "#d7c3a2" },
  Sala: { accent: "#647a63", soft: "#eef2ec", deep: "#1b3026", contrast: "#fffaf3", warm: "#dbcab1" },
  Mesa: { accent: "#876446", soft: "#f6ede3", deep: "#382319", contrast: "#fff8ef", warm: "#e5c19a" },
  Regalos: { accent: "#7f6c58", soft: "#f2ebe2", deep: "#2f241d", contrast: "#fff8f2", warm: "#dec3a1" },
} as const;

const collectionNarratives: Record<string, { eyebrow: string; copy: string; promise: string }> = {
  Todos: {
    eyebrow: "Edicion total",
    copy: "La tienda se recorre como una casa estilizada: poco volumen, mucha intencion y compra serena.",
    promise: "La seleccion filtra por atmosfera y no por saturacion de inventario.",
  },
  Sala: {
    eyebrow: "Quiet living",
    copy: "Piezas con presencia suave para consola, repisa, sofa y primeras superficies de una casa.",
    promise: "Ideal para vender focos visuales y textiles con tono residencial.",
  },
  Mesa: {
    eyebrow: "Ritual diario",
    copy: "La mesa entra como escena util, hospitalaria y aspiracional al mismo tiempo.",
    promise: "Perfecta para sets, vajilla y piezas que se entienden mejor en contexto.",
  },
  Regalos: {
    eyebrow: "Ultimo detalle",
    copy: "La compra rapida se resuelve con bundles, fragancias y piezas listas para envolver.",
    promise: "Reduce friccion y ordena temporadas especiales dentro del mismo tono de marca.",
  },
};

const collectionVisuals = {
  Todos: {
    image: "/images/tablecor/hero-showroom.jpg",
    alt: "Showroom de interiores con mobiliario claro y atmosfera serena.",
    eyebrow: "Casa editada",
    headline: "Objetos que cambian el clima de una casa sin llenar la vista de ruido.",
    note: "El recorrido se siente como una boutique de interiores: aire, materia y pocas decisiones bien curadas.",
  },
  Sala: {
    image: "/images/studio/hotel-vela.jpg",
    alt: "Dormitorio boutique con textiles suaves, cabecero capitonado y luz natural.",
    eyebrow: "Soft living",
    headline: "Texturas, altura visual y piezas de entrada para una sala que quiere respirar.",
    note: "La coleccion de sala funciona mejor cuando la escena ya transmite calma, tacto y orden.",
  },
  Mesa: {
    image: "/images/restaurant/hero-dining.jpg",
    alt: "Mesa de restaurante con vajilla, cubiertos y luz calida de cena.",
    eyebrow: "Mesa viva",
    headline: "Piezas que venden un ritual cotidiano y no solo un objeto aislado.",
    note: "Aqui la compra se activa mejor desde una mesa puesta, con capas, brillo bajo y apetito visual.",
  },
  Regalos: {
    image: "/images/tablecor/hospitality-lobby.jpg",
    alt: "Lobby elegante con mesa decorativa, luz calida y acabado premium.",
    eyebrow: "Entrega lista",
    headline: "Regalos que ya llegan con tono, empaque y una lectura mas emocional.",
    note: "La escena de regalos tiene que sentirse lista para dar, no solo lista para sumar al carrito.",
  },
} as const;

const productVisuals = {
  "isla-vase": {
    image: "/images/tablecor/hero-showroom.jpg",
    alt: "Interior de showroom con una composicion clara y un objeto escultorico como foco.",
    material: "Ceramica mineral",
    palette: "Arena / salvia / marfil",
    setting: "Consola, repisa o mesa baja",
    note: "Volumen organico para activar una superficie sin cargarla.",
  },
  "sierra-throw": {
    image: "/images/studio/hotel-vela.jpg",
    alt: "Dormitorio con textiles suaves y atmosfera de descanso premium.",
    material: "Algodon grueso",
    palette: "Oliva seco / piedra / humo",
    setting: "Sofa, cama o chaise lounge",
    note: "Textura envolvente para sumar calidez visual en una sola capa.",
  },
  "bruma-set": {
    image: "/images/tablecor/hospitality-lobby.jpg",
    alt: "Interior elegante con mesa decorativa y sensacion de bienvenida premium.",
    material: "Set aromatico",
    palette: "Canela / lino / vidrio humo",
    setting: "Gift table o recibidor",
    note: "Un kit para regalar sin tener que explicar demasiado.",
  },
  "claro-plates": {
    image: "/images/restaurant/hero-dining.jpg",
    alt: "Mesa puesta con vajilla clara y luz de cena.",
    material: "Gres esmaltado",
    palette: "Hueso / arena / oliva",
    setting: "Comedor diario o mesa social",
    note: "Piezas que se entienden mejor cuando ya estan dentro de una escena servida.",
  },
} as const;

const checkoutSteps = [
  { title: "Seleccion por atmosfera", copy: "Cada vista se organiza por clima, tacto y uso antes que por volumen de referencias." },
  { title: "Bolsa en continuidad", copy: "La suma de piezas y el ticket viven dentro del mismo relato visual de la tienda." },
  { title: "Entrega con confianza", copy: "Empaque, despacho y cuidado aparecen antes del cierre para bajar objecion." },
] as const;

const sectionLabels = {
  hero: "Inicio",
  colecciones: "Colecciones",
  piezas: "Piezas",
  bolsa: "Bolsa",
  cierre: "Cierre",
} as const;

const benefitScenePool = [
  {
    image: "/images/tablecor/hero-showroom.jpg",
    alt: "Showroom de interiores con composicion clara y piezas decorativas premium.",
    kicker: "Curaduria viva",
    note: "Una seleccion corta y mejor fotografiada vende con mas calma y menos ruido.",
  },
  {
    image: "/images/tablecor/kitchen-premium.jpg",
    alt: "Cocina premium con materiales claros y luz suave.",
    kicker: "Compra serena",
    note: "La conversion se vuelve mas natural cuando bolsa, entrega y tono viven en continuidad.",
  },
  {
    image: "/images/studio/hotel-vela.jpg",
    alt: "Dormitorio boutique con textiles suaves y una atmosfera sofisticada.",
    kicker: "Post compra",
    note: "La sensacion de marca tambien se construye en detalles de cierre, empaque y confianza.",
  },
] as const;

function getCollectionTheme(collection: string) {
  return collectionThemes[collection as keyof typeof collectionThemes] ?? collectionThemes.Todos;
}

function getCollectionNarrative(collection: string) {
  return collectionNarratives[collection] ?? collectionNarratives.Todos;
}

function getCollectionVisual(collection: string) {
  return collectionVisuals[collection as keyof typeof collectionVisuals] ?? collectionVisuals.Todos;
}

function getProductVisual(productId: string | undefined, collection: string | undefined) {
  const visual = productVisuals[productId as keyof typeof productVisuals];

  if (visual) {
    return visual;
  }

  const fallback = getCollectionVisual(collection ?? "Todos");

  return {
    image: fallback.image,
    alt: fallback.alt,
    material: "Curaduria viva",
    palette: "Salvia / arena / marfil",
    setting: "Escena principal",
    note: fallback.note,
  };
}

const surfaceMotionOptions = {
  offsetX: 30,
  offsetY: 22,
  bgXFactor: 0.46,
  bgYFactor: 0.46,
  panelXFactor: -0.18,
  panelYFactor: -0.18,
  tiltXFactor: 4,
  tiltYFactor: 5,
} as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ShopPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("shop");
  const nextSite = getNextSite("shop");
  const shop = content.shop;
  const products = shop.products ?? [];
  const metrics = shop.metrics ?? [];
  const benefits = shop.benefits ?? [];
  const collections = useMemo(() => {
    const configuredCollections = (shop.collections ?? []).filter(Boolean);
    const derivedCollections = configuredCollections.length
      ? configuredCollections
      : [...new Set(products.map((product) => product.collection))];

    return derivedCollections.includes("Todos") ? derivedCollections : ["Todos", ...derivedCollections];
  }, [products, shop.collections]);

  useDocumentTitle(siteMeta.title);

  const [activeCollection, setActiveCollection] = useState(() => collections[0] ?? "Todos");
  const [activeProductId, setActiveProductId] = useState(() => products[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("hero");
  const [transitionImage, setTransitionImage] = useState("/images/tablecor/hero-showroom.jpg");
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());
  const { handlePointerDown, handlePointerLeave, handlePointerMove, handlePointerUp } =
    usePointerGlow({
      pageRef,
      cursorAuraRef,
      cursorDotRef,
      initialX: "50vw",
      initialY: "40vh",
      lerp: 0.14,
      auraRotateDeg: -16,
    });
  const { isTopbarCompact, isTopbarHidden, scrollProgress } = useScrollChrome({
    compactThreshold: 90,
    hideThreshold: 40,
  });

  useEffect(() => {
    if (!collections.includes(activeCollection)) {
      setActiveCollection(collections[0] ?? "Todos");
    }
  }, [activeCollection, collections]);

  useEffect(() => {
    if (products.length === 0) {
      setActiveProductId("");
      return;
    }

    if (!products.some((product) => product.id === activeProductId)) {
      setActiveProductId(products[0].id);
    }
  }, [activeProductId, products]);

  const collectionProducts = useMemo(
    () => (activeCollection === "Todos" ? products : products.filter((product) => product.collection === activeCollection)),
    [activeCollection, products]
  );

  const visibleProducts = useMemo(() => {
    return collectionProducts.filter((product) => {
      if (deferredQuery.length === 0) {
        return true;
      }

      return [product.name, product.collection, product.badge, product.description].join(" ").toLowerCase().includes(deferredQuery);
    });
  }, [collectionProducts, deferredQuery]);
  const emptyProductMessage =
    deferredQuery.length > 0
      ? "No hay coincidencias para esta busqueda. Cambia el texto o vuelve a otra coleccion."
      : "Agrega productos reales desde el editor local.";

  useEffect(() => {
    if (visibleProducts.length > 0 && !visibleProducts.some((product) => product.id === activeProductId)) {
      setActiveProductId(visibleProducts[0].id);
    }
  }, [activeProductId, visibleProducts]);

  const activeProduct =
    visibleProducts.find((product) => product.id === activeProductId) ??
    (deferredQuery.length === 0
      ? collectionProducts.find((product) => product.id === activeProductId) ??
        collectionProducts[0] ??
        (activeCollection === "Todos" ? products[0] : undefined)
      : undefined);
  const collectionContext =
    activeCollection === "Todos" || activeCollection === ""
      ? activeProduct?.collection ?? activeCollection
      : activeCollection;

  const activeTheme = getCollectionTheme(collectionContext || "Todos");
  const activeNarrative = getCollectionNarrative(collectionContext || "Todos");
  const activeCollectionVisual = getCollectionVisual(collectionContext || "Todos");
  const activeProductVisual = getProductVisual(activeProduct?.id, collectionContext || "Todos");

  const pageStyle = {
    ["--theme-accent" as string]: siteMeta.accent,
    ["--shop-accent" as string]: activeTheme.accent,
    ["--shop-soft" as string]: activeTheme.soft,
    ["--shop-deep" as string]: activeTheme.deep,
    ["--shop-contrast" as string]: activeTheme.contrast,
    ["--shop-warm" as string]: activeTheme.warm,
    ["--page-pointer-x" as string]: "50vw",
    ["--page-pointer-y" as string]: "40vh",
    ["--scroll-progress" as string]: `${scrollProgress}`,
  } as CSSProperties;

  const collectionStats = useMemo(
    () =>
      collections.map((collection) => {
        const items = collection === "Todos" ? products : products.filter((product) => product.collection === collection);
        const averageTicket = items.length ? Math.round(items.reduce((total, product) => total + product.price, 0) / items.length) : 0;

        return {
          name: collection,
          count: items.length,
          lead: items[0]?.name ?? "Sin piezas",
          averageTicket,
          narrative: getCollectionNarrative(collection),
          visual: getCollectionVisual(collection),
        };
      }),
    [collections, products]
  );

  const heroShowcase = useMemo(() => {
    const source = visibleProducts.length > 0 ? visibleProducts : collectionProducts.length > 0 ? collectionProducts : products;
    return source.slice(0, 3);
  }, [collectionProducts, products, visibleProducts]);

  const selectedProducts = products.filter((product) => cart[product.id] > 0);
  const itemCount = selectedProducts.reduce((total, product) => total + cart[product.id], 0);
  const total = selectedProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  const signalCards = useMemo(
    () => [
      {
        label: "Piezas visibles",
        value: `${visibleProducts.length}`,
        copy: "La vitrina sigue enfocada aunque cambien filtros, busqueda o contenido.",
      },
      {
        label: "Coleccion activa",
        value: activeCollection === "Todos" ? "Edicion completa" : activeCollection,
        copy: activeNarrative.promise,
      },
      {
        label: "Bolsa actual",
        value: itemCount > 0 ? `${itemCount} piezas` : "Sin carga",
        copy: itemCount > 0 ? `Ticket visible en tiempo real: ${formatPrice(total)}.` : "La bolsa acompana la escena sin sacar al usuario del recorrido.",
      },
    ],
    [activeCollection, activeNarrative.promise, itemCount, total, visibleProducts.length]
  );

  const bagHighlights = useMemo(
    () => [
      {
        label: "Seleccion activa",
        value: activeCollection === "Todos" ? "Curaduria total" : activeCollection,
        copy: activeNarrative.copy,
      },
      {
        label: "Pedido actual",
        value: itemCount > 0 ? formatPrice(total) : "Aun abierto",
        copy: itemCount > 0 ? `${itemCount} piezas ya estan dentro de la bolsa.` : "La compra puede probarse sin salir de la landing.",
      },
      {
        label: "Despacho",
        value: itemCount > 0 ? "24h ciudad" : "Segun seleccion",
        copy: "Entrega visible antes del checkout para reducir friccion de decision.",
      },
    ],
    [activeCollection, activeNarrative.copy, itemCount, total]
  );

  const closingCards = useMemo(
    () =>
      collectionStats.slice(0, 4).map((collection) => ({
        ...collection,
        note: collection.averageTicket > 0 ? `Ticket medio de referencia ${formatPrice(collection.averageTicket)}.` : "Listo para poblarse con precio real.",
      })),
    [collectionStats]
  );

  const heroEditorialNotes = useMemo(
    () => [
      {
        label: "Ruta activa",
        value: activeCollection === "Todos" ? "Edicion completa" : activeCollection,
        copy: activeNarrative.promise,
      },
      {
        label: "Pieza foco",
        value: activeProduct?.name ?? siteMeta.title,
        copy: activeProductVisual.note,
      },
      {
        label: "Cierre comercial",
        value: itemCount > 0 ? formatPrice(total) : "Despacho 24h",
        copy:
          itemCount > 0
            ? `${itemCount} piezas ya viven dentro de la bolsa actual.`
            : "Empaque, entrega y claridad aparecen antes de pedir checkout.",
      },
    ],
    [activeCollection, activeNarrative.promise, activeProduct?.name, activeProductVisual.note, itemCount, siteMeta.title, total]
  );

  const marqueeItems = useMemo(
    () => [
      activeCollection === "Todos" ? "Edicion completa" : activeCollection,
      activeProduct?.name ?? siteMeta.title,
      itemCount > 0 ? `${itemCount} piezas en bolsa` : "Despacho 24h ciudad",
      activeProductVisual.material,
      benefits[0]?.title ?? "Curaduria breve",
      activeNarrative.eyebrow,
    ],
    [activeCollection, activeNarrative.eyebrow, activeProduct?.name, activeProductVisual.material, benefits, itemCount, siteMeta.title]
  );

  const benefitShowcase = useMemo(
    () =>
      benefits.map((benefit, index) => {
        const scene = benefitScenePool[index % benefitScenePool.length];

        return {
          ...benefit,
          ...scene,
        };
      }),
    [benefits]
  );

  const activeSectionLabel = sectionLabels[activeSection as keyof typeof sectionLabels] ?? sectionLabels.hero;
  useSectionVisibility({
    pageRef,
    onSectionChange: setActiveSection,
    rootMargin: "-8% 0px -18% 0px",
    threshold: [0.12, 0.24, 0.4],
    visibleBottomRatio: 0.1,
    visibleTopRatio: 0.9,
  });

  useEffect(() => {
    if (!isSceneTransitioning) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSceneTransitioning(false);
    }, 520);

    return () => window.clearTimeout(timeoutId);
  }, [isSceneTransitioning]);

  function handleSurfaceMove(event: ReactPointerEvent<HTMLElement>) {
    applySurfaceMotion(event, surfaceMotionOptions);
  }

  function handleSurfaceLeave(event: ReactPointerEvent<HTMLElement>) {
    resetSurfaceMotion(event, surfaceMotionOptions);
  }

  function triggerSceneTransition(image: string) {
    setTransitionImage(image);
    setIsSceneTransitioning(true);
  }

  function selectCollection(collection: string) {
    const nextVisual = getCollectionVisual(collection);
    const matchingProduct =
      collection === "Todos"
        ? products[0]
        : products.find((product) => product.collection === collection) ?? products[0];

    triggerSceneTransition(nextVisual.image);

    startTransition(() => {
      setActiveCollection(collection);

      if (matchingProduct) {
        setActiveProductId(matchingProduct.id);
      }
    });
  }

  function selectProduct(productId: string) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const nextVisual = getProductVisual(product.id, product.collection);
    triggerSceneTransition(nextVisual.image);

    startTransition(() => {
      setActiveCollection(product.collection);
      setActiveProductId(product.id);
    });
  }

  function addToCart(productId: string) {
    const product = products.find((item) => item.id === productId);

    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));

    if (product) {
      startTransition(() => {
        setActiveCollection(product.collection);
        setActiveProductId(product.id);
      });
    }
  }

  function removeFromCart(productId: string) {
    setCart((current) => {
      const nextValue = Math.max((current[productId] ?? 0) - 1, 0);

      if (nextValue === 0) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [productId]: nextValue,
      };
    });
  }

  function resetCart() {
    setCart({});
  }

  return (
    <main
      className={styles.page}
      data-cursor="hidden"
      data-pressed="false"
      ref={pageRef}
      style={pageStyle}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={styles.pageBloom} />
      <div
        className={`${styles.transitionVeil}${
          isSceneTransitioning ? ` ${styles.transitionVeilActive}` : ""
        }`}
        style={{ backgroundImage: `url(${transitionImage})` }}
      />
      <div className={styles.cursorAura} ref={cursorAuraRef} />
      <div className={styles.cursorDot} ref={cursorDotRef} />
      <div className={styles.scrollMeter} aria-hidden="true">
        <span className={styles.scrollMeterLine} />
        <span className={styles.scrollMeterFill} />
        <span className={styles.scrollMeterValue}>{Math.round(scrollProgress * 100)}%</span>
        <span className={styles.scrollMeterLabel}>{activeSectionLabel}</span>
      </div>

      <ShopTopbar
        activeSection={activeSection}
        isTopbarCompact={isTopbarCompact}
        isTopbarHidden={isTopbarHidden}
        nextSite={nextSite}
        siteMeta={siteMeta}
      />

      <ShopHeroSection
        addToCart={addToCart}
        activeCollectionVisual={activeCollectionVisual}
        activeProduct={activeProduct}
        activeProductVisual={activeProductVisual}
        cart={cart}
        formatPrice={formatPrice}
        heroEditorialNotes={heroEditorialNotes}
        heroShowcase={heroShowcase}
        marqueeItems={marqueeItems}
        metrics={metrics}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        resolveProductVisual={getProductVisual}
        selectProduct={selectProduct}
        siteMeta={siteMeta}
      />

      <section
        className={styles.collectionsSection}
        data-section-id="colecciones"
        data-visible="false"
        id="colecciones"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionLabel}>Colecciones</p>
              <h2>La tienda cambia de tono por atmosfera, no por una fila de filtros genericos.</h2>
              <p>
                Cada coleccion mueve imagen, copia y producto protagonista para que el recorrido
                se sienta vivo incluso con pocos SKUs.
              </p>
            </div>

            <label className={styles.searchField}>
              <span>Buscar por pieza, tipo o descripcion</span>
              <input
                type="search"
                placeholder="Jarron, regalo, textil, vajilla..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.collectionSceneGrid}>
            {collectionStats.map((collection) => (
              <button
                key={collection.name}
                type="button"
                className={`${styles.collectionScene}${
                  collection.name === activeCollection ? ` ${styles.collectionSceneActive}` : ""
                }`}
                aria-pressed={collection.name === activeCollection}
                onClick={() => selectCollection(collection.name)}
                onPointerLeave={handleSurfaceLeave}
                onPointerMove={handleSurfaceMove}
              >
                <img
                  alt={collection.visual.alt}
                  className={styles.collectionSceneImage}
                  decoding="async"
                  src={collection.visual.image}
                />
                <div className={styles.collectionSceneShade} />
                <div className={styles.collectionSceneMeta}>
                  <small>{collection.count} piezas</small>
                  <small>
                    {collection.averageTicket > 0
                      ? formatPrice(collection.averageTicket)
                      : "Ticket por definir"}
                  </small>
                </div>
                <div className={styles.collectionSceneCopy}>
                  <span>{collection.narrative.eyebrow}</span>
                  <strong>{collection.name}</strong>
                  <p>{collection.narrative.promise}</p>
                </div>
              </button>
            ))}
          </div>

          <div className={styles.signalStrip}>
            {signalCards.map((signal, index) => (
              <article className={styles.signalCard} key={`${signal.label}-${signal.value}-${index}`}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.productsSection}
        data-section-id="piezas"
        data-visible="false"
        id="piezas"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div className={styles.sectionBackdrop}>
          <img alt="" className={styles.backdropImage} decoding="async" src={activeProductVisual.image} />
        </div>

        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionLabel}>Piezas</p>
              <h2>El producto principal se presenta como objeto, escena y decision de compra al mismo tiempo.</h2>
              <p>
                El foco de la pagina se mueve con la pieza activa y deja que el resto funcione
                como una rail curada, no como una grilla plana.
              </p>
            </div>

            <article className={styles.collectionSummary}>
              <span>Ruta activa</span>
              <strong>{activeCollection === "Todos" ? "Edicion completa" : activeCollection}</strong>
              <p>{activeNarrative.copy}</p>
            </article>
          </div>

          <div className={styles.productsLayout}>
            {activeProduct ? (
              <article className={styles.featuredProduct}>
                <div
                  className={styles.featuredProductVisual}
                  onPointerLeave={handleSurfaceLeave}
                  onPointerMove={handleSurfaceMove}
                >
                  <img
                    alt={activeProductVisual.alt}
                    className={styles.featuredProductImage}
                    decoding="async"
                    src={activeProductVisual.image}
                  />
                  <div className={styles.featuredProductShade} />
                  <div className={styles.featuredProductCaption}>
                    <span>{activeProduct.badge}</span>
                    <strong>{activeProductVisual.note}</strong>
                  </div>
                </div>

                <div className={styles.featuredProductBody}>
                  <p className={styles.sectionLabel}>Pieza activa</p>
                  <h3>{activeProduct.name}</h3>
                  <p className={styles.featuredProductLead}>{activeProduct.description}</p>

                  <div className={styles.specGrid}>
                    <article className={styles.specCard}>
                      <span>Material</span>
                      <strong>{activeProductVisual.material}</strong>
                    </article>
                    <article className={styles.specCard}>
                      <span>Paleta</span>
                      <strong>{activeProductVisual.palette}</strong>
                    </article>
                    <article className={styles.specCard}>
                      <span>Escena ideal</span>
                      <strong>{activeProductVisual.setting}</strong>
                    </article>
                  </div>

                  <div className={styles.featuredProductActions}>
                    <button className={styles.primaryCta} type="button" onClick={() => addToCart(activeProduct.id)}>
                      Sumar a la bolsa
                    </button>
                    <button
                      className={styles.secondaryCta}
                      type="button"
                      onClick={() => selectCollection(activeProduct.collection)}
                    >
                      Ver coleccion
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <div className={styles.emptyState}>{emptyProductMessage}</div>
            )}

            <div className={styles.productRail}>
              {visibleProducts.length > 0 ? (
                visibleProducts.map((product) => {
                  const visual = getProductVisual(product.id, product.collection);

                  return (
                    <article
                      className={`${styles.productCard}${
                        product.id === activeProduct?.id ? ` ${styles.productCardActive}` : ""
                      }`}
                      key={product.id}
                    >
                      <button
                        className={styles.productThumbButton}
                        type="button"
                        aria-pressed={product.id === activeProduct?.id}
                        onClick={() => selectProduct(product.id)}
                        onPointerLeave={handleSurfaceLeave}
                        onPointerMove={handleSurfaceMove}
                      >
                        <img
                          alt={visual.alt}
                          className={styles.productThumbImage}
                          decoding="async"
                          src={visual.image}
                        />
                        <div className={styles.productThumbShade} />
                      </button>

                      <div className={styles.productCardBody}>
                        <div className={styles.productCardHead}>
                          <div>
                            <span>{product.badge}</span>
                            <h3>{product.name}</h3>
                          </div>
                          <strong>{formatPrice(product.price)}</strong>
                        </div>

                        <p>{product.description}</p>

                        <div className={styles.productCardMeta}>
                          <span>{product.collection}</span>
                          <span>{cart[product.id] ? `${cart[product.id]} en bolsa` : "Aun sin sumar"}</span>
                        </div>

                        <div className={styles.productActions}>
                          <button className={styles.secondaryButton} type="button" onClick={() => selectProduct(product.id)}>
                            Ver pieza
                          </button>
                          <button className={styles.primaryButton} type="button" onClick={() => addToCart(product.id)}>
                            Agregar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  {emptyProductMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={styles.bagSection}
        data-section-id="bolsa"
        data-visible="false"
        id="bolsa"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div className={styles.sectionBackdrop}>
          <img alt="" className={styles.backdropImage} decoding="async" src="/images/tablecor/kitchen-premium.jpg" />
        </div>

        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionLabel}>Bolsa</p>
              <h2>La compra sigue dentro del mismo tono editorial y no cae en una caja tecnica aparte.</h2>
              <p>
                La bolsa resume piezas, cantidades, ticket y promesa de entrega sin romper la
                sensacion de marca.
              </p>
            </div>

            <article className={styles.bagSummaryCard}>
              <span>Lectura actual</span>
              <strong>{itemCount > 0 ? formatPrice(total) : "Seleccion abierta"}</strong>
              <p>
                {itemCount > 0
                  ? `${itemCount} piezas ya estan dentro del pedido.`
                  : "Suma cualquier objeto para probar precio, cantidad y lectura comercial."}
              </p>
            </article>
          </div>

          <div className={styles.bagHeroStrip}>
            {bagHighlights.map((highlight, index) => (
              <article
                className={styles.bagHighlightCard}
                key={`${highlight.label}-${highlight.value}-${index}`}
              >
                <span>{highlight.label}</span>
                <strong>{highlight.value}</strong>
                <p>{highlight.copy}</p>
              </article>
            ))}
          </div>

          <div className={styles.bagLayout}>
            <article className={styles.bagPanel}>
              <div className={styles.bagHeader}>
                <div>
                  <p className={styles.sectionLabel}>Bolsa activa</p>
                  <h3>{itemCount > 0 ? `${itemCount} piezas seleccionadas` : "Bolsa lista para probar"}</h3>
                </div>
                <button className={styles.secondaryButton} type="button" onClick={resetCart}>
                  Limpiar
                </button>
              </div>

              {selectedProducts.length > 0 ? (
                <div className={styles.bagList}>
                  {selectedProducts.map((product) => (
                    <article className={styles.bagItem} key={product.id}>
                      <div className={styles.bagItemMeta}>
                        <div>
                          <strong>{product.name}</strong>
                          <p>
                            {product.collection} / {product.badge}
                          </p>
                        </div>
                        <span>{formatPrice(product.price * cart[product.id])}</span>
                      </div>

                      <div className={styles.quantityControls}>
                        <span className={styles.quantityPill}>{cart[product.id]} unidades</span>
                        <button className={styles.qtyButton} type="button" onClick={() => removeFromCart(product.id)}>
                          Quitar
                        </button>
                        <button className={styles.qtyButton} type="button" onClick={() => addToCart(product.id)}>
                          Sumar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  La bolsa aun no tiene piezas. Usa cualquier producto del recorrido para probar cantidades, precio y cierre.
                </div>
              )}

              <div className={styles.totalsStrip}>
                <article className={styles.totalCard}>
                  <span>Subtotal</span>
                  <strong>{formatPrice(total)}</strong>
                </article>
                <article className={styles.totalCard}>
                  <span>Despacho estimado</span>
                  <strong>{itemCount > 0 ? "24h ciudad" : "Segun pedido"}</strong>
                </article>
              </div>
            </article>

            <article className={styles.fulfillmentPanel}>
              <div
                className={styles.fulfillmentImageFrame}
                onPointerLeave={handleSurfaceLeave}
                onPointerMove={handleSurfaceMove}
              >
                <img
                  alt="Escena de cocina premium con materiales claros y luz natural."
                  className={styles.fulfillmentImage}
                  decoding="async"
                  src="/images/tablecor/kitchen-premium.jpg"
                />
                <div className={styles.fulfillmentShade} />
                <div className={styles.fulfillmentCaption}>
                  <span>Promesa de entrega</span>
                  <strong>Empaque calmo, despacho visible y cierre sin ruido.</strong>
                </div>
              </div>

              <div className={styles.fulfillmentCopy}>
                <p className={styles.sectionLabel}>Confianza</p>
                <h3>La conversion se construye desde detalle, continuidad y una bolsa que no desentona.</h3>
                <p>
                  El checkout no aparece como una pantalla ajena. Aqui sigue la misma direccion de
                  interiores, materia y claridad comercial.
                </p>
              </div>

              <div className={styles.stepGrid}>
                {checkoutSteps.map((step, index) => (
                  <article className={styles.stepCard} key={`${step.title}-${index}`}>
                    <small>0{index + 1}</small>
                    <strong>{step.title}</strong>
                    <p>{step.copy}</p>
                  </article>
                ))}
              </div>

              <div className={styles.checkoutActions}>
                <Link className={styles.primaryCta} to="/workspace?site=shop">
                  Ajustar datos reales
                </Link>
                <Link className={styles.secondaryCta} to={nextSite.route}>
                  Ver {nextSite.title}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <ShopClosingSection
        benefitShowcase={benefitShowcase}
        benefits={benefits}
        closingCards={closingCards}
        nextSite={nextSite}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        siteMeta={siteMeta}
      />
    </main>
  );
}
