// Opt-in diagnostics only; no sampling or DOM work in the normal experience.
export function createPerformanceReview(renderer,scene){
 if(!new URLSearchParams(location.search).has('performance-check'))return null;
 const output=document.createElement('output');output.id='performance-review';output.style.cssText='position:fixed;z-index:100;bottom:0;left:0;max-width:100%;background:#fff;color:#111;font:10px monospace;padding:4px;pointer-events:none';document.body.append(output);
 const intervals=[],cpu=[];let frames=0;const picks=[];
 const summary=values=>{const a=[...values].sort((a,b)=>a-b);return {median:+a[Math.floor(a.length*.5)].toFixed(2),p95:+a[Math.min(a.length-1,Math.floor(a.length*.95))].toFixed(2)};};
 return {pick(ms){picks.push(ms);if(picks.length>120)picks.shift();},record(start,elapsed){frames++;if(frames<60)return;intervals.push(elapsed*1000);cpu.push(performance.now()-start);if(intervals.length>600){intervals.shift();cpu.shift();}if(frames%120)return;
 const acceleration=[];scene.traverse(o=>{if(o.userData.raycastGrid)acceleration.push(o.userData.raycastGrid);});const buffers=new Set();scene.traverse(o=>{if(!o.geometry)return;for(const a of Object.values(o.geometry.attributes))buffers.add(a.array.buffer);if(o.geometry.index)buffers.add(o.geometry.index.array.buffer);});
 output.textContent=JSON.stringify({acceleration,frames,samples:cpu.length,pickMs:picks.length?summary(picks):null,frameMs:summary(intervals),cpuSubmitMs:summary(cpu),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,geometryBytes:[...buffers].reduce((n,b)=>n+b.byteLength,0),pixelRatio:renderer.getPixelRatio(),viewport:[innerWidth,innerHeight]});
 }};
}
