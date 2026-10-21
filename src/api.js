import { matchesFact } from './navigation.js'

const API_ROOT = import.meta.env?.VITE_FACTS_API_URL || ''

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      response.status === 429
        ? 'The index has reached today’s limit of ten new facts. Please return tomorrow.'
        : payload?.error || payload?.detail || `The archive returned an error (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return payload
}

export async function fetchCategories(signal) {
  const response = await fetch(`${API_ROOT}/api/facts/categories`, { signal })
  const payload = await parseResponse(response)
  return payload.categories || []
}

export async function fetchHistory({ limit = 20, skip = 0, category, signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) })
  if (category) params.set('category', category)

  const response = await fetch(`${API_ROOT}/api/facts/history?${params}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  const payload = await parseResponse(response)
  return {
    facts: Array.isArray(payload.facts) ? payload.facts : [],
    count: Number(payload.count) || 0,
  }
}

export async function startFact(category, apiKey, signal) {
  const params = new URLSearchParams({ category })
  const response = await fetch(`${API_ROOT}/api/facts/generate?${params}`, {
    method: 'POST',
    headers: { 
      Accept: 'application/json',
      'X-Facts-Api-Key': apiKey || ''
    },
    signal,
  })
  return parseResponse(response)
}

export async function getFactStatus(jobId, signal) {
  const response = await fetch(`${API_ROOT}/api/facts/status/${encodeURIComponent(jobId)}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  return parseResponse(response)
}

export async function fetchFact(params, signal) {
  const jobId = params.get('job')
  if (!params.get('topic') && !jobId) throw new Error('This discovery link is incomplete.')
  if (jobId) {
    try {
      const result = await getFactStatus(jobId, signal)
      if (result.status === 'completed' && matchesFact(result.data?.fact, params)) return result.data.fact
    } catch (error) {
      if (error.name === 'AbortError') throw error
      // Generation jobs can expire; the archived copy is the durable fallback.
      if (!params.get('topic')) throw error
    }
  }
  if (!params.get('topic')) throw new Error('This discovery is not ready. Please open it again later.')

  const limit = 100
  let skip = 0
  while (!signal?.aborted) {
    const page = await fetchHistory({ category: params.get('category') || undefined, limit, skip, signal })
    const match = page.facts.find((fact) => matchesFact(fact, params))
    if (match) return match
    if (page.facts.length < limit) break
    skip += page.facts.length
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  throw new Error('This discovery is no longer available in the archive.')
}
