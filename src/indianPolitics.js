import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const rows=(v,keys,min=0,max=100)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(p=>p&&keys.every(k=>text(p[k])))
const ids=v=>v.every(p=>/^[a-z][a-z0-9_-]{0,47}$/.test(p.id))&&new Set(v.map(p=>p.id)).size===v.length
export const POLITICS_SECTIONS=['overview','context','actors','process','rules','example','accountability','tradeoffs','changes','citizen','confusions']
export const validPoliticsDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&v<=new Date().toISOString().slice(0,10)
export function hasIndianPoliticsLesson(f){
 const l=f?.indian_politics_lesson
 if(f?.category!=='indian_politics'||f.schema_version!=='2.0'||f.article_type!=='indian_politics_lesson'||l?.content_version!==1)return false
 const i=l.identity,p=l.process,e=l.worked_example,c=l.citizen_view
 if(!i||!['name','scope','period'].every(k=>text(i[k]))||!['elections','government_formation','parliament','federal_relations','local_government','representation','public_decisions'].includes(i.topic_type)||!['union','state','local','cross_level'].includes(i.level)||!texts(i.institutions)||!i.institutions.length||i.institutions.length>6||!(i.as_of===null||validPoliticsDate(i.as_of))||!text(l.hook)||!text(l.diagram_prompt))return false
 if(!l.opening||!['heading','situation','question'].every(k=>text(l.opening[k]))||!['illustrative','documented'].includes(l.opening.kind)||!l.core_idea||!['explanation','why_it_matters'].every(k=>text(l.core_idea[k]))||!l.context||!['setting','when_it_applies','what_it_does_not_cover'].every(k=>text(l.context[k])))return false
 if(!rows(l.actors,['id','name','kind','role','authority','limits'],2,6)||!ids(l.actors)||!l.actors.every(r=>['institution','office','political_group','public'].includes(r.kind))||!rows(l.rules,['id','title','basis_type','reference','formal_position','practice','scope_or_variation'],1,5)||!ids(l.rules)||!l.rules.every(r=>['legal_rule','procedure','convention','observed_practice'].includes(r.basis_type)))return false
 const actor=id=>l.actors.some(r=>r.id===id),rule=id=>l.rules.some(r=>r.id===id)
 if(!text(p?.starts_when)||!text(p.ends_with)||!rows(p.steps,['id','title','action','result','conditions'],3,6)||!ids(p.steps)||!p.steps.every(r=>texts(r.actor_ids)&&r.actor_ids.length&&r.actor_ids.every(actor)&&texts(r.rule_ids)&&r.rule_ids.length&&r.rule_ids.every(rule)))return false
 if(!e||!['title','setting','outcome','what_it_shows'].every(k=>text(e[k]))||!['illustrative','dated_real'].includes(e.kind)||!rows(e.steps,['process_step_id','explanation'],2,6)||!e.steps.every(r=>p.steps.some(s=>s.id===r.process_step_id))||!(e.kind==='illustrative'?e.date===null:validPoliticsDate(e.date)&&validPoliticsDate(i.as_of)&&e.date<=i.as_of))return false
 if(!rows(l.accountability,['id','title','check','what_can_change','limits'],1,5)||!ids(l.accountability)||!l.accountability.every(r=>texts(r.actor_ids)&&r.actor_ids.length&&r.actor_ids.every(actor))||!rows(l.tradeoffs,['id','title','benefit','cost','when_it_matters'],1,3)||!ids(l.tradeoffs)||!rows(l.changes,['id','date','title','change','why_it_matters'],0,4)||!ids(l.changes)||!l.changes.every((r,n)=>validPoliticsDate(r.date)&&(!i.as_of||r.date<=i.as_of)&&(!n||r.date>=l.changes[n-1].date)))return false
 if(!text(c?.why_it_matters)||!rows(c.channels,['id','name','what_it_does','scope'],1,4)||!ids(c.channels)||!rows(l.confusions,['id','belief','correction','explanation'],2,4)||!ids(l.confusions)||!rows(l.key_terms,['term','meaning'],0,6)||!rows(l.knowledge_checks,['question','answer','explanation'],1,3)||!texts(l.takeaways)||l.takeaways.length<3||l.takeaways.length>6||!texts(l.related_topics)||!l.related_topics.length||l.related_topics.length>6)return false
 const refs={actors:l.actors,rules:l.rules,process:p.steps,accountability:l.accountability,tradeoffs:l.tradeoffs,changes:l.changes,citizen:c.channels,confusions:l.confusions}
 if(!rows(l.photos,['id','section_id','kind','subject'],12,30)||!ids(l.photos)||!l.photos.every(r=>POLITICS_SECTIONS.includes(r.section_id)&&['institution','document','person','historical_object','named_place','election_equipment','public_process','modern_context'].includes(r.kind)&&texts(r.queries)&&r.queries.length>=2&&r.queries.length<=3&&new Set(r.queries.map(q=>q.toLowerCase())).size===r.queries.length&&r.queries.every(q=>q.length<=160)&&(r.entry_id===null||(refs[r.section_id]||[]).some(s=>s.id===r.entry_id))&&(r.section_id!=='changes'||l.changes.length)))return false
 if(!POLITICS_SECTIONS.filter(s=>s!=='changes'||l.changes.length).every(s=>l.photos.some(r=>r.section_id===s))||!['actors','process'].every(s=>refs[s].every(r=>l.photos.some(photo=>photo.section_id===s&&photo.entry_id===r.id))))return false
 if(!Array.isArray(f.sources)||!f.sources.length||!f.sources.every(r=>r&&text(r.id))||new Set(f.sources.map(r=>r.id)).size!==f.sources.length)return false
 const sources=new Set(f.sources.map(r=>r.id))
 const sourced=v=>Array.isArray(v)?v.every(sourced):v&&typeof v==='object'?(!('source_ids'in v)||(texts(v.source_ids)&&v.source_ids.length>0&&v.source_ids.every(id=>sources.has(id))))&&Object.values(v).every(sourced):true
 return sourced(l)
}
export function politicsPhotos(fact,section,entry=null){
 return (fact?.indian_politics_lesson?.photos||[]).flatMap((p,index)=>{
  if(p.section_id!==section||p.entry_id!==entry)return []
  const credit=countryPhoto(fact.image_credits?.[`indian_politics_photo_${index}`])
  if(!credit?.indian_politics_photo||credit.provider!=='wikimedia'||credit.popular_pick||credit.photo_id!==p.id||credit.section_id!==section||credit.entry_id!==entry)return []
  const caption=credit.description.length<=240?credit.description:credit.title.replace(/\.(jpe?g|png|tiff?|webp)$/i,'').replaceAll('_',' ')
  return [{url:credit.url,credit,alt:credit.description,caption}]
 })
}
export function politicsScenes(fact){
 const seen=new Set()
 return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
  if(!/^indian_politics_scene_\d+$/.test(key)||!value?.indian_politics_carousel||!value?.indian_politics_gallery_only)return []
  const credit=countryPhoto(value)
  if(!credit||!['unsplash','pixabay'].includes(credit.provider)||seen.has(credit.source_url))return []
  seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
 }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,12)
}
