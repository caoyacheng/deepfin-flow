import { describe, expect, it } from "vitest";
import { qwenProvider } from "./index";

describe("QwenProvider", () => {
  it("should have correct basic configuration", () => {
    expect(qwenProvider.id).toBe("qwen");
    expect(qwenProvider.name).toBe("Qwen");
    expect(qwenProvider.description).toBe("Alibaba Cloud's Qwen models");
    expect(qwenProvider.version).toBe("1.0.0");
  });

  it("should have executeRequest method", () => {
    expect(typeof qwenProvider.executeRequest).toBe("function");
  });

  it("should have models array", () => {
    expect(Array.isArray(qwenProvider.models)).toBe(true);
  });

  it("should have default model", () => {
    expect(typeof qwenProvider.defaultModel).toBe("string");
    expect(qwenProvider.defaultModel.length).toBeGreaterThan(0);
  });
});
