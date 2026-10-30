export const LAW_TYPES = {
  concept: 'Understand the rule', right_or_duty: 'Understand the right or duty',
  procedure: 'How the process works', comparison: 'Understand the distinction', case_explainer: 'Understand the legal reasoning',
}
const records = value => Array.isArray(value) && value.every(item => item && typeof item === 'object' && !Array.isArray(item))
const text = value => typeof value === 'string' && Boolean(value.trim())
const texts = value => Array.isArray(value) && value.every(text)
const example = value => value && ['title', 'situation', 'implications', 'limits'].every(key => text(value[key])) && texts(value.reasoning_steps)
export function hasIndianLawLesson(fact) {
  const l = fact?.indian_law_lesson
  return Boolean(fact?.category === 'indian_laws' && fact.schema_version === '2.0' && fact.article_type === 'indian_law_lesson'
    && Object.hasOwn(LAW_TYPES, l?.lesson_type) && ['question', 'learning_goal', 'legal_area'].every(key => text(l[key]))
    && l.opening_scenario && ['title', 'situation', 'question'].every(key => text(l.opening_scenario[key]))
    && text(l.plain_rule?.explanation) && text(l.applicability?.jurisdiction) && text(l.applicability?.relevant_dates)
    && ['who_it_concerns', 'conditions', 'exceptions', 'limits'].every(key => texts(l.applicability[key]))
    && ['legal_basis', 'explanation_steps', 'common_confusions', 'key_terms', 'law_changes', 'commentary', 'deeper_detail', 'knowledge_checks'].every(key => records(l[key]))
    && l.legal_basis.length && l.legal_basis.every(b => Number.isInteger(b.year) && ['id', 'instrument', 'reference', 'title', 'plain_meaning', 'legal_effect'].every(key => text(b[key])))
    && l.explanation_steps.length && l.explanation_steps.every(s => texts(s.basis_ids) && text(s.title) && text(s.explanation))
    && l.key_terms.every(item => text(item.term) && text(item.definition))
    && l.common_confusions.every(item => text(item.confusion) && text(item.clarification))
    && l.law_changes.every(item => ['label', 'change', 'significance'].every(key => text(item[key])))
    && l.commentary.every(item => ['title', 'explanation', 'limits'].every(key => text(item[key])))
    && l.deeper_detail.every(item => text(item.title) && text(item.explanation))
    && l.knowledge_checks.every(item => ['id', 'question', 'answer', 'explanation'].every(key => text(item[key])))
    && example(l.worked_example) && (l.contrast_example == null || example(l.contrast_example))
    && (l.case_note == null || ['name', 'court', 'citation', 'question', 'decision', 'significance', 'limits'].every(key => text(l.case_note[key])))
    && (l.lesson_type !== 'case_explainer' || l.case_note) && (l.lesson_type !== 'comparison' || l.contrast_example)
    && texts(l.takeaways) && texts(l.related_concepts))
}
export const lawSourceKind = kind => ({ statute: 'Act or code', rule: 'Rule', notification: 'Notification', judgment: 'Court interpretation', commentary: 'Commentary' })[kind] || 'Legal context'
export const lawStatus = status => ({ current: 'Described as current', historical: 'Historical provision', proposed: 'Proposed provision', uncertain: 'Status uncertain', enacted: 'Enacted', commenced: 'Commencement' })[status] || 'Status not supplied'
