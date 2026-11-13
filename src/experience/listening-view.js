import {createPlayback} from './playback.js';
import {createSeismograph} from './seismograph.js?v=fixed-pen-1';
import {releases,sampleSleeveCanvas} from './catalogue.js';
export {releases};
export function createListeningView({onOpen=()=>{},onClose=()=>{}}={}){
 document.body.insertAdjacentHTML('beforeend',`<dialog id="release-dialog" aria-labelledby="release-title" tabindex="-1"><div class="release-sheet"><button class="release-close" aria-label="Back to orbit">Back to orbit <span aria-hidden="true">×</span></button><div class="release-art"><img id="release-sleeve" alt="" width="345" height="360"></div><div class="release-content"><div class="release-info"><h2 id="release-title"></h2><p class="release-artist">BOUNCING CONCRETE</p></div><div class="release-signal"><canvas id="release-wave" aria-label="Live audio seismograph"></canvas><span id="signal-note" hidden>Audio visualization available for Funkacaine</span></div><div class="release-playback"><div class="release-transport"><output class="release-time">0:00</output><button class="transport-play" aria-label="Play"><span aria-hidden="true"></span></button><span class="release-duration">4:12</span></div><input class="release-seek" aria-label="Seek in track" type="range" min="0" max="1000" step="1" value="0"></div><a class="release-source" target="_blank" rel="noopener">Listen on SoundCloud <span aria-hidden="true">↗</span></a><p class="release-status" role="status"></p></div></div></dialog><section id="mini-player" hidden aria-label="Now playing"><button class="mini-open" aria-label="Open current release"><img id="mini-sleeve" alt="" width="46" height="48"><span><small>BOUNCING CONCRETE</small><strong id="mini-title"></strong></span></button><canvas id="mini-wave" aria-label="Live audio seismograph"></canvas><div class="mini-transport"><output class="release-time">0:00</output><button class="transport-play" aria-label="Play"><span aria-hidden="true"></span></button><button class="mini-expand" aria-label="Expand player">↗</button></div><input class="release-seek" aria-label="Seek in current track" type="range" min="0" max="1000" step="1" value="0"><p class="mini-status" role="status"></p></section><audio id="release-audio" preload="metadata"></audio><iframe id="release-cloud" title="SoundCloud audio player" allow="autoplay" aria-hidden="true" tabindex="-1"></iframe>`);
 const dialog=document.querySelector('#release-dialog'),mini=document.querySelector('#mini-player'),close=document.querySelector('.release-close'),art=document.querySelector('#release-sleeve'),wave=document.querySelector('#release-wave'),miniWave=document.querySelector('#mini-wave');
 const sheetObserver=new ResizeObserver(()=>{if(dialog.open)document.body.style.setProperty('--listening-height',`${dialog.getBoundingClientRect().height}px`);});sheetObserver.observe(dialog);
 let signal=null,shown=null,returnFocus=null,animation=null,seekDrag=null;
 let keyboardOpen=false;document.addEventListener('keydown',()=>{keyboardOpen=true;},true);document.addEventListener('pointerdown',()=>{keyboardOpen=false;},true);
 document.fonts.load('17px "DM Mono"');document.fonts.load('66px Anton');
 const lessMotion=matchMedia('(prefers-reduced-motion: reduce)');
 for(const release of Object.values(releases)){const image=new Image();if(release.sleeve)image.src=release.sleeve;}
 const playback=createPlayback({audio:document.querySelector('#release-audio'),cloudFrame:document.querySelector('#release-cloud'),onSignalReset:()=>signal?.reset()});
 signal=createSeismograph({canvases:[wave,miniWave],playback,activeCanvas:()=>dialog.open?wave:miniWave});
 const format=seconds=>`${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;
 function render(state){
  if(!state.track)return;
  const isPlaying=state.status==='playing'||state.status==='buffering';
  if(shown!==state.track.slug){seekDrag=null;if(state.track.sample&&!state.track.sleeve)state.track.sleeve=sampleSleeveCanvas(state.track).toDataURL();if(shown&&dialog.open&&!lessMotion.matches){animation?.cancel();animation=art.animate([{opacity:.45},{opacity:1}],{duration:180,easing:'ease-out'});}shown=state.track.slug;art.src=state.track.sleeve;art.alt=state.track.title+' sleeve';document.querySelector('#mini-sleeve').src=state.track.sleeve;document.querySelector('#release-title').textContent=state.track.title.toUpperCase();document.querySelector('#mini-title').textContent=state.track.title;document.querySelector('.release-source').hidden=!state.track.url;if(state.track.url)document.querySelector('.release-source').href=state.track.url;else document.querySelector('.release-source').removeAttribute('href');document.querySelector('.mini-open').setAttribute('aria-label','Open '+state.track.title);dialog.classList.toggle('long-title',state.track.title.length>12);}
  for(const button of document.querySelectorAll('.transport-play')){button.classList.toggle('playing',isPlaying);button.setAttribute('aria-label',isPlaying?'Pause':state.status==='ended'?'Replay':state.status==='error'?'Retry playback':state.status==='loading'?'Loading audio':'Play');button.disabled=state.status==='loading'||state.mode==='sample';}
  for(const output of document.querySelectorAll('.release-time'))output.value=format(seekDrag===null?state.position:seekDrag);
  document.querySelector('.release-duration').textContent=state.duration?format(state.duration):'—';
  for(const input of document.querySelectorAll('.release-seek')){if(seekDrag===null)input.value=state.duration?state.position/state.duration*1000:0;input.disabled=!state.duration;input.setAttribute('aria-valuetext',format(seekDrag===null?state.position:seekDrag)+' of '+format(state.duration));input.style.setProperty('--progress',`${Number(input.value)/10}%`);}
  const status=state.mode==='sample'?'Sample track — audio not available yet.':state.error||(state.status==='loading'?'Loading audio…':state.status==='buffering'?'Buffering…':state.status==='paused'?'Paused':state.status==='ended'?'Track finished — replay when ready.':'');
  for(const el of document.querySelectorAll('.release-status,.mini-status'))if(el.textContent!==status)el.textContent=status;
  for(const button of document.querySelectorAll('.transport-play'))button.setAttribute('aria-busy',String(state.status==='loading'||state.status==='buffering'));
  document.querySelector('#signal-note').hidden=state.mode!=='cloud';
  wave.setAttribute('aria-label',state.mode==='native'?'Live audio seismograph':state.mode==='sample'?'Sample track — no audio':'Audio visualization unavailable for this stream');miniWave.setAttribute('aria-label',wave.getAttribute('aria-label'));
  mini.hidden=dialog.open;document.body.classList.toggle('has-player',!dialog.open);dialog.dataset.playback=state.status;mini.dataset.playback=state.status;
 }
 function open(slug,origin=null,fromKeyboard=false){
  const reopening=slug===undefined;slug??=playback.state.track?.slug;
  const track=releases[slug];if(!track)return;
  const wasOpen=dialog.open;
  if(!wasOpen){returnFocus=document.activeElement;onOpen();dialog.show();document.body.classList.add('listening-open');mini.hidden=true;document.body.classList.remove('has-player');}
  if(!reopening)playback.select(track);render(playback.state);signal.resize();
  if(!wasOpen&&!lessMotion.matches){
   dialog.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:240,easing:'cubic-bezier(.18,.7,.18,1)'});
   if(origin&&origin.width>10&&origin.height>10){const end=art.getBoundingClientRect();const dx=origin.x+origin.width/2-end.x-end.width/2,dy=origin.y+origin.height/2-end.y-end.height/2;animation?.cancel();animation=art.animate([{transform:`translate(${dx}px,${dy}px) scale(${Math.min(1,origin.width/end.width)})`,opacity:.35},{transform:'none',opacity:1}],{duration:480,easing:'cubic-bezier(.18,.7,.18,1)'});}

  }
  if(fromKeyboard||!wasOpen)(fromKeyboard||(keyboardOpen&&!origin)?close:dialog).focus({preventScroll:true});
 }
 function collapse(){if(!dialog.open)return;animation?.cancel();dialog.close();document.body.classList.remove('listening-open');mini.hidden=!playback.state.track;document.body.classList.toggle('has-player',!!playback.state.track);signal.resize();onClose();if(returnFocus?.isConnected&&returnFocus!==document.body)returnFocus.focus({preventScroll:true});}
 // Nonmodal: the exposed orbit remains interactive; Escape also works within this document.
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open){event.preventDefault();collapse();}});
 close.addEventListener('click',collapse);dialog.addEventListener('cancel',e=>{e.preventDefault();collapse();});
 document.querySelector('.mini-open').addEventListener('click',()=>open());document.querySelector('.mini-expand').addEventListener('click',()=>open());
 for(const button of document.querySelectorAll('.transport-play'))button.addEventListener('click',()=>playback.state.status==='error'?playback.retry():playback.toggle());
 for(const input of document.querySelectorAll('.release-seek')){
  input.addEventListener('input',()=>{seekDrag=Number(input.value)/1000*playback.state.duration;input.style.setProperty('--progress',`${Number(input.value)/10}%`);for(const output of document.querySelectorAll('.release-time'))output.value=format(seekDrag);});
  input.addEventListener('change',()=>{const target=Number(input.value)/1000*playback.state.duration;seekDrag=null;playback.seek(target);});
  input.addEventListener('pointercancel',()=>{seekDrag=null;render(playback.state);});
 }
 playback.subscribe(render);
 return {open,collapse,playback};
}
