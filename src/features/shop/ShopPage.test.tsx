import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ShopPage } from "@/features/shop/ShopPage";
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

function renderShopPage() {
  return render(
    <MemoryRouter initialEntries={["/shop"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("ShopPage", () => {
  it("keeps the featured product aligned with the active search results", async () => {
    renderShopPage();

    fireEvent.change(screen.getByRole("searchbox", { name: /Buscar por pieza, tipo o descripcion/i }), {
      target: { value: "sin-coincidencias-reales" },
    });

    await waitFor(() => {
      expect(
        screen.getAllByText(
          "No hay coincidencias para esta busqueda. Cambia el texto o vuelve a otra coleccion."
        )
      ).toHaveLength(2);
    });
  });
});
