import type {
  StudioCaseStudy,
  StudioDiscipline,
} from "@/shared/content/contentTypes";
import type { MetricItem } from "@/shared/types/site";
import {
  getCaseProfile,
  type StudioProfile,
  normalizeStudioValue,
} from "@/features/studio/studioProfiles";

export interface StudioCasePreview {
  caseItem: StudioCaseStudy;
  profile: StudioProfile;
}

export interface StudioGalleryCard extends StudioCasePreview {
  index: number;
}

export function getStudioCaseFilters(caseStudies: StudioCaseStudy[]) {
  return ["Todos", ...new Set(caseStudies.map((item) => item.focus))];
}

export function getVisibleStudioCases(caseStudies: StudioCaseStudy[], activeFilter: string) {
  return activeFilter === "Todos"
    ? caseStudies
    : caseStudies.filter((item) => item.focus === activeFilter);
}

export function getMatchingStudioDiscipline(
  disciplines: StudioDiscipline[],
  focus: string | undefined
) {
  if (!focus) {
    return undefined;
  }

  return disciplines.find(
    (discipline) => normalizeStudioValue(discipline.label) === normalizeStudioValue(focus)
  );
}

export function getRelatedStudioCases(
  caseStudies: StudioCaseStudy[],
  selectedDiscipline: StudioDiscipline | undefined
) {
  if (!selectedDiscipline) {
    return [];
  }

  return caseStudies.filter(
    (item) => normalizeStudioValue(item.focus) === normalizeStudioValue(selectedDiscipline.label)
  );
}

export function createStudioHeroMetrics(
  metrics: MetricItem[],
  relatedCases: StudioCaseStudy[],
  selectedDiscipline: StudioDiscipline | undefined
) {
  const metricItems = [...metrics];

  if (relatedCases.length > 0) {
    metricItems.push({
      value: `${relatedCases.length} casos`,
      label: `Prueba activa para ${selectedDiscipline?.label ?? "la disciplina actual"}`,
    });
  }

  return metricItems.slice(0, 4);
}

export function createStudioHeroCasePreviews(
  relatedCases: StudioCaseStudy[],
  caseStudies: StudioCaseStudy[]
): StudioCasePreview[] {
  const source = relatedCases.length > 0 ? relatedCases : caseStudies;

  return source.slice(0, 2).map((caseItem) => ({
    caseItem,
    profile: getCaseProfile(caseItem.name),
  }));
}

export function createStudioGalleryCards(caseStudies: StudioCaseStudy[]): StudioGalleryCard[] {
  return caseStudies.slice(0, 4).map((caseItem, index) => ({
    caseItem,
    index,
    profile: getCaseProfile(caseItem.name),
  }));
}
