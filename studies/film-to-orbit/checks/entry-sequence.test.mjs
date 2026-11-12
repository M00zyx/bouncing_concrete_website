import assert from 'node:assert/strict';
import * as THREE from '../orbit/vendor/three/build/three.module.js';
import {trackEntry,entryLongitude} from '../orbit/entry-sequence.js';
import {sphericalPose} from '../orbit/sphere-spacing.js';
const phases=[-.2,1.05,2.2,3.35,4,5.3];
for(let i=0;i<6;i++){
 assert.equal(trackEntry(.64,i),0);
 assert.equal(trackEntry(1,i),1);
 const group={userData:{track:{lane:1.7},index:i,shellRadius:4.05,phase:phases[i]}};
 let previous=0;
 for(let step=0;step<=100;step++){
  const t=step/100,p=trackEntry(t,i);assert(p>=previous);previous=p;
  const position=new THREE.Vector3(),rotation=new THREE.Quaternion();
  sphericalPose(group,entryLongitude(phases[i],p),0,1,position,rotation);
  assert(Math.abs(position.length()-4.05)<1e-12,'Entrance must stay on spherical shell');
 }
 assert.equal(Math.abs(entryLongitude(phases[i],1)),0,'No residual entrance offset during exploration');
}
assert(trackEntry(.70,0)>0&&trackEntry(.70,2)===0,'Featured release appears before samples');
console.log('PASS: staggered tracks, spherical attachment, exact restored phases.');
