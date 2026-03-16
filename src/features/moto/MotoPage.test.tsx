import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MotoPage } from "@/features/moto/MotoPage";
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

function renderMotoPage() {
  return render(
    <MemoryRouter initialEntries={["/moto"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/moto" element={<MotoPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("MotoPage", () => {
  it("clears the active model surfaces when the search has no matches", async () => {
    renderMotoPage();

    fireEvent.change(screen.getByRole("searchbox", { name: /Buscar modelo o categoria/i }), {
      target: { value: "sin-coincidencias-reales" },
    });

    await waitFor(() => {
      expect(
        screen.getAllByText(
          "No hay motos para ese filtro. Cambia la busqueda o vuelve a otra categoria."
        )
      ).toHaveLength(4);
    });
  });
});
