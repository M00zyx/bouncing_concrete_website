# Performance review — 13 November 2026

Checkpoint before review: `checkpoints/approved-keyboard-20261113-112011.zip` (source; assets/vendor remain shared).

## Measurements
Local Codex in-app browser, viewport 890×982, renderer pixel ratio 1.8. Opt-in `?performance-check=1#music` exposes a rolling 600-frame diagnostic after warm-up. Measurements are observations on this machine, not mobile or production-network guarantees. CPU submission timing includes scene updates and renderer submission; it does not measure GPU completion.

| Measure | Observed |
| --- | --- |
| Idle frame interval, median / p95 | 8.3 / 9.1–9.3 ms |
| Idle CPU update + submission, median | 0.5 ms |
| Original character-area hit tests, median / p95 | 97.8 / 105.2 ms |
| Original interaction frame interval p95 | 102.8 ms |
| Accelerated sampled hit tests, median / p95 | 5.6 / 6.7 ms |
| Accelerated frame interval p95 | 8.9–9.2 ms |
| Draw calls (unchanged) | 65 |
| Submitted triangles incl. shadow pass (unchanged) | 2,035,303 |
| Geometries / textures (unchanged) | 18 / 33 |
| Unique render-geometry CPU buffers | 26,247,001 bytes |
| Extra retained acceleration typed buffers | 15,999,936 bytes |
| One-time acceleration construction | 122.7 ms |

Interaction samples were collected manually against a moving scene, not identical deterministic cursor trajectories. The large improvement is clear, but the exact speed-up is not a controlled benchmark. No total process-memory or GPU-memory claim is made.

## Change
The character's 999,996 triangles were being scanned by ordinary Three.js raycasting during hover checks. Added an exact spatial index in `orbit/raycast-grid.js`: 279 occupied buckets from an 8×8×8 grid. Each triangle is assigned once by centroid; each bucket's bounds contain its complete triangles. Rays reject irrelevant buckets before using the original Three.js triangle-intersection implementation. Vertex attributes are shared; rendered geometry/index buffers are unchanged. Original object identity, face IDs, hit positions and UVs are retained.

No geometry reduction, texture replacement, shadow/resolution reduction, throttling of idle/selection, or timing changes. Lookup proxies never enter the render scene and add no GPU draw calls. Normal mode performs no diagnostic sampling or diagnostic DOM updates. Diagnostics require the explicit query flag.

## Loading and remaining costs
- Actual rounded character GLB: 7,822,980 bytes; already uses Meshopt, quantization and embedded WebP textures.
- Film: 5,693,954 bytes; preview server supports byte ranges.
- Opening image: 3,202,679 bytes (PNG).
- Funkacaine MP3: 6,071,946 bytes, selected on demand.
- The larger original character GLB is present on disk but is not the active loader target.
- Character remains the dominant GPU cost because both its visible surface and dynamic shadow use the full geometry. Deliberate preservation of approved appearance.
- Off-orbit suspension verified at the film opening: parent reports `data-rendering=false`; frame count remains unchanged across observations.
- Physical phone GPU/memory behaviour, slow-network startup and browser background-tab energy use need separate device testing. Responsive viewport size alone cannot establish these.

## Validation
120 deterministic rays compare accelerated and original hit counts, distances, UVs, face IDs and object identity under translated/rotated/nonuniformly scaled geometry, bounded near/far and misses. Original render indices remain byte-identical. Twelve-track, group-steering, sphere-spacing and playback checks pass. Live selection still opens the shared player; returning to orbit and film works.
