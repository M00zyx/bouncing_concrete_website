import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {createGroupSteering,aimSphereGroup,readableSpherePoint} from '../group-steering.js';
const steering=createGroupSteering(),rotation=new THREE.Quaternion();
const points=[new THREE.Vector3(3,1,2),new THREE.Vector3(-1,-2,3),new THREE.Vector3(0,3,-2)];
for(const dt of [1/60,1/30,.05]) {
  rotation.identity();steering.reset();
  for(const axis of [new THREE.Vector3(0,1,0),new THREE.Vector3(1,-1,.3).normalize()]) {
    const goal=new THREE.Quaternion().setFromAxisAngle(axis,2.1);
    let previousSpeed=steering.speed();
    for(let i=0;i<Math.ceil(4/dt);i++) {
      const before=rotation.clone();steering.update(rotation,goal,dt);
      assert(steering.speed()<=2.8+1e-8,'Group rotation has a speed limit');
      assert(Math.abs(steering.speed()-previousSpeed)<=10*dt+.001,'Acceleration remains bounded');
      assert(before.angleTo(rotation)<=2.8*dt+1e-7,'No angular jump between frames');
      previousSpeed=steering.speed();
      const turned=points.map(p=>p.clone().applyQuaternion(rotation));
      for(let j=0;j<points.length;j++) {
        assert(Math.abs(turned[j].length()-points[j].length())<1e-10,'Radius stays fixed');
        assert(Math.abs(turned[j].distanceTo(turned[(j+1)%3])-points[j].distanceTo(points[(j+1)%3]))<1e-10,'Group spacing stays rigid');
      }
    }
    assert(rotation.angleTo(goal)<.001,'Smoothly settles on its target');
  }
}
console.log('PASS: bounded speed/acceleration, rigid radii and spacing, stable settling at 20/30/60 FPS timesteps.');

for(const local of points)for(const destination of points) {
  const q=aimSphereGroup(local,destination,new THREE.Quaternion());
  assert(local.clone().normalize().applyQuaternion(q).distanceTo(destination.clone().normalize())<1e-8,'Approached point reaches the target direction');
  const a=local.clone().normalize(),b=destination.clone().normalize(),north=new THREE.Vector3(0,1,0);
  const carriedNorth=north.clone().addScaledVector(a,-north.dot(a)).normalize().applyQuaternion(q);
  const targetNorth=north.clone().addScaledVector(b,-north.dot(b)).normalize();
  assert(carriedNorth.distanceTo(targetNorth)<1e-8,'Target changes cannot accumulate roll');
}
console.log('PASS: target alignment and upright spherical north across all fixture pairs.');

for(const camera of [new THREE.Vector3(0,.25,9),new THREE.Vector3(4,1,8)]) {
  const front=camera.clone().normalize();
  for(const point of [new THREE.Vector3(0,4,0),new THREE.Vector3(0,-4,0),new THREE.Vector3(4,1,-2),front.clone().multiplyScalar(4)]) {
    const target=readableSpherePoint(point,camera,4,new THREE.Vector3());
    assert(Math.abs(target.length()-4)<1e-8,'Readable destination stays on the sphere');
    assert(target.clone().normalize().dot(front)>.85,'Upper and lower destinations face the camera');
    assert(target.clone().normalize().dot(camera.clone().sub(target).normalize())>.6,'Perspective incidence stays readable');
    const same=point.clone();readableSpherePoint(same,camera,4,same);
    assert(same.distanceTo(target)<1e-8,'In-place projection agrees with separate output');
  }
}
console.log('PASS: upper/lower/rim targets retain radius and camera-facing perspective.');
