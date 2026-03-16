import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StudioPage } from "@/features/studio/StudioPage";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";

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

beforeAll(() => {
  globalThis.IntersectionObserver = IntersectionObserverMock;
});

function renderStudioPage() {
  return render(
    <MemoryRouter initialEntries={["/studio"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/studio" element={<StudioPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("StudioPage", () => {
  it(
    "keeps the selected discipline active and aligns the active case",
    async () => {
    renderStudioPage();

    fireEvent.click(screen.getAllByRole("button", { name: /Digital/i })[0]);

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Digital/i })
          .some((button) => button.getAttribute("aria-pressed") === "true")
      ).toBe(true);
    });

    expect(
      screen
        .getAllByRole("button", { name: /Orbita SaaS/i })
        .some((button) => button.getAttribute("aria-pressed") === "true")
    ).toBe(true);
    },
    10000
  );
});
