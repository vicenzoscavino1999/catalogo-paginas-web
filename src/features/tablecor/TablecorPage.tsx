import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { applySurfaceMotion, resetSurfaceMotion } from "@/shared/motion/surfaceMotion";
import {
  getMachineDemoForProcess,
  machineDemoSteps,
  staticMedia,
  type MachineDemoId,
} from "@/features/tablecor/tablecor.config";
import { TABLECOR_ALL_FAMILY_ID } from "@/features/tablecor/tablecor.constants";
import { useTablecorStoryMotion } from "@/features/tablecor/useTablecorStoryMotion";
import {
  createHighlightedPieceIds,
  createInitialTablecorState,
  createMachineTelemetry,
  createProcessProfile,
  createProcessSignals,
  createProductionSnapshot,
  createResolvedTablecorContent,
  createSampleDecisionSignals,
  createServiceResponse,
  filterVisibleSurfaces,
  findProgramForSurface,
  getActiveServiceStep,
  getMachineDemoStep,
  isProcessSupported,
  getProcessMachineId,
  getProjectSpeedProfile,
  getRecommendedPrograms,
  getSampleFormatProfile,
  getNextPieceForMachineDemo,
  mapComparedSurfaces,
  mapProgramMachines,
  mapProgramSurfaces,
  resolveCutPlanId,
  resolveMachineId,
  resolveProcessId,
  resolveProcessIdForMachine,
  resolveSurfaceId,
  toggleComparedSurfaceIds,
} from "@/features/tablecor/tablecor.logic";
import {
  type HeroTransitionFrame,
  type MachineTransitionFrame,
  type ProcessTransitionFrame,
  type SampleTransitionFrame,
  TablecorHeroSection,
  TablecorLibrarySection,
  TablecorMachineSection,
  TablecorProcessSection,
  TablecorProgramSection,
  TablecorSampleSection,
  TablecorTopbar,
  getTablecorSectionLabel,
} from "@/features/tablecor/TablecorSections";
import styles from "@/features/tablecor/tablecor.module.css";

type SurfaceFamily = string;
type SurfaceId = string;
type ProgramId = string;
type MachineId = string;
type CutPlanId = string;
type PieceId = string;
type ProcessStepId = string;
type ProductionModeId = string;
type SampleFormat = string;
type ProjectSpeed = string;

