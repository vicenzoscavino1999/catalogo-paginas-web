import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTablecorStoryMotion } from "@/features/tablecor/useTablecorStoryMotion";

function createRect(top: number, bottom: number): DOMRect {
  return {
    bottom,
    height: bottom - top,
    left: 0,
    right: 1000,
    toJSON: () => ({}),
    top,
    width: 1000,
    x: 0,
    y: top,
  } as DOMRect;
}

function StoryMotionHarness() {
  const pageRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState("hero");

  useTablecorStoryMotion({
    activeSection,
    pageRef,
  });

  return (
    <main data-testid="page" ref={pageRef}>
      <button type="button" onClick={() => setActiveSection("details")}>
        Switch
      </button>
      <section data-section-id="hero" data-testid="hero" />
      <section data-section-id="details" data-testid="details" />
    </main>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTablecorStoryMotion", () => {
  it("syncs active section state and writes scroll-linked CSS variables", async () => {
    let resizeObserverCallback: ResizeObserverCallback | null = null;

    vi.stubGlobal("innerHeight", 1000);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })));
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 1;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserverMock {
        constructor(callback: ResizeObserverCallback) {
          resizeObserverCallback = callback;
        }

        disconnect() {}

        observe() {}

        unobserve() {}
      }
    );

    render(<StoryMotionHarness />);

    const page = screen.getByTestId("page");
    const hero = screen.getByTestId("hero");
    const details = screen.getByTestId("details");

    let heroRect = createRect(0, 760);
    let detailsRect = createRect(740, 1600);

    hero.getBoundingClientRect = vi.fn(() => heroRect);
    details.getBoundingClientRect = vi.fn(() => detailsRect);

    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(page).toHaveAttribute("data-active-section", "hero");
      expect(hero).toHaveAttribute("data-active", "true");
      expect(hero.style.getPropertyValue("--section-progress")).not.toBe("");
      expect(hero.style.getPropertyValue("--section-reveal")).not.toBe("");
      expect(hero.style.getPropertyValue("--section-travel")).toContain("px");
    });

    const previousTravel = hero.style.getPropertyValue("--section-travel");

    heroRect = createRect(-580, 160);
    detailsRect = createRect(140, 1060);

    expect(resizeObserverCallback).not.toBeNull();
    resizeObserverCallback!([], {} as ResizeObserver);
    fireEvent.click(screen.getByRole("button", { name: "Switch" }));
    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(page).toHaveAttribute("data-active-section", "details");
      expect(details).toHaveAttribute("data-active", "true");
      expect(details.style.getPropertyValue("--section-focus")).not.toBe("");
      expect(details.style.getPropertyValue("--section-exit")).not.toBe("");
      expect(hero.style.getPropertyValue("--section-travel")).not.toBe(previousTravel);
    });
  });

  it("resets motion when reduced motion changes through the legacy media query API", async () => {
    let motionPreferenceChange: (() => void) | null = null;

    const motionQuery = {
      addListener: vi.fn((callback: () => void) => {
        motionPreferenceChange = callback;
      }),
      matches: false,
      removeListener: vi.fn(),
    };

    vi.stubGlobal("innerHeight", 1000);
    vi.stubGlobal("matchMedia", vi.fn(() => motionQuery));
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 1;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(<StoryMotionHarness />);

    const hero = screen.getByTestId("hero");
    const details = screen.getByTestId("details");

    hero.getBoundingClientRect = vi.fn(() => createRect(0, 760));
    details.getBoundingClientRect = vi.fn(() => createRect(740, 1600));

    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(hero.style.getPropertyValue("--section-progress")).not.toBe("");
    });

    motionQuery.matches = true;
    expect(motionPreferenceChange).not.toBeNull();
    motionPreferenceChange!();

    await waitFor(() => {
      expect(hero.style.getPropertyValue("--section-progress")).toBe("0");
      expect(hero.style.getPropertyValue("--section-reveal")).toBe("0");
      expect(hero.style.getPropertyValue("--section-travel")).toBe("0px");
    });
  });
});
