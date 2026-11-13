import {accelerateRaycast} from './raycast-grid.js';
import {createPerformanceReview} from './performance-review.js';
import {catalogue,sampleSleeveCanvas} from '../catalogue.js';
import * as THREE from 'three';
import {createCharacterAwareness} from './character-awareness.js?v=vertical-2';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createSphereSpacing, sphericalPose } from './sphere-spacing.js?v=2';
import { titleCanvas } from './typography.js';
import { createOrbitalDebris } from './orbital-debris.js?v=discovery-1';
import { createGroupSteering, aimSphereGroup, cursorSpherePoint } from './group-steering.js?v=cursor-center-1';

import {trackEntry,entryLongitude} from './entry-sequence.js?v=1';
import {createDebrisEntrance} from './debris-entrance.js?v=discovery-1';

import {streetExposure} from '../street-handover.js?v=1';
const embedded=new URLSearchParams(location.search).has('embedded');
const entrance={visible:!embedded,arrival:embedded?0:1,orbit:embedded?0:1,interactive:!embedded,street:0};
let renderFrame=0,renderCount=0;
let debrisEntrance=null;
const tracks = catalogue.map(track=>({...track}));
const host = document.querySelector('#space');
const loading = document.querySelector('#loading');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let driftPaused = reducedMotion.matches;
let selected = null;
let hovered = null;
let model = null;
let modelReady = false;
let labelsReady = false;
let sphereSpacing=null;
let aimReady=false;
const handoff={track:null,since:0};
let drag = null;
let lastTouchTime = 0;
let gestureDistance = 0;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const cameraGoal = new THREE.Vector3();
const lookGoal = new THREE.Vector3();
const currentLook = new THREE.Vector3();
const orbit = {x:0,y:0};
const meshes = [];
const labels = [];
const textureLoader = new THREE.TextureLoader();
const ink = new THREE.Color(0x20231e);
const blue = new THREE.Color(0x1736df);
let previousFrame = performance.now();
let driftTime = 0;
let pointerInside=false;
let lastPointerMove=-Infinity;
let lastPointerX=0,lastPointerY=0;
let pressedTrack=null;
let entrancePress=null;
let lastHoverCheck=0;
const explore={strength:0,target:null,anchor:null,lastSwitch:0,intent:null,intentDX:0,intentDY:0,intentX:0,intentY:0,docked:false,dockX:0,dockY:0,captureX:0,captureY:0,captureSettled:false,released:null,releaseUntil:0};
const steerGoal=new THREE.Quaternion();
const turn=new THREE.Quaternion();
const aimEuler=new THREE.Euler(0,0,0,'YXZ');
const targetWorld=new THREE.Vector3();
const cursorWorld=new THREE.Vector3();
const projected=new THREE.Vector3();
const orbitShell=new THREE.Sphere(new THREE.Vector3(),4.3);
const cursorEvent={clientX:0,clientY:0};

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:embedded});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
host.append(renderer.domElement);
renderer.domElement.setAttribute('aria-hidden','true');
const scene = new THREE.Scene();
const constellation=new THREE.Group();
scene.add(constellation);
const debris=createOrbitalDebris(constellation);
let discoveryName=null,lastDiscoveryCheck=0;
const discoveryRay=new THREE.Raycaster(),discoveryNdc=new THREE.Vector2(),discoveryBlock=new THREE.Sphere(new THREE.Vector3(),1.85),discoveryBlockPoint=new THREE.Vector3();
function updateDiscoveries(delta,now){
 const allowed=pointerInside&&!drag&&!hovered&&(!explore.target||magneticDistance(cursorEvent)>60)&&entrance.interactive&&!reducedMotion.matches&&!driftPaused&&debris.reactionAge.value<0;
 if(!allowed)discoveryName=null;
 else if(now-lastDiscoveryCheck>90){
  lastDiscoveryCheck=now;discoveryName=null;
  discoveryNdc.set(cursorEvent.clientX/innerWidth*2-1,1-cursorEvent.clientY/innerHeight*2);
  discoveryRay.setFromCamera(discoveryNdc,camera);debris.group.updateMatrixWorld(true);
  const hit=discoveryRay.intersectObject(debris.group,true)[0];
  const blocked=discoveryRay.ray.intersectSphere(discoveryBlock,discoveryBlockPoint);
  if(hit&&(!blocked||discoveryBlockPoint.distanceTo(camera.position)>hit.distance)){
   const part=hit.object.geometry.getAttribute('entryPart');
   const code=part&&!hit.object.isInstancedMesh?part.getW(hit.face.a):0;
   if(Math.abs(code-.48)<.001)discoveryName='wheel';
   if(Math.abs(code-.44)<.001)discoveryName='sign';
  }
 }
 if(document.body.dataset.discovery!==(discoveryName||'none'))document.body.dataset.discovery=discoveryName||'none';
 const weight=1-Math.exp(-delta*4);
 const v=debris.discovery.value;
 v.x+=( (discoveryName==='wheel'?.65:0)-v.x)*weight;
 v.y+=( (discoveryName==='sign'?-.38:0)-v.y)*weight;
 if(reducedMotion.matches||!entrance.interactive){v.set(0,0);}
}
if(embedded)fetch('assets/debris-entry-parts.json').then(r=>{if(!r.ok)throw new Error('Missing debris entrance metadata');return r.json();}).then(parts=>{debrisEntrance=createDebrisEntrance(debris,parts);}).catch(()=>{debris.stats.entranceFallback=true;});
const orbitBackground=new THREE.Color('#eff0ec');
scene.background = embedded?null:orbitBackground;
scene.fog = new THREE.Fog('#eff0ec',16,40);
function fieldOfView() { return innerWidth/innerHeight>=1.25?78:96; }
const camera = new THREE.PerspectiveCamera(fieldOfView(),innerWidth/innerHeight,.1,100);
const compact = () => innerWidth < 650;
function radius() {
  // Fit the complete orbital envelope, including the sleeves, inside the frame.
  const aspect=innerWidth/innerHeight;
  const envelope=compact()?3.65:4.8;
  const horizontal=Math.tan(THREE.MathUtils.degToRad(fieldOfView()/2))*Math.min(aspect*.88,.82);
  return Math.max(compact()?8.7:6.8,envelope*Math.sqrt(1+1/(horizontal*horizontal)));
}
camera.position.set(0,.25,radius());
const groupSteering=createGroupSteering();
const fill=new THREE.HemisphereLight(0xffffff,0x717987,1.8);scene.add(fill);
const key = new THREE.DirectionalLight(0xffffff,3.2);
key.position.set(-4,7,6);
key.castShadow = true;
key.shadow.mapSize.set(1024,1024);
Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:30});
key.shadow.normalBias = .025;
key.shadow.bias = -.0002;
key.shadow.radius = 4;
scene.add(key);
const rim = new THREE.DirectionalLight(0xcdd6ff,1.4);
rim.position.set(4,3,-3);
scene.add(rim);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.ShadowMaterial({color:0x101714,opacity:.42}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -3.65;
ground.receiveShadow = true;
ground.material.transparent=true;
// The stage receives shadows without cutting through low orbital labels.
ground.material.depthWrite=false;
ground.renderOrder=-1;
scene.add(ground);
const character = new THREE.Group();
const awareness=createCharacterAwareness(),attentionPoint=new THREE.Vector3();
let appliedYaw=0,appliedPitch=0,attentionTrack=null,attentionUntil=0;
character.rotation.set(.506,0,.052);
scene.add(character);

function finishLoading() {
  if (modelReady && labelsReady) { loading.hidden = true; if(embedded)parent.postMessage({type:'bc:ready'},location.origin); }
}
new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/concrete-blob-rounded.glb?v=rounded-1',gltf => {
  model = gltf.scene;
  const bounds = new THREE.Box3().setFromObject(model);
  // Preserve the original character's framing after editing its lower contour.
  const reference = gltf.parser.json.asset.extras?.referenceFrame;
  const center = reference ? new THREE.Vector3(...reference.center) : bounds.getCenter(new THREE.Vector3());
  const scale = 3.6 / (reference?.height ?? bounds.getSize(new THREE.Vector3()).y);
  model.scale.setScalar(scale);
  model.position.copy(center.multiplyScalar(-scale));
  model.traverse(node => {if(node.isMesh){node.castShadow=true;node.receiveShadow=true;const start=performance.now();node.userData.raycastGrid=accelerateRaycast(node,THREE);if(node.userData.raycastGrid)node.userData.raycastGrid.buildMs=performance.now()-start;}});
  character.add(model);
  modelReady = true;
  finishLoading();
},undefined,() => {
  loading.classList.add('error');
  loading.textContent = 'The character could not load. Reload to try again, or open Tracks.';
  if(embedded)parent.postMessage({type:'bc:error'},location.origin);
});

