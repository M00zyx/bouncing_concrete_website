# Bouncing Concrete — Spatial Music Study

An isolated interactive concept. Open http://127.0.0.1:4182/ while its preview server is running.

To restart from this folder: `python3 -m http.server 4182 --bind 127.0.0.1`.

## Interaction

Drag the scene to explore its depth. Select a title or use Tracks to start listening. Funkacaine and Concreto Incarnat use the existing official SoundCloud playlist and actual sleeves. Pressure Test, Aftershock, Load Bearing and Soft Collision are explicitly identified sample titles, with no invented audio. Reset view returns to the overview. Pause drift stops automatic movement; system reduced-motion preferences are respected.

## Preserved assets

The original concrete character GLB, material textures, Anton headings, DM Sans interface, DM Mono player detail, and blue/yellow brand highlights. No edits to the production website.

## Direction and references

- https://www.pinterest.com/pin/715579828320308040/ — central sculpture in space.
- https://www.pinterest.com/pin/764697211765111123/ — large typography, perspective and spatial proportions.
- 12UI candidate B was selected for its floating type arrangement, cobalt lead title and fore/mid/background scale differences. The conversion and comparison kit were reviewed. Its raster character and floor were deliberately replaced with the user's existing actual 3D model and a real scene, because a flat composite would defeat the requested interactive depth. The conversion's invented services section, wrong brand label and track misspelling were excluded. The existing fonts and approved track names take precedence.

## Verification

Reviewed in the browser at 1440×900, 390×844 and the default preview size. Confirmed drag changes perspective and occlusion, direct lettering selection, both real tracks' progressing playback, pause, keyboard seek, sample selection, track menu and reset. Preview requires WebGL and a network connection for SoundCloud audio. No publication or production integration is implied.


## Orbital refinement — 2026-11-11

Titles are now tessellated spherical bands, concentric with the character, rather than flat planes. Each follows its own orbital speed and latitude, passing both in front of and behind the model. A responsive wide-angle camera strengthens near/far scale and tapering. Framing fits the full orbital envelope to prevent viewport-edge cropping. Hover holds only the hovered release; Pause motion stops the whole arrangement.

Actual Funkacaine and Concreto Incarnat sleeves travel alongside their titles as flat record objects and are clickable. The four invented titles use blue/yellow typographic placeholders labelled SAMPLE SLEEVE, including in the track menu and selected-track panel. The initial source was archived in checkpoints/ before this revision.

The static 12UI reference remains a hierarchy/palette reference. The user's subsequent curved lettering, orbit, artwork and no-edge-cropping directions supersede its flat title placement.

Validation for the orbital revision: checked the rendered curvature, foreground/background passage, whole-frame fit at desktop and phone sizes, menu artwork, sample selection, pause/reset, and playback by clicking both an actual sleeve and the curved Funkacaine title. No browser errors were reported in the final check.


## Magnetic exploration refinement — 2026-11-11

- Title textures now measure actual glyph bounds, use an alphabetic baseline, and leave 32 pixels of padding. The previous top-baseline drawing touched the upper texture edge; all six corrected titles pass the browser pixel-clearance check.
- Six distinct vertical lanes reduce overlap. Framing allows for both the orbital envelope and steering; the shadow backdrop cannot cut into low labels.
- Idle orbital speeds are unchanged. Mouse movement wakes a faster exploration mode, picks an approached title/sleeve using screen proximity and travel direction, and rotates the whole arrangement toward the cursor.
- Acquisition hysteresis prevents neighbouring tracks stealing focus during a turn. Steering speed is capped, nearby clicks are assisted, and pointer-down freezes the arrangement until the click or drag is resolved. Stopping or leaving settles back to idle without resetting the discovered azimuth.
- Pause motion and reduced-motion preferences disable automatic steering. Touch keeps the direct drag/select interaction.
- `checks/type-bounds.html` verifies pixel clearance; `?motion-check=1` exposes an explicit browser pointer-sweep harness for acquisition, handoff and idle-transition checks. These test controls do not appear in the normal preview.

Final check: all six title textures have 31–32 clear pixels on each edge; the old method had 497 ink pixels touching the upper edge. Browser pointer-sweep checks exercised the actual mouse handlers, acquired the two real releases within the 28-pixel assisted-selection area, and returned to idle. The controlled continuous sweep ended on the intended second release. Playback progressed, pause worked, and the refreshed normal preview reported no JavaScript errors. The visual feel of cursor intent remains a user-review judgement.

