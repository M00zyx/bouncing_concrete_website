const entries = [
  {title:'Funkacaine',lines:['FUNKACAINE'],height:.9,phase:-.2,speed:.19,lane:1.7,index:0,slug:'funkacaine',sleeve:'crop-11-63a82a4545cd.webp'},
  {title:'Concreto Incarnat',lines:['CONCRETO INCARNAT'],height:.83,phase:1.05,speed:.17,lane:-1.75,index:1,slug:'concreto-incarnat',sleeve:'crop-18-bd5de7ab99aa.webp'},
  {title:'Pressure Test',lines:['PRESSURE TEST'],height:.85,phase:2.2,speed:.21,lane:2.85},
  {title:'Aftershock',lines:['AFTERSHOCK'],height:.9,phase:3.35,speed:.18,lane:.55},
  {title:'Load Bearing',lines:['LOAD BEARING'],height:.9,phase:4,speed:.16,lane:-2.9},
  {title:'Soft Collision',lines:['SOFT COLLISION'],height:.85,phase:5.3,speed:.2,lane:-.6},
  // Paired across the sphere at matching speeds, staggered to clear neighbouring rows.
  {title:'Fault Line',lines:['FAULT LINE'],height:.81,phase:-.2+Math.PI-.45,speed:.19,lane:1.7},
  {title:'Night Works',lines:['NIGHT WORKS'],height:.747,phase:1.05+Math.PI+.45,speed:.17,lane:-1.75},
  {title:'Dead Load',lines:['DEAD LOAD'],height:.765,phase:2.2+Math.PI+.45,speed:.21,lane:2.85},
  {title:'Stress Field',lines:['STRESS FIELD'],height:.81,phase:3.35+Math.PI-.3,speed:.18,lane:.55},
  {title:'Ground Shift',lines:['GROUND SHIFT'],height:.81,phase:4+Math.PI-.45,speed:.16,lane:-2.9},
  {title:'Rebar',lines:['REBAR'],height:.765,phase:5.3+Math.PI-.45,speed:.2,lane:-.6},
];

export const catalogue=entries.map((entry,index)=>{
 const sample=!entry.slug;
 const slug=entry.slug||entry.title.toLowerCase().replaceAll(' ','-');
 return {...entry,index,slug,sample,
  sleeve:entry.sleeve?new URL('./orbit/assets/'+entry.sleeve,import.meta.url).href:null,
  audio:slug==='funkacaine'?new URL('./orbit/assets/audio/funkacaine.mp3',import.meta.url).href:null,
  duration:slug==='funkacaine'?252.923084:0,
  url:sample?null:'https://soundcloud.com/moo-497939951/'+slug};
});
export const releases=Object.fromEntries(catalogue.map(track=>[track.slug,track]));
export function sampleSleeveCanvas(track){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d'),index=track.index;
 ctx.fillStyle=index%2?'#1736df':'#20231e';ctx.fillRect(0,0,512,512);
 ctx.strokeStyle='#ffd900';ctx.lineWidth=24;
 for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-70+i*160,0);ctx.lineTo(130+i*160,250);ctx.stroke();}
 ctx.fillStyle='#edf0f1';ctx.font='17px "DM Mono"';ctx.fillText('SAMPLE SLEEVE / '+String(index+1).padStart(2,'0'),28,285);
 ctx.font='66px Anton';track.title.toUpperCase().split(' ').forEach((word,i)=>ctx.fillText(word,26,365+i*76));
 return canvas;
}
