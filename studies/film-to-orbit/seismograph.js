import {createTrace,createPaperClock,paperWindow,inkDelay,penFraction,traceX} from './seismograph-trace.js?v=1';

export function createSeismograph({canvases,playback,activeCanvas}){
 const samples=new Float32Array(1024),trace=createTrace(),clock=createPaperClock();
 const contexts=canvases.map(c=>c.getContext('2d'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let lastCapture=-Infinity,raf=0,lastMode=null,frames=0,reads=0;
 const check=new URLSearchParams(location.search).has('signal-check')?document.createElement('output'):null;
 if(check){check.id='signal-check';check.style.cssText='position:fixed;z-index:100;top:4px;right:4px;background:#fff;color:#151714;padding:6px;font:11px monospace';document.body.append(check);}
 const running=()=>!document.hidden&&!reduced.matches&&playback.state.status==='playing'&&!!playback.getAnalyser();
 function reset(){trace.clear();clock.reset();lastCapture=-Infinity;draw();}
 function draw(){
  const active=activeCanvas(),drawTime=clock.time-inkDelay;
  for(let n=0;n<canvases.length;n++){
   const c=canvases[n];if(c!==active)continue;
   const ctx=contexts[n],w=c.clientWidth,h=c.clientHeight;if(!w||!h)continue;
   const penX=w*penFraction,mid=h/2,from=drawTime-paperWindow;
   const signal=playback.state.mode==='native'&&!reduced.matches;
   // Preserve the measured signed peaks and angular ink; no decorative vibration.
   const y=value=>mid-Math.max(-1,Math.min(1,value))*h*.43;
   ctx.clearRect(0,0,w,h);ctx.strokeStyle='#1736df';ctx.fillStyle='#1736df';
   // A quiet baseline and one-second paper marks make the travel legible.
   ctx.globalAlpha=.10;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(0,mid);ctx.lineTo(w,mid);
   if(signal){for(let second=Math.ceil(from);second<=drawTime;second++){const x=traceX(second,drawTime,w);ctx.moveTo(x,h*.83);ctx.lineTo(x,h*.83+Math.min(5,h*.1));}}
   ctx.stroke();ctx.globalAlpha=1;
   ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,y(signal?trace.at(from):0));
   if(signal&&trace.count&&from<trace.start)ctx.lineTo(Math.max(0,traceX(trace.start-1/120,drawTime,w)),mid);
   if(signal)trace.points(from,drawTime,(time,value)=>ctx.lineTo(traceX(time,drawTime,w),y(value)));
   const penY=y(signal?trace.at(drawTime):0);ctx.lineTo(penX,penY);ctx.stroke();
   // The pen stays fixed horizontally. Only its measured displacement moves.
   if(signal){ctx.globalAlpha=.12;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(penX,h*.1);ctx.lineTo(penX,h*.9);ctx.stroke();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(penX,penY,1.7,0,Math.PI*2);ctx.fill();}
   if(check)check.textContent=`${c.id} | ${playback.state.status} | paper ${clock.time.toFixed(3)}s | pen X ${penX.toFixed(1)} Y ${penY.toFixed(1)} | samples ${trace.count} | frames ${frames} reads ${reads}`;
  }
 }
 function resize(){for(const c of canvases){const d=Math.min(devicePixelRatio,1.5);c.width=Math.round(c.clientWidth*d);c.height=Math.round(c.clientHeight*d);c.getContext('2d').setTransform(d,0,0,d,0,0);}draw();}
 const observer=new ResizeObserver(resize);canvases.forEach(c=>observer.observe(c));
 function tick(now){
  raf=0;if(!running()){clock.stop();return;}
  const time=clock.step(now),elapsed=time-lastCapture;
  if(elapsed>=1/30){
   // After a long main-thread stall, resume from current audio, not fabricated backlog.
   if(Number.isFinite(lastCapture)&&elapsed>.25)trace.clear();
   playback.getAnalyser().getFloatTimeDomainData(samples);reads++;
   trace.capture(samples,time,1/30);lastCapture=time;
  }
  // Draw every display frame, with a short fixed delay to interpolate the pen.
  frames++;draw();raf=requestAnimationFrame(tick);
 }
 function wake(){
  if(!running()){if(raf)cancelAnimationFrame(raf);raf=0;clock.stop();}
  else if(!raf)raf=requestAnimationFrame(tick);
  draw();
 }
 playback.subscribe(s=>{if(s.mode!==lastMode){lastMode=s.mode;reset();}wake();});
 document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);
 return {reset,resize,wake};
}
