import test from 'node:test'
import assert from 'node:assert/strict'
import fact from './fixtures/psychology-lesson.json' with { type: 'json' }
import { hasPsychologyLesson, psychologyDiagram, studyNumber, studyYear, PSYCHOLOGY_TYPES } from './psychology.js'
import { biologyDiagramLayout } from './biology.js'

test('Psychology selects its reader without changing legacy articles', () => {
  assert.equal(hasPsychologyLesson(fact), true)
  assert.equal(hasPsychologyLesson({ category: 'psychology', summary: 'Archived' }), false)
  assert.equal(hasPsychologyLesson({ ...fact, category: 'biology' }), false)
  for (const lesson_type of Object.keys(PSYCHOLOGY_TYPES)) assert.equal(hasPsychologyLesson({ ...fact, psychology_lesson: { ...fact.psychology_lesson, lesson_type } }), true)
  assert.equal(hasPsychologyLesson({ ...fact, psychology_lesson: { ...fact.psychology_lesson, evidence: [null] } }), false)
})

test('Psychology diagrams preserve relationship semantics and reject unsupported types', () => {
  for (const { diagram } of Object.values(PSYCHOLOGY_TYPES)) assert.ok(biologyDiagramLayout(psychologyDiagram({ ...fact.psychology_lesson.diagram, type: diagram })))
  const association = psychologyDiagram({ ...fact.psychology_lesson.diagram, edges:[{from_id:'stimulus',to_id:'response',relationship_type:'association'}] })
  assert.equal(biologyDiagramLayout(association).edges[0].relationship_type, 'association')
  assert.equal(biologyDiagramLayout(psychologyDiagram({ type:'script' })), null)
})

test('unknown study counts remain distinct from zero or invalid values', () => {
  assert.equal(studyNumber(1000), '1,000')
  assert.equal(studyYear(1935), '1935')
  assert.equal(studyYear(null), 'Not reported')
  for (const value of [null, undefined, 0, -1, 1.5, '100', Infinity]) assert.equal(studyNumber(value), 'Not reported')
})
