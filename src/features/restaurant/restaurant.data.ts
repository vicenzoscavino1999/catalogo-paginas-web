import type { MetricItem } from "@/shared/types/site";

export const restaurantMetrics: MetricItem[] = [
  { value: "4.9", label: "Calificacion media del servicio" },
  { value: "7 tiempos", label: "Menu degustacion principal" },
  { value: "42 mesas", label: "Capacidad por turno de cena" },
];

export const restaurantHero = {
  eyebrow: "Restaurante premium - fuego y sobremesa",
  title: "Casa Brasa construye una noche que empieza antes del primer plato.",
  story:
    "No es una carta subida a internet. Es una experiencia editorial donde reserva, atmosfera, cocina y maridaje se sienten parte de la misma escena.",
  image: "/images/restaurant/hero-dining.jpg",
};

export const guestOptions = [2, 4, 6, 8];

export const reservationSlots = ["18:30", "19:30", "20:15", "21:00", "22:00"];

export const menuGroups = [
  {
    id: "degustacion",
    label: "Degustacion",
    note: "Pensado para una narrativa mas sensorial y una velada de ritmo lento.",
    items: [
      {
        name: "Remolacha a la brasa",
        price: "S/ 34",
        description: "Yogur ahumado, hojas amargas y aceite especiado.",
      },
      {
        name: "Pesca del dia",
        price: "S/ 78",
        description: "Caldo de crustaceos, hinojo y mantequilla de limon tostado.",
      },
      {
        name: "Durazno al carbon",
        price: "S/ 28",
        description: "Vainilla salada, miel tibia y almendra crocante.",
      },
    ],
  },
  {
    id: "cena",
    label: "Cena",
    note: "Ideal para una landing mas comercial donde el usuario quiere decidir rapido.",
    items: [
      {
        name: "Pan de masa madre",
        price: "S/ 18",
        description: "Mantequilla batida con ajos confitados.",
      },
      {
        name: "Costilla glaseada",
        price: "S/ 66",
        description: "Purel de maiz tostado y reduccion intensa de la casa.",
      },
      {
        name: "Arroz de horno",
        price: "S/ 52",
        description: "Setas, queso de cabra y jugo corto de vegetales.",
      },
    ],
  },
  {
    id: "barra",
    label: "Barra",
    note: "Funciona para mostrar rotacion, maridajes y consumo por impulso.",
    items: [
      {
        name: "Negroni de cacao",
        price: "S/ 32",
        description: "Amargo, vermut especiado y nibs tostados.",
      },
      {
        name: "Highball de pera",
        price: "S/ 29",
        description: "Destilado claro, soda seca y acento herbal.",
      },
      {
        name: "Tabla nocturna",
        price: "S/ 44",
        description: "Quesos maduros, frutos secos y compota picante.",
      },
    ],
  },
] as const;

export const ambienceNotes = [
  {
    title: "Cocina abierta",
    copy: "El fuego y la mise en place forman parte de la experiencia desde el primer scroll.",
  },
  {
    title: "Turnos y reservas",
    copy: "El flujo invita a reservar sin perder el tono premium del sitio.",
  },
  {
    title: "Narrativa de producto",
    copy: "Menu, vinos y sobremesa se presentan como escenas, no como una lista fria.",
  },
];

export const restaurantScenes = [
  {
    src: "/images/restaurant/chef-plating.jpg",
    alt: "Chef terminando un plato en cocina",
    title: "Cocina visible",
    caption: "La mise en place y el pase cuentan tanto como el plato final.",
  },
  {
    src: "/images/restaurant/cocktail-night.jpg",
    alt: "Coctel servido en una barra de noche",
    title: "Barra nocturna",
    caption: "Cocteleria corta, vidrio oscuro y una sobremesa que se estira.",
  },
] as const;

export const serviceMoments = [
  {
    title: "Aperitivo",
    copy: "Entrada suave a la noche: copa ligera, pan tibio y lectura del ritmo del servicio.",
  },
  {
    title: "Fuego central",
    copy: "El plato principal aparece como punto de tension visual y de sabor.",
  },
  {
    title: "Sobremesa",
    copy: "La interfaz deja espacio para cocteleria, postre y reservas posteriores.",
  },
];
