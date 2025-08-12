#!/usr/bin/env bun

/**
 * Verification script for Qwen provider integration
 * Run with: bun run providers/qwen/verify.ts
 */

import { PROVIDER_DEFINITIONS } from "@/providers/models";
import { providers } from "@/providers/utils";

console.log("🔍 Verifying Qwen Provider Integration...\n");

// Check if Qwen is in providers
console.log("1. Checking providers object:");
if (providers.qwen) {
  console.log("   ✅ Qwen provider found in providers object");
  console.log(`   📝 ID: ${providers.qwen.id}`);
  console.log(`   📝 Name: ${providers.qwen.name}`);
  console.log(`   📝 Description: ${providers.qwen.description}`);
  console.log(`   📝 Version: ${providers.qwen.version}`);
  console.log(`   📝 Models: ${providers.qwen.models.length} models`);
  console.log(`   📝 Default Model: ${providers.qwen.defaultModel}`);
} else {
  console.log("   ❌ Qwen provider NOT found in providers object");
}

console.log("\n2. Checking PROVIDER_DEFINITIONS:");
if (PROVIDER_DEFINITIONS.qwen) {
  console.log("   ✅ Qwen provider found in PROVIDER_DEFINITIONS");
  console.log(`   📝 ID: ${PROVIDER_DEFINITIONS.qwen.id}`);
  console.log(`   📝 Name: ${PROVIDER_DEFINITIONS.qwen.name}`);
  console.log(`   📝 Description: ${PROVIDER_DEFINITIONS.qwen.description}`);
  console.log(
    `   📝 Models: ${PROVIDER_DEFINITIONS.qwen.models.length} models`
  );
  console.log(`   📝 Default Model: ${PROVIDER_DEFINITIONS.qwen.defaultModel}`);
} else {
  console.log("   ❌ Qwen provider NOT found in PROVIDER_DEFINITIONS");
}

console.log("\n3. Checking available models:");
if (providers.qwen?.models) {
  console.log("   📋 Available models:");
  providers.qwen.models.forEach((model, index) => {
    const modelDef = PROVIDER_DEFINITIONS.qwen?.models.find(
      (m) => m.id === model
    );
    if (modelDef) {
      console.log(
        `      ${index + 1}. ${model} - $${modelDef.pricing.input}/${modelDef.pricing.output} per 1M tokens`
      );
    } else {
      console.log(`      ${index + 1}. ${model}`);
    }
  });
}

console.log("\n4. Checking provider capabilities:");
if (PROVIDER_DEFINITIONS.qwen?.models) {
  const hasToolUsage = PROVIDER_DEFINITIONS.qwen.models.some(
    (m) => m.capabilities.toolUsageControl
  );
  const hasTemperature = PROVIDER_DEFINITIONS.qwen.models.some(
    (m) => m.capabilities.temperature
  );

  console.log(`   🛠️  Tool Usage Control: ${hasToolUsage ? "✅" : "❌"}`);
  console.log(`   🌡️  Temperature Control: ${hasTemperature ? "✅" : "❌"}`);
}

console.log("\n5. Checking provider patterns:");
if (providers.qwen?.modelPatterns) {
  console.log(
    `   🔍 Model Patterns: ${providers.qwen.modelPatterns.length} patterns`
  );
  providers.qwen.modelPatterns.forEach((pattern, index) => {
    console.log(`      ${index + 1}. ${pattern}`);
  });
}

console.log("\n🎉 Verification Complete!");
console.log(
  "\nIf all checks passed, Qwen provider is successfully integrated!"
);
console.log(
  'Users can now select "qwen" as their LLM provider in the deepfin-flow platform.'
);
