import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const rows=(v,keys,min=0,max=100)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(p=>p&&keys.every(k=>text(p[k])))
const ids=v=>v.every(p=>/^[a-z][a-z0-9_-]{0,47}$/.test(p.id))&&new Set(v.map(p=>p.id)).size===v.length
export const HISTORY_SECTIONS=['overview','setting','causes','chronology','people','evidence','india','mechanism','consequences','legacy']
const kinds=['historical_map','painting','manuscript','artifact','archival_photo','person','named_place','modern_context']
export const validHistoryPeriod=p=>Boolean(p&&Number.isInteger(p.start_year)&&Number.isInteger(p.end_year)&&p.start_year!==0&&p.end_year!==0&&p.start_year>=-100000&&p.end_year<=new Date().getFullYear()&&p.start_year<=p.end_year)
export function hasHistoryLesson(f){
 const l=f?.history_lesson
 if(f?.category!=='history'||f.schema_version!=='2.0'||f.article_type!=='history_lesson'||l?.content_version!==1)return false
 const i=l.identity,e=l.evidence,c=l.india,m=l.mechanism
 if(!i||!['name','date_label','historical_region','modern_location','scope'].every(k=>text(i[k]))||!['event','era','movement','transformation'].includes(i.topic_type)||!validHistoryPeriod(i)||!text(l.hook))return false
 if(!l.opening||!['heading','scene','question'].every(k=>text(l.opening[k]))||!l.setting||!['geography','political_climate','everyday_conditions'].every(k=>text(l.setting[k]))||!texts(l.setting.locations)||!l.setting.locations.length||l.setting.locations.length>5)return false
 if(!rows(l.causes,['id','title','kind','explanation','connection'],2,5)||!ids(l.causes)||!l.causes.every(p=>['structural','trigger'].includes(p.kind)))return false
 if(!rows(l.figures,['id','name','kind','role','objective','actions','impact'],2,8)||!ids(l.figures)||!l.figures.every(p=>['person','collective'].includes(p.kind)))return false
 if(!rows(l.chronology,['id','date_label','title','what_happened','why_it_matters'],4,10)||!ids(l.chronology)||!l.chronology.every((p,n)=>validHistoryPeriod(p)&&p.start_year>=i.start_year&&p.end_year<=i.end_year&&(!n||p.start_year>=l.chronology[n-1].start_year)&&texts(p.figure_ids)&&p.figure_ids.every(id=>l.figures.some(f=>f.id===id))))return false
 if(!rows(l.decisions,['id','title','figure_id','chronology_id','options','choice','consequence'],1,4)||!ids(l.decisions)||!l.decisions.every(p=>l.figures.some(f=>f.id===p.figure_id)&&l.chronology.some(e=>e.id===p.chronology_id)))return false
 if(!text(e?.introduction)||!text(e.modern_understanding)||!rows(e.records,['id','title','creator','created_when','relationship','account','what_it_shows','limits'],1,5)||!ids(e.records)||!e.records.every(p=>['contemporary','later_memory','later_depiction'].includes(p.relationship))||!rows(e.updates,['id','title','method','finding','what_changed'],0,4)||!ids(e.updates)||!e.updates.every(p=>['archaeology','declassified_record','scientific_analysis','archival_research','historical_reinterpretation'].includes(p.method)&&(p.remaining_question===null||text(p.remaining_question))))return false
 if(!text(c?.introduction)||!rows(c.connections,['id','date_label','title','relationship','what_happened','connection','distinction'],1,5)||!ids(c.connections)||!c.connections.some(p=>p.relationship==='contemporary_context')||!c.connections.every(p=>validHistoryPeriod(p)&&['contemporary_context','documented_impact','indirect_effect'].includes(p.relationship)&&(p.relationship!=='contemporary_context'||p.end_year>=i.start_year&&p.start_year<=i.end_year)))return false
 if(!m||!['title','problem','explanation','why_it_mattered','diagram_prompt'].every(k=>text(m[k]))||!['strategy','logistics','engineering','economics','disease_transmission','social_organisation'].includes(m.domain)||!(m.limits===null||text(m.limits))||!rows(m.steps,['id','factor','effect'],2,5)||!ids(m.steps))return false
 if(!l.outcome||!['immediate_result','why_distinctive'].every(k=>text(l.outcome[k]))||!rows(l.consequences,['id','title','domain','place_and_period','change','causal_connection'],2,6)||!ids(l.consequences)||!l.consequences.every(p=>['borders','law','culture','economy','society','knowledge'].includes(p.domain))||!rows(l.legacy,['id','title','place','trace','relationship','explanation'],1,4)||!ids(l.legacy)||!l.legacy.every(p=>['direct_continuity','indirect_influence','commemoration'].includes(p.relationship)))return false
 if(!rows(l.key_terms,['term','meaning'],0,6)||!rows(l.knowledge_checks,['question','answer','explanation'],1,3)||!texts(l.takeaways)||l.takeaways.length<3||l.takeaways.length>6||!texts(l.related_topics)||!l.related_topics.length||l.related_topics.length>6)return false
 const refs={causes:l.causes,chronology:l.chronology,people:[...l.figures,...l.decisions],evidence:[...e.records,...e.updates],india:c.connections,mechanism:m.steps,consequences:l.consequences,legacy:l.legacy}
 if(Object.values(refs).some(group=>!ids(group)))return false
 if(!rows(l.photos,['id','section_id','kind','subject','target_period'],12,30)||!ids(l.photos)||!l.photos.every(p=>HISTORY_SECTIONS.includes(p.section_id)&&kinds.includes(p.kind)&&texts(p.queries)&&p.queries.length>=2&&p.queries.length<=3&&new Set(p.queries.map(q=>q.toLowerCase())).size===p.queries.length&&p.queries.every(q=>q.length<=160)&&(p.entry_id===null||(refs[p.section_id]||[]).some(r=>r.id===p.entry_id))))return false
 if(!HISTORY_SECTIONS.every(section=>l.photos.some(p=>p.section_id===section))||!l.chronology.every(e=>l.photos.some(p=>p.section_id==='chronology'&&p.entry_id===e.id)))return false
 if(!Array.isArray(f.sources)||!f.sources.length||new Set(f.sources.map(p=>p.id)).size!==f.sources.length)return false
 const sourceIds=new Set(f.sources.map(p=>p.id))
 const sourced=v=>Array.isArray(v)?v.every(sourced):v&&typeof v==='object'?(!('source_ids'in v)||(texts(v.source_ids)&&v.source_ids.length>0&&v.source_ids.every(id=>sourceIds.has(id))))&&Object.values(v).every(sourced):true
 return sourced(l)
}
export function historyPhotos(fact,section,entry=null){
 return (fact?.history_lesson?.photos||[]).flatMap((p,index)=>{
  if(p.section_id!==section||p.entry_id!==entry)return []
  const credit=countryPhoto(fact.image_credits?.[`history_photo_${index}`])
  if(!credit?.history_photo||credit.provider!=='wikimedia'||credit.popular_pick||credit.photo_id!==p.id||credit.section_id!==section||credit.entry_id!==entry)return []
  const caption=credit.description.length<=240?credit.description:credit.title.replace(/\.(jpe?g|png|tiff?|webp)$/i,'').replaceAll('_',' ')
  return [{url:credit.url,credit,alt:credit.description,caption}]
 })
}
export function historyScenes(fact){
 const seen=new Set()
 return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
  if(!/^history_scene_\d+$/.test(key)||!value?.history_carousel||!value?.history_gallery_only)return []
  const credit=countryPhoto(value)
  if(!credit||!['unsplash','pixabay'].includes(credit.provider)||seen.has(credit.source_url))return []
  seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
 }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,12)
}