The magnetic refinement was compared with the original design reference. Existing palette/type/character are retained; user-requested measured glyph bounds, increased vertical spacing and interactive steering supersede the static title positions in that reference.


## Foreground focus and boundary repulsion — 2026-11-11

- Saved the previous source in `checkpoints/before-focus-repulsion-20261111-200323.zip`.
- Mouse exploration wakes more quickly and turns faster. The approached release moves forward, faces the viewer, and settles at the cursor; once settled, it holds until the cursor travels away or leaves the scene.
- A 48-pixel departure threshold releases the held track. Directional acquisition still uses the positions seen at the beginning of an approach, so scene movement does not itself change the intended target.
- Active releases open toward available screen space. Fitting preserves the approached anchor rather than pushing its artwork away from the pointer. The lettering retains its spherical geometry.
- During exploration, projected title-and-sleeve boundaries repel one another. Other labels yield to the focused release; its click area is protected during the transition. Spacing uses actual world-space transforms, keeping rendering and hit testing together.
- Pointer-down holds the displayed arrangement until the click or drag resolves. Idle orbital phases, speeds, vertical lanes, shell radii and character bob formulas match the checkpoint. Touch drag, the track menu and reduced-motion behavior remain available.

Verified with the browser's pointer-sweep harness at 890×982, 1440×900 and 390×844: both real releases reached a settled 0-pixel anchor gap, with zero focused blockers, pairwise label-bound overlaps or viewport clipping in the checked settled states. Continuous handoff, pause inhibition and return to idle passed. A direct click on the settled Concreto Incarnat sleeve selected the correct track and playback advanced. Syntax checks and a four-label cluster spacing fixture passed. These controlled checks establish the tested behavior; the feel of cursor targeting still benefits from user review. `focus-preview.jpg` records an active state.

Compared with the unchanged original design LayerDoc using the alignment kit at `/private/tmp/bc-focus-alignment`. It proposed no recurring CSS token changes. The user's actual 3D character, original typography, orbital geometry and new interaction requirements continue to supersede the static reference's raster assets and flat placements.


## Correction: soft separation, not screen packing — 2026-11-11

The preceding zero-overlap acceptance target was too strict for a perspective scene. The full-ribbon rectangle solver repeatedly corrected already displaced labels, creating large moves and edge packing. Reproduced in the actual browser sweep: 229px peak spacing displacement; a minimal two-ribbon fixture returned 182px. A later settled snapshot reached 298px. These explain why the earlier collision checks passed while the interaction felt wrong.

Replaced the iterative solver and hard clearance passes with bounded offsets from the unmodified orbital poses: maximum 36px, eased with a 150px/second spacing-speed cap. No displacement is fed back into the next collision calculation. Removed active packing and resizing of all neighbouring labels. Normal perspective overlaps are allowed. The approached release alone receives foreground rendering and matching raycast priority once it arrives; hover and click agree on that target. Its original automatic acquisition behavior is retained.

The corrected browser sweep peaked at 18px spacing displacement, with both real releases reaching a 0px settled cursor gap. Hold/release passed: 0px maximum held gap, correct click target throughout, returning to idle with 0px residual spacing. A direct click on the foreground Concreto Incarnat lettering, with another track behind it, selected Concreto and started playback. `checks/spacing.test.mjs` covers the original overlapping-pair failure, a dense six-label cluster over 600 frames, displacement and speed caps, pinned focus, and release without retained offsets. Idle animation formulas remain unchanged. The screenshot is `soft-separation-preview.jpg`; human review of the continuous motion remains the final perceptual check.

Checkpoint: `checkpoints/before-soft-separation-20261111-202527.zip`.


## Unified spherical steering — 2026-11-11

Cursor attraction now rotates only the shared constellation. The individual foreground lift, camera-facing orientation, scale fitting, separation offsets and depth-priority override are disconnected. All labels and sleeves retain their original spherical transforms and natural depth occlusion. The earlier `focus-layout.js` and `spacing.js` are retained as historical source but are not imported by the scene.

