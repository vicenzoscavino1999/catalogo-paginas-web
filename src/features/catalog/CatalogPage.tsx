import type { CSSProperties } from "react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogIntroOverlay,
  CatalogHeroSection,
  CatalogListSection,
  CatalogSystemSection,
  CatalogTopbar,
} from "@/features/catalog/CatalogSections";
import {
  getSiteIntroPreview,
  getSiteScene,
} from "@/features/catalog/catalog.config";
import {
  type CatalogCategory,
  createCatalogCategories,
  createCatalogDossier,
  createCatalogManifesto,
  createCatalogMarqueeItems,
  createCatalogPreviewSites,
  createCatalogSystemShowcase,
  filterCatalogSites,
  getNextCatalogSiteKey,
  resolveActiveCatalogSite,
} from "@/features/catalog/catalog.logic";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import styles from "@/features/catalog/catalog.module.css";

type CatalogIntroState = "playing" | "exiting" | "hidden";

const INTRO_STORAGE_KEY = "catalog-home-intro:v1";
const INTRO_EXIT_MS = 560;
const INTRO_SCROLL_THRESHOLD = 108;
const INTRO_SCROLL_COOLDOWN_MS = 260;
const INTRO_TOUCH_THRESHOLD = 42;

function hasSeenCatalogIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "seen";
  } catch {
    return true;
  }
}

function markCatalogIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "seen");
  } catch {
    return;
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function CatalogPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const introCursorAuraRef = useRef<HTMLDivElement | null>(null);
  const introCursorDotRef = useRef<HTMLDivElement | null>(null);
  const activationLockUntilRef = useRef(0);
  const rotationPauseUntilRef = useRef(0);
  const introBootstrappedRef = useRef(false);
  const introWheelCarryRef = useRef(0);
  const introWheelLockedUntilRef = useRef(0);
  const introTouchStartYRef = useRef<number | null>(null);
  const { content, siteRegistry } = useMvpContent();
  const isWorkspacePreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewMode") === "workspace";
  const catalog = content.catalog;
  const featuredSite = siteRegistry.find((site) => site.key === "moto") ?? siteRegistry[0];
  const categories = useMemo(() => createCatalogCategories(siteRegistry), [siteRegistry]);

  useDocumentTitle("HazTuWeb");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategory>("Todos");
  const [activeSiteKey, setActiveSiteKey] = useState<string>(featuredSite.key);
  const [hoveredSiteKey, setHoveredSiteKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [introState, setIntroState] = useState<CatalogIntroState>("hidden");
  const [introIndex, setIntroIndex] = useState(0);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const { isTopbarCompact, isTopbarHidden } = useScrollChrome({
    compactThreshold: 86,
    hideThreshold: 40,
    trackProgress: false,
  });
  const {
    handlePointerDown: handleIntroPointerDown,
    handlePointerLeave: handleIntroPointerLeave,
    handlePointerMove: handleIntroPointerMove,
    handlePointerUp: handleIntroPointerUp,
  } = usePointerGlow({
    pageRef,
    cursorAuraRef: introCursorAuraRef,
    cursorDotRef: introCursorDotRef,
    interactiveSelector: "button, a",
    initialX: "50vw",
    initialY: "48vh",
    lerp: 0.1,
  });

  const visibleSites = useMemo(
    () => filterCatalogSites(siteRegistry, category, deferredQuery),
    [category, deferredQuery, siteRegistry]
  );

  useEffect(() => {
    if (category !== "Todos" && !categories.includes(category)) {
      setCategory("Todos");
    }
  }, [categories, category]);

  useEffect(() => {
    if (!visibleSites.some((site) => site.key === activeSiteKey)) {
      setActiveSiteKey(visibleSites[0]?.key ?? featuredSite.key);
    }
  }, [activeSiteKey, featuredSite.key, visibleSites]);

  useEffect(() => {
    if (hoveredSiteKey && !visibleSites.some((site) => site.key === hoveredSiteKey)) {
      setHoveredSiteKey(null);
    }
  }, [hoveredSiteKey, visibleSites]);

  useEffect(() => {
    if (activeSection !== "catalogo") {
      setHoveredSiteKey(null);
    }
  }, [activeSection]);

  const activeSite = resolveActiveCatalogSite(activeSiteKey, visibleSites, siteRegistry, featuredSite);
  const hoveredSite =
    hoveredSiteKey === null ? null : siteRegistry.find((site) => site.key === hoveredSiteKey) ?? null;
  const chromeSite = hoveredSite ?? activeSite;
  const activeScene = getSiteScene(activeSite.key);
  const rotationSites = visibleSites.length > 0 ? visibleSites : siteRegistry;
  const previewSites = useMemo(
    () => createCatalogPreviewSites(activeSite, visibleSites, siteRegistry),
    [activeSite, siteRegistry, visibleSites]
  );
  const nextPreviewSiteKey = getNextCatalogSiteKey(activeSite.key, rotationSites);
  const sidePreviewSite =
    previewSites.find((site) => site.key === nextPreviewSiteKey) ?? activeSite;
  const sidePreviewScene = getSiteScene(sidePreviewSite.key);
  const activeDossier = useMemo(() => createCatalogDossier(activeSite), [activeSite]);
  const marqueeItems = useMemo(
    () => createCatalogMarqueeItems(siteRegistry, categories, catalog.noteTitle),
    [catalog.noteTitle, categories, siteRegistry]
  );
  const introFrames = useMemo(
    () => [
      {
        accent: "#d7a57e",
        category: "Portafolio vivo",
        description:
          "HazTuWeb reune experiencias web con identidad propia, pensadas para presentar negocios, ideas y productos con presencia premium desde el primer scroll.",
        eyebrow: "Portafolio editorial de experiencias web",
        headline: "Una portada inicial para entrar al universo completo antes de recorrer cada demo.",
        previewImage: "/images/catalog-intro/haztuweb-cover.png",
        summary: "Portafolio vivo de experiencias web con identidad propia.",
        title: "HazTuWeb",
        variant: "cover" as const,
      },
      ...siteRegistry.map((site) => {
        const scene = getSiteScene(site.key);

        return {
          accent: site.accent,
          category: site.category,
          description: site.description,
          eyebrow: scene.eyebrow,
          headline: scene.headline,
          previewImage: getSiteIntroPreview(site.key),
          summary: site.summary,
          title: site.title,
          variant: "site" as const,
        };
      }),
    ],
    [siteRegistry]
  );
  const systemShowcase = useMemo(
    () => createCatalogSystemShowcase(activeSite, siteRegistry),
    [activeSite, siteRegistry]
  );
  const heroManifesto = useMemo(() => createCatalogManifesto(catalog), [catalog]);
  const activeIntroFrame = introFrames[introIndex] ?? introFrames[introFrames.length - 1];
  const isIntroFinalFrame = introFrames.length > 0 && introIndex === introFrames.length - 1;

  const pageStyle = {
    ["--theme-accent" as string]: chromeSite.accent,
  } as CSSProperties;

  const handleSectionChange = useCallback(
    (sectionId: string) => setActiveSection(sectionId),
    []
  );

  useSectionVisibility({
    pageRef,
    onSectionChange: handleSectionChange,
  });

  useEffect(() => {
    if (introBootstrappedRef.current || introFrames.length === 0) {
      return;
    }

    introBootstrappedRef.current = true;

    if (isWorkspacePreview || prefersReducedMotion() || hasSeenCatalogIntro()) {
      return;
    }

    setIntroIndex(0);
    setIntroState("playing");
  }, [introFrames.length, isWorkspacePreview]);

  useEffect(() => {
    if (introState === "hidden") {
      handleIntroPointerLeave();
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [handleIntroPointerLeave, introState]);

  useEffect(() => {
    if (introState !== "exiting") {
      return;
    }

    const exitId = window.setTimeout(() => {
      setIntroState("hidden");
    }, INTRO_EXIT_MS);

    return () => window.clearTimeout(exitId);
  }, [introState]);

  const handleContinueIntro = useCallback(() => {
    if (introState !== "playing") {
      return;
    }

    markCatalogIntroSeen();
    setIntroState("exiting");
  }, [introState]);

  useEffect(() => {
    if (introState !== "playing" || introFrames.length === 0) {
      return;
    }

    const lastFrameIndex = introFrames.length - 1;

    const moveIntro = (direction: -1 | 1) => {
      setIntroIndex((current) => {
        if (direction > 0) {
          return Math.min(current + 1, lastFrameIndex);
        }

        return Math.max(current - 1, 0);
      });
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.deltaY === 0) {
        return;
      }

      if (Date.now() < introWheelLockedUntilRef.current) {
        return;
      }

      introWheelCarryRef.current += event.deltaY;

      if (Math.abs(introWheelCarryRef.current) < INTRO_SCROLL_THRESHOLD) {
        return;
      }

      const direction = introWheelCarryRef.current > 0 ? 1 : -1;

      introWheelCarryRef.current = 0;
      introWheelLockedUntilRef.current = Date.now() + INTRO_SCROLL_COOLDOWN_MS;
      moveIntro(direction as -1 | 1);
    };

    const onTouchStart = (event: TouchEvent) => {
      introTouchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const startY = introTouchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY;

      introTouchStartYRef.current = null;

      if (startY === null || endY === undefined) {
        return;
      }

      const deltaY = startY - endY;

      if (Math.abs(deltaY) < INTRO_TOUCH_THRESHOLD) {
        return;
      }

      moveIntro(deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        moveIntro(1);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        moveIntro(-1);
        return;
      }

      if (event.key === "Enter" && isIntroFinalFrame) {
        event.preventDefault();
        handleContinueIntro();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      introWheelCarryRef.current = 0;
      introWheelLockedUntilRef.current = 0;
      introTouchStartYRef.current = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleContinueIntro, introFrames.length, introState, isIntroFinalFrame]);

  useEffect(() => {
    if (activeSection !== "hero" || deferredQuery.length > 0 || rotationSites.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      if (
        now < activationLockUntilRef.current ||
        now < rotationPauseUntilRef.current
      ) {
        return;
      }

      setActiveSiteKey((current) => getNextCatalogSiteKey(current, rotationSites));
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [activeSection, deferredQuery.length, rotationSites]);

  function activateSite(siteKey: string) {
    const now = Date.now();

    if (siteKey === activeSiteKey) {
      rotationPauseUntilRef.current = now + 10000;
      return;
    }

    if (now < activationLockUntilRef.current) {
      return;
    }

    activationLockUntilRef.current = now + 520;
    rotationPauseUntilRef.current = now + 10000;
    setActiveSiteKey(siteKey);
  }

  return (
    <main
      className={styles.page}
      data-active-section={activeSection}
      data-intro-state={introState}
      ref={pageRef}
      style={pageStyle}
    >
      {introState !== "hidden" && activeIntroFrame ? (
        <CatalogIntroOverlay
          activeFrame={activeIntroFrame}
          activeIndex={introIndex}
          cursorAuraRef={introCursorAuraRef}
          cursorDotRef={introCursorDotRef}
          frames={introFrames}
          isFinalFrame={isIntroFinalFrame}
          introState={introState}
          onContinue={handleContinueIntro}
          onPointerDown={handleIntroPointerDown}
          onPointerLeave={handleIntroPointerLeave}
          onPointerMove={handleIntroPointerMove}
          onPointerUp={handleIntroPointerUp}
        />
      ) : null}

      <CatalogTopbar
        activeSection={activeSection}
        activeSite={chromeSite}
        isTopbarCompact={isTopbarCompact}
        isTopbarHidden={isTopbarHidden}
      />

      <div className={styles.shell}>
        <CatalogHeroSection
          activeDossier={activeDossier}
          activeScene={activeScene}
          activeSite={activeSite}
          activateSite={activateSite}
          catalog={catalog}
          heroManifesto={heroManifesto}
          marqueeItems={marqueeItems}
          previewSites={previewSites}
          sidePreviewScene={sidePreviewScene}
          sidePreviewSite={sidePreviewSite}
        />

        <CatalogListSection
          activeSite={activeSite}
          activateSite={activateSite}
          categories={categories}
          category={category}
          clearHoveredSite={() => {
            setHoveredSiteKey(null);
          }}
          hoverSite={(siteKey) => {
            setHoveredSiteKey(siteKey);
          }}
          onQueryChange={(value) => {
            setQuery(value);
          }}
          onSelectCategory={(nextCategory) => {
            setCategory(nextCategory);
          }}
          query={query}
          visibleSites={visibleSites}
        />

        <CatalogSystemSection
          catalog={catalog}
          featuredSite={featuredSite}
          systemShowcase={systemShowcase}
        />
      </div>
    </main>
  );
}
