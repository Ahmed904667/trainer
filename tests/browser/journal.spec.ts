import { test, expect, type Page } from "@playwright/test";
async function screen(page: Page, name: string) {
  await page.evaluate((name) => {
    location.hash = name;
  }, name);
  await expect(page.locator("h1")).toBeVisible();
}
test("mobile workout survives offline restart and saves an accurate snapshot", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.setFixedTime(new Date("2026-11-17T15:00:00Z"));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start workout", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((r) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => r(),
          { once: true },
        ),
      );
  });
  for (const width of [320, 375, 430, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Enter a weight" }),
  ).toContainText("Enter a weight");
  await page.getByLabel("Weight for set 1", { exact: true }).fill("40");
  await page.getByLabel("Reps for set 1", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.getByLabel("Unmark set 1", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Pause rest", { exact: true })).toBeVisible();
  await page.getByLabel("Pause rest", { exact: true }).click();
  await page.getByRole("button", { name: "+30s", exact: true }).click();
  await page.getByLabel("Skip rest", { exact: true }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByLabel("Weight for set 1", { exact: true }),
  ).toHaveValue("40");
  await expect(page.getByLabel("Unmark set 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await expect(
    page.getByLabel("Reps for set 4", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Set 4 options", { exact: true }).click();
  await page.getByRole("button", { name: "Delete set" }).click();
  await expect(page.getByLabel("Reps for set 4", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Technique", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "How to perform" }),
  ).toBeVisible();
  await page.getByLabel("Close dialog").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByLabel("Session notes").fill("Offline test");
  await page.getByRole("button", { name: "Finish and save" }).click();
  await expect(page.locator("h1")).toHaveText("Workout history");
  await page.getByRole("button", { name: /Push A/ }).click();
  await expect(page.getByText("40 kg × 10", { exact: true })).toBeVisible();
  await expect(page.getByText("Offline test", { exact: true })).toBeVisible();
  await page.getByLabel("Close dialog").click();
  await screen(page, "Progress");
  await expect(
    page.getByRole("heading", { name: "Strength progression" }),
  ).toBeVisible();
  await context.setOffline(false);
  await screen(page, "Plan");
  await expect(page.getByLabel("Next workout")).toHaveValue("pull-a");
  await page.getByLabel("Edit Push A", { exact: true }).click();
  await page.getByLabel("Workout name").fill("Push revised");
  await page.getByRole("button", { name: "Save template" }).click();
  await screen(page, "History");
  await expect(page.getByRole("button", { name: /Push A/ })).toBeVisible();
  expect(errors).toEqual([]);
});
test("rest day dashboard offers manual training", async ({ page }) => {
  for (const date of ["2026-11-16", "2026-11-19"]) {
    await page.clock.setFixedTime(new Date(date + "T12:00:00Z"));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Rest day" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start workout", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Train on rest day" }),
    ).toBeVisible();
  }
});
test("private sync, offline replay, conflict detection and account isolation", async ({
  browser,
  page,
  context,
  baseURL,
}) => {
  const origin = baseURL!,
    email = "fixture-" + crypto.randomUUID() + "@example.test",
    password = "local-fixture-" + crypto.randomUUID();
  await page.goto("/#Settings");
  test.skip(
    !(await (await page.request.get("/api/auth")).json()).configured,
    "Requires a disposable PostgreSQL database",
  );
  await page.getByRole("button", { name: "Create a new account" }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByText("Synced", { exact: true }).first()).toBeVisible();
  const other = await browser.newContext({ baseURL: origin });
  const headers = { origin };
  let res = await other.request.get("/api/sync");
  expect(res.status()).toBe(401);
  res = await other.request.post("/api/auth", {
    headers,
    data: { action: "login", email, password },
  });
  expect(res.ok()).toBe(true);
  const before = await (await other.request.get("/api/sync")).json();
  await screen(page, "Workout");
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page.getByLabel("Weight for set 1", { exact: true }).fill("55");
  await page.getByLabel("Reps for set 1", { exact: true }).fill("8");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await (await other.request.get("/api/sync")).json()).journal.active
          ?.items[0].sets[0].weight,
    )
    .toBe(55);
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish and save" }).click();
  await expect(page.locator("h1")).toHaveText("Workout history");
  await context.setOffline(false);
  await expect
    .poll(
      async () =>
        (await (await other.request.get("/api/sync")).json()).journal.history
          .length,
    )
    .toBe(1);
  const remote = await (await other.request.get("/api/sync")).json();
  expect(remote.journal.active).toBeNull();
  expect(remote.journal.prefs.next).toBe("pull-a");
  const change = {
    id: crypto.randomUUID(),
    revision: remote.revision,
    sessions: [remote.journal.history[0]],
    removed: [],
  };
  for (let i = 0; i < 2; i++) {
    const r = await other.request.post("/api/sync", { headers, data: change });
    expect(r.status()).toBe(200);
    expect((await r.json()).revision).toBe(remote.revision + 1);
  }
  expect(
    (
      await other.request.post("/api/sync", {
        headers,
        data: { ...change, id: crypto.randomUUID(), revision: before.revision },
      })
    ).status(),
  ).toBe(409);
  const stranger = await browser.newContext({ baseURL: origin });
  expect(
    (
      await stranger.request.post("/api/auth", {
        headers,
        data: { action: "register", email: "second-" + email, password },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (await (await stranger.request.get("/api/sync")).json()).journal,
  ).toBeNull();
  expect(
    (
      await other.request.post("/api/auth", {
        headers,
        data: { action: "logout" },
      })
    ).ok(),
  ).toBe(true);
  expect((await other.request.get("/api/sync")).status()).toBe(401);
  await stranger.close();
  await other.close();
});
