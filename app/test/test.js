#!/usr/bin/env node
/**
 * Smoke tests for Siege game.
 * Launches headless Chromium, hits the Vite dev server, and checks:
 * - Page loads (200 OK)
 * - No JavaScript errors
 * - Phaser boots and creates a canvas
 * - All three scenes are registered (boot, menu, game)
 * - Assets load without 404s
 * - Unit patterns JSON loads
 * - Phaser version is >= 3.90
 */

const { chromium } = require("playwright");

const BASE_URL = process.env.BASE_URL || "http://game:8000";
const TIMEOUT = 15000;

async function runTests() {
  let browser;
  let passed = 0;
  let failed = 0;
  const errors = [];

  function pass(msg) {
    console.log(`   ✅ ${msg}`);
    passed++;
  }

  function fail(msg) {
    console.log(`   ❌ ${msg}`);
    failed++;
    errors.push(msg);
  }

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on("console", (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    // Collect JS errors
    const jsErrors = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    // Collect failed network requests
    const failedRequests = [];
    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText,
      });
    });

    // Collect 4xx/5xx responses
    const badResponses = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        badResponses.push({ url: response.url(), status: response.status() });
      }
    });

    console.log(`🧪 Testing Siege at ${BASE_URL}...\n`);

    // --- Test 1: Page loads ---
    console.log("1. Page loads...");
    try {
      const response = await page.goto(BASE_URL, {
        waitUntil: "networkidle",
        timeout: TIMEOUT,
      });
      if (response.status() === 200) {
        pass("Page loads (200 OK)");
      } else {
        fail(`Expected 200, got ${response.status()}`);
      }
    } catch (error) {
      fail(`Page load failed: ${error.message}`);
    }

    // Give Phaser time to boot and load assets
    await page.waitForTimeout(5000);

    // --- Test 2: No JS errors ---
    console.log("2. JavaScript errors...");
    if (jsErrors.length > 0) {
      fail(`Found ${jsErrors.length} JS error(s)`);
      jsErrors.forEach((e) => console.log(`      - ${e}`));
    } else {
      pass("No JavaScript errors");
    }

    // --- Test 3: No failed asset loads ---
    console.log("3. Asset loading...");
    // Filter out non-app requests (e.g. browser extensions)
    const appBadResponses = badResponses.filter((r) =>
      r.url.startsWith(BASE_URL),
    );
    const appFailedRequests = failedRequests.filter(
      (r) =>
        r.url.startsWith(BASE_URL) || r.url.startsWith("http://game:8000"),
    );

    if (appBadResponses.length > 0 || appFailedRequests.length > 0) {
      fail(
        `${appBadResponses.length} bad response(s), ${appFailedRequests.length} failed request(s)`,
      );
      appBadResponses.forEach((r) =>
        console.log(`      - ${r.status} ${r.url}`),
      );
      appFailedRequests.forEach((r) =>
        console.log(`      - FAILED ${r.url}: ${r.error}`),
      );
    } else {
      pass("All assets loaded successfully");
    }

    // --- Test 4: Phaser canvas exists ---
    console.log("4. Phaser canvas...");
    try {
      const hasCanvas = await page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        return canvas !== null && canvas.width > 0 && canvas.height > 0;
      });
      if (hasCanvas) {
        pass("Phaser canvas exists and has dimensions");
      } else {
        fail("No canvas element found or canvas has zero dimensions");
      }
    } catch (error) {
      fail(`Canvas check failed: ${error.message}`);
    }

    // --- Test 5: Phaser scenes registered ---
    console.log("5. Phaser scenes...");
    try {
      const sceneInfo = await page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return null;
        // Phaser stores the game instance; we exposed it as window.b in game scene
        // but we can also find it via Phaser's global game registry
        // The game object is typically on the canvas's parent
        const gameInstance =
          window.b?.game || window.game || Phaser?.GAMES?.[0];
        if (!gameInstance) return { found: false };
        const sceneKeys = gameInstance.scene.scenes.map(
          (s) => s.sys.settings.key || s.sys.key || s.constructor.name,
        );
        return { found: true, scenes: sceneKeys };
      });
      if (sceneInfo && sceneInfo.found && sceneInfo.scenes) {
        const expected = ["boot", "menu", "game"];
        const missing = expected.filter(
          (s) => !sceneInfo.scenes.includes(s),
        );
        if (missing.length === 0) {
          pass(`All scenes registered: ${sceneInfo.scenes.join(", ")}`);
        } else {
          fail(`Missing scenes: ${missing.join(", ")} (found: ${sceneInfo.scenes.join(", ")})`);
        }
      } else {
        fail("Could not access Phaser game instance");
      }
    } catch (error) {
      fail(`Scene check failed: ${error.message}`);
    }

    // --- Test 6: Unit patterns loaded ---
    console.log("6. Unit patterns data...");
    try {
      const patternsCheck = await page.evaluate(() => {
        const gameInstance =
          window.b?.game || window.game || Phaser?.GAMES?.[0];
        if (!gameInstance) return { found: false };
        const cache = gameInstance.cache?.json;
        if (!cache) return { found: false };
        const patterns = cache.get("unitPatterns");
        if (!patterns) return { found: false, cached: false };
        return {
          found: true,
          count: Array.isArray(patterns) ? patterns.length : 0,
        };
      });
      if (patternsCheck && patternsCheck.found && patternsCheck.count > 0) {
        pass(`Unit patterns loaded (${patternsCheck.count} patterns)`);
      } else {
        fail("Unit patterns not found in cache");
      }
    } catch (error) {
      fail(`Patterns check failed: ${error.message}`);
    }

    // --- Test 7: Phaser version check ---
    console.log("7. Phaser version...");
    try {
      const versionInfo = await page.evaluate(() => {
        const gameInstance =
          window.b?.game || window.game || Phaser?.GAMES?.[0];
        if (!gameInstance) return null;
        return {
          version: Phaser?.VERSION || gameInstance.config?.gameVersion || null,
        };
      });
      if (versionInfo && versionInfo.version) {
        const major = parseInt(versionInfo.version.split(".")[0], 10);
        const minor = parseInt(versionInfo.version.split(".")[1], 10);
        if (major === 3 && minor >= 90) {
          pass(`Phaser version ${versionInfo.version} (>= 3.90)`);
        } else {
          fail(`Phaser version ${versionInfo.version} is below 3.90.0 — upgrade needed`);
        }
      } else {
        fail("Could not detect Phaser version");
      }
    } catch (error) {
      fail(`Phaser version check failed: ${error.message}`);
    }

    // --- Test 8: Menu scene is active (first scene after boot) ---
    console.log("8. Menu scene active...");
    try {
      const activeScene = await page.evaluate(() => {
        const gameInstance =
          window.b?.game || window.game || Phaser?.GAMES?.[0];
        if (!gameInstance) return null;
        const active = gameInstance.scene.scenes.filter(
          (s) => s.sys.isActive(),
        );
        return active.map(
          (s) => s.sys.settings.key || s.sys.key || s.constructor.name,
        );
      });
      if (activeScene && activeScene.includes("menu")) {
        pass(`Menu scene is active (active: ${activeScene.join(", ")})`);
      } else if (activeScene && activeScene.includes("game")) {
        pass(`Game scene is active (active: ${activeScene.join(", ")})`);
      } else {
        fail(`Unexpected active scene(s): ${activeScene?.join(", ") || "none"}`);
      }
    } catch (error) {
      fail(`Active scene check failed: ${error.message}`);
    }

    // --- Summary ---
    console.log("\n" + "=".repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
      console.log("\nErrors:");
      errors.forEach((e) => console.log(`  - ${e}`));
      process.exit(1);
    } else {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Test runner error:", error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTests();
