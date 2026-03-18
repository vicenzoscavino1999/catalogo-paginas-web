import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthContext";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import { useMvpContent } from "@/shared/content/MvpContentContext";
import type { CatalogContent, MvpContent, SiteMeta } from "@/shared/content/contentTypes";
import type { CSSProperties } from "react";
import {
  validateContentDraft,
  validateSiteMeta,
  type SiteMetaValidationResult,
  type SiteMetaField,
} from "@/features/workspace/workspaceValidation";
import type { SiteKey } from "@/shared/types/site";
import styles from "@/features/workspace/workspace.module.css";

type EditorTab = Exclude<keyof MvpContent, "sites">;
type EditableSiteKey = SiteKey;
type PreviewDevice = "desktop" | "tablet" | "tabletLandscape" | "mobile";
type PreviewZoom = "fit" | "focus" | "detail";
type PathSegment = string | number;

interface GuidedTextField {
  id: string;
  path: PathSegment[];
  label: string;
  value: string;
  multiline: boolean;
}

interface GuidedContentEntry {
  id: string;
  title: string;
  summary: string;
  fields: GuidedTextField[];
}

interface GuidedContentGroup {
  id: string;
  title: string;
  summary: string;
  fieldCount: number;
  entries: GuidedContentEntry[];
}

const siteTabs: EditorTab[] = [
  "catalog",
  "restaurant",
  "studio",
  "shop",
  "tablecor",
  "travel",
  "moto",
];

const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
const previewDevices: Array<{ id: PreviewDevice; label: string }> = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "tabletLandscape", label: "Tablet horizontal" },
  { id: "mobile", label: "Mobile" },
];
const previewZoomLevels: Array<{ id: PreviewZoom; label: string; scale: number }> = [
  { id: "fit", label: "Ajustar", scale: 1 },
  { id: "focus", label: "110%", scale: 1.1 },
  { id: "detail", label: "125%", scale: 1.25 },
];
const AUTO_GUIDED_GROUP = "__auto__";
const guidedGroupLabels: Record<string, string> = {
  hero: "Hero principal",
  metrics: "Metricas",
  guestOptions: "Opciones de invitados",
  reservationSlots: "Horarios",
  menuGroups: "Menu",
  ambienceNotes: "Ambiente",
  scenes: "Escenas",
  serviceMoments: "Momentos de servicio",
  disciplines: "Disciplinas",
  caseStudies: "Casos",
  workflow: "Proceso",
  collections: "Colecciones",
  products: "Productos",
  benefits: "Beneficios",
  families: "Familias",
  surfaces: "Superficies",
  programs: "Programas",
  processSteps: "Proceso productivo",
  cutPlans: "Planes de corte",
  machines: "Maquinas",
  productionModes: "Modos de produccion",
  specs: "Especificaciones",
  serviceSteps: "Pasos de servicio",
  sampleFormats: "Formatos",
  projectSpeeds: "Velocidades",
  destinations: "Destinos",
  inclusions: "Incluye",
  models: "Modelos",
  useCases: "Casos de uso",
  showroomShots: "Galeria",
  riders: "Testimonios",
  pillars: "Pilares",
  foundation: "Base del sistema",
};
const guidedFieldLabels: Record<string, string> = {
  badge: "Badge",
  eyebrow: "Etiqueta superior",
  title: "Titulo",
  story: "Texto principal",
  noteTitle: "Titulo del bloque",
  noteCopy: "Texto del bloque",
  copy: "Texto",
  summary: "Resumen",
  description: "Descripcion",
  headline: "Titular",
  label: "Etiqueta",
  name: "Nombre",
  focus: "Foco",
  sector: "Sector",
  result: "Resultado",
  value: "Valor",
  deliverables: "Entregables",
  items: "Items",
  menuGroups: "Grupo",
  note: "Nota",
  caption: "Texto auxiliar",
  collection: "Coleccion",
  badgeLabel: "Badge",
  benefits: "Beneficios",
  applications: "Aplicaciones",
  furniture: "Mobiliario",
  blend: "Combinacion",
  highlights: "Highlights",
  itinerary: "Itinerario",
  useCase: "Uso ideal",
  tech: "Tecnologia",
  quote: "Testimonio",
  family: "Familia",
  finish: "Acabado",
  thickness: "Espesor",
  base: "Base",
  machine: "Maquina",
  cadence: "Cadencia",
  leadTime: "Lead time",
  commercialOutput: "Salida comercial",
  bestFor: "Ideal para",
  shiftOutput: "Produccion por turno",
  precision: "Precision",
  signal: "Senal",
  season: "Temporada",
};
const blockedGuidedFieldKeys = new Set([
  "id",
  "src",
  "image",
  "accent",
  "glow",
  "photo",
  "photoAlt",
  "photoNote",
  "route",
  "slug",
  "modelId",
  "programId",
  "cutPlanId",
  "surfaceIds",
  "machineIds",
  "base",
  "code",
  "order",
  "tone",
  "x",
  "y",
  "w",
  "h",
  "alt",
]);

function isEditorTab(value: string | null): value is EditorTab {
  return (
    value === "catalog" ||
    value === "restaurant" ||
    value === "studio" ||
    value === "shop" ||
    value === "tablecor" ||
    value === "travel" ||
    value === "moto"
  );
}

