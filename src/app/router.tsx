import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import {
  Navigate,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

const DYNAMIC_IMPORT_RELOAD_PREFIX = "catalogo-webs:dynamic-import-reload";

function readSessionFlag(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionFlag(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore private mode or storage errors and continue with the fallback UI.
  }
}

function removeSessionFlag(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore cleanup failures for the same reason.
  }
}

function isDynamicImportFailure(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message
  );
}

function lazyRoute<T extends ComponentType<unknown>>(
  routeKey: string,
  loader: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const reloadKey = `${DYNAMIC_IMPORT_RELOAD_PREFIX}:${routeKey}`;

    try {
      const module = await loader();
      removeSessionFlag(reloadKey);
      return module;
    } catch (error) {
      if (typeof window !== "undefined" && isDynamicImportFailure(error)) {
        if (readSessionFlag(reloadKey) !== "1") {
          writeSessionFlag(reloadKey, "1");
          window.location.reload();
          return new Promise<never>(() => undefined);
        }

        removeSessionFlag(reloadKey);
      }

      throw error;
    }
  });
}

const CatalogPage = lazyRoute("catalog", () =>
  import("@/features/catalog/CatalogPage").then((module) => ({ default: module.CatalogPage }))
);
const MotoPage = lazyRoute("moto", () =>
  import("@/features/moto/MotoPage").then((module) => ({ default: module.MotoPage }))
);
const RestaurantPage = lazyRoute("restaurant", () =>
  import("@/features/restaurant/RestaurantPage").then((module) => ({
    default: module.RestaurantPage,
  }))
);
const ShopPage = lazyRoute("shop", () =>
  import("@/features/shop/ShopPage").then((module) => ({ default: module.ShopPage }))
);
const StudioPage = lazyRoute("studio", () =>
  import("@/features/studio/StudioPage").then((module) => ({ default: module.StudioPage }))
);
const TablecorPage = lazyRoute("tablecor", () =>
  import("@/features/tablecor/TablecorPage").then((module) => ({ default: module.TablecorPage }))
);
const TravelPage = lazyRoute("travel", () =>
  import("@/features/travel/TravelPage").then((module) => ({ default: module.TravelPage }))
);
const WorkspaceAccessPage = lazyRoute("workspace-access", () =>
  import("@/features/auth/WorkspaceAccessPage").then((module) => ({
    default: module.WorkspaceAccessPage,
  }))
);

function resolveRouteErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error desconocido al cargar esta experiencia.";
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const message = resolveRouteErrorMessage(error);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "linear-gradient(180deg, rgba(244, 239, 229, 1) 0%, rgba(236, 227, 213, 1) 100%)",
        color: "#18211f",
      }}
    >
      <section
        style={{
          width: "min(720px, 100%)",
          padding: "28px",
          borderRadius: "28px",
          border: "1px solid rgba(24, 33, 31, 0.1)",
          background: "rgba(255, 252, 247, 0.84)",
          boxShadow: "0 20px 48px rgba(56, 37, 23, 0.12)",
        }}
      >
        <p
          style={{
            marginBottom: "10px",
            fontFamily: '"Syne", sans-serif',
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Error de carga
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: '"Fraunces", serif',
            fontSize: "clamp(2rem, 4vw, 3.4rem)",
            lineHeight: 1,
          }}
        >
          No se pudo abrir esta demo.
        </h1>
        <p
          style={{
            marginTop: "16px",
            color: "rgba(24, 33, 31, 0.78)",
            fontSize: "1rem",
          }}
        >
          Si la aplicacion se recompilo o cambiaste de build, el navegador puede haberse quedado con
          un chunk viejo en memoria.
        </p>
        <pre
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "20px",
            background: "rgba(24, 33, 31, 0.06)",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: "0.88rem",
          }}
        >
          {message}
        </pre>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              minHeight: "46px",
              padding: "0 18px",
              borderRadius: "999px",
              border: 0,
              background: "#18211f",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            Recargar pagina
          </button>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "46px",
              padding: "0 18px",
              borderRadius: "999px",
              border: "1px solid rgba(24, 33, 31, 0.14)",
              background: "rgba(255, 255, 255, 0.72)",
              fontWeight: 800,
            }}
          >
            Volver al catalogo
          </a>
        </div>
      </section>
    </main>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>;
}

const routeErrorElement = <RouteErrorBoundary />;

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<CatalogPage />), errorElement: routeErrorElement },
  {
    path: "/workspace",
    element: withSuspense(<WorkspaceAccessPage />),
    errorElement: routeErrorElement,
  },
  { path: "/restaurant", element: withSuspense(<RestaurantPage />), errorElement: routeErrorElement },
  { path: "/studio", element: withSuspense(<StudioPage />), errorElement: routeErrorElement },
  { path: "/shop", element: withSuspense(<ShopPage />), errorElement: routeErrorElement },
  { path: "/tablecor", element: withSuspense(<TablecorPage />), errorElement: routeErrorElement },
  { path: "/travel", element: withSuspense(<TravelPage />), errorElement: routeErrorElement },
  { path: "/moto", element: withSuspense(<MotoPage />), errorElement: routeErrorElement },
  { path: "*", element: <Navigate to="/" replace /> },
]);
