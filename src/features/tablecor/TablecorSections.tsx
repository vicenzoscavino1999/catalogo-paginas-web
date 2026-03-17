import { memo, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import type {
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
import type { SitePreview } from "@/shared/types/site";
import { createCompositeKey } from "@/shared/utils/compositeKey";
import type {
  MachineDemoStep,
  ProjectSpeedProfile,
  SampleFormatProfile,
} from "@/features/tablecor/tablecor.config";
import {
  TABLECOR_ALL_FAMILY_ID,
  TABLECOR_ALL_FAMILY_LABEL,
} from "@/features/tablecor/tablecor.constants";
import styles from "@/features/tablecor/tablecor.module.css";

interface ProductionSnapshot {
  commercialOutput: string;
  leadTime: string;
  responseTime: string;
  scrap: string;
  throughput: string;
  throughputCompact: string;
}

interface ProcessProfile {
  copy: string;
  photo: string;
  photoAlt: string;
  title: string;
}

interface SignalCard {
  copy: string;
  label: string;
  value: string;
}

interface ServiceResponse {
  copy: string;
  title: string;
}

interface SamplePreviewMedia {
  alt: string;
  src: string;
}

export interface HeroTransitionFrame {
  programPhoto: string;
  programTitle: string;
  surfaceFamily: string;
}

export interface MachineTransitionFrame {
  demoLabel: string;
  machineName: string;
  machinePhoto: string;
  pieceLabel: string;
  processTitle: string;
}

export interface ProcessTransitionFrame {
  machineName: string;
  processPhoto: string;
  processTitle: string;
}

export interface SampleTransitionFrame {
  formatCopy: string;
  formatTitle: string;
  previewAlt: string;
  previewSrc: string;
}

interface TablecorTopbarProps {
  activeProgramTitle: string;
  activeSection: string;
  activeSurfaceCode: string;
  isTopbarCompact: boolean;
  isTopbarHidden: boolean;
  nextSite: SitePreview;
  siteMeta: SitePreview;
}

interface TablecorHeroSectionProps {
  activeCutPlan: TablecorCutPlan;
  activeMachine: TablecorMachine;
  activeProductionMode: TablecorProductionMode;
  activeProgram: TablecorProgram;
  activeSurface: TablecorSurface;
  heroTransitionFrame: HeroTransitionFrame | null;
  onSelectMachine: (machineId: string) => void;
  onSelectSurface: (surfaceId: string) => void;
  onSurfaceLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onSurfaceMove: (event: ReactPointerEvent<HTMLElement>) => void;
  programMachines: TablecorMachine[];
  programSurfaces: TablecorSurface[];
  productionSnapshot: ProductionSnapshot;
  siteMeta: SitePreview;
  staticMedia: {
    boardStack: SamplePreviewMedia;
    heroShowroom: SamplePreviewMedia;
  };
}

interface TablecorLibrarySectionProps {
  activeFamily: string;
  activeMachine: TablecorMachine;
  activeProgram: TablecorProgram;
  activeSurface: TablecorSurface;
  compareSurfaceIds: string[];
  compareSurfaces: TablecorSurface[];
  onQueryChange: (value: string) => void;
  onSelectFamily: (family: string) => void;
  onSelectProgram: (programId: string) => void;
  onSelectSurface: (surfaceId: string) => void;
  onSurfaceLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onSurfaceMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onToggleCompareSurface: (surfaceId: string) => void;
  programMachines: TablecorMachine[];
  query: string;
  recommendedPrograms: TablecorProgram[];
  surfaceMatchesProgram: boolean;
  tablecorFamilies: string[];
  visibleSurfaces: TablecorSurface[];
}

interface TablecorProgramSectionProps {
  activeProgram: TablecorProgram;
  activeSurface: TablecorSurface;
  onSelectProgram: (programId: string) => void;
  onSelectSurface: (surfaceId: string) => void;
  programSurfaces: TablecorSurface[];
  tablecorPrograms: TablecorProgram[];
}

interface TablecorProcessSectionProps {
  activeCutPlan: TablecorCutPlan;
  activePiece: TablecorCutPiece;
  activeProcess: TablecorProcessStep;
  activeProductionMode: TablecorProductionMode;
  cutPlansForProgram: TablecorCutPlan[];
  highlightedPieceIds: Set<string>;
  onSelectCutPlan: (cutPlanId: string) => void;
  onSelectPiece: (pieceId: string) => void;
  onSelectProcess: (processId: string) => void;
  onSelectProductionMode: (modeId: string) => void;
  onSurfaceLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onSurfaceMove: (event: ReactPointerEvent<HTMLElement>) => void;
  processMachine: TablecorMachine;
  processProfile: ProcessProfile;
  processSignals: SignalCard[];
  processTransitionFrame: ProcessTransitionFrame | null;
  productionSnapshot: ProductionSnapshot;
  supportedProcessIds: ReadonlySet<string>;
  tablecorProcessSteps: TablecorProcessStep[];
  tablecorProductionModes: TablecorProductionMode[];
}

interface TablecorMachineSectionProps {
  activeCutPlan: TablecorCutPlan;
  activeMachine: TablecorMachine;
  activeMachineDemo: MachineDemoStep;
  activePiece: TablecorCutPiece;
  activeProcess: TablecorProcessStep;
  activeProductionMode: TablecorProductionMode;
  machineDemoSteps: readonly MachineDemoStep[];
  machineDemoStyle: CSSProperties;
  machineTransitionFrame: MachineTransitionFrame | null;
  machineTelemetry: Array<{ label: string; value: string }>;
  onFocusMachineDemo: (stepId: MachineDemoStep["id"]) => void;
  onSelectMachine: (machineId: string) => void;
  onSurfaceLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onSurfaceMove: (event: ReactPointerEvent<HTMLElement>) => void;
  supportedMachineIds: ReadonlySet<string>;
  tablecorMachines: TablecorMachine[];
  tablecorSpecs: TablecorSpec[];
}

interface TablecorSampleSectionProps {
  activeCutPlan: TablecorCutPlan;
  activeMachine: TablecorMachine;
  activeProgram: TablecorProgram;
  activeServiceIndex: number;
  activeServiceStep: TablecorServiceStep;
  activeSurface: TablecorSurface;
  onSelectProjectSpeed: (speed: string) => void;
  onSelectSampleFormat: (format: string) => void;
  onSelectServiceIndex: (index: number) => void;
  onSurfaceLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onSurfaceMove: (event: ReactPointerEvent<HTMLElement>) => void;
  projectSpeed: string;
  projectSpeedProfile: ProjectSpeedProfile;
  projectSpeeds: string[];
  productionSnapshot: ProductionSnapshot;
  sampleDecisionSignals: SignalCard[];
  sampleFormat: string;
  sampleFormatProfile: SampleFormatProfile;
  sampleFormats: string[];
  samplePreviewMedia: SamplePreviewMedia;
  sampleTransitionFrame: SampleTransitionFrame | null;
  serviceResponse: ServiceResponse;
  tablecorServiceSteps: TablecorServiceStep[];
}

function createPaletteStyle(palette: Pick<TablecorSurface, "accent" | "base" | "glow">): CSSProperties {
  return {
    ["--panel-base" as string]: palette.base,
    ["--panel-accent" as string]: palette.accent,
    ["--panel-glow" as string]: palette.glow,
  } as CSSProperties;
}

function createSwatchStyle(base: string, accent: string): CSSProperties {
  return {
    background: `linear-gradient(135deg, ${base}, ${accent})`,
  };
}

const tablecorNavigation = [
  { href: "#biblioteca", id: "biblioteca", label: "Biblioteca" },
  { href: "#mobiliario", id: "mobiliario", label: "Mobiliario" },
  { href: "#corte", id: "corte", label: "Corte" },
  { href: "#maquinaria", id: "maquinaria", label: "Maquinaria" },
  { href: "#muestras", id: "muestras", label: "Muestras" },
] as const;

export function getTablecorSectionLabel(sectionId: string) {
  switch (sectionId) {
    case "biblioteca":
      return "Biblioteca";
    case "mobiliario":
      return "Mobiliario";
    case "corte":
      return "Corte";
    case "maquinaria":
      return "Maquinaria";
    case "muestras":
      return "Muestras";
    default:
      return "Showroom";
  }
}

function TablecorTopbarComponent({
  activeProgramTitle,
  activeSection,
  activeSurfaceCode,
  isTopbarCompact,
  isTopbarHidden,
  nextSite,
  siteMeta,
}: TablecorTopbarProps) {
  return (
    <header
      className={styles.topbar}
      data-compact={isTopbarCompact}
      data-hidden={isTopbarHidden}
    >
      <div className={styles.brandBlock}>
        <span className={styles.brandTag}>Peru / tableros / produccion / especificacion</span>
        <strong className={styles.brandName}>{siteMeta.title}</strong>
        <div className={styles.brandStatus}>
          <span>{getTablecorSectionLabel(activeSection)}</span>
          <small>
            {activeSurfaceCode} / {activeProgramTitle}
          </small>
        </div>
      </div>

      <nav className={styles.navLinks} aria-label="Navegacion Tablecor">
        {tablecorNavigation.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-current={activeSection === link.id ? "page" : undefined}
            className={activeSection === link.id ? styles.navLinkActive : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.topbarActions}>
        <Link className={styles.backLink} to="/">
          Volver al catalogo
        </Link>
        <Link className={styles.sectionPill} to="/workspace?site=tablecor">
          Editar contenido
        </Link>
        <Link className={styles.nextLink} to={nextSite.route}>
          <span>Siguiente demo</span>
          <strong>{nextSite.title}</strong>
        </Link>
      </div>

      <div className={styles.topbarProgress} aria-hidden="true">
        <div className={styles.topbarProgressTrack}>
          <div className={styles.topbarProgressFill} />
        </div>
      </div>
    </header>
  );
}

function TablecorHeroSectionComponent({
  activeCutPlan,
  activeMachine,
  activeProductionMode,
  activeProgram,
  activeSurface,
  heroTransitionFrame,
  onSelectMachine,
  onSelectSurface,
  onSurfaceLeave,
  onSurfaceMove,
  programMachines,
  programSurfaces,
  productionSnapshot,
  siteMeta,
  staticMedia,
}: TablecorHeroSectionProps) {
  return (
    <section className={styles.hero} data-section-id="hero" data-visible="true">
      <div className={styles.heroIntro}>
        <p className={styles.eyebrow}>{siteMeta.category}</p>
        <h1>{siteMeta.title} vende superficie, fabrica criterio y hace visible todo el proceso.</h1>
        <p className={styles.lead}>
          {siteMeta.description} La experiencia mezcla fotos reales, programas de
          mobiliario, simulacion de produccion y una lectura mucho mas premium del
          flujo completo: material, despiece, maquina y salida comercial.
        </p>

        <div className={styles.heroActions}>
          <a className={styles.primaryCta} href="#biblioteca">
            Explorar biblioteca
          </a>
          <a className={styles.secondaryCta} href="#corte">
            Ver proceso de corte
          </a>
        </div>

        <div className={styles.heroStateBand}>
          <article className={styles.heroStateCard}>
            <span>Material curado</span>
            <strong>{activeSurface.code}</strong>
            <p>
              {activeSurface.name} / {activeSurface.finish}
            </p>
          </article>
          <article className={styles.heroStateCard}>
            <span>Programa base</span>
            <strong>{activeProgram.title}</strong>
            <p>{activeProgram.sector}</p>
          </article>
          <article className={styles.heroStateCard}>
            <span>Ruta activa</span>
            <strong>{activeMachine.stage}</strong>
            <p>
              {activeProductionMode.label} / {activeCutPlan.boardSize}
            </p>
          </article>
          <article className={styles.heroStateCard}>
            <span>Ventana comercial</span>
            <strong>{productionSnapshot.responseTime}</strong>
            <p>
              {productionSnapshot.leadTime} / {productionSnapshot.commercialOutput}
            </p>
          </article>
        </div>

      </div>

      <div className={styles.heroStage}>
        <div
          className={styles.sceneCanvas}
          onPointerLeave={onSurfaceLeave}
          onPointerMove={onSurfaceMove}
        >
          <figure className={styles.sceneBackdropPhoto}>
            <img src={staticMedia.heroShowroom.src} alt={staticMedia.heroShowroom.alt} />
          </figure>
          <div className={styles.sceneFrameBand}>
            <span>Showroom / material direction</span>
            <strong>
              {activeSurface.code} / {activeProgram.title}
            </strong>
          </div>
          <div className={styles.sceneBackdrop} />
          <div className={styles.sceneLattice} />
          <div className={styles.sceneWallPanel} data-family={activeSurface.family} />
          {heroTransitionFrame ? (
            <div
              aria-hidden="true"
              className={`${styles.sceneWallPanel} ${styles.sceneWallPanelGhost}`}
              data-family={heroTransitionFrame.surfaceFamily}
            />
          ) : null}
          <div className={styles.sceneTallUnit} />
          <div className={styles.sceneIsland} />
          <div className={styles.sceneCounter} />
          <div className={styles.sceneShelf} />
          <div className={styles.sceneMachine} />
          <div className={styles.sceneMachineHead} />
          <div className={styles.sceneLaser} />
          <div
            key={`${activeSurface.id}-${activeProgram.id}-${activeMachine.id}-${activeProductionMode.id}`}
            aria-hidden="true"
            className={styles.sceneTransitionWash}
          />
          <figure className={styles.scenePhotoCard}>
            <img src={activeProgram.photo} alt={activeProgram.photoAlt} />
            <figcaption>
              <span>Mobiliario real</span>
              <strong>{activeProgram.title}</strong>
            </figcaption>
          </figure>
          {heroTransitionFrame ? (
            <figure
              aria-hidden="true"
              className={`${styles.scenePhotoCard} ${styles.scenePhotoCardGhost}`}
            >
              <img src={heroTransitionFrame.programPhoto} alt="" />
              <figcaption>
                <span>Mobiliario real</span>
                <strong>{heroTransitionFrame.programTitle}</strong>
              </figcaption>
            </figure>
          ) : null}
          <div className={styles.sceneEditorialTag}>
            <span>Selection</span>
            <strong>{activeMachine.stage}</strong>
            <p>{activeProductionMode.label}</p>
          </div>
          <div className={styles.sceneStatusRail}>
            <article className={styles.sceneStatusPill}>
              <span>Material</span>
              <strong>{activeSurface.code}</strong>
            </article>
            <article className={styles.sceneStatusPill}>
              <span>Yield</span>
              <strong>{activeCutPlan.yield}</strong>
            </article>
            <article className={styles.sceneStatusPill}>
              <span>Salida</span>
              <strong>{productionSnapshot.throughputCompact}</strong>
            </article>
          </div>
        </div>

        <aside
          className={styles.heroPanel}
          onPointerLeave={onSurfaceLeave}
          onPointerMove={onSurfaceMove}
        >
          <div className={styles.heroPanelHeading}>
            <span>Curaduria de lote</span>
            <h2>{activeSurface.name}</h2>
            <p>
              {activeProgram.title} / {activeMachine.stage}. {activeSurface.note}
            </p>
          </div>

          <div className={styles.heroPanelMetaStrip}>
            <article className={styles.heroPanelMetaItem}>
              <span>Salida</span>
              <strong>{productionSnapshot.throughputCompact}</strong>
            </article>
            <article className={styles.heroPanelMetaItem}>
              <span>Respuesta</span>
              <strong>{productionSnapshot.responseTime}</strong>
            </article>
            <article className={styles.heroPanelMetaItem}>
              <span>Acabado</span>
              <strong>{activeSurface.finish}</strong>
            </article>
            <article className={styles.heroPanelMetaItem}>
              <span>Espesor</span>
              <strong>{activeSurface.thickness}</strong>
            </article>
          </div>

          <div className={styles.heroPanelSelectorStack}>
            <article className={styles.heroSelectionCard}>
              <div className={styles.heroSelectionHeader}>
                <span>Superficie del programa</span>
                <strong>{activeSurface.code}</strong>
                <p>{activeSurface.name}</p>
              </div>
              <div className={styles.heroSurfaceRail}>
                {programSurfaces.map((surface) => (
                  <button
                    key={surface.id}
                    type="button"
                    className={styles.heroSurfaceOption}
                    aria-pressed={surface.id === activeSurface.id}
                    data-active={surface.id === activeSurface.id}
                    onClick={() => onSelectSurface(surface.id)}
                  >
                    <i aria-hidden="true" style={createSwatchStyle(surface.base, surface.accent)} />
                    <span>{surface.code}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className={styles.heroSelectionCard}>
              <div className={styles.heroSelectionHeader}>
                <span>Linea sugerida</span>
                <strong>{activeMachine.stage}</strong>
                <p>{activeMachine.name}</p>
              </div>
              <div className={styles.heroMachineRail}>
                {programMachines.map((machine) => (
                  <button
                    key={machine.id}
                    type="button"
                    className={styles.heroMachineOption}
                    aria-pressed={machine.id === activeMachine.id}
                    data-active={machine.id === activeMachine.id}
                    onClick={() => onSelectMachine(machine.id)}
                  >
                    <span>{machine.stage}</span>
                    <small>{machine.name}</small>
                  </button>
                ))}
              </div>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}

function TablecorLibrarySectionComponent({
  activeFamily,
  activeMachine,
  activeProgram,
  activeSurface,
  compareSurfaceIds,
  compareSurfaces,
  onQueryChange,
  onSelectFamily,
  onSelectProgram,
  onSelectSurface,
  onSurfaceLeave,
  onSurfaceMove,
  onToggleCompareSurface,
  programMachines,
  query,
  recommendedPrograms,
  surfaceMatchesProgram,
  tablecorFamilies,
  visibleSurfaces,
}: TablecorLibrarySectionProps) {
  return (
    <section
      className={styles.librarySection}
      data-section-id="biblioteca"
      data-visible="false"
      id="biblioteca"
    >
      <div className={styles.sectionLead}>
        <p className={styles.eyebrow}>Biblioteca de superficies</p>
        <h2>Busca decorados, filtra por familia y compara hasta tres acabados al mismo tiempo.</h2>
      </div>

      <div className={styles.controlBar}>
        <label className={styles.searchField}>
          <span>Buscar codigo, familia, acabado o uso</span>
          <input
            type="search"
            placeholder="Ejemplo: nogal, lobby, supermate, closet"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>

        <div className={styles.filterRail}>
          <button
            type="button"
            className={`${styles.filterChip}${
              activeFamily === TABLECOR_ALL_FAMILY_ID ? ` ${styles.filterChipActive}` : ""
            }`}
            aria-pressed={activeFamily === TABLECOR_ALL_FAMILY_ID}
            onClick={() => onSelectFamily(TABLECOR_ALL_FAMILY_ID)}
          >
            {TABLECOR_ALL_FAMILY_LABEL}
          </button>
          {tablecorFamilies
            .filter((family) => family !== TABLECOR_ALL_FAMILY_LABEL)
            .map((family, index) => (
            <button
              key={createCompositeKey("family", index, family)}
              type="button"
              className={`${styles.filterChip}${
                family === activeFamily ? ` ${styles.filterChipActive}` : ""
              }`}
              aria-pressed={family === activeFamily}
              onClick={() => onSelectFamily(family)}
            >
              {family}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.libraryLayout}>
        <div className={styles.surfaceList}>
          {visibleSurfaces.length > 0 ? (
            visibleSurfaces.map((surface) => {
              const isActiveSurface = surface.id === activeSurface.id;
              const isComparingSurface = compareSurfaceIds.includes(surface.id);

              return (
                <article
                  key={surface.id}
                  className={`${styles.surfaceCard}${
                    isActiveSurface ? ` ${styles.surfaceCardActive}` : ""
                  }`}
                >
                  <button
                    type="button"
                    className={styles.surfaceCardButton}
                    aria-pressed={isActiveSurface}
                    onClick={() => onSelectSurface(surface.id)}
                  >
                    <div
                      className={styles.surfacePreview}
                      data-family={surface.family}
                      style={createPaletteStyle(surface)}
                    />
                    <div className={styles.surfaceCopy}>
                      <span>{surface.code}</span>
                      <strong>{surface.name}</strong>
                      <small>
                        {surface.family} / {surface.finish}
                      </small>
                    </div>
                  </button>
                  <div className={styles.surfaceReveal}>
                    <span>{surface.applications[0] ?? surface.family}</span>
                    <strong>{surface.finish}</strong>
                    <p>{surface.note}</p>
                  </div>
                  <div className={styles.surfaceActions}>
                    <span>{surface.thickness}</span>
                    <button
                      type="button"
                      className={`${styles.compareButton}${
                        isComparingSurface ? ` ${styles.compareButtonActive}` : ""
                      }`}
                      aria-label={`${isComparingSurface ? "Quitar comparacion de" : "Comparar"} ${
                        surface.name
                      }`}
                      aria-pressed={isComparingSurface}
                      onClick={() => onToggleCompareSurface(surface.id)}
                    >
                      {isComparingSurface ? "Comparando" : "Comparar"}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              No hay decorados para ese filtro. Prueba otra familia o cambia la busqueda.
            </div>
          )}
        </div>

        <aside className={styles.surfaceDetail}>
          <div
            className={styles.detailHero}
            data-family={activeSurface.family}
            style={createPaletteStyle(activeSurface)}
          >
            <div
              key={createCompositeKey("detail-hero-wash", activeSurface.id, activeProgram.id)}
              aria-hidden="true"
              className={styles.detailHeroTransitionWash}
            />
            <div className={styles.detailBadge}>{activeSurface.family}</div>
            <div className={styles.detailHeroCopy}>
              <span>{activeSurface.code}</span>
              <h3>{activeSurface.name}</h3>
              <p>{activeSurface.note}</p>
            </div>
            <div className={styles.detailHeroStateRail}>
              <article className={styles.detailHeroState}>
                <span>Fit</span>
                <strong>{surfaceMatchesProgram ? "Directo" : "Ajustar blend"}</strong>
              </article>
              <article className={styles.detailHeroState}>
                <span>Programa</span>
                <strong>{activeProgram.title}</strong>
              </article>
              <article className={styles.detailHeroState}>
                <span>Linea</span>
                <strong>{programMachines[0]?.stage ?? activeMachine.stage}</strong>
              </article>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailBlock}>
              <span>Acabado</span>
              <strong>{activeSurface.finish}</strong>
            </div>
            <div className={styles.detailBlock}>
              <span>Espesor</span>
              <strong>{activeSurface.thickness}</strong>
            </div>
          </div>

          <div className={styles.applicationTags}>
            {activeSurface.applications.map((application, index) => (
              <span key={createCompositeKey("application", index, application)}>{application}</span>
            ))}
          </div>

          <div className={styles.detailInsightGrid}>
            <article className={styles.detailInsightCard}>
              <span>Compatibilidad</span>
              <strong>
                {surfaceMatchesProgram ? "Lista para el programa" : "Necesita ajuste de blend"}
              </strong>
              <p>
                {surfaceMatchesProgram
                  ? `${activeSurface.name} ya conversa con ${activeProgram.title} sin rearmar lote.`
                  : `${activeSurface.name} puede entrar, pero conviene recalibrar blend y salida comercial.`}
              </p>
            </article>
            <article className={styles.detailInsightCard}>
              <span>Lote sugerido</span>
              <strong>{activeProgram.title}</strong>
              <p>{activeProgram.highlight}</p>
            </article>
            <article className={styles.detailInsightCard}>
              <span>Linea sugerida</span>
              <strong>{programMachines[0]?.name ?? activeMachine.name}</strong>
              <p>{programMachines[0]?.stage ?? activeMachine.stage}</p>
            </article>
          </div>

          <div className={styles.detailListBlock}>
            <span>Programas donde mejor funciona</span>
            <div className={styles.relatedProgramGrid}>
              {recommendedPrograms.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  className={styles.relatedProgramCard}
                  aria-pressed={program.id === activeProgram.id}
                  data-active={program.id === activeProgram.id}
                  onClick={() => onSelectProgram(program.id)}
                >
                  <img src={program.photo} alt={program.photoAlt} />
                  <div className={styles.relatedProgramCopy}>
                    <span>{program.sector}</span>
                    <strong>{program.title}</strong>
                    <p>{program.highlight}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className={styles.compareTray}>
        <div className={styles.compareHeader}>
          <div>
            <p className={styles.eyebrow}>Comparador rapido</p>
            <h3>Hasta 3 acabados lado a lado para decidir tono, acabado y contexto.</h3>
          </div>
          <div className={styles.compareMeta}>
            <span>{compareSurfaces.length}/3 en comparacion</span>
            <div className={styles.compareSwatchRail}>
              {compareSurfaces.length > 0 ? (
                compareSurfaces.map((surface) => (
                  <button
                    key={surface.id}
                    type="button"
                    className={styles.compareSwatchPill}
                    onClick={() => onSelectSurface(surface.id)}
                  >
                    <i
                      aria-hidden="true"
                      style={createSwatchStyle(surface.base, surface.accent)}
                    />
                    <span>{surface.code}</span>
                  </button>
                ))
              ) : (
                <span className={styles.compareMetaEmpty}>
                  Elige 2 o 3 acabados para leer el contraste de la paleta.
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={styles.secondaryCta}
            aria-pressed={compareSurfaceIds.includes(activeSurface.id)}
            onClick={() => onToggleCompareSurface(activeSurface.id)}
          >
            {compareSurfaceIds.includes(activeSurface.id)
              ? "Quitar acabado activo"
              : "Agregar acabado activo"}
          </button>
        </div>

        <div className={styles.compareGrid}>
          {compareSurfaces.map((surface) => (
            <article
              className={styles.compareCard}
              key={surface.id}
              onPointerLeave={onSurfaceLeave}
              onPointerMove={onSurfaceMove}
            >
              <div
                className={styles.comparePreview}
                data-family={surface.family}
                style={createPaletteStyle(surface)}
              />
              <div className={styles.compareCopy}>
                <span>{surface.code}</span>
                <strong>{surface.name}</strong>
                <p>{surface.note}</p>
              </div>
              <div className={styles.compareFieldGrid}>
                <div className={styles.compareField}>
                  <span>Acabado</span>
                  <strong>{surface.finish}</strong>
                </div>
                <div className={styles.compareField}>
                  <span>Espesor</span>
                  <strong>{surface.thickness}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TablecorProgramSectionComponent({
  activeProgram,
  activeSurface,
  onSelectProgram,
  onSelectSurface,
  programSurfaces,
  tablecorPrograms,
}: TablecorProgramSectionProps) {
  return (
    <section
      className={styles.programSection}
      data-section-id="mobiliario"
      data-visible="false"
      id="mobiliario"
    >
      <div className={styles.sectionLead}>
        <p className={styles.eyebrow}>Programas de mobiliario</p>
        <h2>Ahora la marca muestra muebles reales y no solo volumenes abstractos.</h2>
      </div>

      <div className={styles.programRail}>
        {tablecorPrograms.map((program) => (
          <button
            key={program.id}
            type="button"
            className={`${styles.programChip}${
              program.id === activeProgram.id ? ` ${styles.programChipActive}` : ""
            }`}
            aria-pressed={program.id === activeProgram.id}
            onClick={() => onSelectProgram(program.id)}
          >
            <span>{program.sector}</span>
            <strong>{program.title}</strong>
          </button>
        ))}
      </div>

      <div className={styles.programLayout}>
        <article className={styles.programShowcase}>
          <figure className={styles.programPhotoFrame}>
            <img src={activeProgram.photo} alt={activeProgram.photoAlt} />
            <figcaption className={styles.programPhotoOverlay}>
              <span>Programa seleccionado</span>
              <strong>{activeProgram.title}</strong>
              <p>{activeProgram.photoNote}</p>
            </figcaption>
            <div
              key={createCompositeKey("program-photo-wash", activeProgram.id, activeSurface.id)}
              aria-hidden="true"
              className={styles.programTransitionWash}
            />
          </figure>

          <div className={styles.programCanvas}>
            <div
              key={createCompositeKey("program-canvas-wash", activeProgram.id, activeSurface.id)}
              aria-hidden="true"
              className={styles.programCanvasWash}
            />
            <div className={styles.programVolumeTall} />
            <div className={styles.programVolumeWall} />
            <div className={styles.programVolumeLow} />
            <div className={styles.programVolumeIsland} />
            <div className={styles.programCueRail}>
              <article className={styles.programCueCard}>
                <span>Programa</span>
                <strong>{activeProgram.title}</strong>
              </article>
              <article className={styles.programCueCard}>
                <span>Superficie</span>
                <strong>{activeSurface.code}</strong>
              </article>
              <article className={styles.programCueCard}>
                <span>Blend</span>
                <strong>{programSurfaces.length} acabados</strong>
              </article>
            </div>
            <div className={styles.programCanvasLabel}>
              <span>Lectura tecnica</span>
              <strong>{activeProgram.title}</strong>
              <p>{activeProgram.highlight}</p>
            </div>
          </div>

          <div className={styles.programStats}>
            {activeProgram.stats.map((stat, index) => (
              <div
                className={styles.programStat}
                key={createCompositeKey("program-stat", index, stat.label, stat.value)}
              >
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <aside className={styles.programDetail}>
          <div className={styles.programHeader}>
            <span>{activeProgram.sector}</span>
            <h3>{activeProgram.title}</h3>
            <p>{activeProgram.summary}</p>
          </div>

          <div className={styles.programListGrid}>
            <div className={styles.programListCard}>
              <span>Piezas de mobiliario</span>
              <ul>
                {activeProgram.furniture.map((item, index) => (
                  <li key={createCompositeKey("furniture", index, item)}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.programListCard}>
              <span>Blend material</span>
              <ul>
                {activeProgram.blend.map((item, index) => (
                  <li key={createCompositeKey("blend", index, item)}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.materialBlend}>
            {programSurfaces.map((surface) => (
              <button
                key={surface.id}
                type="button"
                className={styles.blendSwatch}
                aria-pressed={surface.id === activeSurface.id}
                data-active={surface.id === activeSurface.id}
                onClick={() => onSelectSurface(surface.id)}
              >
                <i aria-hidden="true" style={createSwatchStyle(surface.base, surface.accent)} />
                <div>
                  <strong>{surface.name}</strong>
                  <span>{surface.finish}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TablecorProcessSectionComponent({
  activeCutPlan,
  activePiece,
  activeProcess,
  activeProductionMode,
  cutPlansForProgram,
  highlightedPieceIds,
  onSelectCutPlan,
  onSelectPiece,
  onSelectProcess,
  onSelectProductionMode,
  onSurfaceLeave,
  onSurfaceMove,
  processMachine,
  processProfile,
  processSignals,
  processTransitionFrame,
  productionSnapshot,
  supportedProcessIds,
  tablecorProcessSteps,
  tablecorProductionModes,
}: TablecorProcessSectionProps) {
  return (
    <section
      className={styles.processSection}
      data-section-id="corte"
      data-visible="false"
      id="corte"
    >
      <div className={styles.sectionLead}>
        <p className={styles.eyebrow}>Proceso de corte</p>
        <h2>Sumamos simulacion de lote para que la seccion de corte tambien sirva para decidir.</h2>
      </div>

      <div className={styles.productionModeRail}>
        {tablecorProductionModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`${styles.productionModeChip}${
              mode.id === activeProductionMode.id ? ` ${styles.productionModeChipActive}` : ""
            }`}
            aria-pressed={mode.id === activeProductionMode.id}
            onClick={() => onSelectProductionMode(mode.id)}
          >
            <span>{mode.leadTime}</span>
            <strong>{mode.label}</strong>
          </button>
        ))}
      </div>

      <div className={styles.processFocusRail}>
        <article className={styles.processFocusCard}>
          <span>Proceso vivo</span>
          <strong>{activeProcess.title}</strong>
          <p>
            {activeProcess.order} / {activeProductionMode.label}
          </p>
        </article>
        <article className={styles.processFocusCard}>
          <span>Pieza en foco</span>
          <strong>{activePiece.label}</strong>
          <p>
            {activeCutPlan.title} / {activeCutPlan.boardSize}
          </p>
        </article>
        <article className={styles.processFocusCard}>
          <span>Ritmo de lote</span>
          <strong>{productionSnapshot.throughputCompact}</strong>
          <p>
            Yield {activeCutPlan.yield} / {activeCutPlan.cadence}
          </p>
        </article>
      </div>

      <div className={styles.processLayout}>
        <div className={styles.processRail}>
          {tablecorProcessSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`${styles.processStep}${
                step.id === activeProcess.id ? ` ${styles.processStepActive}` : ""
              }`}
              aria-pressed={step.id === activeProcess.id}
              aria-disabled={!supportedProcessIds.has(step.id)}
              data-supported={supportedProcessIds.has(step.id)}
              disabled={!supportedProcessIds.has(step.id)}
              onClick={() => onSelectProcess(step.id)}
            >
              <span className={styles.processStepOrder}>{step.order}</span>
              <strong>{step.title}</strong>
              <p>{step.signal}</p>
            </button>
          ))}
        </div>

        <div className={styles.cutWorkbench}>
          <div className={styles.cutToolbar}>
            {cutPlansForProgram.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`${styles.cutPlanChip}${
                  plan.id === activeCutPlan.id ? ` ${styles.cutPlanChipActive}` : ""
                }`}
                aria-pressed={plan.id === activeCutPlan.id}
                onClick={() => onSelectCutPlan(plan.id)}
              >
                {plan.title}
              </button>
            ))}
          </div>

          <div className={styles.cutSummary}>
            <div className={styles.cutStat}>
              <span>Yield</span>
              <strong>{activeCutPlan.yield}</strong>
            </div>
            <div className={styles.cutStat}>
              <span>Merma</span>
              <strong>{activeCutPlan.scrap}</strong>
            </div>
            <div className={styles.cutStat}>
              <span>Cadencia</span>
              <strong>{activeCutPlan.cadence}</strong>
            </div>
            <div className={styles.cutStat}>
              <span>Maquina</span>
              <strong>{activeCutPlan.machine}</strong>
            </div>
          </div>

          <div
            className={styles.processInspector}
            onPointerLeave={onSurfaceLeave}
            onPointerMove={onSurfaceMove}
          >
            <div className={styles.processMediaStage}>
              <figure className={styles.processPhotoFrame}>
                <img src={processProfile.photo} alt={processProfile.photoAlt} />
                <figcaption className={styles.processPhotoOverlay}>
                  <span>Visual activo</span>
                  <strong>{activeProcess.title}</strong>
                  <p>{processMachine.name}</p>
                </figcaption>
              </figure>
              {processTransitionFrame ? (
                <figure
                  aria-hidden="true"
                  className={`${styles.processPhotoFrame} ${styles.processPhotoFrameGhost}`}
                >
                  <img src={processTransitionFrame.processPhoto} alt="" />
                  <figcaption className={styles.processPhotoOverlay}>
                    <span>Visual activo</span>
                    <strong>{processTransitionFrame.processTitle}</strong>
                    <p>{processTransitionFrame.machineName}</p>
                  </figcaption>
                </figure>
              ) : null}
              <div
                key={`${activeProcess.id}-${activeCutPlan.id}-${activePiece.id}-${activeProductionMode.id}`}
                aria-hidden="true"
                className={styles.processTransitionSweep}
              />
            </div>

            <div className={styles.processInspectorCopy}>
              <span>{activeProcess.order}</span>
              <h3>{processProfile.title}</h3>
              <p>{processProfile.copy}</p>

              <div className={styles.processSignalGrid}>
                {processSignals.map((signal, index) => (
                  <article
                    className={styles.processSignalCard}
                    key={createCompositeKey("process-signal", index, signal.label, signal.value)}
                  >
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div
            className={styles.cutBoardShell}
            onPointerLeave={onSurfaceLeave}
            onPointerMove={onSurfaceMove}
          >
            <div
              key={createCompositeKey(
                "cut-board-glow",
                activeProcess.id,
                activeCutPlan.id,
                activePiece.id,
                activeProductionMode.id
              )}
              aria-hidden="true"
              className={styles.cutBoardTransitionGlow}
            />
            <div className={styles.cutBoardMeta}>
              <span>{activeCutPlan.title}</span>
              <strong>{activeCutPlan.boardSize}</strong>
              <p>
                {activePiece.label} / {activeProductionMode.label}
              </p>
            </div>

            <div className={styles.cutBoard} data-step={activeProcess.id}>
              {activeCutPlan.pieces.map((piece) => (
                <button
                  key={piece.id}
                  type="button"
                  className={styles.cutPiece}
                  data-tone={piece.tone}
                  data-active={highlightedPieceIds.has(piece.id)}
                  data-selected={activePiece.id === piece.id}
                  aria-pressed={activePiece.id === piece.id}
                  style={{
                    left: `${piece.x}%`,
                    top: `${piece.y}%`,
                    width: `${piece.w}%`,
                    height: `${piece.h}%`,
                  }}
                  onClick={() => onSelectPiece(piece.id)}
                >
                  <span>{piece.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.cutLegend}>
              <span className={styles.legendItem}>Base / frentes continuos</span>
              <span className={styles.legendItem}>Accent / piezas visibles</span>
              <span className={styles.legendItem}>Glow / fondos y secundarios</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TablecorMachineSectionComponent({
  activeCutPlan,
  activeMachine,
  activeMachineDemo,
  activePiece,
  activeProcess,
  activeProductionMode,
  machineDemoSteps,
  machineDemoStyle,
  machineTransitionFrame,
  machineTelemetry,
  onFocusMachineDemo,
  onSelectMachine,
  onSurfaceLeave,
  onSurfaceMove,
  supportedMachineIds,
  tablecorMachines,
  tablecorSpecs,
}: TablecorMachineSectionProps) {
  return (
    <section
      className={styles.machineSection}
      data-section-id="maquinaria"
      data-visible="false"
      id="maquinaria"
    >
      <div className={styles.sectionLead}>
        <p className={styles.eyebrow}>Maquinaria y capacidad</p>
        <h2>Las seccionadoras y CNC ya no son abstractas: ahora tambien aparecen con foto real.</h2>
      </div>

      <div className={styles.machineRail}>
        {tablecorMachines.map((machine) => (
          <button
            key={machine.id}
            type="button"
            className={`${styles.machineChip}${
              machine.id === activeMachine.id ? ` ${styles.machineChipActive}` : ""
            }`}
            aria-pressed={machine.id === activeMachine.id}
            aria-disabled={!supportedMachineIds.has(machine.id)}
            disabled={!supportedMachineIds.has(machine.id)}
            onClick={() => onSelectMachine(machine.id)}
          >
            <span>{machine.stage}</span>
            <strong>{machine.name}</strong>
          </button>
        ))}
      </div>

      <div className={styles.machineStatusBand}>
        <article className={styles.machineStatusCard}>
          <span>Equipo en foco</span>
          <strong>{activeMachine.name}</strong>
          <p>{activeMachine.stage}</p>
        </article>
        <article className={styles.machineStatusCard}>
          <span>Lectura activa</span>
          <strong>{activeMachineDemo.label}</strong>
          <p>
            {activePiece.label} / {activeProcess.title}
          </p>
        </article>
        <article className={styles.machineStatusCard}>
          <span>Modo sugerido</span>
          <strong>{activeProductionMode.label}</strong>
          <p>{activeCutPlan.title}</p>
        </article>
      </div>

      <div className={styles.machineLayout}>
        <article
          className={styles.machineStage}
          onPointerLeave={onSurfaceLeave}
          onPointerMove={onSurfaceMove}
        >
          <figure className={styles.machinePhotoFrame}>
            <img src={activeMachine.photo} alt={activeMachine.photoAlt} />
            <figcaption className={styles.machinePhotoOverlay}>
              <span>Equipo activo</span>
              <strong>{activeMachine.name}</strong>
              <p>{activeMachine.photoNote}</p>
            </figcaption>
            <div className={styles.machinePhotoLedger}>
              <article className={styles.machinePhotoMetric}>
                <span>Precision</span>
                <strong>{activeMachine.precision}</strong>
              </article>
              <article className={styles.machinePhotoMetric}>
                <span>Turno</span>
                <strong>{activeMachine.shiftOutput}</strong>
              </article>
              <article className={styles.machinePhotoMetric}>
                <span>Modo</span>
                <strong>{activeProductionMode.label}</strong>
              </article>
            </div>
          </figure>
          {machineTransitionFrame ? (
            <figure
              aria-hidden="true"
              className={`${styles.machinePhotoFrame} ${styles.machinePhotoFrameGhost}`}
            >
              <img src={machineTransitionFrame.machinePhoto} alt="" />
              <figcaption className={styles.machinePhotoOverlay}>
                <span>Equipo activo</span>
                <strong>{machineTransitionFrame.machineName}</strong>
                <p>
                  {machineTransitionFrame.pieceLabel} / {machineTransitionFrame.processTitle}
                </p>
              </figcaption>
            </figure>
          ) : null}

          <div className={styles.machineVisual} style={machineDemoStyle}>
            <div className={styles.machineVisualGrid} />
            <div className={styles.machineAmbientGlow} />
            <div
              key={`${activeMachine.id}-${activeMachineDemo.id}-${activePiece.id}`}
              aria-hidden="true"
              className={styles.machineTransitionScan}
            />
            <div className={styles.machineBase} />
            <div className={styles.machineBed} />
            <div className={styles.machineFeedSheet}>
              <div className={styles.machineFeedGuide} />
              <div className={styles.machineFeedGuide} />
              <div className={styles.machineFeedGuide} />
              <div className={styles.machineFeedPiece} data-tone={activePiece.tone}>
                <span>{activePiece.label}</span>
              </div>
            </div>
            <div className={styles.machineBridge} />
            <div className={styles.machineHead} />
            <div className={styles.machineLaser} />
            <div className={styles.machinePulse} />
            <div className={styles.machineHud}>
              <article className={styles.machineHudCard}>
                <span>Precision</span>
                <strong>{activeMachine.precision}</strong>
              </article>
              <article className={styles.machineHudCard}>
                <span>Turno</span>
                <strong>{activeMachine.shiftOutput}</strong>
              </article>
              <article className={styles.machineHudCard}>
                <span>Eficiencia</span>
                <strong>{activeMachine.efficiency}%</strong>
              </article>
            </div>
            <article className={styles.machineReadout}>
              <span>Lectura en vivo</span>
              <strong>{activeMachineDemo.label}</strong>
              <p>
                {activePiece.label} / {activeProcess.title}
              </p>
            </article>
            <button
              type="button"
              className={`${styles.machineHotspot} ${styles.machineHotspotLoad}`}
              aria-pressed={activeMachineDemo.id === "load"}
              data-active={activeMachineDemo.id === "load"}
              onClick={() => onFocusMachineDemo("load")}
            >
              Carga
            </button>
            <button
              type="button"
              className={`${styles.machineHotspot} ${styles.machineHotspotAlign}`}
              aria-pressed={activeMachineDemo.id === "align"}
              data-active={activeMachineDemo.id === "align"}
              onClick={() => onFocusMachineDemo("align")}
            >
              Puente
            </button>
            <button
              type="button"
              className={`${styles.machineHotspot} ${styles.machineHotspotCut}`}
              aria-pressed={activeMachineDemo.id === "cut"}
              data-active={activeMachineDemo.id === "cut"}
              onClick={() => onFocusMachineDemo("cut")}
            >
              Corte
            </button>
            <button
              type="button"
              className={`${styles.machineHotspot} ${styles.machineHotspotFinish}`}
              aria-pressed={activeMachineDemo.id === "finish"}
              data-active={activeMachineDemo.id === "finish"}
              onClick={() => onFocusMachineDemo("finish")}
            >
              Salida
            </button>
            <div className={styles.machineStageCaption}>
              <span>Ruta activa</span>
              <strong>{activeCutPlan.title}</strong>
              <p>
                {activePiece.label} / {activeMachineDemo.label}
              </p>
            </div>
          </div>

          <div className={styles.machineDemoRail}>
            {machineDemoSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`${styles.machineDemoChip}${
                  step.id === activeMachineDemo.id ? ` ${styles.machineDemoChipActive}` : ""
                }`}
                aria-pressed={step.id === activeMachineDemo.id}
                onClick={() => onFocusMachineDemo(step.id)}
              >
                {step.label}
              </button>
            ))}
          </div>

          <article className={styles.machineDemoPanel}>
            <span>Demo interactiva</span>
            <strong>{activeMachineDemo.label}</strong>
            <p>{activeMachineDemo.copy}</p>
            <div className={styles.machineTelemetryGrid}>
              {machineTelemetry.map((item, index) => (
                <div
                  className={styles.machineTelemetryCard}
                  key={createCompositeKey("machine-telemetry", index, item.label, item.value)}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <div className={styles.machineMeta}>
            <span>{activeMachine.stage}</span>
            <h3>{activeMachine.name}</h3>
            <p>{activeMachine.copy}</p>
          </div>
        </article>

        <aside className={styles.machineDetail}>
          <div className={styles.machineStats}>
            <div className={styles.machineStat}>
              <span>Salida por turno</span>
              <strong>{activeMachine.shiftOutput}</strong>
            </div>
            <div className={styles.machineStat}>
              <span>Precision</span>
              <strong>{activeMachine.precision}</strong>
            </div>
            <div className={styles.machineStat}>
              <span>Ideal para</span>
              <strong>{activeMachine.bestFor}</strong>
            </div>
            <div className={styles.machineStat}>
              <span>Modo sugerido</span>
              <strong>{activeProductionMode.label}</strong>
            </div>
          </div>

          <div className={styles.machineProgressCard}>
            <span>Eficiencia estimada</span>
            <strong>{activeMachine.efficiency}%</strong>
            <div className={styles.machineProgressTrack}>
              <div
                className={styles.machineProgressFill}
                style={{ width: `${activeMachine.efficiency}%` }}
              />
            </div>
          </div>

          <div className={styles.techRail}>
            {activeMachine.tech.map((tech, index) => (
              <span className={styles.techPill} key={createCompositeKey("tech", index, tech)}>
                {tech}
              </span>
            ))}
          </div>

          <div className={styles.specRail}>
            {tablecorSpecs.map((spec, index) => (
              <div
                className={styles.specItem}
                key={createCompositeKey("spec", index, spec.label, spec.value)}
              >
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TablecorSampleSectionComponent({
  activeCutPlan,
  activeMachine,
  activeProgram,
  activeServiceIndex,
  activeServiceStep,
  activeSurface,
  onSelectProjectSpeed,
  onSelectSampleFormat,
  onSelectServiceIndex,
  onSurfaceLeave,
  onSurfaceMove,
  projectSpeed,
  projectSpeedProfile,
  projectSpeeds,
  productionSnapshot,
  sampleDecisionSignals,
  sampleFormat,
  sampleFormatProfile,
  sampleFormats,
  samplePreviewMedia,
  sampleTransitionFrame,
  serviceResponse,
  tablecorServiceSteps,
}: TablecorSampleSectionProps) {
  return (
    <section
      className={styles.sampleSection}
      data-section-id="muestras"
      data-visible="false"
      id="muestras"
    >
      <div className={styles.sampleLead}>
        <p className={styles.eyebrow}>Solicitud de muestra y salida comercial</p>
        <h2>La respuesta final ya combina material, maquina, lote y velocidad comercial.</h2>
        <p>
          El cierre no pide solo un tablero. Pide un paquete con contexto de
          mobiliario, proceso y prioridad para que el equipo comercial responda mejor.
        </p>
      </div>

      <div className={styles.sampleBuilder}>
        <div className={styles.sampleScenarioBand}>
          <article className={styles.sampleScenarioCard}>
            <span>Formato</span>
            <strong>{sampleFormat}</strong>
            <p>{sampleFormatProfile.title}</p>
          </article>
          <article className={styles.sampleScenarioCard}>
            <span>Prioridad</span>
            <strong>{projectSpeed}</strong>
            <p>{projectSpeedProfile.title}</p>
          </article>
          <article className={styles.sampleScenarioCard}>
            <span>Servicio</span>
            <strong>{activeServiceStep.title}</strong>
            <p>{serviceResponse.title}</p>
          </article>
          <article className={styles.sampleScenarioCard}>
            <span>Respuesta</span>
            <strong>{productionSnapshot.responseTime}</strong>
            <p>{productionSnapshot.leadTime}</p>
          </article>
        </div>

        <div className={styles.samplePanel}>
          <span>Configuracion elegida</span>
          <strong>
            {activeSurface.name} / {activeProgram.title}
          </strong>
          <p>
            {activeMachine.name} / {activeCutPlan.title}
          </p>
        </div>

        <div className={styles.selectorGroup}>
          <span>Formato</span>
          <div className={styles.selectorRail}>
            {sampleFormats.map((format, index) => (
              <button
                key={createCompositeKey("sample-format", index, format)}
                type="button"
                className={`${styles.selectorChip}${
                  format === sampleFormat ? ` ${styles.selectorChipActive}` : ""
                }`}
                aria-pressed={format === sampleFormat}
                onClick={() => onSelectSampleFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.selectorGroup}>
          <span>Velocidad de proyecto</span>
          <div className={styles.selectorRail}>
            {projectSpeeds.map((speed, index) => (
              <button
                key={createCompositeKey("project-speed", index, speed)}
                type="button"
                className={`${styles.selectorChip}${
                  speed === projectSpeed ? ` ${styles.selectorChipActive}` : ""
                }`}
                aria-pressed={speed === projectSpeed}
                onClick={() => onSelectProjectSpeed(speed)}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        <article
          className={styles.samplePreviewCard}
          onPointerLeave={onSurfaceLeave}
          onPointerMove={onSurfaceMove}
        >
          <div className={styles.samplePreviewStage}>
            <figure className={styles.samplePreviewMedia}>
              <img src={samplePreviewMedia.src} alt={samplePreviewMedia.alt} />
              <figcaption>
                <span>Paquete configurado</span>
                <strong>{sampleFormatProfile.title}</strong>
                <p>{sampleFormatProfile.copy}</p>
              </figcaption>
            </figure>
            {sampleTransitionFrame ? (
              <figure
                aria-hidden="true"
                className={`${styles.samplePreviewMedia} ${styles.samplePreviewMediaGhost}`}
              >
                <img src={sampleTransitionFrame.previewSrc} alt="" />
                <figcaption>
                  <span>Paquete configurado</span>
                  <strong>{sampleTransitionFrame.formatTitle}</strong>
                  <p>{sampleTransitionFrame.formatCopy}</p>
                </figcaption>
              </figure>
            ) : null}
            <div
              key={`${activeSurface.id}-${activeProgram.id}-${sampleFormat}-${projectSpeed}-${activeServiceIndex}`}
              aria-hidden="true"
              className={styles.samplePreviewScan}
            />
            <div className={styles.samplePreviewRibbon}>
              <article className={styles.samplePreviewPill}>
                <span>Superficie</span>
                <strong>{activeSurface.code}</strong>
              </article>
              <article className={styles.samplePreviewPill}>
                <span>Servicio</span>
                <strong>{activeServiceStep.title}</strong>
              </article>
              <article className={styles.samplePreviewPill}>
                <span>Prioridad</span>
                <strong>{projectSpeed}</strong>
              </article>
            </div>
          </div>

          <div className={styles.sampleDeliverableGrid}>
            {sampleFormatProfile.deliverables.map((item, index) => (
              <div
                className={styles.sampleDeliverableCard}
                key={createCompositeKey("deliverable", index, item)}
              >
                <span>Incluye</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </article>

        <div className={styles.sampleResponseCard}>
          <span>{activeServiceStep.title}</span>
          <strong>{serviceResponse.title}</strong>
          <p>
            {serviceResponse.copy} Respuesta estimada en {productionSnapshot.responseTime} / lead
            time de {productionSnapshot.leadTime}.
          </p>
        </div>

        <article
          className={styles.sampleManifestCard}
          onPointerLeave={onSurfaceLeave}
          onPointerMove={onSurfaceMove}
        >
          <div
            key={createCompositeKey(
              "sample-manifest-sweep",
              activeSurface.id,
              activeProgram.id,
              sampleFormat,
              projectSpeed,
              activeServiceStep.title
            )}
            aria-hidden="true"
            className={styles.sampleManifestSweep}
          />
          <div className={styles.sampleManifestLead}>
            <span>Paquete premium</span>
            <strong>{projectSpeedProfile.title}</strong>
            <p>{projectSpeedProfile.copy}</p>
          </div>

          <div className={styles.sampleManifestTone}>{projectSpeedProfile.packageTone}</div>

          <div className={styles.sampleManifestSeal}>
            <span>Salida lista</span>
            <strong>{serviceResponse.title}</strong>
            <p>
              {activeServiceStep.title} / {productionSnapshot.responseTime}
            </p>
          </div>

          <div className={styles.sampleManifestGrid}>
            <article className={styles.sampleManifestItem}>
              <span>Superficie</span>
              <strong>{activeSurface.code}</strong>
              <p>{activeSurface.name}</p>
            </article>
            <article className={styles.sampleManifestItem}>
              <span>Programa</span>
              <strong>{activeProgram.title}</strong>
              <p>{activeMachine.name}</p>
            </article>
            <article className={styles.sampleManifestItem}>
              <span>Lote</span>
              <strong>{activeCutPlan.title}</strong>
              <p>{activeCutPlan.boardSize}</p>
            </article>
            <article className={styles.sampleManifestItem}>
              <span>Respuesta</span>
              <strong>{productionSnapshot.responseTime}</strong>
              <p>{productionSnapshot.throughputCompact}</p>
            </article>
          </div>
        </article>

        <div className={styles.sampleDecisionGrid}>
          {sampleDecisionSignals.map((signal, index) => (
            <article
              className={styles.sampleDecisionCard}
              key={createCompositeKey("sample-signal", index, signal.label, signal.value)}
            >
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
              <p>{signal.copy}</p>
            </article>
          ))}
        </div>

        <div className={styles.sampleSummary}>
          <div>
            <span>Formato sugerido</span>
            <strong>{sampleFormat}</strong>
          </div>
          <div>
            <span>Prioridad</span>
            <strong>{projectSpeed}</strong>
          </div>
          <div className={`${styles.primaryCta} ${styles.sampleSummaryCta}`}>
            {projectSpeedProfile.ctaLead}
          </div>
        </div>
      </div>

      <div className={styles.serviceRail}>
        {tablecorServiceSteps.map((step, index) => (
          <button
            type="button"
            className={`${styles.serviceCard}${
              index === activeServiceIndex ? ` ${styles.serviceCardActive}` : ""
            }`}
            aria-pressed={index === activeServiceIndex}
            key={createCompositeKey("service-step", index, step.title)}
            onClick={() => onSelectServiceIndex(index)}
          >
            <span>0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export const TablecorTopbar = memo(TablecorTopbarComponent);
export const TablecorHeroSection = memo(TablecorHeroSectionComponent);
export const TablecorLibrarySection = memo(TablecorLibrarySectionComponent);
export const TablecorProgramSection = memo(TablecorProgramSectionComponent);
export const TablecorProcessSection = memo(TablecorProcessSectionComponent);
export const TablecorMachineSection = memo(TablecorMachineSectionComponent);
export const TablecorSampleSection = memo(TablecorSampleSectionComponent);
