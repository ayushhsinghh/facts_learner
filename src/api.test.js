import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchFact, getFactStatus, waitForFact, shouldPollImages } from './api.js'

const target = { category: 'space', topic: 'An archived discovery', generated_at: '2026-10-21T01:00:00Z' }
const params = () => new URLSearchParams({ category: target.category, topic: target.topic, at: target.generated_at })
const response = (data, status = 200) => new Response(JSON.stringify(data), { status })

test('direct links search later archive pages even when count describes only the current page', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const query = new URL(url, 'https://example.test').searchParams
    calls.push({ query, options })
    return response(query.get('skip') === '0'
      ? { count: 100, facts: Array.from({ length: 100 }, (_, index) => ({ topic: `Other ${index}` })) }
      : { count: 1, facts: [target] })
  })
  assert.deepEqual(await fetchFact(params(), new AbortController().signal), target)
  assert.equal(calls.length, 2)
  assert.equal(calls[1].query.get('skip'), '100')
  assert.equal(calls[1].query.get('category'), 'space')
  assert.ok(calls.every(({ options }) => !options.method || options.method === 'GET'))
})

test('expired generation jobs fall back to the exact archived fact', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => url.includes('/status/')
    ? response({ error: 'Job expired' }, 404)
    : response({ facts: [target] }))
  const query = params()
  query.set('job', 'old-job')
  assert.deepEqual(await fetchFact(query, new AbortController().signal), target)
})

test('a completed generation job resolves without scanning history', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => response({ status: 'completed', data: { fact: target } }))
  const query = params()
  query.set('job', 'current-job')
  assert.deepEqual(await fetchFact(query, new AbortController().signal), target)
  assert.equal(mock.mock.callCount(), 1)
})

test('missing and incomplete discoveries report errors instead of showing unrelated content', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => response({ count: 0, facts: [] }))
  await assert.rejects(fetchFact(new URLSearchParams(), new AbortController().signal), /incomplete/)
  assert.equal(mock.mock.callCount(), 0)
  await assert.rejects(fetchFact(params(), new AbortController().signal), /no longer available/)
})

test('aborted navigation does not fetch an archive page', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected fetch') })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(fetchFact(params(), controller.signal), { name: 'AbortError' })
  assert.equal(mock.mock.callCount(), 0)
})


test('job image state reaches the fact and partial images continue polling', async (t) => {
  const state = { status: 'processing', expected: ['cover', 'overview'], ready: ['cover'], pending: ['overview'] }
  t.mock.method(globalThis, 'fetch', async () => response({ status: 'completed', data: { fact: { images: { cover: 'url' } }, image_generation: state } }))
  const result = await getFactStatus('job')
  assert.deepEqual(result.data.fact.image_generation, state)
  assert.equal(shouldPollImages(result.data.fact), true)
  assert.equal(shouldPollImages({ image_generation: { status: 'partial' } }), false)
  assert.equal(shouldPollImages({ image_generation: { status: 'failed' } }), false)
  assert.equal(shouldPollImages({ visual_suggestions: { cover: 'a', overview: 'b' }, images: { cover: 'url' } }), true)
})

test('generation polling stops on completion and failure', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => response(++calls === 1 ? { status: 'processing' } : { status: 'completed', data: { fact: target } }))
  const result = await waitForFact({ job_id: 'job' }, undefined, { intervalMs: 1, timeoutMs: 500 })
  assert.deepEqual(result.data.fact, target)
  t.mock.restoreAll()
  t.mock.method(globalThis, 'fetch', async () => response({ status: 'failed', error: 'Generation failed' }))
  await assert.rejects(waitForFact({ job_id: 'job' }, undefined, { intervalMs: 1, timeoutMs: 500 }), /Generation failed/)
})

test('generation has a deadline even when the status fetch stalls', async (t) => {
  let aborted = false
  t.mock.method(globalThis, 'fetch', async (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(signal.reason) }, { once: true })
  }))
  await assert.rejects(waitForFact({ job_id: 'job' }, undefined, { intervalMs: 1, timeoutMs: 30 }), /took too long/)
  assert.equal(aborted, true)
})

test('navigation cancellation stops polling without another fetch', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => response({ status: 'processing' }))
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(waitForFact({ job_id: 'job' }, controller.signal), { name: 'AbortError' })
  assert.equal(fetch.mock.callCount(), 0)
})
