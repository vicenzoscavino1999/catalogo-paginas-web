import type { CSSProperties } from "react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogHeroSection,
  CatalogListSection,
  CatalogSystemSection,
  CatalogTopbar,
} from "@/features/catalog/CatalogSections";
import {
  catalogSectionOrder,
  getCatalogSectionLabel,
  getSiteScene,
  surfaceMotionOptions,
} from "@/features/catalog/catalog.config";
import {
  type CatalogCategory,
  createCatalogCategories,
  createCatalogDossier,
  createCatalogHeroSignals,
  createCatalogManifesto,
  createCatalogMarqueeItems,
  createCatalogPreviewSites,
  createCatalogSignals,
  createCatalogSystemShowcase,
  filterCatalogSites,
  getNextCatalogSiteKey,
  resolveActiveCatalogSite,
} from "@/features/catalog/catalog.logic";
import { useCatalogScrollMotion } from "@/features/catalog/useCatalogScrollMotion";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import { createThrottledSurfaceMotion } from "@/shared/motion/surfaceMotion";
import styles from "@/features/catalog/catalog.module.css";

export function CatalogPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const scrollMeterValueRef = useRef<HTMLSpanElement | null>(null);
  const activationLockUntilRef = useRef(0);
  const rotationPauseUntilRef = useRef(0);
  const { content, siteRegistry } = useMvpContent();
  const catalog = content.catalog;
  const featuredSite = siteRegistry.find((site) => site.key === "moto") ?? siteRegistry[0];
  const categories = useMemo(() => createCatalogCategories(siteRegistry), [siteRegistry]);

  useDocumentTitle("Catalogo");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategory>("Todos");
  const [activeSiteKey, setActiveSiteKey] = useState<string>(featuredSite.key);
  const [activeSection, setActiveSection] = useState("hero");
  const [transitionImage, setTransitionImage] = useState<string>(getSiteScene(featuredSite.key).image);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const { handlePointerLeave, handlePointerMove } = usePointerGlow({
    pageRef,
    cursorAuraRef,
    cursorDotRef,
    initialX: "50vw",
    initialY: "34vh",
    lerp: 0.22,
    auraRotateDeg: -12,
  });
  const { isTopbarCompact, isTopbarHidden } = useScrollChrome({
    compactThreshold: 86,
    hideThreshold: 40,
    progressTarget: pageRef,
    progressTextTarget: scrollMeterValueRef,
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

  const activeSite = resolveActiveCatalogSite(activeSiteKey, visibleSites, siteRegistry, featuredSite);
  const activeScene = getSiteScene(activeSite.key);
  const activeSectionLabel = getCatalogSectionLabel(activeSection);
  const heroSignals = useMemo(
    () => createCatalogHeroSignals(siteRegistry, categories),
    [categories, siteRegistry]
  );
  const previewSites = useMemo(
    () => createCatalogPreviewSites(activeSite, visibleSites, siteRegistry),
    [activeSite, siteRegistry, visibleSites]
  );
  const sidePreviewSite = previewSites.find((site) => site.key !== activeSite.key) ?? activeSite;
  const sidePreviewScene = getSiteScene(sidePreviewSite.key);
  const activeDossier = useMemo(() => createCatalogDossier(activeSite), [activeSite]);
  const marqueeItems = useMemo(
    () => createCatalogMarqueeItems(siteRegistry, categories, catalog.noteTitle),
    [catalog.noteTitle, categories, siteRegistry]
  );
  const catalogSignals = useMemo(
    () => createCatalogSignals(category, deferredQuery, query, activeSite),
    [activeSite, category, deferredQuery, query]
  );
  const systemShowcase = useMemo(
    () => createCatalogSystemShowcase(activeSite, siteRegistry),
    [activeSite, siteRegistry]
  );
  const heroManifesto = useMemo(() => createCatalogManifesto(catalog), [catalog]);

  const pageStyle = {
    ["--theme-accent" as string]: activeSite.accent,
    ["--page-pointer-x" as string]: "50vw",
    ["--page-pointer-y" as string]: "34vh",
    ["--scroll-progress" as string]: "0",
    ["--hero-progress" as string]: "0",
    ["--hero-focus" as string]: "0",
    ["--hero-depth" as string]: "0",
    ["--catalogo-progress" as string]: "0",
    ["--catalogo-focus" as string]: "0",
    ["--catalogo-depth" as string]: "0",
    ["--sistema-progress" as string]: "0",
    ["--sistema-focus" as string]: "0",
    ["--sistema-depth" as string]: "0",
  } as CSSProperties;

  const handleSectionChange = useCallback(
    (sectionId: string) => setActiveSection(sectionId),
    []
  );

  useCatalogScrollMotion({
    pageRef,
    sectionIds: catalogSectionOrder,
    onSectionChange: handleSectionChange,
  });

  useEffect(() => {
    if (activeSection !== "hero" || visibleSites.length < 2 || deferredQuery.length > 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (
        Date.now() < rotationPauseUntilRef.current ||
        Date.now() < activationLockUntilRef.current
      ) {
        return;
      }

      setActiveSiteKey((current) => {
        const nextSiteKey = getNextCatalogSiteKey(current, visibleSites);

        if (nextSiteKey !== current) {
          setTransitionImage(getSiteScene(current).image);
          setIsSceneTransitioning(true);
        }

        return nextSiteKey;
      });
    }, 7200);

    return () => window.clearInterval(intervalId);
  }, [activeSection, deferredQuery.length, visibleSites]);

  useEffect(() => {
    if (!isSceneTransitioning) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSceneTransitioning(false);
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [isSceneTransitioning]);

  function pauseRotation(duration = 8200) {
    rotationPauseUntilRef.current = Date.now() + duration;
  }

  function activateSite(siteKey: string) {
    const now = Date.now();

    if (siteKey === activeSiteKey) {
      pauseRotation();
      return;
    }

    if (now < activationLockUntilRef.current) {
      return;
    }

    activationLockUntilRef.current = now + 520;
    pauseRotation();
    setTransitionImage(activeScene.image);
    setIsSceneTransitioning(true);
    setActiveSiteKey(siteKey);
  }

  const surfaceMotionRef = useRef<ReturnType<typeof createThrottledSurfaceMotion> | null>(null);

  if (!surfaceMotionRef.current) {
    surfaceMotionRef.current = createThrottledSurfaceMotion(surfaceMotionOptions);
  }

  useEffect(() => {
    return () => surfaceMotionRef.current?.dispose();
  }, []);

  const handleSurfaceMove = surfaceMotionRef.current.handleMove;
  const handleSurfaceLeave = surfaceMotionRef.current.handleLeave;

  return (
    <main
      className={styles.page}
      data-cursor="hidden"
      data-active-section={activeSection}
      ref={pageRef}
      style={pageStyle}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.pageGlow} />
      <div className={styles.cursorAura} ref={cursorAuraRef} />
      <div className={styles.cursorDot} ref={cursorDotRef} />
      <div className={styles.scrollMeter} aria-hidden="true">
        <span className={styles.scrollMeterLine} />
        <span className={styles.scrollMeterFill} />
        <div className={styles.scrollMeterSteps}>
          {catalogSectionOrder.map((sectionKey) => (
            <span
              className={`${styles.scrollMeterStep}${activeSection === sectionKey ? ` ${styles.scrollMeterStepActive}` : ""
                }`}
              key={sectionKey}
            >
              <span className={styles.scrollMeterStepDot} />
              <span className={styles.scrollMeterStepText}>{getCatalogSectionLabel(sectionKey)}</span>
            </span>
          ))}
        </div>
        <span className={styles.scrollMeterValue} ref={scrollMeterValueRef}>0%</span>
        <span className={styles.scrollMeterLabel}>{activeSectionLabel}</span>
      </div>

      <CatalogTopbar
        activeSection={activeSection}
        activeSite={activeSite}
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
          heroSignals={heroSignals}
          isSceneTransitioning={isSceneTransitioning}
          marqueeItems={marqueeItems}
          onPointerLeave={handleSurfaceLeave}
          onPointerMove={handleSurfaceMove}
          previewSites={previewSites}
          sidePreviewScene={sidePreviewScene}
          sidePreviewSite={sidePreviewSite}
          transitionImage={transitionImage}
        />

        <CatalogListSection
          activeSite={activeSite}
          activateSite={activateSite}
          catalogSignals={catalogSignals}
          categories={categories}
          category={category}
          onPointerLeave={handleSurfaceLeave}
          onPointerMove={handleSurfaceMove}
          onQueryChange={(value) => {
            pauseRotation();
            setQuery(value);
          }}
          onSelectCategory={(nextCategory) => {
            pauseRotation();
            setCategory(nextCategory);
          }}
          query={query}
          visibleSites={visibleSites}
        />

        <CatalogSystemSection
          catalog={catalog}
          featuredSite={featuredSite}
          onPointerLeave={handleSurfaceLeave}
          onPointerMove={handleSurfaceMove}
          systemShowcase={systemShowcase}
        />
      </div>
    </main>
  );
}
