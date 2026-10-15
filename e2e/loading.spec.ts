import { expect, test, type Page } from "@playwright/test";

async function warmFonts(page: Page) {
  await page.goto("/?generation=1");
  await page.evaluate(() => document.fonts.ready);
}

// Hold the actual SSR fallback's completion boundary, while allowing outer slots
// to stream into place. Block client hydration only in this intercepted response.
async function holdStreamedFallback(page: Page, path: string) {
  await page.route(`http://localhost:3004${path}`, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const name = path.startsWith("/pokemon/")
      ? "Loading species details"
      : "Loading Pokédex index";
    const marker = body.indexOf(`aria-label="${name}"`);
    expect(
      marker,
      "The real route must emit its loading fallback",
    ).toBeGreaterThan(0);
    const templates = [
      ...body.slice(0, marker).matchAll(/<template id="(B:[^"]+)"/g),
    ];
    const boundary = templates.at(-1)![1];
    const frozen = body.replace(
      new RegExp(`\\$RC\\("${boundary}","[^"]+"\\)`, "g"),
      "void 0",
    );
    await route.fulfill({
      response,
      body: frozen,
      headers: {
        ...response.headers(),
        "content-security-policy": "script-src 'unsafe-inline'",
      },
    });
  });
  await page.goto(path);
  await page.evaluate(() => {
    document.documentElement.dataset.theme = matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "night"
      : "light";
  });
  await page.evaluate(() => document.fonts.ready);
}

test("real catalog fallback uses the loaded row geometry", async ({
  page,
}, testInfo) => {
  await warmFonts(page);
  await holdStreamedFallback(page, "/?generation=1&q=bulbasaur");
  const loading = page.getByRole("region", {
    name: "Loading Pokédex index",
    exact: true,
  });
  await expect(loading).toBeVisible();
  if (testInfo.project.use.reducedMotion === "reduce") {
    await expect(loading.locator(".skeleton").first()).toHaveCSS(
      "animation-name",
      "none",
    );
  }
  const before = await loading
    .locator(".species-row")
    .first()
    .evaluate((row) => {
      const rect = (selector: string) => {
        const r = row.querySelector(selector)!.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        row: row.getBoundingClientRect().toJSON(),
        art: rect(".row-artwork"),
        identity: rect(".row-identity"),
        bars: [...row.querySelectorAll(".row-identity .skeleton")].map(
          (e) => e.getBoundingClientRect().height,
        ),
      };
    });
  expect(before.bars[0]).toBeLessThan(20);
  await page.screenshot({ path: testInfo.outputPath("catalog-loading.png") });
  await page.unrouteAll();
  await page.goto("/?generation=1&q=bulbasaur");
  await page.evaluate(() => document.fonts.ready);
  const row = page.locator('[data-species="bulbasaur"]');
  await expect(row).toBeVisible({ timeout: 45_000 });
  const after = await row.evaluate((row) => {
    const rect = (selector: string) => {
      const r = row.querySelector(selector)!.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return {
      row: row.getBoundingClientRect().toJSON(),
      art: rect(".row-artwork"),
      identity: rect(".row-identity"),
    };
  });
  for (const key of ["art", "identity"] as const)
    for (const dimension of ["x", "y", "width", "height"] as const)
      expect(
        Math.abs(before[key][dimension] - after[key][dimension]),
        `${key}.${dimension}`,
      ).toBeLessThan(1);
  expect(Math.abs(before.row.height - after.row.height)).toBeLessThan(1);
  await page.screenshot({ path: testInfo.outputPath("catalog-loaded.png") });
});

test("real direct-detail fallback matches hero and form control geometry", async ({
  page,
}, testInfo) => {
  await warmFonts(page);
  await holdStreamedFallback(
    page,
    "/pokemon/bulbasaur?from=%2F%3Fgeneration%3D1",
  );
  const loading = page.getByRole("article", {
    name: "Loading species details",
    exact: true,
  });
  await expect(loading).toBeVisible();
  const measure = (article: Element) => {
    const box = (selector: string) =>
      article.querySelector(selector)!.getBoundingClientRect();
    const art = box(".artwork-stage"),
      form = box(".form-appearance"),
      control = box(".form-readonly"),
      appearance = box(".appearance-buttons");
    return {
      art: { x: art.x, y: art.y, width: art.width, height: art.height },
      controlOffset: control.top - form.top,
      appearanceOffset: appearance.top - form.top,
    };
  };
  const before = await loading.evaluate(measure);
  await page.screenshot({ path: testInfo.outputPath("detail-loading.png") });
  await page.unrouteAll();
  await page.goto("/pokemon/bulbasaur?from=%2F%3Fgeneration%3D1");
  await page.evaluate(() => document.fonts.ready);
  const detail = page.getByRole("article", { name: "Bulbasaur", exact: true });
  await expect(detail).toBeVisible({ timeout: 45_000 });
  await expect(detail).toHaveCSS("opacity", "1");
  const after = await detail.evaluate(measure);
  for (const key of ["x", "y", "width", "height"] as const)
    expect(
      Math.abs(before.art[key] - after.art[key]),
      `art.${key}`,
    ).toBeLessThan(1);
  expect(Math.abs(before.controlOffset - after.controlOffset)).toBeLessThan(1);
  expect(
    Math.abs(before.appearanceOffset - after.appearanceOffset),
  ).toBeLessThan(1);
  await page.screenshot({ path: testInfo.outputPath("detail-loaded.png") });
});

test("only intentional species links prefetch and pending navigation retains detail", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Pointer prefetch is a desktop interaction.",
  );
  const prefetched: string[] = [];
  page.on("request", (request) => {
    if (
      request.headers()["next-router-prefetch"] &&
      new URL(request.url()).pathname.startsWith("/pokemon/")
    )
      prefetched.push(new URL(request.url()).pathname);
  });
  await page.goto("/?generation=1");
  await expect(page.locator("[data-species]")).toHaveCount(40);
  expect(prefetched).toEqual([]);
  await page.locator('[data-species="bulbasaur"]').hover();
  await expect.poll(() => prefetched).toContain("/pokemon/bulbasaur");
  await page.locator('[data-species="bulbasaur"]').click();
  await expect(
    page.getByRole("heading", { name: "Bulbasaur", exact: true, level: 1 }),
  ).toBeVisible();
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/pokemon/ivysaur?**", async (route) => {
    await blocked;
    await route.continue();
  });
  await page.locator('[data-species="ivysaur"]').click();
  await expect(
    page.getByRole("heading", { name: "Bulbasaur", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Loading species details" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("pending-keeps-detail.png"),
  });
  release();
  await expect(
    page.getByRole("heading", { name: "Ivysaur", exact: true, level: 1 }),
  ).toBeVisible();
});
