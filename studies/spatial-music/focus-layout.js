import * as THREE from 'three';
import {solveSpacing,overlap,approachOffset} from './spacing.js?v=soft-1';

export function createFocusLayout(camera,constellation,groups) {
  const weights=new Map(),offsets=new Map();
  const point=new THREE.Vector3(),world=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3();
  const inverse=new THREE.Quaternion(),face=new THREE.Quaternion(),localFace=new THREE.Quaternion();
  const reverse=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);
  const ray=new THREE.Raycaster();
  let report={blocked:0,frontDepth:null};
  function footprint(group) {
    if(group.userData.footprint)return group.userData.footprint;
    const points=[];
    for(const mesh of group.children)if(mesh.geometry) {
      mesh.updateMatrix();const p=mesh.geometry.attributes.position;
      const step=p.count>100?4:1;
      for(let i=0;i<p.count;i+=step)points.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrix));
    }
    return group.userData.footprint=points;
  }
  function bounds(group) {
    group.updateWorldMatrix(true,false);
    const b={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(const p of footprint(group)) {
      point.copy(p).applyMatrix4(group.matrixWorld).project(camera);
      const x=(point.x+1)*innerWidth/2,y=(1-point.y)*innerHeight/2;
      b.left=Math.min(b.left,x);b.right=Math.max(b.right,x);b.top=Math.min(b.top,y);b.bottom=Math.max(b.bottom,y);
    }
    return b;
  }
  function shift(group,x,y) {
    group.getWorldPosition(point);point.applyMatrix4(camera.matrixWorldInverse);
    const units=2*Math.max(.1,-point.z)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/innerHeight;
    world.copy(right).multiplyScalar(x*units).addScaledVector(up,-y*units).applyQuaternion(inverse);
    group.position.add(world);group.updateMatrixWorld(true);
  }
  function fit(group,limit) {
    for(let pass=0;pass<3;pass++) {
      const b=bounds(group);
      const factor=Math.min(1,(limit.right-limit.left)/(b.right-b.left),(limit.bottom-limit.top)/(b.bottom-b.top));
      if(factor<.999){group.scale.multiplyScalar(factor*.98);group.updateMatrixWorld(true);continue;}
      const x=b.left<limit.left?limit.left-b.left:b.right>limit.right?limit.right-b.right:0;
      const y=b.top<limit.top?limit.top-b.top:b.bottom>limit.bottom?limit.bottom-b.bottom:0;
      if(Math.abs(x)+Math.abs(y)<.5)break;
      shift(group,x,y);
    }
  }
  function foreground(group,enabled) {
    group.userData.foreground=enabled;
    group.renderOrder=enabled?100:0;
    for(const mesh of group.children)if(mesh.material) {
      mesh.renderOrder=enabled?100:0;
      for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]) {
        const original=material.userData.focusRenderState??={transparent:material.transparent,depthTest:material.depthTest,depthWrite:material.depthWrite};
        material.transparent=enabled?true:original.transparent;
        material.depthTest=enabled?false:original.depthTest;
        material.depthWrite=enabled?false:original.depthWrite;
      }
    }
  }
  function apply(delta,explore,cursor,enabled) {
    const strength=enabled?explore.strength:0;
    const focused=enabled?explore.target:null;
    const pinned=groups.findIndex(g=>g.userData.track===focused);
    right.set(1,0,0).applyQuaternion(camera.quaternion);up.set(0,1,0).applyQuaternion(camera.quaternion);
    inverse.copy(constellation.quaternion).invert();
    const limit={left:24,right:innerWidth-24,top:88,bottom:innerHeight-76};
    
    for(const group of groups) {
      const active=group.userData.track===focused;
      const weight=THREE.MathUtils.damp(weights.get(group)||0,active?strength:0,active?26:8,delta);
      weights.set(group,weight);
      foreground(group,active&&weight>.7);

      if(weight>.002 && group.userData.focusAnchor) {
        const anchor=group.userData.focusAnchor;
        const sx=active?(explore.docked?explore.dockX:cursor.clientX):group.userData.focusX;
        const sy=active?(explore.docked?explore.dockY:cursor.clientY):group.userData.focusY;
        group.userData.focusX=sx;group.userData.focusY=sy;
        const flipped=group.userData.focusFlipped;
        face.copy(camera.quaternion);if(flipped)face.multiply(reverse);
        localFace.copy(inverse).multiply(face);
        const depth=Math.max(4.4,Math.min(5.8,camera.position.length()*.62));
        ray.setFromCamera(new THREE.Vector2(sx/innerWidth*2-1,1-sy/innerHeight*2),camera);
        const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
        const destination=ray.ray.at(depth/ray.ray.direction.dot(forward),new THREE.Vector3());
        const basePosition=group.position.clone(),baseRotation=group.quaternion.clone();
        // Fit around the approached point, instead of shoving its sleeve away.
        for(let pass=0;pass<5;pass++) {
          point.copy(anchor).multiplyScalar(group.scale.x).applyQuaternion(face);
          world.copy(destination).sub(point);constellation.worldToLocal(world);
          group.position.copy(basePosition).lerp(world,weight);
          group.quaternion.copy(baseRotation).slerp(localFace,weight);
          group.updateMatrixWorld(true);
          const b=bounds(group);
          const factor=Math.min(1,
            b.left<sx?(sx-limit.left)/Math.max(1,sx-b.left):1,
            b.right>sx?(limit.right-sx)/Math.max(1,b.right-sx):1,
            b.top<sy?(sy-limit.top)/Math.max(1,sy-b.top):1,
            b.bottom>sy?(limit.bottom-sy)/Math.max(1,b.bottom-sy):1);
          if(factor>.995)break;
          group.scale.multiplyScalar(Math.max(.45,factor*.98));
        }
        if(weight>.65){group.userData.textTexture.repeat.x=flipped?-1:1;group.userData.textTexture.offset.x=flipped?1:0;}
        fit(group,limit);
      }
    }
    if(strength<.002) {offsets.clear();report={blocked:0,frontDepth:null};return;}
    const rects=groups.map(bounds);
    const solution=solveSpacing(rects,pinned,limit);
    for(let i=0;i<groups.length;i++) {
      const group=groups[i],old=offsets.get(group)||{x:0,y:0};
      const goal={x:solution[i].x*strength,y:solution[i].y*strength};
      const offset=approachOffset(old,goal,delta);
      offsets.set(group,offset);
      // Focus has its own cursor anchor; all other tracks only receive a
      // bounded nudge. Never run another collision pass on these shifted poses.
      if(i!==pinned)shift(group,offset.x,offset.y);
    }
    report.maxSpacing=Math.max(0,...[...offsets.values()].map(o=>Math.hypot(o.x,o.y)));
    report.blocked=pinned<0?0:groups.filter((g,i)=>i!==pinned&&overlap(bounds(groups[pinned]),bounds(g),4)).length;
    const finalBounds=groups.map(bounds);
    report.clipped=finalBounds.filter(b=>b.left<limit.left-2||b.right>limit.right+2||b.top<limit.top-2||b.bottom>limit.bottom+2).length;
    report.overlaps=0;
    for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(overlap(finalBounds[i],finalBounds[j],2))report.overlaps++;
    report.frontDepth=null;
    if(pinned>=0){groups[pinned].getWorldPosition(point);point.applyMatrix4(camera.matrixWorldInverse);report.frontDepth=Number((-point.z).toFixed(2));}
  }
  return {apply,bounds,inspect:()=>report,reset(){weights.clear();offsets.clear();}};
}
