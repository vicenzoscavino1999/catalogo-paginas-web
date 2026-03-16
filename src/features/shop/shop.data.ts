import type { MetricItem } from "@/shared/types/site";

export const shopMetrics: MetricItem[] = [
  { value: "24h", label: "Despacho promedio dentro de la ciudad" },
  { value: "3 colecciones", label: "Curadas para una tienda pequena" },
  { value: "98%", label: "Satisfaccion post compra registrada" },
];

export const collections = ["Todos", "Sala", "Mesa", "Regalos"] as const;

export const products = [
  {
    id: "isla-vase",
    collection: "Sala",
    name: "Jarron Isla",
    price: 149,
    badge: "Ceramica",
    description: "Silueta organica con acabado arena y lectura escultorica.",
  },
  {
    id: "sierra-throw",
    collection: "Sala",
    name: "Manta Sierra",
    price: 119,
    badge: "Textil",
    description: "Algodon grueso, paleta de verde seco y flecos cortos.",
  },
  {
    id: "bruma-set",
    collection: "Regalos",
    name: "Set Bruma",
    price: 179,
    badge: "Gift set",
    description: "Vela, difusor y bandeja listos para regalo estacional.",
  },
  {
    id: "claro-plates",
    collection: "Mesa",
    name: "Platos Claro",
    price: 134,
    badge: "Mesa",
    description: "Set de cuatro piezas de gres con borde sutilmente irregular.",
  },
] as const;

export const shopBenefits = [
  {
    title: "Catalogo corto",
    copy: "La interfaz prioriza seleccion y contexto, no volumen por volumen.",
  },
  {
    title: "Carrito simple",
    copy: "Puedes sumar piezas y ver un resumen sin salir de la landing.",
  },
  {
    title: "Promesa clara",
    copy: "Entrega, empaques y devoluciones se comunican en bloques compactos.",
  },
];
