import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePointerGlow } from "@/shared/hooks/usePointerGlow";

function PointerGlowHarness() {
  const pageRef = useRef<HTMLElement | null>(null);
  const cursorAuraRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const { handlePointerLeave, handlePointerMove } = usePointerGlow({
    pageRef,
    cursorAuraRef,
    cursorDotRef,
    initialX: "50vw",
    initialY: "34vh",
    lerp: 1,
  });

  return (
    <main
      data-cursor="hidden"
      data-testid="page"
      ref={pageRef}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div data-testid="aura" ref={cursorAuraRef} />
      <div data-testid="dot" ref={cursorDotRef} />
      <button type="button">CTA</button>
      <div data-testid="panel">Panel</div>
    </main>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePointerGlow", () => {
  let frameId = 0;
  let queuedFrames = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    frameId = 0;
    queuedFrames = new Map<number, FrameRequestCallback>();

    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      const id = ++frameId;
      queuedFrames.set(id, callback);
      return id;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => {
      queuedFrames.delete(id);
    }));
  });

  it("starts animating only after pointer movement and updates cursor mode", () => {
    render(<PointerGlowHarness />);

    const page = screen.getByTestId("page");
    const aura = screen.getByTestId("aura");
    const dot = screen.getByTestId("dot");
    const button = screen.getByRole("button", { name: "CTA" });

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    fireEvent.pointerMove(button, {
      bubbles: true,
      clientX: 120,
      clientY: 80,
    });

    expect(page).toHaveAttribute("data-cursor", "interactive");
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(aura).toHaveStyle({ opacity: "1" });
    expect(dot).toHaveStyle({ opacity: "1" });

    queuedFrames.forEach((callback) => callback(16));
    queuedFrames.clear();

    expect(aura.style.transform).toContain("120px");
    expect(dot.style.transform).toContain("80px");

    fireEvent.pointerMove(screen.getByTestId("panel"), {
      bubbles: true,
      clientX: 64,
      clientY: 48,
    });

    expect(page).toHaveAttribute("data-cursor", "active");

    fireEvent.pointerLeave(page);

    expect(page).toHaveAttribute("data-cursor", "hidden");
    expect(page).toHaveStyle("--page-pointer-x: 50vw");
    expect(page).toHaveStyle("--page-pointer-y: 34vh");
    expect(aura).toHaveStyle({ opacity: "0" });
    expect(dot).toHaveStyle({ opacity: "0" });
  });
});
