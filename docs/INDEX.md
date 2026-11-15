# Project index — Site 1.0

## Current editable website

| Location | Responsibility |
| --- | --- |
| `src/main.js` | Mount the site and load Kit |
| `src/experience/shell.html` | Page structure and approved copy |
| `src/experience/journey.js`, `journey-state.js`, `street-handover.js` | Scroll film and transition |
| `src/experience/orbit/` | Character, twelve tracks, debris, selection and idle motion |
| `src/experience/catalogue.js` | Track catalogue |
| `src/experience/playback.js`, `listening-view.js`, `listening.css` | Shared listening player |
| `src/experience/seismograph*.js` | Playback trace |
| `src/experience/style.css` | Main layout |
| `src/signup-study.js`, `src/signup-study.css` | Approved signup, local preview states and footer refinements |
| `src/experience/assets/`, `src/experience/orbit/assets/` | Runtime media; some retained alternatives are included |
| `public/assets/` | Shared and historical assets; do not delete based on age |
| `releases/` | Direct release-page entry documents |
| `scripts/`, `tests/`, `worker/`, `.openai/` | Build, verification and hosting |

## Historical material

- `studies/film-to-orbit/`: saved integrated prototype; current changes belong in `src/experience/`.
- `studies/spatial-music/`: earlier standalone orbit study and asset provenance.
- Remaining React files and CSS under `src/`: retained legacy implementation; not the current entry point.
- Root `DESIGN.md` and `PRODUCT.md`: historical design rationale, explicitly marked superseded.
- `docs/archive/legacy-july-2026/`: original screenshot and QA notes, moved together so their relative reference remains valid.
- `docs/*verification.md` and `makeover-asset-provenance.md`: dated historical evidence, not current certification.
- `AGENTS.md`: project instructions and dated decision history; later approvals supersede earlier directions.

## Generated and local-only files

`node_modules/`, `dist/`, and `public/experience/` are ignored generated files. Recreate them through install/build. Local signup fixtures do not prove a subscription succeeded.

[Complete repository file inventory](FILE-INVENTORY.csv) groups files by purpose, with sizes. Refresh with `python3 scripts/index-files.py`. It lists tracked plus nonignored new files, excluding the inventory itself.

The Drive production archive is separately indexed by its `PROJECT-INDEX.md` and `Website/INDEX.md`. Raw production masters remain there; they are not uploaded as part of this release.
