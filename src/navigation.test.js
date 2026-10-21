import test from 'node:test'
import assert from 'node:assert/strict'
import { archiveUrl, factUrl, matchesFact } from './navigation.js'

const fact = { category: 'indian_laws', topic: 'A & B / न्याय?', generated_at: '2026-10-21T01:00:00Z' }

test('fact links preserve punctuation, Unicode, timestamp, and optional job ID', () => {
  const url = new URL(factUrl(fact, 'job/1'), 'https://fact.ayush.ltd')
  assert.equal(url.pathname, '/fact/')
  assert.equal(url.searchParams.get('topic'), fact.topic)
  assert.equal(url.searchParams.get('job'), 'job/1')
  assert.ok(matchesFact(fact, url.searchParams))
})

test('a shared fact link distinguishes repeated topics by category and generation time', () => {
  const params = new URL(factUrl(fact), 'https://fact.ayush.ltd').searchParams
  assert.equal(matchesFact({ ...fact, category: 'history' }, params), false)
  assert.equal(matchesFact({ ...fact, generated_at: '2026-10-20T01:00:00Z' }, params), false)
  assert.equal(matchesFact({ ...fact, topic: 'Another topic' }, params), false)
  assert.equal(matchesFact(null, params), false)
})

test('equivalent timestamp formats match, but incomplete links do not match arbitrary facts', () => {
  const params = new URLSearchParams({ topic: fact.topic, at: '2026-10-21T01:00:00.000+00:00' })
  assert.ok(matchesFact(fact, params))
  assert.equal(matchesFact(fact, new URLSearchParams('category=indian_laws')), false)
  params.set('at', 'not-a-date')
  assert.equal(matchesFact(fact, params), false)
})

test('archive links encode category and search filters without introducing extra URL parameters', () => {
  const url = new URL(archiveUrl('science', 'space & time?'), 'https://fact.ayush.ltd')
  assert.equal(url.pathname, '/discoveries/')
  assert.equal(url.searchParams.get('q'), 'space & time?')
  assert.equal(url.searchParams.get('category'), 'science')
  assert.equal(archiveUrl(), '/discoveries/')
})
