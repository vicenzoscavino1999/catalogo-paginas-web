import type { CSSProperties } from "react";
import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import styles from "@/features/restaurant/restaurant.module.css";

function createCompositeKey(...parts: Array<number | string>) {
  return parts.join("::");
}

export function RestaurantPage() {
  const { content, getNextSite, getSiteByKey } = useMvpContent();
  const siteMeta = getSiteByKey("restaurant");
  const nextSite = getNextSite("restaurant");
  const restaurant = content.restaurant;
  const hero = restaurant.hero;
  const metrics = restaurant.metrics ?? [];
  const menuGroups = restaurant.menuGroups ?? [];
  const guestOptions = restaurant.guestOptions ?? [];
  const reservationSlots = restaurant.reservationSlots ?? [];
  const scenes = restaurant.scenes ?? [];
  const ambienceNotes = restaurant.ambienceNotes ?? [];
  const serviceMoments = restaurant.serviceMoments ?? [];
  const pageStyle = { ["--theme-accent" as string]: siteMeta.accent } as CSSProperties;

  useDocumentTitle(siteMeta.title);

  const [activeMenuId, setActiveMenuId] = useState(() => menuGroups[0]?.id ?? "");
  const [guestCount, setGuestCount] = useState<number>(() => guestOptions[1] ?? guestOptions[0] ?? 0);
  const [timeSlot, setTimeSlot] = useState(() => reservationSlots[2] ?? reservationSlots[0] ?? "");

  useEffect(() => {
    if (menuGroups.length === 0) {
      setActiveMenuId("");
      return;
    }

    if (!menuGroups.some((group) => group.id === activeMenuId)) {
      setActiveMenuId(menuGroups[0].id);
    }
  }, [activeMenuId, menuGroups]);

  useEffect(() => {
    if (guestOptions.length === 0) {
      setGuestCount(0);
      return;
    }

    if (!guestOptions.includes(guestCount)) {
      setGuestCount(guestOptions[0]);
    }
  }, [guestCount, guestOptions]);

  useEffect(() => {
    if (reservationSlots.length === 0) {
      setTimeSlot("");
      return;
    }

    if (!reservationSlots.includes(timeSlot)) {
      setTimeSlot(reservationSlots[0]);
    }
  }, [reservationSlots, timeSlot]);

  const activeMenu = menuGroups.find((group) => group.id === activeMenuId) ?? menuGroups[0];
  const reservationSummary =
    guestCount > 0 && timeSlot
      ? `${guestCount} personas - ${timeSlot}`
      : "Configura turnos y aforo";

  return (
    <main className={`page-shell ${styles.page}`} style={pageStyle}>
      <div className={styles.stack}>
        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <span className={styles.brandTag}>{siteMeta.category}</span>
            <strong className={styles.brandName}>{siteMeta.title}</strong>
          </div>

          <nav className={styles.navLinks} aria-label="Navegacion de restaurante">
            <a href="#menu">Menu</a>
            <a href="#ritmo">Ritmo</a>
            <a href="#reservas">Reservas</a>
          </nav>

          <div className={styles.topbarActions}>
            <Link className={styles.backLink} to="/">
              Volver al catalogo
            </Link>
            <Link className={styles.sectionPill} to="/workspace?site=restaurant">
              Editar contenido
            </Link>
            <Link className={styles.nextLink} to={nextSite.route}>
              Siguiente: {nextSite.title}
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroIntro}>
            <p className={styles.eyebrow}>{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className={styles.lead}>{hero.story}</p>

            <div className={styles.heroActions}>
              <a className={styles.primaryCta} href="#menu">
                Ver menu
              </a>
              <a className={styles.secondaryCta} href="#reservas">
                Reservar mesa
              </a>
            </div>

            <div className={styles.metricRail}>
              {metrics.map((metric, index) => (
                <div
                  className={styles.metricItem}
                  key={createCompositeKey(metric.label, metric.value, index)}
                >
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <img alt={`${siteMeta.title} salon principal`} src={hero.image} />
            <div className={styles.heroOverlay} />

            <aside className={styles.heroPanel}>
              <span>Experiencia de temporada</span>
              <h2>Presenta el servicio, la sala y el tono del negocio desde el primer scroll.</h2>
              <ul>
                <li>Bloque listo para casos reales de reservas</li>
                <li>Compatible con fotos, menu y turnos propios</li>
                <li>Disenado para aterrizar una propuesta premium</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className={styles.menuSection} id="menu">
          <div className={styles.menuLead}>
            <p className={styles.eyebrow}>Carta viva</p>
            <h2>El menu se presenta como secuencia, no como grilla.</h2>
            <p>
              Cambiar de bloque no cambia solo platos: cambia el tono de la velada y la
              forma en que el usuario entiende el servicio.
            </p>
          </div>

          <div className={styles.menuTabs}>
            {menuGroups.map((group) => (
              <button
                aria-pressed={group.id === activeMenuId}
                className={`${styles.menuTab}${group.id === activeMenuId ? ` ${styles.menuTabActive}` : ""}`}
                key={group.id}
                type="button"
                onClick={() => {
                  startTransition(() => setActiveMenuId(group.id));
                }}
              >
                <span>{group.label}</span>
                <small>{group.note}</small>
              </button>
            ))}
          </div>

          {activeMenu ? (
            <div className={styles.menuFlow}>
              <div className={styles.menuNarrative}>
                <span>{activeMenu.label}</span>
                <h2>{activeMenu.note}</h2>
              </div>

              <div className={styles.menuList}>
                {activeMenu.items.map((item, index) => (
                  <article
                    className={styles.menuEntry}
                    key={createCompositeKey(item.name, item.price, index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <div className={styles.menuHeading}>
                        <h3>{item.name}</h3>
                        <strong>{item.price}</strong>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Aun no hay grupos de menu configurados para esta pagina.
            </div>
          )}
        </section>

        <section className={styles.sceneSection} id="ritmo">
          <div className={styles.sceneLead}>
            <p className={styles.eyebrow}>Ritmo de sala</p>
            <h2>Todo el sitio habla de tiempo, luz y experiencia.</h2>
          </div>

          <div className={styles.sceneLayout}>
            {scenes[0] ? (
              <figure className={styles.sceneHero}>
                <img alt={scenes[0].alt} src={scenes[0].src} />
                <figcaption>
                  <strong>{scenes[0].title}</strong>
                  <span>{scenes[0].caption}</span>
                </figcaption>
              </figure>
            ) : (
              <div className="empty-state">Agrega una primera escena en el editor.</div>
            )}

            <div className={styles.momentList}>
              {serviceMoments.map((moment, index) => (
                <article
                  className={styles.momentItem}
                  key={createCompositeKey(moment.title, index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{moment.title}</strong>
                    <p>{moment.copy}</p>
                  </div>
                </article>
              ))}
            </div>

            {scenes[1] ? (
              <figure className={styles.sceneSide}>
                <img alt={scenes[1].alt} src={scenes[1].src} />
                <figcaption>
                  <strong>{scenes[1].title}</strong>
                  <span>{scenes[1].caption}</span>
                </figcaption>
              </figure>
            ) : (
              <div className="empty-state">Agrega una segunda escena en el editor.</div>
            )}
          </div>

          <div className={styles.ambienceRail}>
            {ambienceNotes.map((note, index) => (
              <article
                className={styles.ambienceNote}
                key={createCompositeKey(note.title, index)}
              >
                <strong>{note.title}</strong>
                <p>{note.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.reservationSection} id="reservas">
          <div className={styles.reservationLead}>
            <p className={styles.eyebrow}>Reservas</p>
            <h2>Una reserva clara y corta, sin romper la atmosfera.</h2>
            <p>
              La decision ocurre en la misma pagina: eliges personas, turno y confirmas la
              intencion con una lectura elegante, no con una interfaz fria.
            </p>
          </div>

          <div className={styles.reservationBuilder}>
            <div className={styles.selectorBlock}>
              <span>Numero de personas</span>
              <div className={styles.selectorRail}>
                {guestOptions.map((option) => (
                  <button
                    aria-pressed={option === guestCount}
                    className={`${styles.selectorChip}${option === guestCount ? ` ${styles.selectorChipActive}` : ""}`}
                    key={option}
                    type="button"
                    onClick={() => setGuestCount(option)}
                  >
                    {option} pax
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.selectorBlock}>
              <span>Turno sugerido</span>
              <div className={styles.selectorRail}>
                {reservationSlots.map((slot) => (
                  <button
                    aria-pressed={slot === timeSlot}
                    className={`${styles.selectorChip}${slot === timeSlot ? ` ${styles.selectorChipActive}` : ""}`}
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.reservationSummary}>
            <div>
              <span>Reserva estimada</span>
              <strong>{reservationSummary}</strong>
            </div>
            <button className={styles.primaryCta} type="button">
              Confirmar interes
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
