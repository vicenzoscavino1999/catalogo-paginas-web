import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import { validateWithDefaults } from "@/shared/content/contentSchema";
import type { MvpContent, SiteMeta } from "@/shared/content/contentTypes";

type EditorTab = Exclude<keyof MvpContent, "sites">;

export type SiteMetaField = keyof Pick<
  SiteMeta,
  "title" | "category" | "description" | "summary" | "tags" | "accent"
>;

export interface SiteMetaValidationResult {
  errors: string[];
  fieldErrors: Partial<Record<SiteMetaField, string>>;
}

export interface ContentDraftValidation<K extends EditorTab> {
  errors: string[];
  parsed?: MvpContent[K];
}

const defaultContent = createDefaultMvpContent();
const defaultSiteMeta = defaultContent.sites.restaurant;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function pushDuplicateValueErrors(values: readonly string[], path: string, errors: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  duplicates.forEach((value) => {
    errors.push(`${path} contiene un valor duplicado: ${value}.`);
  });
}

function pushDuplicateIdErrors<T extends { id: string }>(
  entries: readonly T[],
  path: string,
  errors: string[]
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  entries.forEach((entry) => {
    if (seen.has(entry.id)) {
      duplicates.add(entry.id);
      return;
    }

    seen.add(entry.id);
  });

  duplicates.forEach((id) => {
    errors.push(`${path} contiene un id duplicado: ${id}.`);
  });
}

export function validateContentDraft<K extends EditorTab>(
  key: K,
  draft: string
): ContentDraftValidation<K> {
  try {
    const parsed = JSON.parse(draft) as MvpContent[K];
    const errors = validateContentSection(key, parsed);

    return {
      parsed,
      errors,
    };
  } catch (error) {
    return {
      errors: [
        error instanceof Error ? `JSON invalido: ${error.message}` : "No se pudo interpretar el JSON.",
      ],
    };
  }
}

