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
   previous.call(mat,shader);shader.uniforms.entryProgress=progress;shader.uniforms.reactionAge=debris.reactionAge;shader.uniforms.discovery=debris.discovery;
   shader.uniforms.wheelAxis={value:new THREE.Vector3(0,0,1).applyEuler(new THREE.Euler(.42,.6,-.35))};
   shader.uniforms.signAxis={value:new THREE.Vector3(0,1,0).applyEuler(new THREE.Euler(.15,.3,.55))};
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 entryPart;
uniform float entryProgress;
uniform float reactionAge;
varying float entryVisible;
uniform vec2 discovery;
uniform vec3 wheelAxis;
uniform vec3 signAxis;
vec3 discoveredRotation(vec3 v){
 float wheel=1.0-step(.001,abs(entryPart.w-.48));
 float signPart=1.0-step(.001,abs(entryPart.w-.44));
 float angle=(wheel*discovery.x+signPart*discovery.y)*step(1.0,entryProgress);
 vec3 axis=wheel>.5?wheelAxis:signAxis;
 return v*cos(angle)+cross(axis,v)*sin(angle)+axis*dot(axis,v)*(1.0-cos(angle));
}`);
   shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=discoveredRotation(objectNormal);');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=entryPart.xyz+discoveredRotation(transformed-entryPart.xyz);');
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
// Reuse the existing per-piece centre: every vertex of a piece translates equally.
// This keeps the merged mesh rigid and preserves its normals without extra draws.
// Restore the broad, staggered full-field impulse; remove only its oscillating tail.
if(entryProgress>=1.0 && reactionAge>=0.0){
 float delay=(entryPart.w-.15)*.65;
 float t=max(0.0,reactionAge-delay);
 float crest=.197;
 float outward=min(t,crest);
 float envelope=exp(-outward*2.25)*smoothstep(0.0,.06,outward);
 float recovery=pow(1.0-clamp((t-crest)/1.6,0.0,1.0),2.0);
 float kick=sin(outward*6.2)*envelope*recovery;
 vec3 radial=normalize(entryPart.xyz+vec3(.0001));
 vec3 tangent=vec3(-radial.y,radial.x,0.0);
 // Stable piece-specific travel: slabs resist, loose chips scatter further.
 float seed=fract(sin(dot(entryPart.xyz,vec3(12.9898,78.233,37.719)))*43758.5453);
 float variation=mix(.35,1.15,seed);
 if(entryPart.w<.3)variation=mix(.55,1.4,seed);
 else if(abs(entryPart.w-.34)<.001 || abs(entryPart.w-.38)<.001 || abs(entryPart.w-.46)<.001)variation=mix(.18,.32,seed);
 else if(abs(entryPart.w-.48)<.001)variation=.65;
 else if(abs(entryPart.w-.42)<.001)variation=.4;
 variation*=.8; // Overall travel reduced 20%; preserve relative weights and timing.
 mvPosition.xyz+=radial*kick*1.8*variation+tangent*sin(outward*4.5)*envelope*.5*recovery;
 // A small lateral settling drift outlasts the main impulse, without radial rebound.
 float tailT=clamp((t-.35)/2.5,0.0,1.0);
 float tail=sin(tailT*3.14159265);
 float direction=entryPart.x<0.0?-1.0:1.0;
 mvPosition.xyz+=tangent*tail*tail*.12*variation*direction;
}
mvPosition = modelViewMatrix * mvPosition;`);
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',project);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float entryVisible;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(entryVisible<.5)discard;');
  };
  mat.customProgramCacheKey=()=>`bc-debris-entry-${mesh.isInstancedMesh?'chips':'hero'}-discovery-1`;
  mat.needsUpdate=true;installed.add(mesh);
 }
 return {update(value){
  progress.value=value;
  debris.group.traverse(node=>{if(node.isMesh&&!installed.has(node))install(node);});
  debris.stats.entranceAttributeBytes=extraBytes;
 }};
}
