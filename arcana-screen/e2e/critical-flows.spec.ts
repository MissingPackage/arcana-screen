import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const createScreen = async (page: Page, name = "E2E Screen") => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Create a useful screen first" }),
  ).toBeVisible();
  await page.getByLabel(/Screen name/).fill(name);
  await page.getByRole("button", { name: "Create General Screen" }).click();
  await expect(
    page.getByRole("combobox", { name: "Current screen" }),
  ).toContainText(name);
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("arcana-e2e-ready")) {
      window.localStorage.clear();
      window.sessionStorage.setItem("arcana-e2e-ready", "true");
    }
  });
});

test("@critical creates, runs, captures and resumes a screen", async ({
  page,
}) => {
  await createScreen(page);

  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Quick capture").fill("The east ward cracked");
  await page.getByRole("button", { name: "Save capture" }).click();
  await expect(page.getByText("The east ward cracked")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("The east ward cracked")).toBeVisible();
});

test("@critical exports and imports a portable backup", async ({ page }) => {
  await createScreen(page, "Portable Screen");
  await page.locator('summary[aria-label="Help and resources"]').click();
  await page.getByRole("button", { name: "Data & recovery" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();

  const input = page.getByLabel("Backup file");
  await input.setInputFiles(path!);
  const dialog = page.getByRole("dialog", { name: "Data and recovery" });
  await expect(
    dialog.getByText("Portable Screen", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Replace current screens").check();
  await page.getByRole("button", { name: "Confirm import" }).click();
  await expect(page.getByText("1 screen imported")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Current screen" }),
  ).toContainText("Portable Screen");
});

test("@critical has no automatic WCAG 2.2 A/AA violations in the core shell", async ({
  page,
}) => {
  await page.goto("/");
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
  expect((await scan()).violations).toEqual([]);

  await page.getByLabel(/Screen name/).fill("Accessible Screen");
  await page.getByRole("button", { name: "Create General Screen" }).click();
  expect((await scan()).violations).toEqual([]);

  await page.getByRole("button", { name: "Run", exact: true }).click();
  expect((await scan()).violations).toEqual([]);
});

test("@critical supports keyboard skip navigation and 200% reflow equivalent", async ({
  page,
}) => {
  await createScreen(page);
  await page.reload();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.setViewportSize({ width: 640, height: 720 });
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("@critical provides keyboard alternatives for structural reordering", async ({
  page,
}) => {
  await createScreen(page);
  const firstTool = page.locator("[data-tool-type]").first();
  await firstTool.getByRole("button", { name: "Configure" }).click();
  const moveLater = firstTool.getByRole("button", { name: "Move later" });
  if (await moveLater.isEnabled()) {
    const originalType = await firstTool.getAttribute("data-tool-type");
    await moveLater.click();
    await expect(page.locator("[data-tool-type]").nth(1)).toHaveAttribute(
      "data-tool-type",
      originalType!,
    );
  }
});

test("@critical stays local-first during ordinary runtime", async ({
  page,
}) => {
  const crossOriginRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:4173")
      crossOriginRequests.push(request.url());
  });
  await createScreen(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.getByRole("button", { name: "Roll" }).click();
  expect(crossOriginRequests).toEqual([]);
});

test("@critical keeps startup and mode switching inside the performance budget", async ({
  page,
}) => {
  await createScreen(page);
  const startup = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    return navigation.domContentLoadedEventEnd - navigation.startTime;
  });
  expect(startup).toBeLessThan(3_000);

  const startedAt = await page.evaluate(() => performance.now());
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const interaction = await page.evaluate(
    (start) => performance.now() - start,
    startedAt,
  );
  expect(interaction).toBeLessThan(1_000);
});

test("@critical persists reduced motion and applies the override", async ({
  page,
}) => {
  await createScreen(page);
  await page.locator('summary[aria-label="Help and resources"]').click();
  await page.getByRole("button", { name: "Reduce interface motion" }).click();
  await expect(page.locator("body")).toHaveClass(/reduce-motion/);
  const durations = await page
    .locator(".workspace-toolbar")
    .evaluate((element) => ({
      animation: getComputedStyle(element).animationDuration,
      transition: getComputedStyle(element).transitionDuration,
    }));
  expect(Number.parseFloat(durations.animation)).toBeLessThanOrEqual(0.00001);
  expect(Number.parseFloat(durations.transition)).toBeLessThanOrEqual(0.00001);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/reduce-motion/);
});

test("@critical exposes 44px touch targets on the mobile project", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Touch-target gate runs in the mobile project.",
  );
  await createScreen(page);
  const undersized = await page.locator("body").evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "button, a[href], input, textarea, select, summary",
      ),
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none"
        );
      })
      .map((element) => {
        const controlRect = element.getBoundingClientRect();
        const labelRect = element.matches(
          'input[type="radio"], input[type="checkbox"]',
        )
          ? element.closest("label")?.getBoundingClientRect()
          : undefined;
        const rect = labelRect && labelRect.width > 0 ? labelRect : controlRect;
        return {
          name:
            element.getAttribute("aria-label") ?? element.textContent?.trim(),
          width: rect.width,
          height: rect.height,
        };
      })
      .filter(({ width, height }) => width < 44 || height < 44),
  );
  expect(undersized).toEqual([]);
});

test("@critical timer stays truthful after a long background suspension", async ({
  page,
}) => {
  // Fake clock: fastForward jumps time firing timers at most once — the
  // "laptop lid closed, reopened later" scenario (ROADMAP M2.5 open prova).
  await page.clock.install();
  await createScreen(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();

  const timerTool = page.getByRole("region", { name: "Session timer" });
  await page.getByRole("button", { name: "Set time" }).click();
  await page.getByLabel("Timer minutes").fill("30");
  await page.getByLabel("Timer seconds").fill("0");
  await timerTool.getByRole("button", { name: "Start" }).click();
  await expect(timerTool.locator("time")).toHaveText("30:00");

  // A few seconds of live ticking, then a 12-minute suspension: no interval
  // ticks fire during the gap, so only endAt arithmetic can keep this honest.
  await page.clock.runFor(3_000);
  await page.clock.fastForward("12:00");
  await expect(timerTool.locator("time")).toHaveText(/^17:5[0-7]$/);

  // Reload while running: the persisted end timestamp must survive.
  await page.reload();
  await expect(timerTool.locator("time")).toHaveText(/^17:[45][0-9]$/);

  // Suspend far past the deadline: completes at 00:00, never negative,
  // and the control returns to Start (running state cleared).
  await page.clock.fastForward("20:00");
  await expect(timerTool.locator("time")).toHaveText("00:00");
  await expect(timerTool.getByRole("button", { name: "Start" })).toBeVisible();
});
