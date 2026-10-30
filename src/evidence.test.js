import test from 'node:test'
import assert from 'node:assert/strict'
import { safeSourceUrl, sourceRecords, citedSources, legacyReferences, legacyReferenceParts } from './evidence.js'
import { OFFICIAL_EDITION_URL } from './constitution.js'

test('bottom references preserve sources previously shown in myth evidence cards', () => {
  assert.deepEqual(legacyReferences({
    sources_or_references: ['A study'],
    debunk_evidence: [{ source: 'Another study' }, { source: 'A study' }, null, { source: {} }],
  }), ['A study', 'Another study'])
})

test('the official constitutional edition stays available once in bottom references', () => {
  const fact = { article_type: 'constitution_lesson', constitution_lesson: {} }
  const records = sourceRecords(fact)
  assert.equal(records.length, 1)
  assert.equal(records[0].url, OFFICIAL_EDITION_URL)
  assert.equal(sourceRecords({ ...fact, sources: records }).length, 1)
})

test('source IDs resolve once, without accepting unsafe URLs or duplicates', () => {
  const sources = sourceRecords({ sources: [
    { id: 's1', title: 'A study', url: 'https://example.org/study' },
    { id: 's1', title: 'A duplicate', url: 'https://other.example' },
    { id: 's2', title: 'Unsafe', url: 'javascript:alert(1)' }, null,
  ] })
  assert.equal(sources.length, 2)
  assert.equal(sources[1].url, '')
  assert.deepEqual(citedSources(['s1', 'missing', 's1'], sources), [sources[0]])
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//example.org', 'https://user:pass@example.org', 'https://example.org/\nx']) {
    assert.equal(safeSourceUrl(url), '')
  }
})

test('legacy references preserve text and link only existing explicit URLs', () => {
  const text = 'A book; https://example.org/paper. No inferred URL.'
  assert.deepEqual(legacyReferences({ sources_or_references: [text, null, {}] }), [text])
  const parts = legacyReferenceParts(text)
  assert.equal(parts.map((part) => part.text).join(''), text)
  assert.equal(parts.find((part) => part.url).url, 'https://example.org/paper')
  assert.equal(legacyReferenceParts('A book with no URL').some((part) => part.url), false)
})
