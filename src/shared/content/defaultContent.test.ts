import { describe, expect, it } from "vitest";
import { createDefaultMvpContent } from "@/shared/content/defaultContent";

describe("createDefaultMvpContent", () => {
  it("returns independent clones on each call", () => {
    const first = createDefaultMvpContent();
    const second = createDefaultMvpContent();
    const originalMetric = second.restaurant.metrics[0].value;

    first.catalog.title = "Catalogo editado";
    first.restaurant.metrics[0].value = "999";
    first.sites.restaurant.tags.push("nuevo");

    expect(second.catalog.title).not.toBe("Catalogo editado");
    expect(second.restaurant.metrics[0].value).toBe(originalMetric);
    expect(second.sites.restaurant.tags).not.toContain("nuevo");
  });
});
