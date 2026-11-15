# Bouncing Concrete — Site 1.0

The approved film-to-orbit website. Release date: 15 November 2026. Release tag: `site-v1.0.0`.

Start with the [project index](docs/INDEX.md), [file inventory](docs/FILE-INVENTORY.csv), and [release notes](docs/releases/site-1.0.md).

## Run and build

`npm ci` installs the locked dependencies. `npm run dev` starts development. `npm run build` produces the website; `npm run test:sites` checks hosting behavior. `npm run preview -- --host 127.0.0.1 --port 4174 --strictPort` previews the production build.

Edit `src/main.js`, `src/experience/`, and `src/signup-study.{js,css}`. `public/experience/` is generated before dev/build; never edit it. Preserve `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs`.

## Version history

| Name | Reference | Status |
| --- | --- | --- |
| Site 1.0 | `site-v1.0.0`, branch `integration/2026-11-13-film-orbit` | Current approved site |
| Legacy Site — July 2026 | original `v1.0.0`, commit `46d4c65` | Preserved historical release |
| Archived Direction — Contained Sound | `makeover/2026-11-10-contained-sound`, commit `cf9f4ae` | Preserved confinement design |

The old `v1.0.0` tag is intentionally retained. Site 1.0 is a versioned source release, not a public deployment. See release notes for remaining launch checks.
