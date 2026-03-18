import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { WorkspacePage } from "@/features/workspace/WorkspacePage";
import { useAuth } from "@/shared/auth/AuthContext";
import styles from "@/features/auth/auth.module.css";

type AuthMode = "signin" | "signup";

export function WorkspaceAccessPage() {
  const { canAccessWorkspace, isConfigured, isLoading, profile, role, session, signIn, signOut, signUp, user } =
    useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error" | "info"; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authTitle = mode === "signin" ? "Entrar al editor" : "Crear cuenta";
  const authCopy =
    mode === "signin"
      ? "Entra con tu cuenta para abrir el workspace privado y editar con permisos reales."
      : "Puedes registrarte libremente, pero las cuentas nuevas nacen como viewer hasta que las eleves a editor o admin.";
  const roleLabel = useMemo(() => {
    if (!role) {
      return "Sin rol";
    }

    if (role === "admin") {
      return "Admin";
    }

    if (role === "editor") {
      return "Editor";
    }

    return "Viewer";
  }, [role]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const action = mode === "signin" ? signIn : signUp;
    const result = await action(email.trim(), password);

    if (result.error) {
      setFeedback({
        kind: "error",
        message: result.error,
      });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      kind: "ok",
      message:
        mode === "signin"
          ? "Sesion iniciada. Si tu rol es editor o admin, el workspace se abrira automaticamente."
          : "Cuenta creada. Si tienes confirmacion por email activa, revisa tu correo antes de entrar.",
    });
    setIsSubmitting(false);
  }

  if (!isConfigured) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.shell}>
          <header className="topbar">
            <Link className="topbar-link" to="/">
              Volver al catalogo
            </Link>
          </header>

          <section className={`section-card ${styles.hero}`}>
            <span className="surface-badge">Workspace protegido</span>
            <h1>Falta conectar Supabase antes de bloquear el editor.</h1>
            <p>
              El sistema de roles ya puede usarse, pero primero debes cargar las variables de entorno
              del proyecto y ejecutar el SQL de perfiles y roles.
            </p>
          </section>

          <section className={styles.panelGrid}>
            <article className={styles.card}>
              <p className="eyebrow">Variables requeridas</p>
              <div className={styles.codeBlock}>
                VITE_SUPABASE_URL=...
                {"\n"}
                VITE_SUPABASE_ANON_KEY=...
              </div>
              <p>
                Estas variables van en tu entorno local y tambien en Vercel para que el login funcione
                en produccion.
              </p>
            </article>

            <article className={styles.card}>
              <p className="eyebrow">SQL de roles</p>
              <p>
                Ejecuta el archivo <code>supabase/roles.sql</code> en el SQL Editor de Supabase. Ahí
                se crea la tabla <code>profiles</code>, el trigger de alta y el rol inicial
                <code>viewer</code>.
              </p>
              <div className={styles.codeBlock}>
                update public.profiles set role = 'admin' where email = 'tu-correo@dominio.com';
              </div>
            </article>
          </section>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <section className={`section-card ${styles.hero}`}>
          <span className="surface-badge">Workspace protegido</span>
          <h1>Validando acceso al editor.</h1>
          <p>Estamos revisando tu sesion y tu rol antes de abrir el workspace.</p>
        </section>
      </main>
    );
  }

  if (session && canAccessWorkspace) {
    return <WorkspacePage />;
  }

  if (session && !canAccessWorkspace) {
    return (
      <main className={`page-shell ${styles.page}`}>
        <div className={styles.shell}>
          <header className="topbar">
            <Link className="topbar-link" to="/">
              Volver al catalogo
            </Link>
            <div className="topbar-meta">
              <span className="topbar-label">Acceso actual</span>
              <button className="topbar-link is-strong" type="button" onClick={() => void signOut()}>
                Cerrar sesion
              </button>
            </div>
          </header>

          <section className={styles.panelGrid}>
            <article className={styles.card}>
              <span className="surface-badge">Workspace protegido</span>
              <h1>Tu cuenta existe, pero todavia no puede editar.</h1>
              <p>
                El registro esta abierto, pero solo los roles <strong>editor</strong> y{" "}
                <strong>admin</strong> pueden entrar al workspace.
              </p>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span>Cuenta actual</span>
                  <strong>{user?.email ?? profile?.email ?? "Sin correo"}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Rol actual</span>
                  <strong>{roleLabel}</strong>
                </div>
              </div>
            </article>

            <article className={styles.card}>
              <p className="eyebrow">Que hacer ahora</p>
              <p>
                Desde Supabase, cambia tu rol en <code>public.profiles</code> a <code>editor</code> o{" "}
                <code>admin</code>.
              </p>
              <div className={styles.codeBlock}>
                update public.profiles
                {"\n"}set role = 'editor'
                {"\n"}where email = '{user?.email ?? "tu-correo@dominio.com"}';
              </div>
              <span className={styles.roleBadge}>Rol detectado: {roleLabel}</span>
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
          <Link className="topbar-link" to="/">
            Volver al catalogo
          </Link>
        </header>

        <section className={`section-card ${styles.hero}`}>
          <span className="surface-badge">Workspace protegido</span>
          <h1>El editor ya puede abrirse solo con cuentas autorizadas.</h1>
          <p>
            El registro puede estar abierto, pero el acceso real al workspace dependera del rol que
            tenga cada usuario dentro de Supabase.
          </p>
        </section>

        <section className={styles.panelGrid}>
          <aside className={styles.infoPanel}>
            <article className={styles.card}>
              <p className="eyebrow">Reglas de acceso</p>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span>Viewer</span>
                  <strong>Puede registrarse, pero no entra al editor.</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Editor</span>
                  <strong>Puede abrir y usar el workspace.</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Admin</span>
                  <strong>Puede editar y ademas administrar roles.</strong>
                </div>
              </div>
            </article>

            <article className={styles.card}>
              <p className="eyebrow">Alta recomendada</p>
              <p>
                Las cuentas nuevas deberian nacer como <strong>viewer</strong>. Luego, desde Supabase,
                subes solo las aprobadas a <strong>editor</strong> o <strong>admin</strong>.
              </p>
              <div className={styles.codeBlock}>
                update public.profiles
                {"\n"}set role = 'admin'
                {"\n"}where email = 'tu-correo@dominio.com';
              </div>
            </article>
          </aside>

          <section className={styles.authPanel}>
            <article className={styles.card}>
              <div className={styles.tabRail}>
                <button
                  className={`${styles.tabButton}${mode === "signin" ? ` ${styles.tabButtonActive}` : ""}`}
                  type="button"
                  onClick={() => setMode("signin")}
                >
                  Entrar
                </button>
                <button
                  className={`${styles.tabButton}${mode === "signup" ? ` ${styles.tabButtonActive}` : ""}`}
                  type="button"
                  onClick={() => setMode("signup")}
                >
                  Crear cuenta
                </button>
              </div>

              <div>
                <p className="eyebrow">{mode === "signin" ? "Inicio de sesion" : "Registro"}</p>
                <h2>{authTitle}</h2>
                <p>{authCopy}</p>
              </div>

              <form className={styles.fieldGrid} onSubmit={handleSubmit}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span>Password</span>
                  <input
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                <p className={styles.hint}>
                  Si el registro queda abierto, las cuentas nuevas podran crearse solas, pero no
                  entraran al editor hasta que cambies su rol.
                </p>

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

                <div className={styles.buttonRow}>
                  <button className="button-primary" disabled={isSubmitting} type="submit">
                    {isSubmitting
                      ? "Procesando..."
                      : mode === "signin"
                      ? "Entrar al editor"
                      : "Crear cuenta"}
                  </button>
                  <button
                    className="button-ghost"
                    type="button"
                    onClick={() =>
                      setMode((current) => (current === "signin" ? "signup" : "signin"))
                    }
                  >
                    {mode === "signin" ? "Necesito una cuenta" : "Ya tengo cuenta"}
                  </button>
                </div>
              </form>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
