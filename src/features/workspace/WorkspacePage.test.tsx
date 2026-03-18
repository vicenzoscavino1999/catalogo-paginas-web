import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { WorkspacePage } from "@/features/workspace/WorkspacePage";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";

function renderWorkspacePage() {
  return render(
    <MemoryRouter initialEntries={["/workspace?site=studio"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("WorkspacePage", () => {
  it("keeps success feedback visible after saving local content", async () => {
    renderWorkspacePage();

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(screen.getByText("Se guardo el contenido local de Atelier Norte.")).toBeInTheDocument();
    });
  });

  it("shows guided catalog fields and syncs them into the JSON editor", async () => {
    renderWorkspacePage();

    fireEvent.click(screen.getByRole("button", { name: "Catalogo" }));

    const titleField = await screen.findByLabelText(/Titulo principal/i);

    fireEvent.change(titleField, {
      target: { value: "Nueva portada principal para el catalogo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Mostrar editor avanzado/i }));

    expect(screen.getByLabelText(/Badge superior/i)).toBeInTheDocument();
    expect(
      (screen.getByRole("textbox", { name: /Contenido completo/i }) as HTMLTextAreaElement).value
    ).toContain('"title": "Nueva portada principal para el catalogo"');
  });

  it("opens guided content blocks and syncs their text into the JSON editor", async () => {
    renderWorkspacePage();

    fireEvent.click(screen.getByRole("button", { name: /Disciplinas/i }));

    const deliverableField = (await screen.findAllByLabelText(/Entregables 1/i))[0];
    fireEvent.change(deliverableField, {
      target: { value: "Direccion verbal y visual lista para crecer." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Mostrar editor avanzado/i }));

    expect(
      (screen.getByRole("textbox", { name: /Contenido completo/i }) as HTMLTextAreaElement).value
    ).toContain('"Direccion verbal y visual lista para crecer."');
  });

  it("renders a live preview iframe for the active view", () => {
    renderWorkspacePage();

    const previewFrame = screen.getByTitle("Vista previa de Atelier Norte");
    expect(previewFrame).toBeInTheDocument();
    expect(previewFrame.getAttribute("src")).toContain("/studio?previewKey=");
  });

  it("switches the live preview device mode", () => {
    renderWorkspacePage();

    const previewViewport = screen.getByTestId("preview-viewport");
    expect(previewViewport).toHaveAttribute("data-preview-device", "desktop");

    fireEvent.click(screen.getByRole("button", { name: "Tablet" }));
    expect(previewViewport).toHaveAttribute("data-preview-device", "tablet");

    fireEvent.click(screen.getByRole("button", { name: "Tablet horizontal" }));
    expect(previewViewport).toHaveAttribute("data-preview-device", "tabletLandscape");

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(previewViewport).toHaveAttribute("data-preview-device", "mobile");
  });

  it("switches the live preview zoom mode", () => {
    renderWorkspacePage();

    const previewViewport = screen.getByTestId("preview-viewport");
    expect(previewViewport).toHaveAttribute("data-preview-zoom", "fit");

    fireEvent.click(screen.getByRole("button", { name: "110%" }));
    expect(previewViewport).toHaveAttribute("data-preview-zoom", "focus");

    fireEvent.click(screen.getByRole("button", { name: "125%" }));
    expect(previewViewport).toHaveAttribute("data-preview-zoom", "detail");
  });

  it("toggles the advanced editor open and closed", async () => {
    renderWorkspacePage();

    const toggleButton = screen.getByRole("button", { name: /Mostrar editor avanzado/i });

    expect(screen.queryByRole("textbox", { name: /Contenido completo/i })).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(await screen.findByRole("textbox", { name: /Contenido completo/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Ocultar editor avanzado/i }));

    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: /Contenido completo/i })).not.toBeInTheDocument();
    });
  });
});
