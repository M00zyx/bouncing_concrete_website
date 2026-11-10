export function RecordArt({ release }) {
  const sleeve = release.slug === 'concreto-incarnat' ? 'crop-18-bd5de7ab99aa' : 'crop-11-63a82a4545cd'
  return <div className="record-art" aria-hidden="true"><img className="record-art-image" src={`/assets/${sleeve}.webp`} alt="" loading="lazy" width="345" height="359"/></div>
}
