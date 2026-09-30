import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const scanForViolations = (page: Page) =>
  new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

// The combat live editor only exists once a combatant is selected, so every scan
// that stops at the Focus surface is blind to it — and it is where the densest
// controls live (HP steps, tie reorder, condition toggles). Opening it is what
// makes those controls visible to axe at all.
const openCombatEditor = async (page: Page) => {
  const focusNav = page.getByRole("navigation", { name: "Session Focus" });
  await focusNav.getByRole("button", { name: "Combat" }).click();
  await expect(
    focusNav.getByRole("button", { name: "Combat" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: /^Manage / })
    .first()
    .click();
  await expect(
    page.getByRole("region", { name: /^Live controls for / }),
  ).toBeVisible();
};

// Below 820px the dock is a one-row bar (Roll, result, timer); the other tools open
// on demand. Wider viewports have no toggle and show everything.
const openDockTools = async (page: Page) => {
  const toggle = page.getByRole("button", { name: "Tools", exact: true });
  if (await toggle.isVisible()) await toggle.click();
};

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

// The screen lifecycle rows of the acceptance matrix had only dated manual
// passes in the browser; these three make them repeatable.
const currentScreen = (page: Page) =>
  page.getByRole("combobox", { name: "Current screen" });
const focusButton = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Session Focus" })
    .getByRole("button", { name });

test("@critical creates, switches and resumes screens, each with its own Focus", async ({
  page,
}) => {
  await createScreen(page, "Vhal Streets");
  await page.getByRole("button", { name: "New screen" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Crypt Fight");
  await page.getByRole("radio", { name: /Combat/ }).check();
  await page.getByRole("button", { name: "Create screen" }).click();
  await expect(currentScreen(page)).toHaveValue(/.+/);
  await expect(currentScreen(page).locator("option:checked")).toHaveText("Crypt Fight");

  await page.getByRole("button", { name: "Run", exact: true }).click();
  await focusButton(page, "Combat").click();
  await currentScreen(page).selectOption({ label: "Vhal Streets" });
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await focusButton(page, "Social").click();

  await currentScreen(page).selectOption({ label: "Crypt Fight" });
  await expect(focusButton(page, "Combat")).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(currentScreen(page).locator("option:checked")).toHaveText("Crypt Fight");
  await expect(focusButton(page, "Combat")).toHaveAttribute("aria-pressed", "true");
  await currentScreen(page).selectOption({ label: "Vhal Streets" });
  await expect(focusButton(page, "Social")).toHaveAttribute("aria-pressed", "true");
});

test("@critical renames, duplicates, deletes and undoes a delete", async ({
  page,
}) => {
  await createScreen(page, "Vhal Streets");
  await page.getByRole("button", { name: "Manage screens" }).click();
  const item = (name: string) =>
    page.locator(".screen-list__item").filter({ hasText: name });

  await item("Vhal Streets").getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("Screen name", { exact: true }).fill("Vhal Old Town");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(currentScreen(page).locator("option:checked")).toHaveText("Vhal Old Town");

  await item("Vhal Old Town").getByRole("button", { name: "Duplicate" }).click();
  await expect(item("Vhal Old Town copy")).toHaveCount(1);

  await item("Vhal Old Town copy").getByRole("button", { name: "Delete" }).click();
  await expect(item("Vhal Old Town copy")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(item("Vhal Old Town copy")).toHaveCount(1);

  await page.reload();
  await page.getByRole("button", { name: "Manage screens" }).click();
  await expect(item("Vhal Old Town")).toHaveCount(2);
  await expect(item("Vhal Old Town copy")).toHaveCount(1);
});

test("@critical keeps Run protected and loses nothing across Prepare and Run", async ({
  page,
}) => {
  await createScreen(page);
  await expect(page.getByRole("button", { name: "Manage screens" })).toBeVisible();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  // Run is protected live play: no structural controls.
  await expect(page.getByRole("button", { name: "Manage screens" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "New screen" })).toHaveCount(0);

  await focusButton(page, "Exploration").click();
  await page.getByLabel("Quick capture").fill("A cold draft from the well");
  await page.getByRole("button", { name: "Save capture" }).click();

  await page.getByRole("button", { name: "Prepare", exact: true }).click();
  await expect(page.getByRole("button", { name: "Manage screens" })).toBeVisible();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(focusButton(page, "Exploration")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("A cold draft from the well").first()).toBeVisible();
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
  const scan = () => scanForViolations(page);
  expect((await scan()).violations).toEqual([]);

  await page.getByLabel(/Screen name/).fill("Accessible Screen");
  await page.getByRole("button", { name: "Create General Screen" }).click();
  expect((await scan()).violations).toEqual([]);

  await page.getByRole("button", { name: "Run", exact: true }).click();
  expect((await scan()).violations).toEqual([]);

  // Also on mobile: until D27 the dock painted over the initiative footer at 390px,
  // so this scan was desktop-only.
  await openCombatEditor(page);
  expect((await scan()).violations).toEqual([]);
});

test("@critical has no automatic WCAG 2.2 A/AA violations in dark theme", async ({
  page,
}) => {
  // The light-only scan above was blind to three real dark-theme contrast bugs
  // (docket D2/D4/D11): each was a custom surface that went dark while a nested
  // piece stayed light — invisible unless the same surfaces are scanned dark.
  //
  // Flipping the theme starts a colour transition on every themed surface, and
  // axe samples computed colours synchronously: without this the scan reads
  // half-blended backgrounds and reports different phantom violations per
  // engine. The app zeroes all durations under prefers-reduced-motion.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await createScreen(page, "Dark Screen");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("body")).toHaveClass(/dark-theme/);

  const violationsOn = async (surface: string) => {
    const { violations } = await scanForViolations(page);
    // Name the surface and the node: an unattended CI run otherwise reports
    // only a bare count, which says nothing about which element regressed.
    const found = violations.flatMap((violation) =>
      violation.nodes.map(
        (node) =>
          `${violation.id} → ${node.target.join(" ")} :: ${node.any
            .map((check) => check.message)
            .join(" | ")}`,
      ),
    );
    expect(found, surface).toEqual([]);
  };

  await violationsOn("Prepare");

  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  const focusNav = page.getByRole("navigation", { name: "Session Focus" });
  for (const focus of ["Narrative", "Social", "Exploration", "Combat"]) {
    await focusNav.getByRole("button", { name: focus }).click();
    await expect(focusNav.getByRole("button", { name: focus })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await violationsOn(`Run / ${focus}`);
  }

  // States a Focus-level scan never opens, each of which hid a dark-theme bug
  // (docket D36): white oracle buttons under light ink (1.44:1), the dice error
  // in a fixed red (2.19:1), and a scrolling notebook with no tab stop once a
  // capture lengthens it.
  await openDockTools(page);
  await page.getByRole("button", { name: "Dice options" }).click();
  await page.getByLabel("Dice formula").fill("2d6+3");
  await page.getByRole("button", { name: "Advantage", exact: true }).click();
  await page.getByRole("button", { name: "Roll" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await violationsOn("Run / dice options with an error");
  await page.getByRole("button", { name: "Dice options" }).click();
  await page.getByRole("button", { name: /Oracle/ }).click();
  await page
    .getByRole("group", { name: "Oracle" })
    .getByRole("button", { name: "Likely", exact: true })
    .click();
  await violationsOn("Run / oracle answered");
  await page.getByRole("button", { name: /Oracle/ }).click();
  await focusNav.getByRole("button", { name: "Narrative" }).click();
  for (const text of ["The east ward cracked", "Vessa lied about the key", "Bells at midnight"]) {
    await page.getByLabel("Quick capture").fill(text);
    await page.getByRole("button", { name: "Save capture" }).click();
  }
  await violationsOn("Run / Narrative after captures");

  // Dark is where this surface has actually failed before: the condition chips
  // carried a hardcoded ink colour with no dark override and read 2.02:1, which a
  // light-only scan called clean (iter. 19).
  await openCombatEditor(page);
  await violationsOn("Run / Combat / live editor");

  // The theme must survive a reload, or the gate silently degrades to light.
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/dark-theme/);
  await violationsOn("Run after reload");
});

test("@critical supports keyboard skip navigation and reflows at 320px", async ({
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

  // WCAG 1.4.10 reflow is 320 CSS px wide (400% of 1280). This used to check 640px
  // only, and missed two header panels that opened partly off-screen at every width
  // up to phones: Search (144px off the left edge at 390px) and the settings in Help
  // and resources (42px off the right edge, even at 1280px). Docket D26.
  await page.setViewportSize({ width: 320, height: 640 });
  const offScreen = () =>
    page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const outside = [
        ...document.querySelectorAll<HTMLElement>(
          "details[open] :is(button, input, select, textarea, a, label)",
        ),
      ]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && (box.left < -1 || box.right > width + 1);
        })
        .map((element) => element.textContent?.trim().slice(0, 24) || element.tagName);
      return {
        scroll: document.documentElement.scrollWidth - width,
        outside,
      };
    });
  // Top-level panels only: WebKit reports the summary of a <details> nested in a
  // closed panel as visible, so clicking it hits the header instead.
  const summaries = page.locator(
    ".arcana-header details:not(details details) > summary",
  );
  for (const mode of ["Prepare", "Run"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    expect(await offScreen(), `${mode}, panels closed`).toEqual({ scroll: 0, outside: [] });
    for (let index = 0; index < (await summaries.count()); index++) {
      const summary = summaries.nth(index);
      if (!(await summary.isVisible())) continue;
      await summary.click();
      // Nested disclosures (Appearance & language in Help) hold the settings rows.
      await page.evaluate(() =>
        document.querySelectorAll("details[open] details").forEach((details) => {
          (details as HTMLDetailsElement).open = true;
        }),
      );
      expect(
        await offScreen(),
        `${mode}, ${(await summary.getAttribute("aria-label")) ?? (await summary.textContent())} open`,
      ).toEqual({ scroll: 0, outside: [] });
      // Party setup is a full-screen sheet at this width and covers its own
      // summary, so every panel is closed the same way.
      await page.evaluate(() =>
        document.querySelectorAll("details[open]").forEach((details) => {
          (details as HTMLDetailsElement).open = false;
        }),
      );
    }
  }

  // Focus labels stayed on one line only down to 390px: "Explorati / on" at 320.
  const labelLines = await page.evaluate(() =>
    [...document.querySelectorAll(".focus-selector__option")].map((option) => {
      const walker = document.createTreeWalker(option, NodeFilter.SHOW_TEXT);
      const tops = new Set<number>();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects())
          if (rect.width > 0) tops.add(Math.round(rect.top));
      }
      return `${option.textContent?.trim()}: ${tops.size}`;
    }),
  );
  expect(labelLines).toEqual(["Narrative: 1", "Social: 1", "Exploration: 1", "Combat: 1"]);
});

test("@critical keeps header controls from painting over each other at narrow widths", async ({
  page,
}) => {
  // The utility bar (Search, Edit party, theme, help) was absolutely positioned with
  // a hole sized for two icons; once it grew it painted over the Screen switcher at
  // 390px and over the Prepare/Run toggle up to 1100px, in both modes (docket D33).
  // A long name widens the select past its shrunk picker: that overlap also hit
  // the Prepare/Run toggle on a 1487px desktop.
  await createScreen(page, "A rather long screen name");
  const overlaps = () =>
    page.evaluate(() => {
      const controls = [
        ...document.querySelectorAll<HTMLElement>(
          ".arcana-header button, .arcana-header select, .arcana-header summary",
        ),
      ].filter((element) => {
        const box = element.getBoundingClientRect();
        // Content of a <details> is not painted while closed, yet still reports a box,
        // so a control counts only if every enclosing <details> is either closed with
        // this control as its own <summary>, or not involved. Open panels are overlays
        // by design and are not opened here.
        let painted = true;
        for (
          let details = element.closest("details");
          details;
          details = details.parentElement?.closest("details") ?? null
        ) {
          const isOwnSummary =
            details.querySelector(":scope > summary") === element;
          if (!isOwnSummary && !details.open) painted = false;
        }
        return box.width > 0 && box.height > 0 && painted;
      });
      const hits: string[] = [];
      controls.forEach((a, i) =>
        controls.slice(i + 1).forEach((b) => {
          if (a.contains(b) || b.contains(a)) return;
          const A = a.getBoundingClientRect();
          const B = b.getBoundingClientRect();
          const x = Math.min(A.right, B.right) - Math.max(A.left, B.left);
          const y = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
          if (x > 1 && y > 1)
            hits.push(
              `${a.textContent?.trim() || a.getAttribute("aria-label")} x ${b.textContent?.trim() || b.getAttribute("aria-label")}`,
            );
        }),
      );
      return hits;
    });

  for (const width of [390, 768, 1100, 1487]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole("button", { name: "Prepare", exact: true }).click();
    expect(await overlaps(), `Prepare at ${width}px`).toEqual([]);
    await page.getByRole("button", { name: "Run", exact: true }).click();
    expect(await overlaps(), `Run at ${width}px`).toEqual([]);
  }
});

test("@critical keeps every Run control reachable below 820px in every Focus", async ({
  page,
}) => {
  // Below 820px the Run stacks into one column, but the shell stayed locked to
  // 100dvh with overflow hidden: the stacked content overflowed a box that could
  // not scroll, and the dock painted over it. Up to 11 controls per Focus were
  // unreachable at 390px (docket D27). A control counts as reachable when
  // scrolling it into view leaves its centre inside the viewport and on top.
  await createScreen(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  const unreachable = () =>
    page.evaluate(() => {
      const misses: string[] = [];
      const controls = document.querySelectorAll<HTMLElement>(
        ".run-workspace :is(button, input, select, textarea, a[href], summary)",
      );
      for (const element of controls) {
        const before = element.getBoundingClientRect();
        if (before.width < 2 || before.height < 2) continue;
        element.scrollIntoView({ block: "center", inline: "nearest" });
        const box = element.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const hit = document.elementFromPoint(x, y);
        const inView =
          x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight;
        if (!inView || !hit || !(element.contains(hit) || hit.contains(element)))
          misses.push(
            element.getAttribute("aria-label") ||
              element.textContent?.trim().slice(0, 30) ||
              element.tagName,
          );
      }
      return misses;
    });

  const focusNav = page.getByRole("navigation", { name: "Session Focus" });
  const found: Record<string, string[]> = {};
  const record = async (label: string) => {
    const misses = await unreachable();
    if (misses.length) found[label] = misses;
  };
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [820, 1180],
  ]) {
    await page.setViewportSize({ width, height });
    for (const focus of ["Narrative", "Social", "Exploration", "Combat"]) {
      await focusNav.getByRole("button", { name: focus }).click();
      // Spec: dice and timer immediately available in every Focus, so the bar is
      // in view from the top of the page, with no scrolling (D35).
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.getByRole("button", { name: "Roll" })).toBeInViewport();
      await expect(
        page.getByRole("region", { name: "Session timer" }).getByRole("button", { name: "Start" }),
      ).toBeInViewport();
      await record(`${focus} at ${width}px`);
      await openDockTools(page);
      await record(`${focus} at ${width}px, dock open`);
      await page.getByRole("button", { name: "Less", exact: true }).click();
    }
    await openCombatEditor(page);
    await record(`Combat editor at ${width}px`);
  }
  expect(found).toEqual({});
});

