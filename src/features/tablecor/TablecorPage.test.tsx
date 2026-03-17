import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TablecorPage } from "@/features/tablecor/TablecorPage";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";

const STORAGE_KEY = "catalogo-webs:mvp-content:v2";

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
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

function renderTablecorPage(storedContent?: unknown) {
  if (storedContent !== undefined) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedContent));
  }

  return render(
    <MemoryRouter initialEntries={["/tablecor"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/tablecor" element={<TablecorPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("TablecorPage", () => {
  it(
    "keeps a manual machine selection when the selected process still allows it",
    async () => {
    renderTablecorPage();

    fireEvent.click(screen.getAllByRole("button", { name: /Nesting CNC 5 ejes/i })[0]);

    const processSection = document.getElementById("corte");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: "Nesting CNC 5 ejes" })
      ).toBeInTheDocument();
      expect(processSection).not.toBeNull();
      expect(
        screen
          .getAllByRole("button", { name: /Nesting CNC 5 ejes/i })
          .some((button) => button.getAttribute("aria-pressed") === "true")
      ).toBe(true);
      expect(
        screen
          .getAllByRole("button", { name: /Seccionadora orbital/i })
          .every((button) => button.getAttribute("aria-pressed") !== "true")
      ).toBe(true);
      expect(within(processSection!).getAllByText("Nesting CNC 5 ejes").length).toBeGreaterThan(0);
    });
    },
    10000
  );

  it(
    "keeps a manual piece selection while the process stays the same",
    async () => {
    renderTablecorPage();

    fireEvent.click(screen.getAllByRole("button", { name: /Frente cajon/i })[0]);

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Frente cajon/i })
          .some((button) => button.getAttribute("aria-pressed") === "true")
      ).toBe(true);
    });
    },
    10000
  );

  it(
    "switches to the matching program when filtering auto-selects a surface from another route",
    async () => {
    renderTablecorPage();

    fireEvent.change(screen.getByRole("searchbox", { name: /Buscar codigo, familia, acabado o uso/i }), {
      target: { value: "Marfil" },
    });

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Wardrobe Suite/i })
          .some((button) => button.getAttribute("aria-pressed") === "true")
      ).toBe(true);
    });
    },
    10000
  );

  it(
    "allows clearing the comparison tray completely",
    async () => {
    renderTablecorPage();

    fireEvent.click(screen.getByLabelText(/Quitar comparacion de Nogal Faro/i));
    fireEvent.click(screen.getByLabelText(/Quitar comparacion de Travertino Duna/i));
    fireEvent.click(screen.getByLabelText(/Quitar comparacion de Arcilla Plena/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Elige 2 o 3 acabados para leer el contraste de la paleta./i)
      ).toBeInTheDocument();
    });
    },
    10000
  );

  it(
    "keeps the all-surfaces filter available when editable families omit its label",
    async () => {
    const defaults = createDefaultMvpContent();

    renderTablecorPage({
      ...defaults,
      tablecor: {
        ...defaults.tablecor,
        families: defaults.tablecor.families.filter((family) => family !== "Todos"),
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "true");
    });
    },
    10000
  );

  it(
    "disables unsupported process steps until the selected program supports them",
    async () => {
    renderTablecorPage();

    const drillStep = screen
      .getAllByRole("button", { name: /Perforado y herrajes/i })
      .find((button) => button.hasAttribute("disabled"));

    expect(drillStep).toBeDefined();
    expect(drillStep).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: /Wardrobe Suite/i })[0]);

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Perforado y herrajes/i })
          .find((button) => button.className.includes("processStep"))
      ).not.toBeDisabled();
    });

    fireEvent.click(
      screen
        .getAllByRole("button", { name: /Perforado y herrajes/i })
        .find((button) => button.className.includes("processStep"))!
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: "Drilling cell" })
      ).toBeInTheDocument();
    });
    },
    10000
  );

  it(
    "disables machines that are outside the active program route",
    async () => {
    renderTablecorPage();

    const drillingMachine = screen
      .getAllByRole("button", { name: /Drilling cell/i })
      .find((button) => button.hasAttribute("disabled"));

    expect(drillingMachine).toBeDefined();
    expect(drillingMachine).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: /Wardrobe Suite/i })[0]);

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("button", { name: /Drilling cell/i })
          .find((button) => button.className.includes("machineChip"))
      ).not.toBeDisabled();
    });
    },
    10000
  );
});
