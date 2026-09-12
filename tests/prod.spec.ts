import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "fs";

// Production smoke test — provisions a fresh demo user via the admin API
// (avoids Supabase signup rate limits), then runs the full journey.

function freshCreds(): { email: string; password: string } {
  const path = "C:/Users/DELL/AppData/Local/Temp/opencode/prod-creds.json";
  if (!existsSync(path)) throw new Error("Run make-fresh-user.cjs first");
  return JSON.parse(readFileSync(path, "utf8"));
}

test("PROD: full journey on the live deployment", async ({ browser }) => {
  const { email, password } = freshCreds();
  const url =
    process.env.PROD_URL ??
    "https://lifequest-jdw2ud40h-piyush-kumars-projects-12a54114.vercel.app";
  const ctx = await browser.newContext({ baseURL: url });
  const page = await ctx.newPage();

  // 1. Landing
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "quest board",
    { ignoreCase: true }
  );

  // 2. Log in as the fresh demo hero
  await page.getByRole("link", { name: "Log In", exact: true }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Enter the Guild" }).click();

  // 3. Character sheet loaded from cloud DB
  await expect(page.getByRole("heading", { name: "DemoHero" })).toBeVisible();
  await expect(page.getByLabel("Level 1")).toBeVisible();

  // 4. Create + complete an epic quest (levels up: 200xp > 100 needed)
  await page.getByRole("button", { name: /New Quest/ }).click();
  await page.getByLabel("Quest name").fill("Forge the production blade");
  await page.getByLabel(/Difficulty/).selectOption("epic");
  await page.getByLabel(/Trains attribute/).selectOption("str");
  await page.getByRole("button", { name: "Post Quest" }).click();
  await expect(page.getByText("Forge the production blade")).toBeVisible();

  await page
    .getByRole("button", { name: /Complete quest: Forge the production blade/ })
    .click();

  // 5. Level-up overlay appears (200 xp >= 100 for level 2)
  await expect(page.getByText("Level Up!")).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel("Level 2")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  // 6. Shop works on prod (catalog loaded from cloud DB)
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: "Guild Shop" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bronze Frame", exact: false }).or(page.getByText("Bronze Frame"))).toBeVisible();

  // 7. REFRESH — the persistence proof (cloud DB)
  await page.goto("/quests");
  await page.reload();
  await expect(page.getByText("Forge the production blade")).toBeVisible();
  await expect(page.getByLabel("Level 2")).toBeVisible();
  await expect(page.getByText(/\b100\b/).first()).toBeVisible(); // 100 gold from epic

  await ctx.close();
});
