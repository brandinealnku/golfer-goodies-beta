import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/discover");
  await page.evaluate(() => localStorage.clear());
});

test("desktop 1440x900: Summit Pines journey uses the app-bar cart", async ({
  page,
}) => {
  await page.goto("/#/course/summit-pines");
  const courseUrl = page.url();
  const foodProducts = page.getByRole("button", { name: "Food products" });
  await foodProducts.click();
  await expect(page).toHaveURL(courseUrl);
  await expect(foodProducts).toHaveAttribute("aria-pressed", "true");
  await expect(foodProducts).toHaveCSS("background-color", "rgb(9, 47, 36)");
  await expect(page.getByText("Fairway Club")).toBeVisible();
  await expect(page.getByText("Citrus Sparkler")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "View Fairway Club details" }).click();
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

  await expect(page.locator(".floating-cart")).toBeHidden();
  const appBarCart = page
    .locator(".desktop-app-bar")
    .getByLabel("Cart, 1 items");
  await expect(appBarCart).toBeVisible();
  await appBarCart.click();

  await expect(
    page.getByRole("heading", { name: /Summit Pines Resort/ }),
  ).toBeVisible();
  const item = page.locator(".cart-item");
  await expect(item).toContainText("Fairway Club");
  await expect(item).toContainText("$10.95");
  await expect(item.locator("output")).toHaveText("1");
  await expect(page.getByText("Subtotal").locator("..")).toContainText(
    "$10.95",
  );
  await expect(page.getByText("Cedar Bend Municipal")).toHaveCount(0);
});
