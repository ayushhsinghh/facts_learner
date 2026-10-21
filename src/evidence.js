export function safeSourceUrl(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (!/^https?:\/\//i.test(text) || /[\s\u0000-\u001f\u007f]/.test(text)) return ''
  try {
    const url = new URL(text)
    return url.hostname && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}

export function sourceRecords(fact) {
  const records = []
  const ids = new Set()
  for (const source of Array.isArray(fact.sources) ? fact.sources : []) {
    if (!source || typeof source !== 'object' || typeof source.id !== 'string'
      || !source.id.trim() || ids.has(source.id) || typeof source.title !== 'string' || !source.title.trim()) continue
    ids.add(source.id)
    records.push({ ...source, url: safeSourceUrl(source.url) })
  }
  return records
}

export function citedSources(sourceIds, sources) {
  const ids = new Set(Array.isArray(sourceIds) ? sourceIds : [])
  return sources.filter((source) => ids.has(source.id))
}

export function legacyReferences(fact) {
  return (Array.isArray(fact.sources_or_references) ? fact.sources_or_references : [])
    .filter((source) => typeof source === 'string' && source.trim())
}

export function legacyReferenceParts(text) {
  // Existing articles retain their original text; link only explicit URLs.
  return text.split(/(https?:\/\/[^\s<>"']+)/g).filter(Boolean).map((part) => {
    const match = part.match(/^(https?:\/\/.*?)([.,;!?)\]]*)$/)
    const url = match ? safeSourceUrl(match[1]) : ''
    return { text: part, url, label: url ? match[1] : part, suffix: url ? match[2] : '' }
  })
}