function isSiteKey(value: EditorTab): value is EditableSiteKey {
  return value !== "catalog";
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSafeAccentColor(value: string) {
  return hexColorPattern.test(value) ? value : "#1d2b43";
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatGuidedGroupTitle(key: string) {
  return guidedGroupLabels[key] ?? humanizeKey(key);
}

function formatGuidedFieldTitle(key: string) {
  return guidedFieldLabels[key] ?? humanizeKey(key);
}

function formatEditableCount(count: number) {
  return count === 1 ? "1 texto editable" : `${count} textos editables`;
}

function isAssetLikeString(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return (
    /^#(?:[0-9a-fA-F]{6})$/.test(trimmed) ||
    trimmed.startsWith("/") ||
    /^https?:\/\//i.test(trimmed) ||
    /\.(png|jpe?g|webp|svg|avif|gif)$/i.test(trimmed)
  );
}

function shouldSkipGuidedField(key: string, value: string) {
  return blockedGuidedFieldKeys.has(key) || isAssetLikeString(value);
}

function buildGuidedFieldLabel(path: PathSegment[]) {
  const parts: string[] = [];

  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];

    if (typeof segment !== "string") {
      continue;
    }

    const next = path[index + 1];

    if (typeof next === "number") {
      parts.push(`${formatGuidedFieldTitle(segment)} ${next + 1}`);
      index += 1;
      continue;
    }

    parts.push(formatGuidedFieldTitle(segment));
  }

  return parts.join(" / ");
}

function collectGuidedFields(
  value: unknown,
  fullPath: PathSegment[],
  labelPath: PathSegment[]
): GuidedTextField[] {
  if (typeof value === "string") {
    const lastNamedSegment = [...fullPath]
      .reverse()
      .find((segment): segment is string => typeof segment === "string");

    if (!lastNamedSegment || shouldSkipGuidedField(lastNamedSegment, value)) {
      return [];
    }

    return [
      {
        id: fullPath.map((segment) => String(segment)).join("-"),
        path: fullPath,
        label: buildGuidedFieldLabel(labelPath),
        value,
        multiline: value.length > 92 || value.includes("\n"),
      },
    ];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectGuidedFields(item, [...fullPath, index], [...labelPath, index])
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      collectGuidedFields(child, [...fullPath, key], [...labelPath, key])
    );
  }

  return [];
}

function describeGuidedEntry(
  value: Record<string, unknown>,
  fallback: string,
  index: number
) {
  const candidates = [
    value.title,
    value.name,
    value.label,
    value.headline,
    value.code,
    value.order,
    value.season,
  ];
  const headline = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0
  );

  return headline ?? `${fallback} ${index + 1}`;
}

function buildGuidedContentGroups(
  value: Record<string, unknown>,
  activeTab: EditorTab
): GuidedContentGroup[] {
  const excludedCatalogKeys =
    activeTab === "catalog"
      ? new Set(["badge", "title", "story", "noteTitle", "noteCopy"])
      : new Set<string>();

  return Object.entries(value).flatMap(([key, groupValue]) => {
    if (excludedCatalogKeys.has(key)) {
      return [];
    }

    const groupTitle = formatGuidedGroupTitle(key);

    if (typeof groupValue === "string") {
      if (shouldSkipGuidedField(key, groupValue)) {
        return [];
      }

      const fields: GuidedTextField[] = [
        {
          id: key,
          path: [key],
          label: formatGuidedFieldTitle(key),
          value: groupValue,
          multiline: groupValue.length > 92 || groupValue.includes("\n"),
        },
      ];

      return [
        {
          id: key,
          title: groupTitle,
          summary: formatEditableCount(fields.length),
          fieldCount: fields.length,
          entries: [
            {
              id: key,
              title: groupTitle,
              summary: formatEditableCount(fields.length),
              fields,
            },
          ],
        },
      ];
    }

    if (Array.isArray(groupValue)) {
      if (groupValue.length === 0) {
        return [];
      }

      if (groupValue.every((item) => typeof item === "string")) {
        const fields = groupValue.flatMap((item, index) => {
          if (typeof item !== "string" || shouldSkipGuidedField(key, item)) {
            return [];
          }

          return [
            {
              id: `${key}-${index}`,
              path: [key, index],
              label: `${formatGuidedFieldTitle(key)} ${index + 1}`,
              value: item,
              multiline: item.length > 92 || item.includes("\n"),
            },
          ];
        });

        if (!fields.length) {
          return [];
        }

        return [
          {
            id: key,
            title: groupTitle,
            summary: formatEditableCount(fields.length),
            fieldCount: fields.length,
            entries: [
              {
                id: key,
                title: groupTitle,
                summary: formatEditableCount(fields.length),
                fields,
              },
            ],
          },
        ];
      }

      const entries = groupValue.flatMap((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return [];
        }

        const fields = collectGuidedFields(item, [key, index], []);

        if (!fields.length) {
          return [];
        }

        return [
          {
            id: `${key}-${index}`,
            title: describeGuidedEntry(item, groupTitle, index),
            summary: formatEditableCount(fields.length),
            fields,
          },
        ];
      });

      if (!entries.length) {
        return [];
      }

      const fieldCount = entries.reduce((total, entry) => total + entry.fields.length, 0);

      return [
        {
          id: key,
          title: groupTitle,
          summary:
            entries.length === 1
              ? formatEditableCount(fieldCount)
              : `${entries.length} bloques / ${formatEditableCount(fieldCount)}`,
          fieldCount,
          entries,
        },
      ];
    }

    if (groupValue && typeof groupValue === "object") {
      const fields = collectGuidedFields(groupValue, [key], []);

      if (!fields.length) {
        return [];
      }

      return [
        {
          id: key,
          title: groupTitle,
          summary: formatEditableCount(fields.length),
          fieldCount: fields.length,
          entries: [
            {
              id: key,
              title: groupTitle,
              summary: formatEditableCount(fields.length),
              fields,
            },
          ],
        },
      ];
    }

    return [];
  });
}

