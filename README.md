# Bouncing Concrete website

## Versions

The previous website is preserved on `makeover/2026-11-10-contained-sound` at `cf9f4ae5948e9be076df7160a4bf3903842b76b3`.
The approved film/orbit experience is integrated separately on `integration/2026-11-13-film-orbit`. No deployment is implied by this branch.

## Development

Run `npm install`, then `npm run dev`. Run `npm run build` and `npm run test:sites` before publishing. Use `npm run preview` to review the production output.

The active entry is `src/main.js`. Edit the approved runtime in `src/experience/`; `scripts/sync-experience.mjs` copies it to generated `public/experience/` before development and builds. Do not edit that generated directory. The original React implementation remains in source for reference; its preserved branch remains the authority for the previous site.

## Integration verification — 13 November 2026

- Production build and all four Sites worker tests passed.
- All published experience files matched their canonical source. Approved visual, steering, spacing, debris, playback and seismograph modules were unchanged from the checkpoint.
- Film and audio byte-range requests returned HTTP 206 with the requested bytes.
- Browser review verified scroll film progression, orbital scene, native playback/pause/seeking, compact player retention, both direct release pages and the shared sample player.
- A 390px viewport review confirmed the expanded player scrolls to its controls. This is not a physical-phone test.
- Closing section and contact content rendered at the root route. No browser console errors were reported in the inspected release session.

## Before launch

Confirm the ten sample releases or replace them with real tracks; supply official social links; choose the deployment/domain; test on physical phones and a constrained network. Concreto Incarnat uses SoundCloud and does not expose audio for the reactive seismograph. Its panel loaded correctly; streaming playback was not separately reverified in this integration pass.