`group-steering.js` supplies a damped shared angular velocity with bounded speed and acceleration. Its target orientation brings the approached anchor onto the cursor-facing surface while keeping spherical north upright at that point; repeated target changes cannot accumulate roll. During attraction, the independent idle drift eases down so the arrangement moves together. Leaving exploration restores the original track speeds, phases, lanes and character animation formulas. Larger turns retain their target until arrival or departure; a settled target holds for clicking. The cursor cannot pull an anchor outside its sphere: points beyond its silhouette attract the nearest rim.

Checkpoint: `checkpoints/before-group-steering-20261111-203922.zip`.

Validation: `node checks/group-steering.test.mjs` passes bounded speed/acceleration, unchanged radii and pairwise spacing, settling at 20/30/60 FPS simulation timesteps, and upright target alignment. Browser checks measured at most 8.9e-16 radial error and zero change from the original local poses while the group turned. Concreto Incarnat settled within 7px of the cursor; a direct title click selected it and playback advanced. Original idle parameters and character motion formulas were compared with the checkpoint. `group-rotation-preview.jpg` shows the active group, with full spherical attachment preserved. Motion feel remains a user-review judgment.

Final browser hold/release check passed: Funkacaine arrived and held within 19px of the cursor, retained the correct click target, and returned to idle. The group-attachment error stayed below 1e-15. Active steering uses its own elapsed-time allowance; the existing idle timestep remains unchanged.


## Faster approach, softer arrival — 2026-11-11

Only the shared steering response was tuned. The spring smoothly increases its drive for larger remaining turns (from frequency 8 near the target to 12 farther away), with matched damping. It returns to the existing soft response over the last roughly seven degrees. Angular acceleration is capped at 16 rad/s² and speed at 3.4 rad/s. The scene code, individual spherical transforms, target selection and idle behavior are byte-for-byte unchanged from the checkpoint.

Checkpoint: `checkpoints/before-faster-approach-20261111-211928.zip`.

The steering checks now also cover faster launch, progressive deceleration, no overshoot and quiet settling for short/long stationary turns over multiple simulation timesteps. In the controlled 1.2-radian turn, travel after 250ms increased from 0.323 to 0.503 radians; speed fell from its 3.4 rad/s peak to 0.133 rad/s within 0.02 radians of arrival. These are simulation measurements, not browser frame-rate claims. The browser hold/release check passed with the correct click target, intact spherical attachment and a return to idle.


## Local targeting and upper-row access — 2026-11-11

Replaced the distant 420px approach corridor with attraction within 64px of a visible curved ribbon or sleeve. Once acquired, the target stays latched during approach; deliberate pointer departure releases it. Empty-space cursor travel no longer steers the constellation. The track's existing sphere remains its only motion surface.

The steering drive now follows screen distance to the target, with lower drive and damping matched to a softer arrival near the cursor. The destination uses the nearest sphere intersection that remains visible around the character, and the group takes the minimum rotation from its current orientation. A visible upper/back label therefore does not have to perform a large front-facing reorientation just to become selectable. No label moves, scales or rotates independently. The earlier forced-upright target orientation is superseded during attraction; the established idle leveling remains.

Picking now covers the continuous curved title ribbon, including spaces between letters, with a 12px screen-space tolerance at its edge. Projected ribbon segments provide that tolerance rather than large enclosing rectangles. Depth/visibility checks exclude labels hidden by the character or another ribbon. Visible direct hits take priority over nearby padded hits.

Checkpoint: `checkpoints/before-local-targeting-20261111-214307.zip`. Browser module revisions were updated to ensure the corrected interaction files reload together.

Validation: the upper Pressure Test approach acquired only Pressure Test and settled within 4px of the cursor. A separate click 8px outside its upper curved edge selected Pressure Test with attraction paused, proving the hit-area change independently of magnetism. Continuous exploration reached Concreto Incarnat, its settled click selected the correct release, and playback advanced. Browser attachment error stayed below 1e-15 with zero local pose changes. The steering/targeting tests cover local reach, approach direction, deliberate release, forgiving thin-ribbon hits, screen-distance braking, shortest rigid rotation, stable settling, and preserved spherical radii/spacing. The idle layout function, track parameters, timestep and character formulas were compared with the checkpoint and remain unchanged. Human review remains the check for overall feel.


