import { test, expect } from "@playwright/test";

/**
 * Sekcje `#expertise` i `#works` zostały scalone w `#what-we-do`, a portfolio
 * rozbito na zakładki — nagłówek pierwszej z nich brzmi dziś pełną nazwą.
 */
const FIRST_TAB_HEADING = "Blockchain Core & Infrastructure";

const MAIN_SECTIONS = [
  "#about",
  "#what-we-do",
  "#end-users",
  "#team",
  "#career",
  "#contact",
];

test.describe("Sections visibility", () => {
  test("About section is visible with content", async ({ page }) => {
    await page.goto("/");

    const about_section = page.locator("#about");
    await expect(about_section).toBeVisible({ timeout: 10000 });

    await expect(about_section.getByText("About Us")).toBeVisible();
    await expect(
      about_section.getByRole("heading", { name: /Software Development/i }),
    ).toBeVisible();
  });

  test("What We Do section is visible with content", async ({ page }) => {
    await page.goto("/");

    const expertise_section = page.locator("#what-we-do");
    await expertise_section.scrollIntoViewIfNeeded();
    await expect(expertise_section).toBeVisible({ timeout: 10000 });

    await expect(expertise_section.getByText("What We Do")).toBeVisible();
    // Nieaktywne panele mają aria-hidden, więc rola `tabpanel` wskazuje ten otwarty.
    await expect(
      expertise_section
        .getByRole("tabpanel")
        .getByRole("heading", { name: FIRST_TAB_HEADING, exact: true }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("All main sections exist on page", async ({ page }) => {
    await page.goto("/");

    for (const section_id of MAIN_SECTIONS) {
      const section = page.locator(section_id);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible({ timeout: 10000 });
    }
  });
});
