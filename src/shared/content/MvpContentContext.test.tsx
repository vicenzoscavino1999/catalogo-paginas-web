import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";
import {
  MvpContentProvider,
  useMvpContent,
} from "@/shared/content/MvpContentContext";

const storageKey = "catalogo-webs:mvp-content:v2";

function Probe() {
  const { content, resetContentSection, saveContentSection, siteRegistry } = useMvpContent();

  return (
    <div>
      <p data-testid="catalog-title">{content.catalog.title}</p>
      <p data-testid="catalog-badge">{content.catalog.badge}</p>
      <p data-testid="studio-title">
        {siteRegistry.find((site) => site.key === "studio")?.title ?? ""}
      </p>
      <p data-testid="studio-summary">
        {siteRegistry.find((site) => site.key === "studio")?.summary ?? ""}
      </p>
      <button
        type="button"
        onClick={() =>
          saveContentSection("catalog", {
            ...content.catalog,
            title: "Catalogo guardado",
          })
        }
      >
        guardar
      </button>
      <button type="button" onClick={() => resetContentSection("catalog")}>
        reset
      </button>
    </div>
  );
}

describe("MvpContentProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges partial stored content with defaults", () => {
    const defaults = createDefaultMvpContent();

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        catalog: {
          title: "Catalogo persistido",
        },
        sites: {
          studio: {
            title: "Atelier Vivo",
          },
        },
      })
    );

    render(
      <MvpContentProvider>
        <Probe />
      </MvpContentProvider>
    );

    expect(screen.getByTestId("catalog-title")).toHaveTextContent("Catalogo persistido");
    expect(screen.getByTestId("catalog-badge")).toHaveTextContent(defaults.catalog.badge);
    expect(screen.getByTestId("studio-title")).toHaveTextContent("Atelier Vivo");
    expect(screen.getByTestId("studio-summary")).toHaveTextContent(defaults.sites.studio.summary);
  });

  it("persists saves and can reset a section", async () => {
    const defaults = createDefaultMvpContent();

    render(
      <MvpContentProvider>
        <Probe />
      </MvpContentProvider>
    );

    fireEvent.click(screen.getByText("guardar"));

    await waitFor(() => {
      expect(screen.getByTestId("catalog-title")).toHaveTextContent("Catalogo guardado");
      expect(window.localStorage.getItem(storageKey)).toContain("Catalogo guardado");
    });

    fireEvent.click(screen.getByText("reset"));

    await waitFor(() => {
      expect(screen.getByTestId("catalog-title")).toHaveTextContent(defaults.catalog.title);
    });
  });

  it("falls back to defaults when localStorage read fails", () => {
    const defaults = createDefaultMvpContent();

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    render(
      <MvpContentProvider>
        <Probe />
      </MvpContentProvider>
    );

    expect(screen.getByTestId("catalog-title")).toHaveTextContent(defaults.catalog.title);
    expect(screen.getByTestId("studio-title")).toHaveTextContent(defaults.sites.studio.title);
  });

  it("keeps provider updates working when localStorage write fails", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    render(
      <MvpContentProvider>
        <Probe />
      </MvpContentProvider>
    );

    fireEvent.click(screen.getByText("guardar"));

    await waitFor(() => {
      expect(screen.getByTestId("catalog-title")).toHaveTextContent("Catalogo guardado");
    });
  });
});
