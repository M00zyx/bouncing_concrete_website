/** Offline silhouette edit. Original mesh, topology, UVs and texture bytes retained.
 * Usage: node scripts/round-character.mjs /path/to/meshoptimizer
 * No deformation work is added to the animation loop.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {MeshoptDecoder} from '../vendor/three/examples/jsm/libs/meshopt_decoder.module.js';
const {MeshoptEncoder}=await import(pathToFileURL(path.join(process.argv[2],'meshopt_encoder.js')));
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=fs.readFileSync(path.join(root,'assets/concrete-blob-web.glb'));
const jsonSize=input.readUInt32LE(12),j=JSON.parse(input.subarray(20,20+jsonSize));
const bin=input.subarray(28+jsonSize),decoded=new Map();
function decode(i){if(decoded.has(i))return decoded.get(i);const v=j.bufferViews[i],e=v.extensions.EXT_meshopt_compression,b=new Uint8Array(v.byteLength);MeshoptDecoder.decodeGltfBuffer(b,e.count,e.byteStride,bin.subarray(e.byteOffset,e.byteOffset+e.byteLength),e.mode,e.filter);decoded.set(i,b);return b;}
const positions=new Int16Array(decode(6).buffer),normals=new Int8Array(decode(4).buffer),tangents=new Int8Array(decode(5).buffer);
const count=j.accessors[3].count,W=256,H=128,field=new Float64Array(W*H),hits=new Uint32Array(W*H);
const c=Math.cos(.506),s=Math.sin(.506);
function oriented(x,y,z){return [x,c*y-s*z,s*y+c*z];}
function unorient(x,y,z){return [x,c*y+s*z,-s*y+c*z];}
function coords(x,y,z){const r=Math.hypot(x,y,z);return [(Math.atan2(z,x)/(2*Math.PI)+.5)*W-.5,(Math.asin(Math.max(-1,Math.min(1,y/r)))/Math.PI+.5)*H-.5,r];}
for(let i=0;i<count;i++){let [x,y,z]=oriented(positions[i*4]/32767,positions[i*4+1]/32767,positions[i*4+2]/32767);let [u,v,r]=coords(x,y,z);const k=Math.max(0,Math.min(H-1,Math.round(v)))*W+((Math.round(u)%W+W)%W);field[k]=Math.max(field[k],r);hits[k]++;}
// Fill empty angular samples, then smooth only the broad silhouette field.
for(let pass=0;pass<40;pass++){let out=field.slice(),changed=false;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;if(field[k])continue;let sum=0,n=0;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const q=field[Math.max(0,Math.min(H-1,y+dy))*W+(x+dx+W)%W];if(q){sum+=q;n++;}}if(n){out[k]=sum/n;changed=true;}}field.set(out);if(!changed)break;}
for(let pass=0;pass<64;pass++){const out=new Float64Array(field.length);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;out[k]=(field[k]*4+field[y*W+(x+W-1)%W]+field[y*W+(x+1)%W]+field[Math.max(0,y-1)*W+x]+field[Math.min(H-1,y+1)*W+x])/8;}field.set(out);}
function sample(u,v){let x=Math.floor(u),y=Math.max(0,Math.min(H-1,v)),iy=Math.floor(y),fx=u-x,fy=y-iy;x=(x%W+W)%W;const nx=(x+1)%W,ny=Math.min(H-1,iy+1);return (field[iy*W+x]*(1-fx)+field[iy*W+nx]*fx)*(1-fy)+(field[ny*W+x]*(1-fx)+field[ny*W+nx]*fx)*fy;}
function deform(x,y,z){const p=oriented(x,y,z),[u,v,r]=coords(...p);const blend=a=>{const t=Math.max(0,Math.min(1,(a-.10)/.30));return t*t*t*(t*(t*6-15)+10);};const front=blend(-p[1]/r),base=blend(-y/r);const t=front+base-front*base;const coarse=sample(u,v); // Keep high-frequency chips and fracture ridges around the new broad envelope.
 const target=.945+.009*Math.sin(u/W*Math.PI*6+.8)*Math.cos(v/H*Math.PI*2);
 const radial=(r+t*(target+.3*(r-coarse)-r))/r;return unorient(p[0]*radial,p[1]*radial,p[2]*radial);}
const normalFloats=new Float32Array(count*4),tangentFloats=new Float32Array(count*4),newPositions=new Int16Array(positions.length);
let changed=0,maxMove=0;const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],eps=.0002;
for(let i=0;i<count;i++){
 const p=[positions[i*4]/32767,positions[i*4+1]/32767,positions[i*4+2]/32767],q=deform(...p),move=Math.hypot(...q.map((v,k)=>v-p[k]));if(move>1e-6)changed++;maxMove=Math.max(maxMove,move);
 for(let k=0;k<3;k++){const v=Math.round(q[k]*32767);if(v< -32767||v>32767)throw Error('Position quantization overflow');newPositions[i*4+k]=v;min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v);}
 // Transform the original shading basis by the local deformation Jacobian.
 const J=[];for(let k=0;k<3;k++){const a=p.slice(),b=p.slice();a[k]+=eps;b[k]-=eps;const da=deform(...a),db=deform(...b);J.push(da.map((v,n)=>(v-db[n])/(2*eps)));}
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const C=[cross(J[1],J[2]),cross(J[2],J[0]),cross(J[0],J[1])];
 if(J[0].reduce((sum,v,k)=>sum+v*C[0][k],0)<=0)throw Error('Inverted deformation');
 let n=[0,0,0],t=[0,0,0];for(let k=0;k<3;k++)for(let d=0;d<3;d++){n[d]+=C[k][d]*normals[i*4+k]/127;t[d]+=J[k][d]*tangents[i*4+k]/127;}
 const nl=Math.hypot(...n);n=n.map(v=>v/nl);const dot=t.reduce((a,v,k)=>a+v*n[k],0);t=t.map((v,k)=>v-dot*n[k]);const tl=Math.hypot(...t);t=t.map(v=>v/tl);
 for(let k=0;k<3;k++){normalFloats[i*4+k]=n[k];tangentFloats[i*4+k]=t[k];}tangentFloats[i*4+3]=tangents[i*4+3]/127;
}
j.accessors[3].min=min;j.accessors[3].max=max;
const replacements=new Map([[4,MeshoptEncoder.encodeFilterOct(normalFloats,count,4,8)],[5,MeshoptEncoder.encodeFilterOct(tangentFloats,count,4,8)],[6,new Uint8Array(newPositions.buffer)]]);
const chunks=[];let offset=0;
for(let i=0;i<j.bufferViews.length;i++){const v=j.bufferViews[i],e=v.extensions?.EXT_meshopt_compression;let data;if(e){data=replacements.has(i)?MeshoptEncoder.encodeGltfBuffer(replacements.get(i),e.count,e.byteStride,e.mode):bin.subarray(e.byteOffset,e.byteOffset+e.byteLength);e.byteOffset=offset;e.byteLength=data.length;}else{data=bin.subarray(v.byteOffset,v.byteOffset+v.byteLength);v.byteOffset=offset;v.byteLength=data.length;}chunks.push(data);offset+=data.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}}
j.buffers[0].byteLength=offset;j.asset.extras={...j.asset.extras,referenceFrame:{center:j.nodes[0].translation,height:2*j.nodes[0].scale[1]},silhouette:'Lower hemisphere rounded offline; original UVs and texture images retained.'};
let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks);const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);
const output=Buffer.concat([header,json,bh,binary]);fs.writeFileSync(path.join(root,'assets/concrete-blob-rounded.glb'),output);
const stats={vertices:count,triangles:j.accessors[0].count/3,changedVertices:changed,maxDisplacementNormalized:maxMove,originalBytes:input.length,revisedBytes:output.length,extraDrawCalls:0,extraRuntimeDeformation:false,texturesUnchanged:true,uvsUnchanged:true};fs.writeFileSync(path.join(root,'assets/concrete-blob-rounded-budget.json'),JSON.stringify(stats,null,2)+'\n');console.log(stats);
