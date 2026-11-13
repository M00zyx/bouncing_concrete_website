import {createListeningView,releases} from './listening-view.js?v=keyboard-review-1';
import {journeyState,clamp} from './journey-state.js?v=street-plate-1';
import {streetOpacity} from './street-handover.js?v=1';
const journey=document.querySelector('.journey'),stage=document.querySelector('.hero'),frame=document.querySelector('.orbit-frame'),film=document.querySelector('video'),layer=document.querySelector('.film-layer'),opening=document.querySelector('.film-opening'),title=document.querySelector('.wordmark'),shade=document.querySelector('.scene-shade'),small=document.querySelector('.small-brand'),listen=document.querySelector('.listen'),cue=document.querySelector('.scroll'),loading=document.querySelector('.loading-scene'),error=document.querySelector('.scene-error');
const listening=createListeningView({onOpen:()=>{go('music');frame.contentWindow?.postMessage({type:'bc:player-view',expanded:true},location.origin);},onClose:()=>{go('music');frame.contentWindow?.postMessage({type:'bc:release-closed'},location.origin);frame.contentWindow?.postMessage({type:'bc:player-view',expanded:false},location.origin);}});
// Selection owns the one-shot pulse, independently of audio availability or buffering.
const initialRelease=document.querySelector('meta[name="bc-track"]')?.content;let initialReleaseOpened=false;
function openInitialRelease(){if(ready&&scenePainted&&!initialReleaseOpened&&releases[initialRelease]){initialReleaseOpened=true;listening.open(initialRelease);}}
const street=document.querySelector('.street-layer'),plate=document.querySelector('.street-plate');
let plateReady=plate.complete&&plate.naturalWidth>0;
plate.addEventListener('load',()=>{plateReady=true;schedule();});plate.addEventListener('error',()=>{plateReady=false;schedule();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let ready=false,started=false,failed=false,raf=0,targetTime=0,inView=true,lastMessage='',loadTimer=0,hasVideoFrame=false,decodedTime=-1,scenePainted=false,skipFilm=false;
function startScene(){if(started)return;started=true;failed=false;error.hidden=true;frame.src=new URL('./orbit/index.html',import.meta.url).href+'?embedded=1'+(new URLSearchParams(location.search).has('performance-check')?'&performance-check=1':'')+(new URLSearchParams(location.search).has('scene-check')?'&motion-check=1':'')+(new URLSearchParams(location.search).has('entry-check')?'&debris-check=1':'');loadTimer=setTimeout(()=>{if(!ready){failed=true;schedule();}},30000);}
function seek(){if(!Number.isFinite(film.duration)||film.readyState<2||film.seeking||reduced.matches)return;if(Math.abs(film.currentTime-targetTime)>1/30)film.currentTime=targetTime;}
function update(){
 raf=0;const distance=journey.offsetHeight-stage.offsetHeight,p=document.body.classList.contains('listening-open')?1:clamp(-journey.getBoundingClientRect().top/Math.max(1,distance)),state=journeyState(p,reduced.matches);
 if(p>.10)startScene();
 targetTime=state.film*Math.max(0,(film.duration||0)-.06);seek();
 // Readiness is recorded by media events, before another scroll seek starts.
 opening.style.opacity=p>.012&&hasVideoFrame&&!reduced.matches?'0':'1';
 // Do not expose an empty WebGL frame or dissolve before the last film frame arrives.
 const handoverReady=ready&&scenePainted&&(skipFilm||reduced.matches||(!film.error&&!film.seeking&&decodedTime>=Math.max(0,(film.duration||0)-.18)));
 const dissolve=handoverReady?state.dissolve:0;
 const streetAmount=handoverReady&&plateReady&&!reduced.matches?streetOpacity(state.arrival):0;
 street.style.opacity=String(streetAmount);street.style.visibility=streetAmount>0?'visible':'hidden';
 // Keep the character over the retained street; the old dark handover remains a missing-plate fallback.
 shade.style.opacity=plateReady?'0':String(1-state.reveal);layer.style.opacity=1-dissolve;layer.style.visibility=dissolve>=1?'hidden':'visible';
 title.style.opacity=state.title;title.style.setProperty('--retreat',`${-14*(1-state.title)}px`);title.style.setProperty('--title-scale',1-.03*(1-state.title));
 small.tabIndex=state.title<.1?0:-1;small.style.opacity=1-state.title;small.style.pointerEvents=state.title<.1?'auto':'none';
 for(const el of [listen,cue]){el.style.opacity=state.title;el.style.pointerEvents=state.title>.1?'auto':'none';el.tabIndex=state.title>.1?0:-1;}
 const interactive=handoverReady&&state.interactive;
 const selectable=handoverReady&&state.arrival>.64;
 frame.style.visibility=ready&&p>.70?'visible':'hidden';frame.style.pointerEvents=selectable?'auto':'none';frame.inert=!selectable;frame.tabIndex=selectable?0:-1;frame.setAttribute('aria-hidden',String(!selectable));
 layer.inert=dissolve>=1;
 loading.hidden=!(p>.012&&!handoverReady&&!failed&&(!hasVideoFrame||p>.76));loading.textContent=film.error?'The film could not load. Reload to retry, or use Listen.':!hasVideoFrame?'Loading the film…':'Opening the records…';error.hidden=!(p>.76&&failed);
 const data={type:'bc:journey',visible:inView&&!document.hidden&&p>.70,arrival:state.arrival,orbit:state.orbit,street:streetAmount,interactive};const serialized=JSON.stringify(data);
 if(ready&&serialized!==lastMessage){frame.contentWindow.postMessage(data,location.origin);lastMessage=serialized;}
 stage.dataset.progress=p.toFixed(4);stage.dataset.filmTime=film.currentTime.toFixed(3);stage.dataset.decodedTime=decodedTime.toFixed(3);stage.dataset.dissolve=dissolve.toFixed(4);stage.dataset.street=streetAmount.toFixed(4);stage.dataset.sceneReady=String(ready);stage.dataset.interactive=String(interactive);
 const out=document.querySelector('.verify output');if(out)out.textContent=JSON.stringify({progress:p.toFixed(3),film:film.currentTime.toFixed(2),ready,interactive,hidden:!inView},null,2);
}
function schedule(){if(!raf)raf=requestAnimationFrame(update);}
addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.type==='bc:render-state'){stage.dataset.renderFrames=String(event.data.frames);stage.dataset.rendering=String(event.data.running);}
if(event.data?.type==='bc:select-release'&&releases[event.data.slug]){const origin=event.data.origin,rect=frame.getBoundingClientRect();listening.open(event.data.slug,origin?{...origin,x:origin.x+rect.left,y:origin.y+rect.top}:null,event.data.keyboard===true);frame.contentWindow.postMessage({type:'bc:playback-reaction',start:true},location.origin);}
if(event.data?.type==='bc:collapse-release')listening.collapse();
if(event.data?.type==='bc:painted'){scenePainted=true;schedule();openInitialRelease();}
if(event.data?.type==='bc:ready'){ready=true;failed=false;clearTimeout(loadTimer);lastMessage='';schedule();openInitialRelease();}if(event.data?.type==='bc:error'){failed=true;schedule();}if(event.data?.type==='bc:back')go('top');});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{if(document.body.classList.contains('listening-open')||(location.hash==='#music'&&stage.dataset.progress==='1.0000'))go('music');else schedule();});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
// currentTime changes when a seek is requested; seeked confirms a decoded frame.
function frameDecoded(){if(film.readyState>=2&&!film.seeking){hasVideoFrame=true;decodedTime=film.currentTime;}schedule();}
for(const event of ['loadeddata','canplay','seeked'])film.addEventListener(event,frameDecoded);
for(const event of ['loadedmetadata','progress','error'])film.addEventListener(event,schedule);
const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();});observer.observe(stage);
function go(id){if(id==='top'||id==='music')history.replaceState(null,'',`#${id}`);if(id==='music'){skipFilm=true;startScene();scrollTo({top:journey.offsetTop+journey.offsetHeight-stage.offsetHeight,behavior:'instant'});}else if(id==='top'){skipFilm=false;scrollTo({top:0,behavior:'instant'});}else document.getElementById(id)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});schedule();}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;event.preventDefault();const id=link.hash.slice(1);history.replaceState(null,'',`#${id}`);go(id);});
cue.addEventListener('click',()=>scrollTo({top:stage.offsetHeight*.45,behavior:reduced.matches?'instant':'smooth'}));
document.querySelector('#retry').onclick=()=>{started=false;ready=false;scenePainted=false;startScene();schedule();};
if(new URLSearchParams(location.search).has('journey-check')){const panel=document.createElement('aside');panel.className='verify';for(const [label,progress] of [['Opening',0],['Film midpoint',.40],['Film ending',.76],['Dissolve',.815],['Street character',.85],['Street receding',.885],['Fragments',.90],['Wreckage',.925],['First records',.95],['All records',.98],['Explore',1]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>scrollTo({top:(journey.offsetHeight-stage.offsetHeight)*progress,behavior:'instant'});panel.append(b);}const close=document.createElement('button');close.textContent='Hide checks';close.onclick=()=>panel.remove();panel.append(close,document.createElement('output'));document.body.append(panel);}
if(initialRelease&&releases[initialRelease])requestAnimationFrame(()=>go('music'));else if(location.hash)requestAnimationFrame(()=>go(location.hash.slice(1)));schedule();
