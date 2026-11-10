export function RecordArt({ release }) {
  const concrete = release.slug === 'concreto-incarnat'
  return <div className={`record-art ${concrete ? 'record-art-concrete' : 'record-art-funk'}`} aria-hidden="true">
    {concrete ? <img className="record-material" src="/assets/record-aperture.webp" alt="" loading="lazy"/> : <img className="record-character" src="/assets/ornament-face.webp" alt="" loading="lazy"/>}
    <span className="record-art-artist">BOUNCING CONCRETE</span>
    <strong className="record-art-title">{concrete ? <>CONCRETO<br/>INCARNAT</> : release.title}</strong>
    <div className="record-art-edge"/>
    {!concrete && <img className="record-art-flower" src="/assets/ornament-flower.webp" alt="" loading="lazy"/>}
  </div>
}
