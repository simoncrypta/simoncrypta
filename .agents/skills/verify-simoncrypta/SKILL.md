---
name: verify-simoncrypta
description: Prove a change to Simon's Crypta (simoncrypta.dev) works the way a visitor or agent would see it. Use whenever a change in this repo needs proof, before calling it done, staging it, or opening a PR - content edits, components, styles, the Worker, feeds, config or dependencies. Covers install, starting and stopping the dev server and the Worker preview, check/build commands, and driving the home, Now, Uses, 404 and share-image flows with curl and a headless browser (screenshots, console errors, headers, localStorage).
---

# Verify simoncrypta

The site is static: Astro builds `content/*.md` into `dist/`, and a small Worker
(`src/worker.ts`) runs in front of the static assets. There is **no test suite**.
Proof is: `pnpm check` and `pnpm build` pass, then the affected flows behave
correctly on a running server, with evidence (status codes, headers, page text,
screenshots).

Run everything from the repo root. Keep scratch files in `/tmp/verify-simoncrypta`
(never in the repo). Never run `pnpm run deploy`, `cf deploy` or
`pnpm preview:upload`: they publish to Cloudflare. `pnpm deploy:check` is a dry
run and is fine.

## 1. Install and static checks

```bash
node --version                 # v26.x (.node-version); pnpm 12 via packageManager
pnpm install --frozen-lockfile
pnpm check                     # astro sync + vp check: oxfmt, type-aware oxlint, tsgo
pnpm build                     # astro build -> dist/; fails on any build error
```

- `pnpm check` must end with two `pass:` lines. If formatting fails, `pnpm fix`
  applies it (then re-run `pnpm check` and review the diff it made). It also
  checks this skill's own files, so run it after editing them too.
- `.astro` files are **not** type-checked; a broken prop or import in one shows up
  only in `pnpm build` or in the browser.
- `pnpm build` must end with `4 page(s) built` and `Complete!`. Expected output:

```bash
find dist -type f -not -path 'dist/_astro/*' | sort
# 404.html _headers index.html index.md index.xml llms.txt now/index.html
# now/index.md og-voyager.jpg robots.txt sitemap.xml uses/index.html uses/index.md
```

A new page in `content/` adds `<slug>/index.html` and `<slug>/index.md`, and
appears in `sitemap.xml`, `index.xml` and `llms.txt`.

Check a built artifact directly when that is what changed:

```bash
grep -o '<title>[^<]*' dist/*.html dist/*/index.html
grep -o '<meta property="og:[^>]*>' dist/index.html    # og:image = https://simoncrypta.dev/og-voyager.jpg, 1200x630
file dist/og-voyager.jpg                                # JPEG ... 1200x630
cat dist/robots.txt dist/llms.txt
head -20 dist/sitemap.xml                               # lastmod comes from "*Updated on ...*" lines
head -5 dist/now/index.md
```

## 2. Dev server (fast, no Worker)

Start it, run sections 4 and 5 against it, then stop it:

```bash
pnpm dev                        # starts astro dev as a background daemon and returns
U=$(pnpm exec astro dev status | grep -o 'http://localhost:[0-9]*'); echo $U
pnpm exec astro dev logs        # server log (JSON lines): compile errors, warnings
```

Read the URL from `status`: if another checkout already holds :4321, Astro picks
:4322 and so on. The server listens on `[::1]` only, so use `localhost`, not
`127.0.0.1`. When done with the flows:

```bash
pnpm exec astro dev stop
pnpm exec astro dev status      # "No dev server is running."
```

Dev differs from production: no Markdown negotiation (`Accept: text/markdown`
gets HTML), `/now` answers 200 instead of redirecting, and screenshots include the
Astro dev toolbar and a DialKit button (bottom right, page-transition tuning).

## 3. Worker preview (production behaviour)

`pnpm preview:worker` builds, then serves `dist/` through the real Worker with
`wrangler dev` on :8787. It runs in the foreground, so start it in its own
process group (stopped as a whole below). Start it, run sections 4 and 5 against
it, then stop it:

