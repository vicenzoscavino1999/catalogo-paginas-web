import { useLayoutEffect, useRef, type RefObject } from "react";

interface TablecorStoryMotionOptions {
  activeSection: string;
  pageRef: RefObject<HTMLElement | null>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resetSectionMotion(section: HTMLElement) {
  section.style.setProperty("--section-progress", "0");
  section.style.setProperty("--section-reveal", "0");
  section.style.setProperty("--section-exit", "0");
  section.style.setProperty("--section-focus", "0");
  section.style.setProperty("--section-travel", "0px");
  section.style.setProperty("--section-scale", "1");
  section.style.setProperty("--section-depth", "0");
  section.style.setProperty("--section-sheen", "0.18");
}

function requestFrame(callback: FrameRequestCallback) {
  if (typeof window.requestAnimationFrame === "function") {
    const frameId = window.requestAnimationFrame(callback);

    return {
      cancel: () => window.cancelAnimationFrame(frameId),
    };
  }

  const timeoutId = window.setTimeout(() => callback(Date.now()), 16);

  return {
    cancel: () => window.clearTimeout(timeoutId),
  };
}

function subscribeToMotionPreferenceChange(
  motionQuery: MediaQueryList | null,
  callback: () => void
) {
  if (!motionQuery) {
    return () => undefined;
  }

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", callback);

    return () => motionQuery.removeEventListener("change", callback);
  }

  if (typeof motionQuery.addListener === "function") {
    motionQuery.addListener(callback);

    return () => motionQuery.removeListener(callback);
  }

  return () => undefined;
}

export function useTablecorStoryMotion({
  activeSection,
  pageRef,
}: TablecorStoryMotionOptions) {
  const activeSectionRef = useRef(activeSection);
  const requestSyncRef = useRef<() => void>(() => undefined);

  useLayoutEffect(() => {
    activeSectionRef.current = activeSection;

    const page = pageRef.current;

    if (!page) {
      return;
    }

    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-section-id]"));

    if (sections.length === 0) {
      return;
    }

    page.dataset.activeSection = activeSection;

    sections.forEach((section) => {
      section.dataset.active = section.dataset.sectionId === activeSection ? "true" : "false";
    });

    requestSyncRef.current();
  }, [activeSection, pageRef]);

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-section-id]"));

    if (sections.length === 0) {
      return;
    }

    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let frameHandle: ReturnType<typeof requestFrame> | null = null;
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(() => requestSync()) : null;

    const syncStoryMotion = () => {
      if (motionQuery?.matches) {
        sections.forEach(resetSectionMotion);
        return;
      }

      const viewportHeight = Math.max(window.innerHeight || 0, 1);
      const focusLine = viewportHeight * 0.56;
      const currentActiveSection = activeSectionRef.current;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = Math.max(rect.height, 1);
        const progress = clamp(
          (viewportHeight - rect.top) / (viewportHeight + sectionHeight),
          0,
          1
        );
        const isVisible = rect.top < viewportHeight * 0.86 && rect.bottom > viewportHeight * 0.08;
        const isActiveSection = section.dataset.sectionId === currentActiveSection;
        const baseReveal = clamp((progress - 0.04) / 0.6, 0, 1);
        const reveal =
          isVisible && isActiveSection ? Math.max(baseReveal, 0.94) : baseReveal;
        const baseExit = clamp((progress - 0.76) / 0.24, 0, 1);
        const sectionCenter = rect.top + sectionHeight / 2;
        const baseFocus = clamp(
          1 - Math.abs(sectionCenter - focusLine) / ((viewportHeight + sectionHeight) * 0.5),
          0,
          1
        );
        const focus =
          isVisible && isActiveSection ? Math.max(baseFocus, 0.76) : baseFocus;
        const exit =
          isVisible && isActiveSection ? Math.min(baseExit, 0.12) : baseExit;
        const travel = (0.5 - progress) * 72;
        const depth = (index % 2 === 0 ? 1 : -1) * (focus - 0.5) * 1.6;

        section.style.setProperty("--section-progress", progress.toFixed(4));
        section.style.setProperty("--section-reveal", reveal.toFixed(4));
        section.style.setProperty("--section-exit", exit.toFixed(4));
        section.style.setProperty("--section-focus", focus.toFixed(4));
        section.style.setProperty("--section-travel", `${travel.toFixed(2)}px`);
        section.style.setProperty("--section-scale", (0.985 + focus * 0.03).toFixed(4));
        section.style.setProperty("--section-depth", depth.toFixed(4));
        section.style.setProperty("--section-sheen", (0.18 + focus * 0.56).toFixed(4));
      });
    };

    const requestSync = () => {
      if (motionQuery?.matches) {
        frameHandle?.cancel();
        frameHandle = null;
        sections.forEach(resetSectionMotion);
        return;
      }

      if (frameHandle) {
        return;
      }

      let ranSynchronously = false;
      const nextFrameHandle = requestFrame(() => {
        ranSynchronously = true;
        frameHandle = null;
        syncStoryMotion();
      });

      frameHandle = ranSynchronously ? null : nextFrameHandle;
    };

    requestSyncRef.current = requestSync;

    const handleMotionPreferenceChange = () => {
      if (motionQuery?.matches) {
        frameHandle?.cancel();
        frameHandle = null;
        sections.forEach(resetSectionMotion);
        return;
      }

      requestSync();
    };

    if (motionQuery?.matches) {
      sections.forEach(resetSectionMotion);
    } else {
      syncStoryMotion();
    }

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    resizeObserver?.observe(page);
    sections.forEach((section) => resizeObserver?.observe(section));
    const unsubscribeMotionPreference = subscribeToMotionPreferenceChange(
      motionQuery,
      handleMotionPreferenceChange
    );

    return () => {
      requestSyncRef.current = () => undefined;
      frameHandle?.cancel();
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      unsubscribeMotionPreference();
      resizeObserver?.disconnect();
    };
  }, [pageRef]);
}
