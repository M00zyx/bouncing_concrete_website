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
    const motionZone=el.closest('.release')||el; let tx=0; const move=(event)=>{const box=motionZone.getBoundingClientRect();tx=(event.clientX-box.left)/box.width-.5}; const leave=()=>{tx=0}; const resize=()=>{r.setSize(el.clientWidth,el.clientHeight);c.aspect=el.clientWidth/el.clientHeight;c.updateProjectionMatrix()};addEventListener('resize',resize);motionZone.addEventListener('pointermove',move);motionZone.addEventListener('pointerleave',leave);let id;const draw=()=>{id=requestAnimationFrame(draw);if(face&&frame&&basePosition){face.rotation.y+=(faceYaw+tx*.28-face.rotation.y)*.12;face.rotation.x+=(facePitch-face.rotation.x)*.16;face.rotation.z+=(faceRoll-face.rotation.z)*.16;frame.position.x+=(basePosition.x-frame.position.x)*.16;frame.position.y+=(basePosition.y-frame.position.y)*.16}r.render(s,c)};draw();return()=>{cancelAnimationFrame(id);removeEventListener('resize',resize);motionZone.removeEventListener('pointermove',move);motionZone.removeEventListener('pointerleave',leave);r.dispose();el.replaceChildren()}
  },[])
  return <div className="object-stage eye-slit-stage" ref={host} aria-label="Concrete object eyes follow your pointer" />
}

