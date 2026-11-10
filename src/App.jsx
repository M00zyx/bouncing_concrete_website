import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { siteContent } from './content'
import { MusicPlayer } from './MusicPlayer'

const ConcreteObject = lazy(() => import('./ConcreteObject').then(module => ({ default: module.ConcreteObject })))

export function App() {
  const hero = useRef(null), video = useRef(null)
  const [progress, setProgress] = useState(0)
  const [playRequest, setPlayRequest] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const featured = siteContent.releases.find(release => release.slug === siteContent.featuredSlug)

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReducedMotion(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    let frame = 0, lastProgress = -1
    const update = () => {
      frame = 0
      const section = hero.current, film = video.current
      if (!section) return
      const box = section.getBoundingClientRect()
      const next = Math.max(0, Math.min(1, -box.top / (section.offsetHeight - innerHeight)))
      if (Math.abs(next - lastProgress) > .001) { setProgress(next); lastProgress = next }
      if (!reducedMotion && film?.duration && Number.isFinite(film.duration)) {
        const target = next * Math.max(0, film.duration - .05)
        if (Math.abs(film.currentTime - target) > 1 / 30) film.currentTime = target
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const film = video.current
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    film?.addEventListener('loadedmetadata', schedule)
    schedule()
    return () => {
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      film?.removeEventListener('loadedmetadata', schedule)
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  const posterOpacity = reducedMotion ? 1 : progress < .42 ? 1 : Math.max(0, 1 - (progress - .42) / .08)
  const detailOpacity = reducedMotion ? 0 : progress < .5 ? 0 : Math.min(1, (progress - .5) / .1)
  return <main id="top">
    <a className="skip-link" href="#music">Skip to music</a>
    <h1 className="sr-only">Bouncing Concrete — music from Kuala Lumpur</h1>
    <section className="scroll-film" ref={hero} aria-label="Bouncing Concrete film">
      <div className="film-sticky">
        <video ref={video} muted playsInline preload="metadata" poster="/assets/scene-plate.webp" aria-hidden="true">
          {!reducedMotion && <source src="/assets/scene-web.mp4" type="video/mp4"/>}
        </video>
        <div className="film-vignette"/>
        <nav aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Bouncing Concrete home">BOUNCING<br/>CONCRETE</a>
          <div><a href="#music">MUSIC</a><a href="#about">ABOUT</a><a href="#shows">LIVE</a></div>
        </nav>
        <article className="poster" onPointerMove={event => {
          if (reducedMotion) return
          const box = event.currentTarget.getBoundingClientRect()
          event.currentTarget.style.setProperty('--px', `${(event.clientX - box.left) / box.width - .5}`)
          event.currentTarget.style.setProperty('--py', `${(event.clientY - box.top) / box.height - .5}`)
        }} style={{ opacity: posterOpacity, transform: `translate(-50%, calc(-50% + ${(1 - posterOpacity) * -6}vh))` }}>
          <img className="poster-wordmark" src="/assets/wordmark-gritty.webp" alt="Bouncing Concrete" fetchPriority="high"/>
          <img className="poster-ornament face" style={{ '--drop': `${reducedMotion ? 0 : progress * 245}vh` }} src="/assets/ornament-face.webp" alt=""/>
          <img className="poster-ornament flower" style={{ '--drop': `${reducedMotion ? 0 : Math.max(0, progress - .07) * 145}vh` }} src="/assets/ornament-flower.webp" alt=""/>
          <img className="poster-ornament checker" style={{ '--drop': `${reducedMotion ? 0 : Math.max(0, progress - .11) * 115}vh` }} src="/assets/ornament-checker.webp" alt=""/>
          <img className="poster-ornament cross" style={{ '--drop': `${reducedMotion ? 0 : Math.max(0, progress - .16) * 90}vh` }} src="/assets/ornament-cross.webp" alt=""/>
          <img className="poster-symbol globe" src="/assets/symbol-globe.webp" alt=""/>
          <i className="poster-checker" aria-hidden="true"/>
          <div className="poster-index"><img className="mark-glyph" src="/assets/mark-glyph-06-sideways.webp" alt=""/><img className="mark-hatch" src="/assets/mark-hatch-alpha.webp" alt=""/><b>{siteContent.poster.sequence}</b></div>
          <span className="poster-coordinates">{siteContent.poster.coordinates[0]}<br/>{siteContent.poster.coordinates[1]}</span>
          <span className="poster-arrow" aria-hidden="true">↓</span>
        </article>
        <div className="video-ornaments" style={{ opacity: detailOpacity }}><b>BUILD. BOUNCE. BREAK.</b><i/></div>
        <div className="hero-release" style={{ opacity: posterOpacity, pointerEvents: posterOpacity > .5 ? 'auto' : 'none' }}>
          <span>FROM KUALA LUMPUR<br/><strong>{featured.title}</strong></span>
          <a className="primary-link" href="#music" onClick={() => setPlayRequest(value => value + 1)}>Play {featured.title} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
    <section id="music" className="release" aria-label="Listen to Bouncing Concrete">
      <Suspense fallback={<div className="object-stage eye-slit-stage" aria-hidden="true"/>}><ConcreteObject/></Suspense>
      <MusicPlayer playRequest={playRequest}/>
    </section>
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="about-copy"><h2 id="about-title">{siteContent.statement}</h2><p>{siteContent.bio}</p>
        <a className="text-link" href={`mailto:${siteContent.bookingEmail}?subject=Bouncing%20Concrete%20%E2%80%94%20booking%20or%20press`}>Bookings &amp; press ↗</a>
      </div>
      <div className="about-signal" aria-hidden="true"><img className="signal-eye" src="/assets/ornament-three-panel-asymmetric-v4.webp" loading="lazy" width="1881" height="836" alt=""/></div>
    </section>
    <section id="shows" className="shows" aria-labelledby="shows-title">
      <div className="show-list"><h2 id="shows-title">Out of the cell.<br/>Into the room.</h2>
        {siteContent.shows.length ? siteContent.shows.map(show => <article className="show" key={show.date + show.city}>
          <time dateTime={show.date}>{new Date(`${show.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          <div><strong>{show.city}</strong><span>{show.venue}</span></div><a href={show.ticketUrl}>Tickets ↗</a>
        </article>) : <p className="show-empty">No shows announced yet.</p>}
        <p>For live bookings and collaborations, get in touch.</p>
        <a className="text-link" href={`mailto:${siteContent.bookingEmail}`}>{siteContent.bookingEmail} ↗</a>
      </div>
      <aside className="follow-panel" aria-labelledby="follow-title"><h3 id="follow-title">Keep an ear out.</h3>
        <p>Follow Bouncing Concrete for the next release.</p>
        <a className="primary-link" href={siteContent.soundcloudProfile} target="_blank" rel="noreferrer">Follow on SoundCloud ↗</a>
        <a className="text-link" href={siteContent.bandcamp} target="_blank" rel="noreferrer">Find us on Bandcamp ↗</a>
      </aside>
    </section>
    <footer><span>© {siteContent.footer}</span>
      <nav aria-label="Connect"><a href={siteContent.soundcloudProfile} target="_blank" rel="noreferrer">SoundCloud ↗</a><a href={siteContent.bandcamp} target="_blank" rel="noreferrer">Bandcamp ↗</a>{siteContent.socialLinks.map(link => <a key={link.url} href={link.url}>{link.label} ↗</a>)}<a href={`mailto:${siteContent.bookingEmail}`}>Contact ↗</a></nav>
      <span className="footer-location">BUILT, BOUNCED AND BROKEN IN KUALA LUMPUR <img src="/assets/symbol-globe-tight.webp" alt="" loading="lazy"/></span>
    </footer>
  </main>
}
