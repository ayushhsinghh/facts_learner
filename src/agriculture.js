import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
const id=v=>text(v)&&/^[a-z][a-z0-9_-]{0,47}$/.test(v)
const unique=items=>items.every(p=>p&&id(p.id))&&new Set(items.map(p=>p.id)).size===items.length
export function validAgricultureDiagram(d,steps) {
  if(d===null)return true
  if(!d||!['process','seasonal','cross_section','comparison'].includes(d.type)||!['title','caption','description'].every(k=>text(d[k]))||!texts(d.assumptions)||!texts(d.process_step_ids)
    ||!records(d.season_stages,['id','title','timing','what_to_notice'])||!records(d.layers,['id','name','material','explanation'])
    ||!records(d.connections,['from_id','to_id','label','explanation'])||!records(d.comparisons,['name','approach','benefit','limitation','conditions']))return false
  const order=steps.map(s=>s.id),ordered=ids=>new Set(ids).size===ids.length&&ids.every(i=>order.includes(i))&&ids.every((v,i)=>!i||order.indexOf(ids[i-1])<order.indexOf(v))
  if(d.type==='process')return d.process_step_ids.length>=2&&d.process_step_ids.length<=6&&ordered(d.process_step_ids)&&!d.season_stages.length&&!d.layers.length&&!d.connections.length&&!d.comparisons.length&&d.comparison_basis===null
  if(d.type==='seasonal') {
    if(d.process_step_ids.length||d.layers.length||d.connections.length||d.comparisons.length||d.comparison_basis!==null||d.season_stages.length<2||d.season_stages.length>6||!unique(d.season_stages))return false
    return d.season_stages.every(s=>texts(s.process_step_ids)&&s.process_step_ids.length>0)&&ordered(d.season_stages.flatMap(s=>s.process_step_ids))
  }
  if(d.type==='cross_section')return !d.process_step_ids.length&&!d.season_stages.length&&!d.comparisons.length&&d.comparison_basis===null&&d.layers.length>=2&&d.layers.length<=5&&unique(d.layers)
    &&d.connections.length<=6&&new Set(d.connections.map(e=>`${e.from_id}/${e.to_id}`)).size===d.connections.length
    &&d.connections.every(e=>e.from_id!==e.to_id&&d.layers.some(l=>l.id===e.from_id)&&d.layers.some(l=>l.id===e.to_id))
  return !d.process_step_ids.length&&!d.season_stages.length&&!d.layers.length&&!d.connections.length&&text(d.comparison_basis)&&d.comparisons.length>=2&&d.comparisons.length<=3
}
export function validAgricultureMeasurement(m) {
  if(!m||!id(m.id)||!['label','unit','basis','explanation'].every(k=>text(m[k]))||!['illustrative','reported'].includes(m.kind)||typeof m.value!=='number'||!Number.isFinite(m.value)||Math.abs(m.value)>1e12)return false
  if(!['place','period','as_of'].every(k=>m[k]===null||text(m[k]))||(m.kind==='reported'&&!['place','period','as_of'].every(k=>text(m[k]))))return false
  if(m.as_of!==null) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(m.as_of))return false
    const day=new Date(`${m.as_of}T00:00:00Z`)
    if(!Number.isFinite(day.valueOf())||day.toISOString().slice(0,10)!==m.as_of||m.as_of>new Date().toISOString().slice(0,10))return false
  }
  return true
}
export function hasAgricultureLesson(fact) {
  const l=fact?.agriculture_lesson,c=l?.field_context,s=l?.process_steps,e=l?.indian_case_study
  return Boolean(fact?.category==='agriculture'&&fact.schema_version==='2.0'&&fact.article_type==='agriculture_lesson'&&l
    &&['name','domain','scope'].every(k=>text(l.identity?.[k]))&&texts(l.identity.local_names)&&l.identity.local_names.length<=4
    &&['practice','natural_process','crop_system','tool','post_harvest','traditional_knowledge','innovation'].includes(l.identity.concept_type)
    &&['hook','question','learning_goal','central_idea'].every(k=>text(l[k]))&&['title','experience','question'].every(k=>text(l.opening_scenario?.[k]))
    &&c&&['purpose','indian_connection','applicability_limits'].every(k=>text(c[k]))&&texts(c.crops)&&c.crops.length<=6
    &&records(c.growing_conditions,['title','explanation'])&&c.growing_conditions.length<=4&&(c.when_it_matters===null||text(c.when_it_matters))
    &&records(l.key_terms,['term','meaning'])&&l.key_terms.length<=6
    &&records(s,['id','title','action','what_changes','why_it_matters','what_to_notice'])&&s.length>=3&&s.length<=6&&unique(s)
    &&s.every(step=>texts(step.conditions)&&step.conditions.length>=1&&step.conditions.length<=3)
    &&validAgricultureDiagram(l.diagram,s)
    &&e&&['title','place','time_context','practice','explanation','connection','outcome','limits'].every(k=>text(e[k]))
    &&['documented_practice','research_example'].includes(e.kind)&&texts(e.crops)&&e.crops.length<=6
    &&Array.isArray(l.measurements)&&l.measurements.length<=5&&unique(l.measurements)&&l.measurements.every(validAgricultureMeasurement)
    &&records(l.benefits_and_tradeoffs,['benefit','explanation','costs_and_limits'])&&l.benefits_and_tradeoffs.length>=1&&l.benefits_and_tradeoffs.length<=4
    &&l.benefits_and_tradeoffs.every(b=>texts(b.requirements)&&b.requirements.length>=1&&b.requirements.length<=4)
    &&records(l.conditions_and_limits,['title','explanation'])&&l.conditions_and_limits.length>=1&&l.conditions_and_limits.length<=4
    &&records(l.misconceptions,['belief','correction','explanation'])&&l.misconceptions.length>=1&&l.misconceptions.length<=4
    &&records(l.optional_depth,['title','explanation'])&&l.optional_depth.length<=3
    &&records(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&l.knowledge_checks.length<=3
    &&texts(l.takeaways)&&l.takeaways.length>=2&&l.takeaways.length<=5&&texts(l.related_topics)&&l.related_topics.length>=1&&l.related_topics.length<=6
    &&records(l.photos,['id','section_id','kind','subject'])&&l.photos.length<=6&&unique(l.photos)&&new Set(l.photos.map(p=>p.section_id)).size===l.photos.length
    &&l.photos.every(p=>['overview','context','process','case','tradeoffs','limits'].includes(p.section_id)
      &&['crop','tool','material','process','named_place','person','historical_object'].includes(p.kind)
      &&texts(p.queries)&&p.queries.length>=1&&p.queries.length<=2&&p.queries.every(q=>q.length<=160)
      &&(p.step_id===null||(p.section_id==='process'&&s.some(step=>step.id===p.step_id)))))
}
export function agriculturePhotos(fact,section,stepId=null) {
  return (fact?.agriculture_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section||request.step_id!==stepId)return []
    const credit=countryPhoto(fact.image_credits?.[`agriculture_photo_${index}`])
    if(!credit?.agriculture_photo||credit.popular_pick||credit.section_id!==section||credit.photo_id!==request.id||credit.step_id!==request.step_id)return []
    if(['named_place','person','historical_object'].includes(request.kind)&&credit.provider!=='wikimedia')return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  })
}
export function agricultureScenes(fact) {
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^agriculture_scene_\d+$/.test(key)||!value?.agriculture_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,6)
}
