import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CatalogPage } from "@/features/catalog/CatalogPage";
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

beforeEach(() => {
  window.sessionStorage.clear();
});

function renderCatalogPage() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("CatalogPage", () => {
  it("advances the intro title with wheel scroll", async () => {
    renderCatalogPage();
    const introOverlay = screen.getByRole("dialog", { name: /Intro del catalogo/i });

    expect(screen.getByRole("heading", { name: /HazTuWeb/i })).toBeInTheDocument();
    expect(
      within(introOverlay).getByText(
        /HazTuWeb reune experiencias web con identidad propia, pensadas para presentar negocios, ideas y productos con presencia premium desde el primer scroll./i
      )
    ).toBeInTheDocument();

    fireEvent.wheel(window, { deltaY: 180 });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Casa Brasa/i })).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole("dialog", { name: /Intro del catalogo/i })).getByText(
        /Landing de restaurante con reservas, menu por bloques y tono premium./i
      )
    ).toBeInTheDocument();
  });

  it("shows the continue action at the end of the intro", async () => {
    renderCatalogPage();

    for (let step = 0; step < 6; step += 1) {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    }

    const continueButton = await screen.findByRole("button", { name: /Seguir/i });

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Intro del catalogo/i })).not.toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Explorar catalogo/i })).toBeInTheDocument();
  });

  it("skips the intro when it was already seen in the session", () => {
    window.sessionStorage.setItem("catalog-home-intro:v1", "seen");

    renderCatalogPage();

    expect(screen.queryByRole("dialog", { name: /Intro del catalogo/i })).not.toBeInTheDocument();
  });

  it("activates a preview card when it is clicked", async () => {
    window.sessionStorage.setItem("catalog-home-intro:v1", "seen");
    renderCatalogPage();

    const previewButton = screen
      .getAllByRole("button", { name: /Casa Brasa/i })
      .find((button) => button.getAttribute("aria-pressed") !== null);

    expect(previewButton).toBeTruthy();

    fireEvent.click(previewButton!);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Abrir Casa Brasa/i })).toBeInTheDocument();
    });
  });

  it("navigates to the selected demo from a catalog card action", async () => {
    window.sessionStorage.setItem("catalog-home-intro:v1", "seen");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <MvpContentProvider>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/restaurant" element={<h1>Restaurant demo</h1>} />
          </Routes>
        </MvpContentProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("link", { name: /Abrir demo/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Restaurant demo/i })).toBeInTheDocument();
    });
  });
});
