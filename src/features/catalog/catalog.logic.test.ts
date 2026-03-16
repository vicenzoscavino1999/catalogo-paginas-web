import { describe, expect, it } from "vitest";
import type { SitePreview } from "@/shared/types/site";
import {
  createCatalogCategories,
  createCatalogManifesto,
  createCatalogPreviewSites,
  filterCatalogSites,
  getNextCatalogSiteKey,
} from "@/features/catalog/catalog.logic";

const siteRegistry: SitePreview[] = [
  {
    key: "restaurant",
    route: "/restaurant",
    title: "Casa Brasa",
    category: "Gastronomia",
    accent: "#d56733",
    description: "Reservas y menu.",
    summary: "Premium.",
    tags: ["Reservas", "Chef"],
  },
  {
    key: "studio",
    route: "/studio",
    title: "Atelier Norte",
    category: "Creatividad",
    accent: "#2d6cca",
    description: "Casos y proceso.",
    summary: "Editorial.",
    tags: ["Branding"],
  },
  {
    key: "moto",
    route: "/moto",
    title: "Linea Apex Moto",
    category: "Motor",
    accent: "#cb3838",
    description: "Modelos y specs.",
    summary: "Performance.",
    tags: ["Specs"],
  },
];

describe("catalog.logic", () => {
  it("builds categories and filters sites by category/query", () => {
    expect(createCatalogCategories(siteRegistry)).toEqual([
      "Todos",
      "Gastronomia",
      "Creatividad",
      "Motor",
    ]);

    expect(filterCatalogSites(siteRegistry, "Motor", "")).toEqual([siteRegistry[2]]);
    expect(filterCatalogSites(siteRegistry, "Todos", "brand")).toEqual([siteRegistry[1]]);
  });

  it("keeps preview cards stable while still including the active site", () => {
    const previews = createCatalogPreviewSites(siteRegistry[2], siteRegistry, siteRegistry);

    expect(previews.map((site) => site.key)).toEqual(["restaurant", "studio", "moto"]);
    expect(getNextCatalogSiteKey("studio", [siteRegistry[1], siteRegistry[2]])).toBe("moto");
    expect(getNextCatalogSiteKey("missing", [siteRegistry[1], siteRegistry[2]])).toBe("studio");
  });

  it("limits manifesto cards to three items", () => {
    const manifesto = createCatalogManifesto({
      badge: "Catalogo",
      title: "Titulo",
      story: "Historia",
      noteTitle: "Nota",
      noteCopy: "Copy",
      pillars: [
        { title: "Uno", copy: "A" },
        { title: "Dos", copy: "B" },
      ],
      foundation: [
        { title: "Tres", copy: "C" },
        { title: "Cuatro", copy: "D" },
      ],
    });

    expect(manifesto).toHaveLength(3);
    expect(manifesto[0].index).toBe("01");
    expect(manifesto[2].title).toBe("Tres");
  });
});
