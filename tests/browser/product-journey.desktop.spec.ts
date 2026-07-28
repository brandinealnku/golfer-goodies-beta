import { expect, test } from "@playwright/test";

test("desktop 1440x900: ordering session is course scoped and restores focus", async ({
  page,
}) => {
  await page.goto("/#/course/summit-pines");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const opener = page.getByRole("button", {
    name: "View Fairway Club details",
  });
  await opener.focus();
  await opener.press("Enter");
  const product = page.locator(
    '[data-product-id="summit-pines-club-sandwich"]',
  );
  await product.getByRole("radio", { name: "Kettle chips" }).check();
  await product
    .getByRole("button", { name: "Verify you’re at this course" })
    .click();
  const verification = page.locator("[data-verification-sheet]");
  await expect(verification.getByRole("heading")).toHaveText(
    "Confirm you’re at Summit Pines Resort",
  );
  await verification.getByRole("button", { name: "Scan course QR" }).click();
  await verification.getByLabel("Demo QR token").fill("SUMMIT-DEMO-QR");
  await verification.getByRole("button", { name: "Unlock ordering" }).click();
  await expect(
    page.locator(".desktop-app-bar").getByLabel("Cart, 1 items"),
  ).toBeVisible();
  await expect(page.getByText("Ordering Session").first()).toBeVisible();
  await page
    .getByRole("button", { name: "End ordering session" })
    .first()
    .click();
  await expect(page.getByText(/Browse menu/).first()).toBeVisible();
});
