import { useEffect, useRef } from 'react'
import PhotoCredit from './PhotoCredit.jsx'

export default function ImageLightbox({ image, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    const dialog = dialogRef.current
    const overflow = document.body.style.overflow
    dialog.showModal()
    closeRef.current.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialogRef} className="image-lightbox" aria-label="Enlarged image"
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label="Close image">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
    </button>
    {image.credit ? <figure className="lightbox-figure"><img src={image.url} alt={image.alt} /><figcaption><PhotoCredit credit={image.credit} /></figcaption></figure> : <img src={image.url} alt={image.alt} />}
  </dialog>
}
