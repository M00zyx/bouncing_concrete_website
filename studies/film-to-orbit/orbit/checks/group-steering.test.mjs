import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {createGroupSteering,aimSphereGroup,cursorSpherePoint} from '../group-steering.js';
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

// Project real spherical destinations through both preview aspect ratios.
// Test both axes, including targets outside the old front-facing cap.
for(const [width,height,fov] of [[1280,720,78],[890,982,96]]) {
  const camera=new THREE.PerspectiveCamera(fov,width/height,.1,100);
  camera.position.set(.2,.25,9);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const sphere=new THREE.Sphere(new THREE.Vector3(),4.05),raycaster=new THREE.Raycaster();
  for(const xy of [[0,0],[.18,.22],[-.18,-.22],[.05,.35],[-.05,-.35]]) {
    const cursor=new THREE.Vector2(...xy),target=new THREE.Vector3();
    raycaster.setFromCamera(cursor,camera);
    assert(cursorSpherePoint(raycaster.ray,sphere,target),'Fixture cursor reaches the shell');
    for(const local of points) {
      const source=local.clone().normalize().multiplyScalar(sphere.radius);
      const q=aimSphereGroup(source,target,new THREE.Quaternion());
      const projected=source.clone().applyQuaternion(q).project(camera);
      assert(Math.abs(projected.x-cursor.x)*width/2<1e-6,'Title centre aligns horizontally');
      assert(Math.abs(projected.y-cursor.y)*height/2<1e-6,'Title centre aligns vertically');
    }
  }
  raycaster.setFromCamera(new THREE.Vector2(.99,.99),camera);
  const rim=new THREE.Vector3();assert.equal(cursorSpherePoint(raycaster.ray,sphere,rim),false);
  assert(Math.abs(rim.length()-sphere.radius)<1e-8,'Unreachable cursor never detaches a label');
}
console.log('PASS: exact horizontal/vertical cursor projection, upper/lower targets and attached outside-rim fallback.');
