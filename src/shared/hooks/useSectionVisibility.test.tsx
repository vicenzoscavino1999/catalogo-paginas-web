import { render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { useSectionVisibility } from "@/shared/hooks/useSectionVisibility";

class IntersectionObserverMock {
  readonly root = null;

  readonly rootMargin = "";

  readonly thresholds = [0];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

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

function VisibilityHarness() {
  const pageRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState("hero");

  useSectionVisibility({
    onSectionChange: setActiveSection,
    pageRef,
  });

  return (
    <main ref={pageRef}>
      <output data-testid="active-section">{activeSection}</output>
      <section data-section-id="hero" data-visible="false" />
      <section data-section-id="details" data-visible="false" />
    </main>
  );
}

beforeAll(() => {
  globalThis.IntersectionObserver = IntersectionObserverMock;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSectionVisibility", () => {
  it("prefers the section closest to the viewport focus line instead of observer order", async () => {
    vi.stubGlobal("innerHeight", 1000);

    render(<VisibilityHarness />);

    const heroSection = document.querySelector('[data-section-id="hero"]') as HTMLElement;
    const detailsSection = document.querySelector('[data-section-id="details"]') as HTMLElement;

    let heroRect = createRect(0, 700);
    let detailsRect = createRect(650, 1400);

    heroSection.getBoundingClientRect = vi.fn(() => heroRect);
    detailsSection.getBoundingClientRect = vi.fn(() => detailsRect);

    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(screen.getByTestId("active-section")).toHaveTextContent("hero");
      expect(heroSection).toHaveAttribute("data-visible", "true");
      expect(detailsSection).toHaveAttribute("data-visible", "true");
    });

    heroRect = createRect(-520, 80);
    detailsRect = createRect(160, 980);

    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(screen.getByTestId("active-section")).toHaveTextContent("details");
      expect(heroSection).toHaveAttribute("data-visible", "false");
      expect(detailsSection).toHaveAttribute("data-visible", "true");
    });
  });

  it("keeps syncing with scroll and resize when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("innerHeight", 1000);
    vi.stubGlobal("IntersectionObserver", undefined);

    render(<VisibilityHarness />);

    const heroSection = document.querySelector('[data-section-id="hero"]') as HTMLElement;
    const detailsSection = document.querySelector('[data-section-id="details"]') as HTMLElement;

    let heroRect = createRect(0, 720);
    let detailsRect = createRect(760, 1500);

    heroSection.getBoundingClientRect = vi.fn(() => heroRect);
    detailsSection.getBoundingClientRect = vi.fn(() => detailsRect);

    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(screen.getByTestId("active-section")).toHaveTextContent("hero");
    });

    heroRect = createRect(-560, 120);
    detailsRect = createRect(120, 980);

    window.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(screen.getByTestId("active-section")).toHaveTextContent("details");
      expect(detailsSection).toHaveAttribute("data-visible", "true");
    });
  });
});
