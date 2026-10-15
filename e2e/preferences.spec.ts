import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const events: { kind: string; src: string }[] = [];
    Object.assign(window, { cryEvents: events, rejectCry: false });
    HTMLMediaElement.prototype.play = function () {
      events.push({ kind: "play", src: this.src });
      if ((window as unknown as { rejectCry: boolean }).rejectCry)
        return Promise.reject(
          new DOMException("Blocked for test", "NotAllowedError"),
        );
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      events.push({ kind: "pause", src: this.src });
    };
    HTMLMediaElement.prototype.load = function () {};
  });
});

test("sound and image preferences follow deliberate selection and persist", async ({
  page,
}, testInfo) => {
  const plays = () =>
    page.evaluate(() =>
      (
        window as unknown as { cryEvents: { kind: string; src: string }[] }
      ).cryEvents.filter((e) => e.kind === "play"),
    );
  await page.goto("/?generation=1");
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await plays()).toHaveLength(0);
  await page.locator('[data-species="bulbasaur"]').click();
  const detail = page.getByRole("article", { name: "Bulbasaur", exact: true });
  await expect(detail).toBeVisible();
  await expect.poll(async () => (await plays()).length).toBe(1);
  expect((await plays())[0].src).toContain("/cries/");
  await expect(detail.locator(".artwork-stage button")).toHaveCount(0);
  await detail.getByRole("button", { name: "Pixels", exact: true }).click();
  await expect(detail.locator(".artwork-stage img")).toHaveAttribute(
    "src",
    /generation-v\/black-white\/1\.png/,
  );
  await expect(detail.locator(".image-source")).toContainText(
    "Black/White sprite",
  );
  await detail.getByRole("button", { name: "Shiny", exact: true }).click();
  await expect(detail.locator(".artwork-stage img").last()).toHaveAttribute(
    "src",
    /black-white\/shiny\/1\.png/,
  );
  expect(await plays()).toHaveLength(1);
  await page.getByRole("button", { name: "Color theme", exact: true }).click();
  await page.getByRole("radio", { name: "Night", exact: true }).click();
  expect(await plays()).toHaveLength(1);
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sound off", exact: true }),
  ).toBeVisible();
  await detail.getByRole("link", { name: /Next: Ivysaur/ }).click();
  await expect(
    page.getByRole("article", { name: "Ivysaur", exact: true }),
  ).toBeVisible();
  expect(await plays()).toHaveLength(1);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sound off", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "Ivysaur", exact: true })
      .getByRole("button", { name: "Pixels", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await plays()).toHaveLength(0);
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await expect.poll(async () => (await plays()).length).toBe(1);
  await page.screenshot({
    path: testInfo.outputPath("preferences-detail.png"),
  });
});

test("a failed legacy sprite falls back honestly and blocked audio can retry from the top bar", async ({
  page,
}) => {
  await page.route(
    "**/sprites/pokemon/versions/generation-v/black-white/1.png",
    (route) => route.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/?generation=1");
  await page.evaluate(() => {
    Object.assign(window, { rejectCry: true });
  });
  await page.locator('[data-species="bulbasaur"]').click();
  const detail = page.getByRole("article", { name: "Bulbasaur", exact: true });
  await expect(detail).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toHaveAttribute("title", /Playback blocked/);
  await detail.getByRole("button", { name: "Pixels", exact: true }).click();
  await expect(detail.locator(".artwork-stage img")).toHaveAttribute(
    "src",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  );
  await expect(detail.locator(".image-source")).toContainText(
    "Regular sprite fallback",
  );
  await page.evaluate(() => {
    Object.assign(window, { rejectCry: false });
  });
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).not.toHaveAttribute("title", /Playback blocked/);
  await page.route(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    (route) => route.fulfill({ status: 404, body: "missing" }),
  );
  await page.reload();
  await expect(
    page
      .getByRole("article", { name: "Bulbasaur", exact: true })
      .locator(".image-source"),
  ).toContainText("Artwork fallback");
});

