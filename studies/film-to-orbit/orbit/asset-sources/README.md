# Suspended street wreckage — damaged revision

The visual reference is the user's film: modern street equipment, broken asphalt, exposed concrete and impact debris. These are imagined fragments from that street, not extracted film models.

## Sources

Kenney, City Kit Roads 2.2, CC0:
- https://kenney.nl/assets/city-kit-roads
- https://opengameart.org/content/city-kit-roads
- Download used: https://opengameart.org/sites/default/files/kenney_city-kit-roads_2.2.zip

The lamp and horizontal traffic signal adapt `light-curved` and `traffic-light-object-horizontal`. Original OBJ sources and licence remain in `kenney-city-kit-roads/`. The stored road-sign source was used in the first prototype; the current torn, creased sign is original geometry. The wheel, railing, road slabs and fragments are also original. All new surface maps are generated offline by the build script, with no external texture dependency.

## Damage and material treatment

- Crushed dark signal housing with loose wiring and subdued lenses.
- Torn blue sign with an incomplete arrow, a folded edge and exposed metal rim.
- Railing with a broken upper rail, a missing bar and buckled remaining bars.
- Deformed tyre with an open tear, tread cuts, a dented rim and a missing spoke.
- Uneven slab thickness, irregular fracture faces, exposed aggregate and rebar.
- Only the asphalt fragment carries interrupted, faded road paint.
- Small chips are flattened, irregular flakes instead of regular faceted stones.

Three shared 256x256 material maps contain four material regions: painted metal, asphalt, concrete and rubber. Colour/grime, roughness/metalness and normal detail are baked offline. Vertex colour carries each object's base colour. There are no new lights, prop shadow passes, physics, raycast targets or per-object animation. The frozen local poses and shared orbit remain unchanged.

## Current budget

- One merged hero mesh: 3,141 triangles, one material and one draw call.
- Sixteen instanced fragments: 1,280 triangles, one draw call.
- Total: **4,421 triangles and two draw calls**.
- GLB transfer: **520,484 bytes** uncompressed, including all three textures.
- Geometry and instance buffers: **338,701 bytes**.
- Estimated RGBA8 texture storage including mipmaps: **1,048,572 bytes**. This is an estimate of texture storage, not total process memory. Both meshes share the same map objects.
- The existing character remains the dominant rendering load. These figures describe the added debris layer, not a device-independent frame-rate result.

Build: `python3 scripts/build_orbital_debris.py`. No runtime mesh generation beyond creating the one shared fragment geometry. The script writes `assets/orbital-wreckage-budget.json`. `?debris-check=1` shows actual renderer counters and an on/off comparison.

Final browser counters: 59 draws / 2,019,859 triangles with the revised layer, against 57 draws / 2,015,438 triangles without it. The loaded scene has three additional texture objects, shared by the two debris meshes. Clean review image: `damaged-wreckage-preview.jpg`.
