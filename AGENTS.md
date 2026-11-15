# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Current player direction

- Preserve the GLB’s established pose and cursor-following motion. Frame its eyes inside a narrower, recessed concrete cell opening.
- Keep the waveform immediately below the slit so it reads as the object’s mouth.
- Preserve the established angular seismograph waveform; refine its spike contour without replacing it with a separate triangle pattern.
- Keep the music sizing controls local CSS custom properties so section-height tuning cannot alter the slit or GLB pose.
- Waveform seeking must use the active SoundCloud track duration and commit once on release; update only the visual preview while dragging.
- Keep the yellow pointer dilation and white playback shocks as independent layers; seismic motion applies only to the white trace and must never alter scrub geometry or seeking behaviour.

## Music scene narrative

- The character is confined in a prison cell after causing the damage in the hero film. The slit should communicate a thick foreground wall and constrained view of the eyes.
- Keep horizontal cursor-following active across the music section, with the waveform immediately below the opening.

## Approved refinement scope — 10 November 2026

- Preserve the three-viewport-height hero scroll film. Its duration and scroll distance are approved.
- Carry the damage-to-confinement narrative into the music section, with the character following the pointer behind a recessed cell slit.
- Improve release discovery, player usability, responsive composition, factual content, real destinations, loading, and accessibility within the existing visual identity.
- Keep the website local during refinement.

## Artist positioning

- Mention Kuala Lumpur only in the website footer. Keep city names and location coordinates out of the hero, bio, page titles, metadata and release-sharing artwork. Let the music, character and visual world lead.

## Approved makeover — 10 November 2026

- The character is confined, but the music keeps getting out: connect the blue physical poster, full scroll film, closing foreground wall and architectural cell.
- Preserve the original wordmark, film, GLB pose, cursor following and waveform behaviour.
- Expose both releases with distinct sleeve compositions on pale concrete. Keep a compact player available after playback starts when the main player leaves view.
- Use comfortable reading typography, concise liner notes and a compact booking/follow close instead of a large empty Live section.

## Approved quiet-tension refinement — 10 November 2026

- Refine the opening, cell and records together. Begin with quiet tension, one character and the original identity; reserve destruction and confinement for the existing film sequence.
- Preserve the full three-viewport film, original 3D pose, cursor-following eyes, real player, waveform mouth and seeking behavior.
- Use one rough concrete material, matching colour and grain scale, across the closing walls and prison exterior. They are the same architecture.
- Use the selected 12UI cell architecture, with the live GLB behind its opening. Keep the live character and working player intact; the lower-page layout follows the later user correction below.

## User reference correction — 10 November 2026

- The user explicitly expects the selected 12UI lower-page image: a compact four-column desktop spread with the records heading, two equal sleeves, and the artist statement. Use that image as the layout authority; do not substitute a staggered oversized featured sleeve or separate the artist story below it.
- Keep the film still alongside contact in a single dark closing band, followed by the footer. Stack appropriately on phones without changing the content or real actions.
- Shutters, prison wall and player must read as one continuous concrete surface. Matching a filename is insufficient: pixel scale, texture phase and lighting must also match, with no faded facade overlay or separate player texture.
- The continuous atlas in `public/assets/concrete-continuous.svg` uses the complete selected cell plate, extended with mirrored edge strips. `scripts/build-concrete-atlas.mjs` reproduces it. Align the closed shutters' bottom edge with source row zero at the music section's top.
- Preserve the original 300vh film, live GLB camera and pose, cursor-following eyes, waveform mouth and working SoundCloud playback/seek controls.


## Approved integrated orbit study — 12 November 2026

- `studies/film-to-orbit/` is the latest integrated preview backup. `studies/spatial-music/` remains the earlier standalone study; the production `src/` is not replaced by this backup.
- The active direction opens with the actual three-viewport scroll film and flows into the rounded, rough character, staged orbiting wreckage and twelve attached curved title/sleeve groups. Preserve the film/character pose continuity and existing typography.
- Orbit is discovery; a substantial expanded release sheet and shared compact player provide listening without duplicating the catalogue. Funkacaine has native audio and an audio-reactive seismograph. Ten titles remain clearly labelled samples.
- Preserve idle motion, whole-group steering, centre-to-cursor title alignment and deliberate neighbouring-label handoff. The approved sticky capture ellipse is 70.56px horizontal / 60.48px vertical at desktop widths, responsively scaled; vertical reach was reduced 40% independently.
- Kuala Lumpur remains footer-only. Further work is proposed in `studies/film-to-orbit/REFINEMENT-PLAN.md`; the backup request does not authorize public deployment.

## Approved main-site integration — 13 November 2026

- User explicitly approved promoting the film/orbit/player/closing experience to the main site and requested keeping the old site intact on GitHub.
- The old site remains on `makeover/2026-11-10-contained-sound` at `cf9f4ae`; integrated work belongs to `integration/2026-11-13-film-orbit`. Do not replace the old branch or deploy publicly without instruction.
- `src/main.js` and `src/experience/` now own the main site. `public/experience/` is generated by `scripts/sync-experience.mjs` before dev/build; never edit generated copies. Runtime remains native ESM to preserve the approved scene/import map and deterministic asset paths.
- The older confinement and quiet-tension directions above are historical and superseded for this branch. Do not restore the prison/cell or duplicate catalogue.
- Preserve the three-viewport film, matched character transition, twelve-track orbit, exact current idle/steering/selection, shared player and live seismograph. All track selections trigger the approved one-shot debris pulse; samples remain honestly unavailable.
- Preserve the brighter environment, grounded photoreal closing fragment, existing type/copy and footer-only Kuala Lumpur. Keep photoreal closing as a static image, not another renderer.
- Public readiness still requires confirmed catalogue/social destinations and physical-phone/network validation. Keep the existing worker and Sites build packaging intact.

## Mailing list — 14 November 2026

- User supplied Kit form 10188593, UID 1b4f8eb4f1. Use its official embed script and subscription endpoint; no API secret is required.
- Signup sits beneath the closing bio, retaining existing film/orbit/player behavior. Keep Kit attribution visible.
- Build and hosting tests passed. Subsequent browser review verified the layout and recorded the combined animation; a real confirmation-email signup remains unverified. Never report a successful subscription without provider evidence.

- User approved keeping double opt-in: Kit should send the confirmation email, with auto-confirm disabled. This is the intended provider configuration, not an independently verified account setting.
- Approved CTA combines the yellow notice, blue seismograph and brief concrete jolt. The success stamp reads CHECK YOUR INBOX with the instruction to confirm via the email link. Keep animations brief and respect reduced motion.
- src/signup-study.js and src/signup-study.css own these additions. The default is the combined design. Local-only signup-state previews prevent submission and explicitly label simulated states; they do not prove live Kit delivery.

- Official Instagram supplied by user: @BOUNCING_CONCRETE, https://www.instagram.com/bouncing_concrete/. Show an outline Instagram icon, handle and outbound arrow in existing blue in the closing contact area; open in a new tab.

- Approved footer refinement: booking email is primary, Instagram is a compact secondary icon/handle link with no redundant label or link divider lines. Retain a single footer rule; mobile copyright and Back to the film share a row, with Kuala Lumpur beneath.

## Site 1.0 — 15 November 2026

- Current release uses `site-v1.0.0`; preserve the original July `v1.0.0` tag and old confinement branch. See `docs/INDEX.md` for file authority and `docs/releases/site-1.0.md` for release boundaries.
- Use the shared `.at-sign` optical alignment for displayed contact @ symbols; keep actual addresses and destinations unchanged.
