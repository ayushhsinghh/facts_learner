import { countryPhoto } from './country.js'

const text = value => typeof value === 'string' && Boolean(value.trim())
const texts = value => Array.isArray(value) && value.every(text)
const records = (value, keys) => Array.isArray(value) && value.every(item => item && keys.every(key => text(item[key])))
export function hasIndiaLesson(fact) {
  const l = fact?.india_lesson
  return Boolean(fact?.category === 'india' && fact.schema_version === '2.0' && fact.article_type === 'india_lesson'
    && l && ['theme','question','learning_goal','central_idea','region','period'].every(key => text(l[key]))
    && l.opening_story && ['title','story','question'].every(key => text(l.opening_story[key]))
    && text(l.background?.explanation) && records(l.background.key_terms,['term','meaning'])
    && records(l.chapters,['id','title','explanation','example','why_it_matters']) && l.chapters.length >= 3
    && l.chapters.every(c => /^[a-z][a-z0-9_-]{0,47}$/.test(c.id) && texts(c.details))
    && new Set(l.chapters.map(c=>c.id)).size===l.chapters.length
    && l.case_study && ['title','place','story','what_it_shows'].every(key=>text(l.case_study[key]))
    && records(l.timeline,['period','event','significance']) && text(l.wider_connections?.explanation) && texts(l.wider_connections.examples)
    && records(l.nuances,['idea','clarification']) && records(l.photos,['id','section_id','subject','kind','query'])
    && records(l.knowledge_checks,['question','answer','explanation']) && texts(l.takeaways) && texts(l.related_topics))
}
export function indiaPhotos(fact, sectionId) {
  return (fact?.india_lesson?.photos || []).flatMap((request,index) => {
    if (request.section_id !== sectionId) return []
    const credit=countryPhoto(fact.image_credits?.[`india_photo_${index}`])
    if (!credit || credit.section_id !== sectionId || credit.photo_id !== request.id) return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.image_caption || credit.title}]
  })
}

export function indiaScenes(fact) {
  const seen=new Set()
  const ranked=fact?.india_media?.photo_ranking_version===1&&fact?.photo_selection?.mode!=='legacy_fallback'
  if(ranked&&fact?.photo_selection?.status!=='completed')return []
  const result=Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^india_scene_\d+$/.test(key)||!value?.india_carousel)return []
    const photo=countryPhoto(value)
    const popular=photo?.provider==='unsplash'&&photo.detail_fetched===true&&photo.selection_mode==='popular_fallback'&&Boolean(photo.scene_query?.trim())
    const popularPick=photo?.provider==='unsplash'&&photo.popular_pick===true&&photo.selection_mode==='popular_unsplash'
    const selected=['unsplash','wikimedia'].includes(photo?.provider)&&photo.selection_mode==='llm_ranked'&&photo.ranking_model==='gpt-6-luna'
    if(!photo||!['unsplash','wikimedia'].includes(photo.provider)||(!popular&&!popularPick&&!selected&&!indiaSceneMatches(photo,photo.scene_query||'',fact))||seen.has(photo.source_url))return []
    seen.add(photo.source_url)
    return [{url:photo.url,credit:photo,alt:photo.description,caption:photo.image_caption||photo.title}]
  })
  return ranked&&result.length<10&&!result.some(item=>item.credit.popular_pick===true)?[]:result
}

const photoWords=value=>new Set((String(value||'').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(w=>w.length>=3).map(w=>w.length>4&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w))
const photoNoise=new Set(['india','indian','photo','photograph','the','and','for','with','from','near','view','landscape','village','hill','hills'])
export function indiaSceneMatches(photo,query,fact) {
  const l=fact?.india_lesson||{},geography=photoWords(`${(l.region||'').split(',').slice(0,2).join(' ')} ${l.case_study?.place||''}`)
  const subject=value=>[...photoWords(value)].filter(w=>!geography.has(w)&&!photoNoise.has(w))
  const tags=Array.isArray(photo.tags)?photo.tags.filter(t=>typeof t==='string').join(' '):''
  let wanted=subject(query)
  const core=subject(fact?.topic),evidence=photoWords(`${photo.title||''} ${photo.description||''} ${photo.alt_description||''} ${photo.location_country||''} ${photo.location_name||''} ${tags}`)
  const regional=[...photoWords(query)].filter(w=>geography.has(w)&&!photoNoise.has(w))
  let minimum=Math.min(2,wanted.length)
  if(!wanted.length&&regional.length){wanted=core;minimum=1}
  return wanted.length>0&&wanted.filter(w=>evidence.has(w)).length>=minimum&&(!core.length||core.some(w=>evidence.has(w)))&&(!regional.length||regional.some(w=>evidence.has(w)))
}
