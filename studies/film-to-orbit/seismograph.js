// The line contains measured signed peaks from the playing audio, never synthetic beats.
export function createSeismograph({canvases,playback,activeCanvas}){
 const samples=new Float32Array(1024),history=new Float32Array(512),contexts=canvases.map(c=>c.getContext('2d'));let head=0,last=0,raf=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function reset(){history.fill(0);head=0;draw();}
 function draw(){const active=activeCanvas();for(let n=0;n<canvases.length;n++){const c=canvases[n];if(c!==active)continue;const ctx=contexts[n],w=c.clientWidth,h=c.clientHeight;if(!w||!h)continue;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#1736df';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<history.length;i++){const x=i/(history.length-1)*w;const v=reduced.matches?0:history[(head+i)%history.length];const y=h/2-v*h*.43;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}
 function resize(){for(const c of canvases){const d=Math.min(devicePixelRatio,1.5);c.width=Math.round(c.clientWidth*d);c.height=Math.round(c.clientHeight*d);c.getContext('2d').setTransform(d,0,0,d,0,0);}draw();}
 const observer=new ResizeObserver(resize);canvases.forEach(c=>observer.observe(c));
 function tick(now){raf=0;if(document.hidden||reduced.matches||playback.state.status!=='playing'||!playback.getAnalyser())return;raf=requestAnimationFrame(tick);if(now-last<1000/30)return;last=now;playback.getAnalyser().getFloatTimeDomainData(samples);for(let block=0;block<4;block++){let peak=0;for(let i=block*256;i<(block+1)*256;i++)if(Math.abs(samples[i])>Math.abs(peak))peak=samples[i];history[head]=peak;head=(head+1)%history.length;}draw();}
 function wake(){if(!raf)raf=requestAnimationFrame(tick);draw();}
 playback.subscribe(s=>{if(s.mode!=='native')reset();wake();});document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);
 return {reset,resize,wake};
}
