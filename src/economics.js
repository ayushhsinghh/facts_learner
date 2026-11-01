import { countryPhoto } from './country.js'
const text = v => typeof v === 'string' && Boolean(v.trim())
const texts = v => Array.isArray(v) && v.every(text)
const records = (v, keys) => Array.isArray(v) && v.every(x => x && keys.every(k => text(x[k])))
const id = v => text(v) && /^[a-z][a-z0-9_-]{0,47}$/.test(v)
const finite = v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e15
export const economicNumber = v => new Intl.NumberFormat('en', { maximumFractionDigits: 6 }).format(v)
export function validEconomicProvenance(p) {
  if (!p || !['illustrative', 'observed'].includes(p.kind) || !text(p.description)) return false
  if (!['period', 'geography', 'as_of'].every(k => p[k] === null || text(p[k]))) return false
  if (p.kind === 'observed' && !['period', 'geography', 'as_of'].every(k => text(p[k]))) return false
  if (p.as_of !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.as_of)) return false
    const day = new Date(`${p.as_of}T00:00:00Z`)
    if (!Number.isFinite(day.valueOf()) || day.toISOString().slice(0, 10) !== p.as_of || p.as_of > new Date().toISOString().slice(0, 10)) return false
  }
  return true
}
export function validEconomicExample(e) {
  if (!e || !['title', 'outcome', 'explanation'].every(k => text(e[k])) || !validEconomicProvenance(e.provenance)
    || !texts(e.assumptions) || e.assumptions.length < 1 || e.assumptions.length > 5
    || !texts(e.reasoning) || e.reasoning.length < 1 || e.reasoning.length > 6
    || !texts(e.limits) || e.limits.length < 1 || e.limits.length > 4
    || !records(e.values, ['id', 'label', 'unit']) || e.values.length > 8
    || !records(e.calculations, ['id', 'label', 'operation', 'unit', 'explanation']) || e.calculations.length > 6) return false
  const all = [...e.values, ...e.calculations]
  if (new Set(all.map(v => v.id)).size !== all.length || !all.every(v => id(v.id))) return false
  const known = new Map()
  for (const v of e.values) { if (!finite(v.value)) return false; known.set(v.id, v.value) }
  for (const c of e.calculations) {
    if (!texts(c.operand_ids) || c.operand_ids.length !== 2 || !c.operand_ids.every(i => known.has(i)) || !finite(c.result)) return false
    const [a, b] = c.operand_ids.map(i => known.get(i))
    const operations = { add: () => a + b, subtract: () => a - b, multiply: () => a * b, divide: () => a / b }
    if (!Object.hasOwn(operations, c.operation) || (c.operation === 'divide' && b === 0)) return false
    const expected = operations[c.operation]()
    if (!finite(expected) || Math.abs(expected - c.result) > Math.max(1e-6, 1e-6 * Math.max(Math.abs(expected), Math.abs(c.result)))) return false
    known.set(c.id, c.result)
  }
  return !e.values.length || Boolean(e.calculations.length)
}
export function validEconomicsDiagram(d) {
  if (d === null) return true
  if (!d || !['bar', 'line', 'comparison'].includes(d.type) || !['title', 'caption', 'description'].every(k => text(d[k]))
    || !texts(d.assumptions) || !validEconomicProvenance(d.provenance) || !texts(d.labels)
    || !records(d.series, ['name']) || !records(d.comparisons, ['name', 'approach', 'benefit', 'cost', 'conditions'])) return false
  if (d.type === 'comparison') return !d.labels.length && !d.series.length && d.unit === null && d.x_label === null
    && text(d.comparison_basis) && d.comparisons.length >= 2 && d.comparisons.length <= 3
  return d.labels.length >= 2 && d.labels.length <= 10 && new Set(d.labels).size === d.labels.length
    && text(d.unit) && text(d.x_label) && d.comparison_basis === null && !d.comparisons.length
    && d.series.length >= 1 && d.series.length <= 3 && new Set(d.series.map(s => s.name)).size === d.series.length
    && d.series.every(s => Array.isArray(s.values) && s.values.length === d.labels.length && s.values.every(finite))
}
export function hasEconomicsLesson(fact) {
  const l = fact?.economics_lesson, m = l?.mechanism
  if (!(fact?.category === 'economics' && fact.schema_version === '2.0' && fact.article_type === 'economics_lesson' && l
    && ['name', 'branch', 'scope', 'geography'].every(k => text(l.identity?.[k]))
    && ['hook', 'question', 'learning_goal', 'central_idea'].every(k => text(l[k]))
    && ['title', 'experience', 'question'].every(k => text(l.opening_scenario?.[k]))
    && records(l.key_terms, ['term', 'meaning']) && l.key_terms.length <= 6
    && m && records(m.actors, ['id', 'name', 'role']) && m.actors.length >= 1 && m.actors.length <= 5
    && records(m.steps, ['id', 'title', 'action', 'what_changes', 'why_next']) && m.steps.length >= 3 && m.steps.length <= 6
    && validEconomicExample(l.worked_example) && validEconomicsDiagram(l.diagram)
    && records(l.distributional_effects, ['actor_id', 'benefit', 'cost', 'time_horizon', 'conditions']) && l.distributional_effects.length <= 5
    && (l.real_world_case === null || ['title', 'place', 'period', 'explanation', 'connection', 'limits'].every(k => text(l.real_world_case?.[k])))
    && records(l.conditions_and_limits, ['title', 'explanation']) && l.conditions_and_limits.length >= 1 && l.conditions_and_limits.length <= 4
    && records(l.misconceptions, ['belief', 'correction', 'explanation']) && l.misconceptions.length >= 1 && l.misconceptions.length <= 4
    && records(l.optional_depth, ['title', 'explanation']) && l.optional_depth.length <= 3
    && records(l.knowledge_checks, ['question', 'answer', 'explanation']) && l.knowledge_checks.length >= 1 && l.knowledge_checks.length <= 3
    && texts(l.takeaways) && l.takeaways.length >= 2 && l.takeaways.length <= 5
    && texts(l.related_topics) && l.related_topics.length >= 1 && l.related_topics.length <= 6
    && records(l.photos, ['id', 'section_id', 'kind', 'subject']) && l.photos.length <= 6)) return false
  const ids = new Set(m.actors.map(a => a.id))
  return ids.size === m.actors.length && m.actors.every(a => id(a.id))
    && new Set(m.steps.map(s => s.id)).size === m.steps.length && m.steps.every(s => id(s.id)
      && texts(s.actor_ids) && s.actor_ids.length > 0 && new Set(s.actor_ids).size === s.actor_ids.length && s.actor_ids.every(i => ids.has(i))
      && texts(s.conditions) && s.conditions.length >= 1 && s.conditions.length <= 3)
    && m.actors.every(a => m.steps.some(s => s.actor_ids.includes(a.id)))
    && l.distributional_effects.every(e => ids.has(e.actor_id)) && new Set(l.distributional_effects.map(e => e.actor_id)).size === l.distributional_effects.length
    && new Set(l.photos.map(p => p.id)).size === l.photos.length && new Set(l.photos.map(p => p.section_id)).size === l.photos.length
    && l.photos.every(p => id(p.id) && ['overview', 'mechanism', 'example', 'effects', 'case', 'limits'].includes(p.section_id)
      && ['setting', 'process', 'named_place', 'historical_object', 'person'].includes(p.kind)
      && texts(p.queries) && p.queries.length >= 1 && p.queries.length <= 2 && p.queries.every(q => q.length <= 160)
      && (p.section_id !== 'case' || l.real_world_case !== null) && (p.section_id !== 'effects' || l.distributional_effects.length > 0))
}
export function economicsPhotos(fact, section) {
  return (fact?.economics_lesson?.photos || []).flatMap((request, index) => {
    if (request.section_id !== section) return []
    const credit = countryPhoto(fact.image_credits?.[`economics_photo_${index}`])
    if (!credit?.economics_photo || credit.section_id !== section || credit.photo_id !== request.id) return []
    if (['named_place', 'historical_object', 'person'].includes(request.kind) && credit.provider !== 'wikimedia') return []
    return [{ url: credit.url, credit, alt: credit.description, caption: credit.title }]
  })
}
export function economicsScenes(fact) {
  const seen = new Set()
  return Object.entries(fact?.image_credits || {}).flatMap(([key, value]) => {
    if (!/^economics_scene_\d+$/.test(key) || !value?.economics_carousel) return []
    const credit = countryPhoto(value)
    if (!credit || seen.has(credit.source_url)) return []
    seen.add(credit.source_url)
    return [{ url: credit.url, credit, alt: credit.description, caption: credit.title }]
  }).slice(0, 6)
}
