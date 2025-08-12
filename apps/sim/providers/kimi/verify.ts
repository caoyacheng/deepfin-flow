import { PROVIDER_DEFINITIONS } from "../models";
import { providers } from "../utils";

console.log("🔍 Verifying Kimi Provider Integration...\n");

// 1. Check providers object
console.log("1. Checking providers object:");
try {
  const kimiProvider = providers.kimi;
  if (kimiProvider) {
    console.log("   ✅ Kimi provider found in providers object");
    console.log("   📝 ID:", kimiProvider.id);
    console.log("   📝 Name:", kimiProvider.name);
    console.log("   📝 Description:", kimiProvider.description);
    console.log("   📝 Version:", kimiProvider.version);
    console.log("   📝 Models:", kimiProvider.models.length, "models");
    console.log("   📝 Default Model:", kimiProvider.defaultModel);
  } else {
    console.log("   ❌ Kimi provider not found in providers object");
  }
} catch (error) {
  console.log("   ❌ Error checking providers object:", error);
}

// 2. Check PROVIDER_DEFINITIONS
console.log("\n2. Checking PROVIDER_DEFINITIONS:");
try {
  const kimiDef = PROVIDER_DEFINITIONS.kimi;
  if (kimiDef) {
    console.log("   ✅ Kimi provider found in PROVIDER_DEFINITIONS");
    console.log("   📝 ID:", kimiDef.id);
    console.log("   📝 Name:", kimiDef.name);
    console.log("   📝 Description:", kimiDef.description);
    console.log("   📝 Models:", kimiDef.models.length, "models");
    console.log("   📝 Default Model:", kimiDef.defaultModel);
  } else {
    console.log("   ❌ Kimi provider not found in PROVIDER_DEFINITIONS");
  }
} catch (error) {
  console.log("   ❌ Error checking PROVIDER_DEFINITIONS:", error);
}

// 3. Check available models
console.log("\n3. Checking available models:");
try {
  const kimiDef = PROVIDER_DEFINITIONS.kimi;
  if (kimiDef && kimiDef.models) {
    console.log("   📋 Available models:");
    kimiDef.models.forEach((model, index) => {
      const pricing = model.pricing;
      console.log(
        `      ${index + 1}. ${model.id} - $${pricing.input}/${pricing.output} per 1M tokens`
      );
    });
  }
} catch (error) {
  console.log("   ❌ Error checking models:", error);
}

// 4. Check provider capabilities
console.log("\n4. Checking provider capabilities:");
try {
  const kimiDef = PROVIDER_DEFINITIONS.kimi;
  if (kimiDef && kimiDef.models && kimiDef.models.length > 0) {
    const firstModel = kimiDef.models[0];
    console.log(
      "   🛠️  Tool Usage Control:",
      firstModel.capabilities.toolUsageControl ? "✅" : "❌"
    );
    console.log(
      "   🌡️  Temperature Control:",
      firstModel.capabilities.temperature ? "✅" : "❌"
    );
    if (firstModel.capabilities.temperature) {
      console.log(
        "      📊 Range:",
        `${firstModel.capabilities.temperature.min}-${firstModel.capabilities.temperature.max}`
      );
    }
  }
} catch (error) {
  console.log("   ❌ Error checking capabilities:", error);
}

// 5. Check provider patterns
console.log("\n5. Checking provider patterns:");
try {
  const kimiDef = PROVIDER_DEFINITIONS.kimi;
  if (kimiDef && kimiDef.modelPatterns) {
    console.log(
      "   🔍 Model Patterns:",
      kimiDef.modelPatterns.length,
      "patterns"
    );
    kimiDef.modelPatterns.forEach((pattern, index) => {
      console.log(`      ${index + 1}. ${pattern}`);
    });
  }
} catch (error) {
  console.log("   ❌ Error checking patterns:", error);
}

console.log("\n🎉 Verification Complete!");
console.log("If all checks passed, Kimi provider is successfully integrated!");
console.log(
  "Users can now select 'kimi' as their LLM provider in the deepfin-flow platform."
);
