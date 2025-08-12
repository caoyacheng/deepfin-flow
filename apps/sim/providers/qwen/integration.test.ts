import { PROVIDER_DEFINITIONS } from "@/providers/models";
import { providers } from "@/providers/utils";
import { describe, expect, it } from "vitest";

describe("Qwen Provider Integration", () => {
  it("should be included in providers object", () => {
    expect(providers.qwen).toBeDefined();
    expect(providers.qwen.id).toBe("qwen");
    expect(providers.qwen.name).toBe("Qwen");
  });

  it("should be included in PROVIDER_DEFINITIONS", () => {
    expect(PROVIDER_DEFINITIONS.qwen).toBeDefined();
    expect(PROVIDER_DEFINITIONS.qwen.id).toBe("qwen");
    expect(PROVIDER_DEFINITIONS.qwen.name).toBe("Qwen");
  });

  it("should have models defined", () => {
    expect(providers.qwen.models).toBeDefined();
    expect(Array.isArray(providers.qwen.models)).toBe(true);
    expect(providers.qwen.models.length).toBeGreaterThan(0);
  });

  it("should include qwen-turbo model", () => {
    expect(providers.qwen.models).toContain("qwen-turbo");
  });

  it("should have model patterns defined", () => {
    expect(providers.qwen.modelPatterns).toBeDefined();
    expect(Array.isArray(providers.qwen.modelPatterns)).toBe(true);
  });
});
