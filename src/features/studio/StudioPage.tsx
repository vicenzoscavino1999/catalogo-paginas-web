import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import {
  StudioCasesSection,
  StudioClosingSection,
  StudioHeroSection,
  StudioProcessSection,
  StudioServicesSection,
  StudioTopbar,
} from "@/features/studio/StudioSections";
import {
  defaultStudioProfile,
  getCaseProfile,
  getDisciplineProfile,
} from "@/features/studio/studioProfiles";
import {
  createStudioGalleryCards,
  createStudioHeroCasePreviews,
  createStudioHeroMetrics,
  getMatchingStudioDiscipline,
  getRelatedStudioCases,
  getStudioCaseFilters,
  getVisibleStudioCases,
} from "@/features/studio/studioSelectors";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";
import { applySurfaceMotion, resetSurfaceMotion } from "@/shared/motion/surfaceMotion";
import styles from "@/features/studio/studio.module.css";

const surfaceMotionOptions = {
  offsetX: 32,
  offsetY: 24,
  bgXFactor: 0.42,
  bgYFactor: 0.42,
  bgInvertXFactor: -0.3,
  bgInvertYFactor: -0.3,
  panelXFactor: -0.2,
  panelYFactor: -0.2,
  tiltXFactor: 4,
  tiltYFactor: 6,
} as const;

