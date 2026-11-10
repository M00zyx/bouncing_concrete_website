---
name: Bouncing Concrete
description: A tactile music world where a confined concrete character opens into records, liner notes, and listening.
colors:
  cobalt: "#1736df"
  yellow: "#ffd900"
  yellow-hover: "#ffea57"
  ink: "#151a17"
  paper: "#e6e5dc"
  film-deep: "#05070d"
  muted-copy: "#b8c0ae"
  dark-line: "#3a4334"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(56px, 7vw, 96px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(42px, 5.6vw, 76px)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(26px, 2.6vw, 40px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
  ui:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
rounded:
  none: "0"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  touch: "44px"
  desktop-gutter: "8vw"
  mobile-gutter: "7vw"
components:
  primary-link:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "16px 22px"
    height: "56px"
  primary-link-hover:
    backgroundColor: "{colors.yellow-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  play-button:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "72px"
    width: "72px"
    height: "72px"
  record-sleeve:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0"
  mini-player:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 18px 12px 12px"
    width: "min(640px, calc(100% - 40px))"
  nav-link:
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0"
  waveform-scrubber:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "72px"
    width: "100%"
---

# Design System: Bouncing Concrete

## Overview

**Creative North Star: "The character is confined, but the music keeps getting out."**

Bouncing Concrete is an Experience surface built as an authored print-to-film encounter. A cobalt physical poster, fractured white wordmark, and yellow concrete face establish the identity; the poster then recedes through the original film into a dark architectural cell and a narrow listening aperture. The visual world is tactile and physical, with visible raster texture, real artwork, and the existing 3D character carrying the atmosphere.

The page opens into listening rather than a generic catalogue. The dark cell gives way to a pale concrete records and liner-note ground, then returns to a compact dark contact and footer close. Navigation, the featured play action, actual release links, booking contact, and a persistent player remain legible inside the composition.

**Key Characteristics:**
- Poster → film → confinement → listening progression.
- Cobalt/yellow print identity over dark textured architecture.
- Pale concrete release and liner-note ground.
- Squared controls, local depth, and authored responsive stacking.

## Colors

The palette moves between a high-contrast print identity, a dark textured cell, and a pale concrete editorial ground. Yellow is reserved for listening actions, focus, and the waveform's live pointer; cobalt anchors the poster and pale-surface links.

### Primary
- **Cobalt Poster:** the identity field, lower-surface accent, progress line, and focus treatment on pale surfaces.
- **Signal Yellow:** the featured play action, active waveform pointer, selection, and high-salience interaction state.
- **Signal Yellow Hover:** the lighter response for yellow action controls.

### Neutral
- **Ink:** the film backing, cell, player surface, contact section, and footer ground.
- **Concrete Paper:** the records and liner-note ground and the persistent player surface.
- **Film Deep:** the video backing and header shade behind the first viewport.
- **Muted Copy:** quiet footer, contact, and status text.
- **Dark Line:** dividers in the contact and footer close.

### Named Rules

**The Three-Ground Rule.** Keep the dark textured world for film, cell, and listening; use pale paper for records and liner notes; return to a compact dark ground for contact and footer. Do not flatten the page into one continuous wash.

## Typography

**Display Font:** Anton (self-hosted, with `sans-serif` fallback)
**Body Font:** DM Sans (self-hosted, with Arial/sans-serif fallback)
**Label/Mono Font:** DM Mono (self-hosted, with `monospace` fallback)

The display face is compressed, physical, and all-caps for the wordmark-adjacent headings, track titles, and record names. DM Sans keeps copy and navigation direct; DM Mono gives durations and small playback metadata a measured instrument-panel quality. The source maps Anton to `font-0.ttf`, DM Mono 400/500 to `font-1.ttf`/`font-2.ttf`, and DM Sans 400/500/600 to `font-3.ttf`/`font-4.ttf`/`font-5.ttf`.

### Hierarchy
- **Display** (400, `clamp(56px, 7vw, 96px)`, `1.02`): major pale-surface section titles such as “The records.”
- **Headline** (400, `clamp(42px, 5.6vw, 76px)`, `1.03`): the active release title in the listening console; mobile settles to `44px`.
- **Title** (400, `clamp(26px, 2.6vw, 40px)`, `1.1`): release captions below the record sleeves.
- **Body** (400, `17px`, `1.65`): liner-note copy, with the main paragraph capped at `54ch`.
- **Label** (400, `12px`, DM Mono): durations and compact playback metadata.

### Named Rules

**The Display/Instrument Rule.** Keep Anton for the world-facing titles and DM Mono for time-based playback data; use DM Sans for explanatory copy and navigation.

## Layout

The first viewport is a full-height sticky scene inside a `300vh` scroll film. Scroll progress drives four states: the poster retreats after the opening beat, the original video runs through the middle of the film, and the top and bottom shutters close only at the end. The film state reaches its endpoint before closure; reduced motion holds the poster composition and omits the video source.

The dark listening section uses a centered aperture with a width of `min(82vw, 1100px)` and a height of `clamp(330px, 38vw, 520px)`; the release player is capped at `850px`. Records and liner notes use an uneven `1.15fr / .85fr` split with an `8vw` gap and a `1320px` records maximum. The second record is intentionally offset by `100px` on wide layouts.

At the compact breakpoint, the page narrows its gutters and preserves the poster, wordmark, character, and diagonal wall as an authored tall composition. At `600px` and below, the records stack into one column, liner notes become a vertical reading flow, contact becomes one column, the aperture becomes `90vw × 165px`, transport controls center beneath the title, and mini-player controls remain at least `44px` high.

## Elevation & Depth

Depth is local and material rather than card-based. Poster, character, and record sleeves use offset shadows; the cell uses textured layers, hard borders, and inset shadows to make the aperture recess read as architecture. The pale sections stay comparatively flat so their artwork and typography carry the hierarchy.

### Shadow Vocabulary
- **Poster lift** (`18px 24px 44px #0008`): separates the cobalt print from the film.
- **Character lift** (`12px 16px 9px #0008`): keeps the yellow face in front of the poster and wall.
- **Record sleeve** (`12px 18px 24px #10150e25`): gives each release a physical paper edge on the pale ground.
- **Player float** (`0 8px 30px #0005`): lifts the persistent mini-player above the page.
- **Aperture recess** (layered inset shadows): deepens the cell opening without replacing the real model with a flat illustration.

### Named Rules

**The Local-Depth Rule.** Use texture, clipping, borders, and nearby shadows to establish physical separation; do not turn the page into a collection of floating rounded cards.

## Shapes

The form language is squared and print-like. Controls, sleeves, and player surfaces have no corner radius; the aperture is a hard-edged slit with asymmetric shutter borders and a recessed interior. The only circular geometry is the small metal latch hardware. Diagonal poster, wall, and record-edge shapes supply movement without softening the world.

## Components

### Buttons
- **Primary action:** yellow fill, ink text, `56px` minimum height, `16px 22px` padding, and a `16px` internal icon gap. Hover lightens the fill and lifts the action by `2px`.
- **Playback action:** the main play control is a square `72px` button on wide layouts and `62px` on mobile; previous/next and mini-player controls are square, icon-only, and at least `44px`.
- **Text action:** liner-note links use an underline divider and a directional icon rather than a filled button.
- **Focus:** focus-visible uses a `2px` yellow outline on dark surfaces and cobalt on pale surfaces, with a `6px` offset; the waveform hitbox keeps its own visible focus treatment.

### Cards / Containers
- **Record sleeves:** transparent, borderless buttons containing square, individually composed artwork. Funkacaine uses the blue poster field, character, and flower ornament; Concreto Incarnat uses the record-aperture material and a cobalt edge. Hover raises and slightly rotates the sleeve.
- **Internal rhythm:** captions sit `26px` below the artwork on wide layouts and `20px` on mobile; release titles use Anton and durations use DM Mono.

### Inputs / Fields
- **Waveform scrubber:** the visual waveform is an interaction surface with a transparent range input over it. Pointer movement focuses a yellow dilation at the cursor; the white shock layer runs only while playback is active. The input remains the source of seeking and exposes track position to assistive technology.
- **Share fallback:** the share URL field uses the ink-green surface, a visible border, paper text, and `12px` padding when clipboard copy is unavailable.

### Navigation

The first-viewport header sits over the film with the actual wordmark at left and compact Listen, Records, About, and Contact links at right. Links keep a minimum `44px` interaction height and reveal a yellow underline on hover. The persistent mini-player appears only after playback has begun and the main player leaves view; it offers pause/resume, track identity, next-track, and return-to-player actions.

### Cell Aperture

The listening scene preserves the existing GLB, camera, pose, and horizontal pointer-follow behavior inside a textured stage. A dark slit overlay, deeper recess, asymmetric hard borders, seam, and one small metal latch control the occlusion. While the model is unavailable, the stage uses the authored `cell-still-makeover.jpg` fallback; it does not become a generic CSS character.

## Do's and Don'ts

### Do:
- **Do** preserve the cobalt poster, fractured wordmark, yellow face, original video, and 3D character as the identity materials.
- **Do** keep the `300vh` film, its endpoint-before-closure timing, and the reduced-motion static composition.
- **Do** keep actual SoundCloud playback, seeking, track switching, release links, and the persistent player as functional controls.
- **Do** keep the dark → pale → dark ground change and the authored mobile composition.

### Don't:
- **Don't** replace the existing GLB, pose, or aperture occlusion with a CSS illustration or generic hero art.
- **Don't** turn the waveform into a decorative trace that is disconnected from actual seeking.
- **Don't** invent show dates, credits, genre labels, biography facts, social profiles, or other unconfirmed artist claims.
- **Don't** move Kuala Lumpur out of the footer or add a second location claim.
- **Don't** collapse the world into rounded-card UI or a single undifferentiated background.
