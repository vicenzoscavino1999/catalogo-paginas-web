import { describe, expect, it } from "vitest";
import type { StudioCaseStudy, StudioDiscipline } from "@/shared/content/contentTypes";
import type { MetricItem } from "@/shared/types/site";
import {
  createStudioHeroCasePreviews,
  createStudioHeroMetrics,
  getMatchingStudioDiscipline,
  getStudioCaseFilters,
} from "@/features/studio/studioSelectors";

const disciplines: StudioDiscipline[] = [
  {
    id: "branding",
    label: "Branding",
    summary: "Sistema verbal y visual.",
    deliverables: ["Territorio"],
  },
  {
    id: "campanas",
    label: "Campanas",
    summary: "Lanzamientos con direccion.",
    deliverables: ["Assets"],
  },
];

const caseStudies: StudioCaseStudy[] = [
  {
    name: "Hotel Vela",
    focus: "Branding",
    sector: "Hospitalidad",
    result: "Sistema editorial.",
  },
  {
    name: "Marea Studio",
    focus: "Campanas",
    sector: "Moda",
    result: "Salida de temporada.",
  },
  {
    name: "Orbita SaaS",
    focus: "Branding",
    sector: "Software",
    result: "Narrativa de producto.",
  },
];

describe("studioSelectors", () => {
  it("creates case filters with Todos first and deduped focuses", () => {
    expect(getStudioCaseFilters(caseStudies)).toEqual(["Todos", "Branding", "Campanas"]);
  });

  it("matches disciplines with normalized focus text", () => {
    expect(getMatchingStudioDiscipline(disciplines, "campañas")?.id).toBe("campanas");
  });

  it("adds related case count to hero metrics and builds previews", () => {
    const metrics: MetricItem[] = [{ value: "3", label: "Casos" }];
    const relatedCases = caseStudies.filter((caseItem) => caseItem.focus === "Branding");

    const heroMetrics = createStudioHeroMetrics(metrics, relatedCases, disciplines[0]);
    const previews = createStudioHeroCasePreviews(relatedCases, caseStudies);

    expect(heroMetrics).toEqual([
      { value: "3", label: "Casos" },
      { value: "2 casos", label: "Prueba activa para Branding" },
    ]);
    expect(previews.map((item) => item.caseItem.name)).toEqual(["Hotel Vela", "Orbita SaaS"]);
  });
});
