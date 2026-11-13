# Bouncing Concrete — complete refinement plan

Reconciled on 12 November 2026 against the actual earlier chat proposals and current preview source. The previous list omitted the creative interaction layer. This restores that scope while distinguishing completed work, pending proposals and superseded choices. The user approved this execution order on 12 November. The open-player switching experiment comes first; the existing player presentation is approved. Public deployment remains separate.

## Current status — 13 November 2026

- Shared twelve-track catalogue/player, approved panel spacing, keyboard focus/escape review and local performance review are complete. Physical touch/device and slow-network acceptance remain open.
- Selection pulse now applies to all twelve tracks, including silent samples and repeat selections; it is an interaction response, not beat detection. The approved pulse shape is unchanged.
- Exact character raycast acceleration is implemented; see `PERFORMANCE-REVIEW.md` for measured costs and trade-offs. Do not reduce the approved render mesh as an automatic next step.
- Open-player track switching is approved, including the shared sample panels. Earlier acceptance-pending wording below is historical.
- Release metadata text now uses approved existing copy. Remaining release work: artist/contact closing review, main-site integration, confirmed catalogue/social content, public canonical/share assets, and device/network acceptance. Deployment remains separate.

## Approved foundation — preserve

- Actual-film hero, original fractured wordmark and current typography. Three-viewport scroll film with no extra introductory scroll lock.
- Film-to-live-character orientation, staged fragments/wreckage/sleeves/title entrance, and the empty-street plate during pullback. The user called the street handover beautiful.
- Rounded but imperfect actual character; attached curved titles, twelve-track capacity, approved idle motion, centre-to-cursor focus and deliberate neighbour handoff. Sticky capture is 70.56px horizontally / 60.48px vertically at desktop widths, responsively scaled.
- Orbit is The Records. Each real release has a substantial off-white listening view and shared compact transport; playback survives closing/reopening. No duplicate catalogue section.
- Funkacaine has actual audio-driven seismograph history, a fixed drawing point, smooth paper movement, pause freeze and shared expanded/compact history. User approved the drawing refinement.
- Real sleeves, blue/yellow identity, booking email and footer-only Kuala Lumpur.

## Restored creative refinements — execution order

### 1. Character awareness — approved and checkpointed

A small, heavy turn toward the track being approached; a brief settling response when it is selected. This is not the existing idle bob or general constellation steering. Preserve the character mesh, expression and resting pose. Do not move title targets, change magnetism or compete with the selected label. Limit rotations and ease back to approved idle motion after attention ends.

### 2. One convincing playback consequence — approved and checkpointed

Prototype one short disturbance on the first start of a track: pressure transmitted through selected wreckage, followed by a return to suspension. Establish this response first before expanding it into sustained music reactivity. Avoid making every object pulse together. The orbit currently receives no audio energy/onset feed; the seismograph alone does not implement this proposal.

After that response is accepted, consider selective reactions to meaningful musical events: a loose fragment rattles, a bent panel moves, or the character gives a restrained response. Reuse Funkacaine's existing analyser or prepared timing data; do not claim genuine reactivity for unavailable SoundCloud audio. Bound transforms, pause offscreen and respect reduced motion. Record incremental CPU/GPU costs for each addition.

### 3. Stronger depth and lighting — first lighting pass approved and checkpointed

Existing perspective, occlusion, fog and ground shadow provide basic depth. The earlier proposal went further: a few close fragments near the edges, softer distant pieces, changing light across turning surfaces and occasional character shadow across a sleeve. Use composition and lighting before adding objects. Maintain the pale environment and track legibility. Sleeve materials are currently unlit and do not receive shadows; any change needs a cost and artwork-colour comparison. Avoid heavy full-screen blur or new shadow passes without measured justification.

### 4. Two or three debris discoveries — parked as-is by user

Small object-specific rewards: a damaged sign slowly reveals its face, a wheel makes a partial turn, or chips shift around a slab. Choose a small number of memorable reactions and place their interaction areas away from track targets. The current merged wreckage and instanced chips have no individual hover behaviour; preserve that efficient rendering where possible using bounded, event-driven updates. Do not add continuous physics or make every object interactive.

