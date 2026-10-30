import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasIndianLawLesson, LAW_TYPES, lawStatus } from './indianLaws.js'
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/indian-law-lesson.json', import.meta.url)))
test('Indian Laws chooses its reader while preserving legacy and other categories', () => {
  const fact = fixture()
  assert.equal(hasIndianLawLesson(fact), true)
  for (const kind of Object.keys(LAW_TYPES)) {
    const value = fixture()
    value.indian_law_lesson.lesson_type = kind
    if (kind === 'case_explainer') value.indian_law_lesson.case_note = { name:'Synthetic case',court:'Test court',citation:'Test citation',question:'Question',decision:'Decision',significance:'Context',limits:'Test only' }
    assert.equal(hasIndianLawLesson(value), true)
  }
  assert.equal(hasIndianLawLesson({ category:'indian_laws', topic:'Legacy article' }), false)
  assert.equal(hasIndianLawLesson({ ...fact, category:'indian_constitution' }), false)
})
test('incomplete lessons fall back instead of crashing the new reader', () => {
  for (const mutate of [l => l.applicability.conditions = null, l => l.worked_example.reasoning_steps = null,
    l => l.legal_basis = [], l => l.commentary = null, l => l.explanation_steps[0].basis_ids = null]) {
    const fact = fixture(); mutate(fact.indian_law_lesson)
    assert.equal(hasIndianLawLesson(fact), false)
  }
  assert.equal(lawStatus('current'), 'Described as current')
  assert.equal(lawStatus('anything'), 'Status not supplied')
})
