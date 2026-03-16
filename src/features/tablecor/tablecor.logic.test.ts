import { describe, expect, it } from "vitest";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import { getMachineDemoForProcess } from "@/features/tablecor/tablecor.config";
import { TABLECOR_ALL_FAMILY_ID } from "@/features/tablecor/tablecor.constants";
import {
  createServiceResponse,
  createInitialTablecorState,
  createProductionSnapshot,
  createResolvedTablecorContent,
  filterVisibleSurfaces,
  getActiveServiceStep,
  getProcessMachineId,
  getProjectSpeedProfile,
  getSampleFormatProfile,
  isProcessSupported,
  resolveProcessId,
  resolveProcessIdForMachine,
  toggleComparedSurfaceIds,
} from "@/features/tablecor/tablecor.logic";

describe("tablecor.logic", () => {
  it("creates safe initial state even when editable arrays are shorter than the demo", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const resolved = createResolvedTablecorContent({
      ...defaults,
      processSteps: defaults.processSteps.slice(0, 1),
      productionModes: defaults.productionModes.slice(0, 1),
      serviceSteps: defaults.serviceSteps.slice(0, 1),
      sampleFormats: defaults.sampleFormats.slice(0, 1),
      projectSpeeds: defaults.projectSpeeds.slice(0, 1),
    });

    const initialState = createInitialTablecorState(resolved);

    expect(initialState.activeProcessId).toBe(resolved.tablecorProcessSteps[0].id);
    expect(initialState.productionModeId).toBe(resolved.tablecorProductionModes[0].id);
    expect(initialState.sampleFormat).toBe(resolved.sampleFormats[0]);
    expect(initialState.projectSpeed).toBe(resolved.projectSpeeds[0]);
    expect(initialState.activeServiceIndex).toBe(0);
    expect(initialState.activeMachineDemoId).toBe(getMachineDemoForProcess(initialState.activeProcessId));
  });

  it("keeps compared surfaces capped at three items", () => {
    expect(toggleComparedSurfaceIds(["a", "b", "c"], "d")).toEqual(["b", "c", "d"]);
    expect(toggleComparedSurfaceIds(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    expect(toggleComparedSurfaceIds(["a", "a", "b"], "c")).toEqual(["a", "b", "c"]);
  });

  it("treats the all-family sentinel as an unfiltered surface view", () => {
    const defaults = createDefaultMvpContent().tablecor;

    expect(
      filterVisibleSurfaces(defaults.surfaces, TABLECOR_ALL_FAMILY_ID, "").length
    ).toBe(defaults.surfaces.length);
  });

  it("falls back to a known sample format profile and resolves process machines by stage", () => {
    expect(getSampleFormatProfile("Formato custom").title).toBeTruthy();
    expect(getProcessMachineId("edge", ["beam-saw", "edge-laser"])).toBe("edge-laser");
  });

  it("resolves unsupported machine-only processes to a valid fallback for the active program", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const kitchenProgram = defaults.programs.find((program) => program.id === "atelier-kitchen")!;
    const wardrobeProgram = defaults.programs.find((program) => program.id === "wardrobe-suite")!;

    expect(isProcessSupported("drill", kitchenProgram.machineIds)).toBe(false);
    expect(resolveProcessId("drill", kitchenProgram.machineIds, defaults.processSteps)).toBe("cut");
    expect(isProcessSupported("drill", wardrobeProgram.machineIds)).toBe(true);
    expect(resolveProcessId("drill", wardrobeProgram.machineIds, defaults.processSteps)).toBe("drill");
  });

  it("resolves machine-driven process changes to an available step when editable steps are missing", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const wardrobeProgram = defaults.programs.find((program) => program.id === "wardrobe-suite")!;
    const processStepsWithoutEdge = defaults.processSteps.filter((step) => step.id !== "edge");
    const processStepsWithoutDrill = defaults.processSteps.filter((step) => step.id !== "drill");

    expect(
      resolveProcessIdForMachine(
        "edge-laser",
        wardrobeProgram.machineIds,
        processStepsWithoutEdge
      )
    ).toBe("quality");
    expect(
      resolveProcessIdForMachine(
        "drill-cell",
        wardrobeProgram.machineIds,
        processStepsWithoutDrill
      )
    ).toBe("quality");
  });

  it("builds an initial state aligned with the first program relations", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const firstProgram = defaults.programs[0];
    const firstProgramCutPlan = defaults.cutPlans.find((cutPlan) => cutPlan.id === firstProgram.cutPlanId)!;
    const unrelatedCutPlan = defaults.cutPlans.find((cutPlan) => cutPlan.id !== firstProgramCutPlan.id)!;
    const unrelatedMachine = defaults.machines.find(
      (machine) => !firstProgram.machineIds.includes(machine.id)
    )!;
    const unrelatedSurface = defaults.surfaces.find(
      (surface) => !firstProgram.surfaceIds.includes(surface.id)
    )!;

    const resolved = createResolvedTablecorContent({
      ...defaults,
      cutPlans: [unrelatedCutPlan, firstProgramCutPlan],
      machines: [
        unrelatedMachine,
        ...defaults.machines.filter((machine) => machine.id !== unrelatedMachine.id),
      ],
      surfaces: [
        unrelatedSurface,
        ...defaults.surfaces.filter((surface) => surface.id !== unrelatedSurface.id),
      ],
    });

    const initialState = createInitialTablecorState(resolved);

    expect(initialState.activeSurfaceId).toBe(firstProgram.surfaceIds[0]);
    expect(initialState.activeCutPlanId).toBe(firstProgramCutPlan.id);
    expect(initialState.activePieceId).toBe(firstProgramCutPlan.pieces[0].id);
    expect(initialState.activeMachineId).toBe(
      getProcessMachineId(initialState.activeProcessId, firstProgram.machineIds)
    );
  });

  it("skips invalid editable references when building the initial state", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const firstProgram = defaults.programs[0];
    const firstProgramCutPlan = defaults.cutPlans.find((cutPlan) => cutPlan.programId === firstProgram.id)!;

    const resolved = createResolvedTablecorContent({
      ...defaults,
      programs: [
        {
          ...firstProgram,
          surfaceIds: ["missing-surface", ...firstProgram.surfaceIds],
          machineIds: ["missing-machine", ...firstProgram.machineIds],
          cutPlanId: "missing-plan",
        },
        ...defaults.programs.slice(1),
      ],
    });

    const initialState = createInitialTablecorState(resolved);

    expect(initialState.activeSurfaceId).toBe(firstProgram.surfaceIds[0]);
    expect(initialState.activeCutPlanId).toBe(firstProgramCutPlan.id);
    expect(initialState.activeMachineId).toBe(
      getProcessMachineId(initialState.activeProcessId, firstProgram.machineIds)
    );
    expect(initialState.compareSurfaceIds).toEqual(firstProgram.surfaceIds.slice(0, 3));
  });

  it("matches the service response to the selected service step even when editable steps are shortened", () => {
    const defaults = createDefaultMvpContent().tablecor;
    const resolved = createResolvedTablecorContent({
      ...defaults,
      serviceSteps: [defaults.serviceSteps[2]],
    });
    const initialState = createInitialTablecorState(resolved);
    const activeServiceStep = getActiveServiceStep(
      resolved.tablecorServiceSteps,
      initialState.activeServiceIndex
    );
    const activeSurface = resolved.tablecorSurfaces[0];
    const activeProgram = resolved.tablecorPrograms[0];
    const activeCutPlan = resolved.tablecorCutPlans[0];
    const activeMachine = resolved.tablecorMachines[0];
    const activeProductionMode = resolved.tablecorProductionModes[0];
    const sampleFormatProfile = getSampleFormatProfile(resolved.sampleFormats[0]);
    const projectSpeedProfile = getProjectSpeedProfile(resolved.projectSpeeds[0]);
    const productionSnapshot = createProductionSnapshot(
      activeCutPlan,
      activeMachine,
      activeProductionMode,
      resolved.projectSpeeds[0]
    );

    const serviceResponse = createServiceResponse(
      initialState.activeServiceIndex,
      activeServiceStep,
      activeSurface,
      activeProgram,
      activeCutPlan,
      activeMachine,
      sampleFormatProfile,
      projectSpeedProfile,
      productionSnapshot
    );

    expect(activeServiceStep.title).toBe("Salida comercial");
    expect(serviceResponse.title).toBe(sampleFormatProfile.title);
    expect(serviceResponse.copy).toContain(productionSnapshot.commercialOutput);
  });
});
