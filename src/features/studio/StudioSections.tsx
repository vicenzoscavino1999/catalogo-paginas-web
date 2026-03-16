import type { PointerEventHandler } from "react";
import { Link } from "react-router-dom";
import type {
  StudioCaseStudy,
  StudioDiscipline,
  StudioWorkflowStep,
} from "@/shared/content/contentTypes";
import type { MetricItem, SitePreview } from "@/shared/types/site";
import {
  getCaseProfile,
  getDisciplineProfile,
  type StudioProfile,
} from "@/features/studio/studioProfiles";
import type {
  StudioCasePreview,
  StudioGalleryCard,
} from "@/features/studio/studioSelectors";
import styles from "@/features/studio/studio.module.css";

interface MotionHandlers {
  onPointerLeave: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
}

interface StudioTopbarProps {
  activeSection: string;
  isTopbarHidden: boolean;
  nextSite: SitePreview;
  siteMeta: SitePreview;
}

interface StudioHeroSectionProps extends MotionHandlers {
  activeCaseProfile: StudioProfile;
  activeDisciplineProfile: StudioProfile;
  defaultStudioImage: string;
  disciplines: StudioDiscipline[];
  heroCasePreviews: StudioCasePreview[];
  heroMetrics: MetricItem[];
  selectedCase?: StudioCaseStudy;
  selectedDiscipline?: StudioDiscipline;
  siteMeta: SitePreview;
  activateCase: (caseName: string) => void;
  activateDiscipline: (disciplineId: string) => void;
}

interface StudioClosingSectionProps extends MotionHandlers {
  closingPreludeCards: Array<{ copy: string; label: string; value: string }>;
  galleryCards: StudioGalleryCard[];
  nextSite: SitePreview;
  siteMeta: SitePreview;
}

interface StudioServicesSectionProps extends MotionHandlers {
  activeDisciplineProfile: StudioProfile;
  disciplines: StudioDiscipline[];
  selectedDiscipline?: StudioDiscipline;
  selectedWorkflow?: StudioWorkflowStep;
  serviceSignals: Array<{ copy: string; label: string; value: string }>;
  siteMeta: SitePreview;
  supportingCase?: StudioCaseStudy;
  supportingCaseProfile: StudioProfile;
  activateDiscipline: (disciplineId: string) => void;
}

interface StudioCasesSectionProps extends MotionHandlers {
  activeCaseProfile: StudioProfile;
  activeFilter: string;
  caseFilters: string[];
  caseSignals: Array<{ label: string; value: string }>;
  selectedCase?: StudioCaseStudy;
  selectedDiscipline?: StudioDiscipline;
  selectedWorkflow?: StudioWorkflowStep;
  visibleCases: StudioCaseStudy[];
  activateCase: (caseName: string) => void;
  onSelectFilter: (filter: string) => void;
}

interface StudioProcessSectionProps extends MotionHandlers {
  activeDisciplineProfile: StudioProfile;
  activeWorkflowIndex: number;
  processPreludeCards: Array<{ copy: string; label: string; value: string }>;
  selectedWorkflow?: StudioWorkflowStep;
  workflow: StudioWorkflowStep[];
  workflowSignals: Array<{ copy: string; label: string; value: string }>;
  onSelectWorkflow: (index: number) => void;
}

function createCompositeKey(...parts: Array<string | number>) {
  return parts.join("::");
}

export function StudioTopbar({
  activeSection,
  isTopbarHidden,
  nextSite,
  siteMeta,
}: StudioTopbarProps) {
  return (
    <header className={`${styles.topbar}${isTopbarHidden ? ` ${styles.topbarHidden}` : ""}`}>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark} aria-hidden="true">
          <span>AN</span>
          <div className={styles.brandMarkRing} />
        </div>

        <div className={styles.brandCopy}>
          <span className={styles.brandLabel}>Estudio creativo / criterio / sistema</span>
          <strong className={styles.brandName}>{siteMeta.title}</strong>
        </div>
      </div>

      <nav className={styles.navLinks} aria-label="Navegacion Atelier Norte">
        <a className={activeSection === "servicios" ? styles.navLinkActive : ""} href="#servicios">
          Servicios
        </a>
        <a className={activeSection === "casos" ? styles.navLinkActive : ""} href="#casos">
          Casos
        </a>
        <a className={activeSection === "proceso" ? styles.navLinkActive : ""} href="#proceso">
          Proceso
        </a>
        <a className={activeSection === "cierre" ? styles.navLinkActive : ""} href="#cierre">
          Cierre
        </a>
      </nav>

      <div className={styles.topbarActions}>
        <Link className={styles.backLink} to="/">
          Volver al catalogo
        </Link>
        <Link className={styles.workspaceLink} to="/workspace?site=studio">
          Editar contenido
        </Link>
        <Link className={styles.nextLink} to={nextSite.route}>
          <span>Siguiente demo</span>
          <strong>{nextSite.title}</strong>
        </Link>
      </div>
    </header>
  );
}