function setValueAtPath<T>(value: T, path: PathSegment[], nextValue: string): T {
  if (path.length === 0) {
    return nextValue as T;
  }

  const [current, ...rest] = path;

  if (Array.isArray(value) && typeof current === "number") {
    const nextArray = [...value];
    nextArray[current] = setValueAtPath(nextArray[current], rest, nextValue);
    return nextArray as T;
  }

  if (value && typeof value === "object" && typeof current === "string") {
    return {
      ...(value as Record<string, unknown>),
      [current]: setValueAtPath((value as Record<string, unknown>)[current], rest, nextValue),
    } as T;
  }

  return value;
}

interface FeedbackState {
  kind: "ok" | "error";
  message: string;
}

const emptyMetaValidation: SiteMetaValidationResult = {
  errors: [],
  fieldErrors: {},
};
const PREVIEW_STORAGE_KEY = "catalogo-webs:mvp-preview:workspace-live";

function writePreviewContent(value: MvpContent) {
  try {
    window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore preview storage failures and keep the editor usable.
  }
}

function removePreviewContent() {
  try {
    window.localStorage.removeItem(PREVIEW_STORAGE_KEY);
  } catch {
    // Ignore preview cleanup failures.
  }
}

function replacePreviewSection<K extends Exclude<keyof MvpContent, "sites">>(
  value: MvpContent,
  key: K,
  section: MvpContent[K]
) {
  return {
    ...value,
    [key]: section,
  } as MvpContent;
}

