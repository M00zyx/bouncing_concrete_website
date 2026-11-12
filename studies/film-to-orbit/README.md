# Film to Orbit — isolated integration preview

Created 12 November 2026. Preview: http://127.0.0.1:4185/ .

Run locally with `python3 serve.py` from this folder. The server implements HTTP byte ranges for scroll-controlled MP4 seeking and no-store responses to avoid mixed cached animation revisions. Standard `python -m http.server` did not expose a usable seek range in the test browser; use the included server or another range-capable server.

## Approved scope

This preview connects the approved actual-film hero, original three-viewport film sequence and accepted spatial records scene. The original production React site, standalone Spatial Music Study, and approved hero mockup remain untouched.

Checkpoint before work: `../Spatial Music Study/checkpoints/before-film-integration-20261112-141721.zip`. Includes both source previews, assets and vendor libraries; archive integrity verified.

The original film frame, fractured wordmark and DM Sans are used directly. The hero title clears early while the film scrubs across the 300svh journey. The movie finishes before the dissolve. The film fades through a brief dark handover, followed by a uniform pullback of the spherical character as the debris and record labels arrive. Film and mesh silhouettes are never superimposed. The approved mesh proportions stay fixed. The entry pose matches the film's downward tilt, sideways angle and clockwise roll; it is held through the reveal, then eases toward the accepted listening pose late in the pullback.

The final sticky viewport is the interactive music scene. There is no separate redundant record catalogue. A compact artist/contact close provides real destinations for About and Contact and keeps Kuala Lumpur in the footer. This closing layout is supporting preview structure, not the final full-page styling pass.

## Isolation and behavior

`orbit/` is a self-contained copy of the approved scene, embedded in the sticky stage. It keeps its player, sample titles, original idle speeds, spherical labels, elliptical sticky selection and neighbour handoff. The group-steering, sphere-spacing and base debris modules match the accepted standalone study. Integration adds staged entry transforms, visibility scheduling and a back-to-film action. Visible incoming tracks accept direct clicks before full exploration starts; magnetic steering and the original idle motion resume at arrival. Labels use rotation and occlusion for their entrance, without opacity fading. The temporary uniform character scale restores the accepted scene's original size at arrival.

The iframe loads after the first 10% of the journey or immediately on Listen. It signals readiness after the character and title assets load. The film overlay remains until a completed video seek confirms the endpoint and the scene reports its first rendered frame. A requested currentTime alone cannot trigger the handover. A scene-load timeout and retry/direct SoundCloud fallback are provided. Reduced motion keeps a still film frame and switches at arrival. On coarse pointers, vertical browser panning is permitted in the scene; sleeves/titles and Tracks remain tappable. Desktop drag remains unchanged.

The scene stops scheduling animation frames while hidden behind the opening, outside the viewport, or when the document is hidden. The film is muted and scroll-controlled. One original SoundCloud widget persists while moving through the page. The larger editorial release panel, animated seismograph, persistent playback bar and reactive character/debris effects are intentionally deferred to the subsequent approved stages.

## Verification

- `node checks/journey.test.mjs`: film completes before dissolve, title exit and label staging, bounded progress, reduced-motion endpoints.
- Existing sphere-spacing, group-steering and character-asset checks passed in the copied scene.
- Live browser: film at 5.25 seconds at progress .400; final frame at 9.98 seconds before the handover; arrival becomes interactive at progress 1.
- Integrated hold/release PASS: maximum gap 6px, correct click target, spherical attachment error 8.9e-16, release returns to IDLE.
- Integrated visible handoff PASS: labels solid, brief crossing retained Concreto Incarnat, deliberate hover/click selected Soft Collision. Fixed a stale debug-report reference to the removed overlap-navigation module in this preview's test harness only.
- Selected Funkacaine through Tracks; playback advanced to 0:42 and paused successfully.
- The Listen shortcut and return to the opening worked; normal wheel scrolling through the scene reached the artist/contact section.
- Hidden-scene frame count remained 3509 across separate observations after returning to the opening; running state false.
- Reviewed 1280x720 desktop and 390x844 narrow layout. The narrow review verifies layout and direct navigation, not a physical-device touch test.
- Final normal preview reported no browser console errors.

## Design alignment

