import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { applySurfaceMotion, resetSurfaceMotion } from "@/shared/motion/surfaceMotion";
import styles from "@/features/travel/travel.module.css";

const defaultProfile = {
  image: "/images/travel/hero-ocean.jpg",
  accent: "#0f8ab4",
  deep: "#0f2f42",
  soft: "#d8f1ff",
  glow: "rgba(15, 138, 180, 0.28)",
  atmosphere: "Rutas con aire, luz abierta y decision simple.",
  stay: "Estancias curadas para entrar en modo viaje desde el primer dia",
  mood: "Mar, movimiento y agenda ligera",
  alt: "Vista aerea de mar turquesa y linea costera abierta.",
} as const;

const destinationProfiles = {
  paracas: {
    image: "/images/travel/paracas-coast.jpg",
    accent: "#ef9c63",
    deep: "#173c53",
    soft: "#ffe2cb",
    glow: "rgba(239, 156, 99, 0.3)",
    atmosphere: "Escapada de costa con arena, viento y una energia muy limpia.",
    stay: "Hotel frente al mar y salida corta a desierto",
    mood: "Costa / sol / dunas",
    alt: "Costa abierta con oleaje azul y horizonte brillante.",
  },
  cusco: {
    image: "/images/travel/cusco-mountains.jpg",
    accent: "#7f8fb3",
    deep: "#172944",
    soft: "#dfe5f6",
    glow: "rgba(127, 143, 179, 0.28)",
    atmosphere: "Altura, historia y una ruta dosificada para respirar mejor.",
    stay: "Casa boutique silenciosa en altura",
    mood: "Montana / piedra / pausa",
    alt: "Cordillera abierta con picos altos y cielo despejado.",
  },
  cartagena: {
    image: "/images/travel/cartagena-street.jpg",
    accent: "#d96d49",
    deep: "#432439",
    soft: "#ffd9ce",
    glow: "rgba(217, 109, 73, 0.3)",
    atmosphere: "Ciudad tibia con color, balcones y una lectura boutique mas sensual.",
    stay: "Casa colonial curada dentro del casco historico",
    mood: "Ciudad / color / calor",
    alt: "Calle colorida con balcones, fachadas y luz calida.",
  },
} as const;

function getDestinationProfile(destinationId: string | undefined) {
  if (!destinationId) {
    return defaultProfile;
  }

  return (
    destinationProfiles[destinationId as keyof typeof destinationProfiles] ?? defaultProfile
  );
}

const surfaceMotionOptions = {
  offsetX: 34,
  offsetY: 26,
  bgXFactor: 0.42,
  bgYFactor: 0.42,
  bgInvertXFactor: -0.3,
  bgInvertYFactor: -0.3,
  panelXFactor: -0.22,
  panelYFactor: -0.22,
  tiltXFactor: 4,
  tiltYFactor: 6,
} as const;

function createCompositeKey(...parts: Array<number | string>) {
  return parts.join("::");
}

function createAmbientEngine() {
  const AudioContextCtor =
    window.AudioContext ??
    (
      window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
    ).webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  const context = new AudioContextCtor();
  const masterGain = context.createGain();
  const bedGain = context.createGain();
  const filter = context.createBiquadFilter();
  const compressor = context.createDynamicsCompressor();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  const oscillators = [196, 246.94, 329.63].map((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index === 2 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    return oscillator;
  });
  const oscillatorGains = oscillators.map((_, index) => {
    const gain = context.createGain();
    gain.gain.value = index === 2 ? 0.008 : 0.012;
    return gain;
  });

  masterGain.gain.value = 0;
  bedGain.gain.value = 0.85;
  filter.type = "lowpass";
  filter.frequency.value = 920;
  filter.Q.value = 0.5;
  compressor.threshold.value = -24;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.02;
  compressor.release.value = 0.28;

  lfo.type = "sine";
  lfo.frequency.value = 0.09;
  lfoGain.gain.value = 120;

  oscillators.forEach((oscillator, index) => {
    oscillator.connect(oscillatorGains[index]);
    oscillatorGains[index].connect(bedGain);
    oscillator.start();
  });

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  bedGain.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(context.destination);

  const shimmerInterval = window.setInterval(() => {
    if (context.state !== "running") {
      return;
    }

    const tone = context.createOscillator();
    const toneGain = context.createGain();
    const shimmerFilter = context.createBiquadFilter();
    const now = context.currentTime;
    const notes = [523.25, 659.25, 783.99];

    tone.type = "sine";
    tone.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    shimmerFilter.type = "bandpass";
    shimmerFilter.frequency.value = 1200;
    shimmerFilter.Q.value = 0.8;
    toneGain.gain.setValueAtTime(0, now);
    toneGain.gain.linearRampToValueAtTime(0.014, now + 0.3);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

    tone.connect(shimmerFilter);
    shimmerFilter.connect(toneGain);
    toneGain.connect(masterGain);
    tone.start(now);
    tone.stop(now + 2.4);
  }, 6400);

  return {
    context,
    masterGain,
    shimmerInterval,
    stop() {
      window.clearInterval(shimmerInterval);
      oscillators.forEach((oscillator) => oscillator.stop());
      lfo.stop();
      context.close().catch(() => undefined);
    },
  };
}

