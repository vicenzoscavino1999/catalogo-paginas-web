import { describe, expect, it } from "vitest";
import { getNextSite, getSiteByKey } from "@/shared/data/sites";
import type { SiteKey } from "@/shared/types/site";

describe("site helpers", () => {
  it("returns the registered site for a known key", () => {
    expect(getSiteByKey("restaurant").title).toBe("Casa Brasa");
  });

  it("wraps to the first site when asking for the next site from the last item", () => {
    expect(getNextSite("moto").key).toBe("restaurant");
  });

  it("throws a clear error for unknown runtime site keys", () => {
    expect(() => getSiteByKey("desconocido" as SiteKey)).toThrowError(
      "Unknown site key: desconocido"
    );
    expect(() => getNextSite("desconocido" as SiteKey)).toThrowError(
      "Unknown site key: desconocido"
    );
  });
});