Cross-row refinement: a small snapshot of visible anchor positions lets a latched track yield to a different label the pointer deliberately approaches, without letting the scene's own rotation steal focus. Newly acquired targets have a short capture grace period; a departed track cannot immediately recapture the same gesture. Visible lettering and artwork take priority over a blank area in a nearer ribbon, with continuous-band fallback and edge padding used when no visible track occupies the point. Added `Explore into upper row` and `Check upper title edge` browser checks. The cross-row check successfully handed off from Funkacaine to Pressure Test and held the intended upper track; the expanded-edge check passed with attraction disabled.

When the pointer reaches the visible lettering or artwork, the steering anchor now follows the actual hit point instead of continuing to chase the original approach anchor. The final cross-row browser check settled on Pressure Test within 6px, with rigid spherical attachment preserved.


## Proximity rotation regression — 2026-11-11

The previous local-targeting change could freeze a rear track in place: its projected anchor already overlapped the cursor, the nearest sphere intersection kept it on the rear surface, and the dock condition ignored remaining rotation. Reproduced with the browser-only `Check proximity rotation` control: Pressure Test acquired and docked with zero group rotation.

Attraction now aims at the near sphere intersection, retains the acquired anchor during approach, and includes remaining angular travel in its braking distance. Docking requires angular arrival as well as cursor proximity and low speed; the existing 28px tolerance accommodates the sphere silhouette. Settled visible anchor positions refresh for subsequent selection, with deliberate close approaches allowed to hand off to another visible track. The whole constellation still rotates rigidly.

The original proximity check passed with a 36-degree turn and a 3px final gap. The cross-row check then handed off from Funkacaine to Pressure Test and settled within 4px; clicking selected Pressure Test. Steering and targeting tests pass. The idle layout function and track motion parameters are byte-for-byte unchanged from `checkpoints/before-proximity-fix-20261111-221039.zip`. This supersedes the earlier nearest-visible-intersection and continually reset anchor behavior.


## Earlier, centre-led attraction — 2026-11-11

User clarification: the track barely moves before stopping. The rear-sleeve proximity test did not cover this. Two additional browser checks reproduced the missing response: approaching to 100px above a front title acquired nothing (zero turn), and moving onto the outer portion of a front title docked the exact hit point without turning (zero turn).

Expanded directional acquisition from 64px to 180px, while retaining visibility checks and excluding distant 280px candidates. Titles now attract using their fixed centre on the spherical patch; sleeves use their fixed artwork centre. Selection still uses the actual curved geometry and small click padding. The centre-led front-title check turned 11 degrees and settled within 8px with Funkacaine clickable; the earlier approach produced a 31-degree turn. A cursor outside the projected sphere can only attract to its rim, so the early-approach check verifies visible engagement, not clickability outside the physical orbit.

All labels retain their local poses and spherical radii. The idle layout function and orbit parameters match checkpoint `before-continuous-follow-20261111-221915.zip`. Targeting and steering checks pass. These browser checks establish the changed behavior; user review remains the criterion for feel.

The wider zone only engages when cursor movement points closely toward that track (direction alignment above 0.85 outside the original 64px zone). Sideways nearby tracks therefore cannot use the wider range to intercept the approach. Added a regression check for that exclusion.

Final browser checks with directional acquisition retained: the 100px pre-hover approach turned 30 degrees (previously zero); Funkacaine-to-Pressure Test handoff acquired the intended two tracks and settled on Pressure Test within 4px. No independent label movement was introduced.


## Restored earlier whole-group steering — 2026-11-11

User reported sluggish movement and upside-down rotation after the recent attraction changes. Restored scene.js, group-steering.js and its tests from `before-faster-approach-20261111-211928.zip`, the whole-group baseline before the subsequent acceleration/local-targeting changes. Only cache revision strings differ from that scene checkpoint. Restored the compatible browser check panel from `before-local-targeting-20261111-214307.zip`. The current experiment is preserved in `before-upright-rollback-20261111-222924.zip`.

This restores the original damped angular response and upright target orientation. The recent minimal-turn orientation retained accumulated twist, allowing repeated selections to roll the arrangement; the baseline computes each target against a fixed upright reference. Labels and sleeves remain on their spherical patches. Idle, actual character, typography, sleeves and player use the saved baseline. The later expanded hit-padding and attraction experiments are no longer active. Files for those experiments remain archived or unimported. This is a rollback, not another round of tuning.

Rollback validation: restored scene/steering/test sources match the chosen checkpoint exactly except cache query strings. Steering tests pass, including upright target alignment. Browser exploration settled on Concreto Incarnat within 9px, clicking selected that release, and its playback advanced to 0:07. No independent local pose change was recorded. The earlier baseline is restored; the later top-row targeting refinements have intentionally been rolled back with the experiment.


