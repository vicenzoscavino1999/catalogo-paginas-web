import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import { mergeWithDefaults } from "@/shared/content/contentSchema";
import type { MvpContent, SiteMeta, SiteSectionKey } from "@/shared/content/contentTypes";
import { siteRegistry } from "@/shared/data/sites";
import type { SiteKey, SitePreview } from "@/shared/types/site";

const STORAGE_KEY = "catalogo-webs:mvp-content:v2";
const siteSectionKeys = new Set(siteRegistry.map((site) => site.key));

interface MvpContentContextValue {
  content: MvpContent;
  siteRegistry: SitePreview[];
  saveContentSection: <K extends keyof MvpContent>(key: K, value: MvpContent[K]) => void;
  resetContentSection: (key: keyof MvpContent) => void;
  resetAllContent: () => void;
  getSiteByKey: (siteKey: SiteKey) => SitePreview;
  getNextSite: (siteKey: SiteKey) => SitePreview;
}

const MvpContentContext = createContext<MvpContentContextValue | null>(null);

function readFromStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota/security errors and keep the in-memory state alive.
  }
}

function removeFromStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage quota/security errors when cleaning up broken state.
  }
}

function readStoredContent() {
  const defaults = createDefaultMvpContent();

  if (typeof window === "undefined") {
    return defaults;
  }

  const storedValue = readFromStorage(STORAGE_KEY);

  if (!storedValue) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(storedValue);
    return mergeStoredContent(defaults, parsed);
  } catch {
    removeFromStorage(STORAGE_KEY);
    return defaults;
  }
}

function mergeStoredContent(defaults: MvpContent, stored: unknown): MvpContent {
  if (!stored || typeof stored !== "object") {
    return defaults;
  }

  const parsed = stored as Partial<MvpContent>;

  return {
    ...defaults,
    catalog: mergeWithDefaults(defaults.catalog, parsed.catalog),
    sites: mergeWithDefaults(defaults.sites, parsed.sites),
    restaurant: mergeWithDefaults(defaults.restaurant, parsed.restaurant),
    studio: mergeWithDefaults(defaults.studio, parsed.studio),
    shop: mergeWithDefaults(defaults.shop, parsed.shop),
    tablecor: mergeWithDefaults(defaults.tablecor, parsed.tablecor),
    travel: mergeWithDefaults(defaults.travel, parsed.travel),
    moto: mergeWithDefaults(defaults.moto, parsed.moto),
  };
}

export function MvpContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<MvpContent>(() => readStoredContent());

  useEffect(() => {
    writeToStorage(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const derivedSiteRegistry = useMemo(
    () =>
      siteRegistry.map((site) => ({
        key: site.key,
        route: site.route,
        ...content.sites[site.key],
        tags: content.sites[site.key]?.tags ?? site.tags,
      })),
    [content.sites]
  );

  const saveContentSection = useCallback(
    <K extends keyof MvpContent>(key: K, value: MvpContent[K]) => {
      setContent((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const resetContentSection = useCallback((key: keyof MvpContent) => {
    const defaults = createDefaultMvpContent();
    setContent((current) => ({
      ...current,
      [key]: defaults[key],
    }));
  }, []);

  const resetAllContent = useCallback(() => {
    setContent(createDefaultMvpContent());
  }, []);

  const getSiteByKey = useCallback(
    (siteKey: SiteKey) => derivedSiteRegistry.find((site) => site.key === siteKey)!,
    [derivedSiteRegistry]
  );

  const getNextSite = useCallback(
    (siteKey: SiteKey) => {
      const currentIndex = derivedSiteRegistry.findIndex((site) => site.key === siteKey);
      return derivedSiteRegistry[(currentIndex + 1) % derivedSiteRegistry.length];
    },
    [derivedSiteRegistry]
  );

  const value = useMemo(
    () => ({
      content,
      siteRegistry: derivedSiteRegistry,
      saveContentSection,
      resetContentSection,
      resetAllContent,
      getSiteByKey,
      getNextSite,
    }),
    [
      content,
      derivedSiteRegistry,
      saveContentSection,
      resetContentSection,
      resetAllContent,
      getSiteByKey,
      getNextSite,
    ]
  );

  return <MvpContentContext.Provider value={value}>{children}</MvpContentContext.Provider>;
}

export function useMvpContent() {
  const context = useContext(MvpContentContext);

  if (!context) {
    throw new Error("useMvpContent must be used within MvpContentProvider");
  }

  return context;
}

export function isSiteSectionKey(value: string): value is SiteSectionKey {
  return siteSectionKeys.has(value as SiteKey);
}
