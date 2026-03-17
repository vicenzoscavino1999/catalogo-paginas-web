import type { CSSProperties } from "react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogHeroSection,
  CatalogListSection,
  CatalogSystemSection,
  CatalogTopbar,
} from "@/features/catalog/CatalogSections";
import {
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
  resolveActiveCatalogSite,
} from "@/features/catalog/catalog.logic";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import styles from "@/features/catalog/catalog.module.css";

export function CatalogPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const activationLockUntilRef = useRef(0);
  const { content, siteRegistry } = useMvpContent();
  const catalog = content.catalog;
  const featuredSite = siteRegistry.find((site) => site.key === "moto") ?? siteRegistry[0];
  const categories = useMemo(() => createCatalogCategories(siteRegistry), [siteRegistry]);

  useDocumentTitle("Catalogo");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategory>("Todos");
  const [activeSiteKey, setActiveSiteKey] = useState<string>(featuredSite.key);
  const [activeSection, setActiveSection] = useState("hero");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const { isTopbarCompact, isTopbarHidden } = useScrollChrome({
    compactThreshold: 86,
    hideThreshold: 40,
    trackProgress: false,
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
  const systemShowcase = useMemo(
    () => createCatalogSystemShowcase(activeSite, siteRegistry),
    [activeSite, siteRegistry]
  );
  const heroManifesto = useMemo(() => createCatalogManifesto(catalog), [catalog]);

  const pageStyle = {
    ["--theme-accent" as string]: activeSite.accent,
  } as CSSProperties;

  const handleSectionChange = useCallback(
    (sectionId: string) => setActiveSection(sectionId),
    []
  );

  useSectionVisibility({
    pageRef,
    onSectionChange: handleSectionChange,
  });

  function activateSite(siteKey: string) {
    const now = Date.now();

    if (siteKey === activeSiteKey) {
      return;
    }

    if (now < activationLockUntilRef.current) {
      return;
    }

    activationLockUntilRef.current = now + 520;
    setActiveSiteKey(siteKey);
  }

  return (
    <main
      className={styles.page}
      data-active-section={activeSection}
      ref={pageRef}
      style={pageStyle}
    >
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
