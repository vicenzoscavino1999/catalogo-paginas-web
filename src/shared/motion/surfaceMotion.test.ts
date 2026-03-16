import type { PointerEvent as ReactPointerEvent } from "react";
import { describe, expect, it } from "vitest";
import { applySurfaceMotion } from "@/shared/motion/surfaceMotion";

describe("surfaceMotion", () => {
  it("resets to safe defaults when the target has no measurable size", () => {
    const target = document.createElement("div");

    target.style.setProperty("--bg-x", "12px");
    target.style.setProperty("--bg-y", "9px");
    target.style.setProperty("--tilt-x", "4deg");
    target.style.setProperty("--tilt-y", "5deg");
    target.getBoundingClientRect = () =>
      ({
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
      }) as DOMRect;

    applySurfaceMotion(
      {
        clientX: 20,
        clientY: 30,
        currentTarget: target,
      } as unknown as ReactPointerEvent<HTMLElement>,
      {
        bgXFactor: 1,
        bgYFactor: 1,
        tiltXFactor: 4,
        tiltYFactor: 4,
      }
    );

    expect(target.style.getPropertyValue("--bg-x")).toBe("0px");
    expect(target.style.getPropertyValue("--bg-y")).toBe("0px");
    expect(target.style.getPropertyValue("--tilt-x")).toBe("0deg");
    expect(target.style.getPropertyValue("--tilt-y")).toBe("0deg");
  });
});
