import type { MetricItem, SiteKey, SitePreview } from "@/shared/types/site";

export interface SiteMeta extends Omit<SitePreview, "route" | "key"> { }

export interface RestaurantHeroContent {
  eyebrow: string;
  title: string;
  story: string;
  image: string;
}

export interface RestaurantScene {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

export interface RestaurantMoment {
  title: string;
  copy: string;
}

export interface RestaurantMenuItem {
  name: string;
  price: string;
  description: string;
}

export interface RestaurantMenuGroup {
  id: string;
  label: string;
  note: string;
  items: RestaurantMenuItem[];
}

export interface RestaurantContent {
  hero: RestaurantHeroContent;
  metrics: MetricItem[];
  guestOptions: number[];
  reservationSlots: string[];
  menuGroups: RestaurantMenuGroup[];
  ambienceNotes: RestaurantMoment[];
  scenes: RestaurantScene[];
  serviceMoments: RestaurantMoment[];
}

export interface StudioDiscipline {
  id: string;
  label: string;
  summary: string;
  deliverables: string[];
}

export interface StudioCaseStudy {
  name: string;
  focus: string;
  sector: string;
  result: string;
}

export interface StudioWorkflowStep {
  title: string;
  copy: string;
}

export interface StudioContent {
  metrics: MetricItem[];
  disciplines: StudioDiscipline[];
  caseStudies: StudioCaseStudy[];
  workflow: StudioWorkflowStep[];
}

export interface ShopProduct {
  id: string;
  collection: string;
  name: string;
  price: number;
  badge: string;
  description: string;
}

export interface ShopBenefit {
  title: string;
  copy: string;
}

export interface ShopContent {
  metrics: MetricItem[];
  collections: string[];
  products: ShopProduct[];
  benefits: ShopBenefit[];
}

export interface TravelItineraryDay {
  label: string;
  title: string;
  copy: string;
}

export interface TravelDestination {
  id: string;
  name: string;
  season: string;
  headline: string;
  summary: string;
  highlights: string[];
  itinerary: TravelItineraryDay[];
}

export interface TravelContent {
  metrics: MetricItem[];
  destinations: TravelDestination[];
  inclusions: string[];
}

export interface MotoRideProfileItem {
  label: string;
  value: number;
  copy: string;
}

export interface MotoModel {
  id: string;
  name: string;
  family: string;
  useCase: string;
  accent: string;
  image: string;
  price: number;
  displacement: string;
  engine: string;
  power: string;
  torque: string;
  seatHeight: string;
  range: string;
  topSpeed: string;
  wetWeight: string;
  availability: string;
  brake: string;
  suspension: string;
  summary: string;
  heroTitle: string;
  story: string;
  tech: string[];
  rideProfile: MotoRideProfileItem[];
}

export interface MotoBenefit {
  title: string;
  copy: string;
}

export interface MotoShot {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

export interface MotoRider {
  name: string;
  role: string;
  quote: string;
  image: string;
  modelId: string;
}

export interface MotoContent {
  metrics: MetricItem[];
  models: MotoModel[];
  financeTerms: number[];
  useCases: string[];
  benefits: MotoBenefit[];
  showroomShots: MotoShot[];
  riders: MotoRider[];
}

export interface TablecorSurface {
  id: string;
  code: string;
  name: string;
  family: string;
  finish: string;
  thickness: string;
  base: string;
  accent: string;
  glow: string;
  applications: readonly string[];
  note: string;
}

export interface TablecorProgramStat {
  label: string;
  value: string;
}

export interface TablecorProgram {
  id: string;
  title: string;
  sector: string;
  summary: string;
  highlight: string;
  furniture: readonly string[];
  blend: readonly string[];
  surfaceIds: readonly string[];
  machineIds: readonly string[];
  cutPlanId: string;
  stats: readonly TablecorProgramStat[];
  photo: string;
  photoAlt: string;
  photoNote: string;
  base: string;
  accent: string;
  glow: string;
}

export interface TablecorProcessStep {
  id: string;
  order: string;
  title: string;
  copy: string;
  signal: string;
}

export interface TablecorCutPiece {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: string;
}

export interface TablecorCutPlan {
  id: string;
  title: string;
  programId: string;
  boardSize: string;
  yield: string;
  scrap: string;
  machine: string;
  cadence: string;
  notes: readonly string[];
  pieces: readonly TablecorCutPiece[];
}

export interface TablecorMachine {
  id: string;
  name: string;
  stage: string;
  copy: string;
  bestFor: string;
  shiftOutput: string;
  precision: string;
  efficiency: number;
  tech: readonly string[];
  photo: string;
  photoAlt: string;
  photoNote: string;
  base: string;
  accent: string;
  glow: string;
}

export interface TablecorProductionMode {
  id: string;
  label: string;
  leadTime: string;
  throughputFactor: number;
  scrapDelta: number;
  commercialOutput: string;
}

export interface TablecorSpec {
  label: string;
  value: string;
}

export interface TablecorServiceStep {
  title: string;
  copy: string;
}

export interface TablecorContent {
  metrics: MetricItem[];
  families: string[];
  surfaces: TablecorSurface[];
  programs: TablecorProgram[];
  processSteps: TablecorProcessStep[];
  cutPlans: TablecorCutPlan[];
  machines: TablecorMachine[];
  productionModes: TablecorProductionMode[];
  specs: TablecorSpec[];
  serviceSteps: TablecorServiceStep[];
  sampleFormats: string[];
  projectSpeeds: string[];
}

export interface CatalogContent {
  badge: string;
  title: string;
  story: string;
  pillars: Array<{ title: string; copy: string }>;
  foundation: Array<{ title: string; copy: string }>;
  noteTitle: string;
  noteCopy: string;
}

export interface MvpContent {
  catalog: CatalogContent;
  sites: Record<SiteKey, SiteMeta>;
  restaurant: RestaurantContent;
  studio: StudioContent;
  shop: ShopContent;
  tablecor: TablecorContent;
  travel: TravelContent;
  moto: MotoContent;
}

export type SiteSectionKey = Exclude<keyof MvpContent, "catalog" | "sites">;