export function App() {
  const hero = useRef(null), video = useRef(null), soundcloudFrame = useRef(null), soundcloudWidget = useRef(null), waveform = useRef(null), waveInput = useRef(null), waveSeeking = useRef(false), seekReleaseTimer = useRef(0), currentSoundDuration = useRef(0); const [p,setP]=useState(0); const [playing,setPlaying]=useState(false); const [widgetReady,setWidgetReady]=useState(false); const [soundInfo,setSoundInfo]=useState({title:'',duration:'',artist:'xxx',genre:'xxx',tags:'xxx',description:'xxx'}); const [isLatest,setIsLatest]=useState(true); const track=siteContent.releases[0]
  const playerCommand=(method)=>{const widget=soundcloudWidget.current;if(!widget)return;if(method==='toggle')widget.toggle();else if(method==='next')widget.next();else if(method==='prev')widget.prev()}
  const seekFromWaveform=(ratio)=>{
    const wave=waveform.current, widget=soundcloudWidget.current, position=Math.max(0,Math.min(1,ratio))
    if(!wave||!widget)return
    wave.style.setProperty('--track-progress',`${position*100}%`)
    waveSeeking.current=true
    clearTimeout(seekReleaseTimer.current)
    const release=()=>{seekReleaseTimer.current=window.setTimeout(()=>{waveSeeking.current=false},420)}
    const seek=(duration)=>{if(Number.isFinite(duration)&&duration>0){widget.seekTo(Math.round(position*duration));release()}}
    if(currentSoundDuration.current>0)seek(currentSoundDuration.current)
    else widget.getDuration((duration)=>{
      if(Number.isFinite(duration)&&duration>0)seek(duration)
      else widget.getCurrentSound((sound)=>{currentSoundDuration.current=sound?.duration||0;seek(currentSoundDuration.current)})
    })
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
      const sync=()=>widget.getCurrentSound((sound)=>{
        if(!mounted||!sound)return
        currentSoundDuration.current=sound.duration||0
        setSoundInfo({title:sound.title||'',duration:sound.duration?`${Math.floor(sound.duration/60000)}:${String(Math.floor((sound.duration%60000)/1000)).padStart(2,'0')}`:'',artist:sound.user?.username||'xxx',genre:sound.genre||'xxx',tags:sound.tag_list||'xxx',description:sound.description||'xxx'})
        widget.getCurrentSoundIndex((index)=>setIsLatest(index===0))
      })
      widget.bind(window.SC.Widget.Events.READY,()=>{setWidgetReady(true);sync()})
      widget.bind(window.SC.Widget.Events.PLAY,()=>{setPlaying(true);sync()})
      widget.bind(window.SC.Widget.Events.PAUSE,()=>setPlaying(false))
    }
    if(window.SC?.Widget)setup();else{script=document.createElement('script');script.src='https://w.soundcloud.com/player/api.js';script.async=true;script.onload=setup;document.head.appendChild(script)}
    return()=>{mounted=false;script?.remove()}
  },[])
  useEffect(()=>{const fallback=window.setTimeout(()=>{if(!window.SC)setWidgetReady(false)},1200);return()=>window.clearTimeout(fallback)},[])
  useEffect(()=>{
    const widget=soundcloudWidget.current
    if(!widgetReady||!widget)return
    const onProgress=({relativePosition})=>{if(!waveSeeking.current&&typeof relativePosition==='number'){const position=Math.max(0,Math.min(1,relativePosition));waveform.current?.style.setProperty('--track-progress',`${position*100}%`);if(waveInput.current)waveInput.current.value=String(position*100)}}
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
    <section id="music" className="release"><ConcreteObject/><div className="release-player"><div className="transport">{widgetReady&&<div className="player"><button className={`play-button${playing?' is-playing':''}`} aria-label="Play track" onClick={()=>{playerCommand('toggle');setPlaying(x=>!x)}}>{playing?'Ⅱ':'▶'}</button><div className="wave-hitbox"><div ref={waveform} className={playing?'wave on':'wave'} aria-hidden="true"/><input ref={waveInput} className="wave-scrubber" type="range" min="0" max="100" step="0.1" defaultValue="0" aria-label="Track position" onInput={(event)=>seekFromWaveform(Number(event.currentTarget.value)/100)}/></div><div className="track-skip"><button aria-label="Previous track" onClick={()=>playerCommand('prev')}>◀</button><button aria-label="Next track" onClick={()=>playerCommand('next')}>▶</button></div></div>}<nav className="event-links player-links" aria-label="Music links"><a href="https://soundcloud.com/moo-497939951" target="_blank" rel="noreferrer">LISTEN <i>↗</i></a><a href="https://bouncingconcrete.bandcamp.com/" target="_blank" rel="noreferrer">BUY <i>↗</i></a></nav></div><div className="track-copy">{isLatest&&<p className="eyebrow">NEW TRACK</p>}<h2>{soundInfo.title||track.title}</h2><p className="meta"><b>{soundInfo.duration||track.duration}</b></p><p className="track-description">{soundInfo.description||'xxx'}</p><small>SOUNDCLOUD · CONCRETO INCARNAT</small></div><iframe ref={soundcloudFrame} className={`soundcloud-engine ${widgetReady?'is-hidden':'is-visible'}`} title="Bouncing Concrete track" allow="autoplay" src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(siteContent.soundcloudPlaylist)}&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&visual=false`}/></div></section>
    <section id="about" className="about"><div className="about-label"><p className="eyebrow">ABOUT</p><img src="/assets/wordmark-gritty.png" alt="Bouncing Concrete"/></div><p>{siteContent.statement}</p><div className="about-signal" aria-hidden="true"><img className="signal-eye" src="/assets/ornament-aperture-internal-shadow.png" alt=""/></div></section>
    <section id="shows" className="shows"><div className="show-list"><p className="eyebrow">UPCOMING SHOWS</p>{siteContent.shows.map(x=><div className="show" key={x.date+x.city}><b>{x.date}</b><span>{x.city}</span><span>{x.venue}</span><button>{x.ticketLabel} <i>↗</i></button></div>)}<a className="view-shows" href="#shows">VIEW ALL SHOWS <i>↗</i></a></div><aside className="next-event"><p className="eyebrow">NEXT EVENT</p><h3>{siteContent.shows[0].city}</h3><p>{siteContent.shows[0].date} &nbsp; {siteContent.shows[0].venue}</p><div className="event-signal" aria-hidden="true"><img className="signal-eye" src="/assets/ornament-aperture-internal-shadow.png" alt=""/><img src="/assets/ornament-flower.png" alt=""/></div><nav className="event-links" aria-label="Release links"><a href="https://soundcloud.com/moo-497939951" target="_blank" rel="noreferrer">LISTEN <i>↗</i></a><a href="https://bouncingconcrete.bandcamp.com/" target="_blank" rel="noreferrer">BUY <i>↗</i></a></nav></aside></section>
    <footer><span>© {siteContent.footer}</span><span>INSTAGRAM &nbsp; BANDCAMP &nbsp; YOUTUBE</span><span className="footer-location">BUILT, BOUNCED AND BROKEN IN KUALA LUMPUR <img src="/assets/symbol-globe-tight.png" alt=""/></span></footer>
  </main>
}
