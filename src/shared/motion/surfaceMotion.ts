import type { PointerEvent as ReactPointerEvent } from "react";

export interface SurfaceMotionOptions {
  bgInvertXFactor?: number;
  bgInvertYFactor?: number;
  bgXFactor?: number;
  bgYFactor?: number;
  offsetX?: number;
  offsetY?: number;
  panelXFactor?: number;
  panelYFactor?: number;
  tiltXFactor?: number;
  tiltYFactor?: number;
}

export function applySurfaceMotion(
  event: ReactPointerEvent<HTMLElement>,
  {
    bgInvertXFactor,
    bgInvertYFactor,
    bgXFactor,
    bgYFactor,
    offsetX = 18,
    offsetY = 18,
    panelXFactor,
    panelYFactor,
    tiltXFactor,
    tiltYFactor,
  }: SurfaceMotionOptions = {}
) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    resetSurfaceMotion(event, {
      bgInvertXFactor,
      bgInvertYFactor,
      bgXFactor,
      bgYFactor,
      panelXFactor,
      panelYFactor,
      tiltXFactor,
      tiltYFactor,
    });
    return;
  }

  const normalizedX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const normalizedY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  const currentOffsetX = (normalizedX - 0.5) * offsetX;
  const currentOffsetY = (normalizedY - 0.5) * offsetY;

  target.style.setProperty("--pointer-x", `${normalizedX * 100}%`);
  target.style.setProperty("--pointer-y", `${normalizedY * 100}%`);

  if (typeof bgXFactor === "number") {
    target.style.setProperty("--bg-x", `${currentOffsetX * bgXFactor}px`);
  }

  if (typeof bgYFactor === "number") {
    target.style.setProperty("--bg-y", `${currentOffsetY * bgYFactor}px`);
  }

  if (typeof bgInvertXFactor === "number") {
    target.style.setProperty("--bg-x-invert", `${currentOffsetX * bgInvertXFactor}px`);
  }

  if (typeof bgInvertYFactor === "number") {
    target.style.setProperty("--bg-y-invert", `${currentOffsetY * bgInvertYFactor}px`);
  }

  if (typeof panelXFactor === "number") {
    target.style.setProperty("--panel-x", `${currentOffsetX * panelXFactor}px`);
  }

  if (typeof panelYFactor === "number") {
    target.style.setProperty("--panel-y", `${currentOffsetY * panelYFactor}px`);
  }

  if (typeof tiltXFactor === "number") {
    target.style.setProperty("--tilt-x", `${(0.5 - normalizedY) * tiltXFactor}deg`);
  }

  if (typeof tiltYFactor === "number") {
    target.style.setProperty("--tilt-y", `${(normalizedX - 0.5) * tiltYFactor}deg`);
  }
}

export function resetSurfaceMotion(
  event: ReactPointerEvent<HTMLElement>,
  {
    bgInvertXFactor,
    bgInvertYFactor,
    bgXFactor,
    bgYFactor,
    panelXFactor,
    panelYFactor,
    tiltXFactor,
    tiltYFactor,
  }: SurfaceMotionOptions = {}
) {
  const target = event.currentTarget;

  target.style.setProperty("--pointer-x", "50%");
  target.style.setProperty("--pointer-y", "50%");

  if (typeof bgXFactor === "number") {
    target.style.setProperty("--bg-x", "0px");
  }

  if (typeof bgYFactor === "number") {
    target.style.setProperty("--bg-y", "0px");
  }

  if (typeof bgInvertXFactor === "number") {
    target.style.setProperty("--bg-x-invert", "0px");
  }

  if (typeof bgInvertYFactor === "number") {
    target.style.setProperty("--bg-y-invert", "0px");
  }

  if (typeof panelXFactor === "number") {
    target.style.setProperty("--panel-x", "0px");
  }

  if (typeof panelYFactor === "number") {
    target.style.setProperty("--panel-y", "0px");
  }

  if (typeof tiltXFactor === "number") {
    target.style.setProperty("--tilt-x", "0deg");
  }

  if (typeof tiltYFactor === "number") {
    target.style.setProperty("--tilt-y", "0deg");
  }
}
