import { useEffect, useRef, useState, type RefObject } from "react";

interface ScrollChromeOptions {
  compactThreshold?: number;
  deltaThreshold?: number;
  hideThreshold?: number;
  trackProgress?: boolean;
  progressTarget?: RefObject<HTMLElement | null>;
  progressStateStep?: number;
}

export function useScrollChrome({
  compactThreshold,
  deltaThreshold = 10,
  hideThreshold = 40,
  trackProgress = true,
  progressTarget,
  progressStateStep = 0.001,
}: ScrollChromeOptions = {}) {
  const frameRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const hiddenStateRef = useRef(false);
  const compactStateRef = useRef(false);
  const progressRef = useRef(0);
  const renderedProgressRef = useRef(0);
  const [isTopbarHidden, setIsTopbarHidden] = useState(false);
  const [isTopbarCompact, setIsTopbarCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () =>
      Number(
        Math.max(
          0,
          Math.min(
            1,
            (window.scrollY || 0) /
            Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
          )
        ).toFixed(3)
      );

    const syncChrome = () => {
      const currentScrollY = window.scrollY || 0;

      if (trackProgress) {
        const nextProgress = calculateProgress();

        if (nextProgress !== progressRef.current) {
          progressRef.current = nextProgress;

          const target = progressTarget?.current;

          if (target) {
            target.style.setProperty("--scroll-progress", `${nextProgress}`);
          }
        }

        const shouldSyncProgressState =
          Math.abs(nextProgress - renderedProgressRef.current) >= progressStateStep ||
          nextProgress === 0 ||
          nextProgress === 1;

        if (shouldSyncProgressState) {
          renderedProgressRef.current = nextProgress;
          setScrollProgress(nextProgress);
        }
      }

      if (typeof compactThreshold === "number") {
        const nextCompact = currentScrollY > compactThreshold;

        if (nextCompact !== compactStateRef.current) {
          compactStateRef.current = nextCompact;
          setIsTopbarCompact(nextCompact);
        }
      }

      if (currentScrollY <= hideThreshold) {
        if (hiddenStateRef.current) {
          hiddenStateRef.current = false;
          setIsTopbarHidden(false);
        }

        lastScrollYRef.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollYRef.current;
      let nextHidden = hiddenStateRef.current;

      if (delta > deltaThreshold) {
        nextHidden = true;
      } else if (delta < -deltaThreshold) {
        nextHidden = false;
      }

      if (nextHidden !== hiddenStateRef.current) {
        hiddenStateRef.current = nextHidden;
        setIsTopbarHidden(nextHidden);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const requestSync = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        syncChrome();
      });
    };

    lastScrollYRef.current = window.scrollY || 0;
    hiddenStateRef.current = false;
    compactStateRef.current = false;
    progressRef.current = 0;
    renderedProgressRef.current = 0;

    const target = progressTarget?.current;

    if (target) {
      target.style.setProperty("--scroll-progress", "0");
    }

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
  }, [
    compactThreshold,
    deltaThreshold,
    hideThreshold,
    progressStateStep,
    progressTarget,
    trackProgress,
  ]);

  return {
    isTopbarCompact,
    isTopbarHidden,
    scrollProgress,
    scrollProgressPercent: Math.round(scrollProgress * 100),
  };
}
