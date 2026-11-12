// Soft separation is a small offset from each track's natural orbit, not a
// collision-free screen layout. Perspective overlaps are allowed in this scene.
export const MAX_SPACING=36;
export function overlap(a,b,gap=0) {
  return Math.min(a.right,b.right)-Math.max(a.left,b.left)+gap>0 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)+gap>0;
}
export function solveSpacing(rects,pinned,limit,gap=12) {
  const offsets=rects.map(()=>({x:0,y:0}));
  if(pinned<0)return offsets;
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++) {
    const a=rects[i],b=rects[j];
    if(!overlap(a,b,gap))continue;
    const penetration=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)+gap;
    const amount=Math.min(18,penetration*.18)*(i===pinned||j===pinned?1:.3);
    // Use the unshifted orbit to choose sides. Correction never feeds back into
    // the next correction, so touching neighbours cannot trap one another.
    const sign=(a.top+a.bottom)<(b.top+b.bottom)?-1:1;
    if(i!==pinned)offsets[i].y+=sign*amount;
    if(j!==pinned)offsets[j].y-=sign*amount;
  }
  for(let i=0;i<rects.length;i++) {
    const r=rects[i],o=offsets[i];
    o.y=Math.max(-MAX_SPACING,Math.min(MAX_SPACING,o.y));
    // Only restrict the nudge at an edge; never pack an orbit against it.
    if(o.y<0)o.y=Math.max(o.y,Math.min(0,limit.top-r.top));
    else o.y=Math.min(o.y,Math.max(0,limit.bottom-r.bottom));
  }
  return offsets;
}
export function approachOffset(current,goal,delta) {
  const alpha=1-Math.exp(-9*delta);
  let dx=(goal.x-current.x)*alpha,dy=(goal.y-current.y)*alpha;
  const distance=Math.hypot(dx,dy),maxStep=150*delta;
  if(distance>maxStep){dx*=maxStep/distance;dy*=maxStep/distance;}
  return {x:current.x+dx,y:current.y+dy};
}
