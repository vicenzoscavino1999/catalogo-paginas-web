import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
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
  it("activates a preview card when it is clicked", async () => {
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
