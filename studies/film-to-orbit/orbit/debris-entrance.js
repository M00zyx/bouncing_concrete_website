import * as THREE from 'three';

// Preserve the merged hero mesh and instanced chips: two debris draw calls.
// Each object receives a constant centre/onset attribute, so the vertex shader
// moves whole pieces along an arc. It never bends the baked damaged geometry.
export function createDebrisEntrance(debris,parts){
 const progress={value:1};const installed=new Set();let extraBytes=0;
 const onsets={'lamp':.36,'signal':.40,'signal-wires':.40,'sign':.44,'wheel':.48,'railing':.42,'slab-top':.34,'slab-road':.46,'slab-right':.38};
 function install(mesh){
  const count=mesh.isInstancedMesh?mesh.count:mesh.geometry.attributes.position.count;
  const data=new Float32Array(count*4);
  if(mesh.isInstancedMesh){
   const matrix=new THREE.Matrix4();const centre=new THREE.Vector3();
   for(let i=0;i<count;i++){mesh.getMatrixAt(i,matrix);centre.setFromMatrixPosition(matrix);data.set([centre.x,centre.y,centre.z,.15+(i%5)*.025],i*4);}
  }else{
   if(parts.reduce((sum,p)=>sum+p.count,0)!==count)throw new Error('Debris entrance ranges do not match the baked asset');
   for(const part of parts)for(let i=part.start;i<part.start+part.count;i++)data.set([...part.center,onsets[part.name]],i*4);
  }
  const Attribute=mesh.isInstancedMesh?THREE.InstancedBufferAttribute:THREE.BufferAttribute;
  mesh.geometry.setAttribute('entryPart',new Attribute(data,4));extraBytes+=data.byteLength;
  mesh.frustumCulled=false; // Arc stays in the field, but extends behind the baked bounds.
  const mat=mesh.material;const previous=mat.onBeforeCompile;
  mat.onBeforeCompile=shader=>{
   previous.call(mat,shader);shader.uniforms.entryProgress=progress;
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 entryPart;
uniform float entryProgress;
varying float entryVisible;`);
   const project=THREE.ShaderChunk.project_vertex.replace('mvPosition = modelViewMatrix * mvPosition;',`
float entryT=smoothstep(entryPart.w,entryPart.w+.24,entryProgress);
entryVisible=step(entryPart.w+.001,entryProgress);
if(entryProgress<1.0){
 vec3 centre=entryPart.xyz;
 float radius=length(centre);
 float endAngle=atan(centre.x,centre.z);
 float backAngle=endAngle<0.0?-3.14159265:3.14159265;
 float angle=mix(backAngle,endAngle,entryT);
 float y=mix(centre.y*.15,centre.y,entryT);
 float horizontal=sqrt(max(0.0,radius*radius-y*y));
 mvPosition.xyz+=vec3(sin(angle)*horizontal,y,cos(angle)*horizontal)-centre;
}
mvPosition = modelViewMatrix * mvPosition;`);
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',project);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float entryVisible;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(entryVisible<.5)discard;');
  };
  mat.customProgramCacheKey=()=>`bc-debris-entry-${mesh.isInstancedMesh?'chips':'hero'}-1`;
  mat.needsUpdate=true;installed.add(mesh);
 }
 return {update(value){
  progress.value=value;
  debris.group.traverse(node=>{if(node.isMesh&&!installed.has(node))install(node);});
  debris.stats.entranceAttributeBytes=extraBytes;
 }};
}
