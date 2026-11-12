import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {createSphereSpacing,sphericalPose,SPACING_LIMITS} from '../sphere-spacing.js';
const camera=new THREE.PerspectiveCamera(78,1.4,.1,100);camera.position.set(0,0,9);camera.updateMatrixWorld();
const groups=[0,1,2].map(i=>{
 const g=new THREE.Group();g.userData={index:i,shellRadius:4.2,phase:i===2?2.5:0,track:{title:String(i),lane:i===1?.02:0}};
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.85),new THREE.MeshBasicMaterial());g.add(mesh);g.updateMatrixWorld(true);return g;
});
const spacing=createSphereSpacing(groups),options={camera,parentRotation:new THREE.Quaternion(),scale:1,width:1120,height:800,owner:groups[0].userData.track,protectedTracks:[],paused:false,settled:true};
const before=spacing.measure(options),p=new THREE.Vector3(),q=new THREE.Quaternion();
let previous=spacing.state().offsets;
for(let i=0;i<360;i++) {
 spacing.update(1/60,options);const state=spacing.state();
 assert.equal(state.offsets[0].x,0,'Focused title stays pinned');assert.equal(state.offsets[0].y,0);
 state.offsets.forEach((o,j)=>{
  assert(Math.abs(o.x)<=SPACING_LIMITS.longitude+1e-9&&Math.abs(o.y)<=SPACING_LIMITS.latitude+1e-9,'Offset bound');
  assert(Math.hypot(o.x-previous[j].x,o.y-previous[j].y)<=SPACING_LIMITS.speed/60+1e-9,'No sudden jump');
  sphericalPose(groups[j],o.x,o.y,1,p,q);assert(Math.abs(p.length()-4.2)<1e-10,'Exact sphere radius');
  assert(new THREE.Vector3(0,0,1).applyQuaternion(q).distanceTo(p.clone().normalize())<1e-10,'Patch remains concentric');
 });previous=state.offsets;
}
const settledGoals=spacing.state().offsets.map(o=>[o.goalX,o.goalY]);
for(let i=0;i<120;i++)spacing.update(1/60,options);
assert.deepEqual(spacing.state().offsets.map(o=>[o.goalX,o.goalY]),settledGoals,'Static layout does not keep switching directions');
const after=spacing.measure(options);assert(after<before*.55,'Substantial crowding reduction');
const pinned=spacing.state().offsets[1];options.protectedTracks=[groups[1].userData.track];
for(let i=0;i<60;i++)spacing.update(1/60,options);
assert.equal(spacing.state().offsets[1].x,pinned.x);assert.equal(spacing.state().offsets[1].y,pinned.y,'Next clickable label stops moving');
options.owner=null;options.protectedTracks=[];
for(let i=0;i<360;i++)spacing.update(1/60,options);
assert(spacing.state().offsets.every(o=>Math.hypot(o.x,o.y)<.0001),'Smooth return to natural idle orbits');
assert(groups.every(g=>g.children[0].material.opacity===1),'All labels remain visible');
console.log('PASS: overlap '+before.toFixed(3)+' -> '+after.toFixed(3)+', pinned owner/next choice, hard bounds, rate limits, concentric geometry and idle return.');
