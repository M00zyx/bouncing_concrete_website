export const MAGNET_REACH=180;
export const CLICK_PADDING=12;
export function closestOnSegment(px,py,a,b) {
  const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
  const t=den?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/den)):0;
  const x=a.x+t*dx,y=a.y+t*dy;
  return {x,y,t,distance:Math.hypot(px-x,py-y)};
}
export function localCandidates(items,event,dx,dy,reach=MAGNET_REACH) {
  const travel=Math.hypot(dx,dy);
  return items.filter(item=>{
    if(item.distance>reach)return false;
    const toward=travel?((item.x-event.clientX)*dx+(item.y-event.clientY)*dy)/travel:0;
    const alignment=toward/Math.max(1,Math.hypot(item.x-event.clientX,item.y-event.clientY));
    // The wider approach zone is directional; nearby side tracks must not
    // capture a gesture aimed at a title farther along the cursor's path.
    return item.distance<=CLICK_PADDING||(item.distance<=64?toward>0:alignment>.85);
  }).sort((a,b)=>a.distance-b.distance);
}
export function leavingTarget(event,dx,dy,capture) {
  const fromAim=Math.hypot(event.clientX-capture.aimX,event.clientY-capture.aimY);
  const travel=Math.hypot(event.clientX-capture.x,event.clientY-capture.y);
  const away=(event.clientX-capture.aimX)*dx+(event.clientY-capture.aimY)*dy;
  return fromAim>96&&travel>36&&away>0;
}
// A latched track yields only to a close, deliberately approached point from
// the scene the user saw before attraction started. Scene motion cannot steal it.
export function handoffCandidate(snapshot,event,dx,dy,capture,current) {
  const travel=Math.hypot(event.clientX-capture.x,event.clientY-capture.y);
  const oldGap=Math.hypot(event.clientX-capture.aimX,event.clientY-capture.aimY);
  if(travel<28||oldGap<28)return null;
  return snapshot.map(i=>({...i,distance:Math.hypot(event.clientX-i.x,event.clientY-i.y)}))
    .filter(i=>i.track!==current&&i.distance<=28&&i.distance+18<oldGap)
    .filter(i=>i.distance<12||(i.x-event.clientX)*dx+(i.y-event.clientY)*dy>0)
    .sort((a,b)=>a.distance-b.distance)[0]||null;
}
