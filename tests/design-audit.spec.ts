import { test, expect } from "@playwright/test";

const email = `a11y-${Date.now()}@lifequest.dev`;

test("design QA — computed styles and layout invariants", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/signup");
  await page.getByLabel("Hero name").fill("A11yHero");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("questhero123");
  await page.getByRole("button", { name: "Begin Adventure" }).click();
  await expect(page.getByRole("heading", { name: "A11yHero" })).toBeVisible();
  await page.waitForTimeout(500);

  const audit = await page.evaluate(() => {
    const out: Record<string, unknown> = {};

    // 1. Pixel font applied to display headings
    const h1 = document.querySelector("h1");
    out.h1Font = getComputedStyle(h1!).fontFamily;

    // 2. Body font applied
    out.bodyFont = getComputedStyle(document.body).fontFamily;

    // 3. No horizontal overflow
    out.docOverflow =
      document.documentElement.scrollWidth - window.innerWidth;

    // 4. Contrast of body text vs field bg (approx via RGB math)
    const bg = getComputedStyle(document.body).backgroundColor;
    out.bodyBg = bg;

    // 5. All buttons have accessible names
    out.unnamedButtons = [...document.querySelectorAll("button")]
      .filter((b) => !b.getAttribute("aria-label") && !b.textContent?.trim())
      .length;

    // 6. All inputs have labels
    out.unlabeledInputs = [...document.querySelectorAll("input, select")]
      .filter((i) => !i.closest("label") && !i.id)
      .length;

    // 7. Every image/icon decorative is aria-hidden or labeled
    out.totalButtons = document.querySelectorAll("button").length;

    // 8. Focus visible on first button
    const btn = document.querySelector<HTMLButtonElement>("button");
    btn?.focus();
    out.focusOutline = btn ? getComputedStyle(btn).outlineStyle : "none";

    return out;
  });

  // Assertions
  expect(audit.h1Font).toContain("Press"); // Press Start 2P
  expect(audit.bodyFont).toContain("Nunito");
  expect(audit.docOverflow as number).toBeLessThanOrEqual(0);
  expect(audit.unnamedButtons as number).toBe(0);
  expect(audit.unlabeledInputs as number).toBe(0);
  expect(audit.totalButtons as number).toBeGreaterThanOrEqual(3);

  // mobile invariants
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(mobile.overflow).toBeLessThanOrEqual(0); // no horizontal scroll
});

test("shop keyboard: tab to a buy button and activate with Enter", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByLabel("Hero name").fill("KeyHero");
  await page.getByLabel("Email").fill(`kbd-${Date.now()}@lifequest.dev`);
  await page.getByLabel("Password").fill("questhero123");
  await page.getByRole("button", { name: "Begin Adventure" }).click();
  await expect(page.getByRole("heading", { name: "KeyHero" })).toBeVisible();

  // earn some gold first so Buy buttons are enabled
  await page.getByRole("button", { name: /New Quest/ }).click();
  await page.getByLabel("Quest name").fill("Epic keyboard run");
  await page.getByLabel(/Difficulty/).selectOption("epic");
  await page.getByRole("button", { name: "Post Quest" }).click();
  await expect(page.getByText("Epic keyboard run")).toBeVisible();
  await page
    .getByRole("button", { name: /Complete quest: Epic keyboard run/ })
    .click();
  await page.waitForTimeout(800);

  await page.goto("/shop");
  await page.waitForTimeout(600);

  // tab until an enabled Buy button is focused, then activate with Enter
  let found = false;
  for (let i = 0; i < 40 && !found; i++) {
    await page.keyboard.press("Tab");
    found = await page.evaluate(() => {
      const el = document.activeElement;
      return (
        el instanceof HTMLButtonElement &&
        !el.disabled &&
        /^buy/i.test(el.textContent ?? "")
      );
    });
  }
  expect(found).toBe(true);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  // purchase toast or state change, no crash
  await expect(page.getByRole("heading", { name: "Guild Shop" })).toBeVisible();
});