```bash
mkdir -p /tmp/verify-simoncrypta
setsid pnpm preview:worker --port 8787 > /tmp/verify-simoncrypta/worker.log 2>&1 < /dev/null &
echo $! > /tmp/verify-simoncrypta/worker.pid
for i in $(seq 90); do grep -q 'Ready on' /tmp/verify-simoncrypta/worker.log && break; sleep 1; done
grep 'Ready on' /tmp/verify-simoncrypta/worker.log   # Ready on http://localhost:8787
U=http://localhost:8787
```

- Extra args after `pnpm preview:worker` go to `wrangler dev`. If :8787 is taken,
  pick another port and use it everywhere below.
- Logs: `/tmp/verify-simoncrypta/worker.log` has one `[wrangler:info] GET <path> <status>`
  line per request, plus any Worker exceptions. While it runs, request traces are
  also queryable:

```bash
curl -s -X POST $U/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT name, outcome, duration_ms FROM spans WHERE parent_id IS NULL ORDER BY rowid DESC LIMIT 5"}'
```

When done with the flows:

```bash
kill -- -$(cat /tmp/verify-simoncrypta/worker.pid)
ss -ltn | grep ':8787 ' || echo "8787 free"
```

`pnpm preview` (plain `astro preview`, no Worker) also daemonizes; stop it with
`pnpm exec astro preview stop`. Prefer `preview:worker`.

## 4. Drive the flows with curl

Set `U` to the running server (`http://localhost:8787` for the Worker preview).

```bash
for p in / /now /now/ /uses/ /index.md /og-voyager.jpg /index.xml /llms.txt /robots.txt /sitemap.xml /nope/; do
  printf '%-16s ' $p; curl -s -o /dev/null -w '%{http_code} %{content_type} %{redirect_url}\n' $U$p
done
```

Expected on the Worker preview:

| Path                         | Result                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `/`, `/now/`, `/uses/`       | 200 `text/html`                                                 |
| `/now`                       | 307 to `/now/` (dev: 200)                                       |
| `/index.md`                  | 200 `text/markdown`                                             |
| `/og-voyager.jpg`            | 200 `image/jpeg`                                                |
| `/index.xml`, `/sitemap.xml` | 200 `application/xml` (dev: `application/rss+xml` for the feed) |
| `/llms.txt`, `/robots.txt`   | 200 `text/plain`                                                |
| `/nope/`                     | 404 `text/html` (the custom 404 page)                           |

Markdown negotiation and headers (Worker preview only):

```bash
curl -sI $U/now/ | grep -iE '^(content-type|vary|link)'
# Content-Type: text/html; Vary: Accept; Link: ... </now/index.md>; rel="alternate"; type="text/markdown"
curl -sI -H 'Accept: text/markdown' $U/now/ | grep -iE '^(content-type|vary)'   # text/markdown, Vary: Accept
curl -s  -H 'Accept: text/markdown' $U/now/ | head -2                           # "# What I'm doing now"
curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: text/html,application/xhtml+xml,*/*;q=0.8' $U/now/   # html (browsers)
curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: text/html, text/markdown;q=0.5' $U/now/              # html (html preferred)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' -H 'Accept: text/markdown' $U/nope/                 # 404 text/html
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Accept: text/markdown' $U/now/                          # 405
curl -sI $U/index.xml | grep -i '^link'   # site-wide Link header from static/_headers, no Vary/markdown link
```

## 5. Drive the flows in a browser

`scripts/browse.cjs` (next to this file) visits `/`, `/now/`, `/uses/` and a 404 at
desktop (1280x900) and mobile (390x844), clicks the header's "Now" link
(client-side navigation and page transition), fetches the share image, renders the
home page in dark mode, and saves screenshots (full page, except the
viewport-sized `nav-home-to-now.png`). It fails (exit 1) on a wrong status or
title, console errors, broken images, horizontal overflow, the home particle
portrait never getting `data-ready`, or content left faded after navigation. The
404 page always logs its own `status of 404` console error; the script ignores
that one, though it still appears in that page's `errors`.

It needs `playwright-core`, installed outside the repo (don't add it to
`package.json`). Name the run after the server (`dev` or `worker`) so runs don't
overwrite each other, and clear old screenshots first:

