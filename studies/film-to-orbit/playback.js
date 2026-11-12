// One transport owns audio; opening/closing views never creates or stops a source.
export function createPlayback({audio,cloudFrame,getCloud=()=>window.SC,onSignalReset=()=>{}}){
 const state={track:null,status:'idle',position:0,duration:0,error:'',mode:null};
 const listeners=new Set();let revision=0,cloud=null,cloudReady=false,cloudWanted=false,cloudConfirmed=false,timer=0,context=null,analyser=null,source=null;
 const emit=()=>listeners.forEach(fn=>fn({...state}));
 function fail(message){state.status='error';state.error=message;emit();}
 function ensureGraph(){
  if(!context){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;context=new Context();analyser=context.createAnalyser();analyser.fftSize=1024;analyser.smoothingTimeConstant=0;source=context.createMediaElementSource(audio);source.connect(analyser);analyser.connect(context.destination);}
  context.resume().catch(()=>{});
 }
 function cloudStart(){if(!cloudReady||state.mode!=='cloud')return;cloud.play();}
 function loadCloud(track){
  cloudReady=false;cloudConfirmed=false;cloudWanted=true;
  const api=getCloud();if(!api){fail('SoundCloud is unavailable. Open the track on SoundCloud.');return;}
  if(!cloud){
   cloudFrame.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.url)}&auto_play=false&show_artwork=false`;
   cloud=api.Widget(cloudFrame);
   cloud.bind(api.Widget.Events.READY,()=>{cloudReady=true;if(state.mode==='cloud'&&cloudWanted)cloudStart();});
   cloud.bind(api.Widget.Events.PLAY,()=>{if(state.mode!=='cloud'||!cloudWanted){cloud.pause();return;}const requested=revision;cloud.getCurrentSound(sound=>{if(requested!==revision||state.mode!=='cloud')return;if(sound?.title?.toLowerCase()!==state.track.title.toLowerCase()){cloud.pause();fail('Open the track on SoundCloud to continue.');return;}cloudConfirmed=true;state.duration=sound.duration/1000;state.status='playing';state.error='';clearTimeout(timer);emit();});});
   cloud.bind(api.Widget.Events.PAUSE,()=>{if(state.mode==='cloud'&&cloudConfirmed&&state.status!=='ended'){state.status='paused';emit();}});
   cloud.bind(api.Widget.Events.FINISH,()=>{if(state.mode==='cloud'){cloudWanted=false;cloud.pause();state.status='ended';state.position=state.duration;emit();}});
   cloud.bind(api.Widget.Events.PLAY_PROGRESS,event=>{if(state.mode==='cloud'&&cloudConfirmed){state.position=event.currentPosition/1000;emit();}});
   cloud.bind(api.Widget.Events.ERROR,()=>{if(state.mode==='cloud')fail('Playback is unavailable. Open the track on SoundCloud.');});
  }else{const requested=revision;cloud.load(track.url,{auto_play:false,callback:()=>{if(requested!==revision||state.mode!=='cloud')return;cloudReady=true;if(cloudWanted)cloudStart();}});}
  clearTimeout(timer);timer=setTimeout(()=>{if(state.mode==='cloud'&&state.status==='loading'){state.status='paused';state.error='Press Play to start, or listen on SoundCloud.';emit();}},8000);
 }
 async function play(){
  if(!state.track)return;
  state.error='';
  if(state.mode==='cloud'){cloudWanted=true;cloudStart();return;}
  const requested=revision;
  if(audio.ended)audio.currentTime=0;
  ensureGraph();
  try{await audio.play();}catch(error){if(requested!==revision)return;if(error.name==='AbortError')return;state.status='paused';state.error=error.name==='NotAllowedError'?'Press Play to start.':'Audio could not load. Try Play again or open SoundCloud.';emit();}
 }
 function pause(){if(state.mode==='native')audio.pause();else{cloudWanted=false;cloud?.pause();state.status='paused';emit();}}
 function select(track){
  if(state.track?.slug===track.slug){if(state.status!=='playing')play();return;}
  revision++;clearTimeout(timer);cloudWanted=false;cloudConfirmed=false;audio.pause();cloud?.pause();
  Object.assign(state,{track,status:'loading',position:0,duration:track.duration||0,error:'',mode:track.audio?'native':'cloud'});onSignalReset();emit();
  if(track.audio){audio.src=track.audio;audio.load();play();}else loadCloud(track);
 }
 function seek(seconds){if(!state.track||!Number.isFinite(seconds))return;const target=Math.max(0,Math.min(seconds,state.duration||0));state.position=target;onSignalReset();if(state.mode==='native')audio.currentTime=target;else cloud?.seekTo(target*1000);emit();}
 for(const name of ['loadedmetadata','durationchange'])audio.addEventListener(name,()=>{if(state.mode==='native'&&Number.isFinite(audio.duration)){state.duration=audio.duration;emit();}});
 audio.addEventListener('playing',()=>{if(state.mode==='native'){ensureGraph();state.status='playing';state.error='';emit();}});
 audio.addEventListener('pause',()=>{if(audio.paused)context?.suspend?.().catch(()=>{});if(state.mode==='native'&&!audio.ended){state.status='paused';emit();}});
 audio.addEventListener('waiting',()=>{if(state.mode==='native'&&!audio.paused){state.status='buffering';emit();}});
 audio.addEventListener('timeupdate',()=>{if(state.mode==='native'){state.position=audio.currentTime;emit();}});
 audio.addEventListener('ended',()=>{if(state.mode==='native'){state.status='ended';state.position=state.duration;emit();}});
 audio.addEventListener('error',()=>{if(state.mode==='native')fail('Audio could not load. Try Play again or open SoundCloud.');});
 return {state,select,play,pause,seek,toggle:()=>state.status==='playing'||state.status==='buffering'?pause():play(),subscribe(fn){listeners.add(fn);fn({...state});return()=>listeners.delete(fn);},getAnalyser:()=>state.mode==='native'?analyser:null};
}