## Listening, content and production refinements — follow the creative pass

### 5. Polish release presentation and listening transitions — player polish ready for review; high-resolution sleeves pending

The substantial release view, sleeve transition, compact player, real playback and seismograph are implemented. Further work is refinement of easing, background composition and playing/paused/loading/error states. Obtain the original high-resolution sleeves: current Funkacaine artwork is only 345×360 pixels and visibly soft when enlarged. Preserve uninterrupted playback and the same-track paused state.

### 6. Validate twelve-track content and discovery — capacity complete, final content pending

Stress-test long titles, artwork variation and crowded perspectives without reopening approved idle/selection behaviour. Consolidate catalogue metadata so orbit, Tracks and release sheets agree. Two real releases and ten clearly labelled samples are currently represented; replace samples only with supplied/confirmed content. Additional analysable audio is needed for genuine reactive traces and scene reactions on other tracks.

### 7. Complete touch, keyboard and reduced-motion behaviour — partly checked

Check actual phone tap/drag/scroll boundaries, portrait/landscape, keyboard selection, focus restoration and persistent-player clearance. Keep ordinary vertical scrolling and Tracks as an accessible alternative; do not imitate desktop cursor magnetism on touch. Existing narrow-viewport checks do not establish physical-phone performance.

### 8. Optimize delivery and rendering — pending measured device pass

Profile loading, frame time, memory and battery cost across representative hardware. The character is the main geometry cost (about one million source triangles); evaluate a lower-detail derivative while protecting its rough silhouette and film handover. Retain shared geometry, instanced debris, bounded texture/DPR sizes and visibility-aware updates. Measure each proposed effect while implementing it, rather than postponing all performance work to this stage.

### 9. Finish the artist/contact close and release readiness — partial

Refine the spatial-to-editorial exit, artist/contact composition, footer rhythm and confirmed destinations. Keep the existing positioning line and one-line bio; workshop additional copy. Do not invent shows, social links or biography. Then integrate the accepted study into the main website and check full forward/reverse travel, load/retry failures, audio switching/seeking, accessibility, responsive behaviour, metadata and share artwork. Save a final checkpoint; public deployment remains a separate action.

## Earlier proposals that need an explicit decision or were superseded

- Separate film-wreckage carryover: removed by the user on 12 November. The existing character transition already supplies the desired continuity; no additional object-match transition is needed.

- Full-track structure waveform beneath the live trace: originally suggested, not implemented. The approved current player uses a live seismograph plus a separate seek bar. Do not silently add another waveform or mistake the four-second trace for track structure. Revisit only if full-track navigation would benefit.
- Keep other orbital tracks directly selectable while the listening panel remains open: user authorized a reversible experiment on 12 November. Preserve the approved player design, with a resized interactive orbit above and the release sheet below; neither overlaps the other. Checkpoint: `checkpoints/before-open-player-switching-20261112-213904.zip`. Acceptance pending user review.
- Seismograph mechanical overshoot and about five seconds of history: initially exploratory suggestions. The accepted implementation preserves measured peaks without invented overshoot and shows four seconds. Do not count those as unfinished requirements.
- Separate duplicate Records catalogue: rejected in favour of orbit discovery plus substantial individual release views.
- Engineered confinement/cell direction: saved as an alternative; replaced by the gravitational aftermath in this active direction. Do not reinsert its walls or slit.
- Earlier background-only/audio-reactive listening studies: rejected or superseded; not a mandate to revive their effects.

## Proposal provenance

Recovered directly from this chat, not inferred from the code: the five-part response to “Agreed. Let's park that and zoom out a bit first to see how else we can juice up the experience based on what we've built so far.” (turn `01a1ce43-545e-7213-be69-cf06c04c2bdb`) proposed awareness, playback consequences, debris rewards, depth and specific wreckage continuity, prioritizing handover → awareness → one playback reaction. The listening proposal in turn `01a1ce3f-44f0-7b20-b709-8ddf1f75fa1f` supplied the optional waveform and nonmodal switching ideas; later approved mockups and subsequent user feedback govern their current status.
