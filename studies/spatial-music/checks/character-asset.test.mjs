import fs from 'node:fs';import assert from 'node:assert/strict';import {MeshoptDecoder} from '../vendor/three/examples/jsm/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;
function read(name){const b=fs.readFileSync(new URL('../assets/'+name,import.meta.url)),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n);return {j,b,view(i){const v=j.bufferViews[i],e=v.extensions?.EXT_meshopt_compression;if(!e)return bin.subarray(v.byteOffset,v.byteOffset+v.byteLength);const out=new Uint8Array(v.byteLength);MeshoptDecoder.decodeGltfBuffer(out,e.count,e.byteStride,bin.subarray(e.byteOffset,e.byteOffset+e.byteLength),e.mode,e.filter);return out;}};}
const a=read('concrete-blob-web.glb'),b=read('concrete-blob-rounded.glb');
for(const i of [0,1,2,3,7])assert.deepEqual(b.view(i),a.view(i),'Texture, topology or UV bytes changed');
assert.equal(a.j.accessors[3].count,b.j.accessors[3].count);assert(b.b.length<=a.b.length);
const p=new Int16Array(a.view(6).buffer),q=new Int16Array(b.view(6).buffer),n=new Int8Array(b.view(4).buffer),t=new Int8Array(b.view(5).buffer);let untouched=0,edited=0;
for(let i=0;i<p.length;i+=4){if(p[i+1]>=.55*32767){assert.deepEqual(q.slice(i,i+3),p.slice(i,i+3));untouched++;}if(q.slice(i,i+3).some((v,k)=>v!==p[i+k]))edited++;const nl=Math.hypot(...n.slice(i,i+3))/127,tl=Math.hypot(...t.slice(i,i+3))/127;assert(Math.abs(nl-1)<.02&&Math.abs(tl-1)<.02);assert(Math.abs(t[i+3])===127);}
assert(edited>0);assert(untouched>0);console.log(`PASS: ${untouched} upper vertices unchanged; ${edited} reshaped vertices; texture/topology/UV bytes identical; normals and tangents valid; ${a.b.length-b.b.length} bytes smaller.`);
