import type { MetricItem } from "@/shared/types/site";

export const motoMetrics: MetricItem[] = [
  { value: "3 modelos", label: "Linea activa mostrada en el showroom" },
  { value: "A2 / A", label: "Licencias cubiertas por la gama" },
  { value: "48 meses", label: "Plazo maximo del simulador de cuota" },
];

export const motoModels = [
  {
    id: "atlas-700",
    name: "Atlas 700",
    family: "Adventure",
    useCase: "Ruta larga",
    accent: "#ff5a36",
    image: "/images/moto/hero-road.jpg",
    price: 42990,
    displacement: "698 cc",
    engine: "Twin parallel",
    power: "74 hp",
    torque: "68 Nm",
    seatHeight: "835 mm",
    range: "410 km",
    topSpeed: "205 km/h",
    wetWeight: "212 kg",
    availability: "Entrega inmediata",
    brake: "Doble disco / ABS Pro",
    suspension: "Recorrido largo ajustable",
    summary: "Pensada para ruta larga, postura relajada y equipaje de viaje.",
    heroTitle: "La adventure que parece lista para salir hoy mismo.",
    story:
      "Atlas 700 mezcla presencia visual, autonomia y una ergonomia hecha para viajar cargado sin perder compostura en asfalto roto.",
    tech: ["Control de traccion", "Modos Rain / Road", "Pantalla TFT"],
    rideProfile: [
      { label: "Touring", value: 92, copy: "Estable a velocidad alta y noble con pasajero." },
      { label: "Agilidad", value: 66, copy: "Se siente grande, pero entra segura y progresiva." },
      { label: "Off-road light", value: 58, copy: "Puede salir del asfalto, aunque vive mejor en rutas largas." },
    ],
  },
  {
    id: "strada-rs",
    name: "Strada RS",
    family: "Street",
    useCase: "Ciudad rapida",
    accent: "#ff8c38",
    image: "/images/moto/garage-bike.jpg",
    price: 36990,
    displacement: "799 cc",
    engine: "Twin high-rev",
    power: "88 hp",
    torque: "72 Nm",
    seatHeight: "810 mm",
    range: "320 km",
    topSpeed: "228 km/h",
    wetWeight: "189 kg",
    availability: "Stock limitado",
    brake: "Radial / ABS en curva",
    suspension: "Set-up sport firme",
    summary: "La opcion mas agresiva para ciudad rapida y salida de fin de semana.",
    heroTitle: "Streetfighter compacta, tensa y lista para cambiar el ritmo.",
    story:
      "Strada RS esta pensada para quien quiere una moto que se vea afilada incluso detenida y entregue respuesta inmediata al abrir gas.",
    tech: ["Quickshifter", "ABS en curva", "Launch mode"],
    rideProfile: [
      { label: "Touring", value: 54, copy: "Sirve para escapadas cortas, pero no fue criada para autopista larga." },
      { label: "Agilidad", value: 94, copy: "Direccion viva, cambios rapidos y mucho caracter urbano." },
      { label: "Impacto visual", value: 97, copy: "Es la moto del lineup que mas marca presencia en ciudad." },
    ],
  },
  {
    id: "terra-x",
    name: "Terra X",
    family: "Dual sport",
    useCase: "Uso mixto",
    accent: "#41b883",
    image: "/images/moto/detail-closeup.jpg",
    price: 31990,
    displacement: "552 cc",
    engine: "Single balanceado",
    power: "52 hp",
    torque: "58 Nm",
    seatHeight: "860 mm",
    range: "360 km",
    topSpeed: "178 km/h",
    wetWeight: "171 kg",
    availability: "Reserva abierta",
    brake: "ABS desconectable",
    suspension: "Larga / enfoque dual",
    summary: "Enfocada en ligereza, uso mixto y un manejo menos intimidante.",
    heroTitle: "Dual sport ligera para quien quiere salir del pavimento sin drama.",
    story:
      "Terra X baja peso, simplifica la lectura mecanica y propone una postura alta para controlar la moto con confianza en terreno mixto.",
    tech: ["ABS desconectable", "Suspension larga", "Protecciones base"],
    rideProfile: [
      { label: "Touring", value: 63, copy: "Tiene autonomia correcta, pero su fuerte es el uso mixto." },
      { label: "Agilidad", value: 86, copy: "Ligera de adelante, con reacciones faciles de leer." },
      { label: "Versatilidad", value: 91, copy: "Es la que mejor soporta ciudad, ruta corta y ripio." },
    ],
  },
] as const;

export const financeTerms = [12, 24, 36, 48];
export const motoUseCases = ["Todas", "Ruta larga", "Ciudad rapida", "Uso mixto"] as const;

export const motoBenefits = [
  {
    title: "Prueba privada",
    copy: "Agenda una salida corta con ruta urbana y tramo abierto para sentir postura y freno.",
  },
  {
    title: "Entrega express",
    copy: "Unidad lista, documentacion y primer service coordinado desde el showroom.",
  },
  {
    title: "Setup inicial",
    copy: "Ajuste de mandos, precarga base y asesoria de equipamiento segun tu uso.",
  },
];

export const showroomShots = [
  {
    src: "/images/moto/hero-road.jpg",
    alt: "Moto adventure en carretera abierta",
    title: "Road session",
    caption: "Direccion de arte enfocada en desplazamiento, viento y distancia.",
  },
  {
    src: "/images/moto/garage-bike.jpg",
    alt: "Moto deportiva en un garaje oscuro",
    title: "Garage light",
    caption: "Una toma mas cerrada para reforzar acabado, postura y presencia.",
  },
  {
    src: "/images/moto/detail-closeup.jpg",
    alt: "Detalle de una moto vista de cerca",
    title: "Machine detail",
    caption: "Textura, mecanica visible y piezas que ayudan a vender calidad percibida.",
  },
] as const;

export const motoRiders = [
  {
    name: "Alex Costa",
    role: "Piloto Adventure",
    quote: "La Atlas 700 no me pone limites. Si el mapa dice que hay camino, la moto dice que si.",
    image: "/images/moto/rider-action.jpg",
    modelId: "atlas-700"
  },
  {
    name: "Sarah Jenkins",
    role: "Street Rider",
    quote: "Es la extension de mis reflejos. La Strada RS en ciudad se siente viva y urgente.",
    image: "/images/moto/garage-bike.jpg",
    modelId: "strada-rs"
  },
  {
    name: "Mateo Rossi",
    role: "Dual Explorer",
    quote: "Queria una moto que perdonara mis errores en tierra pero que no fuera aburrida en curvas.",
    image: "/images/moto/detail-closeup.jpg",
    modelId: "terra-x"
  }
];
