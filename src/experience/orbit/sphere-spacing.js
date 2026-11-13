import * as THREE from './vendor/three/build/three.module.js';

export const SPACING_LIMITS={longitude:.14,latitude:.26,speed:.20};
const poseEuler=new THREE.Euler(0,0,0,'YXZ');
export function sphericalPose(group,x,y,scale,position,quaternion) {
  const {track,index,shellRadius,phase}=group.userData;
  const latitude=THREE.MathUtils.clamp((track.lane+Math.sin(phase+index*.7)*.18)/shellRadius+y,-.9,.9);
  const longitude=phase+x,r=shellRadius*scale;
  position.set(Math.sin(longitude)*Math.cos(latitude)*r,Math.sin(latitude)*r,Math.cos(longitude)*Math.cos(latitude)*r);
  quaternion.setFromEuler(poseEuler.set(-latitude,longitude,0));
}

// Bounded coordinate search against natural spherical poses, not collision
// forces. The current owner and the user's next choice are immovable anchors.
export function createSphereSpacing(groups) {
  const v=new THREE.Vector3(),position=new THREE.Vector3(),rotation=new THREE.Quaternion();
  const scaleVector=new THREE.Vector3(),matrix=new THREE.Matrix4(),partMatrix=new THREE.Matrix4();
  const entries=groups.map(group=>{
    const offset={x:0,y:0,goalX:0,goalY:0};group.userData.spacing=offset;
    const parts=group.children.filter(m=>m.isMesh&&(!m.userData.solid||m.geometry.type==='BoxGeometry')).map(mesh=>{
      mesh.updateMatrix();const samples=[];
      if(mesh.userData.canvas) {
        const {widthSegments:w,heightSegments:h}=mesh.geometry.parameters;
        for(let c=0;c<w;c+=8){const strip=[];for(const row of [0,h])for(const col of [c,Math.min(c+8,w)])strip.push(new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,row*(w+1)+col));samples.push(strip);}
      } else {
        mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox,box=[];
        for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])box.push(new THREE.Vector3(x,y,z));samples.push(box);
      }
      return {mesh,samples};
    });
    return {group,offset,parts};
  });
  let elapsed=1,solves=0,lastMs=0,baseline=0,planned=0;
  function project(entry,x,y,options) {
    const {camera,parentRotation,scale,width,height}=options;
    sphericalPose(entry.group,x,y,scale,position,rotation);
    const front=position.clone().applyQuaternion(parentRotation).dot(camera.position)>0;
    matrix.compose(position,rotation,scaleVector.setScalar(scale));
    const rects=[];let area=0;
    for(const part of entry.parts) {
      partMatrix.multiplyMatrices(matrix,part.mesh.matrix);
      for(const samples of part.samples) {
        const b={l:Infinity,r:-Infinity,t:Infinity,b:-Infinity};
        for(const p of samples) {
          v.copy(p).applyMatrix4(partMatrix).applyQuaternion(parentRotation).project(camera);
          if(v.z<=0||v.z>=1)continue;
          const px=(v.x+1)*width/2,py=(1-v.y)*height/2;
          b.l=Math.min(b.l,px);b.r=Math.max(b.r,px);b.t=Math.min(b.t,py);b.b=Math.max(b.b,py);
        }
        if(Number.isFinite(b.l)){area+=(b.r-b.l)*(b.b-b.t);rects.push(b);}
      }
    }
    return {rects,area,front};
  }
  function overlap(a,b) {
    if(!a.front||!b.front)return 0;
    let area=0;
    for(const r of a.rects)for(const s of b.rects)area+=Math.max(0,Math.min(r.r,s.r)-Math.max(r.l,s.l)+6)*Math.max(0,Math.min(r.b,s.b)-Math.max(r.t,s.t)+6);
    return area/Math.max(1,Math.min(a.area,b.area));
  }
  function total(shapes){let n=0;for(let i=0;i<shapes.length;i++)for(let j=i+1;j<shapes.length;j++)n+=overlap(shapes[i],shapes[j]);return n;}
  function score(shape,index,shapes,x,y,options) {
    let n=.055*(x/.14)**2+.075*(y/.26)**2;
    for(let j=0;j<shapes.length;j++)if(j!==index)n+=overlap(shape,shapes[j]);
    if(shape.front)for(const r of shape.rects) {
      // Do not solve a collision by parking a title off-screen.
      const outside=Math.max(0,20-r.l)+Math.max(0,r.r-options.width+20)+Math.max(0,75-r.t)+Math.max(0,r.b-options.height+65);
      n+=outside*.012;
    }
    return n;
  }
  return {
    reset(){for(const {offset} of entries)offset.x=offset.y=offset.goalX=offset.goalY=0;elapsed=1;},
    update(delta,options) {
      if(!delta||options.paused)return;
      const pinned=entries.map(e=>e.group.userData.track===options.owner||options.protectedTracks.includes(e.group.userData.track));
      for(let i=0;i<entries.length;i++)if(pinned[i]){const o=entries[i].offset;o.goalX=o.x;o.goalY=o.y;}
      // During a turn or a possible handoff, all labels hold still locally.
      if(options.owner&&!options.settled)return;
      elapsed+=delta;
      if(!options.owner) {
        for(let i=0;i<entries.length;i++)if(!pinned[i])entries[i].offset.goalX=entries[i].offset.goalY=0;
        elapsed=1;
      } else if(elapsed>=.3) {
        elapsed=0;const start=performance.now();
        const shapes=entries.map(e=>project(e,e.offset.goalX,e.offset.goalY,options));baseline=total(entries.map(e=>project(e,0,0,options)));
        // Fixed ordering, one sweep, and a minimum improvement threshold prevent
        // oscillation. Every accepted move reduces the same pairwise objective.
        for(let i=0;i<entries.length;i++) {
          if(pinned[i])continue;
          const e=entries[i],o=e.offset;
          let best=score(shapes[i],i,shapes,o.goalX,o.goalY,options),bestX=o.goalX,bestY=o.goalY,bestShape=shapes[i];
          const sign=i%2?1:-1;
          for(const y of [0,sign*.13,-sign*.13,sign*.26,-sign*.26])for(const x of [0,sign*.14,-sign*.14]) {
            const candidate=project(e,x,y,options),value=score(candidate,i,shapes,x,y,options);
            if(value<best-.04){best=value;bestX=x;bestY=y;bestShape=candidate;}
          }
          o.goalX=bestX;o.goalY=bestY;shapes[i]=bestShape;
        }
        planned=total(shapes);lastMs=performance.now()-start;solves++;
      }
      for(let i=0;i<entries.length;i++) {
        if(pinned[i])continue;
        const o=entries[i].offset,dx=o.goalX-o.x,dy=o.goalY-o.y;
        const length=Math.hypot(dx,dy),a=Math.min(1-Math.exp(-4*delta),length?SPACING_LIMITS.speed*delta/length:1);
        o.x+=dx*a;o.y+=dy*a;
      }
    },
    measure(options){return total(entries.map(e=>project(e,e.offset.x,e.offset.y,options)));},
    state(){return {baseline,planned,solves,lastMs,offsets:entries.map(e=>({title:e.group.userData.track.title,x:e.offset.x,y:e.offset.y,goalX:e.offset.goalX,goalY:e.offset.goalY}))};}
  };
}
