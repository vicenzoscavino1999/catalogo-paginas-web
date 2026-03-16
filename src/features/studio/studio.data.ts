import type { MetricItem } from "@/shared/types/site";

export const studioMetrics: MetricItem[] = [
  { value: "18 marcas", label: "Proyectos construidos de punta a punta" },
  { value: "6 semanas", label: "Tiempo medio por lanzamiento web" },
  { value: "92%", label: "Clientes que vuelven por una segunda fase" },
];

export const disciplines = [
  {
    id: "identity",
    label: "Identidad",
    summary: "Para marcas que necesitan claridad verbal y visual antes de crecer.",
    deliverables: [
      "Territorio verbal y manifiesto",
      "Sistema visual con reglas de uso",
      "Kit base para social y presentaciones",
    ],
  },
  {
    id: "digital",
    label: "Digital",
    summary: "Landing pages, sitios editoriales y sistemas de contenido con tono selectivo.",
    deliverables: [
      "Arquitectura de informacion",
      "Wireframes y direccion de interfaz",
      "Biblioteca de componentes para crecer",
    ],
  },
  {
    id: "campaigns",
    label: "Campanas",
    summary: "Piezas y lineamientos para lanzamientos, sesiones y activaciones.",
    deliverables: [
      "Concepto de campana",
      "Direccion creativa para assets",
      "Sistema de despliegue para paid y organic",
    ],
  },
] as const;

export const caseStudies = [
  {
    name: "Hotel Vela",
    focus: "Identidad",
    sector: "Hospitalidad boutique",
    result: "Rebranding, web de reservas y tono editorial para una oferta premium.",
  },
  {
    name: "Orbita SaaS",
    focus: "Digital",
    sector: "Software B2B",
    result: "Landing de lanzamiento y narrativa de producto enfocada en conversion.",
  },
  {
    name: "Marea Studio",
    focus: "Campanas",
    sector: "Moda independiente",
    result: "Sistema visual para campana de temporada y activacion de ecommerce.",
  },
  {
    name: "Casa Nube",
    focus: "Digital",
    sector: "Arquitectura",
    result: "Portfolio con casos en profundidad y una lectura mas calmada.",
  },
] as const;

export const workflow = [
  {
    title: "Diagnostico",
    copy: "Se alinea objetivo comercial, tono y decision visual antes de producir piezas.",
  },
  {
    title: "Sistema",
    copy: "La propuesta se organiza como reglas reutilizables, no como entregables aislados.",
  },
  {
    title: "Despliegue",
    copy: "Se baja a web, presentaciones, contenido y soporte para lanzamiento.",
  },
];