test("round type icons and centered controls fit the responsive guide", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Checks all six widths in one browser session.",
  );
  await page.goto("/?generation=1");
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const row = page.locator('[data-species="bulbasaur"]');
    await expect(row).toBeVisible();
    await expect(row.locator(".type-badge")).toHaveCount(2);
    await expect(row.locator(".type-symbol").first()).toHaveCSS(
      "border-radius",
      "50%",
    );
    const geometry = await page.evaluate(() => {
      const b = document.querySelector(".sound-toggle")!,
        icon = b.querySelector("svg")!,
        label = b.querySelector("span")!;
      const parts = [icon, label]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => e.getBoundingClientRect());
      const r = b.getBoundingClientRect();
      const row = document
        .querySelector('[data-species="bulbasaur"]')!
        .getBoundingClientRect();
      const pills = [
        ...document.querySelectorAll('[data-species="bulbasaur"] .type-badge'),
      ].map((e) => e.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        center: Math.abs(
          (Math.min(...parts.map((r) => r.left)) +
            Math.max(...parts.map((r) => r.right))) /
            2 -
            (r.left + r.width / 2),
        ),
        typeOverflow: Math.max(...pills.map((r) => r.right)) - row.right,
        colors: [
          ...document.querySelectorAll(
            '[data-species="bulbasaur"] .type-badge',
          ),
        ].map((e) => getComputedStyle(e).backgroundColor),
        pillCenterErrors: [
          ...document.querySelectorAll(
            '[data-species="bulbasaur"] .type-badge',
          ),
        ].map((badge) => {
          const icon = badge
            .querySelector(".type-symbol")!
            .getBoundingClientRect();
          const text = [...badge.childNodes].find(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          )!;
          const range = document.createRange();
          range.selectNodeContents(text);
          const textBox = range.getBoundingClientRect(),
            box = badge.getBoundingClientRect();
          return Math.abs(
            (icon.left + textBox.right) / 2 - (box.left + box.width / 2),
          );
        }),
      };
    });
    expect(geometry.overflow, `${width}px document`).toBeLessThanOrEqual(0);
    expect(geometry.center, `${width}px sound center`).toBeLessThan(1);
    expect(geometry.typeOverflow, `${width}px type overflow`).toBeLessThan(0);
    expect(geometry.colors[0]).not.toBe(geometry.colors[1]);
    for (const error of geometry.pillCenterErrors)
      expect(error, `${width}px type label center`).toBeLessThan(1);
    await page
      .getByRole("button", { name: "Image style", exact: true })
      .click();
    const menu = page.locator(".image-style-popover .control-panel");
    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    expect(menuBox!.x, `${width}px image menu left`).toBeGreaterThanOrEqual(0);
    expect(
      menuBox!.x + menuBox!.width,
      `${width}px image menu right`,
    ).toBeLessThanOrEqual(width);
    await menu.getByRole("button", { name: "Pixels", exact: true }).click();
    await page.screenshot({ path: testInfo.outputPath(`guide-${width}.png`) });
    await row.click();
    const detail = page.getByRole("article", {
      name: "Bulbasaur",
      exact: true,
    });
    await expect(detail).toBeVisible();
    const detailOverflow = await detail.evaluate(
      (el) => el.scrollWidth - el.clientWidth,
    );
    expect(detailOverflow, `${width}px detail`).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath(`detail-${width}.png`) });
    await page.getByRole("link", { name: "POKÉDEX", exact: true }).click();
    await expect(detail).toHaveCount(0);
  }
});

test("a new selection stops the previous cry and leaving detail stops playback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Audio controller is shared at all widths.",
  );
  await page.goto("/?generation=1");
  await page.locator('[data-species="bulbasaur"]').click();
  await expect(
    page.getByRole("article", { name: "Bulbasaur", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Next: Ivysaur/ }).click();
  await expect(
    page.getByRole("article", { name: "Ivysaur", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as { cryEvents: { kind: string; src: string }[] }
          ).cryEvents.filter((e) => e.kind === "play").length,
      ),
    )
    .toBe(2);
  const events = await page.evaluate(
    () =>
      (window as unknown as { cryEvents: { kind: string; src: string }[] })
        .cryEvents,
  );
  const first = events.find((e) => e.kind === "play")!;
  expect(
    events.findIndex((e) => e.kind === "pause" && e.src === first.src),
  ).toBeLessThan(
    events.findIndex((e) => e.kind === "play" && e.src !== first.src),
  );
  await page.getByRole("link", { name: "POKÉDEX", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as { cryEvents: { kind: string; src: string }[] }
          ).cryEvents.filter((e) => e.kind === "pause").length,
      ),
    )
    .toBe(2);
});
