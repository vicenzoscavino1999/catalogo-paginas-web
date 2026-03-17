import { useLayoutEffect, useRef, type RefObject } from "react";

interface CatalogScrollMotionOptions {
  pageRef: RefObject<HTMLElement | null>;
  sectionIds: readonly string[];
  fallbackSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useCatalogScrollMotion({
  pageRef,
  sectionIds,
  fallbackSection = "hero",
  onSectionChange,
}: CatalogScrollMotionOptions) {
  const frameRef = useRef<number | null>(null);
  const sectionIdsKey = sectionIds.join(",");

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const sections = sectionIds
      .map((sectionId) =>
        page.querySelector<HTMLElement>(`[data-section-id="${sectionId}"]`)
      )
      .filter((section): section is HTMLElement => section !== null);
    const valueCache = new Map<string, string>();
    const sectionState = sections.map((section, index) => ({
      currentDepth: 0,
      currentFocus: 0,
      currentProgress: 0,
      section,
      sectionId: section.dataset.sectionId ?? sectionIds[index] ?? `section-${index}`,
      targetDepth: 0,
      targetFocus: 0,
      targetProgress: 0,
    }));
    const easing = 0.36;
    const settleThreshold = 0.003;
    let isInitialized = false;
    let activeSectionId = fallbackSection;

    if (sections.length === 0) {
      return;
    }

    const setStyleValue = (target: HTMLElement, name: string, value: string) => {
      const cacheKey = `${name}:${target.dataset.sectionId ?? "page"}`;

      if (valueCache.get(cacheKey) === value) {
        return;
      }

      valueCache.set(cacheKey, value);
      target.style.setProperty(name, value);
    };

    const applyMotionValues = (
      section: HTMLElement,
      sectionId: string,
      progress: number,
      focus: number,
      depth: number
    ) => {
      const progressValue = progress.toFixed(3);
      const focusValue = focus.toFixed(3);
      const depthValue = depth.toFixed(3);

      setStyleValue(section, "--section-progress", progressValue);
      setStyleValue(section, "--section-focus", focusValue);
      setStyleValue(section, "--section-depth", depthValue);
      setStyleValue(page, `--${sectionId}-progress`, progressValue);
      setStyleValue(page, `--${sectionId}-focus`, focusValue);
      setStyleValue(page, `--${sectionId}-depth`, depthValue);
    };

    const measureTargets = () => {
      const viewportHeight = Math.max(window.innerHeight || 0, 1);
      const focusLine = viewportHeight * 0.46;
      const visTop = viewportHeight * 0.96;
      const visBottom = viewportHeight * 0.04;
      const visFocus = viewportHeight * 0.5;
      let nextActiveId = fallbackSection;
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionState.forEach((state) => {
        const { section, sectionId } = state;
        const rect = section.getBoundingClientRect();
        const travel = Math.max(rect.height + viewportHeight, 1);
        const progress = clamp((viewportHeight - rect.top) / travel, 0, 1);
        const center = rect.top + rect.height / 2;
        const focus = 1 - clamp(Math.abs(center - focusLine) / (viewportHeight * 0.92), 0, 1);
        const depth =
          clamp((focus * 0.72) + ((1 - Math.abs(progress - 0.5) * 2) * 0.28), 0, 1);

        state.targetProgress = progress;
        state.targetFocus = focus;
        state.targetDepth = depth;

        if (!isInitialized) {
          state.currentProgress = progress;
          state.currentFocus = focus;
          state.currentDepth = depth;
          applyMotionValues(section, sectionId, progress, focus, depth);
        }

        if (onSectionChange) {
          const isVisible = rect.top < visTop && rect.bottom > visBottom;
          const nextVisState = isVisible ? "true" : "false";

          if (section.dataset.visible !== nextVisState) {
            section.dataset.visible = nextVisState;
          }

          if (isVisible) {
            const dist =
              visFocus < rect.top
                ? rect.top - visFocus
                : visFocus > rect.bottom
                  ? visFocus - rect.bottom
                  : 0;

            if (dist < bestDistance) {
              bestDistance = dist;
              nextActiveId = sectionId;
            }
          }
        }
      });

      if (onSectionChange && nextActiveId !== activeSectionId) {
        activeSectionId = nextActiveId;
        onSectionChange(nextActiveId);
      }

      if (!isInitialized) {
        isInitialized = true;
      }
    };

    let measureDirty = true;

    const tick = () => {
      frameRef.current = null;

      if (measureDirty) {
        measureDirty = false;
        measureTargets();
      }

      let needsAnotherFrame = false;

      sectionState.forEach((state) => {
        const nextProgress =
          state.currentProgress + ((state.targetProgress - state.currentProgress) * easing);
        const nextFocus =
          state.currentFocus + ((state.targetFocus - state.currentFocus) * easing);
        const nextDepth =
          state.currentDepth + ((state.targetDepth - state.currentDepth) * easing);
        const progressSettled =
          Math.abs(state.targetProgress - nextProgress) <= settleThreshold;
        const focusSettled =
          Math.abs(state.targetFocus - nextFocus) <= settleThreshold;
        const depthSettled =
          Math.abs(state.targetDepth - nextDepth) <= settleThreshold;

        state.currentProgress = progressSettled ? state.targetProgress : nextProgress;
        state.currentFocus = focusSettled ? state.targetFocus : nextFocus;
        state.currentDepth = depthSettled ? state.targetDepth : nextDepth;

        applyMotionValues(
          state.section,
          state.sectionId,
          state.currentProgress,
          state.currentFocus,
          state.currentDepth
        );

        if (!progressSettled || !focusSettled || !depthSettled) {
          needsAnotherFrame = true;
        }
      });

      if (needsAnotherFrame) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const requestSync = () => {
      measureDirty = true;

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    requestSync();

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [fallbackSection, onSectionChange, pageRef, sectionIds, sectionIdsKey]);
}
