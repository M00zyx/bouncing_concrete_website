import { useEffect, useRef, useState } from 'react'
import { siteContent } from './content'
import { Icon } from './Icons'
import { RecordArt } from './RecordArt'

let widgetScript
function loadWidgetScript() {
  if (window.SC?.Widget) return Promise.resolve()
  if (!widgetScript) {
    widgetScript = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/assets/soundcloud-widget-api.js'
      script.onload = resolve
      script.onerror = () => { widgetScript = null; script.remove(); reject(new Error('Player unavailable')) }
      document.head.appendChild(script)
    })
  }
  return widgetScript
}

function time(milliseconds) {
  const seconds = Math.max(0, Math.floor((milliseconds || 0) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function releaseFor(sound, index) {
  const slug = sound.permalink_url?.split('/').pop() || String(sound.id)
  const curated = siteContent.releases.find(release => release.slug === slug)
  return {
    slug, title: sound.title,
    soundcloudUrl: sound.permalink_url, description: '', purchaseUrl: '',
    ...curated,
    duration: sound.duration || curated?.duration || 0,
    playlistIndex: index,
  }
}

export function MusicPlayer({ playRequest, children }) {
  const initialSlug = useRef(new URLSearchParams(location.search).get('track') || document.querySelector('meta[name=bc-track]')?.content || siteContent.featuredSlug)
  const initialRelease = siteContent.releases.find(release => release.slug === initialSlug.current) || siteContent.releases[0]
  const [tracks, setTracks] = useState(siteContent.releases)
  const [track, setTrack] = useState(initialRelease)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [playerInView, setPlayerInView] = useState(true)
  const playerSurface = useRef(null)
  const [status, setStatus] = useState('Loading the player…')
  const [failed, setFailed] = useState(false)
  const [revision, setRevision] = useState(0)
  const [position, setPosition] = useState(0)
  const [focused, setFocused] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const frame = useRef(null), widget = useRef(null), duration = useRef(initialRelease.duration)
  const dragging = useRef(false), pendingPlay = useRef(false), request = useRef(0)
  const trackRef = useRef(initialRelease), tracksRef = useRef(siteContent.releases)
  const readyRef = useRef(false)

  function updateLocation(release) {
    const url = new URL(location.href)
    if (siteContent.releases.some(item => item.slug === release.slug)) url.pathname = `/releases/${release.slug}.html`
    url.searchParams.set('track', release.slug)
    url.hash = 'music'
    history.replaceState(null, '', url)
    document.title = `${release.title} — Bouncing Concrete`
  }

  function syncCurrent() {
    const currentRequest = ++request.current
    widget.current?.getCurrentSoundIndex(index => {
      widget.current?.getCurrentSound(sound => {
        if (currentRequest !== request.current || !sound) return
        const release = releaseFor(sound, index)
        if (release.slug !== trackRef.current.slug) {
          setPosition(0)
          setShareStatus('')
          setShareUrl('')
        }
        trackRef.current = release
        duration.current = release.duration
        setTrack(release)
      })
    })
  }

  function choose(release) {
    if (!readyRef.current) return
    if (trackRef.current.slug === release.slug) { widget.current.play(); return }
    request.current++
    setPosition(0)
    setShareStatus('')
    setShareUrl('')
    trackRef.current = release
    duration.current = release.duration
    setTrack(release)
    updateLocation(release)
    widget.current.skip(release.playlistIndex)
    widget.current.seekTo(0)
    widget.current.play()
    syncCurrent()
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setPlayerInView(entry.isIntersecting), { threshold: 0 })
    if (playerSurface.current) observer.observe(playerSurface.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playRequest) return
    const featured = tracksRef.current.find(release => release.slug === siteContent.featuredSlug)
    if (readyRef.current && featured) {
      if (trackRef.current.slug !== featured.slug) choose(featured)
      else widget.current.play()
    } else pendingPlay.current = true
  }, [playRequest])

  useEffect(() => {
    let active = true, player, selectionResolved = false
    const playerFrame = frame.current
    readyRef.current = false
    setReady(false)
    setFailed(false)
    setStatus('Loading the player…')
    const timeout = setTimeout(() => {
      if (active && !readyRef.current) {
        setFailed(true)
        setStatus('The player is taking longer than expected. You can listen on SoundCloud below.')
      }
    }, 12000)

    loadWidgetScript().then(() => {
      if (!active) return
      player = window.SC.Widget(frame.current)
      widget.current = player
      const events = window.SC.Widget.Events
      player.bind(events.READY, () => {
        if (!active) return
        player.getSounds(sounds => {
          if (!active || !sounds?.length) return
          const available = sounds.map(releaseFor)
          tracksRef.current = available
          setTracks(available)
          const desired = available.find(release => release.slug === initialSlug.current)
          if (!selectionResolved) {
            selectionResolved = true
            if (desired && desired.playlistIndex !== initialRelease.playlistIndex) {
              player.load(siteContent.soundcloudPlaylist, { start_track: desired.playlistIndex, auto_play: false })
              return
            }
          }
          clearTimeout(timeout)
          readyRef.current = true
          setReady(true)
          setFailed(false)
          setStatus(desired ? '' : 'That track is unavailable. Explore the tracks below.')
          if (pendingPlay.current) {
            pendingPlay.current = false
            const featured = available.find(release => release.slug === siteContent.featuredSlug)
            if (featured) player.skip(featured.playlistIndex)
            player.play()
          }
          syncCurrent()
        })
      })
      player.bind(events.PLAY, () => { if (active) { setPlaying(true); setHasPlayed(true); setFailed(false); setStatus(''); syncCurrent() } })
      player.bind(events.PAUSE, () => { if (active) setPlaying(false) })
      player.bind(events.FINISH, () => { if (active) { setPlaying(false); syncCurrent() } })
      player.bind(events.PLAY_PROGRESS, event => {
        if (active && !dragging.current && Number.isFinite(event.relativePosition)) setPosition(event.relativePosition)
      })
      player.bind(events.SEEK, event => {
        if (active && !dragging.current && Number.isFinite(event.relativePosition)) setPosition(event.relativePosition)
      })
      player.bind(events.ERROR, () => {
        if (active) {
          setPlaying(false)
          setFailed(true)
          setStatus('This track could not load. Retry or listen on SoundCloud.')
        }
      })
    }).catch(() => {
      if (active) { setFailed(true); setStatus('The player could not connect. You can listen on SoundCloud below.') }
    })

    return () => {
      active = false
      request.current++
      clearTimeout(timeout)
      // The widget posts to its iframe while unbinding. React may already have
      // removed it during a refresh or retry; detached callbacks are inert.
      if (player && playerFrame?.isConnected && playerFrame.contentWindow) {
        Object.values(window.SC.Widget.Events).forEach(event => player.unbind(event))
      }
      widget.current = null
      readyRef.current = false
    }
  }, [revision])

  function seek(ratio) {
    const clamped = Math.max(0, Math.min(1, ratio))
    if (readyRef.current && duration.current > 0) {
      widget.current.seekTo(Math.round(clamped * duration.current))
      setPosition(clamped)
    }
  }

  async function share() {
    const url = new URL(location.href)
    if (siteContent.releases.some(item => item.slug === track.slug)) url.pathname = `/releases/${track.slug}.html`
    url.searchParams.set('track', track.slug)
    url.hash = 'music'
    try {
      await navigator.clipboard.writeText(url.href)
      setShareStatus('Track link copied')
    } catch {
      setShareUrl(url.href)
      setShareStatus('Copy this track link')
    }
  }

  const index = tracks.findIndex(release => release.slug === track.slug)
  const progress = `${position * 100}%`
  return <>
    <section id="music" className="release" aria-label="Listen to Bouncing Concrete">
      {children}
      <div className="release-player" ref={playerSurface}>
        <div className="wave-hitbox" style={{ '--track-progress': progress }}
          onPointerMove={event => {
            const box = event.currentTarget.getBoundingClientRect()
            event.currentTarget.style.setProperty('--wave-focus-x', `${Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100))}%`)
          }} onPointerEnter={() => setFocused(true)} onPointerLeave={() => setFocused(false)}>
          <div className={`wave${playing ? ' on' : ''}${focused ? ' is-focused' : ''}`} aria-hidden="true"><span className="wave-shock"/><span className="wave-dilation"/></div>
          <span className="playhead" aria-hidden="true"/>
          <input className="wave-scrubber" type="range" min="0" max="100" step="0.1" value={position * 100}
            disabled={!ready} aria-label="Track position" aria-valuetext={`${time(position * track.duration)} of ${time(track.duration)}`}
            onPointerDown={event => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId) }}
            onChange={event => {
              const ratio = Number(event.target.value) / 100
              setPosition(ratio)
              if (!dragging.current) seek(ratio)
            }}
            onPointerUp={event => { dragging.current = false; seek(Number(event.currentTarget.value) / 100) }}
            onPointerCancel={() => {
              dragging.current = false
              widget.current?.getPosition(milliseconds => setPosition(milliseconds / (duration.current || 1)))
            }}/>
        </div>
        <div className="playback-console">
          <div className="track-copy"><h2>{track.title}</h2><p className="track-time"><span>{time(position * track.duration)}</span><span aria-hidden="true"> / </span><span>{time(track.duration)}</span></p></div>
          <div className="transport-controls">
            <button className="icon-button" aria-label="Previous track" disabled={!ready || index <= 0} onClick={() => choose(tracks[index - 1])}><Icon name="previous"/></button>
            <button className="play-button" disabled={!ready} aria-label={playing ? 'Pause track' : 'Play track'} onClick={() => widget.current?.toggle()}><Icon name={playing ? 'pause' : 'play'}/></button>
            <button className="icon-button" aria-label="Next track" disabled={!ready || index >= tracks.length - 1} onClick={() => choose(tracks[index + 1])}><Icon name="next"/></button>
          </div>
        </div>
        <p className="player-status" role="status">{status}{failed && <button className="text-button" onClick={() => { initialSlug.current = trackRef.current.slug; setRevision(value => value + 1) }}>Retry player</button>}</p>
        <nav className="player-destinations" aria-label="Track links"><a href={track.soundcloudUrl} target="_blank" rel="noreferrer">SoundCloud <Icon name="arrow"/></a><a href={track.purchaseUrl || siteContent.bandcamp} target="_blank" rel="noreferrer">{track.purchaseUrl ? 'Buy release' : 'Bandcamp'}<Icon name="arrow"/></a><button onClick={share}>Share track <Icon name="arrow"/></button><a className="records-jump" href="#records">All records <Icon name="down"/></a></nav>
        <span className="share-status" role="status">{shareStatus}</span>
        {shareUrl && <input className="share-url" aria-label="Shareable track link" readOnly value={shareUrl} onFocus={event => event.target.select()}/>}
      </div>
    </section>
    <section id="records" className="records-section" aria-labelledby="records-title">
      <div className="records-heading"><h2 id="records-title">The records.</h2><p>Press play. Stay a while.</p></div>
      <div className="record-grid">{tracks.map(release => <article className="record" key={release.slug}>
        <button className="record-sleeve" disabled={!ready} aria-label={`Play ${release.title}`} aria-current={release.slug === track.slug ? 'true' : undefined} onClick={() => choose(release)}><RecordArt release={release}/><span className="record-play"><Icon name="play"/></span></button>
        <div className="record-caption"><div><h3>{release.title}</h3><span className="record-duration">{release.slug === siteContent.featuredSlug ? 'Featured · ' : ''}{time(release.duration)}{release.slug === track.slug && playing ? ' · Playing' : ''}</span></div><a href={release.soundcloudUrl} target="_blank" rel="noreferrer" aria-label={`${release.title} on SoundCloud`}><span>SoundCloud</span><Icon name="arrow"/></a></div>
      </article>)}</div>
    </section>
    {hasPlayed && !playerInView && <aside className="mini-player" aria-label="Persistent music player">
      <span className="mini-progress" style={{width:progress}} aria-hidden="true"/>
      <button className="mini-toggle" disabled={!ready} aria-label={playing ? 'Pause music' : 'Resume music'} onClick={() => widget.current?.toggle()}><Icon name={playing ? 'pause' : 'play'}/></button>
      <a className="mini-track" href="#music"><strong>{track.title}</strong><span>Bouncing Concrete</span></a>
      <span className="mini-time">{time(position * track.duration)} / {time(track.duration)}</span>
      <button className="icon-button" aria-label="Next track in mini player" disabled={!ready || index >= tracks.length - 1} onClick={() => choose(tracks[index + 1])}><Icon name="next"/></button>
      <a className="mini-return" href="#music" aria-label="Return to full player"><Icon name="arrow"/></a>
    </aside>}
    <iframe ref={frame} key={revision} className="soundcloud-engine" title="Bouncing Concrete audio playback" tabIndex={-1} aria-hidden="true" allow="autoplay"
      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(siteContent.soundcloudPlaylist)}&start_track=${initialRelease.playlistIndex}&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&visual=false`}/>
  </>
}
