import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
const optionalText=v=>v===null||text(v)
export function hasFashionLesson(fact) {
  const l=fact?.fashion_lesson,g=l?.practical_guide
  return Boolean(fact?.category==='fashion'&&fact.schema_version==='2.0'&&fact.article_type==='fashion_lesson'&&l
    &&['garment','textile','accessory','technique','tradition'].includes(l.subject_type)
    &&['hook','question','learning_goal'].every(k=>text(l[k]))
    &&['name','local_name','region','period'].every(k=>text(l.identity?.[k]))
    &&['explanation','why_it_matters'].every(k=>text(l.introduction?.[k]))
    &&records(l.recognition_guide,['id','feature','where_to_look','why_it_matters'])&&l.recognition_guide.length>=3&&l.recognition_guide.length<=5
    &&new Set(l.recognition_guide.map(x=>x.id)).size===l.recognition_guide.length
    &&l.recognition_guide.every(x=>/^[a-z][a-z0-9_-]{0,47}$/.test(x.id)&&optionalText(x.comparison))
    &&['explanation','uncertainty'].every(k=>text(l.origin_and_context?.[k]))&&optionalText(l.origin_and_context.deeper_history)
    &&records(l.materials,['name','material_type','role','tradeoffs'])&&l.materials.length>0
    &&l.materials.every(m=>['fibre','yarn','fabric','finish','component'].includes(m.material_type))
    &&records(l.construction,['title','explanation','visible_effect'])&&l.construction.length>0
    &&records(l.wearing_properties,['property','explanation','depends_on'])
    &&(!['garment','textile'].includes(l.subject_type)||l.wearing_properties.length>0)
    &&(g===null||g&&text(g.introduction)&&['wearing_suggestions','use_examples','fit_and_movement','climate_considerations','cultural_considerations'].every(k=>texts(g[k]))&&(g.wearing_suggestions.length>0||g.use_examples.length>0))
    &&(!['garment','accessory'].includes(l.subject_type)||g?.wearing_suggestions?.length>0)
    &&records(l.care,['action','reason','limits'])&&records(l.variations,['name','region_or_period','difference'])
    &&records(l.misconceptions,['belief','correction','explanation'])&&l.misconceptions.length>0
    &&texts(l.takeaways)&&l.takeaways.length>=2&&texts(l.related_topics)
    &&records(l.photos,['id','section_id','kind','subject'])&&l.photos.length>=2&&l.photos.length<=6
    &&new Set(l.photos.map(p=>p.id)).size===l.photos.length&&new Set(l.photos.map(p=>p.section_id)).size===l.photos.length
    &&l.photos.some(p=>p.section_id==='recognition')
    &&l.photos.every(p=>texts(p.queries)&&p.queries.length>0&&p.queries.length<=2
      &&['overview','recognition','materials','construction','practical','variations'].includes(p.section_id)
      &&['subject','detail','process','historical_object','person'].includes(p.kind)
      &&(p.feature_id===null||p.section_id==='recognition'&&l.recognition_guide.some(f=>f.id===p.feature_id))
      &&(p.section_id!=='practical'||g!==null)&&(p.section_id!=='variations'||l.variations.length>0)))
}
export function fashionPhotos(fact,section) {
  return (fact?.fashion_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section)return []
    const credit=countryPhoto(fact.image_credits?.[`fashion_photo_${index}`])
    if(!credit?.fashion_photo||credit.section_id!==section||credit.photo_id!==request.id||credit.feature_id!==request.feature_id)return []
    if(['historical_object','person'].includes(request.kind)&&credit.provider!=='wikimedia')return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  })
}
export function fashionScenes(fact) {
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^fashion_scene_\d+$/.test(key)||!value?.fashion_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).slice(0,6)
}
