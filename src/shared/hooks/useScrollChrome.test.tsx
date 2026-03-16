import { render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { useScrollChrome } from "@/shared/hooks/useScrollChrome";
import { afterEach, describe, expect, it, vi } from "vitest";

function ScrollChromeHarness({ progressStateStep }: { progressStateStep?: number } = {}) {
  const progressTargetRef = useRef<HTMLDivElement | null>(null);
  const { scrollProgress, scrollProgressPercent } = useScrollChrome({
    progressTarget: progressTargetRef,
    progressStateStep,
  });

  return (
    <>
      <div data-testid="progress-target" ref={progressTargetRef} />
      <output data-testid="scroll-progress">{scrollProgress.toFixed(3)}</output>
      <output data-testid="scroll-progress-percent">{scrollProgressPercent}</output>
    </>
  );
}

function setViewportMetrics({ innerHeight, scrollHeight, scrollY }: {
  innerHeight: number;
  scrollHeight: number;
  scrollY: number;
}) {
  vi.stubGlobal("innerHeight", innerHeight);
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollChrome", () => {
  it("recalculates scroll progress when the viewport is resized", async () => {
    setViewportMetrics({
      innerHeight: 1000,
      scrollHeight: 2000,
      scrollY: 400,
    });

    render(<ScrollChromeHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("scroll-progress")).toHaveTextContent("0.400");
      expect(screen.getByTestId("scroll-progress-percent")).toHaveTextContent("40");
      expect(screen.getByTestId("progress-target")).toHaveStyle("--scroll-progress: 0.4");
    });

    setViewportMetrics({
      innerHeight: 500,
      scrollHeight: 2000,
      scrollY: 400,
    });

    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(screen.getByTestId("scroll-progress")).toHaveTextContent("0.267");
      expect(screen.getByTestId("scroll-progress-percent")).toHaveTextContent("27");
      expect(screen.getByTestId("progress-target")).toHaveStyle("--scroll-progress: 0.267");
    });
  });

  it("keeps the CSS progress variable in sync when React state updates are coarsened", async () => {
    setViewportMetrics({
      innerHeight: 1000,
      scrollHeight: 2000,
      scrollY: 400,
    });

    render(<ScrollChromeHarness progressStateStep={0.5} />);

    await waitFor(() => {
      expect(screen.getByTestId("progress-target")).toHaveStyle("--scroll-progress: 0.4");
    });

    expect(screen.getByTestId("scroll-progress")).toHaveTextContent("0.000");
    expect(screen.getByTestId("scroll-progress-percent")).toHaveTextContent("0");
  });
});
