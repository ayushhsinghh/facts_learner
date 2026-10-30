export const CONSTITUTION_TYPES = {
  right_or_principle: { title: 'Understand the provision', diagram: 'scope_map', layout: 'relationship_map' },
  institution: { title: 'How the roles and checks work', diagram: 'roles_map', layout: 'relationship_map' },
  procedure: { title: 'Follow the constitutional process', diagram: 'process_sequence', layout: 'sequence' },
  amendment: { title: 'Understand what changed', diagram: 'before_after', layout: 'sequence' },
  case_explainer: { title: 'Follow the constitutional question', diagram: 'case_path', layout: 'sequence' },
}
export const OFFICIAL_EDITION_URL = 'https://lddashboard.legislative.gov.in/sites/default/files/coi/COI_2024.pdf'
const objects = value => Array.isArray(value) && value.every(item => item && typeof item === 'object')
export function hasConstitutionLesson(fact) {
  const lesson = fact?.constitution_lesson
  return fact?.category === 'indian_constitution' && fact.schema_version === '2.0' && fact.article_type === 'constitution_lesson'
    && Object.hasOwn(CONSTITUTION_TYPES, lesson?.lesson_type) && typeof lesson.question === 'string'
    && typeof lesson.opening_scenario?.situation === 'string' && typeof lesson.big_idea?.explanation === 'string'
    && Boolean(lesson.worked_example && lesson.scope_and_limits)
    && ['constitutional_basis', 'explanation_steps', 'common_confusions', 'amendment_timeline', 'key_terms', 'deeper_detail', 'knowledge_checks'].every(key => objects(lesson[key]))
    && lesson.constitutional_basis.length > 0 && lesson.explanation_steps.length > 0
    && lesson.explanation_steps.every(step => Array.isArray(step.basis_ids))
}
export function verifiedExcerpt(basis) {
  const check = basis?.text_verification
  return typeof basis?.original_text === 'string' && basis.original_text.trim()
    && check?.status === 'matched_official_edition' && check.source_url === OFFICIAL_EDITION_URL
    && check.edition_date === '2024-05-01' && Number.isFinite(Date.parse(check.checked_at)) ? basis.original_text : null
}
export function constitutionDiagram(diagram) {
  const format = Object.values(CONSTITUTION_TYPES).find(item => item.diagram === diagram?.type)
  if (!format) return { ...diagram, type: 'none' }
  const directed = ['process_sequence', 'case_path'].includes(diagram.type)
  return { ...diagram, type: format.layout, edges: Array.isArray(diagram.edges) ? diagram.edges.map(edge => ({ ...edge, relationship_type: directed ? 'procedure' : 'conceptual' })) : [] }
}
export function displayLegalDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not supplied'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}
