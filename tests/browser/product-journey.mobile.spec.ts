import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/discover");
  await page.evaluate(() => localStorage.clear());
});

test("mobile 375x812: Summit Pines pointer journey uses the floating cart", async ({
  page,
}) => {
  await page.goto("/#/course/summit-pines");
  const courseUrl = page.url();
  const allProducts = page.getByRole("button", { name: "All products" });
  const foodProducts = page.getByRole("button", { name: "Food products" });
  const drinkProducts = page.getByRole("button", { name: "Drink products" });
  await foodProducts.click();
  await expect(page).toHaveURL(courseUrl);
  await expect(page.getByText("Fairway Club")).toBeVisible();
  await expect(page.getByText("Citrus Sparkler")).toHaveCount(0);
  await drinkProducts.click();
  await expect(page).toHaveURL(courseUrl);
  await expect(page.getByText("Citrus Sparkler")).toBeVisible();
  await expect(page.getByText("Fairway Club")).toHaveCount(0);
  await allProducts.click();
  await expect(page.getByText("Fairway Club")).toBeVisible();
  await expect(page.getByText("Citrus Sparkler")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toHaveCount(0);

  await foodProducts.click();
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

  await expect(
    page.locator(".mobile-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  const floatingCart = page.locator(".floating-cart");
  await expect(floatingCart).toBeVisible();
  await expect(floatingCart).toContainText("1 item");
  await expect(floatingCart).toContainText("$10.95");
  await drinkProducts.click();
  await expect(page).toHaveURL(courseUrl);
  await expect(
    page.locator(".mobile-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  await expect(floatingCart).toBeVisible();
  await floatingCart.click();

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

test("mobile 375x812: Cedar Bend course-code journey uses the floating cart", async ({
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
  await expect(
    page.locator(".mobile-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  const floatingCart = page.locator(".floating-cart");
  await expect(floatingCart).toBeVisible();
  await expect(floatingCart).toContainText("1 item");
  await expect(floatingCart).toContainText("$4.95");
  await floatingCart.click();

  await expect(
    page.getByRole("heading", { name: /Cedar Bend Municipal/ }),
  ).toBeVisible();
  const item = page.locator(".cart-item");
  await expect(item).toContainText("Citrus Sparkler");
  await expect(item).toContainText("$4.95");
  await expect(item.locator("output")).toHaveText("1");
  await expect(page.getByText("Subtotal").locator("..")).toContainText("$4.95");
  await expect(page.getByText("Summit Pines Resort")).toHaveCount(0);
});
