import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {accelerateRaycast} from '../raycast-grid.js';
const geometry=new THREE.SphereGeometry(2,96,64),material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
const reference=new THREE.Mesh(geometry,material),accelerated=new THREE.Mesh(geometry,material);
for(const m of [reference,accelerated]){m.position.set(.4,-.3,.2);m.rotation.set(.4,.7,.1);m.scale.set(1.1,.9,1.2);m.updateMatrixWorld();}
const saved=geometry.index.array.slice();const stats=accelerateRaycast(accelerated,THREE);assert(stats.buckets>0);assert.deepEqual(geometry.index.array,saved);
for(let i=0;i<120;i++){
 const origin=new THREE.Vector3(Math.sin(i*2.4)*6,Math.cos(i*.9)*5,6);
 const target=new THREE.Vector3(Math.sin(i*.37)*3,Math.cos(i*.43)*3,0);
 const ray=new THREE.Raycaster(origin,target.sub(origin).normalize(),i%3===0?2:0,i%4===0?7:Infinity);
 const a=ray.intersectObject(reference),b=ray.intersectObject(accelerated);
 assert.equal(a.length,b.length);
 for(let j=0;j<a.length;j++){assert(Math.abs(a[j].distance-b[j].distance)<1e-9);assert.equal(a[j].faceIndex,b[j].faceIndex);assert(a[j].uv.distanceTo(b[j].uv)<1e-9);assert.equal(b[j].object,accelerated);}
}
console.log('PASS: exact ray hits, distances, UVs, original face IDs and object identity across 120 rays; render indices unchanged.');
