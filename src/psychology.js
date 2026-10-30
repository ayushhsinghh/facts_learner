export const PSYCHOLOGY_TYPES = {
  cognitive_process: { title: 'Follow the mental process', diagram: 'process_map', layout: 'sequence' },
  learning_behavior: { title: 'How experience shapes the response', diagram: 'feedback_loop', layout: 'relationship_map' },
  social_influence: { title: 'Compare the situations', diagram: 'situation_comparison', layout: 'sequence' },
  research_finding: { title: 'Understand the research question', diagram: 'study_design', layout: 'sequence' },
}
const objects = value => Array.isArray(value) && value.every(item => item && typeof item === 'object')
export function hasPsychologyLesson(fact) {
  const lesson = fact?.psychology_lesson
  return fact?.category === 'psychology' && fact.schema_version === '2.0' && fact.article_type === 'psychology_lesson'
    && Object.hasOwn(PSYCHOLOGY_TYPES, lesson?.lesson_type) && typeof lesson.question === 'string'
    && typeof lesson.opening_scenario?.situation === 'string' && typeof lesson.big_idea?.explanation === 'string'
    && Boolean(lesson.worked_example && lesson.replication && lesson.boundary_conditions)
    && ['explanation_steps', 'alternative_explanations', 'evidence', 'practical_application', 'key_terms', 'deeper_detail', 'knowledge_checks'].every(key => objects(lesson[key]))
    && lesson.explanation_steps.length > 0 && lesson.evidence.length > 0
    && lesson.evidence.every(item => item.study_notes && objects(item.statistics))
}
export function psychologyDiagram(diagram) {
  const format = Object.values(PSYCHOLOGY_TYPES).find(item => item.diagram === diagram?.type)
  if (!format) return { ...diagram, type: 'none' }
  return { ...diagram, type: format.layout }
}
export function studyNumber(value) {
  return Number.isInteger(value) && value > 0 ? value.toLocaleString('en') : 'Not reported'
}
export function studyYear(value) {
  return Number.isInteger(value) && value >= 1600 && value <= 2100 ? String(value) : 'Not reported'
}
