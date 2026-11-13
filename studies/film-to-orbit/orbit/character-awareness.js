// Bounded additive attention; no geometry, physics or independent animation loop.
export function createCharacterAwareness(){
 const pose={yaw:0,pitch:0};let selectedAt=-Infinity;
 return {pose,select(now){selectedAt=now;},update(dt,now,target,enabled=true){
  const age=(now-selectedAt)/1000;
  const nod=age>=0&&age<1.2?Math.sin(Math.PI*Math.min(age/.9,1))*.035*Math.exp(-age):0;
  const yaw=enabled&&target?Math.max(-1,Math.min(1,target.x))*.18:0;
  const pitch=enabled? (target?-Math.max(-1,Math.min(1,target.y/.6))*.24:0)+nod:0;
  const ease=1-Math.exp(-Math.min(dt,.05)*(target?3.8:2.8));
  if(!enabled){pose.yaw=0;pose.pitch=0;}else{pose.yaw+=(yaw-pose.yaw)*ease;pose.pitch+=(pitch-pose.pitch)*ease;}
  return pose;
 }};
}
