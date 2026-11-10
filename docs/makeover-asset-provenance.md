# Makeover asset provenance — 10 November 2026

All original artwork, film and model files remain in place. The makeover composes these assets rather than replacing the character or wordmark.

| Added asset | Source and transformation |
| --- | --- |
| `public/assets/film-still.jpg` | Frame at 6.8 seconds from the existing `scene-web.mp4`, extracted locally with FFmpeg; used in the liner notes. |
| `public/assets/record-aperture.webp` | Existing `ornament-aperture-recessed-v2.png`, encoded as WebP at quality 85; used on the Concreto Incarnat sleeve. |
| `public/assets/cell-still-makeover.jpg` | Local browser capture of the live original GLB inside the new cell framing, excluding the overlapping waveform; loading/WebGL-unavailable fallback. The previous `cell-still.jpg` is retained. |
| `public/assets/fonts/font-0.ttf` | Anton from the official Google Fonts distribution, with its OFL license in the same directory. |
| `public/assets/fonts/font-3.ttf` through `font-5.ttf` | DM Sans from the official Google Fonts distribution, local weights 400/500/600, with its OFL license. |
| `public/assets/fonts/font-1.ttf` and `font-2.ttf` | DM Mono from the official Google Fonts distribution, local weights 400/500, with its OFL license. |

The two release sleeves are responsive compositions in `src/RecordArt.jsx`, built from existing character, flower, concrete and texture assets. They are website sleeve treatments, not a claim that the artist has changed the artwork on streaming services. Existing social exports are retained.

The 12ui text-only layout study informed the asymmetrical poster, street and diagonal foreground-wall composition. Its generated title and substitute round character were not used. Full-page automatic export failed; the original assets and working audio/3D implementation were integrated directly.

## Quiet-tension pass — 10 November 2026

User-authorized 12UI study, selected cell B and lower A:
- `clean-0-d12f3cfbe8a2.webp`: optimized 1536×1024 cell clean plate, with the original recess/sill/hardware retained. A CSS rectangular opening exposes the live GLB. The plate fades into the same material at its upper/lower exterior edges.
- `clean-0-d12f3cfbe8a2-material.webp`: technical crop of the same plate, x=0, y=500, width=1536, height=524. Used at one shared grain scale for the opening wall, closing shutters and entire cell exterior.
- `clean-1-4dd75c274972.webp`: selected lower-page paper backing, optimized from the extracted clean plate.

All three are WebP quality 88 derivatives, about 424 KiB total. Originals remain in the user workspace's `Website/12UI Review - 2026-11-10/exports/` folder. The original film, fractured wordmark, yellow character, GLB and record artwork remain in use. The generated hero's duplicate character/destruction plate, static cell face/waveform and condensed lower-page layout were deliberately not integrated because the user's approved refinement supersedes them. No generated HTML or raw kit is committed.

The shared material is delivered through `clean-0-d12f3cfbe8a2-material.svg`: it embeds the same WebP crop and reflects its vertical repeat to eliminate a hard tile boundary. This is a raster-material wrapper, not a redrawn illustration. All exterior wall surfaces use this one wrapper and scale.
