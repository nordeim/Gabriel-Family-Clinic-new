import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Gabriel Family Clinic/);
  });

  test("should display main heading", async ({ page }) => {
    const heading = page.getByRole("heading", { name: /Gabriel Family Clinic/i });
    await expect(heading).toBeVisible();
  });

  test("should have accessible skip link", async ({ page }) => {
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeInTheDocument();
  });

  test("should display all status cards", async ({ page }) => {
    const statusCards = page.locator(".card");
    await expect(statusCards).toHaveCount(6);
  });

  test("should pass accessibility tests", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag2aaa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have minimum touch target sizes", async ({ page }) => {
    // Check that interactive elements have minimum 44px height
    const links = page.getByRole("link");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("should have correct color contrast", async ({ page }) => {
    // This test uses axe-core to check for contrast issues
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aaa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast-enhanced"
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test("should be responsive on mobile", async ({ page, viewport }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const heading = page.getByRole("heading", { name: /Gabriel Family Clinic/i });
    await expect(heading).toBeVisible();
    
    // Verify content is not overflowing
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });
});
