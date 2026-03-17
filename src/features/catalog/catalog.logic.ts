import { getSiteScene } from "@/features/catalog/catalog.config";
import type { CatalogContent } from "@/shared/content/contentTypes";
import type { SitePreview } from "@/shared/types/site";

export type CatalogCategory = string;

export interface CatalogSignal {
  copy: string;
  label: string;
  value: string;
}

export interface CatalogShowcaseSite extends SitePreview {
  scene: ReturnType<typeof getSiteScene>;
}

export function createCatalogCategories(siteRegistry: SitePreview[]) {
  return ["Todos", ...new Set(siteRegistry.map((site) => site.category))];
}

export function filterCatalogSites(
  siteRegistry: SitePreview[],
  category: CatalogCategory,
  normalizedQuery: string
) {
  return siteRegistry.filter((site) => {
    const matchesCategory = category === "Todos" || site.category === category;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [site.title, site.category, site.description, site.summary, ...(site.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}

export function resolveActiveCatalogSite(
  activeSiteKey: string,
  visibleSites: SitePreview[],
  siteRegistry: SitePreview[],
  featuredSite: SitePreview
) {
  return (
    visibleSites.find((site) => site.key === activeSiteKey) ??
    siteRegistry.find((site) => site.key === activeSiteKey) ??
    featuredSite
  );
}

export function createCatalogHeroSignals(siteRegistry: SitePreview[], categories: string[]) {
  return [
    {
      label: "Experiencias",
      value: `${siteRegistry.length}`,
      copy: "Cada demo ya tiene estructura, tono y comportamiento propios.",
    },
    {
      label: "Categorias",
      value: `${categories.length - 1}`,
      copy: "Desde gastronomia hasta motor, materiales o turismo.",
    },
    {
      label: "Modo local",
      value: "Editable",
      copy: "El contenido puede cambiarse desde el workspace sin tocar el layout.",
    },
  ];
}

export function createCatalogPreviewSites(
  activeSite: SitePreview,
  visibleSites: SitePreview[],
  siteRegistry: SitePreview[]
) {
  const pool = visibleSites.length > 0 ? visibleSites : siteRegistry;
  const leadingSites = pool.slice(0, 3);

  if (leadingSites.some((site) => site.key === activeSite.key)) {
    return leadingSites;
  }

  if (leadingSites.length === 0) {
    return [activeSite];
  }

  return [...leadingSites.slice(0, Math.max(leadingSites.length - 1, 0)), activeSite];
}

export function createCatalogDossier(activeSite: SitePreview): CatalogSignal[] {
  return [
    {
      label: "Categoria",
      value: activeSite.category,
      copy: activeSite.summary,
    },
    {
      label: "Focos",
      value: (activeSite.tags ?? []).slice(0, 2).join(" / ") || "Sin tags",
      copy: activeSite.description,
    },
    {
      label: "Modo",
      value: "Editable local",
      copy:
        "Puedes cambiar el contenido de esta demo desde el workspace sin alterar la direccion visual.",
    },
  ];
}

export function createCatalogMarqueeItems(
  siteRegistry: SitePreview[],
  categories: string[],
  noteTitle: string
) {
  return [
    ...siteRegistry.map((site) => site.title),
    ...categories.filter((item) => item !== "Todos"),
    noteTitle,
    "Contenido local",
    "React + TypeScript + Vite",
  ];
}

export function createCatalogSignals(
  category: CatalogCategory,
  normalizedQuery: string,
  rawQuery: string,
  activeSite: SitePreview
): CatalogSignal[] {
  return [
    {
      label: "Filtro activo",
      value: category === "Todos" ? "Portafolio completo" : category,
      copy:
        category === "Todos"
          ? "Estas viendo todas las industrias dentro de una sola portada editable."
          : `La navegacion ahora se concentra en ${category.toLowerCase()} sin perder continuidad visual.`,
    },
    {
      label: "Busqueda",
      value: normalizedQuery.length > 0 ? `"${rawQuery.trim()}"` : "Libre",
      copy:
        normalizedQuery.length > 0
          ? "La seleccion responde en tiempo real sobre titulos, categorias, descripciones y tags."
          : "Puedes buscar por palabras clave sin romper el ritmo editorial del catalogo.",
    },
    {
      label: "Demo foco",
      value: activeSite.title,
      copy: activeSite.summary,
    },
  ];
}

export function createCatalogSystemShowcase(
  activeSite: SitePreview,
  siteRegistry: SitePreview[]
): CatalogShowcaseSite[] {
  return [activeSite, ...siteRegistry.filter((site) => site.key !== activeSite.key)]
    .slice(0, 3)
    .map((site) => ({
      ...site,
      scene: getSiteScene(site.key),
    }));
}

export function createCatalogManifesto(catalog: CatalogContent) {
  return [...catalog.pillars, ...catalog.foundation].slice(0, 3).map((item, index) => ({
    ...item,
    index: `0${index + 1}`,
  }));
}

export function getNextCatalogSiteKey(currentKey: string, visibleSites: SitePreview[]) {
  const keys = visibleSites.map((site) => site.key);
  const currentIndex = keys.findIndex((key) => key === currentKey);

  if (currentIndex === -1) {
    return keys[0] ?? currentKey;
  }

  return keys[(currentIndex + 1) % keys.length] ?? currentKey;
}
