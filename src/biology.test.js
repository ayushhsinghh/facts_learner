import test from 'node:test'
import assert from 'node:assert/strict'
import fact from './fixtures/biology-lesson.json' with { type: 'json' }
import { hasBiologyLesson, biologyDiagramLayout, BIOLOGY_TYPES } from './biology.js'

test('Biology lessons select their reader and preserve legacy fallback', () => {
  assert.equal(hasBiologyLesson(fact), true)
  assert.equal(hasBiologyLesson({ category: 'biology', summary: 'An archived article' }), false)
  assert.equal(hasBiologyLesson({ ...fact, category: 'physics' }), false)
  for (const lesson_type of Object.keys(BIOLOGY_TYPES)) assert.equal(hasBiologyLesson({ ...fact, biology_lesson: { ...fact.biology_lesson, lesson_type } }), true)
  assert.equal(hasBiologyLesson({ ...fact, biology_lesson: { ...fact.biology_lesson, key_players: [null] } }), false)
})

test('Biology diagram layouts stay bounded for each supported format', () => {
  for (const { diagram } of Object.values(BIOLOGY_TYPES)) {
    const result = biologyDiagramLayout({ ...fact.biology_lesson.diagram, type: diagram })
    assert.equal(result.nodes.length, 3)
    assert.ok(result.nodes.every(node => Number.isFinite(node.x) && Number.isFinite(node.y) && node.x >= 20 && node.x <= 620 && node.y >= 20 && node.y <= 280))
    assert.ok(result.edges.every(edge => edge.from && edge.to))
  }
  assert.equal(biologyDiagramLayout({ ...fact.biology_lesson.diagram, type: 'script' }), null)
  assert.equal(biologyDiagramLayout({ ...fact.biology_lesson.diagram, edges: [{ from_id: 'a', to_id: 'missing' }] }), null)
  assert.equal(biologyDiagramLayout({ ...fact.biology_lesson.diagram, nodes: [null] }), null)
  const ancestry = biologyDiagramLayout({ ...fact.biology_lesson.diagram, type: 'inheritance' })
  assert.ok(ancestry.edges.every(edge => edge.from.y < edge.to.y))
  assert.equal(biologyDiagramLayout({ ...fact.biology_lesson.diagram, type: 'inheritance', edges: [{from_id:'a',to_id:'b'},{from_id:'b',to_id:'a'}] }), null)
})
