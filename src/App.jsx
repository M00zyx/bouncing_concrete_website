import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { siteContent } from './content'

function ConcreteObject() {
  const host = useRef(null)
  useEffect(() => {
    const el = host.current; const r = new THREE.WebGLRenderer({ alpha:true, antialias:true }); r.setPixelRatio(Math.min(devicePixelRatio,2)); r.setSize(el.clientWidth,el.clientHeight); el.appendChild(r.domElement)
    const s = new THREE.Scene(); const c = new THREE.PerspectiveCamera(58,el.clientWidth/el.clientHeight,.1,100); c.position.set(0,.2,4.1); s.add(new THREE.HemisphereLight(0xe3e6e0,0x171717,1.45)); const chinLight=new THREE.SpotLight(0xffc400,9.2,16,.64,.82,1.18);chinLight.position.set(0,-3.6,3.7);chinLight.target.position.set(0,-.15,0);const chinFill=new THREE.PointLight(0xffb400,1.6,8,1.45);chinFill.position.set(0,-2.8,2.2);s.add(chinLight,chinLight.target,chinFill)
    let face, frame, basePosition; const faceYaw=0; const facePitch=THREE.MathUtils.degToRad(29); const faceRoll=THREE.MathUtils.degToRad(3); new GLTFLoader().load('/assets/concrete-blob.glb',({scene})=>{const bounds=new THREE.Box3().setFromObject(scene);const center=bounds.getCenter(new THREE.Vector3());const scale=9/bounds.getSize(new THREE.Vector3()).length();frame=new THREE.Group();const pivot=new THREE.Group();scene.scale.setScalar(scale);scene.position.set(-center.x*scale,-center.y*scale,-center.z*scale);pivot.position.y=-1.25;pivot.add(scene);pivot.rotation.set(facePitch,faceYaw,faceRoll);frame.position.y=.72;frame.add(pivot);face=pivot;basePosition=frame.position.clone();s.add(frame)})
    const motionZone=el.closest('.release')||el; let tx=0, ty=0; const pitchRange=THREE.MathUtils.degToRad(20); const move=(event)=>{const box=motionZone.getBoundingClientRect();tx=(event.clientX-box.left)/box.width-.5;ty=(event.clientY-box.top)/box.height-.5}; const leave=()=>{tx=0;ty=0}; const resize=()=>{r.setSize(el.clientWidth,el.clientHeight);c.aspect=el.clientWidth/el.clientHeight;c.updateProjectionMatrix()};addEventListener('resize',resize);motionZone.addEventListener('pointermove',move);motionZone.addEventListener('pointerleave',leave);let id;const draw=()=>{id=requestAnimationFrame(draw);if(face&&frame&&basePosition){face.rotation.y+=(faceYaw+tx*.28-face.rotation.y)*.12;face.rotation.x+=(facePitch+ty*pitchRange-face.rotation.x)*.16;face.rotation.z+=(faceRoll-face.rotation.z)*.16;frame.position.x+=(basePosition.x-frame.position.x)*.16;frame.position.y+=(basePosition.y-frame.position.y)*.16}r.render(s,c)};draw();return()=>{cancelAnimationFrame(id);removeEventListener('resize',resize);motionZone.removeEventListener('pointermove',move);motionZone.removeEventListener('pointerleave',leave);r.dispose();el.replaceChildren()}
  },[])
  return <div className="object-stage eye-slit-stage" ref={host} aria-label="Concrete object eyes follow your pointer" />
}