export function StudioHeroSection({
  activeCaseProfile,
  activeDisciplineProfile,
  activateCase,
  activateDiscipline,
  defaultStudioImage,
  disciplines,
  heroCasePreviews,
  heroMetrics,
  onPointerLeave,
  onPointerMove,
  selectedCase,
  selectedDiscipline,
  siteMeta,
}: StudioHeroSectionProps) {
  return (
    <section
      className={styles.hero}
      data-section-id="hero"
      data-visible="true"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div
        className={styles.heroBackdrop}
        style={{ backgroundImage: `url(${defaultStudioImage})` }}
      />
      <div
        className={styles.heroLayer}
        style={{ backgroundImage: `url(${activeDisciplineProfile.image})` }}
      />

      <div className={styles.heroInner}>
        <div className={styles.heroMain}>
          <div className={styles.heroCopy}>
            <div className={styles.heroSignature}>
              <span className={styles.signatureLine} />
              <strong>Creative direction in public</strong>
            </div>
            <p className={styles.eyebrow}>{siteMeta.category}</p>
            <h1 className={styles.heroTitle}>
              <span>Atelier Norte</span>
              <em>edita</em>
              <span>marcas para vender criterio.</span>
            </h1>
            <p className={styles.heroLead}>
              {siteMeta.description} Esta version toma toda la pantalla para vender
              direccion, sistema y casos con mucho mas presencia visual.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryCta} href="#servicios">
                Ver disciplinas
              </a>
              <a className={styles.secondaryCta} href="#casos">
                Revisar casos
              </a>
            </div>
          </div>

          <div className={styles.heroStage}>
            <div className={styles.heroMeta}>
              <div className={styles.heroMetaLead}>
                <span className={styles.metaLabel}>Disciplina activa</span>
                <strong className={styles.metaTitle}>
                  {selectedDiscipline?.label ?? "Sin disciplina"}
                </strong>
                <p className={styles.metaText}>{activeDisciplineProfile.lens}</p>
              </div>

              <div className={styles.heroMetaFlow}>
                <div>
                  <small>Resumen</small>
                  <strong>{selectedDiscipline?.summary ?? siteMeta.summary}</strong>
                </div>
                <div>
                  <small>Ritmo</small>
                  <strong>{activeDisciplineProfile.rhythm}</strong>
                </div>
                <div>
                  <small>Presion</small>
                  <strong>{activeDisciplineProfile.pressure}</strong>
                </div>
              </div>
            </div>

              <div className={styles.heroPreviewRail}>
                {heroCasePreviews.map(({ caseItem, profile }) => (
                  <button
                    key={caseItem.name}
                    type="button"
                    className={styles.heroPreviewCard}
                    aria-pressed={caseItem.name === selectedCase?.name}
                    style={{ backgroundImage: `url(${profile.image})` }}
                    onClick={() => {
                      activateCase(caseItem.name);
                  }}
                >
                  <div className={styles.heroPreviewShade} />
                  <div className={styles.heroPreviewCopy}>
                    <span>{caseItem.focus}</span>
                    <strong>{caseItem.name}</strong>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroSupport}>
          <div className={styles.heroLedger}>
            <article className={styles.ledgerCard}>
              <span>Edicion</span>
              <strong>01</strong>
              <p>Atelier Norte / catalog suite</p>
            </article>
            <article className={styles.ledgerCard}>
              <span>Disciplina</span>
              <strong>{selectedDiscipline?.label ?? "Base"}</strong>
              <p>{activeDisciplineProfile.rhythm}</p>
            </article>
            <article className={styles.ledgerCard}>
              <span>Caso guia</span>
              <strong>{selectedCase?.name ?? siteMeta.title}</strong>
              <p>{activeCaseProfile.note}</p>
            </article>
          </div>

          {heroMetrics.length > 0 ? (
            <div className={styles.metricStrip}>
              {heroMetrics.map((metric, index) => (
                <article
                  className={styles.metricItem}
                  key={createCompositeKey("hero-metric", index, metric.value, metric.label)}
                >
                  <strong>{metric.value}</strong>
                  <p>{metric.label}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

          <div className={styles.heroRibbon}>
            {disciplines.map((discipline, index) => (
              <button
                key={discipline.id}
                type="button"
                className={`${styles.ribbonItem}${
                  discipline.id === selectedDiscipline?.id ? ` ${styles.ribbonItemActive}` : ""
                }`}
                aria-pressed={discipline.id === selectedDiscipline?.id}
                onClick={() => {
                  activateDiscipline(discipline.id);
                }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{discipline.label}</strong>
              <p>{discipline.summary}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioServicesSection({
  activeDisciplineProfile,
  activateDiscipline,
  disciplines,
  onPointerLeave,
  onPointerMove,
  selectedDiscipline,
  selectedWorkflow,
  serviceSignals,
  siteMeta,
  supportingCase,
  supportingCaseProfile,
}: StudioServicesSectionProps) {
  return (
    <section
      className={styles.servicesSection}
      data-section-id="servicios"
      data-visible="false"
      id="servicios"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div
        className={styles.sectionBackdrop}
        style={{ backgroundImage: `url(${activeDisciplineProfile.image})` }}
      />

      <div className={styles.sectionInner}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Servicios</p>
          <h2>La disciplina activa cambia toda la escena y no solo un panel lateral.</h2>
          <p>
            Cada seleccion mueve el color, la fotografia y la lectura comercial para que
            el estudio parezca dirigido y no ensamblado.
          </p>
        </div>

        <div className={styles.servicesLayout}>
          <div className={styles.disciplineRail}>
            {disciplines.map((discipline, index) => {
              const previewProfile = getDisciplineProfile(discipline.id);

              return (
                <button
                  key={discipline.id}
                  type="button"
                  className={`${styles.disciplineRow}${
                    discipline.id === selectedDiscipline?.id ? ` ${styles.disciplineRowActive}` : ""
                  }`}
                  aria-pressed={discipline.id === selectedDiscipline?.id}
                  onClick={() => {
                    activateDiscipline(discipline.id);
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.listThumb}>
                    <img alt={previewProfile.alt} decoding="async" src={previewProfile.image} />
                  </div>
                  <div className={styles.rowCopy}>
                    <strong>{discipline.label}</strong>
                    <p>{discipline.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <article className={styles.disciplineStage}>
            <div
              className={styles.disciplineVisual}
              onPointerLeave={onPointerLeave}
              onPointerMove={onPointerMove}
            >
              <img
                alt={activeDisciplineProfile.alt}
                className={styles.disciplineImage}
                decoding="async"
                src={activeDisciplineProfile.image}
              />
              <div className={styles.disciplineShade} />
              <div className={styles.disciplineCaption}>
                <span>Foco activo</span>
                <strong>{selectedDiscipline?.label ?? "Sin disciplina"}</strong>
              </div>
            </div>

            {supportingCase ? (
              <article
                className={styles.supportPanel}
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
              >
                <img
                  alt={supportingCaseProfile.alt}
                  className={styles.supportImage}
                  decoding="async"
                  src={supportingCaseProfile.image}
                />
                <div className={styles.supportShade} />
                <div className={styles.supportCopy}>
                  <span>Caso relacionado</span>
                  <strong>{supportingCase.name}</strong>
                  <p>{supportingCase.result}</p>
                </div>
              </article>
            ) : null}

            <div className={styles.disciplineCopy}>
              <p className={styles.eyebrow}>Direccion editada</p>
              <h2>{selectedDiscipline?.label ?? "Sin disciplina"}</h2>
              <p className={styles.disciplineLead}>
                {selectedDiscipline?.summary ??
                  "Completa esta disciplina desde el editor local para verla en grande."}
              </p>
            </div>

            <article className={styles.servicePaper}>
              <div className={styles.servicePaperHeader}>
                <span>Nota editorial</span>
                <strong>{siteMeta.summary}</strong>
              </div>
              <p>
                {selectedDiscipline?.label ?? "La disciplina activa"} se presenta con una
                lectura mas ordenada, mas premium y menos de plantilla.
              </p>
              <div className={styles.servicePaperMeta}>
                <span>{selectedWorkflow?.title ?? "Sistema"}</span>
                <span>{supportingCase?.name ?? "Caso base"}</span>
                <span>{selectedDiscipline?.deliverables.length ?? 0} entregables</span>
              </div>
            </article>

            <div className={styles.deliverableStrip}>
              {(selectedDiscipline?.deliverables ?? []).map((deliverable, index) => (
                <span key={createCompositeKey("deliverable", index, deliverable)}>{deliverable}</span>
              ))}
            </div>

            <div className={styles.signalGrid}>
              {serviceSignals.map((signal, index) => (
                <article
                  className={styles.signalCard}
                  key={createCompositeKey("service-signal", index, signal.label, signal.value)}
                >
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                  <p>{signal.copy}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function StudioCasesSection({
  activeCaseProfile,
  activeFilter,
  activateCase,
  caseFilters,
  caseSignals,
  onPointerLeave,
  onPointerMove,
  onSelectFilter,
  selectedCase,
  selectedDiscipline,
  selectedWorkflow,
  visibleCases,
}: StudioCasesSectionProps) {
  return (
    <section
      className={styles.casesSection}
      data-section-id="casos"
      data-visible="false"
      id="casos"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div
        className={styles.sectionBackdrop}
        style={{ backgroundImage: `url(${activeCaseProfile.image})` }}
      />

      <div className={styles.sectionInner}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Casos</p>
          <h2>Los casos ya no aparecen como fichas mudas: entran como portada viva.</h2>
          <p>
            Puedes filtrar, cambiar de caso y dejar que la escena se reconstruya con foto,
            foco y resultado.
          </p>
        </div>

        <div className={styles.filterRail}>
          {caseFilters.map((filter, index) => (
            <button
              key={createCompositeKey("case-filter", index, filter)}
              type="button"
              className={`${styles.filterChip}${
                filter === activeFilter ? ` ${styles.filterChipActive}` : ""
              }`}
              aria-pressed={filter === activeFilter}
              onClick={() => {
                onSelectFilter(filter);
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.caseLayout}>
          <div className={styles.caseList}>
            {visibleCases.length > 0 ? (
              visibleCases.map((item, index) => {
                const previewProfile = getCaseProfile(item.name);

                return (
                  <button
                    key={`${item.name}-${item.focus}`}
                    type="button"
                    className={`${styles.caseRow}${
                      item.name === selectedCase?.name ? ` ${styles.caseRowActive}` : ""
                    }`}
                    aria-pressed={item.name === selectedCase?.name}
                    onClick={() => {
                      activateCase(item.name);
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.listThumb}>
                      <img alt={previewProfile.alt} decoding="async" src={previewProfile.image} />
                    </div>
                    <div className={styles.rowCopy}>
                      <strong>{item.name}</strong>
                      <p>{item.focus}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={styles.emptyState}>No hay casos disponibles para este filtro.</div>
            )}
          </div>

          {selectedCase ? (
            <article className={styles.caseStage}>
              <div
                className={styles.caseVisual}
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
              >
                <img
                  alt={activeCaseProfile.alt}
                  className={styles.caseImage}
                  decoding="async"
                  src={activeCaseProfile.image}
                />
                <div className={styles.caseShade} />
                <div className={styles.caseCaption}>
                  <span>{selectedCase.focus}</span>
                  <strong>{selectedCase.sector}</strong>
                </div>
              </div>

              <div className={styles.caseStory}>
                <p className={styles.eyebrow}>Caso activo</p>
                <h2>{selectedCase.name}</h2>
                <p className={styles.caseLead}>{selectedCase.result}</p>

                <article className={styles.caseDossier}>
                  <span>Dossier</span>
                  <strong>{activeCaseProfile.note}</strong>
                  <div className={styles.caseDossierMeta}>
                    <small>{selectedCase.focus}</small>
                    <small>{selectedCase.sector}</small>
                  </div>
                </article>

                <div className={styles.caseSignalGrid}>
                  {caseSignals.map((signal, index) => (
                    <article
                      className={styles.caseSignalCard}
                      key={createCompositeKey("case-signal", index, signal.label, signal.value)}
                    >
                      <span>{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </article>
                  ))}
                </div>

                <div className={styles.caseNotes}>
                  <div>
                    <small>Lectura visual</small>
                    <strong>{activeCaseProfile.note}</strong>
                  </div>
                  <div>
                    <small>Metodo actual</small>
                    <strong>{selectedWorkflow?.title ?? "Sistema"}</strong>
                  </div>
                  <div>
                    <small>Disciplina</small>
                    <strong>{selectedDiscipline?.label ?? selectedCase.focus}</strong>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className={styles.emptyState}>Agrega casos desde el editor local.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function StudioProcessSection({
  activeDisciplineProfile,
  activeWorkflowIndex,
  onPointerLeave,
  onPointerMove,
  onSelectWorkflow,
  processPreludeCards,
  selectedWorkflow,
  workflow,
  workflowSignals,
}: StudioProcessSectionProps) {
  return (
    <section
      className={styles.processSection}
      data-section-id="proceso"
      data-visible="false"
      id="proceso"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div
        className={styles.sectionBackdrop}
        style={{ backgroundImage: `url(${activeDisciplineProfile.image})` }}
      />

      <div className={styles.sectionInner}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Proceso</p>
          <h2>Metodo visible para que la venta no dependa de una explicacion fuera de pantalla.</h2>
          <p>
            La misma pagina muestra diagnostico, sistema y despliegue con una lectura mas
            amplia y mas propia del estudio.
          </p>
        </div>

        <div className={styles.sectionPreludeStrip}>
          {processPreludeCards.map((item, index) => (
            <article
              className={styles.sectionPreludeCard}
              key={createCompositeKey("process-prelude", index, item.label, item.value)}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>

        <div className={styles.processLayout}>
          <div className={styles.processRail}>
            {workflow.map((step, index) => (
              <button
                key={createCompositeKey("workflow-step", index, step.title)}
                type="button"
                className={`${styles.processStep}${
                  index === activeWorkflowIndex ? ` ${styles.processStepActive}` : ""
                }`}
                aria-pressed={index === activeWorkflowIndex}
                onClick={() => {
                  onSelectWorkflow(index);
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </button>
            ))}
          </div>

          {selectedWorkflow ? (
            <article className={styles.processStage}>
              <div className={styles.processNumber}>
                {String(activeWorkflowIndex + 1).padStart(2, "0")}
              </div>

              <div className={styles.processCopy}>
                <p className={styles.eyebrow}>Etapa activa</p>
                <h2>{selectedWorkflow.title}</h2>
                <p className={styles.processLead}>{selectedWorkflow.copy}</p>
              </div>

              <div className={styles.processMarkers}>
                {workflow.map((step, index) => (
                  <div
                    className={styles.processMarker}
                    data-active={index <= activeWorkflowIndex}
                    key={createCompositeKey("process-marker", index, step.title)}
                  >
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <span>{step.title}</span>
                  </div>
                ))}
              </div>

              <div className={styles.workflowSignalGrid}>
                {workflowSignals.map((signal, index) => (
                  <article
                    className={styles.workflowSignalCard}
                    key={createCompositeKey("workflow-signal", index, signal.label, signal.value)}
                  >
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                    <p>{signal.copy}</p>
                  </article>
                ))}
              </div>
            </article>
          ) : (
            <div className={styles.emptyState}>Agrega etapas reales desde el editor local.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function StudioClosingSection({
  closingPreludeCards,
  galleryCards,
  nextSite,
  onPointerLeave,
  onPointerMove,
  siteMeta,
}: StudioClosingSectionProps) {
  return (
    <section
      className={styles.closingSection}
      data-section-id="cierre"
      data-visible="false"
      id="cierre"
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <div
        className={styles.sectionBackdrop}
        style={{ backgroundImage: `url(${galleryCards[0]?.profile.image ?? ""})` }}
      />

      <div className={styles.sectionInner}>
        <div className={styles.sectionPreludeStrip}>
          {closingPreludeCards.map((item, index) => (
            <article
              className={styles.sectionPreludeCard}
              key={createCompositeKey("closing-prelude", index, item.label, item.value)}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>

        <div className={styles.closingLayout}>
          <div className={styles.closingCopy}>
            <p className={styles.eyebrow}>Cierre</p>
            <h2>Ahora la home se comporta como estudio creativo, no como demo encapsulada.</h2>
            <p>
              Puedes reemplazar disciplinas, casos y proceso reales desde el editor local
              sin perder esta direccion de tipografia, imagen, brillo y pantalla completa.
            </p>

            <div className={styles.heroTags}>
              {siteMeta.tags.map((tag, index) => (
                <span key={createCompositeKey("site-tag", index, tag)}>{tag}</span>
              ))}
            </div>

            <article className={styles.closingNote}>
              <span>Edicion viva</span>
              <p>
                La narrativa, los casos y el proceso pueden reemplazarse desde el editor
                local sin perder esta direccion de marca.
              </p>
            </article>

            <div className={styles.closingActions}>
              <Link className={styles.primaryCta} to="/workspace?site=studio">
                Editar Atelier Norte
              </Link>
              <Link className={styles.secondaryCta} to={nextSite.route}>
                Ver {nextSite.title}
              </Link>
            </div>
          </div>

          <div className={styles.mosaicGrid}>
            {galleryCards.map(({ caseItem, index, profile }) => (
              <article
                key={caseItem.name}
                className={styles.mosaicCard}
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
              >
                <img
                  alt={profile.alt}
                  className={styles.mosaicImage}
                  decoding="async"
                  src={profile.image}
                />
                <div className={styles.mosaicShade} />
                <div className={styles.mosaicCopy}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{caseItem.name}</strong>
                  <p>{caseItem.result}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
