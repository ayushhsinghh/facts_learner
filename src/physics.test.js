import test from 'node:test'
import assert from 'node:assert/strict'
import lesson from './fixtures/physics-lesson.json' with { type: 'json' }
import { hasPhysicsLesson, graphGeometry, validDiagram, calculationLines } from './physics.js'

test('new Physics lessons are selected without changing legacy or other categories', () => {
  assert.equal(hasPhysicsLesson(lesson), true)
  assert.equal(hasPhysicsLesson({ category: 'physics', summary: 'Archived fact' }), false)
  assert.equal(hasPhysicsLesson({ ...lesson, category: 'history' }), false)
  assert.equal(hasPhysicsLesson({ ...lesson, schema_version: 'future' }), false)
  assert.equal(hasPhysicsLesson({ ...lesson, physics_lesson: {} }), false)
  assert.equal(hasPhysicsLesson({ ...lesson, physics_lesson: { ...lesson.physics_lesson, explanation_steps: [null] } }), false)
})

test('numerical steps display the inputs, operation, result, and units', () => {
  assert.equal(calculationLines(lesson.physics_lesson.worked_example)[0].expression, '(12 N) ÷ (3 kg) = 4 m/s^2')
})

test('diagrams reject unsupported or non-finite input and preserve bounded coordinates', () => {
  assert.equal(validDiagram(lesson.physics_lesson.diagram), true)
  assert.equal(validDiagram({ type: 'script', code: 'alert(1)' }), false)
  assert.equal(validDiagram({ type: 'force', vectors: [{ x: Infinity, y: 0 }] }), false)
  assert.equal(validDiagram({ type: 'ray', rays: [{ x1: 0, y1: 0, x2: 99, y2: 1 }] }), false)
  assert.equal(validDiagram({ type: 'comparison', items: [] }), false)
  for (const type of ['comparison', 'energy_flow']) assert.equal(validDiagram({type, items:[{label:'A'},{label:'B'}]}), true)
})

test('graphs handle negative and zero ranges without NaN or page-scale geometry', () => {
  for (const points of [[{x:-2,y:-3},{x:4,y:5}], [{x:0,y:0},{x:2,y:0}]]) {
    const graph = graphGeometry({ points })
    assert.ok(graph.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 70 && p.x <= 580 && p.y >= 52 && p.y <= 272))
  }
  assert.equal(graphGeometry({points:[{x:1,y:0},{x:1,y:2}]}), null)
  assert.equal(graphGeometry({points:[{x:NaN,y:1}]}), null)
})
