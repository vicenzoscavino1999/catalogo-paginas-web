import type {
  TablecorContent,
  TablecorCutPiece,
  TablecorCutPlan,
  TablecorMachine,
  TablecorProcessStep,
  TablecorProductionMode,
  TablecorProgram,
  TablecorServiceStep,
  TablecorSpec,
  TablecorSurface,
} from "@/shared/content/contentTypes";
import {
  getMachineDemoForProcess,
  machineDemoSteps,
  projectSpeedProfiles,
  sampleFormatProfiles,
  staticMedia,
  type MachineDemoId,
} from "@/features/tablecor/tablecor.config";
import {
  projectSpeeds as defaultProjectSpeeds,
  sampleFormats as defaultSampleFormats,
  tablecorCutPlans as defaultTablecorCutPlans,
  tablecorFamilies as defaultTablecorFamilies,
  tablecorMachines as defaultTablecorMachines,
  tablecorProductionModes as defaultTablecorProductionModes,
  tablecorProcessSteps as defaultTablecorProcessSteps,
  tablecorPrograms as defaultTablecorPrograms,
  tablecorServiceSteps as defaultTablecorServiceSteps,
  tablecorSpecs as defaultTablecorSpecs,
  tablecorSurfaces as defaultTablecorSurfaces,
} from "@/features/tablecor/tablecor.data";
import { TABLECOR_ALL_FAMILY_ID } from "@/features/tablecor/tablecor.constants";

type SurfaceId = string;
type PieceTone = string;

interface ProcessProfile {
  copy: string;
  focusTones: PieceTone[];
  photo: string;
  photoAlt: string;
  title: string;
}

export interface ProductionSnapshot {
  commercialOutput: string;
  leadTime: string;
  responseTime: string;
  scrap: string;
  throughput: string;
  throughputCompact: string;
}

export interface ResolvedTablecorContent {
  projectSpeeds: string[];
  sampleFormats: string[];
  tablecorCutPlans: TablecorCutPlan[];
  tablecorFamilies: string[];
  tablecorMachines: TablecorMachine[];
  tablecorProductionModes: TablecorProductionMode[];
  tablecorProcessSteps: TablecorProcessStep[];
  tablecorPrograms: TablecorProgram[];
  tablecorServiceSteps: TablecorServiceStep[];
  tablecorSpecs: TablecorSpec[];
  tablecorSurfaces: TablecorSurface[];
}

export interface TablecorInitialState {
  activeCutPlanId: string;
  activeMachineDemoId: MachineDemoId;
  activeMachineId: string;
  activePieceId: string;
  activeProcessId: string;
  activeProgramId: string;
  activeServiceIndex: number;
  activeSurfaceId: string;
  compareSurfaceIds: string[];
  productionModeId: string;
  projectSpeed: string;
  sampleFormat: string;
}

function isSurface(value: TablecorSurface | undefined): value is TablecorSurface {
  return Boolean(value);
}

function isMachine(value: TablecorMachine | undefined): value is TablecorMachine {
  return Boolean(value);
}

function getFallbackRecordValue<T>(record: Record<string, T>) {
  return record[Object.keys(record)[0]];
}

function pickByIndex<T>(items: readonly T[], preferredIndex: number) {
  return items[preferredIndex] ?? items[0];
}

function hasSurfaceId(tablecorSurfaces: readonly TablecorSurface[], surfaceId: string) {
  return tablecorSurfaces.some((surface) => surface.id === surfaceId);
}

function hasMachineId(tablecorMachines: readonly TablecorMachine[], machineId: string) {
  return tablecorMachines.some((machine) => machine.id === machineId);
}

export function resolveCollection<T>(value: T[] | undefined, fallback: readonly T[]): T[] {
  return value?.length ? [...value] : [...fallback];
}

