import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import type { AppRole, AuthProfile } from "@/shared/auth/types";
import { useAuth } from "@/shared/auth/AuthContext";
import { supabase } from "@/shared/auth/supabase";
import styles from "@/features/auth/auth.module.css";

type AccessFilter = "all" | AppRole;

interface FeedbackState {
  kind: "ok" | "error" | "info";
  message: string;
}

const roleOptions: AppRole[] = ["viewer", "editor", "admin"];
const roleFilterOptions: Array<{ id: AccessFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "viewer", label: "Viewers" },
  { id: "editor", label: "Editors" },
  { id: "admin", label: "Admins" },
];

function formatRoleLabel(role: AppRole) {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "editor") {
    return "Editor";
  }

  return "Viewer";
}

function formatCreatedAt(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  try {
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminRolesPage() {
  const { isConfigured, isLoading, role, session, signOut, user } = useAuth();
  const [profiles, setProfiles] = useState<AuthProfile[]>([]);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AppRole>>({});
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AccessFilter>("all");
  const [isProfilesLoading, setIsProfilesLoading] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setIsProfilesLoading(true);
    setFeedback((current) => (current?.kind === "error" ? current : null));

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setFeedback({
        kind: "error",
        message:
          "No se pudo cargar la lista de accesos. Vuelve a ejecutar roles.sql para aplicar las politicas admin.",
      });
      setProfiles([]);
      setRoleDrafts({});
      setIsProfilesLoading(false);
      return;
    }

    const nextProfiles = (data ?? []) as AuthProfile[];
    setProfiles(nextProfiles);
    setRoleDrafts(
      Object.fromEntries(nextProfiles.map((profile) => [profile.id, profile.role]))
    );
    setIsProfilesLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase || !session || role !== "admin") {
      return;
    }

    void loadProfiles();
  }, [loadProfiles, role, session]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesFilter = filter === "all" || profile.role === filter;
      const matchesSearch = !query || (profile.email ?? "").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, profiles, search]);

  const summary = useMemo(() => {
    return profiles.reduce(
      (accumulator, profile) => {
        accumulator.total += 1;
        accumulator[profile.role] += 1;
        return accumulator;
      },
      { total: 0, viewer: 0, editor: 0, admin: 0 } as Record<"total" | AppRole, number>
    );
  }, [profiles]);

  async function handleSaveRole(profile: AuthProfile) {
    if (!supabase) {
      return;
    }

    const nextRole = roleDrafts[profile.id] ?? profile.role;

    if (nextRole === profile.role) {
      setFeedback({
        kind: "info",
        message: `No hubo cambios para ${profile.email ?? "esta cuenta"}.`,
      });
      return;
    }

    setSavingProfileId(profile.id);
    setFeedback(null);

    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", profile.id);

    if (error) {
      setFeedback({
        kind: "error",
        message: `No se pudo actualizar el rol de ${profile.email ?? "esta cuenta"}.`,
      });
      setSavingProfileId(null);
      return;
    }

    setProfiles((current) =>
      current.map((item) => (item.id === profile.id ? { ...item, role: nextRole } : item))
    );
    setFeedback({
      kind: "ok",
      message: `${profile.email ?? "La cuenta"} ahora tiene rol ${formatRoleLabel(nextRole)}.`,
    });
    setSavingProfileId(null);
  }

  if (!isConfigured) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.shell}>
          <header className="topbar">
            <Link className="topbar-link" to="/workspace">
              Volver al workspace
            </Link>
          </header>

          <section className={`section-card ${styles.hero}`}>
            <span className="surface-badge">Administracion de accesos</span>
            <h1>Falta conectar Supabase antes de administrar roles.</h1>
            <p>
              Esta pagina solo funciona cuando el proyecto ya tiene configuradas las variables
              de Supabase en local y en produccion.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <section className={`section-card ${styles.hero}`}>
          <span className="surface-badge">Administracion de accesos</span>
          <h1>Validando tu sesion admin.</h1>
          <p>Estamos comprobando tu cuenta antes de abrir la consola de roles.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return <Navigate replace to="/workspace" />;
  }

  if (role !== "admin") {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.shell}>
          <header className="topbar">
            <Link className="topbar-link" to="/workspace">
              Volver al workspace
            </Link>
          </header>

          <section className={styles.panelGrid}>
            <article className={styles.card}>
              <span className="surface-badge">Acceso denegado</span>
              <h1>Solo un admin puede cambiar roles desde aqui.</h1>
              <p>
                Tu cuenta actual no tiene permisos para ver todas las personas ni para promover
                accesos dentro del editor.
              </p>
            </article>

            <article className={styles.card}>
              <p className="eyebrow">Que hacer ahora</p>
              <p>
                Pide a un administrador que te suba a <code>admin</code> desde esta consola o
                desde Supabase.
              </p>
            </article>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={`page-shell ${styles.page}`}>
      <div className={styles.shell}>
        <header className="topbar">
          <Link className="topbar-link" to="/workspace">
            Volver al workspace
          </Link>

          <div className="topbar-meta">
            <span className="topbar-label">Admin de accesos</span>
            <button className="topbar-link" type="button" onClick={() => void loadProfiles()}>
              Refrescar
            </button>
            <button className="topbar-link is-strong" type="button" onClick={() => void signOut()}>
              Cerrar sesion
            </button>
          </div>
        </header>

        <section className={`section-card ${styles.hero}`}>
          <div className={styles.adminHeroGrid}>
            <div className={styles.adminHeroCopy}>
              <span className="surface-badge">Panel separado de administracion</span>
              <h1>Gestiona quien puede editar sin volver a entrar a Supabase.</h1>
              <p>
                Las cuentas nuevas siguen naciendo como <strong>viewer</strong>. Desde aqui las
                puedes subir a <strong>editor</strong> o <strong>admin</strong> en segundos.
              </p>
            </div>

            <div className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <span>Total</span>
                <strong>{summary.total}</strong>
                <p>Cuentas registradas</p>
              </article>
              <article className={styles.summaryCard}>
                <span>Viewers</span>
                <strong>{summary.viewer}</strong>
                <p>Aun sin acceso al editor</p>
              </article>
              <article className={styles.summaryCard}>
                <span>Editors</span>
                <strong>{summary.editor}</strong>
                <p>Ya pueden editar</p>
              </article>
              <article className={styles.summaryCard}>
                <span>Admins</span>
                <strong>{summary.admin}</strong>
                <p>Gestionan permisos</p>
              </article>
            </div>
          </div>
        </section>

        <section className={`section-card ${styles.adminPanel}`}>
          <div className={styles.adminToolbar}>
            <label className={styles.searchField}>
              <span>Buscar por email</span>
              <input
                type="text"
                placeholder="correo@empresa.com"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className={styles.filterRail}>
              {roleFilterOptions.map((option) => (
                <button
                  key={option.id}
                  aria-pressed={filter === option.id}
                  className={`${styles.filterButton}${filter === option.id ? ` ${styles.filterButtonActive}` : ""}`}
                  type="button"
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.adminHelpGrid}>
              <article className={styles.metaItem}>
                <span>Viewer</span>
                <strong>Puede tener cuenta, pero no entra al editor.</strong>
              </article>
              <article className={styles.metaItem}>
                <span>Editor</span>
                <strong>Ya puede usar el workspace y editar contenido.</strong>
              </article>
              <article className={styles.metaItem}>
                <span>Admin</span>
                <strong>Puede editar y tambien administrar otros accesos.</strong>
              </article>
            </div>
          </div>

          {feedback ? (
            <div
              className={
                feedback.kind === "error"
                  ? styles.statusError
                  : feedback.kind === "info"
                  ? styles.statusInfo
                  : styles.statusOk
              }
            >
              {feedback.message}
            </div>
          ) : null}

          <section className={styles.userList}>
            {isProfilesLoading ? (
              <div className={styles.emptyState}>Cargando lista de accesos...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className={styles.emptyState}>No hay resultados para ese filtro.</div>
            ) : (
              filteredProfiles.map((profile) => {
                const draftRole = roleDrafts[profile.id] ?? profile.role;
                const isSelf = profile.id === user?.id;
                const hasPendingChange = draftRole !== profile.role;

                return (
                  <article className={styles.userRow} key={profile.id}>
                    <div className={styles.userRowMain}>
                      <div className={styles.userRowIdentity}>
                        <strong>{profile.email ?? "Sin email"}</strong>
                        <div className={styles.userRowMeta}>
                          <span>Rol actual: {formatRoleLabel(profile.role)}</span>
                          <span>Creado: {formatCreatedAt(profile.created_at)}</span>
                          {isSelf ? <span>Tu cuenta admin</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className={styles.userRowControls}>
                      <div className={styles.roleSwitch}>
                        {roleOptions.map((option) => (
                          <button
                            key={option}
                            aria-pressed={draftRole === option}
                            className={`${styles.roleSwitchButton}${draftRole === option ? ` ${styles.roleSwitchButtonActive}` : ""}`}
                            disabled={isSelf}
                            type="button"
                            onClick={() =>
                              setRoleDrafts((current) => ({ ...current, [profile.id]: option }))
                            }
                          >
                            {formatRoleLabel(option)}
                          </button>
                        ))}
                      </div>

                      <button
                        className="button-primary"
                        disabled={isSelf || !hasPendingChange || savingProfileId === profile.id}
                        type="button"
                        onClick={() => void handleSaveRole(profile)}
                      >
                        {savingProfileId === profile.id ? "Guardando..." : "Aplicar rol"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
