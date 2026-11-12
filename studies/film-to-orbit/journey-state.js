export const clamp=v=>Math.max(0,Math.min(1,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export function journeyState(progress,reduced=false){
 const p=clamp(progress);
 return {progress:p,title:reduced?(p<.5?1:0):1-smooth(.025,.17,p),film:clamp(p/.76),dissolve:reduced?(p>=1?1:0):smooth(.78,.85,p),arrival:reduced?(p>=1?1:0):smooth(.85,1,p),reveal:reduced?(p>=1?1:0):smooth(.85,.97,p),orbit:reduced?(p>=1?1:0):smooth(.92,1,p),interactive:p>=1};
}
