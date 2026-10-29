export const BIOLOGY_TYPES = {
  process: { title: 'Follow the process', diagram: 'sequence' },
  structure_function: { title: 'How the parts support the function', diagram: 'structure_map' },
  inheritance: { title: 'Follow the inheritance', diagram: 'inheritance' },
  adaptation_evolution: { title: 'Across generations', diagram: 'population_sequence' },
  ecosystem: { title: 'How the relationships work', diagram: 'relationship_map' },
}
const objects = value => Array.isArray(value) && value.every(item => item && typeof item === 'object')
export function hasBiologyLesson(fact) {
  const lesson = fact?.biology_lesson
  return fact?.category === 'biology' && fact.schema_version === '2.0' && fact.article_type === 'biology_lesson'
    && Boolean(BIOLOGY_TYPES[lesson?.lesson_type]) && typeof lesson.question === 'string'
    && typeof lesson.big_idea?.explanation === 'string' && Boolean(lesson.context && lesson.worked_example && lesson.change_scenario && lesson.evidence_and_limits)
    && ['key_players', 'explanation_steps', 'misconceptions', 'key_terms', 'deeper_detail', 'knowledge_checks'].every(key => objects(lesson[key]))
    && lesson.explanation_steps.length > 0 && lesson.explanation_steps.every(step => Array.isArray(step.player_ids))
    && objects(lesson.evidence_and_limits.evidence)
}
export function biologyDiagramLayout(diagram) {
  if (!diagram || !Object.values(BIOLOGY_TYPES).some(item => item.diagram === diagram.type)
      || !objects(diagram.nodes) || diagram.nodes.length < 2 || diagram.nodes.length > 6
      || !objects(diagram.edges) || diagram.edges.length < 1 || diagram.edges.length > 10) return null
  const ids = diagram.nodes.map(node => node.id)
  if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length
      || diagram.edges.some(edge => !ids.includes(edge.from_id) || !ids.includes(edge.to_id) || edge.from_id === edge.to_id)) return null
  const sequence = ['sequence', 'population_sequence'].includes(diagram.type)
  // Infer generations from explicit parent-to-descendant links, never array order.
  const levels = Object.fromEntries(ids.map(id => [id, 0]))
  if (diagram.type === 'inheritance') {
    for (let pass = 0; pass < ids.length; pass++) {
      let changed = false
      for (const edge of diagram.edges) {
        if (levels[edge.to_id] <= levels[edge.from_id]) { levels[edge.to_id] = levels[edge.from_id] + 1; changed = true }
      }
      if (!changed) break
      if (pass === ids.length - 1) return null
    }
  }
  const nodes = diagram.nodes.map((node, i) => {
    if (sequence) return { ...node, x: 50 + i * 540 / (ids.length - 1), y: 150 }
    if (diagram.type === 'inheritance') {
      const peers = ids.filter(id => levels[id] === levels[node.id])
      return { ...node, x: 640 * (peers.indexOf(node.id) + 1) / (peers.length + 1), y: 45 + 210 * levels[node.id] / Math.max(1, ...Object.values(levels)) }
    }
    const angle = i * Math.PI * 2 / ids.length - Math.PI / 2
    return { ...node, x: 320 + Math.cos(angle) * 220, y: 150 + Math.sin(angle) * 100 }
  })
  return { nodes, edges: diagram.edges.map(edge => ({ ...edge, from: nodes[ids.indexOf(edge.from_id)], to: nodes[ids.indexOf(edge.to_id)] })) }
}
