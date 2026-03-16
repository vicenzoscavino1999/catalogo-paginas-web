import { useLayoutEffect, type RefObject } from "react";

interface SectionVisibilityOptions {
  pageRef: RefObject<HTMLElement | null>;
  onSectionChange: (sectionId: string) => void;
  fallbackSection?: string;
  rootMargin?: string;
  threshold?: number[];
  visibleBottomRatio?: number;
  visibleTopRatio?: number;
}

export function useSectionVisibility({
  pageRef,
  onSectionChange,
  fallbackSection = "hero",
  rootMargin = "-8% 0px -18% 0px",
  threshold = [0.12, 0.24, 0.4],
  visibleBottomRatio = 0.1,
  visibleTopRatio = 0.9,
}: SectionVisibilityOptions) {
  const thresholdKey = threshold.join(",");

  useLayoutEffect(() => {
    const page = pageRef.current;
    let frameId: number | null = null;
    let activeSectionId = fallbackSection;

    if (!page) {
      return;
    }

    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-section-id]"));

    if (sections.length === 0) {
      return;
    }

    const getFocusLine = () => window.innerHeight * ((visibleTopRatio + visibleBottomRatio) / 2);

    const syncSections = () => {
      const viewportTop = window.innerHeight * visibleTopRatio;
      const viewportBottom = window.innerHeight * visibleBottomRatio;
      const focusLine = getFocusLine();
      let hasVisibleSection = false;
      let nextActiveSectionId = fallbackSection;
      let bestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible =
          rect.top < viewportTop &&
          rect.bottom > viewportBottom;

        const nextVisibleState = isVisible ? "true" : "false";

        if (section.dataset.visible !== nextVisibleState) {
          section.dataset.visible = nextVisibleState;
        }

        if (isVisible) {
          hasVisibleSection = true;

          const distance =
            focusLine < rect.top
              ? rect.top - focusLine
              : focusLine > rect.bottom
                ? focusLine - rect.bottom
                : 0;

          if (distance < bestDistance) {
            bestDistance = distance;
            nextActiveSectionId = section.dataset.sectionId ?? fallbackSection;
          }
        }
      });

      if (!hasVisibleSection) {
        nextActiveSectionId = fallbackSection;
      }

      if (nextActiveSectionId !== activeSectionId) {
        activeSectionId = nextActiveSectionId;
        onSectionChange(nextActiveSectionId);
      }
    };

    const requestSync = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        syncSections();
      });
    };

    syncSections();

    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                (entry.target as HTMLElement).dataset.visible = "true";
              }
            });

            requestSync();
          }, { rootMargin, threshold })
        : null;

    sections.forEach((section) => observer?.observe(section));

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      observer?.disconnect();
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [
    fallbackSection,
    onSectionChange,
    pageRef,
    rootMargin,
    thresholdKey,
    visibleBottomRatio,
    visibleTopRatio,
  ]);
}