## Suspended street wreckage — 2026-11-11

Added eight fixed street-debris props (bent lamp, damaged horizontal signal, blue street sign, detached wheel, bent railing and three painted road slabs) plus sixteen instanced chips. Inspired by the existing film's modern street. Kenney CC0 geometry supplies the lamp/signal/sign; the other objects are original. Source records and the licence are in `asset-sources/README.md`.

All props retain their local poses inside a shared slow orbit, parented to the existing constellation. No physics, per-object animation, new lights, prop shadows, textures or interactive hit targets. The restored track-steering module and the existing idle layout code are unchanged. The one merged GLB plus one instanced rubble mesh add two draw calls and 1,954 triangles. The GLB is about 133 KB; total geometry/instance buffers are 135,010 bytes. Browser A/B counters verified the two-call and 1,954-triangle difference with the same texture count. This does not optimise the pre-existing character, which remains the dominant render cost.

Checkpoint saved in `checkpoints/before-orbital-debris-*.zip`. Build with `python3 scripts/build_orbital_debris.py`; inspect renderer counters with `?debris-check=1`.

Browser acceptance: the existing two-release check reached Concreto Incarnat with a 9px settled gap and unchanged spherical attachment. The wheel was moved below the initial sleeve row for visibility. A clean composition screenshot is saved as `orbital-wreckage-preview.jpg`. Source attribution and renderer counter comparison are in `asset-sources/README.md`.


## Damaged, textured debris — 2026-11-11

Saved `before-damaged-debris-20261111-230025.zip`. Reworked the debris silhouettes: irregular fractured slabs and rebar, buckled/broken railing, a folded/torn sign, a crushed signal with loose wires, and a deformed/torn tyre with tread cuts and a damaged rim. Replaced jewel-like chips with flattened irregular fragments. Three shared 256px material maps add grime, aggregate, worn paint, surface normals and varying roughness/metalness; all are baked offline.

The final layer is 4,421 triangles, two draw calls, a 520,484-byte GLB, 338,701 bytes of geometry/instance buffers and approximately 1MiB of texture storage including mipmaps. The scene behavior source is unchanged except its cache revision. No physics, new lights, shadow passes or per-prop animation were added. Current source credits and material details supersede the original texture-free prototype description in `asset-sources/README.md`.


### 2026-11-12 — readable upper/lower row selection

Checkpoint: `checkpoints/before-polar-selection-20261112-084447.zip` (verified archive; source, checks and assets, excluding unchanged vendor files and earlier checkpoints).

Active selection rotates the existing rigid constellation toward a camera-facing spherical cap. Upper/lower lanes aim the title centre instead of an arbitrary sleeve/letter anchor; this presents more of the whole word. Docking requires the rotation to settle, rather than stopping merely because a skewed anchor happens to be near the pointer. The focused title accepts clicks in inter-letter spaces within its ink bounds, still using scene depth. Crossing within that focused title no longer releases it just because the pointer moved 48px.

Idle layout, orbital speeds, steering spring limits, assets, character and player code are unchanged. No new textures, geometry or render passes. Existing acquisition scoring is retained; wide sweeps across multiple ribbons can still acquire intervening tracks. Edge approaches intentionally bring text inward to a readable position, so it may settle short of a cursor at the outer silhouette.

Checks: existing speed/acceleration, rigid-spacing and upright-orientation tests pass; added camera-facing cap, radius and perspective-incidence fixtures pass. Browser title-centre approach sequence reached Funkacaine at 6px and Concreto Incarnat at 25px; Concreto click selected the correct release and enabled playback. Browser approach checks now aim title centres to cover the reported label problem, rather than sleeve centres.

Final upper-row browser check: Pressure Test settled at 6px and selected correctly; source attachment error remained below 1e-15 and local pose error stayed zero.
Browser hold/release check passed: max gap 6px, correct click target throughout hold, then IDLE after leaving the scene; no captured console errors.


### 2026-11-12 — bounded sticky focus and cursor guidance

Checkpoint: `checkpoints/before-sticky-focus-20261112-103745.zip`.