`hero-implemented.png` and `hero-mobile.png` record the hero. The approved 1280x720 mockup was compared against the implemented capture. A target-based alignment kit is retained in `review/hero-alignment/`; it is an unanchored target specification, not an automatic DOM-diff proof. No recurring token changes were proposed. Its inferred Inter font and flattened photo/wordmark layer were not substituted: the user's approved original DM Sans, separate wordmark and real video layers remain authoritative and visually match the approved composition. The original scene layout was retained rather than regenerated.

`orbit-arrival.png` records the end state. Query `?journey-check=1` exposes stage-navigation controls for inspection. Add `&scene-check=1#music` for the existing scene interaction checks. Both are absent from the normal preview.

## Scroll repair — 12 November 2026

User reported a static opening followed by a bright, distorted character. Checkpoint: `checkpoints/before-scroll-repair-20261112-152652.zip` (source files changed by this correction).

Confirmed: the old entrance stretched X/Y/Z differently; the old handover accepted a requested video time before decoding finished; the browser retained an old journey-state module after a reload. Fixed these independently. Media readiness is now recorded on loadeddata/canplay/seeked before requesting another seek. Cache revisions and no-store serving prevent mixed versions. Ordinary scrolling keeps the film visible if it fails; the explicit Listen shortcut remains usable. The film is still muted, paused, and driven by scroll across the 300svh stage.

The reported completely frozen film was not reproduced in this controlled browser session, including a fresh reload. Do not infer that the specific user-side freeze is conclusively resolved from this alone. The fresh revised preview was verified with real wheel scrolling: progress .25 -> decoded film 3.283s; .50 -> 6.567s; .90 -> final frame 9.982s and a clean, single spherical character emerging from darkness; 1.0 -> interactive scene. Reverse wheel scrolling returned to film 7.944s at progress .605. No browser console errors were reported. `film-scroll-verified.png` records a visible middle film frame. This is desktop in-app browser evidence, not physical mobile or cross-browser verification.

`node checks/entrance.test.mjs` failed on the pre-fix unequal scaling and now passes. `node checks/media-handover.test.mjs` failed against checkpoint source (film disappeared while the final seek was still pending) and now passes. `node checks/journey.test.mjs` also checks that film/mesh silhouettes cannot overlap. Steering, spacing and debris modules remain byte-identical to the standalone approved study.

## Orientation continuity — 12 November 2026

After review, the user identified an orientation jump between the film and 3D reveal. Saved a source checkpoint before this adjustment. Compared the actual film endpoint at 9.98 seconds with the rendered character and tuned the entrance rotation to (.67, -.35, -.33) radians. Hold it through arrival .60, then smoothstep to the existing (.506, 0, .052) resting pose. Uniform scale, the film, transition timing, idle motion, label selection and mesh asset remain unchanged. This is visual pose alignment, not an exact asset or lighting match.

Verified with actual wheel scrolling at the reveal, late pullback and arrival, including reverse travel. `orientation-reveal.png` records the initial face angle. Entrance checks cover uniform proportions, a held reveal pose, continuous rotation at the turn/idle boundaries, and restoration of the original resting angle. Browser console errors: none.

## Staged entrance — 12 November 2026

Checkpoint: `checkpoints/before-entry-sequence-20261112-160034.zip`. The approved character reveal/pose, film mapping and 300svh duration remain unchanged.

Sequence is derived from the existing arrival progress, not timers. Small instanced chips begin first (.15-.49); larger wreckage follows with staggered object onsets (.34-.48, each finishing .24 later). Each rigid piece travels around from behind the character onto its original suspended position. Track groups start at .64, staggered by .035, and finish between .90 and .99. Sleeves, curved titles and their markers remain paired on their original spherical radii. Funkacaine leads, then Concreto Incarnat, then samples. Controls and existing idle motion resume at arrival 1. Reverse scrolling unwinds the sequence.

Incoming visible groups are directly clickable from the first track onset, using their actual rendered spherical transforms. Hidden groups are excluded from picking. Magnetic steering waits until full arrival. Early selection displays the player; a swipe/drag threshold prevents treating movement as a click.

