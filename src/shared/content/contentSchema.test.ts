import { describe, expect, it } from "vitest";
import { mergeWithDefaults, validateWithDefaults } from "@/shared/content/contentSchema";

describe("contentSchema", () => {
  it("fills missing nested fields from defaults", () => {
    const defaults = {
      title: "Base",
      stats: [{ label: "Uno", value: "1" }],
      meta: {
        accent: "#111111",
        tags: ["demo"],
      },
    };

    const merged = mergeWithDefaults(defaults, {
      title: "Custom",
      stats: [{ label: "Dos" }],
      meta: {
        accent: "#222222",
      },
    });

    expect(merged).toEqual({
      title: "Custom",
      stats: [{ label: "Dos", value: "1" }],
      meta: {
        accent: "#222222",
        tags: ["demo"],
      },
    });
  });

  it("reports nested type mismatches with readable paths", () => {
    const defaults = {
      title: "Base",
      metrics: [{ label: "Items", value: "4" }],
    };

    const errors = validateWithDefaults(
      defaults,
      {
        title: 42,
        metrics: [{ label: "Items", value: 4 }],
      },
      "catalog"
    );

    expect(errors).toEqual([
      "catalog.title debe ser string, no number.",
      "catalog.metrics[0].value debe ser string, no number.",
    ]);
  });

  it("keeps null fields strict and deep-clones arrays without a schema item", () => {
    const defaults = {
      hero: null,
      modules: [] as Array<{ title: string; accent: { value: string } }>,
    };
    const candidate = {
      hero: { bad: true },
      modules: [{ title: "Custom", accent: { value: "#222222" } }],
    };

    const merged = mergeWithDefaults(defaults, candidate);

    expect(merged.hero).toBeNull();
    expect(merged.modules).toEqual([{ title: "Custom", accent: { value: "#222222" } }]);
    expect(merged.modules).not.toBe(candidate.modules);
    expect(merged.modules[0]).not.toBe(candidate.modules[0]);
    expect(merged.modules[0].accent).not.toBe(candidate.modules[0].accent);

    const errors = validateWithDefaults(defaults, candidate, "content");

    expect(errors).toContain("content.hero debe ser null, no object.");
  });
});
