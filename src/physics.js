export const DIAGRAM_TYPES = ['comparison', 'force', 'ray', 'energy_flow', 'graph']
export const list = (value) => Array.isArray(value) ? value : []

export function hasPhysicsLesson(fact) {
  const lesson = fact?.physics_lesson
  const collections = ['prerequisites', 'key_terms', 'explanation_steps', 'mathematics', 'misconceptions', 'applications', 'knowledge_checks']
  if (collections.some(key => lesson?.[key] != null && (!Array.isArray(lesson[key]) || lesson[key].some(item => !item || typeof item !== 'object')))) return false
  if (['givens', 'calculations'].some(key => lesson?.worked_example?.[key] != null && (!Array.isArray(lesson.worked_example[key]) || lesson.worked_example[key].some(item => !item || typeof item !== 'object')))) return false
  if (list(lesson?.mathematics).some(equation => list(equation.symbols).some(symbol => !symbol || typeof symbol !== 'object'))) return false
  return fact?.category === 'physics' && fact.schema_version === '2.0'
    && fact.article_type === 'physics_lesson' && typeof lesson?.question === 'string'
    && typeof lesson.learning_goal === 'string' && typeof lesson.intuition?.explanation === 'string'
    && list(lesson.explanation_steps).length > 0 && Boolean(lesson.worked_example?.question)
}

export function graphGeometry(diagram) {
  const points = list(diagram?.points)
  if (points.length < 2 || points.length > 20) return null
  if (points.some(p => !Number.isFinite(p?.x) || !Number.isFinite(p?.y)) || points.some((p, i) => i && p.x <= points[i - 1].x)) return null
  const xs = points.map(p => p.x), ys = points.map(p => p.y)
  const xMin = Math.min(0, ...xs), xMax = Math.max(0, ...xs), yMin = Math.min(0, ...ys)
  const yMax = Math.max(0, ...ys) === yMin ? yMin + 1 : Math.max(0, ...ys)
  if (xMax === xMin) return null
  const yRange = yMax - yMin || 1
  if (!Number.isFinite(xMax - xMin) || !Number.isFinite(yRange)) return null
  return { points: points.map(p => ({ x: 70 + (p.x - xMin) / (xMax - xMin) * 510, y: 272 - (p.y - yMin) / yRange * 220 })), xMin, xMax, yMin, yMax }
}

export function validDiagram(diagram) {
  if (!DIAGRAM_TYPES.includes(diagram?.type)) return false
  if (['comparison', 'energy_flow'].includes(diagram.type)) return list(diagram.items).length >= 2 && diagram.items.length <= 4
  if (diagram.type === 'graph') return Boolean(graphGeometry(diagram))
  if (diagram.type === 'force') return list(diagram.vectors).length > 0 && diagram.vectors.length <= 4
    && diagram.vectors.every(v => [v?.x, v?.y].every(n => Number.isFinite(n) && Math.abs(n) <= 1) && (v.x || v.y))
  return list(diagram.rays).length > 0 && diagram.rays.length <= 4
    && diagram.rays.every(v => ['x1', 'y1', 'x2', 'y2'].every(k => Number.isFinite(v?.[k]) && v[k] >= 0 && v[k] <= 1))
    && diagram.rays.every(v => v.x1 !== v.x2 || v.y1 !== v.y2)
}

export function calculationLines(example) {
  const values = new Map(list(example.givens).map(item => [item.id, `${item.value} ${item.unit}`]))
  return list(example.calculations).map(calc => {
    const operands = list(calc.operand_ids).map(id => values.get(id) || id)
    const operators = { add: ' + ', subtract: ' − ', multiply: ' × ', divide: ' ÷ ' }
    const input = calc.operation === 'sqrt' ? `√(${operands[0]})` : calc.operation === 'square' ? `(${operands[0]})²` : operands.map(value => `(${value})`).join(operators[calc.operation] || ', ')
    const output = `${calc.result} ${calc.unit}`
    values.set(calc.id, output)
    return { ...calc, expression: `${input} = ${output}` }
  })
}
