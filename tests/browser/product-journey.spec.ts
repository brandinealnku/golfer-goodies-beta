import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/discover");
  await page.evaluate(() => localStorage.clear());
});

test("Summit Pines pointer journey opens the portal and reaches the cart", async ({
  page,
}) => {
  await page.goto("/#/course/summit-pines");
  const productAction = page.getByRole("button", {
    name: "View Fairway Club details",
  });
  await expect(productAction).toContainText("View details");
  await productAction.click();

  const productSheet = page.locator(
    '[data-product-sheet][data-product-id="summit-pines-club-sandwich"]',
  );
  await expect(productSheet).toBeVisible();
  await productSheet
    .getByRole("button", { name: "Start round to order" })
    .click();
  await expect(page.locator("[data-verification-sheet]")).toBeVisible();
  await page.getByRole("button", { name: "Verify and start round" }).click();
  await expect(productSheet).toBeVisible();
  await productSheet.getByRole("radio", { name: "Kettle chips" }).check();
  await productSheet.getByRole("button", { name: /Add ·/ }).click();

  await expect(page.getByLabel("Cart, 1 items").first()).toBeVisible();
  const floatingCart = page.locator(".floating-cart");
  await expect(floatingCart).toBeVisible();
  await floatingCart.click();
  await expect(
    page.getByRole("heading", { name: "Fairway Club" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Summit Pines Resort/ }),
  ).toBeVisible();
});

test("Cedar Bend course-code journey restores the product and updates its cart", async ({
  page,
}) => {
  await page.goto("/#/course/cedar-bend-muni");
  await page
    .getByRole("button", { name: "View Citrus Sparkler details" })
    .click();
  const productSheet = page.locator(
    '[data-product-sheet][data-product-id="cedar-bend-muni-sparkler"]',
  );
  await expect(productSheet).toBeVisible();
  await productSheet
    .getByRole("button", { name: "Start round to order" })
    .click();

  const verificationSheet = page.locator("[data-verification-sheet]");
  await expect(verificationSheet).toBeVisible();
  await verificationSheet.getByRole("button", { name: "Course code" }).click();
  await verificationSheet.getByLabel("Demo course code").fill("CEDAR3");
  await verificationSheet
    .getByRole("button", { name: "Verify and start round" })
    .click();

  await expect(productSheet).toBeVisible();
  await productSheet.getByRole("button", { name: /Add ·/ }).click();
  await expect(page.getByLabel("Cart, 1 items").first()).toBeVisible();
  await page.locator(".floating-cart").click();
  await expect(
    page.getByRole("heading", { name: "Citrus Sparkler" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Cedar Bend Municipal/ }),
  ).toBeVisible();
});
