import { expect, Page, test } from "@playwright/test"
import { controls, testid } from "./__utils"

const trigger = testid("trigger")
const menu = testid("menu")

const expectToBeFocused = async (page: Page, id: string) => {
  return expect(page.locator(`[id=${id}]`).first()).toHaveAttribute("data-focus", "")
}

test.describe("menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu")
  })

  test("should stay open when `closeOnSelect` is false", async ({ page }) => {
    await controls(page).bool("closeOnSelect", false)
    await page.click(trigger)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter", { delay: 10 })
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should navigate menu items with tab", async ({ page }) => {
    await page.click(trigger)
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expectToBeFocused(page, "duplicate")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Shift+Tab")
    await expectToBeFocused(page, "duplicate")
  })
})
