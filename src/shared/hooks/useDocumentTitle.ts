import { useEffect } from "react";

const BASE_TITLE = "Catalogo de Experiencias Web";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${BASE_TITLE}`;

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