Once a title settles, it owns proximity focus within a fixed 180 CSS-pixel radius of that cursor position (24% of viewport width on narrower screens). Moving more than 3px wakes the same title and steers the whole constellation again. Redocking does not reset the capture origin, so slow motion cannot create an endless tether. Neighbouring ribbons cannot take steering or hover ownership within that range. Moving beyond it releases the owner, with a 450ms exclusion against immediately reacquiring the same track; leaving the scene, resetting, pausing or clicking also ends the proximity interaction. An explicit click may choose another visible title.

Stickiness starts on settled focus, not speculative early acquisition, so sweeping past a title during the initial approach does not lock it prematurely. The original candidate scoring and idle animation are preserved. The existing readable spherical cap still limits extreme edge destinations. No individual label offsets, new rendering passes, textures or physics.

Regression reproduction: the browser-only `Check sticky Pressure Test` control failed before the change: focus switched to Load Bearing and four 70–80px pointer moves displaced the intended title only 2/2/2/3px. The same control exercises actual pointer handlers, four-direction following, owner retention, click-target consistency, rigid attachment and slow release beyond the fixed capture range. Equivalent coverage exists for Concreto Incarnat. Debug controls remain available only with `?motion-check=1`.

Final browser regressions: Pressure Test PASS (68/59/69/61px following); Concreto Incarnat PASS (44/40/63/47px following). Both retained ownership across all four movements, kept the correct click target, retained spherical attachment, and released beyond the capture range. Existing hold/release check passed (8px maximum gap and return to IDLE). Existing steering/radius/upright/perspective tests pass. Idle arrangement, steering dynamics and debris module match the checkpoint.
Final visible check: guided Pressure Test downward without losing ownership (12px settled cursor gap), then clicked the visible label and confirmed Pressure Test details opened. No captured console errors. Clean preview restored at http://127.0.0.1:4182/. Screenshot: `sticky-focus-preview.png`.


### 2026-11-12 — overlapping title focus

Checkpoint: `checkpoints/before-overlap-focus-20261112-112239.zip`.

While a track has active proximity focus, crossing title/sleeve groups ease to 12% opacity and stop writing depth; the focused group draws after them while retaining normal depth against the character and debris. Ray selection skips these receding neighbours, so the focused word and sleeve stay clickable across the overlap. Other groups retain normal appearance; releasing focus restores opacity and depth. Projected bounds use a small precomputed set of curved-surface samples and individual sleeve/marker boxes, rather than an enclosing box for the entire ribbon. No new meshes, textures, render passes, forces or label transforms.

Verified `overlap-focus.test.mjs`: overlap-only fading, solid owner, unchanged non-overlapping neighbour, render/depth priority, identical poses and full release restoration. Steering tests pass. Idle arrangement, sticky pointer handlers, steering dynamics and debris match the checkpoint. Browser sticky Concreto check passed. The debug-only stacked Concreto/Soft Collision fixture passed at full owner opacity and 0.12 neighbour opacity; an actual click away from the cursor magnet selected Concreto and opened its working player. No captured console errors. Fixture clears on reset/reload; it is only exposed by `?motion-check=1`. Screenshot: `overlap-focus-preview.png`.


### 2026-11-12 — visible choices, shorter grip, deliberate handoff

Supersedes the fading treatment above. Checkpoint: `checkpoints/before-visible-handoff-20261112-113732.zip`.

Removed the fade/depth-priority renderer and its old test. Every title/sleeve retains full opacity and normal scene depth. All titles now accept inter-letter spaces; a real visible hit takes priority over the previous owner's magnetic bubble, including on pointer-down. Within a sticky capture, moving at least 18px onto another visible label starts a 160ms handoff intention. A brief crossing cancels it; deliberately staying on that label transfers focus. While that intention is pending, the old target stops chasing the cursor. Explicit clicks do not wait for the handoff timer.

Sticky reach is reduced exactly 30%: `min(126px, viewportWidth * .168)` versus the former `min(180px, viewportWidth * .24)`.

A bounded whole-group orientation search runs once as a new target arrives. It samples small pitch/yaw corrections, accepts only at least 12% improvement in estimated projected overlap and no more than 28px movement of the focus point, and uses the existing smooth spring. It does not change individual poses, opacity or depth. Some overlapping arrangements cannot be separated within these bounds; in those cases it preserves the current orientation and keeps visible alternatives clickable. It never repeatedly searches while the user drags or during idle.

