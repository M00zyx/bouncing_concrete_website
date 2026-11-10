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
