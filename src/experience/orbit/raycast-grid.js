// Exact triangle hit testing in spatial buckets. Render geometry is never modified.
// Shared vertex buffers; one reordered index plus original-triangle lookup.
export function accelerateRaycast(mesh,THREE,size=8){
 const source=mesh.geometry,index=source.index,position=source.attributes.position;
 if(!index||mesh.isSkinnedMesh||source.morphAttributes.position?.length||Array.isArray(mesh.material))return null;
 source.computeBoundingBox();const bounds=source.boundingBox,extent=bounds.getSize(new THREE.Vector3());
 const n=index.count/3,total=size**3,counts=new Uint32Array(total),cells=new Uint16Array(n);
 const point=new THREE.Vector3();
 for(let t=0;t<n;t++){
  point.set(0,0,0);for(let k=0;k<3;k++){const v=index.getX(t*3+k);point.x+=position.getX(v)/3;point.y+=position.getY(v)/3;point.z+=position.getZ(v)/3;}
  const x=Math.min(size-1,Math.max(0,Math.floor((point.x-bounds.min.x)/(extent.x||1)*size))),y=Math.min(size-1,Math.max(0,Math.floor((point.y-bounds.min.y)/(extent.y||1)*size))),z=Math.min(size-1,Math.max(0,Math.floor((point.z-bounds.min.z)/(extent.z||1)*size)));
  const cell=x+size*(y+size*z);cells[t]=cell;counts[cell]++;
 }
 const starts=new Uint32Array(total);for(let i=1;i<total;i++)starts[i]=starts[i-1]+counts[i-1];
 const cursor=starts.slice(),indices=new index.array.constructor(index.count),original=new Uint32Array(n);
 for(let t=0;t<n;t++){const at=cursor[cells[t]]++;original[at]=t;for(let k=0;k<3;k++)indices[at*3+k]=index.getX(t*3+k);}
 const buckets=[];
 for(let c=0;c<total;c++){
  if(!counts[c])continue;
  const geometry=new THREE.BufferGeometry();geometry.attributes=source.attributes;
  geometry.setIndex(new THREE.BufferAttribute(indices.subarray(starts[c]*3,(starts[c]+counts[c])*3),1));
  const box=new THREE.Box3();for(const v of geometry.index.array)box.expandByPoint(point.fromBufferAttribute(position,v));
  geometry.boundingBox=box;geometry.boundingSphere=box.getBoundingSphere(new THREE.Sphere());
  const proxy=new THREE.Mesh(geometry,mesh.material);proxy.matrixWorld=mesh.matrixWorld;
  buckets.push({proxy,start:starts[c]});
 }
 const inverse=new THREE.Matrix4(),ray=new THREE.Ray(),scratch=new THREE.Vector3(),hits=[];
 mesh.raycast=function(raycaster,result){
  inverse.copy(this.matrixWorld).invert();ray.copy(raycaster.ray).applyMatrix4(inverse);
  if(!ray.intersectsBox(bounds))return;
  for(const {proxy,start} of buckets){
   if(!ray.intersectBox(proxy.geometry.boundingBox,scratch))continue;
   proxy.material=this.material;proxy.matrixWorld=this.matrixWorld;hits.length=0;proxy.raycast(raycaster,hits);
   for(const hit of hits){hit.object=this;hit.faceIndex=original[start+hit.faceIndex];result.push(hit);}
  }
 };
 return {buckets:buckets.length,indexBytes:indices.byteLength,lookupBytes:original.byteLength};
}
