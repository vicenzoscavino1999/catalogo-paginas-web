import { Link } from "react-router-dom";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import type { SiteKey } from "@/shared/types/site";

interface ExampleNavProps {
  siteKey: SiteKey;
}

export function ExampleNav({ siteKey }: ExampleNavProps) {
  const { getNextSite, getSiteByKey } = useMvpContent();
  const currentSite = getSiteByKey(siteKey);
  const nextSite = getNextSite(siteKey);

  return (
    <header className="topbar">
      <Link className="topbar-link" to="/">
        Volver al catalogo
      </Link>

      <div className="topbar-meta">
        <span className="topbar-label">{currentSite.category}</span>
        <Link className="topbar-link" to={`/workspace?site=${siteKey}`}>
          Editar contenido
        </Link>
        <Link className="topbar-link is-strong" to={nextSite.route}>
          Siguiente: {nextSite.title}
        </Link>
      </div>
    </header>
  );
}
