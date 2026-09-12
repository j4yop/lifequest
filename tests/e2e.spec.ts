import { test, expect } from "@playwright/test";

const email = `e2e-${Date.now()}@lifequest.dev`;
const password = "questhero123";
const heroName = "E2EWanderer";

test.describe("Life Quest — full journey", () => {
  test("signup, create quest, complete it, level up UI, refresh persists", async ({
    page,
  }) => {
    // ——— 1. Landing ———
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "quest board",
      { ignoreCase: true }
    );

    // ——— 2. Signup ———
    await page.getByRole("link", { name: "Start Free" }).first().click();
    await page.getByLabel("Hero name").fill(heroName);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Begin Adventure" }).click();

    // lands on quest board
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Quest Board",
      { ignoreCase: true }
    );
    await expect(page.getByRole("heading", { name: heroName })).toBeVisible();
    await expect(page.getByLabel("Level 1")).toBeVisible();

    // ——— 3. Create a quest ———
    await page.getByRole("button", { name: /New Quest/ }).click();
    await page.getByLabel("Quest name").fill("Slay the E2E dragon");
    await page.getByLabel(/Difficulty/).selectOption("hard");
    await page.getByLabel(/Trains attribute/).selectOption("str");
    await page.getByRole("button", { name: "Post Quest" }).click();
    await expect(page.getByText("Slay the E2E dragon")).toBeVisible();

    // ——— 4. Empty task validation ———
    await page.getByRole("button", { name: /New Quest/ }).click();
    await page.getByRole("button", { name: "Post Quest" }).click();
    await expect(page.getByText("Every quest needs a name.")).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();

    // ——— 5. Complete it — victory + XP ———
    await page
      .getByRole("button", { name: /Complete quest: Slay the E2E dragon/ })
      .click();
    await expect(page.getByText("100xp", { exact: false })).toBeVisible();

    // ——— 6. Refresh — persistence proof ———
    await page.reload();
    await expect(page.getByText("Slay the E2E dragon")).toBeVisible();
    await expect(page.getByText(/\b45\b/).first()).toBeVisible(); // gold
    await expect(page.getByText("1d streak").first()).toBeVisible();

    // ——— 7. Second session — login flow ———
    // (sign out via the nav button)
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test("login page rejects wrong credentials with visible error", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@lifequest.dev");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Enter the Guild" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
  });
});
