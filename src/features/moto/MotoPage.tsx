import type { CSSProperties, MouseEvent } from "react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import styles from "@/features/moto/moto.module.css";

function createCompositeKey(...parts: Array<number | string>) {
  return parts.join("::");
}

export function MotoPage() {
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("moto");
  const nextSite = getNextSite("moto");
  const moto = content.moto;
  const models = moto.models ?? [];
  const financeTerms = moto.financeTerms ?? [];
  const availableUseCases = moto.useCases?.length ? moto.useCases : ["Todas"];

  useDocumentTitle(siteMeta.title);

  const [activeModelId, setActiveModelId] = useState(() => models[0]?.id ?? "");
  const [deposit, setDeposit] = useState(8000);
  const [term, setTerm] = useState(() => financeTerms[1] ?? financeTerms[0] ?? 12);
  const [useCase, setUseCase] = useState(() => availableUseCases[0] ?? "Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const visibleModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models.filter((m) => {
      const matchCase = useCase === "Todas" || m.useCase === useCase;
      const matchQuery = q.length === 0 || [m.name, m.family, m.summary, m.useCase, m.engine].join(" ").toLowerCase().includes(q);
      return matchCase && matchQuery;
    });
  }, [models, searchQuery, useCase]);

  useEffect(() => {
    if (models.length === 0) { setActiveModelId(""); return; }
    if (!models.some((m) => m.id === activeModelId)) setActiveModelId(models[0].id);
  }, [activeModelId, models]);

  useEffect(() => {
    if (!availableUseCases.includes(useCase)) setUseCase(availableUseCases[0] ?? "Todas");
  }, [availableUseCases, useCase]);

  useEffect(() => {
    if (financeTerms.length === 0) { setTerm(12); return; }
    if (!financeTerms.includes(term)) setTerm(financeTerms[0]);
  }, [financeTerms, term]);

  useEffect(() => {
    setCompareIds((current) =>
      current.filter((id) => models.some((model) => model.id === id)).slice(-2)
    );
  }, [models]);

  useEffect(() => {
    if (visibleModels.length === 0) return;
    if (!visibleModels.some((m) => m.id === activeModelId)) setActiveModelId(visibleModels[0].id);
  }, [activeModelId, visibleModels]);

  /* ─── Scroll Reveal ─── */
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [activeModelId]);

  /* ─── Headlight Cursor ─── */
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;
    const revealTimeoutId = window.setTimeout(() => {
      glowRef.current?.classList.add(styles.headlightVisible);
    }, 300);
    const onMove = (e: globalThis.MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const { x, y } = mousePos.current;
      const px = prevPos.current.x;
      const py = prevPos.current.y;

      // Smooth glow follow
      const sx = px + (x - px) * 0.12;
      const sy = py + (y - py) * 0.12;
      prevPos.current = { x: sx, y: sy };

      if (glowRef.current) {
        glowRef.current.style.left = `${sx}px`;
        glowRef.current.style.top = `${sy}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${x}px`;
        dotRef.current.style.top = `${y}px`;
      }

      // Trail: angle + velocity
      const dx = x - px;
      const dy = y - py;
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (trailRef.current) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const trailLength = Math.min(speed * 3, 80);
        trailRef.current.style.left = `${x - trailLength}px`;
        trailRef.current.style.top = `${y}px`;
        trailRef.current.style.width = `${trailLength}px`;
        trailRef.current.style.transform = `rotate(${angle}deg)`;
        trailRef.current.style.opacity = speed > 2 ? String(Math.min(speed / 20, 0.7)) : "0";
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.clearTimeout(revealTimeoutId);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ─── Mouse Interactions ─── */
  const handleCardGlow = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -6;
    const ry = ((x - cx) / cx) * 6;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const resetCardGlow = useCallback((e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);

  const handleHeroParallax = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    img.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
  }, []);

  const resetHeroParallax = useCallback((e: MouseEvent<HTMLElement>) => {
    const img = e.currentTarget.querySelector("img");
    if (!img) return;
    img.style.transform = "scale(1.04)";
  }, []);

  /* ─── Derived State ─── */
  const hasFinderFilters = searchQuery.trim().length > 0 || useCase !== "Todas";
  const activeModel =
    visibleModels.find((m) => m.id === activeModelId) ??
    (visibleModels.length === 0 && hasFinderFilters
      ? undefined
      : models.find((m) => m.id === activeModelId) ?? models[0]);
  const principal = Math.max((activeModel?.price ?? 0) - deposit, 0);
  const monthlyPayment = term > 0 ? Math.round((principal * 1.14) / term) : 0;
  const accentStyle = { ["--moto-accent" as string]: activeModel?.accent ?? siteMeta.accent } as CSSProperties;
  const emptyModelMessage = hasFinderFilters
    ? "No hay motos para ese filtro. Cambia la busqueda o vuelve a otra categoria."
    : "Agrega al menos un modelo real desde el editor.";

  const editorialShots = activeModel
    ? [
      {
        ...(moto.showroomShots?.[0] ?? { src: activeModel.image, alt: `Escena de ${activeModel.name}`, title: activeModel.name, caption: activeModel.summary }),
        alt: `Escena de ${activeModel.name}`, src: activeModel.image, title: activeModel.name,
      },
      ...(moto.showroomShots?.slice(1) ?? []),
    ]
    : moto.showroomShots ?? [];

  function toggleCompare(id: string) {
    setCompareIds((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 2 ? [...c.slice(1), id] : [...c, id]);
  }

  return (
    <main className={`page-shell ${styles.page}`} style={accentStyle}>
      {/* ─── Headlight Cursor ─── */}
      <div ref={glowRef} className={styles.headlight} />
      <div ref={dotRef} className={styles.headlightDot} />
      <div ref={trailRef} className={styles.headlightTrail} />

      <div className={styles.stack}>

        {/* ─── Header ─── */}
        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <span className={styles.brandTag}>{siteMeta.category}</span>
            <strong className={styles.brandLogo}>{siteMeta.title}</strong>
          </div>
          <nav className={styles.navLinks} aria-label="Navegacion de motos">
            <a href="#modelos">Catalogo</a>
            <a href="#dna">Ride DNA</a>
            <a href="#visuales">Visuales</a>
            <a href="#comunidad">Comunidad</a>
            <a href="#finanzas">Financiamiento</a>
          </nav>
          <div className={styles.topbarActions}>
            <Link className={styles.backLink} to="/">Volver al catalogo</Link>
            <Link className={styles.comparePill} to="/workspace?site=moto">Editar contenido</Link>
            <Link className={styles.nextLink} to={nextSite.route}>Siguiente: {nextSite.title}</Link>
          </div>
        </header>

        {/* ─── Hero ─── */}
        <section
          className={styles.hero}
          onMouseLeave={resetHeroParallax}
          onMouseMove={handleHeroParallax}
        >
          {/* Speed Lines Decoration */}
          <div className={styles.speedLines}>
            <div className={styles.speedLine} />
            <div className={styles.speedLine} />
            <div className={styles.speedLine} />
            <div className={styles.speedLine} />
            <div className={styles.speedLine} />
          </div>

          {activeModel ? (
            <>
              <div className={styles.heroMedia}>
                <img alt={`Moto ${activeModel.name}`} src={activeModel.image} />
              </div>
              <div className={styles.heroOverlay} />

              <div className={`${styles.heroIntro} ${styles.revealLeft}`} data-reveal>
                <p className={styles.kicker}>{siteMeta.title} / showroom</p>
                <h1>{activeModel.heroTitle}</h1>
                <p className={styles.lead}>{activeModel.story}</p>
                <div className={styles.heroMeta}>
                  {(moto.metrics ?? []).map((m, index) => (
                    <div
                      className={styles.heroMetaItem}
                      key={createCompositeKey(m.label, m.value, index)}
                    >
                      <strong>{m.value}</strong>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <aside className={`${styles.heroHud} ${styles.revealRight}`} data-reveal>
                <div className={styles.hudSpeed}>
                  <span>{activeModel.family}</span>
                  <strong>{activeModel.topSpeed}</strong>
                  <small>top speed</small>
                </div>
                <div className={styles.hudSpecs}>
                  <div><span>Potencia</span><strong>{activeModel.power}</strong></div>
                  <div><span>Torque</span><strong>{activeModel.torque}</strong></div>
                  <div><span>Autonomia</span><strong>{activeModel.range}</strong></div>
                </div>
              </aside>
            </>
          ) : (
            <div className="empty-state">{emptyModelMessage}</div>
          )}

          <div className={styles.finder}>
            <div className={styles.finderIntro}>
              <p className={styles.sectionLabel}>Encuentra tu unidad</p>
              <h2>Busca por uso real, no solo por nombre.</h2>
            </div>
            <div className={styles.finderFields}>
              <label className={styles.finderField}>
                <span>Uso principal</span>
                <div className={styles.filterRail}>
                  {availableUseCases.map((item, index) => (
                    <button
                      aria-pressed={item === useCase}
                      className={`${styles.filterChip}${item === useCase ? ` ${styles.filterChipActive}` : ""}`}
                      key={createCompositeKey(item, index)}
                      type="button"
                      onClick={() => setUseCase(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </label>
              <label className={styles.finderField}>
                <span>Buscar modelo o categoria</span>
                <input placeholder="Atlas, street, dual, adventure..." type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </label>
            </div>
            <div className={styles.resultRail}>
              {visibleModels.length > 0 ? visibleModels.map((m) => (
                <button
                  aria-pressed={m.id === activeModel?.id}
                  className={`${styles.resultItem}${m.id === activeModel?.id ? ` ${styles.resultItemActive}` : ""}`}
                  key={m.id}
                  type="button"
                  onClick={() => startTransition(() => setActiveModelId(m.id))}
                >
                  <span>{m.family}</span>
                  <strong>{m.name}</strong>
                  <small>{m.useCase}</small>
                </button>
              )) : (
                <div className={styles.resultEmpty}>No hay unidades para ese filtro. Prueba otra combinacion.</div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Lineup ─── */}
        <section className={styles.lineupSection} id="modelos">
          <div className={styles.lineupSidebar}>
            <p className={styles.sectionLabel}>Lineup</p>
            <h2>Selecciona una unidad y comparala.</h2>
            <div className={styles.lineupList}>
              {visibleModels.map((m) => (
                <div className={`${styles.lineupItem}${m.id === activeModel?.id ? ` ${styles.lineupItemActive}` : ""}`} key={m.id}>
                  <button
                    aria-pressed={m.id === activeModel?.id}
                    className={styles.lineupSelect}
                    type="button"
                    onClick={() => startTransition(() => setActiveModelId(m.id))}
                  >
                    <span>{m.family}</span>
                    <strong>{m.name}</strong>
                    <small>{m.summary}</small>
                  </button>
                  <button
                    aria-pressed={compareIds.includes(m.id)}
                    className={`${styles.compareToggle}${compareIds.includes(m.id) ? ` ${styles.compareToggleActive}` : ""}`}
                    type="button"
                    onClick={() => toggleCompare(m.id)}
                  >
                    Comparar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.lineupStage} ${styles.reveal}`} data-reveal>
            {activeModel ? (
              <>
                <img alt={`Escena de ${activeModel.name}`} src={activeModel.image} />
                <div className={styles.stageCaption}>
                  <span>{activeModel.useCase}</span>
                  <h2>{activeModel.name}</h2>
                  <p>{activeModel.story}</p>
                </div>
              </>
            ) : (
              <div className="empty-state">{emptyModelMessage}</div>
            )}
          </div>

          <aside className={`${styles.specRail} ${styles.reveal}`} data-reveal>
            <p className={styles.sectionLabel}>Spec rail</p>
            {activeModel ? (
              <>
                <dl className={styles.specList}>
                  <div><dt>Motor</dt><dd>{activeModel.engine}</dd></div>
                  <div><dt>Cilindrada</dt><dd>{activeModel.displacement}</dd></div>
                  <div><dt>Peso</dt><dd>{activeModel.wetWeight}</dd></div>
                  <div><dt>Frenos</dt><dd>{activeModel.brake}</dd></div>
                  <div><dt>Suspension</dt><dd>{activeModel.suspension}</dd></div>
                  <div><dt>Disponibilidad</dt><dd>{activeModel.availability}</dd></div>
                </dl>
                <div className={styles.techLine}>
                  {activeModel.tech.map((t, index) => (
                    <span key={createCompositeKey(t, index)}>{t}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">{emptyModelMessage}</div>
            )}
          </aside>
        </section>

        {/* ─── DNA ─── */}
        <section className={styles.dnaSection} id="dna">
          <div className={`${styles.dnaIntro} ${styles.revealLeft}`} data-reveal>
            <p className={styles.sectionLabel}>Ride DNA</p>
            <h2>El comportamiento se lee como una mesa de mezcla.</h2>
            <p>La informacion vive en barras, niveles y lectura comparativa para que puedas reemplazar los datos del demo por un caso real sin cambiar la estructura.</p>
          </div>


          <div className={`${styles.dnaGraph} ${styles.reveal}`} data-reveal>
            {(activeModel?.rideProfile ?? []).map((item, index) => (
              <div
                className={styles.dnaRow}
                key={createCompositeKey(item.label, item.value, index)}
              >
                <div className={styles.dnaHead}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className={styles.dnaTrack}>
                  <span className={styles.dnaFill} style={{ ["--meter-size" as string]: `${item.value}%` } as CSSProperties} />
                </div>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>

          <div className={`${styles.benefitStack} ${styles.revealRight}`} data-reveal>
            {(moto.benefits ?? []).map((b, i) => (
              <article className={styles.benefitLine} key={createCompositeKey(b.title, i)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── Editorial / Visuals ─── */}
        <section className={styles.editorialSection} id="visuales">
          <div className={`${styles.editorialLead} ${styles.reveal}`} data-reveal>
            <p className={styles.sectionLabel}>Visual language</p>
            <h2>Direccion de arte, sombras profundas y una lectura mas cinematica.</h2>
          </div>

          <div className={styles.editorialLayout}>
            {editorialShots[0] ? (
              <figure className={`${styles.editorialHero} ${styles.reveal} ${styles.revealD1}`} data-reveal>
                <img alt={editorialShots[0].alt} src={editorialShots[0].src} />
                <figcaption>
                  <strong>{editorialShots[0].title}</strong>
                  <span>{editorialShots[0].caption}</span>
                </figcaption>
              </figure>
            ) : (
              <div className="empty-state">Agrega una imagen principal en el editor.</div>
            )}
            <div className={styles.editorialColumn}>
              {editorialShots.slice(1).map((s, i) => (
                <figure
                  className={`${styles.editorialShot} ${styles.reveal}`}
                  data-reveal
                  style={{ transitionDelay: `${(i + 1) * 200}ms` }}
                  key={createCompositeKey(s.title, s.src, i)}
                >
                  <img alt={s.alt} src={s.src} />
                  <figcaption>
                    <strong>{s.title}</strong>
                    <span>{s.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Community ─── */}
        <section className={styles.communitySection} id="comunidad">
          <div className={`${styles.communityLead} ${styles.reveal}`} data-reveal>
            <p className={styles.sectionLabel}>Rider Community</p>
            <h2>Las maquinas se prueban en la ruta, no en el papel.</h2>
          </div>
          <div className={styles.communityGrid}>
            {(moto.riders ?? []).map((rider, index) => (
              <article
                className={`${styles.riderCard} ${styles.reveal}`}
                data-reveal
                style={{ transitionDelay: `${index * 200}ms` }}
                key={createCompositeKey(rider.name, rider.modelId, index)}
                onMouseMove={handleCardGlow}
                onMouseLeave={resetCardGlow}
              >
                <p className={styles.riderQuote}>"{rider.quote}"</p>
                <div className={styles.riderMeta}>
                  <img src={rider.image} alt={rider.name} className={styles.riderAvatar} />
                  <div className={styles.riderInfo}>
                    <strong>{rider.name}</strong>
                    <span>{rider.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── Finance ─── */}
        <section className={`${styles.financeSection} ${styles.reveal}`} data-reveal id="finanzas">
          <div className={styles.financeLead}>
            <p className={styles.sectionLabel}>Financiamiento</p>
            <h2>Configura entrada, plazo y entiende la cuota al instante.</h2>
            <strong className={styles.financeBig}>S/ {monthlyPayment.toLocaleString("es-PE")} / mes</strong>
            <p>
              {activeModel
                ? `Precio actual de ${activeModel.name}: S/ ${activeModel.price.toLocaleString("es-PE")}`
                : hasFinderFilters
                  ? emptyModelMessage
                  : "Carga un modelo con precio para simular financiamiento."}
            </p>
          </div>

          <div className={styles.financeControls}>
            <label className={styles.financeRange}>
              <span>Cuota inicial</span>
              <input id="deposit-range" max={20000} min={2000} step={500} type="range" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
              <strong>S/ {deposit.toLocaleString("es-PE")}</strong>
            </label>
            <div className={styles.termRail}>
              {financeTerms.map((v) => (
                <button
                  aria-pressed={v === term}
                  className={`${styles.termButton}${v === term ? ` ${styles.termActive}` : ""}`}
                  key={v}
                  type="button"
                  onClick={() => setTerm(v)}
                >
                  {v} meses
                </button>
              ))}
            </div>
            <div className={styles.financeSummary}>
              <div><span>Entrada</span><strong>S/ {deposit.toLocaleString("es-PE")}</strong></div>
              <div><span>Saldo financiado</span><strong>S/ {principal.toLocaleString("es-PE")}</strong></div>
              <div><span>Plazo</span><strong>{term} meses</strong></div>
            </div>
          </div>

          <div className={styles.ownershipRail}>
            <div className={styles.ownershipHead}>
              <p className={styles.sectionLabel}>Ownership</p>
              <h2>Despues de elegir unidad, queda cerrar la experiencia.</h2>
            </div>
            <div className={styles.ownershipActions}>
              <a className={styles.primaryCta} href="#modelos">Solicitar test ride</a>
              <button className={styles.secondaryCta} type="button">Hablar con asesor</button>
            </div>
          </div>
        </section>

        {/* ─── Marquee ─── */}
        <section className={styles.marqueeSection} aria-label="Frase de cierre">
          <div className={styles.marqueeTrack}>
            <span>Performance. Precision. Presence.</span>
            <span>Performance. Precision. Presence.</span>
            <span>Performance. Precision. Presence.</span>
          </div>
        </section>

      </div>
    </main>
  );
}
