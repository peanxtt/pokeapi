import { expect, test } from "@playwright/test";

test("the selected cry plays through the browser audio engine", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Verifies the shared audio engine once with real media.",
  );
  await page.addInitScript(() => {
    const records: { src: string; state: string }[] = [];
    Object.assign(window, { realCryPlayback: records });
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const record = { src: this.src, state: "pending" };
      records.push(record);
      return original.call(this).then(
        () => {
          record.state = "playing";
        },
        (error) => {
          record.state = error.name;
          throw error;
        },
      );
    };
  });
  await page.goto("/pokemon/bulbasaur?from=%2F%3Fgeneration%3D1");
  await expect(
    page.getByRole("article", { name: "Bulbasaur", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { realCryPlayback: unknown[] }).realCryPlayback
          .length,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Sound settings", exact: true }).click();
  await page.getByRole("button", { name: "Mute sound", exact: true }).click();
  await page.getByRole("button", { name: "Enable sound", exact: true }).click();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (
              window as unknown as { realCryPlayback: { state: string }[] }
            ).realCryPlayback.at(-1)?.state,
        ),
      { timeout: 30_000 },
    )
    .toBe("playing");
});
