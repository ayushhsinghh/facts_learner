import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const rows=(v,keys,min=0,max=100)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(p=>p&&keys.every(k=>text(p[k])))
const ids=v=>new Set(v.map(p=>p.id)).size===v.length&&v.every(p=>/^[a-z][a-z0-9_-]{0,47}$/.test(p.id))
export const CULTURE_SECTIONS=['overview','origins','daily_life','worldview','markers','india','explanation','spread','living']
export const CULTURE_MARKERS=['clothing','architecture','food','music','celebration']
export function hasCultureLesson(f){
 const l=f?.culture_lesson
 if(f?.category!=='culture'||f.schema_version!=='2.0'||f.article_type!=='culture_lesson'||l?.content_version!==1)return false
 const i=l.identity,d=l.daily_life,w=l.worldview,c=l.india_connections,e=l.why_custom,s=l.spread,v=l.living_culture
 if(!i||!['name','heartland','scope'].every(k=>text(i[k]))||!texts(i.local_names)||i.local_names.length>5||!texts(i.peoples)||!i.peoples.length||i.peoples.length>6||!texts(i.languages)||!i.languages.length||i.languages.length>8)return false
 if(!l.opening||!['heading','scene','question'].every(k=>text(l.opening[k]))||!text(l.hook)||!l.origins||!['heartland','climate_and_terrain','adaptation','historical_origins','time_context'].every(k=>text(l.origins[k])))return false
 if(!rows(l.milestones,['id','period','event','significance'],0,6)||!ids(l.milestones)||!text(d?.introduction)||!rows(d.comparisons,['id','domain','historical_context','then','now','why_changed','who_and_where'],3,5)||!ids(d.comparisons))return false
 if(!text(w?.introduction)||!rows(w.concepts,['id','term','meaning','everyday_example','scope'],1,4)||!ids(w.concepts)||!w.concepts.every(p=>p.local_term===null||text(p.local_term))||!rows(w.etiquette,['id','situation','practice','reason','context'],1,4)||!ids(w.etiquette))return false
 if(!rows(l.markers,['id','kind','name','place_or_community','description','meaning','experience','today'],5,10)||!ids(l.markers)||!l.markers.every(p=>CULTURE_MARKERS.includes(p.kind))||!CULTURE_MARKERS.every(kind=>l.markers.some(p=>p.kind===kind)))return false
 if(!text(c?.introduction)||!rows(c.connections,['id','title','relationship','explanation','indian_example','distinction'],0,4)||!ids(c.connections)||!c.connections.every(p=>['documented_contact','shared_roots','comparison'].includes(p.relationship)))return false
 if(!e||!['title','custom','explanation','what_it_explains','infographic_prompt'].every(k=>text(e[k]))||!(e.limits===null||text(e.limits))||!rows(e.drivers,['id','factor','effect'],2,5)||!ids(e.drivers))return false
 if(!text(s?.introduction)||!rows(s.pathways,['id','destination','period','route','what_changed','what_continues'],1,5)||!ids(s.pathways)||!rows(s.influences,['id','name','example','connection'],1,5)||!ids(s.influences)||!text(v?.introduction)||!rows(v.variations,['id','community_or_region','difference','explanation'],1,4)||!ids(v.variations))return false
 if(!rows(l.key_terms,['term','meaning'],0,6)||!rows(l.knowledge_checks,['question','answer','explanation'],1,3)||!texts(l.takeaways)||l.takeaways.length<3||l.takeaways.length>6||!texts(l.related_topics)||!l.related_topics.length||l.related_topics.length>6)return false
 const refs={markers:l.markers,daily_life:d.comparisons,worldview:[...w.concepts,...w.etiquette],india:c.connections,explanation:e.drivers,spread:[...s.pathways,...s.influences],living:v.variations}
 if(Object.values(refs).some(group=>!ids(group)))return false
 if(!rows(l.photos,['id','section_id','kind','subject'],12,30)||!ids(l.photos)||!l.photos.every(p=>CULTURE_SECTIONS.includes(p.section_id)&&['named_place','person','historical_object','attire','architecture','food','music','festival','map','everyday','process'].includes(p.kind)&&texts(p.queries)&&p.queries.length>=2&&p.queries.length<=3&&new Set(p.queries.map(q=>q.toLowerCase())).size===p.queries.length&&p.queries.every(q=>q.length<=160)&&(p.entry_id===null||(refs[p.section_id]||[]).some(r=>r.id===p.entry_id))))return false
 if(!CULTURE_SECTIONS.filter(s=>s!=='india'||c.connections.length).every(s=>l.photos.some(p=>p.section_id===s))||!l.markers.every(m=>l.photos.some(p=>p.section_id==='markers'&&p.entry_id===m.id)))return false
 if(!Array.isArray(f.sources)||!f.sources.length||new Set(f.sources.map(s=>s.id)).size!==f.sources.length)return false
 const sourceIds=new Set(f.sources.map(s=>s.id))
 const sourced=value=>Array.isArray(value)?value.every(sourced):value&&typeof value==='object'?(!('source_ids'in value)||(texts(value.source_ids)&&value.source_ids.length>0&&value.source_ids.every(id=>sourceIds.has(id))))&&Object.values(value).every(sourced):true
 return sourced(l)
}
export function culturePhotos(fact,section,entry=null){
 return (fact?.culture_lesson?.photos||[]).flatMap((p,i)=>{
  if(p.section_id!==section||p.entry_id!==entry)return []
  const credit=countryPhoto(fact.image_credits?.[`culture_photo_${i}`])
  if(!credit?.culture_photo||credit.popular_pick||credit.provider!=='wikimedia'||credit.photo_id!==p.id||credit.section_id!==section||credit.entry_id!==entry)return []
  return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
 })
}
export function cultureScenes(fact){
 const seen=new Set()
 return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
  if(!/^culture_scene_\d+$/.test(key)||!value?.culture_carousel)return []
  const credit=countryPhoto(value)
  if(!credit||!['unsplash','pixabay'].includes(credit.provider)||seen.has(credit.source_url))return []
  seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
 }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,12)
}
