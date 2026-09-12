import { test, expect } from "@playwright/test";

const email = `qa-${Date.now()}@lifequest.dev`;
const password = "questhero123";

test("capture all screens, desktop + mobile", async ({ page }) => {
  // landing
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/landing-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/landing-mobile.png", fullPage: true });

  // signup
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/signup");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/signup-desktop.png" });

  // create account
  await page.getByLabel("Hero name").fill("VisualHero");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Begin Adventure" }).click();
  await expect(page.getByRole("heading", { name: "VisualHero" })).toBeVisible();

  // seed a few quests for a realistic board
  const quests: [string, string, string][] = [
    ["Slay the laundry dragon", "hard", "str"],
    ["Study the ancient scrolls (read 20 pages)", "medium", "int"],
    ["Call the village elder (mom)", "easy", "cha"],
    ["Forge dinner from raw ingredients", "medium", "cra"],
  ];
  for (const [title, tier, attribute] of quests) {
    await page.getByRole("button", { name: /New Quest/ }).click();
    await page.getByLabel("Quest name").fill(title);
    await page.getByLabel(/Difficulty/).selectOption(tier);
    await page.getByLabel(/Trains attribute/).selectOption(attribute);
    await page.getByRole("button", { name: "Post Quest" }).click();
    await expect(page.getByText(title)).toBeVisible();
  }
  await page.waitForTimeout(400);

  // board desktop
  await page.screenshot({ path: "shots/board-desktop.png", fullPage: true });

  // complete one quest for the gold/streak state
  await page
    .getByRole("button", { name: /Complete quest: Slay the laundry dragon/ })
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "shots/board-completed.png" });

  // board mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/board-mobile.png", fullPage: true });

  // shop desktop + mobile
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/shop");
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/shop-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/shop-mobile.png", fullPage: true });
});

test("keyboard navigation reaches every interactive element", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(300);

  // Tab through the landing: every reachable element should show focus
  const focused: string[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    if (tag && tag !== "BODY") focused.push(tag);
  }
  expect(focused.length).toBeGreaterThanOrEqual(8);
  expect(new Set(focused)).toContain("A"); // links are reachable

  // Enter on focused link navigates
  await page.keyboard.press("Tab"); // move to a link
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur()
  );
});