The debris retains its merged mesh and instancing. `assets/debris-entry-parts.json` was recovered from the deterministic original baker, and its position buffer was verified byte-for-byte against the accepted GLB. Constant per-object centre/onset attributes drive a vertex-shader translation; geometry is not bent or rebuilt. Signal housing and wires share the same rigid translation. No new geometry, textures, shadow passes or physics were added. The added attributes occupy 151,024 bytes (147.5 KiB) on each CPU/GPU copy, plus small metadata/uniform overhead. This is memory accounting, not a frame-time benchmark.

Browser acceptance: inspected character-only, fragment, wreckage, first-record and settled stages; normal wheel scrolling forward and back; selected Funkacaine at journey .965 while full exploration was still disabled and observed successful playback, then paused. Existing hold/release check passed with an 8px maximum gap, 8.9e-16 attachment error, correct click and return to IDLE. Renderer toggle measured 59 -> 57 draw calls and 2,019,859 -> 2,015,438 triangles when hiding debris: exactly the original two calls / 4,421 triangles. No browser errors reported. `entry-sequence-preview.png` records the record entrance without debug controls. Physical mobile interaction and cross-browser performance were not tested in this pass.

Checks passed: `checks/entry-sequence.test.mjs`, entrance orientation/proportions, media handover, journey timing, existing group-steering and sphere-spacing checks. `?journey-check=1` exposes the stage buttons; `&entry-check=1` adds the debris performance toggle. Both are absent from the normal preview.

## Connected listening — 12 November 2026

Checkpoint before implementation: `checkpoints/before-connected-listening-20261112-164217.zip` (34 source files with SHA-256 manifest; original scene assets unchanged).

The parent page now owns a single shared transport and the approved expanded release sheet plus compact player. A click on a real orbit sleeve/title, or the Tracks list, opens its release sheet. The selected sleeve approaches its panel position from the projected 3D position; reduced motion removes this animation. Returning to orbit preserves playback and position; reopening the compact view preserves paused state too. Sample labels remain explicitly samples and do not interrupt current audio. A native modal provides focus containment and Escape dismissal. Compact controls remain available when scrolling past the scene.

Funkacaine is streamed through one HTML audio element from a 192 kbps MP3 converted from the user-supplied Techno 061.wav (252.923084 seconds). The source WAV is not copied into the site. Web Audio connects that element to one 1024-sample analyser; the seismograph records four signed peak values per 30 Hz update into a fixed 512-value history. No synthetic beats, whole-track PCM decoding, second audio instance or additional WebGL canvas is used. Only the visible trace is painted, canvas DPR is capped at 1.5, hidden documents stop tracing, reduced-motion preferences suppress the moving trace, and pausing suspends the audio context. The compact and expanded traces share the same history. The user liked the current response; the later suggested fixed pen / smoother paper motion is not implemented in this pass.

Concreto Incarnat retains SoundCloud playback through the shared controls. Its stream cannot supply analyser samples through the Widget API, so it shows a flat trace with an explanatory note; there is no simulated reaction. Switching between it and Funkacaine stops the previous source. The embedded orbit no longer initializes its own SoundCloud transport. The standalone study remains unchanged.

The scene controls hide during the enlarged background transition, then return after the view settles. A resize while the sheet is open repositions the page to the end of the film, keeping the actual orbit behind it. The server now handles byte ranges for audio as well as MP4.

Verification: direct 3D Funkacaine sleeve selection and Tracks-list selection; actual native audio playing and position advancing; seeking to 1:41; uninterrupted playback after collapsing; pause and reopening at the identical position; samples leaving audio playing; Concreto playing at 0:40 / 5:32 while native Funkacaine was paused; viewport 390x844 layout and modal resize keeping scene bounds 0..844 with film hidden. Fresh normal wheel scrolling decoded film 4.597s at progress .3501, then reached interactive orbit. Film stage remained 2946px at a 982px viewport (3x). Browser console errors: none. This is desktop-browser viewport verification, not physical-device touch testing.

Seven checks pass: shared playback continuity/bounded seek/replay, media handover, journey, uniform entrance/orientation, track entry sequence, group steering and sphere spacing. The media-handover harness was updated to stub the new view boundary and strip all module imports; its original assertions remain intact.

Design: expanded sheet reuses the approved mockup with original sleeve and fonts. Target-based alignment kit retained in `review/connected-listening/alignment`; screenshot mode is unanchored and is not an automated fidelity score. Generated imagery, typography and incorrect duration never replace real assets. The compact-state branch was blocked by the design service's insufficient prepaid balance; the saved result documents this. Its controls derive from the approved expanded view. No top-up, public deployment or GitHub push was performed in this step.

