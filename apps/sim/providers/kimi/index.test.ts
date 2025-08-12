import { describe, expect, it } from "vitest";
import { kimiProvider } from "./index";

describe("KimiProvider", () => {
  it("should have correct basic configuration", () => {
    expect(kimiProvider.id).toBe("kimi");
    expect(kimiProvider.name).toBe("Kimi");
    expect(kimiProvider.description).toBe("Moonshot AI's Kimi models");
    expect(kimiProvider.version).toBe("1.0.0");
  });

  it("should have executeRequest method", () => {
    expect(typeof kimiProvider.executeRequest).toBe("function");
  });

  it("should have models array", () => {
    expect(Array.isArray(kimiProvider.models)).toBe(true);
    expect(kimiProvider.models.length).toBeGreaterThan(0);
  });

  it("should have default model", () => {
    expect(kimiProvider.defaultModel).toBe("moonshot-v1-8k");
  });
});