export function TablecorPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const heroFrameRef = useRef<HeroTransitionFrame | null>(null);
  const machineFrameRef = useRef<MachineTransitionFrame | null>(null);
  const processFrameRef = useRef<ProcessTransitionFrame | null>(null);
  const sampleFrameRef = useRef<SampleTransitionFrame | null>(null);
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("tablecor");
  const nextSite = getNextSite("tablecor");
  const resolved = useMemo(
    () => createResolvedTablecorContent(content.tablecor),
    [content.tablecor]
  );
  const {
    projectSpeeds,
    sampleFormats,
    tablecorCutPlans,
    tablecorFamilies,
    tablecorMachines,
    tablecorProductionModes,
    tablecorProcessSteps,
    tablecorPrograms,
    tablecorServiceSteps,
    tablecorSpecs,
    tablecorSurfaces,
  } = resolved;
  const initialState = useMemo(() => createInitialTablecorState(resolved), [resolved]);

  useDocumentTitle(siteMeta.title);

  const [activeFamily, setActiveFamily] = useState<SurfaceFamily>(TABLECOR_ALL_FAMILY_ID);
  const [query, setQuery] = useState("");
  const [activeSurfaceId, setActiveSurfaceId] = useState<SurfaceId>(() => initialState.activeSurfaceId);
  const [activeProgramId, setActiveProgramId] = useState<ProgramId>(() => initialState.activeProgramId);
  const [activeMachineId, setActiveMachineId] = useState<MachineId>(() => initialState.activeMachineId);
  const [activeCutPlanId, setActiveCutPlanId] = useState<CutPlanId>(() => initialState.activeCutPlanId);
  const [activeProcessId, setActiveProcessId] = useState<ProcessStepId>(() => initialState.activeProcessId);
  const [activePieceId, setActivePieceId] = useState<PieceId>(() => initialState.activePieceId);
  const [activeMachineDemoId, setActiveMachineDemoId] = useState<MachineDemoId>(
    () => initialState.activeMachineDemoId
  );
  const [productionModeId, setProductionModeId] = useState<ProductionModeId>(
    () => initialState.productionModeId
  );
  const [sampleFormat, setSampleFormat] = useState<SampleFormat>(() => initialState.sampleFormat);
  const [projectSpeed, setProjectSpeed] = useState<ProjectSpeed>(() => initialState.projectSpeed);
  const [activeServiceIndex, setActiveServiceIndex] = useState(() => initialState.activeServiceIndex);
  const [compareSurfaceIds, setCompareSurfaceIds] = useState<SurfaceId[]>(
    () => initialState.compareSurfaceIds
  );
  const [activeSection, setActiveSection] = useState("hero");
  const [heroTransitionFrame, setHeroTransitionFrame] = useState<HeroTransitionFrame | null>(null);
  const [machineTransitionFrame, setMachineTransitionFrame] = useState<MachineTransitionFrame | null>(
    null
  );
  const [processTransitionFrame, setProcessTransitionFrame] = useState<ProcessTransitionFrame | null>(
    null
  );
  const [sampleTransitionFrame, setSampleTransitionFrame] = useState<SampleTransitionFrame | null>(
    null
  );

  const deferredQuery = useDeferredValue(query);
  const { isTopbarCompact, isTopbarHidden, scrollProgressPercent } = useScrollChrome({
    compactThreshold: 88,
    hideThreshold: 44,
    progressTarget: pageRef,
    progressStateStep: 0.01,
  });
  const activeSectionLabel = getTablecorSectionLabel(activeSection);
  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
  } = usePointerGlow({
    pageRef,
    cursorAuraRef,
    cursorDotRef,
    initialX: "50vw",
    initialY: "34vh",
    lerp: 0.22,
    auraRotateDeg: -10,
  });

  useEffect(() => {
    if (activeFamily !== TABLECOR_ALL_FAMILY_ID && !tablecorFamilies.includes(activeFamily)) {
      setActiveFamily(TABLECOR_ALL_FAMILY_ID);
    }
  }, [activeFamily, tablecorFamilies]);

  useEffect(() => {
    if (!tablecorSurfaces.some((surface) => surface.id === activeSurfaceId)) {
      setActiveSurfaceId(initialState.activeSurfaceId);
    }
  }, [activeSurfaceId, initialState.activeSurfaceId, tablecorSurfaces]);

  useEffect(() => {
    if (!tablecorPrograms.some((program) => program.id === activeProgramId)) {
      setActiveProgramId(initialState.activeProgramId);
    }
  }, [activeProgramId, initialState.activeProgramId, tablecorPrograms]);

  useEffect(() => {
    if (!tablecorProcessSteps.some((step) => step.id === activeProcessId)) {
      setActiveProcessId(initialState.activeProcessId);
    }
  }, [activeProcessId, initialState.activeProcessId, tablecorProcessSteps]);

  useEffect(() => {
    if (!tablecorProductionModes.some((mode) => mode.id === productionModeId)) {
      setProductionModeId(initialState.productionModeId);
    }
  }, [initialState.productionModeId, productionModeId, tablecorProductionModes]);

  useEffect(() => {
    if (!sampleFormats.includes(sampleFormat)) {
      setSampleFormat(initialState.sampleFormat);
    }
  }, [initialState.sampleFormat, sampleFormat, sampleFormats]);

  useEffect(() => {
    if (!projectSpeeds.includes(projectSpeed)) {
      setProjectSpeed(initialState.projectSpeed);
    }
  }, [initialState.projectSpeed, projectSpeed, projectSpeeds]);

  useEffect(() => {
    if (activeServiceIndex > tablecorServiceSteps.length - 1) {
      setActiveServiceIndex(Math.max(0, tablecorServiceSteps.length - 1));
    }
  }, [activeServiceIndex, tablecorServiceSteps.length]);

  useEffect(() => {
    const normalizedCompareSurfaceIds = Array.from(new Set(compareSurfaceIds)).filter((surfaceId) =>
      tablecorSurfaces.some((surface) => surface.id === surfaceId)
    );
    const nextCompareSurfaceIds = normalizedCompareSurfaceIds;

    if (
      nextCompareSurfaceIds.length !== compareSurfaceIds.length ||
      nextCompareSurfaceIds.some((surfaceId, index) => surfaceId !== compareSurfaceIds[index])
    ) {
      setCompareSurfaceIds(nextCompareSurfaceIds);
    }
  }, [compareSurfaceIds, tablecorSurfaces]);

  const visibleSurfaces = useMemo(
    () => filterVisibleSurfaces(tablecorSurfaces, activeFamily, deferredQuery),
    [activeFamily, deferredQuery, tablecorSurfaces]
  );

  useEffect(() => {
    if (visibleSurfaces.length === 0) {
      return;
    }

    if (!visibleSurfaces.some((surface) => surface.id === activeSurfaceId)) {
      setActiveSurfaceId(visibleSurfaces[0].id);
    }
  }, [activeSurfaceId, visibleSurfaces]);

  const activeSurface =
    visibleSurfaces.find((surface) => surface.id === activeSurfaceId) ??
    tablecorSurfaces.find((surface) => surface.id === activeSurfaceId) ??
    tablecorSurfaces[0];
  const activeProgram =
    tablecorPrograms.find((program) => program.id === activeProgramId) ?? tablecorPrograms[0];
  const cutPlansForProgram = useMemo(
    () => tablecorCutPlans.filter((plan) => plan.programId === activeProgram.id),
    [activeProgram.id, tablecorCutPlans]
  );
  const programMachines = useMemo(
    () => mapProgramMachines(activeProgram.machineIds, tablecorMachines),
    [activeProgram.machineIds, tablecorMachines]
  );
  const programSurfaces = useMemo(
    () => mapProgramSurfaces(activeProgram.surfaceIds, tablecorSurfaces),
    [activeProgram.surfaceIds, tablecorSurfaces]
  );
  const supportedProcessIds = useMemo(
    () =>
      new Set(
        tablecorProcessSteps
          .filter((step) => isProcessSupported(step.id, activeProgram.machineIds))
          .map((step) => step.id)
      ),
    [activeProgram.machineIds, tablecorProcessSteps]
  );
  const supportedMachineIds = useMemo(
    () => new Set(activeProgram.machineIds),
    [activeProgram.machineIds]
  );

  useEffect(() => {
    const fallbackProcessId = resolveProcessId(
      activeProcessId,
      activeProgram.machineIds,
      tablecorProcessSteps
    );
    const nextPlan = tablecorCutPlans.find(
      (plan) => plan.id === activeCutPlanId && plan.programId === activeProgram.id
    );
    const fallbackCutPlanId = resolveCutPlanId(activeProgram, tablecorCutPlans);
    const fallbackMachineId = resolveMachineId(
      activeProgram.machineIds,
      tablecorMachines,
      fallbackProcessId
    );
    const fallbackSurfaceId = resolveSurfaceId(activeProgram.surfaceIds, tablecorSurfaces);

    if (fallbackProcessId !== activeProcessId) {
      setActiveProcessId(fallbackProcessId);
      setActiveMachineDemoId(getMachineDemoForProcess(fallbackProcessId));
    }

    if (!nextPlan && activeCutPlanId !== fallbackCutPlanId) {
      setActiveCutPlanId(fallbackCutPlanId);
    }

    if (
      tablecorMachines.length > 0 &&
      activeMachineId !== fallbackMachineId &&
      !programMachines.some((machine) => machine.id === activeMachineId)
    ) {
      setActiveMachineId(fallbackMachineId);
    }

    if (
      tablecorSurfaces.length > 0 &&
      activeSurfaceId !== fallbackSurfaceId &&
      !programSurfaces.some((surface) => surface.id === activeSurfaceId)
    ) {
      const matchingProgram = findProgramForSurface(tablecorPrograms, activeSurfaceId);

      if (matchingProgram) {
        applyProgramSelection(matchingProgram, activeSurfaceId);
      } else {
        setActiveSurfaceId(fallbackSurfaceId);
      }
    }
  }, [
    activeCutPlanId,
    activeMachineId,
    activeProcessId,
    activeProgram,
    activeSurfaceId,
    programMachines,
    programSurfaces,
    tablecorCutPlans,
    tablecorMachines,
    tablecorProcessSteps,
    tablecorPrograms,
    tablecorSurfaces,
  ]);

  const activeMachine =
    tablecorMachines.find((machine) => machine.id === activeMachineId) ?? tablecorMachines[0];
  const activeCutPlan =
    cutPlansForProgram.find((plan) => plan.id === activeCutPlanId) ??
    cutPlansForProgram[0] ??
    tablecorCutPlans[0];
  const activeProcess =
    tablecorProcessSteps.find((step) => step.id === activeProcessId) ?? tablecorProcessSteps[0];
  const activeProductionMode =
    tablecorProductionModes.find((mode) => mode.id === productionModeId) ??
    tablecorProductionModes[0];

  const processMachineId = useMemo(
    () =>
      activeProgram.machineIds.some((machineId) => machineId === activeMachine.id) &&
      isProcessSupported(activeProcess.id, [activeMachine.id])
        ? activeMachine.id
        : getProcessMachineId(activeProcess.id, activeProgram.machineIds),
    [activeMachine.id, activeProcess.id, activeProgram.machineIds]
  );
  const processMachine =
    tablecorMachines.find((machine) => machine.id === processMachineId) ?? activeMachine;
  const processProfile = useMemo(
    () => createProcessProfile(activeProcess.id, activeProgram, processMachine),
    [activeProcess.id, activeProgram, processMachine]
  );
  const recommendedPrograms = useMemo(
    () => getRecommendedPrograms(tablecorPrograms, activeSurface.id),
    [activeSurface.id, tablecorPrograms]
  );
  const compareSurfaces = useMemo(
    () => mapComparedSurfaces(compareSurfaceIds, tablecorSurfaces),
    [compareSurfaceIds, tablecorSurfaces]
  );

  const highlightedPieceIds = useMemo(
    () => createHighlightedPieceIds(activeCutPlan, processProfile.focusTones),
    [activeCutPlan, processProfile.focusTones]
  );
  const activePiece =
    activeCutPlan.pieces.find((piece) => piece.id === activePieceId) ??
    activeCutPlan.pieces.find((piece) => highlightedPieceIds.has(piece.id)) ??
    tablecorCutPlans[0].pieces[0];
  const activeMachineDemo = getMachineDemoStep(activeMachineDemoId);

  useEffect(() => {
    const nextHighlightedPiece =
      activeCutPlan.pieces.find((piece) => processProfile.focusTones.includes(piece.tone)) ??
      activeCutPlan.pieces[0];

    if (!nextHighlightedPiece) {
      return;
    }

    if (!activeCutPlan.pieces.some((piece) => piece.id === activePieceId)) {
      setActivePieceId(nextHighlightedPiece.id);
      return;
    }

    if (!highlightedPieceIds.has(activePieceId)) {
      setActivePieceId(nextHighlightedPiece.id);
    }
  }, [activeCutPlan, highlightedPieceIds, processProfile.focusTones]);

  const productionSnapshot = useMemo(
    () => createProductionSnapshot(activeCutPlan, activeMachine, activeProductionMode, projectSpeed),
    [activeCutPlan, activeMachine, activeProductionMode, projectSpeed]
  );
  const sampleFormatProfile = useMemo(
    () => getSampleFormatProfile(sampleFormat),
    [sampleFormat]
  );
  const projectSpeedProfile = useMemo(
    () => getProjectSpeedProfile(projectSpeed),
    [projectSpeed]
  );
  const surfaceMatchesProgram = activeProgram.surfaceIds.some(
    (surfaceId) => surfaceId === activeSurface.id
  );
  const samplePreviewMedia = surfaceMatchesProgram
    ? { src: activeProgram.photo, alt: activeProgram.photoAlt }
    : { src: staticMedia.heroShowroom.src, alt: staticMedia.heroShowroom.alt };
  const sampleDecisionSignals = useMemo(
    () =>
      createSampleDecisionSignals(
        activeSurface,
        activeProgram,
        sampleFormatProfile,
        projectSpeedProfile,
        productionSnapshot,
        surfaceMatchesProgram
      ),
    [
      activeProgram,
      activeSurface,
      productionSnapshot,
      projectSpeedProfile,
      sampleFormatProfile,
      surfaceMatchesProgram,
    ]
  );
  const activeServiceStep = getActiveServiceStep(tablecorServiceSteps, activeServiceIndex);
  const serviceResponse = useMemo(
    () =>
      createServiceResponse(
        activeServiceIndex,
        activeServiceStep,
        activeSurface,
        activeProgram,
        activeCutPlan,
        activeMachine,
        sampleFormatProfile,
        projectSpeedProfile,
        productionSnapshot
      ),
    [
      activeCutPlan,
      activeMachine,
      activeProgram,
      activeServiceIndex,
      activeSurface,
      productionSnapshot,
      projectSpeedProfile,
      sampleFormatProfile,
    ]
  );
  const processSignals = useMemo(
    () =>
      createProcessSignals(
        processMachine,
        activePiece,
        activeCutPlan,
        activeProductionMode,
        productionSnapshot
      ),
    [activeCutPlan, activePiece, activeProductionMode, processMachine, productionSnapshot]
  );
  const machineTelemetry = useMemo(
    () => createMachineTelemetry(activeMachineDemo.label, activePiece, activeCutPlan),
    [activeCutPlan, activeMachineDemo.label, activePiece]
  );

  function toggleCompareSurface(surfaceId: SurfaceId) {
    setCompareSurfaceIds((current) => toggleComparedSurfaceIds(current, surfaceId));
  }

  function applyProgramSelection(program: typeof activeProgram, preferredSurfaceId?: SurfaceId) {
    const nextSurfaceId =
      preferredSurfaceId && program.surfaceIds.some((surfaceId) => surfaceId === preferredSurfaceId)
        ? preferredSurfaceId
        : resolveSurfaceId(program.surfaceIds, tablecorSurfaces);
    const nextProcessId = resolveProcessId(
      activeProcessId,
      program.machineIds,
      tablecorProcessSteps
    );
    const nextCutPlanId = resolveCutPlanId(program, tablecorCutPlans);
    const nextMachineId = resolveMachineId(program.machineIds, tablecorMachines, nextProcessId);

    setActiveProgramId(program.id);
    setActiveSurfaceId(nextSurfaceId);
    setActiveProcessId(nextProcessId);
    setActiveCutPlanId(nextCutPlanId);
    setActiveMachineId(nextMachineId);
    setActiveMachineDemoId(getMachineDemoForProcess(nextProcessId));
  }

  function focusMachineDemo(stepId: MachineDemoId) {
    setActiveMachineDemoId(stepId);

    const nextPiece = getNextPieceForMachineDemo(activeCutPlan, highlightedPieceIds, stepId);

    if (nextPiece) {
      setActivePieceId(nextPiece.id);
    }
  }

  function focusSurface(surfaceId: SurfaceId) {
    if (activeProgram.surfaceIds.some((entry) => entry === surfaceId)) {
      setActiveSurfaceId(surfaceId);
      return;
    }

    const matchingProgram = findProgramForSurface(tablecorPrograms, surfaceId);

    if (matchingProgram) {
      applyProgramSelection(matchingProgram, surfaceId);
      return;
    }

    setActiveSurfaceId(surfaceId);
  }

  function focusProgram(programId: ProgramId) {
    const program = tablecorPrograms.find((entry) => entry.id === programId) ?? tablecorPrograms[0];

    applyProgramSelection(program);
  }

  function syncProcessToMachine(machineId: MachineId) {
    const nextProcessId = resolveProcessIdForMachine(
      machineId,
      activeProgram.machineIds,
      tablecorProcessSteps
    );

    setActiveProcessId(nextProcessId);
    focusMachineDemo(getMachineDemoForProcess(nextProcessId));
  }

  function selectFamily(family: SurfaceFamily) {
    startTransition(() => setActiveFamily(family));
  }

  function selectSurface(surfaceId: SurfaceId) {
    startTransition(() => focusSurface(surfaceId));
  }

  function selectProgram(programId: ProgramId) {
    startTransition(() => focusProgram(programId));
  }

  function selectMachine(machineId: MachineId) {
    if (!supportedMachineIds.has(machineId)) {
      return;
    }

    startTransition(() => {
      setActiveMachineId(machineId);
      syncProcessToMachine(machineId);
    });
  }

  function selectProcess(processId: ProcessStepId) {
    startTransition(() => {
      const nextProcessId = resolveProcessId(
        processId,
        activeProgram.machineIds,
        tablecorProcessSteps
      );
      const nextMachineId = resolveMachineId(
        activeProgram.machineIds,
        tablecorMachines,
        nextProcessId
      );

      if (nextMachineId) {
        setActiveMachineId(nextMachineId);
      }

      setActiveProcessId(nextProcessId);
      setActiveMachineDemoId(getMachineDemoForProcess(nextProcessId));
    });
  }

  function selectCutPlan(cutPlanId: CutPlanId) {
    startTransition(() => setActiveCutPlanId(cutPlanId));
  }

  const pageStyle = useMemo(
    () =>
      ({
        ["--surface-base" as string]: activeSurface.base,
        ["--surface-accent" as string]: activeSurface.accent,
        ["--surface-glow" as string]: activeSurface.glow,
        ["--program-base" as string]: activeProgram.base,
        ["--program-accent" as string]: activeProgram.accent,
        ["--program-glow" as string]: activeProgram.glow,
        ["--machine-base" as string]: activeMachine.base,
        ["--machine-accent" as string]: activeMachine.accent,
        ["--machine-glow" as string]: activeMachine.glow,
        ["--page-pointer-x" as string]: "50vw",
        ["--page-pointer-y" as string]: "34vh",
      }) as CSSProperties,
    [
      activeMachine.accent,
      activeMachine.base,
      activeMachine.glow,
      activeProgram.accent,
      activeProgram.base,
      activeProgram.glow,
      activeSurface.accent,
      activeSurface.base,
      activeSurface.glow,
    ]
  );

  const machineDemoStyle = useMemo(
    () =>
      ({
        ["--machine-head-left" as string]: activeMachineDemo.headLeft,
        ["--machine-laser-height" as string]: activeMachineDemo.laserHeight,
        ["--machine-pulse-left" as string]: activeMachineDemo.pulseLeft,
      }) as CSSProperties,
    [activeMachineDemo.headLeft, activeMachineDemo.laserHeight, activeMachineDemo.pulseLeft]
  );
  const currentHeroFrame = useMemo<HeroTransitionFrame>(
    () => ({
      programPhoto: activeProgram.photo,
      programTitle: activeProgram.title,
      surfaceFamily: activeSurface.family,
    }),
    [
      activeProgram.photo,
      activeProgram.title,
      activeSurface.family,
    ]
  );
  const currentMachineFrame = useMemo<MachineTransitionFrame>(
    () => ({
      demoLabel: activeMachineDemo.label,
      machineName: activeMachine.name,
      machinePhoto: activeMachine.photo,
      pieceLabel: activePiece.label,
      processTitle: activeProcess.title,
    }),
    [
      activeMachineDemo.label,
      activeMachine.name,
      activeMachine.photo,
      activePiece.label,
      activeProcess.title,
    ]
  );
  const currentProcessFrame = useMemo<ProcessTransitionFrame>(
    () => ({
      machineName: processMachine.name,
      processPhoto: processProfile.photo,
      processTitle: activeProcess.title,
    }),
    [
      activeProcess.title,
      processMachine.name,
      processProfile.photo,
    ]
  );
  const currentSampleFrame = useMemo<SampleTransitionFrame>(
    () => ({
      formatCopy: sampleFormatProfile.copy,
      formatTitle: sampleFormatProfile.title,
      previewAlt: samplePreviewMedia.alt,
      previewSrc: samplePreviewMedia.src,
    }),
    [
      sampleFormatProfile.copy,
      sampleFormatProfile.title,
      samplePreviewMedia.alt,
      samplePreviewMedia.src,
    ]
  );

  useSectionVisibility({
    pageRef,
    onSectionChange: setActiveSection,
    rootMargin: "-8% 0px -18% 0px",
    threshold: [0.14, 0.28, 0.42],
    visibleBottomRatio: 0.1,
    visibleTopRatio: 0.9,
  });
  useTablecorStoryMotion({
    activeSection,
    pageRef,
  });

  useEffect(() => {
    if (!heroFrameRef.current) {
      heroFrameRef.current = currentHeroFrame;
      return;
    }

    const previousFrame = heroFrameRef.current;
    const hasHeroTransition =
      previousFrame.programPhoto !== currentHeroFrame.programPhoto ||
      previousFrame.programTitle !== currentHeroFrame.programTitle ||
      previousFrame.surfaceFamily !== currentHeroFrame.surfaceFamily;

    heroFrameRef.current = currentHeroFrame;

    if (!hasHeroTransition) {
      return;
    }

    setHeroTransitionFrame(previousFrame);

    const timeoutId = window.setTimeout(() => {
      setHeroTransitionFrame(null);
    }, 640);

    return () => window.clearTimeout(timeoutId);
  }, [currentHeroFrame]);

  useEffect(() => {
    if (!machineFrameRef.current) {
      machineFrameRef.current = currentMachineFrame;
      return;
    }

    const previousFrame = machineFrameRef.current;
    const hasMachineTransition =
      previousFrame.machinePhoto !== currentMachineFrame.machinePhoto ||
      previousFrame.demoLabel !== currentMachineFrame.demoLabel ||
      previousFrame.pieceLabel !== currentMachineFrame.pieceLabel;

    machineFrameRef.current = currentMachineFrame;

    if (!hasMachineTransition) {
      return;
    }

    setMachineTransitionFrame(previousFrame);

    const timeoutId = window.setTimeout(() => {
      setMachineTransitionFrame(null);
    }, 560);

    return () => window.clearTimeout(timeoutId);
  }, [currentMachineFrame]);

  useEffect(() => {
    if (!processFrameRef.current) {
      processFrameRef.current = currentProcessFrame;
      return;
    }

    const previousFrame = processFrameRef.current;
    const hasProcessTransition =
      previousFrame.processPhoto !== currentProcessFrame.processPhoto ||
      previousFrame.machineName !== currentProcessFrame.machineName ||
      previousFrame.processTitle !== currentProcessFrame.processTitle;

    processFrameRef.current = currentProcessFrame;

    if (!hasProcessTransition) {
      return;
    }

    setProcessTransitionFrame(previousFrame);

    const timeoutId = window.setTimeout(() => {
      setProcessTransitionFrame(null);
    }, 620);

    return () => window.clearTimeout(timeoutId);
  }, [currentProcessFrame]);

  useEffect(() => {
    if (!sampleFrameRef.current) {
      sampleFrameRef.current = currentSampleFrame;
      return;
    }

    const previousFrame = sampleFrameRef.current;
    const hasSampleTransition =
      previousFrame.previewSrc !== currentSampleFrame.previewSrc ||
      previousFrame.formatTitle !== currentSampleFrame.formatTitle ||
      previousFrame.formatCopy !== currentSampleFrame.formatCopy;

    sampleFrameRef.current = currentSampleFrame;

    if (!hasSampleTransition) {
      return;
    }

    setSampleTransitionFrame(previousFrame);

    const timeoutId = window.setTimeout(() => {
      setSampleTransitionFrame(null);
    }, 620);

    return () => window.clearTimeout(timeoutId);
  }, [currentSampleFrame]);

  function handleSurfaceMove(event: ReactPointerEvent<HTMLElement>) {
    applySurfaceMotion(event, {
      bgXFactor: 0.35,
      bgYFactor: 0.24,
      offsetX: 18,
      offsetY: 18,
      panelXFactor: 1,
      panelYFactor: 1,
      tiltXFactor: 3.2,
      tiltYFactor: 4.2,
    });
  }

  function handleSurfaceLeave(event: ReactPointerEvent<HTMLElement>) {
    resetSurfaceMotion(event, {
      bgXFactor: 0.35,
      bgYFactor: 0.24,
      panelXFactor: 1,
      panelYFactor: 1,
      tiltXFactor: 3.2,
      tiltYFactor: 4.2,
    });
  }

  return (
    <main
      className={styles.page}
      data-active-section={activeSection}
      data-cursor="hidden"
      ref={pageRef}
      style={pageStyle}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={styles.pageGlow} />
      <div className={styles.cursorAura} ref={cursorAuraRef} />
      <div className={styles.cursorDot} ref={cursorDotRef} />
      {activeSection !== "hero" ? (
        <div className={styles.scrollMeter} aria-hidden="true">
          <span className={styles.scrollMeterLine} />
          <span className={styles.scrollMeterFill} />
          <span className={styles.scrollMeterValue}>{scrollProgressPercent}%</span>
          <span className={styles.scrollMeterLabel}>{activeSectionLabel}</span>
        </div>
      ) : null}
      <div className={styles.stack}>
        <TablecorTopbar
          activeProgramTitle={activeProgram.title}
          activeSection={activeSection}
          activeSurfaceCode={activeSurface.code}
          isTopbarCompact={isTopbarCompact}
          isTopbarHidden={isTopbarHidden}
          nextSite={nextSite}
          siteMeta={siteMeta}
        />
        <TablecorHeroSection
          activeCutPlan={activeCutPlan}
          activeMachine={activeMachine}
          activeProductionMode={activeProductionMode}
          activeProgram={activeProgram}
          activeSurface={activeSurface}
          heroTransitionFrame={heroTransitionFrame}
          onSelectMachine={selectMachine}
          onSelectSurface={selectSurface}
          onSurfaceLeave={handleSurfaceLeave}
          onSurfaceMove={handleSurfaceMove}
          productionSnapshot={productionSnapshot}
          programMachines={programMachines}
          programSurfaces={programSurfaces}
          siteMeta={siteMeta}
          staticMedia={staticMedia}
        />

        <TablecorLibrarySection
          activeFamily={activeFamily}
          activeMachine={activeMachine}
          activeProgram={activeProgram}
          activeSurface={activeSurface}
          compareSurfaceIds={compareSurfaceIds}
          compareSurfaces={compareSurfaces}
          onQueryChange={setQuery}
          onSelectFamily={selectFamily}
          onSelectProgram={selectProgram}
          onSelectSurface={selectSurface}
          onSurfaceLeave={handleSurfaceLeave}
          onSurfaceMove={handleSurfaceMove}
          onToggleCompareSurface={toggleCompareSurface}
          programMachines={programMachines}
          query={query}
          recommendedPrograms={recommendedPrograms}
          surfaceMatchesProgram={surfaceMatchesProgram}
          tablecorFamilies={tablecorFamilies}
          visibleSurfaces={visibleSurfaces}
        />

        <TablecorProgramSection
          activeProgram={activeProgram}
          activeSurface={activeSurface}
          onSelectProgram={selectProgram}
          onSelectSurface={selectSurface}
          programSurfaces={programSurfaces}
          tablecorPrograms={tablecorPrograms}
        />

        <TablecorProcessSection
          activeCutPlan={activeCutPlan}
          activePiece={activePiece}
          activeProcess={activeProcess}
          activeProductionMode={activeProductionMode}
          cutPlansForProgram={cutPlansForProgram}
          highlightedPieceIds={highlightedPieceIds}
          onSelectCutPlan={selectCutPlan}
          onSelectPiece={setActivePieceId}
          onSelectProcess={selectProcess}
          onSelectProductionMode={setProductionModeId}
          onSurfaceLeave={handleSurfaceLeave}
          onSurfaceMove={handleSurfaceMove}
          processMachine={processMachine}
          processProfile={processProfile}
          processSignals={processSignals}
          processTransitionFrame={processTransitionFrame}
          productionSnapshot={productionSnapshot}
          supportedProcessIds={supportedProcessIds}
          tablecorProcessSteps={tablecorProcessSteps}
          tablecorProductionModes={tablecorProductionModes}
        />

        <TablecorMachineSection
          activeCutPlan={activeCutPlan}
          activeMachine={activeMachine}
          activeMachineDemo={activeMachineDemo}
          activePiece={activePiece}
          activeProcess={activeProcess}
          activeProductionMode={activeProductionMode}
          machineDemoSteps={machineDemoSteps}
          machineDemoStyle={machineDemoStyle}
          machineTransitionFrame={machineTransitionFrame}
          machineTelemetry={machineTelemetry}
          onFocusMachineDemo={focusMachineDemo}
          onSelectMachine={selectMachine}
          onSurfaceLeave={handleSurfaceLeave}
          onSurfaceMove={handleSurfaceMove}
          supportedMachineIds={supportedMachineIds}
          tablecorMachines={tablecorMachines}
          tablecorSpecs={tablecorSpecs}
        />

        <TablecorSampleSection
          activeCutPlan={activeCutPlan}
          activeMachine={activeMachine}
          activeProgram={activeProgram}
          activeServiceIndex={activeServiceIndex}
          activeServiceStep={activeServiceStep}
          activeSurface={activeSurface}
          onSelectProjectSpeed={setProjectSpeed}
          onSelectSampleFormat={setSampleFormat}
          onSelectServiceIndex={setActiveServiceIndex}
          onSurfaceLeave={handleSurfaceLeave}
          onSurfaceMove={handleSurfaceMove}
          productionSnapshot={productionSnapshot}
          projectSpeed={projectSpeed}
          projectSpeedProfile={projectSpeedProfile}
          projectSpeeds={projectSpeeds}
          sampleDecisionSignals={sampleDecisionSignals}
          sampleFormat={sampleFormat}
          sampleFormatProfile={sampleFormatProfile}
          sampleFormats={sampleFormats}
          samplePreviewMedia={samplePreviewMedia}
          sampleTransitionFrame={sampleTransitionFrame}
          serviceResponse={serviceResponse}
          tablecorServiceSteps={tablecorServiceSteps}
        />
      </div>
    </main>
  );
}
