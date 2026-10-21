export function factUrl(fact, jobId) {
  const params = new URLSearchParams()
  if (fact.category) params.set('category', fact.category)
  if (fact.topic) params.set('topic', fact.topic)
  if (fact.generated_at) params.set('at', fact.generated_at)
  if (jobId) params.set('job', jobId)
  return `/fact/?${params}`
}

export function matchesFact(fact, params) {
  if (!fact) return false
  const category = params.get('category')
  const topic = params.get('topic')
  const generatedAt = params.get('at')
  if (category && fact.category !== category) return false
  if (topic && fact.topic !== topic) return false
  if (generatedAt && fact.generated_at !== generatedAt) {
    const requestedTime = Date.parse(generatedAt)
    if (!Number.isFinite(requestedTime) || Date.parse(fact.generated_at) !== requestedTime) return false
  }
  return Boolean(topic || params.get('job'))
}

export function archiveUrl(category = '', query = '') {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (query) params.set('q', query)
  return `/discoveries/${params.size ? `?${params}` : ''}`
}
