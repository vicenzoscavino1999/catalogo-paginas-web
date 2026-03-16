import { siteRegistry } from "@/shared/data/sites";
import type { SiteKey } from "@/shared/types/site";
import {
  ambienceNotes,
  guestOptions,
  menuGroups,
  reservationSlots,
  restaurantHero,
  restaurantMetrics,
  restaurantScenes,
  serviceMoments,
} from "@/features/restaurant/restaurant.data";
import { caseStudies, disciplines, studioMetrics, workflow } from "@/features/studio/studio.data";
import { collections, products, shopBenefits, shopMetrics } from "@/features/shop/shop.data";
import {
  projectSpeeds,
  sampleFormats,
  tablecorCutPlans,
  tablecorFamilies,
  tablecorMachines,
  tablecorMetrics,
  tablecorProductionModes,
  tablecorProcessSteps,
  tablecorPrograms,
  tablecorServiceSteps,
  tablecorSpecs,
  tablecorSurfaces,
} from "@/features/tablecor/tablecor.data";
import { destinations, travelInclusions, travelMetrics } from "@/features/travel/travel.data";
import {
  financeTerms,
  motoBenefits,
  motoMetrics,
  motoModels,
  motoUseCases,
  showroomShots,
  motoRiders,
} from "@/features/moto/moto.data";
import type { MvpContent, SiteMeta } from "@/shared/content/contentTypes";

type MutableDeep<T> = T extends readonly (infer U)[]
  ? MutableDeep<U>[]
  : T extends object
  ? { -readonly [K in keyof T]: MutableDeep<T[K]> }
  : T;

function clone<T>(value: T): MutableDeep<T> {
  return JSON.parse(JSON.stringify(value)) as MutableDeep<T>;
}

const defaultSiteMeta = siteRegistry.reduce(
  (accumulator, site) => {
    accumulator[site.key] = {
      title: site.title,
      category: site.category,
      accent: site.accent,
      description: site.description,
      summary: site.summary,
      tags: [...site.tags],
    };

    return accumulator;
  },
  {} as Record<SiteKey, SiteMeta>
);

export const defaultMvpContent: MvpContent = {
  catalog: {
    badge: "6 experiencias tematicas en TypeScript",
    title: "Un catalogo donde cada pagina se comporta como un producto propio.",
    story:
      "La app esta organizada para que cada ejemplo tenga interfaz, contenido y estructura propios. Ahora tambien puede usarse con datos reales tuyos guardados localmente.",
    pillars: [
      {
        title: "Arquitectura",
        copy: "Rutas separadas, features por dominio y componentes compartidos.",
      },
      {
        title: "Interaccion",
        copy: "Cada ejemplo tiene estados y microfunciones alineadas a su negocio.",
      },
      {
        title: "Escalabilidad",
        copy: "Agregar una nueva pagina implica sumar un feature y registrarlo.",
      },
    ],
    foundation: [
      {
        title: "Stack actual",
        copy: "React, TypeScript, Vite y rutas por pagina.",
      },
      {
        title: "Organizacion",
        copy: "Cada dominio vive dentro de src/features con su propia data, interfaz y estilos.",
      },
      {
        title: "Siguiente paso natural",
        copy: "Conectar formularios reales, CMS o backend sin rehacer la estructura.",
      },
    ],
    noteTitle: "Modo MVP configurable",
    noteCopy:
      "Puedes reemplazar los datos demo por contenido real de tu negocio desde el editor local.",
  },
  sites: defaultSiteMeta,
  restaurant: {
    hero: clone(restaurantHero),
    metrics: clone(restaurantMetrics),
    guestOptions: clone(guestOptions),
    reservationSlots: clone(reservationSlots),
    menuGroups: clone(menuGroups),
    ambienceNotes: clone(ambienceNotes),
    scenes: clone(restaurantScenes),
    serviceMoments: clone(serviceMoments),
  },
  studio: {
    metrics: clone(studioMetrics),
    disciplines: clone(disciplines),
    caseStudies: clone(caseStudies),
    workflow: clone(workflow),
  },
  shop: {
    metrics: clone(shopMetrics),
    collections: clone(collections),
    products: clone(products),
    benefits: clone(shopBenefits),
  },
  tablecor: {
    metrics: clone(tablecorMetrics),
    families: clone(tablecorFamilies),
    surfaces: clone(tablecorSurfaces),
    programs: clone(tablecorPrograms),
    processSteps: clone(tablecorProcessSteps),
    cutPlans: clone(tablecorCutPlans),
    machines: clone(tablecorMachines),
    productionModes: clone(tablecorProductionModes),
    specs: clone(tablecorSpecs),
    serviceSteps: clone(tablecorServiceSteps),
    sampleFormats: clone(sampleFormats),
    projectSpeeds: clone(projectSpeeds),
  },
  travel: {
    metrics: clone(travelMetrics),
    destinations: clone(destinations),
    inclusions: clone(travelInclusions),
  },
  moto: {
    metrics: clone(motoMetrics),
    models: clone(motoModels),
    financeTerms: clone(financeTerms),
    useCases: clone(motoUseCases),
    benefits: clone(motoBenefits),
    showroomShots: clone(showroomShots),
    riders: clone(motoRiders),
  },
};

export function createDefaultMvpContent() {
  return clone(defaultMvpContent);
}
