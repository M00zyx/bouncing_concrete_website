import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createSphereSpacing, sphericalPose } from './sphere-spacing.js?v=2';
import { titleCanvas } from './typography.js';
import { createOrbitalDebris } from './orbital-debris.js?v=damaged-2';
import { createGroupSteering, aimSphereGroup, readableSpherePoint } from './group-steering.js?v=polar-selection-4';

const tracks = [
  {title:'Funkacaine',lines:['FUNKACAINE'],height:.9,phase:-.2,speed:.19,lane:1.7,index:0,slug:'funkacaine',sleeve:'crop-11-63a82a4545cd.webp'},
  {title:'Concreto Incarnat',lines:['CONCRETO INCARNAT'],height:.83,phase:1.05,speed:.17,lane:-1.75,index:1,slug:'concreto-incarnat',sleeve:'crop-18-bd5de7ab99aa.webp'},
  {title:'Pressure Test',lines:['PRESSURE TEST'],height:.85,phase:2.2,speed:.21,lane:2.85},
  {title:'Aftershock',lines:['AFTERSHOCK'],height:.9,phase:3.35,speed:.18,lane:.55},
  {title:'Load Bearing',lines:['LOAD BEARING'],height:.9,phase:4,speed:.16,lane:-2.9},
  {title:'Soft Collision',lines:['SOFT COLLISION'],height:.85,phase:5.3,speed:.2,lane:-.6},
];
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

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
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
scene.background = new THREE.Color('#ccd0d3');
scene.fog = new THREE.Fog('#ccd0d3',16,40);
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
scene.add(new THREE.HemisphereLight(0xffffff,0x717987,1.8));
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
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.MeshStandardMaterial({color:0xb2b7bb,roughness:1}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -3.65;
ground.receiveShadow = true;
// The stage receives shadows without cutting through low orbital labels.
ground.material.depthWrite=false;
ground.renderOrder=-1;
scene.add(ground);
const character = new THREE.Group();
character.rotation.set(.506,0,.052);
scene.add(character);

function finishLoading() {
  if (modelReady && labelsReady) loading.hidden = true;
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
  model.traverse(node => {if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
  character.add(model);
  modelReady = true;
  finishLoading();
},undefined,() => {
  loading.classList.add('error');
  loading.textContent = 'The character could not load. Reload to try again, or open Tracks.';
});

// Sample sleeves are deliberately typographic placeholders, never implied releases.
function sampleSleeve(track,index) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=index%2?'#1736df':'#20231e';ctx.fillRect(0,0,512,512);
  ctx.strokeStyle='#ffd900';ctx.lineWidth=24;
  for(let i=0;i<4;i++) {
    ctx.beginPath();ctx.moveTo(-70+i*160,0);ctx.lineTo(130+i*160,250);ctx.stroke();
  }
  ctx.fillStyle='#edf0f1';ctx.font='17px "DM Mono"';ctx.fillText('SAMPLE SLEEVE / 0'+(index+1),28,285);
  ctx.font='66px Anton';
  track.title.toUpperCase().split(' ').forEach((word,i)=>ctx.fillText(word,26,365+i*76));
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
  const material=new THREE.MeshBasicMaterial({map:texture,color:ink,transparent:true,alphaTest:.08,toneMapped:false,side:THREE.DoubleSide});
  group.userData.textTexture=texture;
  const geometry=sphericalBand(width,textureHeight,shellRadius);
  const front=new THREE.Mesh(geometry,material);
  front.userData={track,canvas,context,texture};group.add(front);labels.push(front);
  const coverMap=track.sleeve?textureLoader.load('assets/'+track.sleeve):sampleSleeve(track,index);
  coverMap.colorSpace=THREE.SRGBColorSpace;
  coverMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const coverMaterial=new THREE.MeshBasicMaterial({map:coverMap,toneMapped:false});
  const edgeMaterial=new THREE.MeshStandardMaterial({color:0x25272a,roughness:.75});
  const sleeve=new THREE.Mesh(new THREE.BoxGeometry(coverSize,coverSize,.045),[edgeMaterial,edgeMaterial,edgeMaterial,edgeMaterial,coverMaterial,coverMaterial]);
  const coverAngle=-(width/2+.26+coverSize/2)/shellRadius;
  sleeve.position.set(Math.sin(coverAngle)*shellRadius,0,(Math.cos(coverAngle)-1)*shellRadius);
  sleeve.rotation.y=coverAngle;
  sleeve.userData={track,solid:true};
  group.add(sleeve);
  const marker=new THREE.Mesh(new THREE.PlaneGeometry(.35,.045),new THREE.MeshBasicMaterial({color:0xffd900,side:THREE.DoubleSide,toneMapped:false}));
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
  note.textContent = track.slug ? 'Listen ↗' : 'Sample';
  const thumbnail=document.createElement('img');
  thumbnail.alt='';
  if(track.sleeve)thumbnail.src='assets/'+track.sleeve;
  track.thumbnail=thumbnail;
  button.append(thumbnail,title,note);
  button.addEventListener('click',() => selectTrack(track));
  list.append(button);
  track.button = button;
});
const menu = document.querySelector('#menu');
const panel = document.querySelector('#tracks');
function toggleMenu(open) {
  panel.hidden = !open;
  menu.setAttribute('aria-expanded',String(open));
}
menu.addEventListener('click',() => toggleMenu(panel.hidden));
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
const widget = window.SC?.Widget(document.querySelector('#engine'));

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

