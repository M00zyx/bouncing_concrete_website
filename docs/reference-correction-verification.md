# Reference correction — 10 November 2026

## Request and recovery

The user expected the supplied 12UI lower-page reference and identified visible material seams between the closing shutters, cell and player. This correction restores that composition and aligns the concrete surface.

Pre-change checkpoint: `checkpoint-2026-11-10-before-reference-correction`, pointing to `62df065c61507c9b78c6ff657ac1475d59443d46`.

## Result

- Compact desktop spread: masthead, large records introduction, two equal sleeves, artist statement and material strip. Real sleeve play buttons and named external links remain functional.
- Selected 12UI sleeve and film-still crops are shipped as optimized WebP assets. The material strip uses its 2x extracted asset. Existing originals are preserved.
- Film still/contact share the dark closing band; Kuala Lumpur remains footer-only.
- Tablets use a two-column spread, phones a single column. Checked at 1536×1024, 768×1024 and 390×844 without horizontal overflow.
- `concrete-continuous.svg` embeds the full selected cell plate once, extends its unbroken top/bottom material with reflected edge strips, and uses a shared scale/origin. The closing walls end at source row zero, where the music wall begins. No independent faded facade or player texture remains.
- The aperture contains the original live GLB; its camera and pose are unchanged. Phone framing changes only the clipping window's position.

## Verification

- `npm run build` passed. The existing large Three.js chunk advisory remains.
- All seven existing film/hosting tests passed; `git diff --check` passed.
- `src/film.js`, `src/ConcreteObject.jsx` and `src/waveform.css` are unchanged. The diff in `MusicPlayer.jsx` is confined to the lower-page markup; SoundCloud events and seeking handlers are unchanged.
- The desktop hero measured 3072px at a 1024px viewport, retaining 300vh. At scroll 2536, the shutter-to-music boundary was at y536; visual inspection showed a continuous wall across that point.
- Real playback verified for both releases. Funkacaine advanced from 0:07 to 0:19; the persistent player appeared on the records section and paused successfully. Concreto advanced before seeking, and the waveform drag selected 60.2% / 3:20 of 5:32. A further seek during Funkacaine playback selected 30%; playback subsequently advanced to 38.4% / 1:37, confirming seek-and-continue behavior. One third-party SoundCloud AbortError was observed around a seek/track transition; no app-owned exception was reported.
- Eye movement verified using left/right pointer positions and saved screenshots.
- Desktop, tablet and phone screenshots are in the local `Website/Reference Correction - 2026-11-10` review folder. The lower-page screenshot was compared directly with the user-selected image.

## 12UI closure and retained behavior

Reused the unchanged existing LayerDocs; no generation or conversion was purchased. Closure kits: `/tmp/bouncing-reference-lower-close` and `/tmp/bouncing-reference-cell-close`, with durable review copies outside the source repository.

Both captures settled, but the DOM extractor returned only `body` and the screen-reader-only heading. Therefore the reported 50% anchor coverage is not a measure of design fidelity. The generic selector patches were not applied. The asset inventory, original layout bounds and the actual rendered screenshots were used for the comparison and final column/heading/spacing correction.

The cell mock's static skull and waveform were deliberately not shipped over the live GLB and working seeking surface, as explicitly required by the user. The original globe and existing vector icons remain; selected paper grain, sleeves, strip, film photo and cell plate are used. No heavy scrim was added. No public deployment was performed.
