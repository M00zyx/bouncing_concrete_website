import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import * as THREE from '../orbit/vendor/three/build/three.module.js';
import {trackEntry,ease} from '../orbit/entry-sequence.js';
const source=readFileSync(new URL('../orbit/scene.js',import.meta.url),'utf8');
const tracks=runInNewContext(source.slice(source.indexOf('const tracks = ['),source.indexOf('const host ='))+'tracks;');
assert.equal(tracks.length,12);assert.equal(tracks.filter(t=>t.slug).length,2,'Ten samples must not become fictitious releases');
const original=[[-.2,.19,1.7],[1.05,.17,-1.75],[2.2,.21,2.85],[3.35,.18,.55],[4,.16,-2.9],[5.3,.2,-.6]];
for(let i=0;i<6;i++){
 assert.deepEqual([tracks[i].phase,tracks[i].speed,tracks[i].lane],original[i],'Original idle parameters are unchanged');
 const partner=tracks[i+6];assert.equal(partner.speed,tracks[i].speed);assert.equal(partner.lane,tracks[i].lane);
 const separation=partner.phase-tracks[i].phase;assert(Math.abs(separation-Math.PI)<=.4500001,'Partners remain across the sphere');
 for(const seconds of [0,30,120,600])assert(Math.abs((partner.phase+seconds*partner.speed)-(tracks[i].phase+seconds*tracks[i].speed)-separation)<1e-12,'Idle partners never catch each other');
 for(let n=0;n<=100;n++)assert.equal(trackEntry(n/100,i,6),ease(.64+i*.035,.90+i*.018,n/100),'Six-track entrance remains unchanged');
}
for(let i=0;i<12;i++){
 assert.equal(trackEntry(.64,i,12),0);assert.equal(trackEntry(.99,i,12),1,'Every track must be fully present before interaction');
 let previous=0;for(let n=0;n<=100;n++){const p=trackEntry(n/100,i,12);assert(p>=previous&&p<=1);previous=p;}
}
const originalBox=new THREE.BoxGeometry(1.08,1.08,.045);
const optimized=runInNewContext(source.slice(source.indexOf('const sleeveGeometry='),source.indexOf('function makeText('))+'sleeveGeometry;',{THREE});
assert.deepEqual(optimized.index.array,originalBox.index.array);for(const key of ['position','normal','uv'])assert.deepEqual(optimized.attributes[key].array,originalBox.attributes[key].array,'Sleeve appearance/picking geometry unchanged');
assert.deepEqual(optimized.groups,[{start:0,count:24,materialIndex:0},{start:24,count:12,materialIndex:1}]);
console.log('PASS: 12 tracks / 10 samples, unchanged original idle, opposite partners, full entrance and identical sleeve geometry with two material groups.');