export function createResolvedTablecorContent(
  tablecor: TablecorContent
): ResolvedTablecorContent {
  return {
    tablecorFamilies: resolveCollection(tablecor.families, defaultTablecorFamilies),
    tablecorSurfaces: resolveCollection(tablecor.surfaces, defaultTablecorSurfaces),
    tablecorPrograms: resolveCollection(tablecor.programs, defaultTablecorPrograms),
    tablecorProcessSteps: resolveCollection(tablecor.processSteps, defaultTablecorProcessSteps),
    tablecorCutPlans: resolveCollection(tablecor.cutPlans, defaultTablecorCutPlans),
    tablecorMachines: resolveCollection(tablecor.machines, defaultTablecorMachines),
    tablecorProductionModes: resolveCollection(
      tablecor.productionModes,
      defaultTablecorProductionModes
    ),
    tablecorSpecs: resolveCollection(tablecor.specs, defaultTablecorSpecs),
    tablecorServiceSteps: resolveCollection(tablecor.serviceSteps, defaultTablecorServiceSteps),
    sampleFormats: resolveCollection(tablecor.sampleFormats, defaultSampleFormats),
    projectSpeeds: resolveCollection(tablecor.projectSpeeds, defaultProjectSpeeds),
  };
}

export function resolveSurfaceId(
  surfaceIds: readonly string[],
  tablecorSurfaces: readonly TablecorSurface[]
) {
  return (
    surfaceIds.find((surfaceId) => hasSurfaceId(tablecorSurfaces, surfaceId)) ??
    tablecorSurfaces[0].id
  );
}

export function resolveCutPlanId(
  program: TablecorProgram,
  tablecorCutPlans: readonly TablecorCutPlan[]
) {
  return (
    tablecorCutPlans.find(
      (cutPlan) => cutPlan.id === program.cutPlanId && cutPlan.programId === program.id
    )?.id ??
    tablecorCutPlans.find((cutPlan) => cutPlan.programId === program.id)?.id ??
    tablecorCutPlans[0].id
  );
}

export function resolveMachineId(
  machineIds: readonly string[],
  tablecorMachines: readonly TablecorMachine[],
  preferredProcessId?: string
) {
  const preferredMachineId = preferredProcessId
    ? getProcessMachineId(preferredProcessId, machineIds)
    : machineIds[0];

  if (preferredMachineId && hasMachineId(tablecorMachines, preferredMachineId)) {
    return preferredMachineId;
  }

  return (
    machineIds.find((machineId) => hasMachineId(tablecorMachines, machineId)) ??
    tablecorMachines[0].id
  );
}

export function createInitialTablecorState(
  resolved: ResolvedTablecorContent
): TablecorInitialState {
  const firstProgram = resolved.tablecorPrograms[0];
  const defaultProcessId = resolveProcessId(
    pickByIndex(resolved.tablecorProcessSteps, 2)?.id ?? "cut",
    firstProgram.machineIds,
    resolved.tablecorProcessSteps
  );
  const defaultProcess =
    resolved.tablecorProcessSteps.find((step) => step.id === defaultProcessId) ??
    resolved.tablecorProcessSteps[0];
  const defaultProductionMode = pickByIndex(resolved.tablecorProductionModes, 1);
  const defaultSampleFormat = pickByIndex(resolved.sampleFormats, 2);
  const defaultProjectSpeed = pickByIndex(resolved.projectSpeeds, 2);
  const preferredServiceIndex = resolved.tablecorServiceSteps[2] ? 2 : 0;
  const activeCutPlanId = resolveCutPlanId(firstProgram, resolved.tablecorCutPlans);
  const activeCutPlan =
    resolved.tablecorCutPlans.find((cutPlan) => cutPlan.id === activeCutPlanId) ??
    resolved.tablecorCutPlans[0];
  const activeMachineId = resolveMachineId(
    firstProgram.machineIds,
    resolved.tablecorMachines,
    defaultProcess.id
  );
  const activeSurfaceId = resolveSurfaceId(firstProgram.surfaceIds, resolved.tablecorSurfaces);
  const compareSurfaceIds = Array.from(new Set(firstProgram.surfaceIds))
    .filter((surfaceId) => hasSurfaceId(resolved.tablecorSurfaces, surfaceId))
    .slice(0, 3);

  return {
    activeSurfaceId,
    activeProgramId: firstProgram.id,
    activeMachineId,
    activeCutPlanId: activeCutPlan.id,
    activeProcessId: defaultProcess.id,
    activePieceId: activeCutPlan.pieces[0]?.id ?? "",
    activeMachineDemoId: getMachineDemoForProcess(defaultProcess.id),
    productionModeId: defaultProductionMode.id,
    sampleFormat: defaultSampleFormat,
    projectSpeed: defaultProjectSpeed,
    activeServiceIndex: preferredServiceIndex,
    compareSurfaceIds:
      compareSurfaceIds.length > 0
        ? compareSurfaceIds
        : resolved.tablecorSurfaces.slice(0, 3).map((surface) => surface.id),
  };
}

