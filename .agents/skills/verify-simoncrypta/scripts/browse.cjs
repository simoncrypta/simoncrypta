/**
 * Drive the site in a real browser the way a visitor would, and leave
 * evidence: screenshots, console errors, page facts, localStorage.
 *
 *   NODE_PATH=<dir with playwright-core>/node_modules \
 *     node .agents/skills/verify-simoncrypta/scripts/browse.cjs <base-url> <out-dir>
 *
 * Connects to PLAYWRIGHT_WS_ENDPOINT when set (Docker run-server; the
 * playwright-core version must match the server's minor version), otherwise
 * launches a local Chromium. Prints a JSON report and exits 1 on any failure.
 */
const { chromium } = require("playwright-core");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");

const [base, outDir] = process.argv.slice(2);
if (!base || !outDir) {
  console.error("usage: browse.cjs <base-url> <out-dir>");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const PAGES = [
  { path: "/", name: "home", status: 200, title: "Simon's Crypta" },
  { path: "/now/", name: "now", status: 200, title: "Now | Simon's Crypta" },
  { path: "/uses/", name: "uses", status: 200, title: "Uses | Simon's Crypta" },
  {
    path: "/does-not-exist/",
    name: "404",
    status: 404,
    title: "404 - Page Not Found | Simon's Crypta",
  },
];
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

const failures = [];
const check = (ok, message) => ok || failures.push(message);

async function main() {
  const endpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  const browser = endpoint ? await chromium.connect(endpoint) : await chromium.launch();
  const report = { base, browser: endpoint ? `remote ${endpoint}` : "local", pages: [], failures };

  for (const [viewport, size] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport: size });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));

    for (const spec of PAGES) {
      errors.length = 0;
      const response = await page.goto(base + spec.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000); // particle portrait and entrance settle
      const facts = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() ?? null,
        current: document.querySelector('nav [aria-current="page"]')?.textContent?.trim() ?? null,
        ogImage: document.querySelector('meta[property="og:image"]')?.content ?? null,
        markdownLink:
          document.querySelector('link[type="text/markdown"]')?.getAttribute("href") ?? null,
        portraitReady:
          document.querySelector("[data-particle-portrait]")?.hasAttribute("data-ready") ?? null,
        photos: document.querySelectorAll("content figure img").length,
        brokenImages: [...document.images]
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));
      const shot = join(outDir, `${spec.name}-${viewport}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      const status = response?.status();
      const label = `${spec.path} (${viewport})`;
      check(status === spec.status, `${label}: status ${status}, expected ${spec.status}`);
      check(facts.title === spec.title, `${label}: title "${facts.title}"`);
      check(facts.brokenImages.length === 0, `${label}: broken images ${facts.brokenImages}`);
      check(!facts.overflowX, `${label}: horizontal overflow`);
      // The 404 page logs its own document's 404 status; anything else is a bug.
      const unexpected =
        spec.status === 404 ? errors.filter((e) => !/status of 404/.test(e)) : errors;
      check(unexpected.length === 0, `${label}: console errors ${JSON.stringify(unexpected)}`);
      if (spec.name === "home")
        check(facts.portraitReady === true, `${label}: particle portrait never ready`);
      report.pages.push({
        viewport,
        path: spec.path,
        status,
        ...facts,
        errors: [...errors],
        screenshot: shot,
      });
    }

    if (viewport === "desktop") {
      // Client-side navigation through the header (Astro ClientRouter + page transition).
      await page.goto(base + "/", { waitUntil: "networkidle" });
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Now" })
        .click();
      await page.waitForURL("**/now/");
      await page.waitForTimeout(1200);
      const nav = await page.evaluate(() => ({
        url: location.pathname,
        title: document.title,
        current: document.querySelector('nav [aria-current="page"]')?.textContent?.trim(),
        contentOpacity: getComputedStyle(document.querySelector("content")).opacity,
      }));
      await page.screenshot({ path: join(outDir, "nav-home-to-now.png") });
      check(nav.current === "Now", `client nav: aria-current is "${nav.current}"`);
      check(
        nav.contentOpacity === "1",
        `client nav: content stuck at opacity ${nav.contentOpacity}`,
      );
      report.clientNavigation = nav;

      // Share image: what og:image points at must be a 1200x630 JPEG on this server.
      const og = await page.request.get(base + "/og-voyager.jpg");
      report.ogImage = {
        status: og.status(),
        type: og.headers()["content-type"],
        bytes: (await og.body()).length,
      };
      check(
        og.status() === 200 && report.ogImage.type === "image/jpeg",
        "og image not served as image/jpeg",
      );

      report.localStorage = await page.evaluate(() =>
        Object.fromEntries(Object.entries(localStorage)),
      );
    }
    await context.close();
  }

  // Dark scheme (prefers-color-scheme) on the home page.
  const dark = await browser.newContext({ viewport: VIEWPORTS.desktop, colorScheme: "dark" });
  const darkPage = await dark.newPage();
  await darkPage.goto(base + "/", { waitUntil: "networkidle" });
  await darkPage.waitForTimeout(1000);
  report.darkBackground = await darkPage.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await darkPage.screenshot({ path: join(outDir, "home-dark.png"), fullPage: true });
  await dark.close();

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  process.exit(failures.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
