import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
export function hasFoodLesson(fact) {
  const l=fact?.food_lesson,r=l?.recipe,n=l?.nutrition_context
  return Boolean(fact?.category==='food'&&fact.schema_version==='2.0'&&fact.article_type==='food_lesson'&&l
    &&['hook','question','learning_goal'].every(k=>text(l[k]))
    &&['name','local_name','region','food_type'].every(k=>text(l.identity?.[k]))&&texts(l.identity.country_names)
    &&['explanation','how_it_is_served','why_it_is_interesting'].every(k=>text(l.introduction?.[k]))
    &&['explanation','regional_variation','uncertainty'].every(k=>text(l.origin_and_context?.[k]))
    &&['flavour','aroma','texture','heat','serving_temperature'].every(k=>text(l.sensory_profile?.[k]))
    &&records(l.key_ingredients,['name','role','effect_on_taste'])&&records(l.food_science,['title','explanation','kitchen_cue'])
    &&r&&['title','traditional_preparation','adaptation_notes'].every(k=>text(r[k]))
    &&Number.isInteger(r.servings)&&r.servings>0&&['prep_minutes','cook_minutes','rest_minutes'].every(k=>Number.isFinite(r[k])&&r[k]>=0)
    &&texts(r.equipment)&&texts(r.allergens)&&texts(r.safety_notes)
    &&records(r.ingredients,['id','name','unit','household_measure','preparation','role'])&&r.ingredients.length>=3
    &&r.ingredients.every(i=>Number.isFinite(i.amount)&&i.amount>0)&&new Set(r.ingredients.map(i=>i.id)).size===r.ingredients.length
    &&records(r.substitutions,['ingredient_id','substitute','quantity','effect'])
    &&records(r.steps,['title','instruction','time_guidance','doneness_cue'])&&r.steps.length>=3&&r.steps.every(s=>texts(s.ingredient_ids))
    &&r.substitutions.every(s=>r.ingredients.some(i=>i.id===s.ingredient_id))
    &&r.steps.every(s=>s.ingredient_ids.every(id=>r.ingredients.some(i=>i.id===id)))
    &&r.ingredients.every(i=>r.steps.some(s=>s.ingredient_ids.includes(i.id)))
    &&n&&['explanation','tradeoffs','portion_context','serving_basis'].every(k=>text(n[k]))&&texts(n.assumptions)
    &&['estimated','not_estimated'].includes(n.estimate_status)&&records(n.nutrients,['name','unit'])&&n.nutrients.every(x=>Number.isFinite(x.amount)&&x.amount>=0)
    &&records(l.serving_ideas,['title','explanation'])&&records(l.variations,['name','region','difference'])
    &&records(l.troubleshooting,['problem','cause','fix'])&&texts(l.takeaways)&&texts(l.related_foods)
    &&records(l.photos,['id','section_id','subject'])&&l.photos.every(p=>texts(p.queries)))
}
export function foodPhotos(fact,section) {
  return (fact?.food_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section)return []
    const credit=countryPhoto(fact.image_credits?.[`food_photo_${index}`])
    return credit?.food_photo&&credit.section_id===section&&credit.photo_id===request.id
      ?[{url:credit.url,credit,alt:credit.description,caption:credit.title}]:[]
  })
}
export function foodScenes(fact) {
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^food_scene_\d+$/.test(key)||!value?.food_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).slice(0,6)
}
