export interface StudioProfile {
  accent?: string;
  alt?: string;
  deep?: string;
  glow?: string;
  image: string;
  lens?: string;
  note?: string;
  pressure?: string;
  rhythm?: string;
  soft?: string;
}

export const defaultStudioProfile: StudioProfile = {
  image: "/images/studio/hero-studio.jpg",
  accent: "#c37b5f",
  deep: "#090605",
  soft: "#f2ddd0",
  glow: "rgba(195, 123, 95, 0.24)",
  lens: "Direccion creativa que corta ruido y organiza una lectura mas selectiva.",
  rhythm: "Mesa de trabajo, decision visual y calma editorial.",
  pressure: "Sistema, tono y salida pensados como una misma pieza.",
  alt: "Equipo creativo trabajando sobre una laptop en estudio.",
};

const disciplineProfiles = {
  identity: {
    image: "/images/studio/identity-board.jpg",
    accent: "#cf9a62",
    deep: "#130c08",
    soft: "#f4e3d0",
    glow: "rgba(207, 154, 98, 0.24)",
    lens: "Identidades que se sienten escritas con criterio y no resueltas con ruido.",
    rhythm: "Papel, gesto y una firma visual mucho mas propia.",
    pressure: "Narrativa verbal, territorio y sistema base de marca.",
    alt: "Pluma estilografica escribiendo sobre papel con luz calida.",
  },
  digital: {
    image: "/images/studio/digital-interface.jpg",
    accent: "#91b8c5",
    deep: "#071013",
    soft: "#dde9ed",
    glow: "rgba(145, 184, 197, 0.22)",
    lens: "Interfaces limpias, arquitectura clara y un tono de producto mas exacto.",
    rhythm: "Pantalla, precision y una lectura digital mucho mas sobria.",
    pressure: "Sistemas de contenido, direccion UI y crecimiento ordenado.",
    alt: "Espacio de trabajo con laptop abierta y codigo en pantalla.",
  },
  campaigns: {
    image: "/images/studio/campaign-fashion.jpg",
    accent: "#e76a50",
    deep: "#1a0807",
    soft: "#ffd8cf",
    glow: "rgba(231, 106, 80, 0.24)",
    lens: "Lanzamientos con direccion de arte visible y energia mas fotografica.",
    rhythm: "Casting, color y una presion visual mas marcada.",
    pressure: "Concepto, assets y despliegue hechos para sentirse dirigidos.",
    alt: "Editorial de moda con estilismo amarillo y fondo de cielo limpio.",
  },
} as const satisfies Record<string, StudioProfile>;

const caseProfiles = {
  "hotel vela": {
    image: "/images/studio/hotel-vela.jpg",
    accent: "#c6a37f",
    note: "Hospitalidad boutique con tacto, calma y lujo discreto.",
    alt: "Dormitorio boutique con cabecero capitonado y decoracion elegante.",
  },
  "orbita saas": {
    image: "/images/studio/orbita-saas.jpg",
    accent: "#9fb8c3",
    note: "Producto digital con narrativa clara, sistema y conversion.",
    alt: "Monitor con sistema de diseno y componentes de interfaz.",
  },
  "marea studio": {
    image: "/images/studio/campaign-fashion.jpg",
    accent: "#ea7357",
    note: "Campana con direccion visual mas alta y despliegue de temporada.",
    alt: "Modelo posando en una campana editorial de moda.",
  },
  "casa nube": {
    image: "/images/studio/casa-nube.jpg",
    accent: "#a7aab0",
    note: "Arquitectura, escala y una lectura visual mucho mas silenciosa.",
    alt: "Rascacielos de vidrio vistos desde abajo con cielo nublado.",
  },
} as const satisfies Record<string, StudioProfile>;

export function normalizeStudioValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getDisciplineProfile(disciplineId: string | undefined) {
  if (!disciplineId) {
    return defaultStudioProfile;
  }

  return (
    disciplineProfiles[disciplineId as keyof typeof disciplineProfiles] ?? defaultStudioProfile
  );
}

export function getCaseProfile(caseName: string | undefined) {
  if (!caseName) {
    return {
      image: defaultStudioProfile.image,
      accent: defaultStudioProfile.accent,
      note: defaultStudioProfile.lens,
      alt: defaultStudioProfile.alt,
    };
  }

  return caseProfiles[normalizeStudioValue(caseName) as keyof typeof caseProfiles] ?? {
    image: defaultStudioProfile.image,
    accent: defaultStudioProfile.accent,
    note: defaultStudioProfile.lens,
    alt: defaultStudioProfile.alt,
  };
}
