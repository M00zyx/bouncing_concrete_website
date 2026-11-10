import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { siteContent } from './content'
import { MusicPlayer } from './MusicPlayer'
import { Icon } from './Icons'
import { filmState } from './film'

const ConcreteObject = lazy(() => import('./ConcreteObject').then(module => ({ default: module.ConcreteObject })))

export function App() {
  const hero = useRef(null), video = useRef(null)
  const [progress, setProgress] = useState(0)
  const [playRequest, setPlayRequest] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const featured = siteContent.releases.find(release => release.slug === siteContent.featuredSlug)
  const scene = filmState(progress, reducedMotion)

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
        const target = filmState(next).film * Math.max(0, film.duration - .05)
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

  return <main id="top">
    <a className="skip-link" href="#music">Skip to music</a>
    <h1 className="sr-only">Bouncing Concrete — music and releases</h1>
    <section className="scroll-film" ref={hero} aria-label="Bouncing Concrete film">
      <div className="film-sticky">
        <video ref={video} muted playsInline preload="metadata" poster="/assets/scene-plate.webp" aria-hidden="true">
          {!reducedMotion && <source src="/assets/scene-web.mp4" type="video/mp4"/>}
        </video>
        <div className="film-shade" style={{ opacity: .15 + scene.poster * .4 }}/>
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Bouncing Concrete home"><img src="/assets/wordmark-gritty.webp" alt=""/></a>
          <nav aria-label="Main navigation"><a href="#music">Listen</a><a href="#records">Records</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
        </header>
        <div className="identity-scene" style={{ opacity: scene.poster, pointerEvents: scene.poster > .5 ? 'auto' : 'none' }} aria-hidden={scene.poster < .1}>
          <div className="scene-poster" style={{ transform: `translateY(${-scene.retreat * 14}vh) rotate(${-3 - scene.retreat * 3}deg)` }}>
            <img className="scene-wordmark" src="/assets/wordmark-gritty.webp" alt="Bouncing Concrete" fetchPriority="high"/>
            <div className="scene-invitation"><a className="primary-link" href="#music" tabIndex={scene.poster > .5 ? 0 : -1} onClick={() => setPlayRequest(value => value + 1)}><Icon name="play"/> Play {featured.title}</a><p>The music gets out.</p></div>
            <img className="scene-glyph" src="/assets/mark-glyph-06-sideways.webp" alt=""/>
          </div>
          <img className="hero-character" src="/assets/ornament-face.webp" alt="" style={{ transform: `translateY(${scene.retreat * 18}vh) rotate(11deg)` }}/>
          <div className="hero-wall" style={{ transform: `translateY(${scene.retreat * 32}vh) rotate(-12deg)` }} aria-hidden="true"><i/></div>
          <span className="scroll-cue">Scroll into the world <Icon name="down"/></span>
        </div>
        <p className="film-caption" style={{ opacity: (1 - scene.poster) * (1 - scene.closure) }}>Build. Bounce. Break.</p>
        <div className="containment" aria-hidden="true" style={{ opacity: scene.closure > 0 ? 1 : 0 }}>
          <div style={{ transform: `translateY(${-101 * (1 - scene.closure)}%)` }}/><div style={{ transform: `translateY(${101 * (1 - scene.closure)}%)` }}/>
        </div>
      </div>
    </section>
    <MusicPlayer playRequest={playRequest}>
      <div className="cell-architecture">
        <span className="cell-seam" aria-hidden="true"/>
        <Suspense fallback={<div className="object-stage eye-slit-stage" aria-hidden="true"/>}><ConcreteObject/></Suspense>
        <span className="cell-latch" aria-hidden="true"><i/><i/></span>
      </div>
    </MusicPlayer>
    <section id="about" className="liner-notes" aria-labelledby="about-title">
      <figure className="film-print"><img src="/assets/film-still.jpg" alt="The concrete character suspended above the street in the Bouncing Concrete film" loading="lazy" width="1280" height="720"/><figcaption>Build. Bounce. Break.</figcaption></figure>
      <div className="liner-copy"><h2 id="about-title">Music for a world still under construction.</h2><p>{siteContent.bio}</p>
        <img className="liner-art" src="/assets/ornament-three-panel-asymmetric-v4.webp" width="1881" height="836" alt="" loading="lazy"/>
        <a className="text-link" href={`mailto:${siteContent.bookingEmail}?subject=Bouncing%20Concrete%20%E2%80%94%20booking%20or%20press`}>Bookings &amp; press <Icon name="arrow"/></a>
      </div>
    </section>
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <div><h2 id="contact-title">Make some noise.</h2><a className="contact-email" href={`mailto:${siteContent.bookingEmail}`}>{siteContent.bookingEmail}<Icon name="arrow"/></a><p>Bookings, press &amp; collaborations.</p></div>
      <nav className="follow-links" aria-label="Follow Bouncing Concrete"><a href={siteContent.soundcloudProfile} target="_blank" rel="noreferrer">Follow on SoundCloud <Icon name="arrow"/></a><a href={siteContent.bandcamp} target="_blank" rel="noreferrer">Find us on Bandcamp <Icon name="arrow"/></a>{siteContent.socialLinks.map(link => <a key={link.url} href={link.url}>{link.label}<Icon name="arrow"/></a>)}{siteContent.shows.length === 0 && <span>No shows announced yet.</span>}</nav>
      {siteContent.shows.length > 0 && <div className="live-dates">{siteContent.shows.map(show => <article key={show.date + show.city}><time dateTime={show.date}>{new Date(`${show.date}T12:00:00`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</time><strong>{show.city}</strong><span>{show.venue}</span><a href={show.ticketUrl}>Tickets <Icon name="arrow"/></a></article>)}</div>}
    </section>
    <footer className="site-footer"><span>© {siteContent.footer}</span><a href="#top">Back to top <Icon name="arrow"/></a><span className="footer-location">Built, bounced and broken in Kuala Lumpur <img src="/assets/symbol-globe-tight.webp" alt="" loading="lazy"/></span></footer>
  </main>
}