function shouldShowTravelIntro() {
  if (typeof window === "undefined") {
    return false;
  }

  return !window.matchMedia(
    "(max-width: 760px), (pointer: coarse), (prefers-reduced-motion: reduce)"
  ).matches;
}

export function TravelPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const ambientEngineRef = useRef<ReturnType<typeof createAmbientEngine> | null>(null);
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("travel");
  const nextSite = getNextSite("travel");
  const travel = content.travel;
  const destinations = travel.destinations ?? [];
  const metrics = travel.metrics ?? [];
  const inclusions = travel.inclusions ?? [];

  useDocumentTitle(siteMeta.title);

  const [activeDestinationId, setActiveDestinationId] = useState(() => destinations[0]?.id ?? "");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [transitionImage, setTransitionImage] = useState<string>(defaultProfile.image);
  const [isDestinationTransitioning, setIsDestinationTransitioning] = useState(false);
  const [showIntro, setShowIntro] = useState(() => shouldShowTravelIntro());
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const { handlePointerDown, handlePointerLeave, handlePointerMove, handlePointerUp } =
    usePointerGlow({
      pageRef,
      cursorAuraRef,
      cursorDotRef,
      interactiveSelector: "a, button",
      lerp: 0.16,
    });

  useEffect(() => {
    if (destinations.length === 0) {
      setActiveDestinationId("");
      setActiveDayIndex(0);
      return;
    }

    if (!destinations.some((destination) => destination.id === activeDestinationId)) {
      setActiveDestinationId(destinations[0].id);
      setActiveDayIndex(0);
    }
  }, [activeDestinationId, destinations]);

  const activeDestination =
    destinations.find((destination) => destination.id === activeDestinationId) ?? destinations[0];

  useEffect(() => {
    setActiveDayIndex(0);
  }, [activeDestinationId]);

  const activeProfile = useMemo(
    () => getDestinationProfile(activeDestination?.id),
    [activeDestination?.id]
  );

  const itinerary = activeDestination?.itinerary ?? [];

  useEffect(() => {
    if (itinerary.length === 0) {
      setActiveDayIndex(0);
      return;
    }

    if (activeDayIndex > itinerary.length - 1) {
      setActiveDayIndex(0);
    }
  }, [activeDayIndex, itinerary]);

  const activeDay = itinerary[activeDayIndex] ?? itinerary[0];
  const activeDestinationIndex = Math.max(
    destinations.findIndex((destination) => destination.id === activeDestination?.id),
    0
  );

  const destinationCards = useMemo(
    () =>
      destinations.map((destination, index) => ({
        destination,
        index,
        profile: getDestinationProfile(destination.id),
      })),
    [destinations]
  );

  const pageStyle = {
    ["--travel-accent" as string]: activeProfile.accent,
    ["--travel-deep" as string]: activeProfile.deep,
    ["--travel-soft" as string]: activeProfile.soft,
    ["--travel-glow" as string]: activeProfile.glow,
  } as CSSProperties;

  useSectionVisibility({
    pageRef,
    onSectionChange: setActiveSection,
    rootMargin: "-12% 0px -18% 0px",
    threshold: [0.35],
    visibleBottomRatio: 0.1,
    visibleTopRatio: 0.95,
  });

  useEffect(() => {
    if (!isDestinationTransitioning) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsDestinationTransitioning(false);
    }, 620);

    return () => window.clearTimeout(timeoutId);
  }, [isDestinationTransitioning]);

  useEffect(() => {
    if (!showIntro) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowIntro(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [showIntro]);

  useEffect(() => {
    return () => {
      ambientEngineRef.current?.stop();
      ambientEngineRef.current = null;
    };
  }, []);

  function handleSurfaceMove(event: ReactPointerEvent<HTMLElement>) {
    applySurfaceMotion(event, surfaceMotionOptions);
  }

  function handleSurfaceLeave(event: ReactPointerEvent<HTMLElement>) {
    resetSurfaceMotion(event, surfaceMotionOptions);
  }

  function activateDestination(destinationId: string) {
    if (destinationId === activeDestinationId) {
      return;
    }

    setTransitionImage(getDestinationProfile(destinationId).image);
    setIsDestinationTransitioning(true);

    startTransition(() => {
      setActiveDestinationId(destinationId);
      setActiveDayIndex(0);
    });
  }

  async function toggleAmbientSound() {
    if (!ambientEngineRef.current) {
      ambientEngineRef.current = createAmbientEngine();
    }

    const engine = ambientEngineRef.current;

    if (!engine) {
      return;
    }

    try {
      await engine.context.resume();
    } catch {
      return;
    }

    if (isAmbientOn) {
      engine.masterGain.gain.cancelScheduledValues(engine.context.currentTime);
      engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, engine.context.currentTime);
      engine.masterGain.gain.linearRampToValueAtTime(0, engine.context.currentTime + 0.9);
      setIsAmbientOn(false);
      return;
    }

    engine.masterGain.gain.cancelScheduledValues(engine.context.currentTime);
    engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, engine.context.currentTime);
    engine.masterGain.gain.linearRampToValueAtTime(0.08, engine.context.currentTime + 1.2);
    setIsAmbientOn(true);
  }

  return (
    <main
      className={styles.page}
      data-cursor="hidden"
      data-pressed="false"
      data-intro={showIntro ? "visible" : "hidden"}
      ref={pageRef}
      style={pageStyle}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={`${styles.loadingScreen}${showIntro ? ` ${styles.loadingScreenVisible}` : ""}`}>
        <div className={styles.loadingScreenBackdrop} />
        <div className={styles.loadingBrand}>
          <div className={styles.loadingSeal}>
            <span>RC</span>
          </div>
          <p>Ruta Cobalto Private Journeys</p>
          <strong>Preparando una entrada mas cinematografica.</strong>
          <div className={styles.loadingBar}>
            <span className={styles.loadingBarFill} />
          </div>
        </div>
      </div>

      <div
        className={`${styles.transitionVeil}${
          isDestinationTransitioning ? ` ${styles.transitionVeilActive}` : ""
        }`}
        style={{ backgroundImage: `url(${transitionImage})` }}
      />
      <div className={styles.cursorAura} ref={cursorAuraRef} />
      <div className={styles.cursorDot} ref={cursorDotRef} />

      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <div className={styles.brandMark} aria-hidden="true">
            <span>RC</span>
            <div className={styles.brandMarkRing} />
            <div className={styles.brandMarkLine} />
          </div>

          <div>
            <span className={styles.brandLabel}>Voyages editados</span>
            <strong className={styles.brandName}>{siteMeta.title}</strong>
          </div>
        </div>

        <nav className={styles.navLinks} aria-label="Navegacion Ruta Cobalto">
          <a className={activeSection === "destinos" ? styles.navLinkActive : ""} href="#destinos">
            Destinos
          </a>
          <a
            className={activeSection === "itinerario" ? styles.navLinkActive : ""}
            href="#itinerario"
          >
            Itinerario
          </a>
          <a className={activeSection === "postales" ? styles.navLinkActive : ""} href="#postales">
            Postales
          </a>
          <a className={activeSection === "cierre" ? styles.navLinkActive : ""} href="#cierre">
            Cierre
          </a>
        </nav>

        <div className={styles.topbarActions}>
          <button
            aria-pressed={isAmbientOn}
            className={`${styles.soundButton}${isAmbientOn ? ` ${styles.soundButtonActive}` : ""}`}
            type="button"
            onClick={toggleAmbientSound}
          >
            <span>{isAmbientOn ? "Ambient on" : "Ambient off"}</span>
          </button>
          <Link className={styles.backLink} to="/">
            Volver al catalogo
          </Link>
          <Link className={styles.workspaceLink} to="/workspace?site=travel">
            Editar contenido
          </Link>
          <Link className={styles.nextLink} to={nextSite.route}>
            <span>Siguiente demo</span>
            <strong>{nextSite.title}</strong>
          </Link>
        </div>
      </header>

      <section
        className={styles.hero}
        data-section-id="hero"
        data-visible="true"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div
          className={styles.heroBackdrop}
          style={{ backgroundImage: `url(${defaultProfile.image})` }}
        />
        <video
          autoPlay
          className={styles.heroVideo}
          loop
          muted
          playsInline
          poster={defaultProfile.image}
        >
          <source src="/videos/travel/hero-escape.mp4" type="video/mp4" />
        </video>
        <div
          className={styles.heroActiveLayer}
          style={{ backgroundImage: `url(${activeProfile.image})` }}
        />

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroSignature}>
              <span className={styles.signatureLine} />
              <strong>Ruta Cobalto Private Journeys</strong>
            </div>
            <p className={styles.eyebrow}>{siteMeta.category}</p>
            <h1 className={styles.heroTitle}>
              <span>Rutas que se sienten</span>
              <em>antes</em>
              <span>de reservar.</span>
            </h1>
            <p className={styles.heroLead}>
              {siteMeta.description} Ahora la pagina vive a pantalla completa, con imagen,
              aire, ritmo y una lectura mucho mas cinematografica.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryCta} href="#destinos">
                Explorar rutas
              </a>
              <a className={styles.secondaryCta} href="#itinerario">
                Ver recorrido
              </a>
            </div>

            <div className={styles.metricStrip}>
              {metrics.map((metric, index) => (
                <article
                  className={styles.metricItem}
                  key={createCompositeKey(metric.label, metric.value, index)}
                >
                  <strong>{metric.value}</strong>
                  <p>{metric.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaTop}>
              <span className={styles.metaLabel}>Ruta activa</span>
              <strong className={styles.metaTitle}>{activeDestination?.name ?? siteMeta.title}</strong>
              <p className={styles.metaText}>
                {activeDestination?.headline ?? activeProfile.atmosphere}
              </p>
            </div>

            <div className={styles.heroMetaFlow}>
              <div>
                <small>Atmosphere</small>
                <strong>{activeProfile.atmosphere}</strong>
              </div>
              <div>
                <small>Base</small>
                <strong>{activeProfile.stay}</strong>
              </div>
              <div>
                <small>Mood</small>
                <strong>{activeProfile.mood}</strong>
              </div>
            </div>

            <div className={styles.heroTags}>
              {siteMeta.tags.map((tag, index) => (
                <span key={createCompositeKey(tag, index)}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroRibbon}>
          {destinationCards.map(({ destination, index }) => (
            <button
              key={destination.id}
              type="button"
              className={`${styles.ribbonItem}${
                destination.id === activeDestinationId ? ` ${styles.ribbonItemActive}` : ""
              }`}
              aria-pressed={destination.id === activeDestinationId}
              onClick={() => {
                activateDestination(destination.id);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{destination.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section
        className={styles.atlasSection}
        id="destinos"
        data-section-id="destinos"
        data-visible="false"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div
          className={styles.sectionBackdrop}
          style={{ backgroundImage: `url(${activeProfile.image})` }}
        />

        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Atlas inmersivo</p>
            <h2>Los destinos ya no viven en tarjetas: ocupan la pantalla y marcan el tono completo.</h2>
            <p>
              Cada cambio altera la foto, el color, el ritmo y la narrativa comercial del
              producto.
            </p>
          </div>

          <div className={styles.atlasLayout}>
            <div className={styles.destinationList}>
              {destinationCards.map(({ destination, index, profile }) => (
                <button
                  key={destination.id}
                  type="button"
                  className={`${styles.destinationRow}${
                    destination.id === activeDestinationId ? ` ${styles.destinationRowActive}` : ""
                  }`}
                  aria-pressed={destination.id === activeDestinationId}
                  onClick={() => {
                    activateDestination(destination.id);
                  }}
                >
                  <span className={styles.destinationIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.destinationMain}>
                    <strong>{destination.name}</strong>
                    <p>{destination.summary}</p>
                  </div>
                  <small>{profile.mood}</small>
                </button>
              ))}
            </div>

            {activeDestination ? (
              <div className={styles.destinationStory}>
                <div className={styles.storyCount}>
                  {String(activeDestinationIndex + 1).padStart(2, "0")}
                </div>
                <p className={styles.storyKicker}>{activeDestination.season}</p>
                <h2>{activeDestination.headline}</h2>
                <p className={styles.storyLead}>{activeProfile.atmosphere}</p>

                <div className={styles.storyHighlights}>
                  {activeDestination.highlights.map((highlight, index) => (
                    <span key={createCompositeKey(highlight, index)}>{highlight}</span>
                  ))}
                </div>

                <div className={styles.storyFacts}>
                  <div>
                    <small>Base recomendada</small>
                    <strong>{activeProfile.stay}</strong>
                  </div>
                  <div>
                    <small>Cadencia</small>
                    <strong>{itinerary.length} momentos visibles</strong>
                  </div>
                  <div>
                    <small>Estilo</small>
                    <strong>{siteMeta.summary}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>Agrega al menos un destino desde el editor local.</div>
            )}
          </div>
        </div>
      </section>

      <section
        className={styles.itinerarySection}
        id="itinerario"
        data-section-id="itinerario"
        data-visible="false"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div
          className={styles.itineraryBackdrop}
          style={{ backgroundImage: `url(${activeProfile.image})` }}
        />

        <div className={styles.sectionInner}>
          <div className={styles.itineraryHeading}>
            <p className={styles.eyebrow}>Secuencia del viaje</p>
            <h2>El itinerario ya no es un recuadro aparte: flota sobre la escena principal.</h2>
          </div>

          <div className={styles.itineraryLayout}>
            <div className={styles.dayRail}>
              {itinerary.map((day, index) => (
                <button
                  key={createCompositeKey(day.label, day.title, index)}
                  type="button"
                  className={`${styles.dayRow}${
                    index === activeDayIndex ? ` ${styles.dayRowActive}` : ""
                  }`}
                  aria-pressed={index === activeDayIndex}
                  onClick={() => {
                    startTransition(() => setActiveDayIndex(index));
                  }}
                >
                  <span>{day.label}</span>
                  <strong>{day.title}</strong>
                </button>
              ))}
            </div>

            {activeDay ? (
              <article className={styles.dayStage}>
                <span className={styles.dayLabel}>{activeDay.label}</span>
                <h2>{activeDay.title}</h2>
                <p>{activeDay.copy}</p>

                <div className={styles.daySignals}>
                  <div>
                    <small>Destino</small>
                    <strong>{activeDestination?.name ?? "Ruta abierta"}</strong>
                  </div>
                  <div>
                    <small>Season</small>
                    <strong>{activeDestination?.season ?? "Flexible"}</strong>
                  </div>
                  <div>
                    <small>Mood</small>
                    <strong>{activeProfile.mood}</strong>
                  </div>
                </div>
              </article>
            ) : (
              <div className={styles.emptyState}>Aun no hay dias configurados para esta ruta.</div>
            )}
          </div>

          <div className={styles.inclusionRibbon}>
            {inclusions.map((item, index) => (
              <span key={createCompositeKey(item, index)}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.postalSection}
        id="postales"
        data-section-id="postales"
        data-visible="false"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Postales</p>
            <h2>Mas imagen, mas escala y menos interfaz encerrada.</h2>
            <p>
              La marca ahora se construye como una serie de escenas de viaje, con capitas
              de luz, movimiento lento y texto superpuesto.
            </p>
          </div>

          <div className={styles.postalGrid}>
            {destinationCards.map(({ destination, index, profile }) => (
              <article
                className={styles.postalFrame}
                key={destination.id}
                onPointerLeave={handleSurfaceLeave}
                onPointerMove={handleSurfaceMove}
              >
                <img
                  alt={profile.alt}
                  className={styles.postalImage}
                  decoding="async"
                  src={profile.image}
                />
                <div className={styles.postalShade} />
                <div className={styles.postalCopy}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{destination.name}</strong>
                  <p>{profile.atmosphere}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.closingSection}
        id="cierre"
        data-section-id="cierre"
        data-visible="false"
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
      >
        <div
          className={styles.sectionBackdrop}
          style={{ backgroundImage: `url(${activeProfile.image})` }}
        />

        <div className={styles.sectionInner}>
          <div className={styles.closingLayout}>
            <div className={styles.closingCopy}>
              <p className={styles.eyebrow}>Uso del demo</p>
              <h2>Ahora se lee como una marca de viajes propia, amplia y mucho menos "web de catalogo".</h2>
              <p>
                Puedes cambiar rutas, dias e inclusiones reales desde el editor local sin
                perder esta direccion premium de fotos, tipografia y pantalla completa.
              </p>

              <div className={styles.closingActions}>
                <Link className={styles.primaryCta} to="/workspace?site=travel">
                  Editar Ruta Cobalto
                </Link>
                <Link className={styles.secondaryCta} to={nextSite.route}>
                  Ver {nextSite.title}
                </Link>
              </div>
            </div>

            <div className={styles.closingNotes}>
              <div>
                <small>Visual</small>
                <strong>Pantalla completa</strong>
              </div>
              <div>
                <small>Tipografia</small>
                <strong>Editorial de viaje</strong>
              </div>
              <div>
                <small>Efecto</small>
                <strong>Luz, grano y profundidad</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
