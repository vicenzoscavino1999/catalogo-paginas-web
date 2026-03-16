import { describe, expect, it } from "vitest";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import {
  validateContentDraft,
  validateContentSection,
  validateSiteMeta,
} from "@/features/workspace/workspaceValidation";

describe("workspaceValidation", () => {
  it("returns field-level site meta errors", () => {
    const siteMeta = {
      ...createDefaultMvpContent().sites.studio,
      title: "   ",
      tags: [],
      accent: "blue",
    };

    const result = validateSiteMeta(siteMeta);

    expect(result.fieldErrors.title).toBe("El titulo no puede estar vacio.");
    expect(result.fieldErrors.tags).toBe("Agrega al menos un tag para el catalogo.");
    expect(result.fieldErrors.accent).toBe("Usa un color hex como #1d2b43.");
  });

  it("flags invalid JSON drafts before save", () => {
    const result = validateContentDraft("catalog", "{");

    expect(result.parsed).toBeUndefined();
    expect(result.errors[0]).toContain("JSON invalido:");
  });

  it("flags tablecor content that removes critical arrays", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const tablecor = {
      ...defaults,
      programs: [
        {
          ...defaults.programs[0],
          machineIds: [],
          surfaceIds: [],
        },
      ],
      cutPlans: [
        {
          ...defaults.cutPlans[0],
          pieces: [],
        },
      ],
    };

    const errors = validateContentSection("tablecor", tablecor);

    expect(errors).toContain("tablecor.programs[0].surfaceIds debe tener al menos una superficie.");
    expect(errors).toContain("tablecor.programs[0].machineIds debe tener al menos una maquina.");
    expect(errors).toContain("tablecor.cutPlans[0].pieces debe tener al menos una pieza.");
  });

  it("does not throw when nested tablecor arrays are malformed", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const malformedTablecor = {
      ...defaults,
      programs: [
        {
          ...defaults.programs[0],
          machineIds: undefined,
          surfaceIds: undefined,
        },
      ],
      cutPlans: [
        {
          ...defaults.cutPlans[0],
          pieces: undefined,
        },
      ],
    };

    expect(() => validateContentSection("tablecor", malformedTablecor)).not.toThrow();

    const errors = validateContentSection("tablecor", malformedTablecor);

    expect(errors.some((error) => error.includes("tablecor.programs[0].surfaceIds"))).toBe(true);
    expect(errors.some((error) => error.includes("tablecor.programs[0].machineIds"))).toBe(true);
    expect(errors.some((error) => error.includes("tablecor.cutPlans[0].pieces"))).toBe(true);
  });

  it("flags broken tablecor cross references before runtime fallbacks hide them", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const tablecor = {
      ...defaults,
      programs: [
        {
          ...defaults.programs[0],
          surfaceIds: ["missing-surface"],
          machineIds: ["missing-machine"],
          cutPlanId: "missing-plan",
        },
      ],
      cutPlans: [
        {
          ...defaults.cutPlans[0],
          programId: "missing-program",
        },
      ],
    };

    const errors = validateContentSection("tablecor", tablecor);

    expect(errors).toContain(
      "tablecor.programs[0].surfaceIds[0] referencia una superficie inexistente: missing-surface."
    );
    expect(errors).toContain(
      "tablecor.programs[0].machineIds[0] referencia una maquina inexistente: missing-machine."
    );
    expect(errors).toContain(
      "tablecor.programs[0].cutPlanId referencia un plan de corte inexistente: missing-plan."
    );
    expect(errors).toContain(
      "tablecor.cutPlans[0].programId referencia un programa inexistente: missing-program."
    );
  });

  it("flags duplicate ids, missing family labels and cut plans linked to another program", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const unrelatedCutPlan = defaults.cutPlans.find(
      (cutPlan) => cutPlan.programId !== defaults.programs[0].id
    )!;
    const duplicateSurfaceId = defaults.surfaces[0].id;
    const tablecor = {
      ...defaults,
      families: ["Maderas"],
      surfaces: [
        defaults.surfaces[0],
        {
          ...defaults.surfaces[1],
          id: duplicateSurfaceId,
          family: "Piedras",
        },
      ],
      programs: [
        {
          ...defaults.programs[0],
          cutPlanId: unrelatedCutPlan.id,
        },
        ...defaults.programs.slice(1),
      ],
    };

    const errors = validateContentSection("tablecor", tablecor);

    expect(errors).toContain(`tablecor.surfaces contiene un id duplicado: ${duplicateSurfaceId}.`);
    expect(errors).toContain(
      "tablecor.surfaces[1].family referencia una familia inexistente: Piedras."
    );
    expect(errors).toContain(
      `tablecor.programs[0].cutPlanId referencia un plan de corte de otro programa: ${unrelatedCutPlan.id}.`
    );
  });
});
