import type { MetricItem } from "@/shared/types/site";

export const travelMetrics: MetricItem[] = [
  { value: "12 destinos", label: "Experiencias activas durante el ano" },
  { value: "3 a 10 dias", label: "Rango de duracion mas vendido" },
  { value: "100%", label: "Acompanamiento durante el viaje" },
];

export const destinations = [
  {
    id: "paracas",
    name: "Paracas breve",
    season: "Costa",
    headline: "Tres dias entre mar, desierto y una agenda liviana.",
    summary: "Ideal para vender escapadas cortas con decision rapida.",
    highlights: ["Navegacion", "Hotel frente al mar", "Tarde de dunas"],
    itinerary: [
      {
        label: "Dia 1",
        title: "Llegada y acomodo",
        copy: "Recepcion, sunset ligero y una cena con recomendaciones locales.",
      },
      {
        label: "Dia 2",
        title: "Mar y desierto",
        copy: "Salida temprana, islas por la manana y recorrido de dunas por la tarde.",
      },
      {
        label: "Dia 3",
        title: "Cierre flexible",
        copy: "Desayuno largo, tiempo libre y opcion de ampliar una noche mas.",
      },
    ],
  },
  {
    id: "cusco",
    name: "Cusco esencial",
    season: "Montana",
    headline: "Ruta corta con altura, historia y buena dosificacion de energia.",
    summary: "Pensado para usuarios que quieren un itinerario ordenado y claro.",
    highlights: ["Centro historico", "Valle", "Experiencia local"],
    itinerary: [
      {
        label: "Dia 1",
        title: "Aclimatacion",
        copy: "Llegada, descanso y paseo corto para entrar con calma al destino.",
      },
      {
        label: "Dia 2",
        title: "Lectura de la ciudad",
        copy: "Ruta guiada con historia, gastronomia y tiempo de exploracion propia.",
      },
      {
        label: "Dia 3",
        title: "Salida al valle",
        copy: "Jornada intensa pero enfocada, con transporte y ritmos bien resueltos.",
      },
    ],
  },
  {
    id: "cartagena",
    name: "Cartagena ritmo lento",
    season: "Ciudad",
    headline: "Ciudad amurallada, calor y una agenda de baja friccion.",
    summary: "Sirve para un producto boutique donde la curaduria pesa mas que la cantidad.",
    highlights: ["Barrios historicos", "Cocina local", "Paseos suaves"],
    itinerary: [
      {
        label: "Dia 1",
        title: "Entrada al centro",
        copy: "Check-in, recorrido de contexto y primera noche sin sobrecarga.",
      },
      {
        label: "Dia 2",
        title: "Experiencias curadas",
        copy: "Selecciones pequenas: cocina, arquitectura y tiempo propio.",
      },
      {
        label: "Dia 3",
        title: "Cierre y extension",
        copy: "Despedida con opciones de playa o una noche extra en la ciudad.",
      },
    ],
  },
] as const;

export const travelInclusions = [
  "Alojamiento curado segun el tono del viaje",
  "Traslados centrales resueltos",
  "Asistencia por WhatsApp durante el recorrido",
  "Guia de recomendaciones antes de viajar",
];
