import { test, expect } from "@playwright/test";

test.describe("Sections visibility", () => {
  test("About section is visible with content", async ({ page }) => {
    await page.goto("/");

    const about_section = page.locator("#about");
    await expect(about_section).toBeVisible({ timeout: 10000 });

    await expect(about_section.getByText("About Us")).toBeVisible();
    await expect(about_section.getByRole("heading", { name: /Software Development/i })).toBeVisible();
  });

  test("Expertise section is visible with content", async ({ page }) => {
    await page.goto("/");

    const expertise_section = page.locator("#expertise");
    await expertise_section.scrollIntoViewIfNeeded();
    await expect(expertise_section).toBeVisible({ timeout: 10000 });

    await expect(expertise_section.getByText("What We Do")).toBeVisible();
    await expect(expertise_section.getByRole("heading", { name: "Blockchain", exact: true })).toBeVisible();
  });

  test("All main sections exist on page", async ({ page }) => {
    await page.goto("/");

    const sections = ["#about", "#expertise", "#works", "#team", "#career", "#contact"];

    for (const section_id of sections) {
      const section = page.locator(section_id);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible({ timeout: 10000 });
    }
  });
});