export function filterVisibleSurfaces(
  tablecorSurfaces: TablecorSurface[],
  activeFamily: string,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();

  return tablecorSurfaces.filter((surface) => {
    const matchesFamily =
      activeFamily === TABLECOR_ALL_FAMILY_ID || surface.family === activeFamily;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        surface.name,
        surface.code,
        surface.family,
        surface.finish,
        surface.thickness,
        surface.note,
        ...surface.applications,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesFamily && matchesQuery;
  });
}

export function getProcessMachineId(activeProcessId: string, machineIds: readonly string[]) {
  if (activeProcessId === "optimization") {
    return (
      machineIds.find((machineId) => machineId === "nesting-cnc") ??
      machineIds.find((machineId) => machineId === "beam-saw") ??
      machineIds[0]
    );
  }

  if (activeProcessId === "cut") {
    return (
      machineIds.find((machineId) => machineId === "beam-saw" || machineId === "nesting-cnc") ??
      machineIds[0]
    );
  }

  if (activeProcessId === "edge") {
    return machineIds.find((machineId) => machineId === "edge-laser") ?? machineIds[0];
  }

  if (activeProcessId === "drill") {
    return machineIds.find((machineId) => machineId === "drill-cell") ?? machineIds[0];
  }

  if (activeProcessId === "quality") {
    return (
      machineIds.find((machineId) => machineId === "drill-cell") ??
      machineIds.find((machineId) => machineId === "edge-laser") ??
      machineIds[machineIds.length - 1]
    );
  }

  return machineIds[0];
}

export function isProcessSupported(
  activeProcessId: string,
  machineIds: readonly string[]
) {
  if (machineIds.length === 0) {
    return false;
  }

  if (activeProcessId === "edge") {
    return machineIds.includes("edge-laser");
  }

  if (activeProcessId === "drill") {
    return machineIds.includes("drill-cell");
  }

  if (activeProcessId === "cut") {
    return machineIds.includes("beam-saw") || machineIds.includes("nesting-cnc");
  }

  return true;
}

function getDefaultProcessId(machineIds: readonly string[]) {
  if (machineIds.includes("beam-saw") || machineIds.includes("nesting-cnc")) {
    return "cut";
  }

  if (machineIds.includes("edge-laser")) {
    return "edge";
  }

  if (machineIds.includes("drill-cell")) {
    return "drill";
  }

  return "brief";
}

export function resolveProcessId(
  activeProcessId: string,
  machineIds: readonly string[],
  tablecorProcessSteps: readonly TablecorProcessStep[]
) {
  const availableProcessIds = new Set(tablecorProcessSteps.map((step) => step.id));
  const preferredProcessId = availableProcessIds.has(activeProcessId)
    ? activeProcessId
    : getDefaultProcessId(machineIds);

  if (
    availableProcessIds.has(preferredProcessId) &&
    isProcessSupported(preferredProcessId, machineIds)
  ) {
    return preferredProcessId;
  }

  const fallbackOrder = [
    getDefaultProcessId(machineIds),
    "cut",
    "optimization",
    "brief",
    "quality",
    "edge",
    "drill",
  ];

  return (
    fallbackOrder.find(
      (processId) =>
        availableProcessIds.has(processId) && isProcessSupported(processId, machineIds)
    ) ??
    tablecorProcessSteps[0]?.id ??
    activeProcessId
  );
}

