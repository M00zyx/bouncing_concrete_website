# Quiet tension refinement — 10 November 2026

## Recovery and scope

Checkpoint `checkpoint-2026-11-10-before-quiet-tension` points to `8ddb580f18efb7e47c1643ac1e5c1fc9e9dd1dc5`. It was created and pushed to the existing GitHub repository before edits. Work remains on `makeover/2026-11-10-contained-sound`; no production deployment was performed.

The user approved quiet tension and coordinated opening/cell/records refinement, then explicitly requested consistent stone across the closing walls and prison. The result keeps one still character in the opening, introduces confinement after the full film, layers the original live model behind the selected 12UI aperture, and gives Funkacaine prominence in a spacious records section. All exterior walls use one material wrapper at the same grain scale.

## Verification

- Production build and Sites packaging passed. All seven existing film-state and hosting tests passed after the final source changes.
- `src/film.js`, `src/ConcreteObject.jsx` and `src/waveform.css` are unchanged from the checkpoint. Seeking, playlist selection and progress handlers are unchanged.
- Browser inspection at 1440×900, 1280×720, 900×800 and 390×844. No horizontal document overflow was found at the inspected sizes. The 1280px opening spacing was addressed with a flowing desktop wordmark/invitation composition.
- Actual hero height remains three viewports. At scroll 1710px of its 1800px span, the video was at 9.991667 of 10.041667 seconds, with closure in progress. The unchanged 0.05-second margin avoids a blank final video frame.
- Model loaded successfully. Left/right pointer interaction visibly changed the eyes while the original camera and pose source remained unchanged.
- Play/pause worked on desktop and phone. Track switching selected Concreto Incarnat with its 5:32 duration. Pointer dragging sought it to 60.2% / 3:20; playback then advanced normally. Keyboard Home/ArrowRight seeking also responded.
- The persistent player appeared while browsing records, continued playback and paused successfully. It hid when the main player returned.
- One visible Kuala Lumpur mention, within the footer; booking email and release destinations are retained.
- Direct fragment arrival is restored after React mounts and the document loads. The player cleanup now avoids posting to a detached iframe during refresh/retry. The development entry reuses its root during hot updates.

## 12UI alignment and decisions

Reused all three original, unchanged LayerDocs in target-based Improve; no new design or conversion was purchased. Opening selector coverage passed. Initial lower-section captures incorrectly showed the opening; corrected captures show the actual cell and records after fixing fragment arrival. The lower captures' DOM extraction still reported only two usable layers and 50% source coverage; those plans were not applied as selector patches. The rendered sections were compared visually with the selected images instead.

The selected cell architecture and pale paper plate are integrated. The original live GLB and waveform replace the design's static face/trace by explicit user instruction. The opening omits the proposal's duplicated imprisoned character and destruction debris because the user selected quiet tension; original wordmark and film remain. The records omit the crowded four-column spread and new catalogue route, keeping the story separate below. Existing fonts and controls remain because generated replacements lost identity and behavior.

One design scan produced 15 advisory findings, all type-ramp or material-colour documentation differences. The intentional additions are recorded in DESIGN.md. This is not a claim of full accessibility certification.

## Evidence and limits

Implemented screenshots and the comparison gallery are saved in the user workspace at `Website/Quiet Tension - 2026-11-10/`. Raw 12UI kits remain outside the source repository. The inherited lazy 3D bundle-size advisory remains. Reduced-motion timing is covered by the existing tests and unchanged model code; browser preference emulation was not performed. Playback state and timing were verified, not an audio-mastering assessment. Social links and fuller biographical detail remain pending from the artist.
