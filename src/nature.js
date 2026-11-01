import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
const id=v=>text(v)&&/^[a-z][a-z0-9_-]{0,47}$/.test(v)
const unique=items=>items.every(p=>p&&id(p.id))&&new Set(items.map(p=>p.id)).size===items.length
const nullable=v=>v===null||text(v)
export function validNatureDate(value){
  if(!text(value)||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false
  const day=new Date(`${value}T00:00:00Z`)
  return Number.isFinite(day.valueOf())&&day.toISOString().slice(0,10)===value&&value<=new Date().toISOString().slice(0,10)
}
export function natureReferences(l){return {feature:new Map(l.recognition_features.map(p=>[p.id,p])),step:new Map(l.explanation_steps.map(p=>[p.id,p])),connection:new Map(l.natural_connections.map(p=>[p.id,p]))}}
export function validNatureDiagram(d,l){
  if(d===null)return true
  if(!d||!['labelled_structure','process','cycle','relationships','comparison'].includes(d.type)||!['title','caption','description'].every(k=>text(d[k]))||!texts(d.assumptions)
    ||!records(d.nodes,['id','ref_type','ref_id','explanation'])||!records(d.edges,['from_id','to_id','label','explanation'])||!records(d.comparisons,['name','observation','explanation','conditions']))return false
  const nodes=d.nodes,edges=d.edges
  if(d.type==='comparison')return !nodes.length&&!edges.length&&text(d.comparison_basis)&&d.comparisons.length>=2&&d.comparisons.length<=3
  if(d.comparisons.length||d.comparison_basis!==null||nodes.length<2||nodes.length>6||!unique(nodes))return false
  const refs=natureReferences(l),ids=nodes.map(n=>n.id)
  if(nodes.some(n=>!refs[n.ref_type]?.has(n.ref_id))||new Set(nodes.map(n=>`${n.ref_type}/${n.ref_id}`)).size!==nodes.length)return false
  const pairs=new Set(edges.map(e=>`${e.from_id}/${e.to_id}`))
  if(edges.length>10||pairs.size!==edges.length||edges.some(e=>!ids.includes(e.from_id)||!ids.includes(e.to_id)||e.from_id===e.to_id))return false
  if(d.type==='labelled_structure')return nodes.every(n=>n.ref_type==='feature')
  if(['process','cycle'].includes(d.type)){
    const order=l.explanation_steps.map(s=>s.id)
    if(nodes.some(n=>n.ref_type!=='step')||nodes.some((n,i)=>i&&order.indexOf(nodes[i-1].ref_id)>=order.indexOf(n.ref_id)))return false
    const expected=new Set(ids.slice(1).map((next,i)=>`${ids[i]}/${next}`))
    if(d.type==='cycle')expected.add(`${ids.at(-1)}/${ids[0]}`)
    return pairs.size===expected.size&&[...expected].every(p=>pairs.has(p))
  }
  const reached=new Set([ids[0]])
  for(const _ of nodes)for(const e of edges){if(reached.has(e.from_id))reached.add(e.to_id);if(reached.has(e.to_id))reached.add(e.from_id)}
  return reached.size===nodes.length
}
export function validNatureMeasurement(m){
  return Boolean(m&&id(m.id)&&['label','unit','basis','explanation'].every(k=>text(m[k]))&&['illustrative','reported'].includes(m.kind)
    &&typeof m.value==='number'&&Number.isFinite(m.value)&&Math.abs(m.value)<=1e12&&['place','period','as_of'].every(k=>nullable(m[k]))
    &&(m.kind!=='reported'||['place','period','as_of'].every(k=>text(m[k])))&&(m.as_of===null||validNatureDate(m.as_of)))
}
export function hasNatureLesson(fact){
  const l=fact?.nature_lesson,c=l?.observation_context,e=l?.real_world_example,a=l?.notice_it_yourself,v=l?.conservation_context
  return Boolean(fact?.category==='nature'&&fact.schema_version==='2.0'&&fact.article_type==='nature_lesson'&&l
    &&['name','domain','scope'].every(k=>text(l.identity?.[k]))&&texts(l.identity.common_names)&&l.identity.common_names.length<=4&&nullable(l.identity.scientific_name)
    &&['organism','phenomenon','natural_material','ecological_relationship','natural_process','structure'].includes(l.identity.topic_type)
    &&['hook','question','learning_goal','central_idea'].every(k=>text(l[k]))&&['title','scene','question'].every(k=>text(l.opening_observation?.[k]))
    &&['well_established','active_research','mixed'].includes(l.explanation_status?.level)&&text(l.explanation_status.explanation)
    &&c&&text(c.where)&&text(c.variability)&&['when','size_context','time_context'].every(k=>nullable(c[k]))&&texts(c.conditions)&&c.conditions.length<=4
    &&records(l.recognition_features,['id','name','what_to_look_for','meaning','connection'])&&l.recognition_features.length<=4&&unique(l.recognition_features)&&l.recognition_features.every(p=>['unaided','close_up','microscopic'].includes(p.viewing_scale))
    &&records(l.key_terms,['term','meaning'])&&l.key_terms.length<=6
    &&records(l.explanation_steps,['id','title','explanation','what_changes','evidence_note'])&&l.explanation_steps.length>=3&&l.explanation_steps.length<=6&&unique(l.explanation_steps)
    &&l.explanation_steps.every(p=>texts(p.conditions)&&p.conditions.length>=1&&p.conditions.length<=3&&['established_mechanism','supported_explanation','open_question'].includes(p.evidence_kind))
    &&records(l.natural_connections,['id','title','relationship','explanation','scale_or_conditions'])&&l.natural_connections.length<=4&&unique(l.natural_connections)
    &&validNatureDiagram(l.diagram,l)
    &&e&&['title','subject','observation','explanation','connection','limits'].every(k=>text(e[k]))&&['organism','place','phenomenon'].includes(e.kind)
    &&['scientific_name','place','time_context'].every(k=>nullable(e[k]))&&(e.kind!=='organism'||text(e.scientific_name))&&(e.kind!=='place'||text(e.place))
    &&(v===null||(v&&['status','system','scope'].every(k=>text(v[k]))&&validNatureDate(v.assessed_on)))
    &&(a===null||(a&&['everyday_observation','photo_comparison'].includes(a.mode)&&['title','setting','what_to_notice','can_conclude','cannot_conclude'].every(k=>text(a[k]))&&texts(a.steps)&&a.steps.length>=2&&a.steps.length<=4&&nullable(a.care_note)))
    &&Array.isArray(l.measurements)&&l.measurements.length<=4&&unique(l.measurements)&&l.measurements.every(validNatureMeasurement)
    &&records(l.variation_and_limits,['title','explanation'])&&l.variation_and_limits.length>=1&&l.variation_and_limits.length<=4
    &&records(l.misconceptions,['belief','correction','explanation'])&&l.misconceptions.length>=1&&l.misconceptions.length<=4
    &&records(l.optional_depth,['title','explanation'])&&l.optional_depth.length<=3&&records(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&l.knowledge_checks.length<=3
    &&texts(l.takeaways)&&l.takeaways.length>=2&&l.takeaways.length<=5&&texts(l.related_topics)&&l.related_topics.length>=1&&l.related_topics.length<=6
    &&records(l.photos,['id','section_id','kind','subject'])&&l.photos.length<=6&&unique(l.photos)&&new Set(l.photos.map(p=>p.section_id)).size===l.photos.length
    &&l.photos.every(p=>['overview','recognition','explanation','connections','example','observation'].includes(p.section_id)
      &&['organism','named_species','feature','material','process','named_place','person','microscopy'].includes(p.kind)&&texts(p.queries)&&p.queries.length>=1&&p.queries.length<=2&&p.queries.every(q=>q.length<=160)
      &&(p.feature_id===null||(p.section_id==='recognition'&&l.recognition_features.some(f=>f.id===p.feature_id)))
      &&(p.section_id!=='recognition'||l.recognition_features.length>0)&&(p.section_id!=='connections'||l.natural_connections.length>0)&&(p.section_id!=='observation'||a!==null)))
}
export function naturePhotos(fact,section){
  return (fact?.nature_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section)return []
    const credit=countryPhoto(fact.image_credits?.[`nature_photo_${index}`])
    if(!credit?.nature_photo||credit.popular_pick||credit.section_id!==section||credit.photo_id!==request.id||credit.feature_id!==request.feature_id)return []
    if(['named_species','named_place','person','microscopy'].includes(request.kind)&&credit.provider!=='wikimedia')return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  })
}
export function natureScenes(fact){
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^nature_scene_\d+$/.test(key)||!value?.nature_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,6)
}
