import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TravelPage } from "@/features/travel/TravelPage";
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

function renderTravelPage() {
  return render(
    <MemoryRouter initialEntries={["/travel"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/travel" element={<TravelPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("TravelPage", () => {
  it("activates the selected destination and updates the active narrative", async () => {
    renderTravelPage();

    fireEvent.click(screen.getAllByRole("button", { name: /Cartagena ritmo lento/i })[0]);

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Cartagena ritmo lento/i })
          .some((button) => button.getAttribute("aria-pressed") === "true")
      ).toBe(true);
    });

    expect(
      screen.getAllByText(/Ciudad tibia con color, balcones y una lectura boutique/i).length
    ).toBeGreaterThan(0);
  });
});