test("@critical opens the combat editor right under the tapped row", async ({
  page,
}) => {
  // The editor used to render after the whole list: up to 587px from the tapped row,
  // and off-screen on a phone (DM P1, docket D28).
  await createScreen(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Session Focus" })
    .getByRole("button", { name: "Combat" })
    .click();
  const rows = page.getByRole("button", { name: /^Manage / });
  for (const [width, height] of [
    [1487, 1058],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const index of [0, (await rows.count()) - 1]) {
      await rows.nth(index).click();
      const editor = page.getByRole("region", { name: /^Live controls for / });
      await expect(editor).toBeInViewport();
      const gap = await page.evaluate((rowIndex) => {
        const articles = document.querySelectorAll(".combatant-list > article");
        const row = articles[rowIndex].getBoundingClientRect();
        const box = document.querySelector(".combat-live-editor")!.getBoundingClientRect();
        return Math.round(box.top - row.bottom);
      }, index);
      expect(gap, `row ${index + 1} at ${width}px`).toBeLessThanOrEqual(16);
      await rows.nth(index).click();
    }
  }
});

test("@critical shows eight combatants at once in compact density on a table device", async ({
  page,
}, testInfo) => {
  // The point of compact, per the DM: eight combatants at a glance. On a 13-inch
  // laptop (1280x720) it showed five: a legacy widget rule put ~10px between every row, and the Add
  // toggle and the how-to line took the rest (docket D39).
  // A touch device keeps every control at 44px (index.css, pointer: coarse), so its
  // table device is a landscape tablet, not a 13-inch laptop.
  const touch = testInfo.project.name.includes("mobile");
  await page.setViewportSize(touch ? { width: 1180, height: 820 } : { width: 1280, height: 720 });
  await createScreen(page);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.locator('summary[aria-label="Help and resources"]').click();
  await page.evaluate(() =>
    document.querySelectorAll(".header-resources details").forEach((details) => {
      (details as HTMLDetailsElement).open = true;
    }),
  );
  await page.getByRole("combobox", { name: "Density" }).selectOption("compact");
  await page.locator('summary[aria-label="Help and resources"]').click();
  await page
    .getByRole("navigation", { name: "Session Focus" })
    .getByRole("button", { name: "Combat" })
    .click();
  await page.getByRole("button", { name: "Add combatant" }).click();
  await page.getByLabel("New combatant name").fill("Bandit Captain");
  await page.getByLabel("New combatant initiative").fill("9");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Done" }).click();

  const visible = () => page.evaluate(() => {
    const list = document.querySelector(".combatant-list")!.getBoundingClientRect();
    const rows = [...document.querySelectorAll(".combatant-list > article")];
    return {
      rows: rows.length,
      whole: rows.filter((row) => {
        const box = row.getBoundingClientRect();
        return box.top >= list.top - 1 && box.bottom <= Math.min(list.bottom, window.innerHeight) + 1;
      }).length,
    };
  });
  expect(await visible()).toEqual({ rows: 8, whole: 8 });
  // A 1024px tablet-width window: below 1100px the condition chips used to take a
  // second row, so a conditioned combatant was 58px tall and only 7 of 8 fit (D40).
  if (!touch) {
    await page.setViewportSize({ width: 1024, height: 768 });
    expect(await visible(), "1024x768").toEqual({ rows: 8, whole: 8 });
  }
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
  await openDockTools(page);
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
