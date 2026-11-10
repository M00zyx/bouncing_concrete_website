export function Icon({ name, className = '' }) {
  const paths = {
    play: <path d="m8 5 12 7-12 7Z" fill="currentColor" stroke="none"/>,
    pause: <path d="M8 5v14M16 5v14" strokeWidth="4"/>,
    next: <><path d="m5 5 10 7-10 7Z" fill="currentColor" stroke="none"/><path d="M19 5v14"/></>,
    previous: <><path d="m19 5-10 7 10 7Z" fill="currentColor" stroke="none"/><path d="M5 5v14"/></>,
    arrow: <path d="M5 19 19 5M5 5h14v14"/>,
    down: <path d="M12 3v18M5 14l7 7 7-7"/>,
  }
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false">{paths[name] || paths.arrow}</svg>
}