function selectTrack(track) {
  selected=track;
  toggleMenu(false);
  selection.hidden=false;
  document.querySelector('#title').textContent=track.title;
  document.querySelector('#kind').textContent=track.slug?'Bouncing Concrete':'Spatial study';
  const sleeve=document.querySelector('#sleeve');
  sleeve.hidden=false;
  sleeve.src=track.sleeve?'assets/'+track.sleeve:track.previewSleeve;
  sleeve.alt=track.title+(track.sleeve?' sleeve':' sample sleeve');
  document.querySelector('#sample-note').hidden=!!track.slug;
  document.querySelector('#audio-controls').hidden=!track.slug;
  audioStatus.textContent='';
  tracks.forEach(item => item.button.setAttribute('aria-current',String(item===track)));
  // Keep the viewpoint steady: selecting a moving release must not teleport it.
  hovered=null;explore.target=null;
  if(track.slug){
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
  if(event.key==='Escape'){closeSelection();toggleMenu(false);hovered=null;}
});

function pick(event) {
  const box=host.getBoundingClientRect();
  const ndc=new THREE.Vector2((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);
  raycaster.setFromCamera(ndc,camera);
  let hits=raycaster.intersectObjects(model?[...meshes,character]:meshes,true);
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
        const reachY=stickyReach(),reachX=reachY*.7;
        // A narrower horizontal grip makes adjacent titles easier to reach.
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
  if(gestureDistance<7){const track=pressedTrack;if(track)selectTrack(track);}
  pressedTrack=null;
  drag=null;
  if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId);
});
host.addEventListener('pointercancel',() => {drag=null;});
host.addEventListener('pointerleave',()=>{pointerInside=false;explore.intent=null;explore.docked=false;explore.target=null;lastPointerMove=-Infinity;steerGoal.copy(constellation.quaternion);groupSteering.reset();if(!drag){pointer.set(0,0);hovered=null;}});
function spacingOptions(){return {camera,parentRotation:constellation.quaternion,scale:compact()?.73:1,width:innerWidth,height:innerHeight,owner:explore.target,protectedTracks:[handoff.track,(!explore.target||Math.hypot(cursorEvent.clientX-explore.captureX,cursorEvent.clientY-explore.captureY)>18)?hovered:null],paused:driftPaused||reducedMotion.matches||!!drag,settled:groupSteering.speed()<.4&&!handoff.track};}
function arrangeTitles(delta=0) {
  sphereSpacing?.update(delta,spacingOptions());
  meshes.forEach(group=>{
    const {track,index,shellRadius}=group.userData;
    if(!driftPaused && !drag && hovered!==track) {
      // Exploration steers one rigid group. Ease out the independent idle drift
      // while attracting, then resume each original orbital speed afterward.
      const drift=explore.target?1-explore.strength:1;
      group.userData.phase+=delta*track.speed*drift;
    }
    const scale=compact()?.73:1;
    const spacing=group.userData.spacing||{x:0,y:0};
    // Offsets are latitude/longitude on the same shell, never detached XYZ nudges.
    sphericalPose(group,spacing.x,spacing.y,scale,group.position,group.quaternion);
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
      // Present the whole high/low title, not whichever curved edge was closest.
      explore.anchor=Math.abs(best.track.lane)>1?new THREE.Vector3():best.anchor.clone();
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
  if(explore.target && aimReady && !explore.docked && now-lastPointerMove>100 && explore.strength>.95 && constellation.quaternion.angleTo(steerGoal)<.018 && groupSteering.speed()<.12) {
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
  if(explore.target && explore.anchor && explore.strength>.08 && !explore.docked && !handoff.track) {
    constellation.updateMatrixWorld(true);
    targetWorld.copy(explore.anchor).applyMatrix4(explore.target.group.userData.baseMatrix);
    orbitShell.radius=targetWorld.length();
    raycaster.setFromCamera(new THREE.Vector2(pointer.x,-pointer.y),camera);
    if(!raycaster.ray.intersectSphere(orbitShell,cursorWorld)) {
      // A cursor just outside the projected sphere still attracts the nearest rim.
      raycaster.ray.closestPointToPoint(orbitShell.center,cursorWorld);
      cursorWorld.normalize().multiplyScalar(orbitShell.radius);
    }
    {
      readableSpherePoint(cursorWorld,camera.position,orbitShell.radius,cursorWorld);
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

let debrisReadout=null;
if(new URLSearchParams(location.search).has('debris-check')) {
  const panel=document.createElement('aside');panel.style.cssText='position:fixed;z-index:30;bottom:70px;left:20px;max-width:400px;padding:12px;background:white;font:12px monospace';
  const button=document.createElement('button');button.textContent='Toggle debris';button.onclick=()=>{debris.group.visible=!debris.group.visible;};
  debrisReadout=document.createElement('p');panel.append(button,debrisReadout);document.body.append(panel);
}
function render() {
  requestAnimationFrame(render);
  const now=performance.now();
  const elapsed=(now-previousFrame)/1000;
  const delta=Math.min(elapsed,.05);
  previousFrame=now;
  if(!driftPaused && !drag)driftTime+=delta;
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
  if(!driftPaused && !drag && !hovered){
    character.rotation.y=Math.sin(driftTime*.22)*.11;
    character.rotation.z=.052+Math.sin(driftTime*.17)*.025;
    character.position.y=Math.sin(driftTime*.38)*.055;
  }
  labels.forEach(label=>{
    const active=label.userData.track===selected || label.userData.track===hovered || (label.userData.track===explore.target && explore.strength>.2) || (!selected && label.userData.track.index===0);
    label.material.color.lerp(active?blue:ink,ease);
  });
  constellation.updateMatrixWorld(true);
  debris.update(driftTime,compact());
  renderer.render(scene,camera);
  if(debrisReadout)debrisReadout.textContent=JSON.stringify({debris:debris.stats,visible:debris.group.visible,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures});
}
render();

if(new URLSearchParams(location.search).has('motion-check')) {
  document.querySelector('#reset').addEventListener('click',()=>{tracks[5].lane=-.6;});
  import('./checks/exploration-controls.js?v=sphere-spacing-2').then(({install})=>install({
    host,tracks,
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
      let gap='—';
      if(explore.target && explore.anchor){
        const point=explore.target.group.localToWorld(explore.anchor.clone()).project(camera);
        gap=Math.round(Math.hypot((point.x+1)*innerWidth/2-cursorEvent.clientX,(1-point.y)*innerHeight/2-cursorEvent.clientY));
      }
      return {spacing:sphereSpacing?.state(),spacingOverlap:sphereSpacing?.measure(spacingOptions()),stickyRange:stickyReach(),stickyRangeX:stickyReach()*.7,opacity:meshes.map(g=>g.children[0].material.opacity),mode:explore.strength>.5?'ACTIVE':'IDLE',target:explore.target?.title||'none',gap,clickTarget:trackAtPointer(cursorEvent)?.title||'none',docked:explore.docked,selected:selected?.title||'none',attachmentError:Math.max(0,...meshes.map(g=>Math.abs(g.position.length()-g.userData.shellRadius*g.scale.x))),localPoseError:Math.max(0,...meshes.flatMap(g=>g.matrix.elements.map((v,i)=>Math.abs(v-g.userData.baseMatrix.elements[i])))),angularSpeed:groupSteering.speed(),turn:Math.round(THREE.MathUtils.radToDeg(constellation.quaternion.angleTo(new THREE.Quaternion())))};
    }
  }));
}
