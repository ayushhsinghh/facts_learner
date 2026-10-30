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
  const payload = await parseResponse(response)
  if (payload?.data?.fact && payload.data.image_generation) {
    payload.data.fact.image_generation = payload.data.image_generation
  }
  return payload
}

export function shouldPollImages(fact) {
  if (!fact) return false
  if (fact.image_generation) return fact.image_generation.status === 'processing'
  // Compatibility with older servers that do not expose image states.
  const prompts = fact.visual_suggestions || {}
  const keys = ['cover', 'overview', 'how_it_works', 'explanation_2', 'explanation_3', 'explanation_4', 'explanation_5', 'explanation_6', 'myth_visual', 'truth_visual']
    .filter((key) => prompts[key])
  if (prompts.history && !keys.includes('overview')) keys.push('overview')
  return keys.some((key) => !fact.images?.[key])
}

function abortableWait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })
}

export async function waitForFact(job, signal, options = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort(signal.reason || new DOMException('Aborted', 'AbortError'))
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const serverTimeout = Number(job.timeout_seconds)
  const timeoutMs = options.timeoutMs ?? ((Number.isFinite(serverTimeout) && serverTimeout > 0 ? Math.min(serverTimeout, 1800) : 1230) + 15) * 1000
  const intervalMs = options.intervalMs ?? 4000
  const timer = setTimeout(() => controller.abort(new Error('This discovery took too long. Please try again.')), timeoutMs)
  try {
    while (!controller.signal.aborted) {
      await abortableWait(intervalMs, controller.signal)
      const result = await getFactStatus(job.job_id, controller.signal)
      if (result.status === 'completed') return result
      if (result.status === 'failed') throw new Error(result.error || 'This discovery could not be prepared.')
    }
    throw controller.signal.reason
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
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