## Twelve-track capacity — 12 November 2026

Checkpoint before changes: `checkpoints/before-12-tracks-20261112-200447.zip` (39 source files with SHA-256 manifest; immutable media remains in place).

Twelve orbiting sleeves/titles: the existing two real releases and ten clearly labelled sample titles. New samples are Fault Line, Night Works, Dead Load, Stress Field, Ground Shift and Rebar. Existing six sizes, phases, heights and speeds are retained. New samples are paired across the sphere at matching speeds, with fixed angular staggering (up to .45rad from opposite) to clear adjacent rows; their type is 10% smaller than its paired original. They remain attached to the same spherical shells. The original idle integration, steering, elliptical stickiness, handoff and spherical spacing code remain unchanged. All audio and seismograph files and the parent film journey are byte-identical to the checkpoint.

The entrance now normalizes the track rank to the existing .64..99 arrival window, so all twelve finish entering before exploration begins. The six-track timing remains identical when count=6.

Sleeves share one BoxGeometry with two contiguous material groups (four edge faces, two printed faces), preserving every original index, vertex, normal and UV. Markers share geometry/material; sample art is generated once. Measured scene cost: 59 -> 65 draw calls (+10.2%), 2,019,859 -> 2,035,303 triangles (+0.76%), 22 -> 18 geometries, 21 -> 33 textures. No added character mesh, physics, WebGL context or audio download. These are renderer counts, not a frame-time guarantee on other devices.

Placement verification: the first exact-opposite arrangement passed focused hold/release but missed the existing crowding reduction threshold; merely shrinking new text also missed it. Measured label dimensions were used to compare staggered placements over several idle times. Final browser stress fixture passed: crowding 4.385 -> 2.075, owner shift zero, attachment error 8.9e-16, maximum latitude offset .150rad, spacing solve ~0.4ms in that observation. No spacing thresholds or selection limits were loosened. Visible handoff passed: a brief crossing retained Concreto Incarnat; deliberate hover/click selected Soft Collision; all labels stayed opaque. Funkacaine hold/release passed with an 8px gap and return to IDLE. New top-row Dead Load acquired, settled and clicked correctly. Mobile viewport 390x844 showed all twelve choices in the scrollable Tracks list and selected the last item, Rebar. Physical touch hardware not tested.

Eight node checks passed: twelve-track invariants and exact sleeve geometry, entrance sequencing, entrance proportions/orientation, journey, media handover, shared playback, group steering and sphere spacing. Diagnostic-only controls now include approaches to the six new samples and an optional layout-metrics readout. Review evidence is in `review/twelve-tracks/`.


## Focused title centring — 2026-11-12

Checkpoint: `checkpoints/before-cursor-centering-20261112-203026.zip`.

All focus acquisitions now target the title's local centre, including approaches from a sleeve or curved edge. Steering uses the cursor ray directly instead of pulling its destination inward to a camera-facing cap. Alignment continues after docking so the easing camera cannot leave a residual horizontal or vertical offset. Docking waits for angular error below .001rad and speed below .01rad/s. The original spring, upright orientation, elliptical release range, visible-label hit priority and idle integration are retained. Cursors beyond the projected shell still attract the closest available rim; labels never detach to reach an impossible point.

Browser checks: Dead Load (upper), Ground Shift (lower) and Stress Field (middle) each settled within .34px on either axis, then reached 0px displayed error. Correct click targets and rigid attachment were retained. Hold/release and deliberate visible-label handoff passed. Projection tests cover both preview aspect ratios and both axes, plus unreachable-rim attachment. The existing 12-track, sphere spacing, playback and entry checks passed. Film, audio, seismograph, idle integration and spacing were checked against the checkpoint and remain unchanged.


## Approved focus range — 2026-11-12

The user approved centre-to-cursor alignment and then a 40% reduction in vertical sticky ownership. The fixed capture ellipse now uses horizontal radius `min(100.8, viewportWidth * .1344) * .7` and vertical radius `min(100.8, viewportWidth * .1344) * .6`: 70.56px horizontally and 60.48px vertically at desktop widths. Horizontal reach and idle motion are unchanged. This supersedes earlier sticky-range figures in the inherited study history.
