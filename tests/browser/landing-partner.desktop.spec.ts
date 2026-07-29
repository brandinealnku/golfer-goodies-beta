import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/discover");
  await page.evaluate(() => localStorage.clear());
});

test("public landing is golfer-first and has safe entry points", async ({
  page,
}) => {
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Everything you need/,
  );
  await expect(
    page.getByRole("button", { name: "Find My Course" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Explore participating course storefronts",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View Storefront" }).first().click();
  await expect(page).toHaveURL(/#\/course\//);
  await page.goto("/#/discover");
  await expect(
    page.getByRole("link", { name: "Platform Admin Demo" }),
  ).toBeVisible();
});

test("limited and owner partner navigation never reaches 404", async ({
  page,
}) => {
  await page.goto("/#/partner");
  const limited = page.getByRole("navigation", {
    name: "Course Partner navigation",
  });
  await expect(limited.getByRole("link", { name: "Orders" })).toHaveCount(0);
  for (const link of await limited.getByRole("link").all()) {
    await link.click();
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toHaveCount(0);
    await page.goto("/#/partner");
  }
  await page.goto("/#/account");
  await page.getByRole("button", { name: /owner demo Olivia Owner/i }).click();
  await page.goto("/#/partner");
  const partner = page.getByRole("navigation", {
    name: "Course Partner navigation",
  });
  for (const label of [
    "Overview",
    "Orders",
    "Products",
    "Inventory",
    "Storefront",
    "Fulfillment",
    "Promotions",
    "Analytics",
    "Team",
    "Settings",
  ]) {
    await partner.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(
        `#\\/partner\\/course\\/summit-pines(?:\\/${label.toLowerCase()})?$`,
      ),
    );
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toHaveCount(0);
  }
  await page.goto("/#/partner/products");
  await expect(page).toHaveURL(/#\/partner\/course\/summit-pines\/products/);
  await page.goto("/#/partner/course/not-authorized/orders");
  await expect(
    page.getByRole("heading", { name: "Course access unavailable" }),
  ).toBeVisible();
});

test("essential landing actions remain reachable at mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/#/discover");
  await expect(
    page.getByRole("button", { name: "Find My Course" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Use My Location" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "I Manage a Golf Course" }),
  ).toBeVisible();
});
