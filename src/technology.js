import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
const simpleId=v=>text(v)&&/^[a-z][a-z0-9_-]{0,47}$/.test(v)
export function technologyParts(system) {
  return [...(system?.inputs||[]).map(p=>({...p,kind:'Input'})),...(system?.components||[]).map(p=>({...p,kind:'Component'})),...(system?.outputs||[]).map(p=>({...p,kind:'Output'}))]
}
export function validTechnologyDiagram(d,system) {
  if(d===null)return true
  if(!d||!['flow','layers','comparison'].includes(d.type)||!['title','caption','description'].every(k=>text(d[k]))||!texts(d.assumptions)||!texts(d.node_ids)
    ||!records(d.connections,['from_id','to_id','label','what_moves'])||!records(d.layers,['id','title','role'])||!records(d.comparisons,['name','approach','strength','limitation']))return false
  const parts=new Set(technologyParts(system).map(p=>p.id))
  if(d.type==='flow') {
    const ids=d.node_ids,pairs=new Set(d.connections.map(e=>`${e.from_id}/${e.to_id}`))
    return ids.length>=2&&ids.length<=7&&new Set(ids).size===ids.length&&ids.every(id=>parts.has(id))&&!d.layers.length&&!d.comparisons.length&&d.comparison_basis===null
      &&d.connections.length>=ids.length-1&&d.connections.length<=2*(ids.length-1)&&pairs.size===d.connections.length
      &&d.connections.every(e=>ids.includes(e.from_id)&&ids.includes(e.to_id)&&Math.abs(ids.indexOf(e.from_id)-ids.indexOf(e.to_id))===1)
      &&ids.slice(1).every((b,i)=>pairs.has(`${ids[i]}/${b}`)||pairs.has(`${b}/${ids[i]}`))
  }
  if(d.type==='layers') {
    if(d.node_ids.length||d.connections.length||d.comparisons.length||d.comparison_basis!==null||d.layers.length<2||d.layers.length>4||new Set(d.layers.map(l=>l.id)).size!==d.layers.length)return false
    const used=[],components=new Set(system.components.map(p=>p.id))
    return d.layers.every((l,i)=>{if(!simpleId(l.id)||!texts(l.component_ids)||!l.component_ids.length||!l.component_ids.every(id=>components.has(id))||!texts(l.depends_on_ids))return false
      used.push(...l.component_ids);return new Set(l.depends_on_ids).size===l.depends_on_ids.length&&l.depends_on_ids.every(id=>d.layers.slice(i+1).some(next=>next.id===id))&&(i===d.layers.length-1||l.depends_on_ids.length>0)
    })&&new Set(used).size===used.length
  }
  return !d.node_ids.length&&!d.connections.length&&!d.layers.length&&text(d.comparison_basis)&&d.comparisons.length>=2&&d.comparisons.length<=3
}
export function validTechnologyVersion(v) {
  if(v===null)return true
  if(!v||!['system','version','as_of','scope'].every(k=>text(v[k]))||!/^\d{4}-\d{2}-\d{2}$/.test(v.as_of))return false
  const day=new Date(`${v.as_of}T00:00:00Z`)
  return Number.isFinite(day.valueOf())&&day.toISOString().slice(0,10)===v.as_of&&v.as_of<=new Date().toISOString().slice(0,10)
}
export function hasTechnologyLesson(fact) {
  const l=fact?.technology_lesson,s=l?.system_model,e=l?.worked_example
  if(!(fact?.category==='technology'&&fact.schema_version==='2.0'&&fact.article_type==='technology_lesson'&&l
    &&['device','network','software_system','digital_system','material','manufacturing_process'].includes(l.subject_type)
    &&['name','domain','scope'].every(k=>text(l.identity?.[k]))&&validTechnologyVersion(l.version_context)
    &&['hook','question','learning_goal','central_idea'].every(k=>text(l[k]))
    &&['title','experience','question'].every(k=>text(l.opening_scenario?.[k]))&&['what_is_hard','why_it_matters'].every(k=>text(l.problem?.[k]))
    &&s&&records(s.inputs,['id','name','explanation'])&&s.inputs.length>=1&&s.inputs.length<=3
    &&records(s.components,['id','name','role'])&&s.components.length>=2&&s.components.length<=6
    &&records(s.outputs,['id','name','explanation'])&&s.outputs.length>=1&&s.outputs.length<=3
    &&records(l.walkthrough,['id','title','what_happens','what_changes'])&&l.walkthrough.length>=3&&l.walkthrough.length<=6
    &&new Set(l.walkthrough.map(p=>p.id)).size===l.walkthrough.length&&l.walkthrough.every(p=>simpleId(p.id))
    &&e&&['title','outcome','explanation'].every(k=>text(e[k]))&&['illustrative','source_described'].includes(e.kind)
    &&texts(e.starting_conditions)&&e.starting_conditions.length>0&&texts(e.actions)&&e.actions.length>=2&&texts(e.limits)
    &&records(l.tradeoffs,['benefit','cost','when_it_matters'])&&l.tradeoffs.length>0
    &&records(l.failure_modes,['symptom','cause','what_it_shows'])&&records(l.practical_implications,['title','explanation'])&&l.practical_implications.length>0
    &&records(l.misconceptions,['belief','correction','explanation'])&&l.misconceptions.length>0&&records(l.optional_depth,['title','explanation'])
    &&records(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>0&&texts(l.takeaways)&&l.takeaways.length>=2&&texts(l.related_topics)
    &&records(l.photos,['id','section_id','kind','subject'])&&l.photos.length<=6))return false
  const parts=technologyParts(s),ids=new Set(parts.map(p=>p.id))
  return ids.size===parts.length&&parts.every(p=>simpleId(p.id))&&validTechnologyDiagram(l.diagram,s)
    &&l.walkthrough.every(p=>texts(p.component_ids)&&p.component_ids.length>0&&new Set(p.component_ids).size===p.component_ids.length&&p.component_ids.every(id=>ids.has(id)))
    &&s.components.every(c=>l.walkthrough.some(step=>step.component_ids.includes(c.id)))
    &&new Set(l.photos.map(p=>p.id)).size===l.photos.length&&new Set(l.photos.map(p=>p.section_id)).size===l.photos.length
    &&l.photos.every(p=>texts(p.queries)&&p.queries.length>=1&&p.queries.length<=2&&['overview','system','walkthrough','example','tradeoffs','implications'].includes(p.section_id)
      &&['hardware','component','process','named_model','historical_object','screenshot','person'].includes(p.kind)
      &&(p.component_id===null||ids.has(p.component_id))&&(p.kind!=='screenshot'||l.version_context!==null))
}
export function technologyPhotos(fact,section) {
  return (fact?.technology_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section)return []
    const credit=countryPhoto(fact.image_credits?.[`technology_photo_${index}`])
    if(!credit?.technology_photo||credit.section_id!==section||credit.photo_id!==request.id||credit.component_id!==request.component_id)return []
    if(['named_model','historical_object','screenshot','person'].includes(request.kind)&&credit.provider!=='wikimedia')return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  })
}
export function technologyScenes(fact) {
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^technology_scene_\d+$/.test(key)||!value?.technology_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).slice(0,6)
}
