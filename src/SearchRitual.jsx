import { useEffect, useRef, useState } from 'react'

// The instrument is indeterminate. Its cycles never imply backend progress.
export default function SearchRitual({ categoryName, elapsed }) {
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(() => document.hidden)
  const headingRef = useRef(null)
  const message = elapsed < 50
    ? 'Generating your discovery'
    : elapsed < 90
      ? 'Still generating. Some discoveries take longer.'
      : 'Taking longer than usual. Still waiting for the result.'

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return (
    <section className="search-ritual" data-motion-paused={paused || hidden} aria-labelledby="search-heading">
      <div className="archive-aperture" aria-hidden="true">
        <div className="aperture-frame">
          <svg className="aperture-guides" viewBox="0 0 360 360" fill="none">
            <circle cx="180" cy="180" r="157" />
            <circle cx="180" cy="180" r="118" />
            <path d="M180 9v14m0 314v14M9 180h14m314 0h14" />
            <path d="M66 66l7 7m214 214 7 7M66 294l7-7M287 73l7-7" />
          </svg>
          <svg className="aperture-scan" viewBox="0 0 360 360" fill="none">
            <path className="aperture-trail" d="M180 23a157 157 0 0 1 157 157" />
            <path className="aperture-ray" d="M223 180h114" />
            <circle className="aperture-point" cx="337" cy="180" r="3" />
          </svg>
          <svg className="aperture-counter" viewBox="0 0 360 360" fill="none">
            <path d="M62 180a118 118 0 0 1 118-118m0 236a118 118 0 0 0 118-118" />
            <circle cx="180" cy="62" r="2" />
          </svg>
          <div className="aperture-echo aperture-echo-one" />
          <div className="aperture-echo aperture-echo-two" />
          <div className="aperture-heart"><span /><i /></div>
        </div>
      </div>

      <h1 id="search-heading" ref={headingRef} tabIndex={-1}>
        Searching through <em>{categoryName}</em>
      </h1>
      <div className="search-status" role="status" aria-live="polite" aria-atomic="true">
        <span key={message}>{message}</span>
      </div>
      <div className="search-time">
        <span aria-label={`${elapsed} seconds elapsed`}>
          <span className="search-clock">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>
          <span aria-hidden="true"> elapsed</span>
        </span>
        <span>Usually 35–50 seconds</span>
      </div>
      <button className="search-motion-toggle" type="button" aria-pressed={paused} onClick={() => setPaused((current) => !current)}>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {paused ? <path d="m6 3 6 5-6 5V3Z" /> : <path d="M5.5 3v10m5-10v10" />}
        </svg>
        {paused ? 'Resume motion' : 'Pause motion'}
      </button>
    </section>
  )
}
