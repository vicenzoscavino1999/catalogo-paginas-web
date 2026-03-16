import type { SiteKey } from "@/shared/types/site";

export interface CatalogScene {
  alt: string;
  eyebrow: string;
  headline: string;
  image: string;
  note: string;
}

export const catalogSectionOrder = ["hero", "catalogo", "sistema"] as const;

export type CatalogSectionKey = (typeof catalogSectionOrder)[number];

export const sectionLabels: Record<CatalogSectionKey, string> = {
  hero: "Inicio",
  catalogo: "Catalogo",
  sistema: "Sistema",
};

const siteScenes: Record<SiteKey, CatalogScene> = {
  restaurant: {
    image: "/images/restaurant/hero-dining.jpg",
    alt: "Mesa de restaurante premium con vajilla, luz calida y atmosfera nocturna.",
    eyebrow: "Gastronomia curada",
    headline: "Cada demo entra como una marca completa, no como un template repetido.",
    note: "La portada ya adelanta el nivel visual de cada experiencia con escenas reales y tono propio.",
  },
  studio: {
    image: "/images/studio/hero-studio.jpg",
    alt: "Interior de estudio creativo con luz suave y composicion editorial.",
    eyebrow: "Direccion editorial",
    headline: "El catalogo funciona como un showroom de interfaces con criterio visual.",
    note: "Las piezas se sienten mas cercanas a un estudio premium que a una lista generica de demos.",
  },
  shop: {
    image: "/images/tablecor/kitchen-premium.jpg",
    alt: "Cocina premium con materiales claros, textura y luz natural.",
    eyebrow: "Comercio con atmosfera",
    headline: "Cada entrada puede vender una industria distinta sin perder continuidad de sistema.",
    note: "Las demos de comercio, viajes o creatividad conviven dentro de una home elegante y ordenada.",
  },
  tablecor: {
    image: "/images/tablecor/walkin-closet.jpg",
    alt: "Vestidor premium con paneleria clara y acabados de lujo.",
    eyebrow: "Materialidad visual",
    headline: "La portada presenta superficies, color y profundidad como si fuera una marca matriz.",
    note: "La navegacion principal ya transmite arquitectura, sistema y capacidad de expansion.",
  },
  travel: {
    image: "/images/travel/hero-ocean.jpg",
    alt: "Vista oceanica luminosa con cielo amplio y sensacion de viaje premium.",
    eyebrow: "Recorrido inmersivo",
    headline: "La experiencia cambia con filtros, hover y scroll sin perder limpieza ni control.",
    note: "Todo el recorrido esta pensado para descubrir demos con calma y con una sensacion mas cinematografica.",
  },
  moto: {
    image: "/images/moto/hero-road.jpg",
    alt: "Motocicleta premium en carretera abierta durante hora dorada.",
    eyebrow: "Sistema vivo",
    headline: "La home resume arquitectura, demos y modo editable dentro de una sola narrativa visual.",
    note: "La pagina principal ahora se siente como una plataforma premium para presentar todo el portafolio.",
  },
};

export const surfaceMotionOptions = {
  offsetX: 10,
  offsetY: 10,
  panelXFactor: 0.35,
  panelYFactor: 0.35,
} as const;

export function getSiteScene(siteKey: string) {
  return siteScenes[siteKey as SiteKey] ?? siteScenes.moto;
}

export function getCatalogSectionLabel(sectionKey: string) {
  return sectionLabels[sectionKey as keyof typeof sectionLabels] ?? sectionLabels.hero;
}