Validation: solid-label/normal-depth/rigid-transform and bounded-correction test passes; the synthetic projection fixture improved overlap score from .2551 to .2229 with 20px focus displacement. The browser stacked-title handoff check passed: all labels solid, brief crossing retained Concreto, deliberate hover transferred to Soft Collision, click selected Soft Collision, radius 126px. The previous strict sticky-owner tests intentionally represent the older no-handoff contract and are not acceptance tests for deliberate hovering over another visible track. Idle arrangement, spring and debris source match the checkpoint.
Final browser hold/release check also passed: maximum cursor gap 8px, correct target during the hold and return to IDLE. No captured console errors.


### 2026-11-12 — staggered rows and bounded spherical spacing

Checkpoint: `checkpoints/before-spherical-spacing-20261112-122702.zip`.

The user approved adjusting relative positions to prevent clustering, while keeping the idle pace and attached spherical appearance. Starting lanes are now 1.7, -1.75, 2.85, .55, -2.9 and -.6, with staggered phases for the sample tracks. In particular, Concreto and Load Bearing no longer share essentially the same lower latitude. Track speeds are unchanged.

`sphere-spacing.js` replaces the limited whole-group overlap search. During settled exploration, a deterministic search every 300ms scores the projected curved title strips and sleeves and selects bounded latitude/longitude offsets. Limits are .26 radians vertically and .14 horizontally relative to each natural orbit; angular easing is capped at .20 radians/second. A minimum improvement threshold and fixed search order prevent repeated direction changes. The focused label is pinned. The next label under deliberate approach is protected; all local spacing motion pauses during a possible handoff or a fast group turn. Offsets ease back to the natural idle lanes after release. The camera, original idle speeds, steering spring, 70.56px by 100.8px sticky ellipse, click/handoff handling, character, debris and player are retained. No fading or extra rendering assets/passes.

Projection and rendering share the same spherical pose function, keeping each curved patch concentric with the character instead of applying detached screen offsets. Search scoring also discourages moving labels beyond the viewport. Normal depth occlusion and some perspective overlap remain possible; the correction is intentionally bounded.

Verification: unit checks pass for crowding reduction, fixed owner/next choice, offset and velocity limits, static-goal stability, exact radius/tangent orientation, full opacity and idle return. Existing steering tests pass. Browser deliberate-stack fixture reduced its overlap measure from 1.152 to .240 (79%), with zero owner shift and radius error below 1e-15. The recorded solve was .2ms on this browser, not a cross-device guarantee. Browser handoff/click check passed for Soft Collision after separation. Hold/release passed with an 8px maximum gap and return to IDLE.


### 2026-11-12 — rounded character silhouette

Checkpoint: `checkpoints/before-rounder-character-20261112-125514.zip` (archive integrity checked). The accepted spherical label spacing is included.

The user requested removal of the protruding lower nubs, aiming for a sphere while retaining the rough imperfect concrete character. `assets/concrete-blob-rounded.glb` is a separate derivative of the existing web asset; the original web GLB and high-resolution source are untouched. The lower hemisphere is reshaped offline toward a slightly irregular spherical envelope. Fine lower relief is reduced rather than erased; original texture images, UVs, triangle topology, and upper geometry are retained. Normals and tangents are transformed with the deformation, and the original framing is stored with the asset to keep the upper face at its prior scale and position.

Rebuild with `node scripts/round-character.mjs /path/to/meshoptimizer`. This session used the existing cached meshoptimizer package. No new software was installed. A background Blender inspection attempt crashed; it was not used for the delivered asset.

Cost: 7,822,980 bytes versus 7,886,940 originally (63,960 bytes smaller); unchanged 669,535 vertices and 999,996 triangles; no additional textures, draw calls, or per-frame deformation. This preserves the existing rendering budget; it does not claim to optimize the original high triangle count.

Validation: `node checks/character-asset.test.mjs` passes unchanged texture/topology/UV bytes, upper-vertex preservation, valid normal/tangent vectors, and file-size check. The build rejects inverted deformation Jacobians. Scene syntax passes. Browser review covered front, side and back during refinement and the final character in the complete scene, with no reported browser errors. Spacing, steering and debris sources are byte-identical to the checkpoint; scene changes are limited to asset loading and original framing.

Comparison: `checks/character-shape.html` offers original/revised and front/side/back controls. Screenshot: `rounded-character-preview.png`. Main preview: http://127.0.0.1:4182/ .
