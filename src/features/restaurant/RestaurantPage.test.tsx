import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RestaurantPage } from "@/features/restaurant/RestaurantPage";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";

function renderRestaurantPage() {
  return render(
    <MemoryRouter initialEntries={["/restaurant"]}>
      <MvpContentProvider>
        <Routes>
          <Route path="/restaurant" element={<RestaurantPage />} />
        </Routes>
      </MvpContentProvider>
    </MemoryRouter>
  );
}

describe("RestaurantPage", () => {
  it("activates the selected menu tab and swaps the visible dishes", async () => {
    renderRestaurantPage();

    fireEvent.click(screen.getByRole("button", { name: /Barra/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Barra/i })).toHaveAttribute("aria-pressed", "true");
    });

    expect(screen.getByText(/Negroni de cacao/i)).toBeTruthy();
  });
});
