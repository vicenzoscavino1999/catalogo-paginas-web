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
});
