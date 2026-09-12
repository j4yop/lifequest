import { test, expect } from "@playwright/test";

// FINAL judge-flow test: fresh signup through the real UI on production.
// Proves the rate-limit + email-confirmation fix end to end.

test("PROD: judge signup via real UI — instant, no email needed", async ({ browser }) => {
  const url = process.env.PROD_URL ?? "https://lifequest-ivory.vercel.app";
  const ctx = await browser.newContext({ baseURL: url });
  const page = await ctx.newPage();

  const email = `judge-ui-${Date.now()}@lifequest.dev`;

  // 1. Signup form (direct nav — robust against hydration timing)
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create Character" })).toBeVisible({
    timeout: 15000,
  });

  // 2. Fill the real form
  await page.getByLabel("Hero name").fill("JudgeFlow");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("judgepass123");
  await page.getByRole("button", { name: "Begin Adventure" }).click();

  // 3. Straight onto the quest board — no email wall
  await expect(page.getByRole("heading", { name: "JudgeFlow" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByLabel("Level 1")).toBeVisible();

  // 4. Sign out, then log straight back in
  await page.locator("nav form button").click();
  await page.waitForURL(/\/(login)?$/);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("judgepass123");
  await page.getByRole("button", { name: "Enter the Guild" }).click();
  await expect(page.getByRole("heading", { name: "JudgeFlow" })).toBeVisible({
    timeout: 15000,
  });

  await ctx.close();
});