export function validateContentSection<K extends EditorTab>(key: K, value: unknown) {
  const errors = validateWithDefaults(defaultContent[key], value, key);

  if (key === "tablecor" && isTablecorSection(value)) {
    const familyNames = new Set(value.families);
    const surfaceIds = new Set(value.surfaces.map((surface) => surface.id));
    const machineIds = new Set(value.machines.map((machine) => machine.id));
    const programIds = new Set(value.programs.map((program) => program.id));
    const cutPlanIds = new Set(value.cutPlans.map((cutPlan) => cutPlan.id));
    const cutPlansById = new Map(value.cutPlans.map((cutPlan) => [cutPlan.id, cutPlan]));

    if (value.families.length === 0) {
      errors.push("tablecor.families debe incluir al menos una familia.");
    }

    if (value.surfaces.length === 0) {
      errors.push("tablecor.surfaces debe incluir al menos una superficie.");
    }

    if (value.programs.length === 0) {
      errors.push("tablecor.programs debe incluir al menos un programa.");
    }

    if (value.cutPlans.length === 0) {
      errors.push("tablecor.cutPlans debe incluir al menos un plan de corte.");
    }

    if (value.machines.length === 0) {
      errors.push("tablecor.machines debe incluir al menos una maquina.");
    }

    if (value.productionModes.length === 0) {
      errors.push("tablecor.productionModes debe incluir al menos un modo de produccion.");
    }

    if (value.serviceSteps.length === 0) {
      errors.push("tablecor.serviceSteps debe incluir al menos una salida comercial.");
    }

    if (value.sampleFormats.length === 0) {
      errors.push("tablecor.sampleFormats debe incluir al menos un formato.");
    }

    if (value.projectSpeeds.length === 0) {
      errors.push("tablecor.projectSpeeds debe incluir al menos una velocidad.");
    }

    pushDuplicateValueErrors(value.families, "tablecor.families", errors);
    pushDuplicateIdErrors(value.surfaces, "tablecor.surfaces", errors);
    pushDuplicateIdErrors(value.programs, "tablecor.programs", errors);
    pushDuplicateIdErrors(value.cutPlans, "tablecor.cutPlans", errors);
    pushDuplicateIdErrors(value.machines, "tablecor.machines", errors);
    pushDuplicateIdErrors(value.processSteps, "tablecor.processSteps", errors);
    pushDuplicateIdErrors(value.productionModes, "tablecor.productionModes", errors);

    value.surfaces.forEach((surface, index) => {
      if (typeof surface.family === "string" && !familyNames.has(surface.family)) {
        errors.push(
          `tablecor.surfaces[${index}].family referencia una familia inexistente: ${surface.family}.`
        );
      }
    });

    value.programs.forEach((program, index) => {
      if (Array.isArray(program.surfaceIds) && program.surfaceIds.length === 0) {
        errors.push(`tablecor.programs[${index}].surfaceIds debe tener al menos una superficie.`);
      }

      if (Array.isArray(program.machineIds) && program.machineIds.length === 0) {
        errors.push(`tablecor.programs[${index}].machineIds debe tener al menos una maquina.`);
      }

      if (Array.isArray(program.surfaceIds)) {
        program.surfaceIds.forEach((surfaceId, surfaceIndex) => {
          if (!surfaceIds.has(surfaceId)) {
            errors.push(
              `tablecor.programs[${index}].surfaceIds[${surfaceIndex}] referencia una superficie inexistente: ${surfaceId}.`
            );
          }
        });
      }

      if (Array.isArray(program.machineIds)) {
        program.machineIds.forEach((machineId, machineIndex) => {
          if (!machineIds.has(machineId)) {
            errors.push(
              `tablecor.programs[${index}].machineIds[${machineIndex}] referencia una maquina inexistente: ${machineId}.`
            );
          }
        });
      }

      if (typeof program.cutPlanId === "string" && !cutPlanIds.has(program.cutPlanId)) {
        errors.push(
          `tablecor.programs[${index}].cutPlanId referencia un plan de corte inexistente: ${program.cutPlanId}.`
        );
      }

      const referencedCutPlan = cutPlansById.get(program.cutPlanId);

      if (referencedCutPlan && referencedCutPlan.programId !== program.id) {
        errors.push(
          `tablecor.programs[${index}].cutPlanId referencia un plan de corte de otro programa: ${program.cutPlanId}.`
        );
      }
    });

    value.cutPlans.forEach((cutPlan, index) => {
      if (Array.isArray(cutPlan.pieces) && cutPlan.pieces.length === 0) {
        errors.push(`tablecor.cutPlans[${index}].pieces debe tener al menos una pieza.`);
      }

      if (typeof cutPlan.programId === "string" && !programIds.has(cutPlan.programId)) {
        errors.push(
          `tablecor.cutPlans[${index}].programId referencia un programa inexistente: ${cutPlan.programId}.`
        );
      }
    });
  }

  return errors;
}

export function validateSiteMeta(value: SiteMeta): SiteMetaValidationResult {
  const schemaErrors = validateWithDefaults(defaultSiteMeta, value, "meta");
  const fieldErrors: Partial<Record<SiteMetaField, string>> = {};

  if (value.title.trim().length === 0) {
    fieldErrors.title = "El titulo no puede estar vacio.";
  }

  if (value.category.trim().length === 0) {
    fieldErrors.category = "La industria no puede estar vacia.";
  }

  if (value.description.trim().length === 0) {
    fieldErrors.description = "La descripcion no puede estar vacia.";
  }

  if (value.summary.trim().length === 0) {
    fieldErrors.summary = "El resumen no puede estar vacio.";
  }

  if (value.tags.length === 0) {
    fieldErrors.tags = "Agrega al menos un tag para el catalogo.";
  }

  if (!hexColorPattern.test(value.accent)) {
    fieldErrors.accent = "Usa un color hex como #1d2b43.";
  }

  const errors = [
    ...schemaErrors,
    ...Object.values(fieldErrors),
  ];

  return {
    errors,
    fieldErrors,
  };
}

function isTablecorSection(value: unknown): value is MvpContent["tablecor"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tablecor = value as Partial<MvpContent["tablecor"]>;

  return (
    Array.isArray(tablecor.families) &&
    Array.isArray(tablecor.surfaces) &&
    Array.isArray(tablecor.programs) &&
    Array.isArray(tablecor.processSteps) &&
    Array.isArray(tablecor.cutPlans) &&
    Array.isArray(tablecor.machines) &&
    Array.isArray(tablecor.productionModes) &&
    Array.isArray(tablecor.serviceSteps) &&
    Array.isArray(tablecor.sampleFormats) &&
    Array.isArray(tablecor.projectSpeeds)
  );
}
