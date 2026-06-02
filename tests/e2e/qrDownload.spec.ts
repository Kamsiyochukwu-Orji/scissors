import { test, expect } from "@playwright/test";

test.describe("QR Code Download", () => {
  async function shortenUrl(page: any) {
    await page.goto("/");
    await page.getByTestId("url-input").fill("https://example.com");
    await page.getByTestId("shorten-button").click();
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 10_000,
    });
  }

  test("QR button toggles QR display", async ({ page }) => {
    await shortenUrl(page);
    const qrButton = page.getByRole("button", { name: "QR" });
    await qrButton.click();
    await expect(page.getByTestId("qr-display")).toBeVisible();
  });

  test("SVG download button is present and triggers download", async ({
    page,
  }) => {
    await shortenUrl(page);
    await page.getByRole("button", { name: "QR" }).click();
    await expect(page.getByTestId("download-svg")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("download-svg").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.svg$/);
  });

  test("PNG download button is present and triggers download", async ({
    page,
  }) => {
    await shortenUrl(page);
    await page.getByRole("button", { name: "QR" }).click();
    await expect(page.getByTestId("download-png")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("download-png").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test("color inputs are visible", async ({ page }) => {
    await shortenUrl(page);
    await page.getByRole("button", { name: "QR" }).click();
    await expect(page.getByTestId("fg-color-input")).toBeVisible();
    await expect(page.getByTestId("bg-color-input")).toBeVisible();
  });
});
