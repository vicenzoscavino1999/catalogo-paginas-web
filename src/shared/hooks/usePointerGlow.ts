import { useEffect, useRef, type PointerEventHandler, type RefObject } from "react";

interface PointerGlowOptions {
  pageRef: RefObject<HTMLElement | null>;
  cursorAuraRef: RefObject<HTMLDivElement | null>;
  cursorDotRef: RefObject<HTMLDivElement | null>;
  interactiveSelector?: string;
  initialX?: string;
  initialY?: string;
  lerp?: number;
  auraRotateDeg?: number;
}

export function usePointerGlow({
  pageRef,
  cursorAuraRef,
  cursorDotRef,
  interactiveSelector = "a, button, input",
  initialX = "50vw",
  initialY = "40vh",
  lerp = 0.14,
  auraRotateDeg = 0,
}: PointerGlowOptions) {
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const hasPointerPositionRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const scheduleAnimationRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const aura = cursorAuraRef.current;
    const dot = cursorDotRef.current;

    if (!aura || !dot) {
      return;
    }

    const settleThreshold = 0.35;

    const animate = () => {
      frameRef.current = null;

      const deltaX = pointerTargetRef.current.x - pointerCurrentRef.current.x;
      const deltaY = pointerTargetRef.current.y - pointerCurrentRef.current.y;

      pointerCurrentRef.current.x += deltaX * lerp;
      pointerCurrentRef.current.y += deltaY * lerp;

      if (Math.abs(deltaX) <= settleThreshold && Math.abs(deltaY) <= settleThreshold) {
        pointerCurrentRef.current.x = pointerTargetRef.current.x;
        pointerCurrentRef.current.y = pointerTargetRef.current.y;
      }

      const auraRotation = auraRotateDeg === 0 ? "" : ` rotate(${auraRotateDeg}deg)`;

      aura.style.transform =
        `translate3d(${pointerCurrentRef.current.x}px, ${pointerCurrentRef.current.y}px, 0) ` +
        `scale(var(--cursor-scale, 1))${auraRotation}`;
      dot.style.transform =
        `translate3d(${pointerTargetRef.current.x}px, ${pointerTargetRef.current.y}px, 0) ` +
        "scale(var(--cursor-dot-scale, 1))";

      if (
        pointerCurrentRef.current.x !== pointerTargetRef.current.x ||
        pointerCurrentRef.current.y !== pointerTargetRef.current.y
      ) {
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

    scheduleAnimationRef.current = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    return () => {
      scheduleAnimationRef.current = () => undefined;

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [auraRotateDeg, cursorAuraRef, cursorDotRef, lerp]);

  const handlePointerMove: PointerEventHandler<HTMLElement> = (event) => {
    const interactive =
      event.target instanceof Element && Boolean(event.target.closest(interactiveSelector));

    if (!hasPointerPositionRef.current) {
      pointerCurrentRef.current = { x: event.clientX, y: event.clientY };
      hasPointerPositionRef.current = true;
    }

    pointerTargetRef.current = { x: event.clientX, y: event.clientY };

    if (pageRef.current) {
      pageRef.current.dataset.cursor = interactive ? "interactive" : "active";
      pageRef.current.style.setProperty("--page-pointer-x", `${event.clientX}px`);
      pageRef.current.style.setProperty("--page-pointer-y", `${event.clientY}px`);
    }

    if (cursorAuraRef.current) {
      cursorAuraRef.current.style.opacity = "1";
    }

    if (cursorDotRef.current) {
      cursorDotRef.current.style.opacity = "1";
    }

    scheduleAnimationRef.current();
  };

  const handlePointerLeave = () => {
    hasPointerPositionRef.current = false;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (pageRef.current) {
      pageRef.current.dataset.cursor = "hidden";
      pageRef.current.dataset.pressed = "false";
      pageRef.current.style.setProperty("--page-pointer-x", initialX);
      pageRef.current.style.setProperty("--page-pointer-y", initialY);
    }

    if (cursorAuraRef.current) {
      cursorAuraRef.current.style.opacity = "0";
    }

    if (cursorDotRef.current) {
      cursorDotRef.current.style.opacity = "0";
    }
  };

  const handlePointerDown = () => {
    if (pageRef.current) {
      pageRef.current.dataset.pressed = "true";
    }
  };

  const handlePointerUp = () => {
    if (pageRef.current) {
      pageRef.current.dataset.pressed = "false";
    }
  };

  return {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
  };
}
