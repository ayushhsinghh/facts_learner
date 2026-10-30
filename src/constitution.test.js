import test from 'node:test'
import assert from 'node:assert/strict'
import fact from './fixtures/constitution-lesson.json' with { type: 'json' }
import { hasConstitutionLesson, verifiedExcerpt, constitutionDiagram, displayLegalDate, CONSTITUTION_TYPES, OFFICIAL_EDITION_URL } from './constitution.js'
import { biologyDiagramLayout } from './biology.js'

test('Constitution selects the new reader without changing legacy articles', () => {
  assert.equal(hasConstitutionLesson(fact), true)
  assert.equal(hasConstitutionLesson({ category:'indian_constitution',summary:'An archived article' }), false)
  assert.equal(hasConstitutionLesson({ ...fact,category:'indian_laws' }), false)
  for (const lesson_type of Object.keys(CONSTITUTION_TYPES)) assert.equal(hasConstitutionLesson({ ...fact,constitution_lesson:{ ...fact.constitution_lesson,lesson_type } }), true)
  assert.equal(hasConstitutionLesson({ ...fact,constitution_lesson:{ ...fact.constitution_lesson,constitutional_basis:[null] } }), false)
})

test('Unverified legal quotations never display as constitutional text', () => {
  const basis = { original_text:'A synthetic excerpt',text_verification:{status:'matched_official_edition',source_url:OFFICIAL_EDITION_URL,edition_date:'2024-05-01',checked_at:'2026-10-30T00:00:00Z'} }
  assert.equal(verifiedExcerpt(basis),'A synthetic excerpt')
  for (const change of [{status:'not_verified'},{source_url:'https://example.org'},{edition_date:'unknown'},{checked_at:null}]) assert.equal(verifiedExcerpt({...basis,text_verification:{...basis.text_verification,...change}}),null)
  assert.equal(verifiedExcerpt(fact.constitution_lesson.constitutional_basis[0]),null)
})

test('Diagrams and dates remain bounded and explicit across lesson types', () => {
  for (const {diagram} of Object.values(CONSTITUTION_TYPES)) assert.ok(biologyDiagramLayout(constitutionDiagram({...fact.constitution_lesson.diagram,type:diagram})))
  assert.equal(biologyDiagramLayout(constitutionDiagram({type:'script'})),null)
  assert.equal(displayLegalDate(null),'Not supplied')
  assert.equal(displayLegalDate('unknown'),'Not supplied')
  assert.equal(displayLegalDate('2024-05-01'),'1 May 2024')
})
