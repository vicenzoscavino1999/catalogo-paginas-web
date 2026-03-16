export const machineDemoSteps = [
  {
    id: "load",
    label: "Carga",
    copy: "El tablero entra a mesa y se estabiliza antes de la lectura de lote.",
    headLeft: "22%",
    laserHeight: "36px",
    pulseLeft: "24%",
  },
  {
    id: "align",
    label: "Alineado",
    copy: "El puente se posiciona sobre el plano y prepara la secuencia de corte.",
    headLeft: "38%",
    laserHeight: "82px",
    pulseLeft: "40%",
  },
  {
    id: "cut",
    label: "Corte",
    copy: "El cabezal avanza con la tolerancia definida y marca la pieza activa.",
    headLeft: "56%",
    laserHeight: "150px",
    pulseLeft: "58%",
  },
  {
    id: "finish",
    label: "Salida",
    copy: "La pieza sale del ciclo lista para canteo, perforado o control final.",
    headLeft: "74%",
    laserHeight: "64px",
    pulseLeft: "76%",
  },
] as const;

export type MachineDemoId = (typeof machineDemoSteps)[number]["id"];
export type MachineDemoStep = (typeof machineDemoSteps)[number];

export const staticMedia = {
  heroShowroom: {
    src: "/images/tablecor/hero-showroom.jpg",
    alt: "Showroom premium de tableros, superficies y mobiliario interior para Tablecor.",
  },
  boardStack: {
    src: "/images/tablecor/board-stack.jpg",
    alt: "Tableros apilados y listos para entrar a corte o preparacion de lote.",
  },
} as const;

export interface SampleFormatProfile {
  copy: string;
  deliverables: string[];
  title: string;
}

export const sampleFormatProfiles: Record<string, SampleFormatProfile> = {
  "A4 inspiracional": {
    title: "Dossier visual A4",
    copy:
      "Sirve para abrir la decision con una lamina curada, blend de superficie y referencia clara del programa.",
    deliverables: ["Lamina A4", "Blend sugerido", "Referencia de mobiliario"],
  },
  "Muestra 30 x 30": {
    title: "Muestra 30 x 30",
    copy:
      "Formato tactil para validar tono, textura y lectura de borde antes del tablero completo.",
    deliverables: ["Muestra fisica", "Etiqueta de acabado", "Nota de uso"],
  },
  "Tablero full": {
    title: "Tablero de validacion",
    copy:
      "Pensado para validar veta, continuidad y salida de corte cuando el proyecto necesita lectura completa.",
    deliverables: ["Tablero full", "Plan de corte base", "Ficha tecnica"],
  },
  "Kit de paleta completa": {
    title: "Kit de paleta completa",
    copy:
      "Paquete comercial con varias superficies para revisar mezcla, jerarquia y alternativas reales de lote.",
    deliverables: ["Paleta curada", "Notas de combinacion", "Ruta de maquinaria"],
  },
};

export interface ProjectSpeedProfile {
  copy: string;
  ctaLead: string;
  packageTone: string;
  title: string;
}

export const projectSpeedProfiles: Record<string, ProjectSpeedProfile> = {
  "Salida estandar": {
    title: "Ruta comercial estable",
    copy: "Pensada para seguimiento comercial normal, validacion interna y respuesta sin urgencia de obra.",
    ctaLead: "Programar salida",
    packageTone: "Cadencia normal",
  },
  "Curaduria rapida": {
    title: "Curaduria acelerada",
    copy: "Prioriza seleccion, ajuste de blend y respuesta corta cuando el cliente ya esta comparando opciones.",
    ctaLead: "Acelerar propuesta",
    packageTone: "Respuesta preferente",
  },
  "Desarrollo premium": {
    title: "Paquete premium de cierre",
    copy: "Activa revision comercial y tecnica mas fina para presentar un paquete de decision con mayor argumento.",
    ctaLead: "Activar paquete premium",
    packageTone: "Prioridad alta",
  },
};

export function getMachineDemoForProcess(stepId: string): MachineDemoId {
  switch (stepId) {
    case "brief":
      return "load";
    case "optimization":
      return "align";
    case "quality":
      return "finish";
    default:
      return "cut";
  }
}
