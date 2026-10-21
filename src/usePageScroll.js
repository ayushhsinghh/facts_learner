import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Keep navigation state in this tab's memory; no account or stored reading history.
const positions = new Map()

export function usePageScroll(ready = true) {
  const rootRef = useRef(null)
  const location = useLocation()
  const navigationType = useNavigationType()
  const entryKey = `${location.key}:${location.hash}`

  useLayoutEffect(() => {
    if (!ready || !rootRef.current) return undefined
    const root = rootRef.current
    const previous = navigationType === 'POP' ? positions.get(entryKey) : null
    let cancelled = false
    let frame
    let lastTop = window.scrollY
    const details = [...root.querySelectorAll('details')]
    previous?.openDetails?.forEach((open, index) => { if (details[index]) details[index].open = open })

    function restore() {
      if (cancelled) return
      if (previous) {
        window.scrollTo({ top: previous.top, behavior: 'instant' })
      } else if (location.hash) {
        let id
        try { id = decodeURIComponent(location.hash.slice(1)) } catch { return }
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
      } else if (navigationType !== 'REPLACE') {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }

    function save() {
      positions.set(entryKey, { top: lastTop, openDetails: details.map((element) => element.open) })
    }
    function scheduleSave() {
      lastTop = window.scrollY
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(save)
    }
    function stopRestoring() { cancelled = true; lastTop = window.scrollY }

    restore()
    lastTop = window.scrollY
    if (navigationType === 'PUSH' && !location.hash) {
      const heading = root.querySelector('h1, h2')
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }) }
    }
    // Images can arrive after cached article markup. Restore again after they settle,
    // unless the reader has already started interacting with the page.
    Promise.all([...root.querySelectorAll('img')].map((image) => image.decode().catch(() => {}))).then(restore)
    window.addEventListener('scroll', scheduleSave, { passive: true })
    window.addEventListener('pagehide', save)
    root.addEventListener('toggle', scheduleSave, true)
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(event, stopRestoring, { passive: true })
    }
    return () => {
      save()
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleSave)
      window.removeEventListener('pagehide', save)
      root.removeEventListener('toggle', scheduleSave, true)
      for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(event, stopRestoring)
    }
  }, [entryKey, location.hash, navigationType, ready])

  return rootRef
}
