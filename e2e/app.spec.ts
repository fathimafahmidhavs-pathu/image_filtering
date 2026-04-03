import { test, expect } from "@playwright/test";
import path from "path";

const fixturePath = path.join(__dirname, "fixtures", "test-image.png");

test.describe("Image Filter App", () => {
  test("shows upload zone on initial load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Drop an image here")).toBeVisible();
  });

  test("upload via file picker shows canvas", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });
  });

  test("all filter buttons are visible after upload", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    const filters = [
      "Original", "Grayscale", "Sepia", "Invert",
      "Brightness / Contrast", "Fade", "Cross-Process",
      "Barrel", "Ripple", "Swirl",
    ];
    for (const label of filters) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("clicking a filter button applies it without errors", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    const filterButtons = ["Grayscale", "Sepia", "Invert", "Fade", "Cross-Process", "Barrel", "Ripple", "Swirl"];
    for (const label of filterButtons) {
      await page.getByRole("button", { name: label }).click();
      // No JS errors should have occurred
      await expect(page.locator("canvas")).toBeVisible();
    }
  });

  test("brightness/contrast sliders appear when that filter is selected", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Brightness / Contrast" }).click();
    await expect(page.getByText("Brightness", { exact: true })).toBeVisible();
    await expect(page.getByText("Contrast", { exact: true })).toBeVisible();
    await expect(page.locator('input[type="range"]')).toHaveCount(2);
  });

  test("sliders update canvas without errors", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Brightness / Contrast" }).click();
    const sliders = page.locator('input[type="range"]');
    await sliders.first().fill("50");
    await sliders.first().dispatchEvent("input");
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("download button is visible after upload", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  });

  test("download button triggers a download", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("filtered.png");
  });

  test("upload new image button resets to upload zone", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Upload new image" }).click();
    await expect(page.getByText("Drop an image here")).toBeVisible();
  });
});
