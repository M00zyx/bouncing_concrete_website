import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Frozen local transforms: one rigid field, one shared orbit, no per-prop update.
export function createOrbitalDebris(parent) {
  const group=new THREE.Group();group.name='Suspended street wreckage';parent.add(group);
  const stats={loaded:false,heroObjects:8,fragments:16,drawCalls:2,triangles:1280,textures:3,geometryBytes:0};
  const stone=new THREE.IcosahedronGeometry(1,1);
  const points=stone.attributes.position,uv=stone.attributes.uv;
  for(let i=0;i<points.count;i++) {
    const x=points.getX(i),y=points.getY(i),z=points.getZ(i);
    const jitter=Math.sin(x*17+y*11+z*23);
    points.setXYZ(i,x*(.85+.15*jitter),y*(.4+.1*Math.sin(x*9-z*13)),z*(.8+.12*jitter));
    uv.setXY(i,.25+x*.16,.75+z*.16); // exposed-concrete patch in the shared atlas
  }
  stone.computeVertexNormals();stone.computeBoundingSphere();
  const material=new THREE.MeshStandardMaterial({color:0x979288,roughness:1,metalness:0});
  const chips=new THREE.InstancedMesh(stone,material,16);
  const dummy=new THREE.Object3D(),colour=new THREE.Color();
  // Sparse clusters around the outside, with a clear central face area.
  const placement=[[-2.6,1.1,-1.4],[-3.6,1.5,1.8],[-2.1,2.6,.2],[-1.8,2.9,-1.3],
    [.4,3.05,.3],[1.6,2.5,-1.5],[2.3,2.7,-.6],[3,.9,-1.3],
    [3.55,-.9,1.65],[2.7,-2.3,-.8],[1.5,-2.8,-1.1],[.4,-2.6,1.1],
    [-1.9,-2.7,-.2],[-2.8,-1.1,1],[-2.7,-.5,-1.7],[2.6,.3,-1.9]];
  placement.forEach((p,i)=>{
    const s=.065+(i%4)*.025;dummy.position.set(...p);dummy.rotation.set(i*.71,i*1.17,i*.39);
    dummy.scale.set(s*(1+(i%3)*.3),s*.65,s*1.2);dummy.updateMatrix();chips.setMatrixAt(i,dummy.matrix);
    colour.setScalar(.65+(i%4)*.08);chips.setColorAt(i,colour);
  });
  chips.instanceMatrix.setUsage(THREE.StaticDrawUsage);chips.instanceMatrix.needsUpdate=true;
  chips.instanceColor.setUsage(THREE.StaticDrawUsage);chips.instanceColor.needsUpdate=true;
  chips.computeBoundingSphere();chips.updateMatrix();chips.matrixAutoUpdate=false;
  group.add(chips);
  for(const a of Object.values(stone.attributes))stats.geometryBytes+=a.array.byteLength;
  stats.geometryBytes+=chips.instanceMatrix.array.byteLength+chips.instanceColor.array.byteLength;
  new GLTFLoader().load('assets/orbital-wreckage.glb?v=damaged-2',gltf=>{
    gltf.scene.traverse(node=>{
      node.updateMatrix();node.matrixAutoUpdate=false;
      if(node.isMesh){
        node.castShadow=false;node.receiveShadow=false;
        stats.triangles+=(node.geometry.index?.count||node.geometry.attributes.position.count)/3;
        material.map=node.material.map;material.roughnessMap=node.material.roughnessMap;
        material.normalMap=node.material.normalMap;material.normalScale.copy(node.material.normalScale);
        material.needsUpdate=true;
        for(const a of Object.values(node.geometry.attributes))stats.geometryBytes+=a.array.byteLength;
      }
    });
    group.add(gltf.scene);stats.loaded=true;
  },undefined,()=>{stats.error='Wreckage could not load';});
  const reactionAge={value:-1};let reactionStart=-Infinity;
  function resetReaction(){reactionStart=-Infinity;reactionAge.value=-1;}
  return {
    group,stats,reactionAge,discovery:{value:new THREE.Vector2()},
    react(now){reactionStart=now;reactionAge.value=0;},stopReaction:resetReaction,
    update(time,compact,now=performance.now(),reactive=true){
      group.rotation.y=time*.025;group.scale.setScalar(compact ? .73 : 1);
      if(!reactive){resetReaction();return;}
      if(reactionStart===-Infinity)return;
      const age=(now-reactionStart)/1000;
      if(age>=3.1)resetReaction();else reactionAge.value=age;
    },
  };
}
