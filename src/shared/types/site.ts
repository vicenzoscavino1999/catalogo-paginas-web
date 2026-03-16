export type SiteKey =
  | "restaurant"
  | "studio"
  | "shop"
  | "travel"
  | "moto"
  | "tablecor";

export type SiteCategory = string;

export interface SitePreview {
  key: SiteKey;
  route: string;
  title: string;
  category: SiteCategory;
  accent: string;
  description: string;
  summary: string;
  tags: string[];
}

export interface MetricItem {
  value: string;
  label: string;
}