export function WorkspacePage() {
  const { role } = useAuth();
  const { content, saveContentSection, resetContentSection, resetAllContent, getSiteByKey } =
    useMvpContent();
  const defaults = useMemo(() => createDefaultMvpContent(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("site");
  const activeTab: EditorTab = isEditorTab(requestedTab) ? requestedTab : "catalog";
  const [jsonDraft, setJsonDraft] = useState(() => formatJson(content[activeTab]));
  const [metaDraft, setMetaDraft] = useState<SiteMeta | null>(
    isSiteKey(activeTab) ? content.sites[activeTab] : null
  );
  const [catalogDraft, setCatalogDraft] = useState<CatalogContent | null>(
    activeTab === "catalog" ? content.catalog : null
  );
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isAdvancedEditorOpen, setIsAdvancedEditorOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>("fit");
  const [openGuidedGroup, setOpenGuidedGroup] = useState<string | null>(AUTO_GUIDED_GROUP);

  useEffect(() => {
    if (isEditorTab(requestedTab)) {
      return;
    }

    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.set("site", activeTab);
      return nextParams;
    });
  }, [activeTab, requestedTab, setSearchParams]);

  useEffect(() => {
    setJsonDraft(formatJson(content[activeTab]));
    setMetaDraft(isSiteKey(activeTab) ? content.sites[activeTab] : null);
    setCatalogDraft(activeTab === "catalog" ? content.catalog : null);
  }, [activeTab, content]);

  useEffect(() => {
    setFeedback(null);
    setShowValidation(false);
    setIsAdvancedEditorOpen(false);
    setPreviewDevice("desktop");
    setPreviewZoom("fit");
    setOpenGuidedGroup(AUTO_GUIDED_GROUP);
  }, [activeTab]);

  const activeLabel = isSiteKey(activeTab) ? getSiteByKey(activeTab).title : "Catalogo";
  const contentValidation = useMemo(
    () => validateContentDraft(activeTab, jsonDraft),
    [activeTab, jsonDraft]
  );
  const metaValidation = useMemo(() => {
    if (!isSiteKey(activeTab) || !metaDraft) {
      return emptyMetaValidation;
    }

    return validateSiteMeta(metaDraft);
  }, [activeTab, metaDraft]);
  const activeRoute = activeTab === "catalog" ? "/" : `/${activeTab}`;
  const previewUrl = `${activeRoute}?previewKey=${PREVIEW_STORAGE_KEY}&previewMode=workspace`;
  const activeCatalogDraft =
    activeTab === "catalog"
      ? (
          contentValidation.errors.length === 0
            ? (contentValidation.parsed as CatalogContent | undefined)
            : undefined
        ) ?? catalogDraft ?? content.catalog
      : null;
  const guideSteps = [
    {
      index: "01",
      title: "Elige una vista",
      copy: "Selecciona Catalogo o una demo arriba para decidir que parte del sistema quieres editar.",
    },
    {
      index: "02",
      title: "Edita en modo guiado",
      copy: "Usa el panel de la izquierda para cambiar lo visible sin perderte dentro del JSON.",
    },
    {
      index: "03",
      title: "Usa JSON solo si hace falta",
      copy: "La derecha sirve para listas, bloques internos o estructuras completas mas avanzadas.",
    },
    {
      index: "04",
      title: "Guarda y abre la vista",
      copy: "Cuando guardas, el cambio se persiste en local y lo puedes revisar al instante en la pagina.",
    },
  ];
  const guidedIntro =
    activeTab === "catalog"
      ? {
          title: "Editas la portada general del sistema",
          copy:
            "Aqui cambias el mensaje principal de la home, el badge superior y el texto que explica el modo editable. Es la capa que presenta todo el proyecto.",
          scope: "Impacta la portada, la explicacion del sistema y los mensajes base del catalogo.",
          highlights: [
            "Afecta la portada del catalogo",
            "Afecta la seccion del sistema",
            "El JSON de la derecha sirve para pilares y bloques largos",
          ],
        }
      : {
          title: `Editas la ficha base de ${activeLabel}`,
          copy:
            "Este panel cambia lo que se ve en el catalogo: nombre, industria, resumen, descripcion y color acento. El contenido interno de la pagina vive en el JSON de la derecha.",
          scope: "Impacta las tarjetas, el dossier, los acentos y el resumen de la demo.",
          highlights: [
            "Afecta la tarjeta del catalogo",
            "Afecta topbar, dossier y resumenes",
            "El JSON de la derecha sirve para secciones internas de la demo",
          ],
        };
  const editingGuide =
    activeTab === "catalog"
      ? [
          {
            step: "Paso 1",
            title: "Edita el mensaje de la home",
            copy: "Cambia badge, titulo y texto principal sin entrar todavia al JSON.",
          },
          {
            step: "Paso 2",
            title: "Ajusta el bloque editable",
            copy: "Define como se presenta el modo de trabajo local dentro del catalogo.",
          },
          {
            step: "Paso 3",
            title: "Guarda y revisa",
            copy: "Abre la portada para confirmar tono, jerarquia y lectura real.",
          },
        ]
      : [
          {
            step: "Paso 1",
            title: "Ajusta la ficha visible",
            copy: "Nombre, industria y resumen controlan lo que el cliente ve primero.",
          },
          {
            step: "Paso 2",
            title: "Refina el color y el relato",
            copy: "El acento y la descripcion afinan la presencia de la demo dentro del catalogo.",
          },
          {
            step: "Paso 3",
            title: "Entra al detalle con JSON",
            copy: "Usa el panel derecho para productos, secciones, destinos, modelos o listas.",
          },
        ];
  const advancedEditorNotes = [
    {
      step: "01",
      title: "Panel izquierdo primero",
      copy: "Empieza por el modo guiado cuando quieras cambiar lo visible sin tocar estructura.",
    },
    {
      step: "02",
      title: "JSON solo para bloques complejos",
      copy: "Aqui editas listas, modulos internos, metricas o secciones completas de la pagina.",
    },
    {
      step: "03",
      title: "Guardar, revisar y ajustar",
      copy: "Guarda, abre la vista actual y vuelve si necesitas pulir el contenido.",
    },
  ];
  const advancedEditorHighlights = [
    {
      label: "Puedes cambiar",
      title: "Textos, numeros y listas",
      copy: "Aqui editas nombres, mensajes, precios, metricas, productos, escenas o destinos.",
    },
    {
      label: "Mejor no tocar",
      title: "La forma del bloque",
      copy: "Intenta conservar llaves, corchetes, comas y comillas si no necesitas reorganizar algo.",
    },
  ];
  const advancedEditorSafetyTips = [
    "Cambia primero lo que esta entre comillas.",
    "Si ves [ ] estas dentro de una lista de items.",
    "Si aparece un error al guardar, revisa la ultima llave o coma que moviste.",
  ];
  const editingLanes =
    activeTab === "catalog"
      ? [
          {
            label: "Izquierda",
            title: "Modo guiado",
            copy: "Edita titulares, mensajes base y bloques visibles del catalogo sin tocar estructura.",
          },
          {
            label: "Derecha",
            title: "Editor JSON",
            copy: "Ajusta pilares, foundation o cualquier estructura larga cuando ya necesites detalle.",
          },
        ]
      : [
          {
            label: "Izquierda",
            title: "Ficha visible",
            copy: "Controla nombre, industria, resumen, tags y color acento de la demo activa.",
          },
          {
            label: "Derecha",
            title: "Contenido interno",
            copy: "Edita listas, productos, escenas, destinos o bloques completos de la pagina real.",
          },
        ];
  const guidedContentSource = useMemo<Record<string, unknown>>(() => {
    if (activeTab === "catalog") {
      return (activeCatalogDraft ?? content.catalog) as unknown as Record<string, unknown>;
    }

    return (
      ((contentValidation.errors.length === 0 ? contentValidation.parsed : undefined) ??
        content[activeTab]) as unknown as Record<string, unknown>
    );
  }, [
    activeCatalogDraft,
    activeTab,
    content,
    contentValidation.errors.length,
    contentValidation.parsed,
  ]);
  const guidedContentGroups = useMemo(
    () => buildGuidedContentGroups(guidedContentSource, activeTab),
    [activeTab, guidedContentSource]
  );
  const resolvedOpenGuidedGroup =
    openGuidedGroup === AUTO_GUIDED_GROUP ? guidedContentGroups[0]?.id ?? null : openGuidedGroup;
  const previewContent = useMemo<MvpContent>(() => {
    let nextContent: MvpContent = {
      ...content,
      sites: {
        ...content.sites,
      },
    };

    if (activeTab === "catalog") {
      return replacePreviewSection(
        nextContent,
        "catalog",
        (contentValidation.errors.length === 0
          ? (contentValidation.parsed as CatalogContent | undefined)
          : undefined) ??
          catalogDraft ??
          content.catalog
      );
    }

    if (isSiteKey(activeTab)) {
      nextContent.sites[activeTab] = metaDraft
        ? {
            ...metaDraft,
            tags: [...metaDraft.tags],
          }
        : content.sites[activeTab];

      nextContent = replacePreviewSection(
        nextContent,
        activeTab,
        ((contentValidation.errors.length === 0 ? contentValidation.parsed : undefined) ??
          content[activeTab]) as MvpContent[typeof activeTab]
      );
    }

    return nextContent;
  }, [activeTab, catalogDraft, content, contentValidation.errors.length, contentValidation.parsed, metaDraft]);
  const previewStatusCopy =
    contentValidation.errors.length > 0
      ? "La vista previa sigue mostrando el ultimo bloque valido mientras corriges el editor avanzado."
      : "La vista previa se actualiza al instante con tus cambios guiados y con el JSON valido.";
  const previewViewportClassName = {
    desktop: styles.previewFrameViewportDesktop,
    tablet: styles.previewFrameViewportTablet,
    tabletLandscape: styles.previewFrameViewportTabletLandscape,
    mobile: styles.previewFrameViewportMobile,
  }[previewDevice];
  const previewStageClassName = {
    desktop: styles.previewFrameStageDesktop,
    tablet: styles.previewFrameStageTablet,
    tabletLandscape: styles.previewFrameStageTabletLandscape,
    mobile: styles.previewFrameStageMobile,
  }[previewDevice];
  const previewZoomScale = previewZoomLevels.find((item) => item.id === previewZoom)?.scale ?? 1;
  const previewStageMetrics = (() => {
    if (previewDevice === "desktop") {
      return {
        width: previewZoom === "fit" ? "100%" : `${Math.round(previewZoomScale * 100)}%`,
        minHeight: `${Math.round(760 * previewZoomScale)}px`,
      };
    }

    if (previewDevice === "tablet") {
      return {
        width: `${Math.round(834 * previewZoomScale)}px`,
        minHeight: `${Math.round(1040 * previewZoomScale)}px`,
      };
    }

    if (previewDevice === "tabletLandscape") {
      return {
        width: `${Math.round(1180 * previewZoomScale)}px`,
        minHeight: `${Math.round(860 * previewZoomScale)}px`,
      };
    }

    return {
      width: `${Math.round(390 * previewZoomScale)}px`,
      minHeight: `${Math.round(844 * previewZoomScale)}px`,
    };
  })();
  const previewStageStyle: CSSProperties = {
    width: previewStageMetrics.width,
    minHeight: previewStageMetrics.minHeight,
  };
  const previewFrameStyle: CSSProperties = {
    minHeight: previewStageMetrics.minHeight,
  };

  useEffect(() => {
    writePreviewContent(previewContent);
  }, [previewContent]);

  useEffect(() => () => removePreviewContent(), []);

  function handleTabChange(nextTab: EditorTab) {
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.set("site", nextTab);
      return nextParams;
    });
  }

  function getMetaFieldError(field: SiteMetaField) {
    return showValidation ? metaValidation.fieldErrors[field] : undefined;
  }

  function handleCatalogFieldChange<K extends keyof CatalogContent>(
    field: K,
    value: CatalogContent[K]
  ) {
    if (activeTab !== "catalog") {
      return;
    }

    const nextDraft = {
      ...(activeCatalogDraft ?? content.catalog),
      [field]: value,
    };

    setCatalogDraft(nextDraft);
    setJsonDraft(formatJson(nextDraft));
    setFeedback(null);
    setShowValidation(false);
  }

  function handleGuidedContentFieldChange(path: PathSegment[], value: string) {
    const currentSection =
      activeTab === "catalog"
        ? (activeCatalogDraft ?? content.catalog)
        : (((contentValidation.errors.length === 0 ? contentValidation.parsed : undefined) ??
            content[activeTab]) as MvpContent[typeof activeTab]);
    const nextSection = setValueAtPath(currentSection, path, value);

    if (activeTab === "catalog") {
      setCatalogDraft(nextSection as CatalogContent);
    }

    setJsonDraft(formatJson(nextSection));
    setFeedback(null);
    setShowValidation(false);
  }

  function handleSave() {
    setShowValidation(true);

    if (contentValidation.errors.length > 0) {
      setIsAdvancedEditorOpen(true);
      setFeedback({
        kind: "error",
        message: `Corrige el contenido JSON de ${activeLabel} antes de guardar.`,
      });
      return;
    }

    let nextSiteMeta = metaDraft;

    if (isSiteKey(activeTab) && metaDraft) {
      if (metaValidation.errors.length > 0) {
        setFeedback({
          kind: "error",
          message: `Corrige la ficha base de ${activeLabel} antes de guardar.`,
        });
        return;
      }

      nextSiteMeta = {
        ...metaDraft,
        tags: [...metaDraft.tags],
      };
    }

    if (!contentValidation.parsed) {
      setFeedback({
        kind: "error",
        message: "No se pudo preparar el contenido para guardar.",
      });
      return;
    }

    saveContentSection(activeTab, contentValidation.parsed);

    if (isSiteKey(activeTab) && nextSiteMeta) {
      saveContentSection("sites", {
        ...content.sites,
        [activeTab]: nextSiteMeta,
      });
    }

    setFeedback({
      kind: "ok",
      message: `Se guardo el contenido local de ${activeLabel}.`,
    });
    setShowValidation(false);
  }

  function handleResetSection() {
    resetContentSection(activeTab);

    if (isSiteKey(activeTab)) {
      saveContentSection("sites", {
        ...content.sites,
        [activeTab]: defaults.sites[activeTab],
      });
    }

    setFeedback({
      kind: "ok",
      message:
        activeTab === "catalog"
          ? "Se restauro el bloque del catalogo."
          : `Se restauro el bloque demo de ${activeLabel}.`,
    });
    setShowValidation(false);
  }

  function handleResetAll() {
    resetAllContent();
    setFeedback({
      kind: "ok",
      message: "Se restauro todo el contenido demo del MVP.",
    });
    setShowValidation(false);
  }

  return (
    <main className={`page-shell ${styles.page}`}>
      <div className="page-stack">
        <header className="topbar">
          <Link className="topbar-link" to="/">
            Volver al catalogo
          </Link>

          <div className="topbar-meta">
            <span className="topbar-label">Editor local</span>
            {role === "admin" ? (
              <Link className="topbar-link" to="/workspace/access">
                Administrar accesos
              </Link>
            ) : null}
            <button className="topbar-link is-strong" type="button" onClick={handleResetAll}>
              Restaurar todo
            </button>
          </div>
        </header>

        <section className={`section-card ${styles.hero}`}>
          <div className={styles.heroIntro}>
            <div className={styles.heroCopy}>
              <span className="surface-badge">Modo MVP sin mocks obligatorios</span>
              <h1>Reemplaza el demo por datos reales y prueba el flujo sin tocar codigo.</h1>
              <p>
                Este editor guarda el contenido en tu navegador. Puedes cambiar textos,
                metricas, catalogos, modelos, destinos o cualquier bloque de cada industria y
                ver el resultado en las paginas del MVP.
              </p>

              <div className={styles.heroActions}>
                <Link className="button-primary" to={activeRoute}>
                  Abrir vista actual
                </Link>
                <button className="button-ghost" type="button" onClick={handleResetSection}>
                  Restaurar bloque actual
                </button>
              </div>
            </div>

            <aside className={styles.heroGuidePanel}>
              <div className={styles.heroGuideHeader}>
                <p className="eyebrow">Como editar</p>
                <span className={styles.heroGuideMeta}>Vista actual: {activeLabel}</span>
              </div>
              <strong>{guidedIntro.title}</strong>
              <p>{guidedIntro.copy}</p>
              <p className={styles.heroGuideScope}>{guidedIntro.scope}</p>

              <div className={styles.heroLaneGrid}>
                {editingLanes.map((lane) => (
                  <article className={styles.heroLaneCard} key={lane.title}>
                    <span>{lane.label}</span>
                    <strong>{lane.title}</strong>
                    <p>{lane.copy}</p>
                  </article>
                ))}
              </div>

              <div className={styles.heroGuideSequence}>
                {editingGuide.map((item) => (
                  <article className={styles.heroGuideCard} key={item.title}>
                    <span>{item.step}</span>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>

              <div className={styles.heroGuideHighlights}>
                {guidedIntro.highlights.map((item) => (
                  <span className={styles.heroGuideTag} key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </aside>
          </div>

          <div className={styles.heroGuideRail}>
            {guideSteps.map((step) => (
              <article className={styles.heroGuideStep} key={step.index}>
                <small>{step.index}</small>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className={styles.tabRail} aria-label="Pestanas del editor">
            {siteTabs.map((tab) => (
              <button
                className={`${styles.tabButton}${tab === activeTab ? ` ${styles.tabButtonActive}` : ""}`}
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
              >
                {tab === "catalog" ? "Catalogo" : getSiteByKey(tab).title}
              </button>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className={styles.editorLayout}>
            <aside className={styles.metaPanel}>
              <div className={styles.panelIntro}>
                <p className="eyebrow">Edicion guiada</p>
                <h2>{activeLabel}</h2>
                <p>{guidedIntro.copy}</p>
              </div>

              <div className={styles.guideCallout}>
                <strong>{guidedIntro.title}</strong>
                <ul className={styles.guideList}>
                  {guidedIntro.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {activeTab === "catalog" && activeCatalogDraft ? (
                <div className={styles.metaGrid}>
                  <label className={styles.field}>
                    <span>Badge superior</span>
                    <input
                      type="text"
                      value={activeCatalogDraft.badge}
                      onChange={(event) => handleCatalogFieldChange("badge", event.target.value)}
                    />
                    <small className={styles.fieldHint}>
                      Aparece como cinta introductoria en la portada del catalogo.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Titulo principal</span>
                    <textarea
                      value={activeCatalogDraft.title}
                      onChange={(event) => handleCatalogFieldChange("title", event.target.value)}
                    />
                    <small className={styles.fieldHint}>
                      Es el titular grande que presenta toda la home del sistema.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Texto de apoyo</span>
                    <textarea
                      value={activeCatalogDraft.story}
                      onChange={(event) => handleCatalogFieldChange("story", event.target.value)}
                    />
                    <small className={styles.fieldHint}>
                      Parrafo corto que explica el valor general del producto.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Titulo del modo editable</span>
                    <input
                      type="text"
                      value={activeCatalogDraft.noteTitle}
                      onChange={(event) =>
                        handleCatalogFieldChange("noteTitle", event.target.value)
                      }
                    />
                    <small className={styles.fieldHint}>
                      Nombra el bloque donde explicas que el sistema se puede editar en local.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Mensaje del modo editable</span>
                    <textarea
                      value={activeCatalogDraft.noteCopy}
                      onChange={(event) =>
                        handleCatalogFieldChange("noteCopy", event.target.value)
                      }
                    />
                    <small className={styles.fieldHint}>
                      Describe en una frase breve como reemplazar el demo por datos reales.
                    </small>
                  </label>
                </div>
              ) : isSiteKey(activeTab) && metaDraft ? (
                <div className={styles.metaGrid}>
                  <label className={styles.field}>
                    <span>Titulo</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("title"))}
                      className={getMetaFieldError("title") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.title}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, title: event.target.value } : current
                        )
                      }
                    />
                    <small className={styles.fieldHint}>
                      Se ve en la tarjeta, el dossier activo y los llamados principales de la demo.
                    </small>
                    {getMetaFieldError("title") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("title")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Industria</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("category"))}
                      className={getMetaFieldError("category") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.category}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, category: event.target.value } : current
                        )
                      }
                    />
                    <small className={styles.fieldHint}>
                      Define la industria o categoria que organiza esta demo dentro del catalogo.
                    </small>
                    {getMetaFieldError("category") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("category")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Descripcion del catalogo</span>
                    <textarea
                      aria-invalid={Boolean(getMetaFieldError("description"))}
                      className={getMetaFieldError("description") ? styles.inputInvalid : ""}
                      value={metaDraft.description}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, description: event.target.value } : current
                        )
                      }
                    />
                    <small className={styles.fieldHint}>
                      Explica el enfoque visual o comercial de la demo en la portada principal.
                    </small>
                    {getMetaFieldError("description") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("description")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Resumen corto</span>
                    <textarea
                      aria-invalid={Boolean(getMetaFieldError("summary"))}
                      className={getMetaFieldError("summary") ? styles.inputInvalid : ""}
                      value={metaDraft.summary}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current ? { ...current, summary: event.target.value } : current
                        )
                      }
                    />
                    <small className={styles.fieldHint}>
                      Resumen corto que se reutiliza en tarjetas secundarias y vistas compactas.
                    </small>
                    {getMetaFieldError("summary") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("summary")}</small>
                    ) : null}
                  </label>

                  <label className={styles.field}>
                    <span>Tags del catalogo</span>
                    <input
                      aria-invalid={Boolean(getMetaFieldError("tags"))}
                      className={getMetaFieldError("tags") ? styles.inputInvalid : ""}
                      type="text"
                      value={metaDraft.tags.join(", ")}
                      onChange={(event) =>
                        setMetaDraft((current) =>
                          current
                            ? { ...current, tags: parseTags(event.target.value) }
                            : current
                        )
                      }
                    />
                    <small className={styles.fieldHint}>
                      Usa etiquetas simples para reforzar el posicionamiento de la demo.
                    </small>
                    {getMetaFieldError("tags") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("tags")}</small>
                    ) : null}
                  </label>

                  <div className={styles.field}>
                    <span>Color acento</span>
                    <div className={styles.colorRow}>
                      <input
                        aria-invalid={Boolean(getMetaFieldError("accent"))}
                        className={`${styles.colorPicker}${getMetaFieldError("accent") ? ` ${styles.inputInvalid}` : ""}`}
                        type="color"
                        value={getSafeAccentColor(metaDraft.accent)}
                        onChange={(event) =>
                          setMetaDraft((current) =>
                            current ? { ...current, accent: event.target.value } : current
                          )
                        }
                      />
                      <input
                        aria-invalid={Boolean(getMetaFieldError("accent"))}
                        className={getMetaFieldError("accent") ? styles.inputInvalid : ""}
                        type="text"
                        value={metaDraft.accent}
                        onChange={(event) =>
                          setMetaDraft((current) =>
                            current ? { ...current, accent: event.target.value } : current
                          )
                        }
                      />
                    </div>
                    <small className={styles.fieldHint}>
                      Este color pinta botones, acentos y estados destacados de la experiencia.
                    </small>
                    {getMetaFieldError("accent") ? (
                      <small className={styles.fieldError}>{getMetaFieldError("accent")}</small>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className={styles.codeNote}>
                  No hay un panel guiado disponible para esta vista. Usa el editor avanzado
                  de abajo para editar el contenido completo.
                </div>
              )}

              {guidedContentGroups.length > 0 ? (
                <section className={styles.guidedCatalog}>
                  <div className={styles.guidedCatalogHeader}>
                    <div>
                      <p className="eyebrow">Catalogo desplegable</p>
                      <strong>Mas bloques de texto para editar sin tocar JSON.</strong>
                    </div>
                    <p>
                      Abre una opcion y cambia solo esa parte visible del contenido.
                    </p>
                  </div>

                  <div className={styles.guidedCatalogList}>
                    {guidedContentGroups.map((group) => {
                      const isOpen = resolvedOpenGuidedGroup === group.id;

                      return (
                        <article className={styles.guidedCatalogItem} key={group.id}>
                          <button
                            aria-expanded={isOpen}
                            className={styles.guidedCatalogToggle}
                            type="button"
                            onClick={() =>
                              setOpenGuidedGroup((current) =>
                                (current === AUTO_GUIDED_GROUP
                                  ? resolvedOpenGuidedGroup
                                  : current) === group.id
                                  ? null
                                  : group.id
                              )
                            }
                          >
                            <span className={styles.guidedCatalogToggleCopy}>
                              <strong>{group.title}</strong>
                              <small>{group.summary}</small>
                            </span>
                            <span className={styles.guidedCatalogToggleState}>
                              {isOpen ? "Ocultar" : "Editar"}
                            </span>
                          </button>

                          {isOpen ? (
                            <div className={styles.guidedCatalogBody}>
                              {group.entries.map((entry) => (
                                <section className={styles.guidedCatalogEntry} key={entry.id}>
                                  <div className={styles.guidedCatalogEntryHeader}>
                                    <strong>{entry.title}</strong>
                                    <span>{entry.summary}</span>
                                  </div>

                                  <div className={styles.guidedCatalogFields}>
                                    {entry.fields.map((field) => (
                                      <label className={styles.field} key={field.id}>
                                        <span>{field.label}</span>
                                        {field.multiline ? (
                                          <textarea
                                            aria-label={field.label}
                                            value={field.value}
                                            onChange={(event) =>
                                              handleGuidedContentFieldChange(
                                                field.path,
                                                event.target.value
                                              )
                                            }
                                          />
                                        ) : (
                                          <input
                                            aria-label={field.label}
                                            type="text"
                                            value={field.value}
                                            onChange={(event) =>
                                              handleGuidedContentFieldChange(
                                                field.path,
                                                event.target.value
                                              )
                                            }
                                          />
                                        )}
                                      </label>
                                    ))}
                                  </div>
                                </section>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </aside>

            <section className={styles.previewPanel}>
              <div className={styles.previewPanelHeader}>
                <div className={styles.panelIntro}>
                  <p className="eyebrow">Vista en vivo</p>
                  <h2>Asi va quedando {activeLabel}</h2>
                  <p>{previewStatusCopy}</p>
                </div>

                <div className={styles.previewPanelActions}>
                  <div className={styles.previewControlStack}>
                    <div className={styles.previewControlGroup}>
                      <span className={styles.previewControlLabel}>Dispositivo</span>
                      <div
                        aria-label="Selector de dispositivo de la vista previa"
                        className={styles.previewDeviceRail}
                      >
                        {previewDevices.map((device) => (
                          <button
                            key={device.id}
                            aria-pressed={previewDevice === device.id}
                            className={`${styles.previewDeviceButton}${
                              previewDevice === device.id
                                ? ` ${styles.previewDeviceButtonActive}`
                                : ""
                            }`}
                            type="button"
                            onClick={() => setPreviewDevice(device.id)}
                          >
                            {device.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.previewControlGroup}>
                      <span className={styles.previewControlLabel}>Zoom</span>
                      <div
                        aria-label="Selector de zoom de la vista previa"
                        className={styles.previewZoomRail}
                      >
                        {previewZoomLevels.map((zoom) => (
                          <button
                            key={zoom.id}
                            aria-pressed={previewZoom === zoom.id}
                            className={`${styles.previewDeviceButton}${
                              previewZoom === zoom.id
                                ? ` ${styles.previewDeviceButtonActive}`
                                : ""
                            }`}
                            type="button"
                            onClick={() => setPreviewZoom(zoom.id)}
                          >
                            {zoom.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <a
                    className="button-ghost"
                    href={previewUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Abrir preview grande
                  </a>
                </div>
              </div>

              <div className={styles.previewFrameShell}>
                <div className={styles.previewFrameChrome}>
                  <span />
                  <span />
                  <span />
                </div>
                <div
                  className={`${styles.previewFrameViewport} ${previewViewportClassName}`}
                  data-preview-device={previewDevice}
                  data-preview-zoom={previewZoom}
                  data-testid="preview-viewport"
                >
                  <div
                    className={`${styles.previewFrameStage} ${previewStageClassName}`}
                    data-testid="preview-stage"
                    style={previewStageStyle}
                  >
                    <iframe
                      className={styles.previewFrame}
                      src={previewUrl}
                      style={previewFrameStyle}
                      title={`Vista previa de ${activeLabel}`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.jsonPanel}>
              <div className={styles.jsonPanelTop}>
                <div className={styles.panelIntro}>
                  <p className="eyebrow">Editor avanzado</p>
                  <h2>Contenido de esta pagina</h2>
                  <p>
                    Esta parte es opcional. Abrela solo si necesitas cambiar listas,
                    modulos internos o varias piezas a la vez.
                  </p>
                </div>

                <button
                  aria-controls="advanced-editor-panel"
                  aria-expanded={isAdvancedEditorOpen}
                  className={styles.toggleAdvancedButton}
                  type="button"
                  onClick={() => setIsAdvancedEditorOpen((current) => !current)}
                >
                  {isAdvancedEditorOpen ? "Ocultar editor avanzado" : "Mostrar editor avanzado"}
                </button>
              </div>

              {isAdvancedEditorOpen ? (
                <div className={styles.jsonPanelBody} id="advanced-editor-panel">
                  <div className={styles.jsonHighlightGrid}>
                    {advancedEditorHighlights.map((item) => (
                      <article className={styles.jsonHighlightCard} key={item.title}>
                        <span>{item.label}</span>
                        <strong>{item.title}</strong>
                        <p>{item.copy}</p>
                      </article>
                    ))}
                  </div>

                  <div className={styles.jsonGuide}>
                    {advancedEditorNotes.map((item) => (
                      <div className={styles.jsonGuideItem} key={item.title}>
                        <span>{item.step}</span>
                        <strong>{item.title}</strong>
                        <p>{item.copy}</p>
                      </div>
                    ))}
                  </div>

                  <section
                    className={styles.jsonEditorShell}
                    aria-label="Zona de edicion avanzada"
                  >
                    <div className={styles.jsonEditorHeader}>
                      <div className={styles.jsonEditorHeaderCopy}>
                        <span className={styles.jsonEditorLabel}>Editor de contenido</span>
                        <strong>Haz cambios puntuales sin perder la estructura general.</strong>
                      </div>
                      <span className={styles.jsonEditorHint}>
                        Consejo: cambia palabras y valores antes de tocar signos.
                      </span>
                    </div>

                    <div className={styles.jsonSafetyStrip}>
                      {advancedEditorSafetyTips.map((item) => (
                        <span className={styles.jsonSafetyChip} key={item}>
                          {item}
                        </span>
                      ))}
                    </div>

                    <textarea
                      aria-label="Contenido completo"
                      aria-invalid={showValidation && contentValidation.errors.length > 0}
                      className={`${styles.jsonArea}${
                        showValidation && contentValidation.errors.length > 0
                          ? ` ${styles.jsonAreaInvalid}`
                          : ""
                      }`}
                      spellCheck={false}
                      value={jsonDraft}
                      onChange={(event) => setJsonDraft(event.target.value)}
                    />
                  </section>

                  {showValidation && contentValidation.errors.length > 0 ? (
                    <div className={styles.fieldErrorPanel}>
                      <strong className={styles.fieldErrorTitle}>Corrige este bloque JSON</strong>
                      <ul className={styles.statusList}>
                        {contentValidation.errors.slice(0, 6).map((detail, index) => (
                          <li key={`${detail}-${index}`}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className={styles.jsonCollapsedNote} id="advanced-editor-panel">
                  El editor avanzado esta oculto. Puedes abrirlo solo cuando necesites tocar
                  listas o contenido interno mas detallado.
                </div>
              )}
            </section>

            {feedback ? (
              <div className={feedback.kind === "ok" ? styles.statusOk : styles.statusError}>
                <strong className={styles.statusTitle}>{feedback.message}</strong>
              </div>
            ) : null}

            <div className={styles.panelActions}>
              <button className="button-primary" type="button" onClick={handleSave}>
                Guardar cambios
              </button>
              <button className="button-ghost" type="button" onClick={handleResetSection}>
                Restaurar bloque
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
