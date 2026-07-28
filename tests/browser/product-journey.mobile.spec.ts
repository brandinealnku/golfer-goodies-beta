import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/discover");
  await page.evaluate(() => localStorage.clear());
});

test("mobile 375x812: verification preserves and automatically adds intent", async ({
  page,
}) => {
  await page.goto("/#/course/summit-pines");
  const courseUrl = page.url();
  await page.getByRole("button", { name: "View Fairway Club details" }).click();
  const product = page.locator(
    '[data-product-id="summit-pines-club-sandwich"]',
  );
  await product.getByRole("radio", { name: "Kettle chips" }).check();
  await product
    .getByRole("button", { name: "Verify you’re at this course" })
    .click();
  const verification = page.locator("[data-verification-sheet]");
  await expect(verification).toBeVisible();
  await expect(verification.getByRole("heading")).toHaveText(
    "Confirm you’re at Summit Pines Resort",
  );
  await expect(page.getByText(/Start round|Active Round/i)).toHaveCount(0);
  await verification.getByRole("button", { name: "Use my location" }).click();
  await verification.getByRole("button", { name: "Check location" }).click();
  await expect(verification).toBeHidden();
  await expect(
    page.locator(".mobile-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  await expect(
    page.getByText("Ordering unlocked at Summit Pines Resort").first(),
  ).toBeVisible();
  await expect(page).toHaveURL(courseUrl);
  await page.locator(".floating-cart").click();
  await expect(page.locator(".cart-item")).toContainText("Fairway Club");
  await expect(page.locator(".cart-item")).toContainText("Kettle chips");
});

test("mobile 375x812: uncertain location retains intent for course-code fallback", async ({
  page,
}) => {
  await page.goto("/#/course/cedar-bend-muni");
  await page
    .getByRole("button", { name: "View Citrus Sparkler details" })
    .click();
  await page
    .getByRole("button", { name: "Verify you’re at this course" })
    .click();
  const verification = page.locator("[data-verification-sheet]");
  await verification.getByRole("button", { name: "Use my location" }).click();
  await verification.getByRole("button", { name: "Check location" }).click();
  await expect(
    verification.getByText(/location may overlap|cannot be unlocked/),
  ).toBeVisible();
  await verification.getByRole("button", { name: "Enter course code" }).click();
  await verification.getByLabel("Demo course code").fill("CEDAR3");
  await verification.getByRole("button", { name: "Unlock ordering" }).click();
  await expect(
    page.locator(".mobile-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  await page.locator(".floating-cart").click();
  await expect(page.locator(".cart-item")).toContainText("Citrus Sparkler");
});
