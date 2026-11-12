// Scroll-derived values: no timers, physics, or accumulated entrance state.
export const ease=(a,b,value)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};
export function trackEntry(arrival,index,count=6){
 // Fit any catalogue into the approved entrance window; six retains its timing.
 const rank=index*5/Math.max(5,count-1);
 return ease(.64+rank*.035,.90+rank*.018,arrival);
}
export function entryLongitude(phase,progress){
 const angle=Math.atan2(Math.sin(phase),Math.cos(phase));
 const back=angle<0?-Math.PI:Math.PI;
 return (back-angle)*(1-progress);
}