export function StudioPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("studio");
  const nextSite = getNextSite("studio");
  const studio = content.studio;
  const disciplines = studio.disciplines ?? [];
  const caseStudies = studio.caseStudies ?? [];
  const workflow = studio.workflow ?? [];
  const caseFilters = useMemo(() => getStudioCaseFilters(caseStudies), [caseStudies]);

  useDocumentTitle(siteMeta.title);

  const [activeDiscipline, setActiveDiscipline] = useState(() => disciplines[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeCaseName, setActiveCaseName] = useState(() => caseStudies[0]?.name ?? "");
  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [transitionImage, setTransitionImage] = useState<string>(defaultStudioProfile.image);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const { handlePointerDown, handlePointerLeave, handlePointerMove, handlePointerUp } =
    usePointerGlow({
      pageRef,
      cursorAuraRef,
      cursorDotRef,
      interactiveSelector: "a, button",
      lerp: 0.16,
    });
  const { isTopbarHidden } = useScrollChrome({
    hideThreshold: 56,
    trackProgress: false,
  });

  useEffect(() => {
    if (disciplines.length === 0) {
      setActiveDiscipline("");
      return;
    }

    if (!disciplines.some((discipline) => discipline.id === activeDiscipline)) {
      setActiveDiscipline(disciplines[0].id);
    }
  }, [activeDiscipline, disciplines]);

  useEffect(() => {
    if (!caseFilters.includes(activeFilter)) {
      setActiveFilter("Todos");
    }
  }, [activeFilter, caseFilters]);

  const selectedDiscipline =
    disciplines.find((discipline) => discipline.id === activeDiscipline) ?? disciplines[0];

  const visibleCases = useMemo(
    () => getVisibleStudioCases(caseStudies, activeFilter),
    [activeFilter, caseStudies]
  );

  useEffect(() => {
    if (visibleCases.length === 0) {
      setActiveCaseName("");
      return;
    }

    if (!visibleCases.some((item) => item.name === activeCaseName)) {
      setActiveCaseName(visibleCases[0].name);
    }
  }, [activeCaseName, visibleCases]);

  useEffect(() => {
    if (workflow.length === 0) {
      setActiveWorkflowIndex(0);
      return;
    }

    if (activeWorkflowIndex > workflow.length - 1) {
      setActiveWorkflowIndex(0);
    }
  }, [activeWorkflowIndex, workflow]);

  const selectedCase = visibleCases.find((item) => item.name === activeCaseName) ?? visibleCases[0];
  const selectedWorkflow = workflow[activeWorkflowIndex] ?? workflow[0];

  useEffect(() => {
    if (!selectedCase) {
      return;
    }

    const matchingDiscipline = getMatchingStudioDiscipline(disciplines, selectedCase.focus);

    if (matchingDiscipline) {
      setActiveDiscipline((current) =>
        current === matchingDiscipline.id ? current : matchingDiscipline.id
      );
    }
  }, [disciplines, selectedCase?.focus]);

  const relatedCases = useMemo(
    () => getRelatedStudioCases(caseStudies, selectedDiscipline),
    [caseStudies, selectedDiscipline]
  );
  const activeDisciplineProfile = useMemo(
    () => getDisciplineProfile(selectedDiscipline?.id),
    [selectedDiscipline?.id]
  );
  const activeCaseProfile = useMemo(() => getCaseProfile(selectedCase?.name), [selectedCase?.name]);

  const heroMetrics = useMemo(
    () => createStudioHeroMetrics(studio.metrics ?? [], relatedCases, selectedDiscipline),
    [relatedCases, selectedDiscipline, studio.metrics]
  );
  const heroCasePreviews = useMemo(
    () => createStudioHeroCasePreviews(relatedCases, caseStudies),
    [caseStudies, relatedCases]
  );

  const serviceSignals = useMemo(
    () => [
      {
        label: "Salida dominante",
        value: selectedDiscipline?.deliverables[0] ?? "Sistema base",
        copy: activeDisciplineProfile.pressure ?? "",
      },
      {
        label: "Casos ligados",
        value: `${relatedCases.length || 1}`,
        copy:
          relatedCases.length > 0
            ? "La disciplina ya tiene pruebas visibles dentro del mismo front."
            : "La disciplina sigue lista para aterrizarse con tus casos reales.",
      },
      {
        label: "Ritmo visual",
        value: activeDisciplineProfile.rhythm ?? "Direccion visual",
        copy: "La escena cambia con cada disciplina y arrastra color, foto y tono.",
      },
    ],
    [
      activeDisciplineProfile.pressure,
      activeDisciplineProfile.rhythm,
      relatedCases.length,
      selectedDiscipline,
    ]
  );

  const caseSignals = useMemo(() => {
    if (!selectedCase) {
      return [];
    }

    return [
      {
        label: "Foco",
        value: selectedCase.focus,
      },
      {
        label: "Sector",
        value: selectedCase.sector,
      },
      {
        label: "Metodo",
        value: selectedWorkflow?.title ?? "Sistema",
      },
    ];
  }, [selectedCase, selectedWorkflow]);

  const workflowSignals = useMemo(() => {
    if (!selectedWorkflow) {
      return [];
    }

    return [
      {
        label: "Disciplina activa",
        value: selectedDiscipline?.label ?? "Sin disciplina",
        copy: selectedDiscipline?.summary ?? "Completa esta disciplina desde el editor local.",
      },
      {
        label: "Caso que lo prueba",
        value: selectedCase?.name ?? "Caso abierto",
        copy: selectedCase?.result ?? "Conecta esta etapa con un caso real desde el editor.",
      },
      {
        label: "Lectura final",
        value: "Criterio + sistema",
        copy: "El metodo se entiende en pantalla antes de pasar a una llamada o deck.",
      },
    ];
  }, [selectedCase, selectedDiscipline, selectedWorkflow]);

  const processPreludeCards = useMemo(
    () => [
      {
        label: "Etapa activa",
        value: selectedWorkflow?.title ?? "Sistema base",
        copy: selectedWorkflow?.copy ?? "Define el metodo real desde el editor local.",
      },
      {
        label: "Caso conectado",
        value: selectedCase?.name ?? siteMeta.title,
        copy: activeCaseProfile.note ?? "",
      },
      {
        label: "Salida clave",
        value:
          selectedDiscipline?.deliverables[0] ??
          selectedDiscipline?.label ??
          "Direccion creativa",
        copy: activeDisciplineProfile.pressure ?? "",
      },
    ],
    [
      activeCaseProfile.note,
      activeDisciplineProfile.pressure,
      selectedCase?.name,
      selectedDiscipline,
      selectedWorkflow,
      siteMeta.title,
    ]
  );

  const closingPreludeCards = useMemo(
    () => [
      {
        label: "Frentes activos",
        value: `${disciplines.length || 0} disciplinas`,
        copy: "Branding, digital y campanas viven en una misma lectura editorial.",
      },
      {
        label: "Casos visibles",
        value: `${caseStudies.length || 0} casos`,
        copy: "La pagina ya prueba criterio con proyectos y no solo con promesas.",
      },
      {
        label: "Metodo visible",
        value: `${workflow.length || 0} etapas`,
        copy: "El proceso queda explicado dentro del sitio, no fuera de pantalla.",
      },
    ],
    [caseStudies.length, disciplines.length, workflow.length]
  );

  const galleryCards = useMemo(() => createStudioGalleryCards(caseStudies), [caseStudies]);
  const supportingCase =
    relatedCases.find((caseItem) => caseItem.name !== selectedCase?.name) ??
    caseStudies.find((caseItem) => caseItem.name !== selectedCase?.name) ??
    selectedCase;
  const supportingCaseProfile = useMemo(
    () => getCaseProfile(supportingCase?.name),
    [supportingCase?.name]
  );

  const pageStyle = {
    ["--studio-accent" as string]: activeDisciplineProfile.accent,
    ["--studio-deep" as string]: activeDisciplineProfile.deep,
    ["--studio-soft" as string]: activeDisciplineProfile.soft,
    ["--studio-glow" as string]: activeDisciplineProfile.glow,
    ["--studio-case-accent" as string]: activeCaseProfile.accent,
    ["--page-pointer-x" as string]: "50vw",
    ["--page-pointer-y" as string]: "40vh",
  } as CSSProperties;

  useSectionVisibility({
    pageRef,
    onSectionChange: setActiveSection,
    rootMargin: "-6% 0px -12% 0px",
    threshold: [0.08, 0.16, 0.32],
    visibleBottomRatio: 0.12,
    visibleTopRatio: 0.9,
  });

  useEffect(() => {
    if (!isSceneTransitioning) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSceneTransitioning(false);
    }, 620);

    return () => window.clearTimeout(timeoutId);
  }, [isSceneTransitioning]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowIntro(false);
    }, 1750);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleSurfaceMove(event: ReactPointerEvent<HTMLElement>) {
    applySurfaceMotion(event, surfaceMotionOptions);
  }

  function handleSurfaceLeave(event: ReactPointerEvent<HTMLElement>) {
    resetSurfaceMotion(event, surfaceMotionOptions);
  }

  function activateDiscipline(disciplineId: string) {
    if (disciplineId === activeDiscipline) {
      return;
    }

    const nextDiscipline = disciplines.find((discipline) => discipline.id === disciplineId);
    const nextDisciplineProfile = getDisciplineProfile(disciplineId);
    const nextRelatedCases = getRelatedStudioCases(caseStudies, nextDiscipline);

    setTransitionImage(nextDisciplineProfile.image);
    setIsSceneTransitioning(true);

    startTransition(() => {
      setActiveDiscipline(disciplineId);

      if (nextDiscipline && caseFilters.includes(nextDiscipline.label)) {
        setActiveFilter(nextDiscipline.label);
      }

      if (nextRelatedCases[0]) {
        setActiveCaseName(nextRelatedCases[0].name);
      }
    });
  }

  function activateCase(caseName: string) {
    if (caseName === activeCaseName) {
      return;
    }

    const nextCaseProfile = getCaseProfile(caseName);

    setTransitionImage(nextCaseProfile.image);
    setIsSceneTransitioning(true);

    startTransition(() => {
      setActiveCaseName(caseName);

      const caseItem = caseStudies.find((item) => item.name === caseName);
      const matchingDiscipline = getMatchingStudioDiscipline(disciplines, caseItem?.focus);

      if (matchingDiscipline) {
        setActiveDiscipline(matchingDiscipline.id);
      }
    });
  }

  return (
    <main
      className={styles.page}
      data-cursor="hidden"
      data-intro={showIntro ? "visible" : "hidden"}
      data-pressed="false"
      ref={pageRef}
      style={pageStyle}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={`${styles.loadingScreen}${showIntro ? ` ${styles.loadingScreenVisible}` : ""}`}>
        <div className={styles.loadingBackdrop} />
        <div className={styles.loadingBrand}>
          <div className={styles.loadingMark}>
            <span>AN</span>
          </div>
          <p>Creative direction / systems / launch narratives</p>
          <strong>Curando una entrada mas selectiva para Atelier Norte.</strong>
          <div className={styles.loadingBar}>
            <span className={styles.loadingBarFill} />
          </div>
        </div>
      </div>

      <div
        className={`${styles.transitionVeil}${
          isSceneTransitioning ? ` ${styles.transitionVeilActive}` : ""
        }`}
        style={{ backgroundImage: `url(${transitionImage})` }}
      />
      <div className={styles.cursorAura} ref={cursorAuraRef} />
      <div className={styles.cursorDot} ref={cursorDotRef} />

      <StudioTopbar
        activeSection={activeSection}
        isTopbarHidden={isTopbarHidden}
        nextSite={nextSite}
        siteMeta={siteMeta}
      />

      <StudioHeroSection
        activeCaseProfile={activeCaseProfile}
        activeDisciplineProfile={activeDisciplineProfile}
        activateCase={activateCase}
        activateDiscipline={activateDiscipline}
        defaultStudioImage={defaultStudioProfile.image}
        disciplines={disciplines}
        heroCasePreviews={heroCasePreviews}
        heroMetrics={heroMetrics}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        selectedCase={selectedCase}
        selectedDiscipline={selectedDiscipline}
        siteMeta={siteMeta}
      />

      <StudioServicesSection
        activeDisciplineProfile={activeDisciplineProfile}
        activateDiscipline={activateDiscipline}
        disciplines={disciplines}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        selectedDiscipline={selectedDiscipline}
        selectedWorkflow={selectedWorkflow}
        serviceSignals={serviceSignals}
        siteMeta={siteMeta}
        supportingCase={supportingCase}
        supportingCaseProfile={supportingCaseProfile}
      />

      <StudioCasesSection
        activeCaseProfile={activeCaseProfile}
        activeFilter={activeFilter}
        activateCase={activateCase}
        caseFilters={caseFilters}
        caseSignals={caseSignals}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        onSelectFilter={(filter) => {
          startTransition(() => setActiveFilter(filter));
        }}
        selectedCase={selectedCase}
        selectedDiscipline={selectedDiscipline}
        selectedWorkflow={selectedWorkflow}
        visibleCases={visibleCases}
      />

      <StudioProcessSection
        activeDisciplineProfile={activeDisciplineProfile}
        activeWorkflowIndex={activeWorkflowIndex}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        onSelectWorkflow={(index) => {
          startTransition(() => setActiveWorkflowIndex(index));
        }}
        processPreludeCards={processPreludeCards}
        selectedWorkflow={selectedWorkflow}
        workflow={workflow}
        workflowSignals={workflowSignals}
      />

      <StudioClosingSection
        closingPreludeCards={closingPreludeCards}
        galleryCards={galleryCards}
        nextSite={nextSite}
        onPointerLeave={handleSurfaceLeave}
        onPointerMove={handleSurfaceMove}
        siteMeta={siteMeta}
      />
    </main>
  );
}