function getProcessFallbackOrderForMachine(machineId: string) {
  if (machineId === "edge-laser") {
    return ["edge", "quality", "brief", "optimization", "cut", "drill"];
  }

  if (machineId === "drill-cell") {
    return ["drill", "quality", "brief", "optimization", "cut", "edge"];
  }

  return ["cut", "optimization", "brief", "quality", "edge", "drill"];
}

export function resolveProcessIdForMachine(
  machineId: string,
  machineIds: readonly string[],
  tablecorProcessSteps: readonly TablecorProcessStep[]
) {
  const availableProcessIds = new Set(tablecorProcessSteps.map((step) => step.id));
  const nextProcessId = getProcessFallbackOrderForMachine(machineId).find(
    (processId) =>
      availableProcessIds.has(processId) && isProcessSupported(processId, machineIds)
  );

  return (
    nextProcessId ??
    resolveProcessId(getDefaultProcessId(machineIds), machineIds, tablecorProcessSteps)
  );
}

export function createProcessProfile(
  activeProcessId: string,
  activeProgram: TablecorProgram,
  processMachine: TablecorMachine
): ProcessProfile {
  const profiles: Record<string, ProcessProfile> = {
    brief: {
      title: "Aterrizaje del lote",
      copy:
        "El programa se traduce en tablero, veta, tolerancia y secuencia comercial antes de producir.",
      focusTones: ["base", "accent", "glow"],
      photo: activeProgram.photo,
      photoAlt: activeProgram.photoAlt,
    },
    optimization: {
      title: "Optimizacion del despiece",
      copy:
        "El tablero se acomoda para reducir merma y conservar continuidad visual en las piezas visibles.",
      focusTones: ["base", "accent"],
      photo: staticMedia.boardStack.src,
      photoAlt: staticMedia.boardStack.alt,
    },
    cut: {
      title: "Corte primario guiado",
      copy:
        "La seccionadora o el nesting recorren el tablero en el orden definido y liberan las piezas principales.",
      focusTones: ["base"],
      photo: processMachine.photo,
      photoAlt: processMachine.photoAlt,
    },
    edge: {
      title: "Canteo de frentes visibles",
      copy:
        "Los bordes de alto contacto entran a una etapa premium para mejorar continuidad y lectura del mueble.",
      focusTones: ["accent"],
      photo: processMachine.photo,
      photoAlt: processMachine.photoAlt,
    },
    drill: {
      title: "Perforado y herraje",
      copy:
        "Las piezas pasan a drilling para dejar patron, uniones y puntos de ensamble totalmente repetibles.",
      focusTones: ["glow"],
      photo: processMachine.photo,
      photoAlt: processMachine.photoAlt,
    },
    quality: {
      title: "Control final del paquete",
      copy:
        "Se revisa tono, borde, perforado y continuidad antes de empaquetar el lote final para obra o showroom.",
      focusTones: ["base", "accent", "glow"],
      photo: staticMedia.heroShowroom.src,
      photoAlt: staticMedia.heroShowroom.alt,
    },
  };

  return profiles[activeProcessId] ?? profiles.cut;
}

export function mapProgramSurfaces(
  surfaceIds: readonly string[],
  tablecorSurfaces: TablecorSurface[]
) {
  return surfaceIds
    .map((surfaceId) => tablecorSurfaces.find((surface) => surface.id === surfaceId))
    .filter(isSurface);
}

export function getRecommendedPrograms(
  tablecorPrograms: TablecorProgram[],
  activeSurfaceId: string
) {
  return tablecorPrograms.filter((program) =>
    program.surfaceIds.some((surfaceId) => surfaceId === activeSurfaceId)
  );
}

export function mapProgramMachines(
  machineIds: readonly string[],
  tablecorMachines: TablecorMachine[]
) {
  return machineIds
    .map((machineId) => tablecorMachines.find((machine) => machine.id === machineId))
    .filter(isMachine);
}

