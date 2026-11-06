import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const rows=(v,keys)=>Array.isArray(v)&&v.every(p=>p&&keys.every(k=>text(p[k])))
const ids=v=>v.every(p=>/^[a-z][a-z0-9_-]{0,47}$/.test(p.id))&&new Set(v.map(p=>p.id)).size===v.length
export const DRINK_SECTIONS=['overview','origin','history','method','ingredients','science','recipe','variations','serving']
export function hasDrinksLesson(f){
 const l=f?.drinks_lesson,r=l?.recipe,i=l?.identity
 if(!(f?.category==='drinks'&&f.schema_version==='2.0'&&f.article_type==='drinks_lesson'&&l&&i&&r))return false
 if(!['name','region','strength_context'].every(k=>text(i[k]))||!texts(i.country_names)||!i.country_names.length||!texts(i.local_names)||!['cocktail','mocktail','wine','spirit','beer','fermented_drink','traditional_beverage','non_alcoholic'].includes(i.drink_type)||!['alcoholic','non_alcoholic','varies'].includes(i.alcohol_status))return false
 for(const [key,fields] of Object.entries({introduction:['explanation','what_makes_it_unique','cultural_role'],origin:['account','evidence_and_uncertainty'],then_and_now:['earlier_method','modern_method','what_changed','what_remains'],sensory_profile:['flavour','aroma','texture','finish','serving_temperature'],serving_context:['glassware','pairing_and_customs','practical_notes']}))if(!fields.every(k=>text(l[key]?.[k])))return false
 if(!['hook','question','learning_goal'].every(k=>text(l[k])))return false
 for(const [key,fields,lo,hi] of [['history',['id','period','event','why_it_changed'],2,6],['ingredients',['id','name','role','effect'],2,10],['production_steps',['id','title','explanation','what_to_notice'],2,6],['science',['id','title','mechanism','explanation','observable_cue','limits'],0,3],['variations',['id','name','place','difference','how_it_developed','evidence_and_uncertainty'],1,6]])if(!rows(l[key],fields)||l[key].length<lo||l[key].length>hi||!ids(l[key]))return false
 if(l.science_focus_id!==null&&!l.science.some(s=>s.id===l.science_focus_id))return false
 if(l.serving_context.alcohol_free_option!==null&&!text(l.serving_context.alcohol_free_option))return false
 if(!['title','traditional_preparation','adaptation_notes'].every(k=>text(r[k]))||!['home_mixed','serving_adaptation','alcohol_free_interpretation'].includes(r.preparation_type)||!['alcoholic','non_alcoholic'].includes(r.alcohol_status))return false
 if(!Number.isInteger(r.servings)||r.servings<1||r.servings>20||!['prep_minutes','cook_minutes','rest_minutes'].every(k=>Number.isFinite(r[k])&&r[k]>=0&&r[k]<=2880)||!texts(r.equipment)||!r.equipment.length||!texts(r.allergens)||!texts(r.safety_notes))return false
 if(!rows(r.ingredients,['id','name','unit','household_measure','preparation','role'])||r.ingredients.length<2||r.ingredients.length>20||!ids(r.ingredients)||r.ingredients.some(p=>!Number.isFinite(p.amount)||p.amount<=0||p.amount>100000||typeof p.contains_alcohol!=='boolean'))return false
 if(!rows(r.steps,['title','instruction','time_guidance','doneness_cue'])||r.steps.length<2||r.steps.length>12||r.steps.some(p=>!texts(p.ingredient_ids)))return false
 const used=new Set(r.steps.flatMap(p=>p.ingredient_ids));if(used.size!==r.ingredients.length||r.ingredients.some(p=>!used.has(p.id)))return false
 if(!rows(r.substitutions,['ingredient_id','substitute','quantity','effect'])||r.substitutions.some(p=>!used.has(p.ingredient_id)))return false
 const alcohol=r.ingredients.some(p=>p.contains_alcohol);if(alcohol!==(r.alcohol_status==='alcoholic')||alcohol&&(i.alcohol_status==='non_alcoholic'||r.preparation_type==='alcohol_free_interpretation'))return false
 const refs={ingredients:l.ingredients,method:l.production_steps,science:l.science,variations:l.variations}
 return rows(l.troubleshooting,['problem','cause','fix'])&&l.troubleshooting.length>=1&&rows(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&texts(l.takeaways)&&l.takeaways.length>=2&&texts(l.related_drinks)&&rows(l.photos,['id','section_id','kind','subject'])&&l.photos.length>=4&&l.photos.length<=18&&ids(l.photos)&&new Set(l.photos.map(p=>p.section_id)).size>=3&&l.photos.every(p=>DRINK_SECTIONS.includes(p.section_id)&&(p.section_id!=='science'||l.science.length>0)&&['drink','ingredient','process','named_place','person','historical_object'].includes(p.kind)&&texts(p.queries)&&p.queries.length>=1&&p.queries.length<=4&&p.queries.every(q=>q.length<=160)&&(p.entry_id===null||refs[p.section_id]?.some(r=>r.id===p.entry_id)))
}
export function drinksPhotos(f,section,entry=null){
 return (f?.drinks_lesson?.photos||[]).flatMap((p,index)=>{
  if(p.section_id!==section||p.entry_id!==entry)return []
  const c=countryPhoto(f.image_credits?.[`drinks_photo_${index}`])
  if(!c?.drinks_photo||c.popular_pick||c.photo_id!==p.id||c.section_id!==section||c.entry_id!==entry||['named_place','person','historical_object'].includes(p.kind)&&c.provider!=='wikimedia')return []
  return [{url:c.url,credit:c,alt:c.description,caption:c.title}]
 })
}
export function drinksScenes(f){
 const seen=new Set()
 return Object.entries(f?.image_credits||{}).flatMap(([key,v])=>{
  if(!/^drinks_scene_\d+$/.test(key)||!v?.drinks_carousel)return []
  const c=countryPhoto(v);if(!c||seen.has(c.source_url))return [];seen.add(c.source_url);return [{url:c.url,credit:c,alt:c.description,caption:c.title}]
 }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,12)
}