// Sample sleeves are deliberately typographic placeholders, never implied releases.
function sampleSleeve(track,index) {
  const canvas=sampleSleeveCanvas(track);
  track.previewSleeve=canvas.toDataURL();
  if(track.thumbnail)track.thumbnail.src=track.previewSleeve;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
function sphericalBand(width,height,radius) {
  const geometry=new THREE.PlaneGeometry(width,height,64,10);
  const position=geometry.attributes.position;
  for(let i=0;i<position.count;i++) {
    const longitude=position.getX(i)/radius;
    const latitude=position.getY(i)/radius;
    position.setXYZ(i,radius*Math.cos(latitude)*Math.sin(longitude),radius*Math.sin(latitude),radius*(Math.cos(latitude)*Math.cos(longitude)-1));
  }
  geometry.computeVertexNormals();
  return geometry;
}
// The four identical edge faces and two printed faces need only two draws.
// Shared geometry preserves the original UVs, dimensions and picking bounds.
const sleeveGeometry=new THREE.BoxGeometry(1.08,1.08,.045);
sleeveGeometry.clearGroups();sleeveGeometry.addGroup(0,24,0);sleeveGeometry.addGroup(24,12,1);
const sleeveEdgeMaterial=new THREE.MeshStandardMaterial({color:0x25272a,roughness:.75});
const markerGeometry=new THREE.PlaneGeometry(.35,.045);
const markerMaterial=new THREE.MeshBasicMaterial({color:0xffd900,side:THREE.DoubleSide,toneMapped:false});
function makeText(track,index) {
  const {canvas,context}=titleCanvas(track.lines);
  // Preserve glyph size while adding real transparent clearance on every side.
  const unitsPerPixel=track.height/195;
  const textureHeight=canvas.height*unitsPerPixel;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const width=canvas.width*unitsPerPixel;
  const coverSize=1.08;
  const shellRadius=4.05+(index%3)*.19;
  const group=new THREE.Group();
  group.userData={track,phase:track.phase,index,shellRadius,baseMatrix:new THREE.Matrix4()};
  track.group=group;
  const material=new THREE.MeshBasicMaterial({map:texture,color:ink,transparent:true,alphaTest:.08,toneMapped:false,fog:false,side:THREE.DoubleSide});
  group.userData.textTexture=texture;
  const geometry=sphericalBand(width,textureHeight,shellRadius);
  const front=new THREE.Mesh(geometry,material);
  front.userData={track,canvas,context,texture};group.add(front);labels.push(front);
  const coverMap=track.sleeve?textureLoader.load(track.sleeve):sampleSleeve(track,index);
  coverMap.colorSpace=THREE.SRGBColorSpace;
  coverMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const coverMaterial=new THREE.MeshBasicMaterial({map:coverMap,toneMapped:false,fog:false});
  const sleeve=new THREE.Mesh(sleeveGeometry,[sleeveEdgeMaterial,coverMaterial]);
  const coverAngle=-(width/2+.26+coverSize/2)/shellRadius;
  sleeve.position.set(Math.sin(coverAngle)*shellRadius,0,(Math.cos(coverAngle)-1)*shellRadius);
  sleeve.rotation.y=coverAngle;
  sleeve.userData={track,solid:true};
  group.add(sleeve);
  const marker=new THREE.Mesh(markerGeometry,markerMaterial);
  const markerAngle=(-width/2+.18)/shellRadius;
  marker.position.set(Math.sin(markerAngle)*shellRadius,-track.height/2-.1,(Math.cos(markerAngle)-1)*shellRadius+.025);
  marker.rotation.y=markerAngle;
  marker.userData={track,solid:true};group.add(marker);
  group.userData.anchors=[sleeve.position.clone()];
  for(const t of [-.36,-.18,0,.18,.36]) {
    const angle=width*t/shellRadius;
    group.userData.anchors.push(new THREE.Vector3(Math.sin(angle)*shellRadius,0,(Math.cos(angle)-1)*shellRadius));
  }
  constellation.add(group);meshes.push(group);
}
Promise.all([document.fonts.load('150px Anton'),document.fonts.load('17px "DM Mono"')]).then(()=>{
  tracks.forEach(makeText);
  sphereSpacing=createSphereSpacing(meshes);
  arrangeTitles();labelsReady=true;finishLoading();
});

const list = document.querySelector('#track-list');
tracks.forEach(track => {
  const button = document.createElement('button');
  button.className = 'track-choice';
  const title = document.createElement('strong');
  title.textContent = track.title;
  const note = document.createElement('small');
  note.textContent = !track.sample ? 'Listen ↗' : 'Sample';
  const thumbnail=document.createElement('img');
  thumbnail.alt='';
  if(track.sleeve)thumbnail.src=track.sleeve;
  track.thumbnail=thumbnail;
  button.append(thumbnail,title,note);
  button.addEventListener('click',event => selectTrack(track,{keyboard:event.detail===0}));
  list.append(button);
  track.button = button;
});
const menu = document.querySelector('#menu');
const panel = document.querySelector('#tracks');
function toggleMenu(open) {
  panel.hidden = !open;
  menu.setAttribute('aria-expanded',String(open));
}
menu.addEventListener('click',event => {const open=panel.hidden;toggleMenu(open);if(open&&event.detail===0)(selected?.button||tracks[0].button).focus();});
document.querySelector('#list-close').addEventListener('click',() => {toggleMenu(false);menu.focus();});

const selection = document.querySelector('#selection');
const playButton = document.querySelector('#play');
const audioStatus = document.querySelector('#audio-status');
const seek = document.querySelector('#seek');
const timeLabel = document.querySelector('#clock');
let playerReady = false;
let playing = false;
let activeAudio = null;
let pendingAudio = null;
let duration = 0;
let isSeeking = false;
let soundIndices = new Map();
let audioTimer;
const widget = embedded?null:window.SC?.Widget(document.querySelector('#engine')); 

function setPlaying(value) {
  playing=value;
  playButton.textContent=value?'Pause':'Play';
}
function formatTime(ms) {
  const seconds=Math.floor(ms/1000);
  return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function requestAudio(track) {
  if (!widget) {audioStatus.textContent='Open SoundCloud to listen.';return;}
  if (!playerReady) {pendingAudio=track;return;}
  if (activeAudio===track.slug) {
    widget.play();
    return;
  }
  activeAudio=track.slug;
  duration=0;
  seek.value=0;
  timeLabel.textContent='0:00';
  playButton.disabled=true;
  playButton.textContent='Loading…';
  audioStatus.textContent='';
  widget.pause();
  widget.skip(soundIndices.get(track.title.toLowerCase()) ?? track.index);
  widget.play();
  clearTimeout(audioTimer);
  audioTimer=setTimeout(() => {
    if(selected===track && !playing){
      playButton.disabled=false;
      playButton.textContent='Play';
      audioStatus.textContent='Press Play to start, or listen on SoundCloud.';
    }
  },7000);
}
if (widget) {
  const events=SC.Widget.Events;
  widget.bind(events.READY,() => {
    widget.getSounds(sounds => {
      soundIndices=new Map(sounds.map((sound,index) => [sound.title.toLowerCase(),index]));
      playerReady=true;
      if(pendingAudio){const track=pendingAudio;pendingAudio=null;requestAudio(track);}
    });
  });
  widget.bind(events.PLAY,() => {
    if (!selected?.slug) {widget.pause();return;}
    widget.getCurrentSound(sound => {
      if(!selected?.slug || sound.title.toLowerCase()!==selected.title.toLowerCase()) return;
      duration=sound.duration;
      clearTimeout(audioTimer);
      audioStatus.textContent='';
      playButton.disabled=false;
      setPlaying(true);
    });
  });
  widget.bind(events.PAUSE,() => setPlaying(false));
  widget.bind(events.FINISH,() => {setPlaying(false);widget.pause();});
  widget.bind(events.PLAY_PROGRESS,event => {
    if (!selected?.slug || isSeeking) return;
    timeLabel.textContent=formatTime(event.currentPosition);
    if(duration) seek.value=event.currentPosition/duration*1000;
  });
  widget.bind(events.ERROR,() => {
    setPlaying(false);
    playButton.disabled=false;
    audioStatus.textContent='Playback is unavailable. Open the track on SoundCloud.';
  });
}
playButton.addEventListener('click',() => {if(widget) playing?widget.pause():widget.play();});
seek.addEventListener('pointerdown',() => {isSeeking=true;});
seek.addEventListener('input',() => {isSeeking=true;timeLabel.textContent=formatTime(Number(seek.value)/1000*duration);});
seek.addEventListener('change',() => {widget?.seekTo(Number(seek.value)/1000*duration);isSeeking=false;});
seek.addEventListener('pointercancel',() => {isSeeking=false;});

let selectionFromKeyboard=false;
function selectTrack(track,{keyboard=false}={}) {
  selectionFromKeyboard=keyboard;
  attentionTrack=track;attentionUntil=performance.now()+900;awareness.select(performance.now());
  selected=track;
  if(embedded){
    toggleMenu(false);selection.hidden=true;
    tracks.forEach(item=>item.button.setAttribute('aria-current',String(item===track)));
    hovered=null;explore.target=null;pointerInside=false;
    const sleeve=track.group?.children.find(child=>child.geometry?.type==='BoxGeometry');
    let origin=null;
    if(sleeve){const box=new THREE.Box3().setFromObject(sleeve),points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));const xs=points.map(p=>(p.x+1)*innerWidth/2),ys=points.map(p=>(1-p.y)*innerHeight/2);origin={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}
    parent.postMessage({type:'bc:select-release',slug:track.slug,origin,keyboard},location.origin);
    return;
  }
  toggleMenu(false);
  selection.hidden=false;
  document.querySelector('#title').textContent=track.title;
  document.querySelector('#kind').textContent=!track.sample?'Bouncing Concrete':'Spatial study';
  const sleeve=document.querySelector('#sleeve');
  sleeve.hidden=false;
  sleeve.src=track.sleeve?track.sleeve:track.previewSleeve;
  sleeve.alt=track.title+(track.sleeve?' sleeve':' sample sleeve');
  document.querySelector('#sample-note').hidden=!track.sample;
  document.querySelector('#audio-controls').hidden=track.sample;
  audioStatus.textContent='';
  tracks.forEach(item => item.button.setAttribute('aria-current',String(item===track)));
  // Keep the viewpoint steady: selecting a moving release must not teleport it.
  hovered=null;explore.target=null;
  if(!track.sample){
    document.querySelector('#source').href='https://soundcloud.com/moo-497939951/'+track.slug;
    requestAudio(track);
  }else{pendingAudio=null;widget?.pause();}
}
function closeSelection() {
  selection.hidden=true;
  selected=null;
  pendingAudio=null;
  widget?.pause();
  tracks.forEach(item => item.button.setAttribute('aria-current','false'));
}
document.querySelector('#close').addEventListener('click',closeSelection);
document.querySelector('#reset').addEventListener('click',() => {sphereSpacing?.reset();orbit.x=0;orbit.y=0;pointer.set(0,0);driftTime=0;steerGoal.identity();constellation.quaternion.identity();groupSteering.reset();explore.strength=0;explore.intent=null;explore.docked=false;explore.released=null;explore.releaseUntil=0;explore.target=null;lastPointerMove=-Infinity;meshes.forEach(group=>{group.userData.phase=group.userData.track.phase;});hovered=null;closeSelection();toggleMenu(false);});
const driftButton=document.querySelector('#motion');
function updateMotion() {
  driftButton.textContent=driftPaused?'Resume motion':'Pause motion';
  driftButton.setAttribute('aria-pressed',String(driftPaused));
}
updateMotion();
driftButton.addEventListener('click',() => {driftPaused=!driftPaused;explore.target=null;steerGoal.copy(constellation.quaternion);groupSteering.reset();updateMotion();});
reducedMotion.addEventListener('change',() => {driftPaused=reducedMotion.matches;updateMotion();});
addEventListener('keydown',event => {
  if(event.key==='Escape'){event.preventDefault();if(!panel.hidden){toggleMenu(false);menu.focus();return;}closeSelection();hovered=null;if(embedded&&document.body.classList.contains('release-expanded'))parent.postMessage({type:'bc:collapse-release'},location.origin);else menu.focus();}
});

function pick(event){if(!performanceReview)return pickRaw(event);const start=performance.now();const result=pickRaw(event);performanceReview.pick(performance.now()-start);return result;}
function pickRaw(event) {
  const box=host.getBoundingClientRect();
  const ndc=new THREE.Vector2((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);
  raycaster.setFromCamera(ndc,camera);
  let hits=raycaster.intersectObjects(model?[...meshes.filter(g=>g.visible),character]:meshes.filter(g=>g.visible),true);
  for(const hit of hits){
    if(!hit.object.userData.track)return null;
    if(hit.object.userData.solid)return hit.object.userData.track;
    const {canvas,context,texture}=hit.object.userData;
    const u=texture.repeat.x<0?1-hit.uv.x:hit.uv.x;
    const x=Math.floor(THREE.MathUtils.clamp(u,0,.999)*canvas.width);
    const y=Math.floor((1-THREE.MathUtils.clamp(hit.uv.y,.001,1))*canvas.height);
    // Every visible title has a stable hit area including inter-letter spaces.
    // Giving only the old owner that padding made foreground choices flicker.
    const insideInkBounds=x>=32 && x<canvas.width-32 && y>=32 && y<canvas.height-32;
    if(context.getImageData(x,y,1,1).data[3]>15 || insideInkBounds)return hit.object.userData.track;
  }
  return null;
}
host.addEventListener('pointerdown',event => {
  if(embedded&&!entrance.interactive){pressedTrack=pick(event);entrancePress={x:event.clientX,y:event.clientY};gestureDistance=0;return;}
  // An explicit click may choose another visible title; proximity alone may not.
  pressedTrack=pick(event)||trackAtPointer(event);
  handoff.track=null;
  explore.target=null;
  steerGoal.copy(constellation.quaternion);groupSteering.reset();
  drag={x:event.clientX,y:event.clientY,id:event.pointerId};
  gestureDistance=0;
  if(event.isTrusted)host.setPointerCapture(event.pointerId);
  if(event.pointerType==='touch')lastTouchTime=performance.now();
});
host.addEventListener('pointermove',event=>{
  if(embedded&&!entrance.interactive){if(entrancePress)gestureDistance=Math.max(gestureDistance,Math.hypot(event.clientX-entrancePress.x,event.clientY-entrancePress.y));host.style.cursor=pick(event)?'pointer':'default';return;}
  cursorEvent.clientX=event.clientX;cursorEvent.clientY=event.clientY;
  pointer.set(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1);
  if(drag) {
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    gestureDistance+=Math.hypot(dx,dy);
    orbit.x=THREE.MathUtils.clamp(orbit.x-dx*.0035,-.72,.72);
    orbit.y=THREE.MathUtils.clamp(orbit.y+dy*.002,-.15,.2);
    drag.x=event.clientX;drag.y=event.clientY;hovered=null;
  } else if(event.pointerType!=='touch') {
    const dx=pointerInside?event.clientX-lastPointerX:0;
    const dy=pointerInside?event.clientY-lastPointerY:0;
    pointerInside=true;
    const distance=Math.hypot(dx,dy);
    if(distance>1) {
      if(performance.now()-lastPointerMove>220)explore.intent=null;
      lastPointerMove=performance.now();
      if(explore.target && explore.captureSettled) {
        const visible=pick(event);
        const moved=Math.hypot(event.clientX-explore.dockX,event.clientY-explore.dockY)>18;
        if(moved && visible && visible!==explore.target) {
          if(handoff.track!==visible){handoff.track=visible;handoff.since=performance.now();}
        } else handoff.track=null;
        // Ownership is pinned to the capture point, not the moving label. This
        // prevents neighbours stealing focus and still permits a slow release.
        const reach=stickyReach(),reachY=reach*.6,reachX=reach*.7;
        // Independent axis ranges: shorten vertical ownership without changing horizontal reach.
        if(Math.hypot((event.clientX-explore.captureX)/reachX,(event.clientY-explore.captureY)/reachY)>1) {
          explore.released=explore.target;explore.releaseUntil=performance.now()+450;
          explore.docked=false;explore.target=null;explore.intent=null;
          steerGoal.copy(constellation.quaternion);groupSteering.reset();
        } else if(explore.docked && Math.hypot(event.clientX-explore.dockX,event.clientY-explore.dockY)>3) {
          // A small movement wakes the same owner without restarting its spring.
          explore.docked=false;
        }
      }
      if(!explore.target || !explore.captureSettled)chooseMagnet(event,dx,dy);
      if(!explore.target && !driftPaused && !reducedMotion.matches) {
        aimEuler.set(-dy*.0014,dx*.0022,0,'YXZ');
        steerGoal.premultiply(turn.setFromEuler(aimEuler));
      }
    }
    lastPointerX=event.clientX;lastPointerY=event.clientY;
    hovered=trackAtPointer(event);
    host.style.cursor=hovered||magneticDistance(cursorEvent)<28?'pointer':'grab';
  }
});
host.addEventListener('pointerup',event => {
  entrancePress=null;
  if(gestureDistance<7){const track=pressedTrack;if(track)selectTrack(track);}
  pressedTrack=null;
  drag=null;
  if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);
});
host.addEventListener('pointercancel',() => {drag=null;pressedTrack=null;entrancePress=null;});
host.addEventListener('pointerleave',()=>{pointerInside=false;explore.intent=null;explore.docked=false;explore.target=null;lastPointerMove=-Infinity;steerGoal.copy(constellation.quaternion);groupSteering.reset();if(!drag){pointer.set(0,0);hovered=null;}});
function spacingOptions(){return {camera,parentRotation:constellation.quaternion,scale:compact()?.73:1,width:innerWidth,height:innerHeight,owner:explore.target,protectedTracks:[handoff.track,(!explore.target||Math.hypot(cursorEvent.clientX-explore.captureX,cursorEvent.clientY-explore.captureY)>18)?hovered:null],paused:driftPaused||reducedMotion.matches||!!drag||!entrance.interactive,settled:groupSteering.speed()<.4&&!handoff.track};}
function arrangeTitles(delta=0) {
  sphereSpacing?.update(delta,spacingOptions());
  meshes.forEach(group=>{
    const {track,index,shellRadius}=group.userData;
    if(!driftPaused && !drag && hovered!==track) {
      // Exploration steers one rigid group. Ease out the independent idle drift
      // while attracting, then resume each original orbital speed afterward.
      const drift=explore.target?1-explore.strength:1;
      group.userData.phase+=(entrance.interactive?delta:0)*track.speed*drift;
    }
    const scale=compact()?.73:1;
    const spacing=group.userData.spacing||{x:0,y:0};
    // Offsets are latitude/longitude on the same shell, never detached XYZ nudges.
    const entry=embedded?trackEntry(entrance.arrival,index,tracks.length):1;
    group.userData.entry=entry;group.visible=entry>0;
    const entryAngle=entryLongitude(group.userData.phase,entry);
    sphericalPose(group,spacing.x+entryAngle,spacing.y,scale,group.position,group.quaternion);
    group.scale.setScalar(scale);
    group.updateMatrix();group.userData.baseMatrix.copy(group.matrix);
    // Reverse the entire word on the rear half, not individual curved faces.
    // This keeps the lettering continuous as it crosses the sphere's silhouette.
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(group.quaternion).applyQuaternion(constellation.quaternion);
    const back=normal.dot(camera.position)<0;
    group.userData.textTexture.repeat.x=back?-1:1;
    group.userData.textTexture.offset.x=back?1:0;
  });
}
// Choose what the pointer is approaching in screen space. Hysteresis prevents
// neighbouring ribbons from stealing focus while the user is about to click.
function stickyReach(){return Math.min(100.8,innerWidth*.1344);}
function chooseMagnet(event,dx,dy) {
  if(driftPaused || reducedMotion.matches || !labelsReady)return;
  const travel=Math.max(1,Math.hypot(dx,dy));
  const ux=dx/travel,uy=dy/travel;
  const changedDirection=explore.intent && ux*explore.intentDX+uy*explore.intentDY<.25
    && Math.hypot(event.clientX-explore.intentX,event.clientY-explore.intentY)>24;
  if(!explore.intent || changedDirection) {
    // Remember where the user saw each track at the start of their approach.
    // The scene's own rotation must not let another label steal that intent.
    explore.intent=[];explore.intentDX=ux;explore.intentDY=uy;
    explore.intentX=event.clientX;explore.intentY=event.clientY;
    constellation.updateMatrixWorld(true);
    const centre=new THREE.Vector3().project(camera);
    const cx=(centre.x+1)*innerWidth/2,cy=(1-centre.y)*innerHeight/2;
    for(const group of meshes)for(const anchor of group.userData.anchors) {
      targetWorld.copy(anchor);group.localToWorld(targetWorld);
      projected.copy(targetWorld).project(camera);
      const x=(projected.x+1)*innerWidth/2,y=(1-projected.y)*innerHeight/2;
      if(projected.z>1 || projected.z<0 || y<75 || y>innerHeight-65)continue;
      if(targetWorld.z<-.5 && Math.hypot(x-cx,y-cy)<innerHeight*.11)continue;
      explore.intent.push({track:group.userData.track,anchor:anchor.clone(),x,y});
    }
  }
  const reach=Math.min(210,innerWidth*.25);
  let best=null;
  for(const item of explore.intent) {
    if(item.track===explore.released && performance.now()<explore.releaseUntil)continue;
    const px=item.x-event.clientX,py=item.y-event.clientY;
    const distance=Math.hypot(px,py),along=px*ux+py*uy,across=Math.abs(px*uy-py*ux);
    const corridor=along>20 && along<420 && across<65;
    if(distance>reach && !corridor)continue;
    const approach=along/Math.max(1,distance);
    const retained=explore.target===item.track;
    const score=(distance*.8+across*.2)*(retained?.88:1)-Math.max(0,approach)*65+(along<-15?90:0);
    if(!best || score<best.score)best={...item,score,distance};
  }
  if(best) {
    if(best.track!==explore.target && performance.now()-explore.lastSwitch<120)return;
    if(best.track!==explore.target){
      aimReady=false;handoff.track=null;
      explore.lastSwitch=performance.now();
      explore.captureX=event.clientX;explore.captureY=event.clientY;explore.captureSettled=false;
      // Approach anchors choose the track; its title centre is always the destination.
      explore.anchor=new THREE.Vector3();
      explore.docked=false;
    }
    explore.target=best.track;
  } else explore.target=null;
}
function trackAtPointer(event) {
  // A visible label always owns its actual pixels, even inside another title's
  // sticky range. Magnetism only fills empty space around the current owner.
  const visible=pick(event);
  if(visible)return visible;
  return magneticDistance(event)<(explore.docked?48:38)?explore.target:null;
}
function magneticDistance(event) {
  if(!explore.target || !explore.anchor || explore.strength<.15)return Infinity;
  const point=explore.target.group.localToWorld(explore.anchor.clone()).project(camera);
  return Math.hypot((point.x+1)*innerWidth/2-event.clientX,(1-point.y)*innerHeight/2-event.clientY);
}
function updateExploration(delta,now,motionDelta=delta) {
  if(handoff.track) {
    if(!pointerInside || !explore.target || drag || pick(cursorEvent)!==handoff.track)handoff.track=null;
    else if(now-handoff.since>160) {
      explore.target=handoff.track;explore.anchor=new THREE.Vector3();
      explore.docked=false;explore.captureSettled=false;explore.intent=null;explore.lastSwitch=now;
      aimReady=false;handoff.track=null;
    }
  }
  if(!explore.target)explore.docked=false;
  if(explore.target && aimReady && !explore.docked && now-lastPointerMove>100 && explore.strength>.95 && constellation.quaternion.angleTo(steerGoal)<.001 && groupSteering.speed()<.01) {
    explore.docked=true;explore.dockX=cursorEvent.clientX;explore.dockY=cursorEvent.clientY;
    if(!explore.captureSettled) {
      explore.captureX=cursorEvent.clientX;explore.captureY=cursorEvent.clientY;explore.captureSettled=true;
    }
    steerGoal.copy(constellation.quaternion);groupSteering.reset();
  }
  const awake=pointerInside && !drag && !driftPaused && !reducedMotion.matches && (explore.target || now-lastPointerMove<1100);
  explore.strength=THREE.MathUtils.damp(explore.strength,awake?1:0,awake?12:3.5,delta);
  if(!awake && explore.strength<.08)explore.target=null;
  if(driftPaused || reducedMotion.matches || drag)return;
  if(explore.target && explore.anchor && explore.strength>.08 && !handoff.track) {
    constellation.updateMatrixWorld(true);
    targetWorld.copy(explore.anchor).applyMatrix4(explore.target.group.userData.baseMatrix);
    orbitShell.radius=targetWorld.length();
    raycaster.setFromCamera(new THREE.Vector2(pointer.x,-pointer.y),camera);
    cursorSpherePoint(raycaster.ray,orbitShell,cursorWorld);
    {
      // The actual cursor ray is the destination on both axes. A camera-facing
      // cap used to pull this point inward and leave titles short of the cursor.
      // Keep solving after docking so camera easing cannot introduce an offset.
      aimSphereGroup(targetWorld,cursorWorld,steerGoal);
      if(!aimReady && now-lastPointerMove>100 && explore.strength>.95 && constellation.quaternion.angleTo(steerGoal)<.12) {
        // Local spherical spacing replaces the old whole-group overlap search.
        aimReady=true;
      }
    }
  }
  if(explore.target || explore.strength>.08)groupSteering.update(constellation.quaternion,steerGoal,motionDelta);
  else {
    groupSteering.reset();
    const angle=constellation.quaternion.angleTo(steerGoal);
    constellation.quaternion.rotateTowards(steerGoal,Math.min(angle*(1-Math.exp(-delta*4)),delta*2.4));
  }
  if(!awake && explore.strength<.12) {
    // Keep the discovered azimuth; slowly level the arrangement for idle motion.
    aimEuler.setFromQuaternion(steerGoal,'YXZ');
    aimEuler.x=THREE.MathUtils.damp(aimEuler.x,0,.5,delta);
    aimEuler.z=THREE.MathUtils.damp(aimEuler.z,0,.5,delta);
    steerGoal.setFromEuler(aimEuler);
  }
}
addEventListener('resize',() => {
  arrangeTitles();
  camera.fov=fieldOfView();
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

let debrisReadout=null,debrisEnabled=true;
if(new URLSearchParams(location.search).has('debris-check')) {
  const panel=document.createElement('aside');panel.style.cssText='position:fixed;z-index:30;bottom:70px;left:20px;max-width:400px;padding:12px;background:white;font:12px monospace';
  const button=document.createElement('button');button.textContent='Toggle debris';button.onclick=()=>{debrisEnabled=!debrisEnabled;debris.group.visible=debrisEnabled;};
  debrisReadout=document.createElement('p');panel.append(button,debrisReadout);document.body.append(panel);
}
const performanceReview=createPerformanceReview(renderer,scene);
function render() {
  renderFrame=0;
  if(document.hidden || !entrance.visible)return;
  renderFrame=requestAnimationFrame(render);
  const now=performance.now();
  const elapsed=(now-previousFrame)/1000;
  const delta=Math.min(elapsed,.05);
  previousFrame=now;
  if(!driftPaused && !drag && entrance.interactive)driftTime+=delta;
  const ease=1-Math.exp(-delta*5);
  const allowPointer=!reducedMotion.matches && performance.now()-lastTouchTime>1500;
  const yaw=orbit.x+(allowPointer?pointer.x*.035:0);
  const distance=radius();
  // Camera and all title planes share the same perspective projection.
  cameraGoal.set(Math.sin(yaw)*distance,.25+orbit.y*7+(allowPointer?-pointer.y*.18:0),Math.cos(yaw)*distance);
  lookGoal.set(0,0,0);
  camera.position.lerp(cameraGoal,reducedMotion.matches?1:ease);
  currentLook.lerp(lookGoal,reducedMotion.matches?1:ease);
  camera.lookAt(currentLook);
  camera.updateMatrixWorld();
  updateExploration(delta,now,Math.min(elapsed,.15));
  if(!drag) {
    arrangeTitles(delta);

  }
  if(pointerInside && !drag && now-lastHoverCheck>80) {
    constellation.updateMatrixWorld(true);camera.updateMatrixWorld();
    hovered=trackAtPointer(cursorEvent);lastHoverCheck=now;
    host.style.cursor=hovered||magneticDistance(cursorEvent)<28?'pointer':'grab';
  }
  character.rotation.y-=appliedYaw;character.rotation.x-=appliedPitch;
  appliedYaw=0;appliedPitch=0;
  if(!driftPaused && !drag && !hovered){
    character.rotation.y=Math.sin(driftTime*.22)*.11;
    character.rotation.z=.052+Math.sin(driftTime*.17)*.025;
    character.position.y=Math.sin(driftTime*.38)*.055;
  }
  updateDiscoveries(delta,now);
  labels.forEach(label=>{
    const active=label.userData.track===selected || label.userData.track===hovered || (label.userData.track===explore.target && explore.strength>.2) || (!selected && label.userData.track.index===0);
    label.material.color.lerp(active?blue:ink,ease);
  });
  constellation.updateMatrixWorld(true);
  debris.update(driftTime,compact(),now,entrance.interactive&&!reducedMotion.matches&&!driftPaused);
  if(embedded){
    applyEntrance();
    // Only the embedded arrival uses transparency; the settled renderer is unchanged.
    scene.background=entrance.street>0?null:orbitBackground;
    ground.material.opacity=.42*(1-entrance.street);
    ground.visible=entrance.street<1;
    renderer.toneMappingExposure=entrance.street>0?streetExposure(entrance.arrival):1.2;
  }
  const attentive=entrance.interactive&&!reducedMotion.matches&&!driftPaused&&!drag;
  const watched=attentive?((pointerInside&&(explore.target||hovered))||(now<attentionUntil?attentionTrack:null)):null;
  if(watched?.group)watched.group.getWorldPosition(attentionPoint).project(camera);
  const attention=awareness.update(delta,now,watched?attentionPoint:null,attentive);
  appliedYaw=attention.yaw;appliedPitch=attention.pitch;
  character.rotation.y+=appliedYaw;character.rotation.x+=appliedPitch;
  // Preserve the film-matched lighting until arrival is almost complete.
  const depthMix=embedded?THREE.MathUtils.smoothstep(entrance.arrival,.90,1):1;
  fill.intensity=THREE.MathUtils.lerp(1.8,1.05,depthMix);
  key.intensity=THREE.MathUtils.lerp(3.2,3.5,depthMix);
  key.position.set(-4-depthMix,7-depthMix,6+depthMix);
  rim.intensity=THREE.MathUtils.lerp(1.4,1.75,depthMix);
  const viewDistance=camera.position.length();
  scene.fog.near=THREE.MathUtils.lerp(16,viewDistance+.8,depthMix);
  scene.fog.far=THREE.MathUtils.lerp(40,viewDistance+14,depthMix);
  renderer.render(scene,camera);
  performanceReview?.record(now,elapsed);
  if(embedded){renderCount++;document.body.dataset.renderFrames=String(renderCount);document.body.dataset.arrival=entrance.arrival.toFixed(3);if(renderCount===1)parent.postMessage({type:'bc:painted'},location.origin);if(renderCount%120===0)parent.postMessage({type:'bc:render-state',frames:renderCount,running:true},location.origin);}
  if(debrisReadout)debrisReadout.textContent=JSON.stringify({debris:debris.stats,visible:debris.group.visible,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures});
}
// Parent owns visibility only; selection, steering and spherical spacing remain local.
function wake(){if(!renderFrame&&!document.hidden&&entrance.visible){previousFrame=performance.now();renderFrame=requestAnimationFrame(render);}}
function applyEntrance(){
 const t=entrance.arrival;
 // Uniform enlargement only: the approved mesh must never squash or morph.
 character.scale.setScalar(1+(1-t)*1.5);
 if(t<1){
  // Hold the film's downward, clockwise face angle through the reveal.
  // Only turn toward the listening pose once the scene is clearly visible.
  const turn=THREE.MathUtils.smoothstep(t,.60,1);
  character.position.set(0,-.5*(1-t),0);
  character.rotation.set(THREE.MathUtils.lerp(.67,.506,turn),THREE.MathUtils.lerp(-.35,0,turn),THREE.MathUtils.lerp(-.33,.052,turn));
 }
 if(t===1&&applyEntrance.lastArrival!==1){character.position.set(0,0,0);character.rotation.set(.506,0,.052);}
 applyEntrance.lastArrival=t;
 constellation.visible=true;
 if(debrisEntrance){debris.group.visible=debrisEnabled&&t>.15;debrisEntrance.update(t);}
 else debris.group.visible=debrisEnabled&&t>.72; // Asset-loading fallback never blocks tracks.
 document.body.dataset.entryStage=t<.15?'character':t<.34?'fragments':t<.64?'wreckage':t<1?'tracks':'explore';
 document.body.classList.toggle('entering',!entrance.interactive);
 document.body.classList.toggle('can-select',t>.64);
}
if(embedded){
 document.body.classList.add('embedded','entering');
 addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='bc:playback-reaction')return;if(event.data.start&&entrance.interactive&&!reducedMotion.matches&&!driftPaused)debris.react(performance.now());else debris.stopReaction();});
 let releaseChromeTimer=0;
 addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='bc:player-view'){clearTimeout(releaseChromeTimer);if(event.data.expanded)document.body.classList.add('release-expanded');else releaseChromeTimer=setTimeout(()=>document.body.classList.remove('release-expanded'),reducedMotion.matches?0:620);document.body.classList.toggle('compact-playing',!event.data.expanded);}});
 addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='bc:release-closed'){host.tabIndex=-1;(selectionFromKeyboard?menu:host).focus({preventScroll:true});pointerInside=false;explore.target=null;}});
 document.querySelector('.brand').innerHTML='<button id="back-to-film">← Film</button>';
 document.querySelector('#back-to-film').onclick=()=>parent.postMessage({type:'bc:back'},location.origin);
 document.querySelector('#hint').textContent=matchMedia('(pointer:coarse)').matches?'Tap a sleeve or title · Swipe to continue':'Drag to explore · Select a sleeve or title';
 addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='bc:journey')return;
  const d=event.data,wasInteractive=entrance.interactive;entrance.visible=!!d.visible;entrance.arrival=THREE.MathUtils.clamp(Number(d.arrival)||0,0,1);entrance.orbit=THREE.MathUtils.clamp(Number(d.orbit)||0,0,1);entrance.street=THREE.MathUtils.clamp(Number(d.street)||0,0,1);entrance.interactive=!!d.interactive;
  if(!entrance.interactive&&wasInteractive){pointerInside=false;explore.target=null;explore.intent=null;explore.docked=false;hovered=null;drag=null;groupSteering.reset();}
  if(!entrance.visible&&renderFrame){cancelAnimationFrame(renderFrame);renderFrame=0;}parent.postMessage({type:'bc:render-state',frames:renderCount,running:entrance.visible},location.origin);wake();
 });
 document.addEventListener('visibilitychange',wake);
}
wake();

