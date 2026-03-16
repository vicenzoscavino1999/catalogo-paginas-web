import type { SiteKey, SitePreview } from "@/shared/types/site";

export const siteRegistry: SitePreview[] = [
  {
    key: "restaurant",
    route: "/restaurant",
    title: "Casa Brasa",
    category: "Gastronomia",
    accent: "#d56733",
    description: "Landing de restaurante con reservas, menu por bloques y tono premium.",
    summary: "Calida, sensorial y pensada para convertir reservas.",
    tags: ["Reservas", "Menu", "Chef table"],
  },
  {
    key: "studio",
    route: "/studio",
    title: "Atelier Norte",
    category: "Creatividad",
    accent: "#2d6cca",
    description: "Sitio editorial para estudio creativo con servicios, casos y metodo.",
    summary: "Sobria, selectiva y enfocada en vender criterio.",
    tags: ["Branding", "Casos", "Proceso"],
  },
  {
    key: "shop",
    route: "/shop",
    title: "Verde Vivo",
    category: "Comercio",
    accent: "#3d7d42",
    description: "E-commerce pequeno con carrito simple, colecciones y beneficios claros.",
    summary: "Limpia, natural y orientada a compra rapida.",
    tags: ["Colecciones", "Carrito", "Catalogo"],
  },
  {
    key: "tablecor",
    route: "/tablecor",
    title: "Tablecor",
    category: "Materiales",
    accent: "#b7714d",
    description:
      "Showroom digital de melaminas, tableros y decorados para mobiliario y paneleria.",
    summary: "Arquitectonica, tactil y pensada para especificar con claridad.",
    tags: ["Melaminas", "Tableros", "Decorados"],
  },
  {
    key: "travel",
    route: "/travel",
    title: "Ruta Cobalto",
    category: "Turismo",
    accent: "#0f8ab4",
    description: "Experiencia de viajes con selector de destinos e itinerario interactivo.",
    summary: "Ligera, clara y centrada en decision de viaje.",
    tags: ["Destinos", "Itinerario", "Temporada"],
  },
  {
    key: "moto",
    route: "/moto",
    title: "Linea Apex Moto",
    category: "Motor",
    accent: "#cb3838",
    description: "Showroom de motos con comparador tecnico y simulador de cuota.",
    summary: "Oscura, tecnica y con foco en performance.",
    tags: ["Modelos", "Specs", "Financiamiento"],
  },
];

export const catalogCategories = [
  "Todos",
  "Gastronomia",
  "Creatividad",
  "Comercio",
  "Materiales",
  "Turismo",
  "Motor",
] as const;

function getSiteIndex(siteKey: SiteKey) {
  const siteIndex = siteRegistry.findIndex((site) => site.key === siteKey);

  if (siteIndex === -1) {
    throw new Error(`Unknown site key: ${siteKey}`);
  }

  return siteIndex;
}

export function getSiteByKey(siteKey: SiteKey) {
  return siteRegistry[getSiteIndex(siteKey)];
}

export function getNextSite(siteKey: SiteKey) {
  return siteRegistry[(getSiteIndex(siteKey) + 1) % siteRegistry.length];
}
