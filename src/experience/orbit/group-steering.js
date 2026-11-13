import * as THREE from './vendor/three/build/three.module.js';

// One damped angular velocity for the whole constellation. No child transforms.
export function createGroupSteering() {
  const velocity=new THREE.Vector3(),error=new THREE.Vector3(),acceleration=new THREE.Vector3();
  const relative=new THREE.Quaternion(),step=new THREE.Quaternion();
  const axis=new THREE.Vector3();
  return {
    reset(){velocity.set(0,0,0);},
    speed(){return velocity.length();},
    update(rotation,goal,delta) {
      if(delta<=0)return;
      // Small substeps keep the spring consistent through slower rendered frames.
      const count=Math.ceil(delta/(1/120)),dt=delta/count;
      for(let i=0;i<count;i++) {
        relative.copy(goal).multiply(rotation.clone().invert()).normalize();
        if(relative.w<0)relative.set(-relative.x,-relative.y,-relative.z,-relative.w);
        const sine=Math.hypot(relative.x,relative.y,relative.z);
        const angle=2*Math.atan2(sine,Math.max(0,relative.w));
        error.set(relative.x,relative.y,relative.z).multiplyScalar(sine>1e-8?angle/sine:0);
        acceleration.copy(error).multiplyScalar(64).addScaledVector(velocity,-16).clampLength(0,10);
        velocity.addScaledVector(acceleration,dt).clampLength(0,2.8);
        const speed=velocity.length();
        if(angle<.0001&&speed<.001){rotation.copy(goal);velocity.set(0,0,0);break;}
        if(speed>1e-8){axis.copy(velocity).divideScalar(speed);step.setFromAxisAngle(axis,speed*dt);rotation.premultiply(step).normalize();}
      }
    }
  };
}

// Map the approached point to the front of the sphere without accumulating
// roll between targets. The sphere's north stays upright at the selected point.
export function aimSphereGroup(localAnchor,worldTarget,result) {
  const origin=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const from=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(localAnchor,origin,up));
  const to=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(worldTarget,origin,up));
  return result.copy(to).multiply(from.invert()).normalize();
}

// Use the cursor ray itself: shifting an intersection toward a front-facing cap
// produces a visible offset. Outside the silhouette, only the rim is reachable
// by rotation; keep that fallback on the same shell rather than detaching labels.
export function cursorSpherePoint(ray,sphere,result) {
  if(ray.intersectSphere(sphere,result))return true;
  ray.closestPointToPoint(sphere.center,result);
  result.sub(sphere.center).normalize().multiplyScalar(sphere.radius).add(sphere.center);
  return false;
}