if(new URLSearchParams(location.search).has('motion-check')) {
  document.querySelector('#reset').addEventListener('click',()=>{tracks[5].lane=-.6;});
  import('./checks/exploration-controls.js?v=film-checks-1').then(({install})=>install({
    host,tracks,
    layoutMetrics(){return {width:innerWidth,height:innerHeight,fov:camera.fov,radius:radius(),tracks:meshes.map(g=>({title:g.userData.track.title,phase:g.userData.track.phase,lane:g.userData.track.lane,speed:g.userData.track.speed,radius:g.userData.shellRadius,width:g.children[0].geometry.parameters.width,height:g.children[0].geometry.parameters.height,cover:g.children[1].position.toArray(),coverAngle:g.children[1].rotation.y}))};},
    overlapFixture() {
      const track=tracks[1],blocker=tracks[5];
      track.group.userData.phase=0;blocker.group.userData.phase=0;blocker.lane=track.lane+.05;
      explore.target=track;explore.anchor=new THREE.Vector3();explore.strength=1;
      arrangeTitles();
      const source=track.group.position.clone();
      const destination=camera.position.clone().normalize().multiplyScalar(source.length());
      aimSphereGroup(source,destination,constellation.quaternion);steerGoal.copy(constellation.quaternion);groupSteering.reset();
      constellation.updateMatrixWorld(true);
      const point=track.group.getWorldPosition(new THREE.Vector3()).project(camera);
      cursorEvent.clientX=(point.x+1)*innerWidth/2;cursorEvent.clientY=(1-point.y)*innerHeight/2;
      pointer.set(point.x,-point.y);pointerInside=true;
      lastPointerX=cursorEvent.clientX;lastPointerY=cursorEvent.clientY;
      explore.docked=false;explore.captureSettled=true;aimReady=false;
      explore.captureX=explore.dockX=cursorEvent.clientX;explore.captureY=explore.dockY=cursorEvent.clientY;
      lastPointerMove=performance.now();
      return {x:cursorEvent.clientX,y:cursorEvent.clientY};
    },
    visiblePoint(track) {
      constellation.updateMatrixWorld(true);
      const centre=track.group.getWorldPosition(new THREE.Vector3()).project(camera);
      const x=(centre.x+1)*innerWidth/2,y=(1-centre.y)*innerHeight/2;
      for(const dx of [35,-35,55,-55,0])for(const dy of [0,-8,8]) {
        const e={clientX:x+dx,clientY:y+dy};if(pick(e)===track)return {x:e.clientX,y:e.clientY};
      }
      return {x,y};
    },
    overlapProbe() {
      const group=tracks[1].group;
      const p=group.localToWorld(group.userData.anchors[2].clone()).project(camera);
      return pick({clientX:(p.x+1)*innerWidth/2,clientY:(1-p.y)*innerHeight/2})?.title||'none';
    },
    pointFor(track) {
      constellation.updateMatrixWorld(true);
      const point=track.group.localToWorld(new THREE.Vector3());point.project(camera);
      return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2};
    },
    state() {
      let gap='—',gapX='—',gapY='—';
      if(explore.target && explore.anchor){
        const point=explore.target.group.localToWorld(new THREE.Vector3()).project(camera);
        gapX=Number(((point.x+1)*innerWidth/2-cursorEvent.clientX).toFixed(2));
        gapY=Number(((1-point.y)*innerHeight/2-cursorEvent.clientY).toFixed(2));
        gap=Math.round(Math.hypot(gapX,gapY));
      }
      return {spacing:sphereSpacing?.state(),spacingOverlap:sphereSpacing?.measure(spacingOptions()),stickyRange:stickyReach()*.6,stickyRangeX:stickyReach()*.7,opacity:meshes.map(g=>g.children[0].material.opacity),mode:explore.strength>.5?'ACTIVE':'IDLE',target:explore.target?.title||'none',gap,gapX,gapY,clickTarget:trackAtPointer(cursorEvent)?.title||'none',docked:explore.docked,selected:selected?.title||'none',attachmentError:Math.max(0,...meshes.map(g=>Math.abs(g.position.length()-g.userData.shellRadius*g.scale.x))),localPoseError:Math.max(0,...meshes.flatMap(g=>g.matrix.elements.map((v,i)=>Math.abs(v-g.userData.baseMatrix.elements[i])))),angularSpeed:groupSteering.speed(),turn:Math.round(THREE.MathUtils.radToDeg(constellation.quaternion.angleTo(new THREE.Quaternion())))};
    }
  }));
}