export function mapComparedSurfaces(
  compareSurfaceIds: string[],
  tablecorSurfaces: TablecorSurface[]
) {
  return compareSurfaceIds
    .map((surfaceId) => tablecorSurfaces.find((surface) => surface.id === surfaceId))
    .filter(isSurface);
}

export function createHighlightedPieceIds(
  activeCutPlan: TablecorCutPlan,
  focusTones: readonly string[]
) {
  return new Set(
    activeCutPlan.pieces
      .filter((piece) => focusTones.includes(piece.tone))
      .map((piece) => piece.id)
  );
}

export function createProductionSnapshot(
  activeCutPlan: TablecorCutPlan,
  activeMachine: TablecorMachine,
  activeProductionMode: TablecorProductionMode,
  projectSpeed: string
): ProductionSnapshot {
  const baseThroughput = Math.round(
    activeCutPlan.pieces.length *
      (activeMachine.efficiency / 10) *
      activeProductionMode.throughputFactor
  );
  const baseScrap = Number.parseInt(activeCutPlan.scrap, 10) || 0;
  const adjustedScrap = Math.max(4, baseScrap + activeProductionMode.scrapDelta);
  const responseTime =
    projectSpeed === "Desarrollo premium"
      ? "4 h"
      : projectSpeed === "Curaduria rapida"
        ? "8 h"
        : "24 h";

  return {
    throughput: `${baseThroughput} piezas equivalentes / turno`,
    throughputCompact: `${baseThroughput} pzs / turno`,
    scrap: `${adjustedScrap}%`,
    leadTime: activeProductionMode.leadTime,
    responseTime,
    commercialOutput: activeProductionMode.commercialOutput,
  };
}

export function getSampleFormatProfile(sampleFormat: string) {
  return sampleFormatProfiles[sampleFormat] ?? getFallbackRecordValue(sampleFormatProfiles);
}

export function getProjectSpeedProfile(projectSpeed: string) {
  return projectSpeedProfiles[projectSpeed] ?? getFallbackRecordValue(projectSpeedProfiles);
}

function normalizeServiceStepTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getServiceResponseKind(
  activeServiceStep: TablecorServiceStep,
  activeServiceIndex: number
) {
  const normalizedTitle = normalizeServiceStepTitle(activeServiceStep.title);

  if (normalizedTitle.includes("curaduria")) {
    return "palette";
  }

  if (normalizedTitle.includes("lote")) {
    return "batch";
  }

  if (normalizedTitle.includes("salida")) {
    return "commercial";
  }

  if (activeServiceIndex === 0) {
    return "palette";
  }

  if (activeServiceIndex === 1) {
    return "batch";
  }

  return "commercial";
}

export function createSampleDecisionSignals(
  activeSurface: TablecorSurface,
  activeProgram: TablecorProgram,
  sampleFormatProfile: ReturnType<typeof getSampleFormatProfile>,
  projectSpeedProfile: ReturnType<typeof getProjectSpeedProfile>,
  productionSnapshot: ProductionSnapshot,
  surfaceMatchesProgram: boolean
) {
  return [
    {
      label: "Compatibilidad",
      value: surfaceMatchesProgram ? "Directa" : "Curaduria adicional",
      copy: surfaceMatchesProgram
        ? `${activeSurface.name} ya vive dentro del blend del programa ${activeProgram.title}.`
        : `${activeSurface.name} pide ajustar el blend del programa ${activeProgram.title}.`,
    },
    {
      label: "Ritmo comercial",
      value: projectSpeedProfile.packageTone,
      copy: `${productionSnapshot.responseTime} de respuesta interna / ${productionSnapshot.leadTime} de salida.`,
    },
    {
      label: "Formato elegido",
      value: sampleFormatProfile.title,
      copy: sampleFormatProfile.deliverables.join(" / "),
    },
  ];
}

