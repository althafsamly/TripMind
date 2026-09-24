// Automated Test Suite for TripMind Gemini Safety Service
// Run via: node tests/safetyService.test.js or npm test

const assert = require("assert");
const {
  getEmergencyGuidanceWithGemini,
  getLocalSafetyFallback,
  SRI_LANKA_REGIONAL_HOSPITALS,
} = require("../services/geminiSafetyService");

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(testName, asyncTestFn) {
  totalTests++;
  try {
    await asyncTestFn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function main() {
  console.log("\n🧪 Running TripMind Gemini Safety Service Test Suite...\n");

  // Test 1: Snake bite fallback guidance
  runTest("Snake bite emergency returns critical urgency and anti-venom guidance", () => {
    const result = getLocalSafetyFallback({ query: "I think a snake bit my friend", destination: "Ella" });
    assert.strictEqual(result.urgencyLevel, "Critical");
    assert.ok(result.headline.includes("Snake Bite"));
    assert.ok(result.firstAidSteps.length >= 4);
    assert.ok(result.hotline.includes("1990"));
    assert.ok(result.sinhalaPhrases.length > 0);
    assert.ok(result.sinhalaPhrases[0].singlishPhonetics);
  });

  // Test 2: Marine / Jellyfish sting
  runTest("Jellyfish sting returns marine first-aid with seawater/vinegar steps", () => {
    const result = getLocalSafetyFallback({ query: "jellyfish sting on my leg while swimming", destination: "Mirissa" });
    assert.strictEqual(result.urgencyLevel, "Urgent");
    assert.ok(result.headline.includes("Jellyfish"));
    assert.ok(result.firstAidSteps.some((s) => s.toLowerCase().includes("sea water") || s.toLowerCase().includes("vinegar")));
  });

  // Test 3: Road / Scooter accident
  runTest("Traffic accident returns trauma response and emergency hotlines (1990 & 119)", () => {
    const result = getLocalSafetyFallback({ query: "Scooter accident on coastal road with bleeding", destination: "Galle" });
    assert.strictEqual(result.urgencyLevel, "Critical");
    assert.ok(result.hotline.includes("1990"));
    assert.ok(result.hotline.includes("119"));
  });

  // Test 4: Food illness
  runTest("Food illness returns hydration and local Thambili recommendation", () => {
    const result = getLocalSafetyFallback({ query: "Bad stomach pain from street food vomiting", destination: "Kandy" });
    assert.strictEqual(result.urgencyLevel, "Moderate");
    assert.ok(result.firstAidSteps.some((s) => s.toLowerCase().includes("thambili") || s.toLowerCase().includes("rehydration")));
  });

  // Test 5: Input validation
  await runAsyncTest("Throws error when emergency query is empty or whitespace", async () => {
    let threw = false;
    try {
      await getEmergencyGuidanceWithGemini({ query: "   ", destination: "Colombo" });
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, true, "Expected function to throw on empty query");
  });

  // Test 6: Valid query execution (fallback or live API)
  await runAsyncTest("getEmergencyGuidanceWithGemini returns valid schema for valid input", async () => {
    const result = await getEmergencyGuidanceWithGemini({
      query: "Fell down while hiking Ella Rock, twisted ankle and scrapes",
      destination: "Ella",
    });
    assert.ok(result.headline, "Missing headline");
    assert.ok(result.urgencyLevel, "Missing urgency level");
    assert.ok(Array.isArray(result.firstAidSteps) && result.firstAidSteps.length > 0, "Missing first aid steps");
    assert.ok(result.hotline, "Missing hotline");
    assert.ok(Array.isArray(result.sinhalaPhrases), "Missing Sinhala phrases");
  });

  // Test 7: Regional hospital database completeness
  runTest("Regional hospital directory covers major tourist destinations", () => {
    const requiredCities = ["colombo", "kandy", "galle", "ella", "mirissa", "sigiriya", "nuwara eliya"];
    for (const city of requiredCities) {
      assert.ok(SRI_LANKA_REGIONAL_HOSPITALS[city], `Missing hospital entry for ${city}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);
  if (passedTests === totalTests) {
    console.log("🎉 All TripMind safety tests passed successfully!\n");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed.\n");
    process.exit(1);
  }
}

main();