export function App() {
  const hero = useRef(null), video = useRef(null), soundcloudFrame = useRef(null), soundcloudWidget = useRef(null), waveform = useRef(null), waveInput = useRef(null), currentSoundDuration = useRef(0), soundRequest = useRef(0), scrubbing = useRef(false), pendingSeek = useRef(null); const [p,setP]=useState(0); const [playing,setPlaying]=useState(false); const [widgetReady,setWidgetReady]=useState(false); const [soundInfo,setSoundInfo]=useState({title:'',duration:'',description:'xxx'}); const [isLatest,setIsLatest]=useState(true); const [waveFocused,setWaveFocused]=useState(false); const track=siteContent.releases[0]
  const setWavePosition=(position)=>{const percentage=Math.max(0,Math.min(1,position))*100;waveform.current?.style.setProperty('--track-progress',`${percentage}%`);if(waveInput.current)waveInput.current.value=String(percentage)}
  const syncCurrentSound=()=>{
    const widget=soundcloudWidget.current
    if(!widget)return
    const request=++soundRequest.current
    widget.getCurrentSound((sound)=>{
      if(request!==soundRequest.current||!sound)return
      const duration=Number(sound.duration)||0
      currentSoundDuration.current=duration
      setSoundInfo({title:sound.title||'',duration:duration?`${Math.floor(duration/60000)}:${String(Math.floor((duration%60000)/1000)).padStart(2,'0')}`:'',description:sound.description||'xxx'})
      widget.getCurrentSoundIndex((index)=>{if(request===soundRequest.current)setIsLatest(index===0)})
      if(pendingSeek.current!==null&&duration>0){const position=pendingSeek.current;pendingSeek.current=null;widget.seekTo(Math.round(position*duration));setWavePosition(position)}
    })
  }
  const playerCommand=(method)=>{const widget=soundcloudWidget.current;if(!widget)return;if(method==='toggle')widget.toggle();else if(method==='next'){widget.next();window.setTimeout(syncCurrentSound,80)}else if(method==='prev'){widget.prev();window.setTimeout(syncCurrentSound,80)}}
  const previewSeek=(ratio)=>setWavePosition(ratio)
  const commitSeek=(ratio)=>{
    const widget=soundcloudWidget.current, position=Math.max(0,Math.min(1,ratio))
    if(!widget)return
    const duration=currentSoundDuration.current
    if(duration>0){widget.seekTo(Math.round(position*duration));setWavePosition(position)}
    else{pendingSeek.current=position;syncCurrentSound()}
  }
  useEffect(()=>{
    let frame=0, lastProgress=-1
    const update=()=>{
      frame=0
      const section=hero.current, v=video.current
      if(!section)return
      const box=section.getBoundingClientRect()
      const progress=Math.max(0,Math.min(1,-box.top/(section.offsetHeight-innerHeight)))
      if(Math.abs(progress-lastProgress)>.001){setP(progress);lastProgress=progress}
      if(v?.duration&&Number.isFinite(v.duration)){
        const target=progress*Math.max(0,v.duration-.05)
        if(Math.abs(v.currentTime-target)>1/30)v.currentTime=target
      }
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    addEventListener('scroll',schedule,{passive:true})
    video.current?.addEventListener('loadedmetadata',schedule)
    schedule()
    return()=>{removeEventListener('scroll',schedule);video.current?.removeEventListener('loadedmetadata',schedule);cancelAnimationFrame(frame)}
  },[])
  useEffect(()=>{
    let mounted=true; let script
    const setup=()=>{
      if(!mounted||!window.SC||!soundcloudFrame.current)return
      const widget=window.SC.Widget(soundcloudFrame.current); soundcloudWidget.current=widget
      widget.bind(window.SC.Widget.Events.READY,()=>{setWidgetReady(true);syncCurrentSound()})
      widget.bind(window.SC.Widget.Events.PLAY,()=>{setPlaying(true);syncCurrentSound()})
      widget.bind(window.SC.Widget.Events.PAUSE,()=>setPlaying(false))
      widget.bind(window.SC.Widget.Events.FINISH,()=>{setPlaying(false);syncCurrentSound()})
    }
    if(window.SC?.Widget)setup();else{script=document.createElement('script');script.src='https://w.soundcloud.com/player/api.js';script.async=true;script.onload=setup;document.head.appendChild(script)}
    return()=>{mounted=false;script?.remove()}
  },[])
  useEffect(()=>{const fallback=window.setTimeout(()=>{if(!window.SC)setWidgetReady(false)},1200);return()=>window.clearTimeout(fallback)},[])
  useEffect(()=>{
    const widget=soundcloudWidget.current
    if(!widgetReady||!widget)return
    const onProgress=({relativePosition})=>{if(!scrubbing.current&&typeof relativePosition==='number')setWavePosition(relativePosition)}
    widget.bind(window.SC.Widget.Events.PLAY_PROGRESS,onProgress)
    return()=>widget.unbind?.(window.SC.Widget.Events.PLAY_PROGRESS,onProgress)
  },[widgetReady])
  const posterOpacity=p<.42?1:Math.max(0,1-(p-.42)/.08); const detailOpacity=p<.5?0:Math.min(1,(p-.5)/.1)
  return <main>
    <section className="scroll-film" ref={hero}>
      <div className="film-sticky"><video ref={video} muted playsInline preload="auto" poster="/assets/scene-plate.png"><source src="/assets/scene-scrub.mp4" type="video/mp4"/></video><div className="film-vignette"/>
        <nav><span className="brand">BOUNCING<br/>CONCRETE</span><div><a href="#music">MUSIC</a><a href="#shows">SHOWS</a></div></nav>
        <article className="poster" onPointerMove={(e)=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--px',`${(e.clientX-r.left)/r.width-.5}`);e.currentTarget.style.setProperty('--py',`${(e.clientY-r.top)/r.height-.5}`)}} style={{opacity:posterOpacity,transform:`translate(-50%, calc(-50% + ${(1-posterOpacity)*-6}vh))`}}><img className="poster-wordmark" src="/assets/wordmark-gritty.png" alt="Bouncing Concrete"/><img className="poster-ornament face" style={{'--drop':`${p*245}vh`}} src="/assets/ornament-face.png" alt=""/><img className="poster-ornament flower" style={{'--drop':`${Math.max(0,p-.07)*145}vh`}} src="/assets/ornament-flower.png" alt=""/><img className="poster-ornament checker" style={{'--drop':`${Math.max(0,p-.11)*115}vh`}} src="/assets/ornament-checker.png" alt=""/><img className="poster-ornament cross" style={{'--drop':`${Math.max(0,p-.16)*90}vh`}} src="/assets/ornament-cross.png" alt=""/><img className="poster-symbol globe" src="/assets/symbol-globe.png" alt=""/><i className="poster-checker" aria-hidden="true"/><div className="poster-index"><img className="mark-glyph" src="/assets/mark-glyph-06-sideways.png" alt="Cut wedge construction mark"/><img className="mark-hatch" src="/assets/mark-hatch-alpha.png" alt=""/><b>{siteContent.poster.sequence}</b></div><span className="poster-coordinates">{siteContent.poster.coordinates[0]}<br/>{siteContent.poster.coordinates[1]}</span><span className="poster-arrow" aria-hidden="true">↓</span></article>
        <div className="video-ornaments" style={{opacity:detailOpacity}}><b>BUILD. BOUNCE. BREAK.</b><i/></div>
      </div>
    </section>
    <section id="music" className="release"><ConcreteObject/><div className="release-player"><div className="player">{widgetReady&&<><div className="wave-hitbox" onPointerMove={(event)=>{const box=event.currentTarget.getBoundingClientRect();const ratio=Math.max(0,Math.min(100,((event.clientX-box.left)/box.width)*100));event.currentTarget.style.setProperty('--wave-focus-x',`${ratio}%`)}} onPointerEnter={()=>setWaveFocused(true)} onPointerLeave={()=>setWaveFocused(false)}><div ref={waveform} className={`wave${playing?' on':''}${waveFocused?' is-focused':''}`} aria-hidden="true"><span className="wave-shock"/><span className="wave-dilation"/></div><input ref={waveInput} className="wave-scrubber" type="range" min="0" max="100" step="0.1" defaultValue="0" aria-label="Track position" onPointerDown={()=>{scrubbing.current=true}} onInput={(event)=>previewSeek(Number(event.currentTarget.value)/100)} onPointerUp={(event)=>{const ratio=Number(event.currentTarget.value)/100;scrubbing.current=false;commitSeek(ratio)}} onPointerCancel={(event)=>{scrubbing.current=false;commitSeek(Number(event.currentTarget.value)/100)}} onChange={(event)=>{if(!scrubbing.current)commitSeek(Number(event.currentTarget.value)/100)}} onKeyUp={(event)=>commitSeek(Number(event.currentTarget.value)/100)}/></div></>}<div className="player-rail"><div className="player-actions">{widgetReady&&<button className={`play-button${playing?' is-playing':''}`} aria-label={playing?'Pause track':'Play track'} onClick={()=>playerCommand('toggle')}>{playing?'Ⅱ':'▶'}</button>}<nav className="event-links player-links" aria-label="Music links"><a href="https://soundcloud.com/moo-497939951" target="_blank" rel="noreferrer">LISTEN <i>↗</i></a><a href="https://bouncingconcrete.bandcamp.com/" target="_blank" rel="noreferrer">BUY <i>↗</i></a></nav></div><div className="track-copy"><p className="eyebrow">{isLatest?'LATEST':'\u00a0'}</p><h2>{soundInfo.title||track.title}</h2><p className="meta"><b>{soundInfo.duration||track.duration}</b></p><p className="track-description">{soundInfo.description||'xxx'}</p></div>{widgetReady&&<div className="track-skip"><button aria-label="Previous track" onClick={()=>playerCommand('prev')}>◀</button><button aria-label="Next track" onClick={()=>playerCommand('next')}>▶</button></div>}</div></div><iframe ref={soundcloudFrame} className={`soundcloud-engine ${widgetReady?'is-hidden':'is-visible'}`} title="Bouncing Concrete track" allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(siteContent.soundcloudPlaylist)}&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&visual=false`}/></div></section>
    <section id="about" className="about"><div className="about-label"><p className="eyebrow">ABOUT</p><img src="/assets/wordmark-gritty.png" alt="Bouncing Concrete"/></div><p>{siteContent.statement}</p><div className="about-signal" aria-hidden="true"><img className="signal-eye" src="/assets/ornament-aperture-internal-shadow.png" alt=""/></div></section>
    <section id="shows" className="shows"><div className="show-list"><p className="eyebrow">UPCOMING SHOWS</p>{siteContent.shows.map(x=><div className="show" key={x.date+x.city}><b>{x.date}</b><span>{x.city}</span><span>{x.venue}</span><button>{x.ticketLabel} <i>↗</i></button></div>)}<a className="view-shows" href="#shows">VIEW ALL SHOWS <i>↗</i></a></div><aside className="next-event"><p className="eyebrow">NEXT EVENT</p><h3>{siteContent.shows[0].city}</h3><p>{siteContent.shows[0].date} &nbsp; {siteContent.shows[0].venue}</p><div className="event-signal" aria-hidden="true"><img className="signal-eye" src="/assets/ornament-aperture-internal-shadow.png" alt=""/><img src="/assets/ornament-flower.png" alt=""/></div><nav className="event-links" aria-label="Release links"><a href="https://soundcloud.com/moo-497939951" target="_blank" rel="noreferrer">LISTEN <i>↗</i></a><a href="https://bouncingconcrete.bandcamp.com/" target="_blank" rel="noreferrer">BUY <i>↗</i></a></nav></aside></section>
    <footer><span>© {siteContent.footer}</span><span>INSTAGRAM &nbsp; BANDCAMP &nbsp; YOUTUBE</span><span className="footer-location">BUILT, BOUNCED AND BROKEN IN KUALA LUMPUR <img src="/assets/symbol-globe-tight.png" alt=""/></span></footer>
  </main>
}