export function createServiceResponse(
  activeServiceIndex: number,
  activeServiceStep: TablecorServiceStep,
  activeSurface: TablecorSurface,
  activeProgram: TablecorProgram,
  activeCutPlan: TablecorCutPlan,
  activeMachine: TablecorMachine,
  sampleFormatProfile: ReturnType<typeof getSampleFormatProfile>,
  projectSpeedProfile: ReturnType<typeof getProjectSpeedProfile>,
  productionSnapshot: ProductionSnapshot
) {
  const responseKind = getServiceResponseKind(activeServiceStep, activeServiceIndex);

  if (responseKind === "palette") {
    return {
      title: `${activeSurface.name} + ${activeProgram.title}`,
      copy: `Blend sugerido con ${sampleFormatProfile.deliverables[0]} y prioridad ${projectSpeedProfile.packageTone.toLowerCase()}.`,
    };
  }

  if (responseKind === "batch") {
    return {
      title: `${activeCutPlan.title} / ${activeMachine.name}`,
      copy: `Ruta de lote con ${productionSnapshot.scrap} de merma esperada y salida en ${productionSnapshot.leadTime}.`,
    };
  }

  return {
    title: sampleFormatProfile.title,
    copy: `${projectSpeedProfile.copy} ${productionSnapshot.commercialOutput}.`,
  };
}

export function createProcessSignals(
  processMachine: TablecorMachine,
  activePiece: TablecorCutPiece,
  activeCutPlan: TablecorCutPlan,
  activeProductionMode: TablecorProductionMode,
  productionSnapshot: ProductionSnapshot
) {
  return [
    {
      label: "Linea vinculada",
      value: processMachine.stage,
      copy: processMachine.name,
    },
    {
      label: "Pieza enfocada",
      value: activePiece.label,
      copy: `${activePiece.tone} / ${activeCutPlan.boardSize}`,
    },
    {
      label: "Estado del lote",
      value: activeProductionMode.label,
      copy: `${productionSnapshot.scrap} merma / ${productionSnapshot.leadTime}`,
    },
  ];
}

export function createMachineTelemetry(
  activeMachineDemoLabel: string,
  activePiece: TablecorCutPiece,
  activeCutPlan: TablecorCutPlan
) {
  return [
    {
      label: "Fase",
      value: activeMachineDemoLabel,
    },
    {
      label: "Pieza",
      value: activePiece.label,
    },
    {
      label: "Plano",
      value: activeCutPlan.title,
    },
  ];
}

export function toggleComparedSurfaceIds(current: string[], surfaceId: SurfaceId) {
  const uniqueCurrent = Array.from(new Set(current));

  if (uniqueCurrent.includes(surfaceId)) {
    return uniqueCurrent.filter((id) => id !== surfaceId);
  }

  if (uniqueCurrent.length >= 3) {
    return [...uniqueCurrent.slice(1), surfaceId];
  }

  return [...uniqueCurrent, surfaceId];
}

export function getNextPieceForMachineDemo(
  activeCutPlan: TablecorCutPlan,
  highlightedPieceIds: Set<string>,
  stepId: MachineDemoId
) {
  if (stepId === "finish") {
    return activeCutPlan.pieces[activeCutPlan.pieces.length - 1] ?? activeCutPlan.pieces[0];
  }

  if (stepId === "cut") {
    return (
      activeCutPlan.pieces.find((piece) => highlightedPieceIds.has(piece.id)) ??
      activeCutPlan.pieces[0]
    );
  }

  return activeCutPlan.pieces[0];
}

export function findProgramForSurface(
  tablecorPrograms: TablecorProgram[],
  surfaceId: string
) {
  return tablecorPrograms.find((program) =>
    program.surfaceIds.some((entry) => entry === surfaceId)
  );
}

export function getMachineDemoStep(activeMachineDemoId: MachineDemoId) {
  return machineDemoSteps.find((step) => step.id === activeMachineDemoId) ?? machineDemoSteps[0];
}

export function getActiveServiceStep(
  tablecorServiceSteps: TablecorServiceStep[],
  activeServiceIndex: number
) {
  return tablecorServiceSteps[activeServiceIndex] ?? tablecorServiceSteps[0];
}