```bash
mkdir -p /tmp/verify-simoncrypta/pw
npm install --no-save --no-audit --no-fund --prefix /tmp/verify-simoncrypta/pw playwright-core@1.63.0
RUN=worker   # or dev
rm -rf /tmp/verify-simoncrypta/shots-$RUN
NODE_PATH=/tmp/verify-simoncrypta/pw/node_modules \
  node .agents/skills/verify-simoncrypta/scripts/browse.cjs $U /tmp/verify-simoncrypta/shots-$RUN \
  > /tmp/verify-simoncrypta/browse-$RUN.json; echo "exit $?"
node -p "require('/tmp/verify-simoncrypta/browse-$RUN.json').failures"   # [] when it passed
```

If the script crashes (connection error, timeout), the error is printed on stderr
and `browse-$RUN.json` stays empty.

- Browser: on this machine, browsers run in a Docker Playwright server and
  `PLAYWRIGHT_WS_ENDPOINT` (ws://127.0.0.1:3333/) is set; the script connects to
  it. Don't launch host browsers. Without the variable it launches a local
  Chromium.
- The `playwright-core` version must match the server's minor version. On a
  mismatch, `connect` fails with `428 Precondition Required` and prints
  `server version: vX.Y`; install `playwright-core@X.Y.0` instead.
- `playwright-cli` (0.1.17, Playwright 1.62) can't attach to the 1.63 server; use
  the script, or extend it for a new flow.
- Read the result: the JSON report has, per page and viewport, `status`, `title`,
  `h1`, `current` (the nav item with `aria-current`), `ogImage`, `markdownLink`,
  `portraitReady`, `photos` (images in figures: the portrait on home, 2 on Uses), `brokenImages`,
  `overflowX` and `errors`. Then open the PNGs with the Read tool and look at them:
  `home-desktop.png`, `home-mobile.png`, `now-*.png`, `uses-*.png`, `404-*.png`,
  `nav-home-to-now.png`, `home-dark.png` (body background `rgb(27, 29, 54)`).
- Stored values: the site keeps no server state, cookies or database. The only
  client storage is the dev-only DialKit panel, reported as `localStorage`: in dev
  it holds `dialkit:page-transition-controls` (the transition timings); on the
  Worker preview it must be `{}`.

## 6. Deploy dry run

For changes to `src/worker.ts`, `cloudflare.config.ts`, `wrangler.config.ts`,
`static/_headers` or dependencies:

```bash
pnpm deploy:check   # build:worker (astro build + cf-wrangler build -> .cloudflare/output/) + cf deploy --dry-run
```

It must end with `--dry-run: exiting now.` and list the `env.ASSETS` binding.
`permission denied ... docker.sock` in the output is harmless (cf's containers
check). `pnpm build:worker` alone runs only the build half.

## What to run for which change

| Change                                                                  | Minimum proof                                                                                                        |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `content/*.md`                                                          | `pnpm build`; the page's `dist/<slug>/index.html` and `index.md`; browser screenshots of that page at both viewports |
| Components, layouts, `src/styles/global.css`, `src/lib/*` (client code) | `pnpm check`, `pnpm build`, `browse.cjs` on dev and on the Worker preview; look at the screenshots, light and dark   |
| `src/pages/*.ts` endpoints, `src/lib/feeds.ts`                          | `pnpm build`, inspect the generated file in `dist/`, curl it on the Worker preview                                   |
| `src/worker.ts`, `cloudflare.config.ts`, `static/_headers`              | `pnpm check`, Worker preview + every curl in section 4, `pnpm deploy:check`                                          |
| `src/config.ts`, `SEO.astro`, `static/og-voyager.jpg`                   | the og meta grep and `file dist/og-voyager.jpg` in section 1, `browse.cjs` (`ogImage`)                               |
| `package.json`, lockfile                                                | `pnpm install --frozen-lockfile`, then everything above                                                              |

## Finish

Make sure every server you started is stopped (see the stop blocks in sections 2
and 3) and its port is free. `dist/` and `.cloudflare/` are gitignored build
output.
In the report, list the commands you ran and their results, the failures (if
any) from each `browse-$RUN.json`, and the screenshots you looked at.
