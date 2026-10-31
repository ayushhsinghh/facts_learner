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
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^india_scene_\d+$/.test(key)||!value?.india_carousel)return []
    const photo=countryPhoto(value)
    if(!photo||photo.provider!=='unsplash'||seen.has(photo.source_url))return []
    seen.add(photo.source_url)
    return [{url:photo.url,credit:photo,alt:photo.description,caption:photo.title}]
  })
}
