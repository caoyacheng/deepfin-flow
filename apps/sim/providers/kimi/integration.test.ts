import { describe, expect, it } from "vitest";
import { PROVIDER_DEFINITIONS } from "../models";
import { providers } from "../utils";

describe("Kimi Provider Integration", () => {
  it("should be included in providers object", () => {
    expect(providers.kimi).toBeDefined();
    expect(providers.kimi.id).toBe("kimi");
    expect(providers.kimi.name).toBe("Kimi");
  });

  it("should be included in PROVIDER_DEFINITIONS", () => {
    expect(PROVIDER_DEFINITIONS.kimi).toBeDefined();
    expect(PROVIDER_DEFINITIONS.kimi.id).toBe("kimi");
    expect(PROVIDER_DEFINITIONS.kimi.name).toBe("Kimi");
  });

  it("should have models defined", () => {
    const kimiProvider = PROVIDER_DEFINITIONS.kimi;
    expect(kimiProvider.models).toBeDefined();
    expect(Array.isArray(kimiProvider.models)).toBe(true);
    expect(kimiProvider.models.length).toBeGreaterThan(0);
  });

  it("should include moonshot-v1-8k model", () => {
    const kimiProvider = PROVIDER_DEFINITIONS.kimi;
    const modelIds = kimiProvider.models.map((m) => m.id);
    expect(modelIds).toContain("moonshot-v1-8k");
  });

  it("should have model patterns defined", () => {
    const kimiProvider = PROVIDER_DEFINITIONS.kimi;
    expect(kimiProvider.modelPatterns).toBeDefined();
    expect(Array.isArray(kimiProvider.modelPatterns)).toBe(true);
    expect(kimiProvider.modelPatterns?.length).toBeGreaterThan(0);
  });
});
