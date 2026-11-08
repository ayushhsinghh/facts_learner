import { countryPhoto } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const optionalText=v=>v==null||text(v)
const texts=v=>Array.isArray(v)&&v.every(text)
const rows=(v,keys)=>Array.isArray(v)&&v.every(p=>p&&keys.every(k=>text(p[k])))
const ids=v=>v.every(p=>/^[a-z][a-z0-9_-]{0,47}$/.test(p.id))&&new Set(v.map(p=>p.id)).size===v.length
export const DRINK_SECTIONS=['overview','origin','history','method','ingredients','science','recipe','variations','serving','historical_making','modern_making','explore']
export function hasDrinksOpening(f){
 const l=f?.drinks_lesson
 if(l?.content_version===3)return Boolean(l.opening&&['heading','introduction','question'].every(k=>text(l.opening[k])))
 const h=l?.opening_hook
 return Boolean(h&&['heading','introduction','intriguing_detail','bridge_question'].every(k=>text(h[k])))
}
export function hasDrinksLesson(f){
 if(f?.drinks_lesson?.content_version===3)return hasDrinksThirdEdition(f)
 const l=f?.drinks_lesson,r=l?.recipe,i=l?.identity
 if(!(f?.category==='drinks'&&f.schema_version==='2.0'&&f.article_type==='drinks_lesson'&&l&&i&&r))return false
 if(!['name','region'].every(k=>text(i[k]))||!texts(i.country_names)||!i.country_names.length||!texts(i.local_names)||!['cocktail','mocktail','wine','spirit','beer','fermented_drink','traditional_beverage','non_alcoholic'].includes(i.drink_type)||!['alcoholic','non_alcoholic','varies'].includes(i.alcohol_status))return false
 for(const [key,fields] of Object.entries({introduction:['explanation','what_makes_it_unique','cultural_role'],origin:['account'],then_and_now:['earlier_method','modern_method','what_changed','what_remains'],sensory_profile:['flavour','aroma','texture','finish','serving_temperature'],serving_context:['glassware','pairing_and_customs','practical_notes']}))if(!fields.every(k=>text(l[key]?.[k])))return false
 if(!['hook','question','learning_goal'].every(k=>text(l[k])))return false
 for(const [key,fields,lo,hi] of [['history',['id','period','event','why_it_changed'],2,6],['ingredients',['id','name','role','effect'],2,10],['production_steps',['id','title','explanation','what_to_notice'],2,6],['science',['id','title','mechanism','explanation','observable_cue'],0,3],['variations',['id','name','place','difference','how_it_developed'],1,6]])if(!rows(l[key],fields)||l[key].length<lo||l[key].length>hi||!ids(l[key]))return false
 if(!optionalText(i.strength_context)||!optionalText(l.origin.evidence_and_uncertainty)||l.science.some(p=>!optionalText(p.limits))||l.variations.some(p=>!optionalText(p.evidence_and_uncertainty)))return false
 if(l.science_focus_id!==null&&!l.science.some(s=>s.id===l.science_focus_id))return false
 if(l.serving_context.alcohol_free_option!==null&&!text(l.serving_context.alcohol_free_option))return false
 if(!['title','traditional_preparation','adaptation_notes'].every(k=>text(r[k]))||!['home_mixed','serving_adaptation','alcohol_free_interpretation'].includes(r.preparation_type)||!['alcoholic','non_alcoholic'].includes(r.alcohol_status))return false
 if(!Number.isInteger(r.servings)||r.servings<1||r.servings>20||!['prep_minutes','cook_minutes','rest_minutes'].every(k=>Number.isFinite(r[k])&&r[k]>=0&&r[k]<=2880)||!texts(r.equipment)||!r.equipment.length||!texts(r.allergens)||!texts(r.safety_notes))return false
 if(!rows(r.ingredients,['id','name','unit','household_measure','preparation','role'])||r.ingredients.length<2||r.ingredients.length>20||!ids(r.ingredients)||r.ingredients.some(p=>!Number.isFinite(p.amount)||p.amount<=0||p.amount>100000||typeof p.contains_alcohol!=='boolean'))return false
 if(!rows(r.steps,['title','instruction','time_guidance','doneness_cue'])||r.steps.length<2||r.steps.length>12||r.steps.some(p=>!texts(p.ingredient_ids)))return false
 const used=new Set(r.steps.flatMap(p=>p.ingredient_ids));if(used.size!==r.ingredients.length||r.ingredients.some(p=>!used.has(p.id)))return false
 if(!rows(r.substitutions,['ingredient_id','substitute','quantity','effect'])||r.substitutions.some(p=>!used.has(p.ingredient_id)))return false
 const alcohol=r.ingredients.some(p=>p.contains_alcohol);if(alcohol!==(r.alcohol_status==='alcoholic')||alcohol&&(i.alcohol_status==='non_alcoholic'||r.preparation_type==='alcohol_free_interpretation'))return false
 if(l.content_version!==undefined&&l.content_version!==2)return false
 if(l.content_version===2){
  if(!l.science.length||!l.science_focus_id)return false
  for(const era of ['historical','modern']){const p=l.production_evolution?.[era];if(!p||!text(p.context)||!text(p.result)||!texts(p.equipment)||!p.equipment.length||!texts(p.steps)||p.steps.length<2||p.steps.length>6)return false}
  if(!Array.isArray(l.photos)||!['overview','origin','historical_making','modern_making','ingredients','recipe','variations','serving'].every(s=>l.photos.some(p=>p.section_id===s)))return false
  if(l.photos.some(p=>!texts(p.queries)||p.queries.length<2||p.queries.length>3||new Set(p.queries.map(q=>q.toLowerCase())).size!==p.queries.length))return false
 }
 const refs={ingredients:l.ingredients,method:l.production_steps,science:l.science,variations:l.variations}
 return rows(l.troubleshooting,['problem','cause','fix'])&&l.troubleshooting.length>=1&&rows(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&texts(l.takeaways)&&l.takeaways.length>=2&&texts(l.related_drinks)&&rows(l.photos,['id','section_id','kind','subject'])&&l.photos.length>=4&&l.photos.length<=18&&ids(l.photos)&&new Set(l.photos.map(p=>p.section_id)).size>=3&&l.photos.every(p=>DRINK_SECTIONS.includes(p.section_id)&&(p.section_id!=='science'||l.science.length>0)&&['drink','ingredient','process','named_place','person','historical_object'].includes(p.kind)&&texts(p.queries)&&p.queries.length>=1&&p.queries.length<=4&&p.queries.every(q=>q.length<=160)&&(p.entry_id===null||refs[p.section_id]?.some(r=>r.id===p.entry_id)))
}
export function drinksPhotos(f,section,entry=null){
 return (f?.drinks_lesson?.photos||[]).flatMap((p,index)=>{
  if(p.section_id!==section||p.entry_id!==entry)return []
  const c=countryPhoto(f.image_credits?.[`drinks_photo_${index}`])
  if([2,3].includes(f.drinks_lesson.content_version)&&c?.provider!=='wikimedia')return []
  if(!c?.drinks_photo||c.popular_pick||c.photo_id!==p.id||c.section_id!==section||c.entry_id!==entry||['named_place','person','historical_object'].includes(p.kind)&&c.provider!=='wikimedia')return []
  return [{url:c.url,credit:c,alt:c.description,caption:c.title}]
 })
}
export function drinksScenes(f){
 const seen=new Set()
 return Object.entries(f?.image_credits||{}).flatMap(([key,v])=>{
  if(!/^drinks_scene_\d+$/.test(key)||!v?.drinks_carousel)return []
  const c=countryPhoto(v);if(!c||seen.has(c.source_url)||[2,3].includes(f.drinks_lesson?.content_version)&&!['unsplash','pixabay'].includes(c.provider))return [];seen.add(c.source_url);return [{url:c.url,credit:c,alt:c.description,caption:c.title}]
 }).sort((a,b)=>Number(Boolean(a.credit.popular_pick))-Number(Boolean(b.credit.popular_pick))).slice(0,12)
}

export function drinksHistoryNotes(fact){
 const l=fact?.drinks_lesson,seen=new Set()
 return [{title:'Origin',text:l?.origin?.evidence_and_uncertainty},...(l?.variations||[]).map(p=>({title:p.name,text:p.evidence_and_uncertainty}))].filter(p=>{
  if(!text(p.text))return false
  const key=p.text.trim().replace(/\s+/g,' ').toLowerCase()
  if(seen.has(key))return false
  seen.add(key);return true
 })
}

function validDrinksCore(f){
 const l=f?.drinks_lesson,i=l?.identity,r=l?.recipe
 if(f?.category!=='drinks'||f.schema_version!=='2.0'||f.article_type!=='drinks_lesson'||!i||!r||!text(l.hook)||!text(l.origin?.account))return false
 if(!['name','region'].every(k=>text(i[k]))||!texts(i.country_names)||!i.country_names.length||!texts(i.local_names)||!optionalText(i.strength_context)||!optionalText(l.origin.evidence_and_uncertainty)||!['cocktail','mocktail','wine','spirit','beer','fermented_drink','traditional_beverage','non_alcoholic','coffee','tea','cocoa','juice','soft_drink'].includes(i.drink_type)||!['alcoholic','non_alcoholic','varies'].includes(i.alcohol_status))return false
 if(!['flavour','aroma','texture','finish','serving_temperature'].every(k=>text(l.sensory_profile?.[k]))||!['glassware','pairing_and_customs','practical_notes'].every(k=>text(l.serving_context?.[k]))||!optionalText(l.serving_context?.alcohol_free_option))return false
 if(!rows(l.ingredients,['id','name','role','effect'])||l.ingredients.length<2||l.ingredients.length>10||!ids(l.ingredients)||!rows(l.science,['id','title','mechanism','explanation','observable_cue'])||!ids(l.science)||l.science.some(p=>!optionalText(p.limits))||!l.science.some(p=>p.id===l.science_focus_id))return false
 if(!['title','traditional_preparation','adaptation_notes'].every(k=>text(r[k]))||!['home_mixed','serving_adaptation','alcohol_free_interpretation'].includes(r.preparation_type)||!['alcoholic','non_alcoholic'].includes(r.alcohol_status))return false
 if(!Number.isInteger(r.servings)||r.servings<1||r.servings>20||!['prep_minutes','cook_minutes','rest_minutes'].every(k=>Number.isFinite(r[k])&&r[k]>=0&&r[k]<=2880)||!texts(r.equipment)||!r.equipment.length||!texts(r.allergens)||!texts(r.safety_notes))return false
 if(!rows(r.ingredients,['id','name','unit','household_measure','preparation','role'])||r.ingredients.length<2||r.ingredients.length>20||!ids(r.ingredients)||r.ingredients.some(p=>!Number.isFinite(p.amount)||p.amount<=0||p.amount>100000||typeof p.contains_alcohol!=='boolean'))return false
 if(!rows(r.steps,['title','instruction','time_guidance','doneness_cue'])||r.steps.length<2||r.steps.length>12||r.steps.some(p=>!texts(p.ingredient_ids)))return false
 const used=new Set(r.steps.flatMap(p=>p.ingredient_ids));if(used.size!==r.ingredients.length||r.ingredients.some(p=>!used.has(p.id)))return false
 if(!rows(r.substitutions,['ingredient_id','substitute','quantity','effect'])||r.substitutions.some(p=>!used.has(p.ingredient_id)))return false
 const alcohol=r.ingredients.some(p=>p.contains_alcohol);if(alcohol!==(r.alcohol_status==='alcoholic')||alcohol&&(i.alcohol_status==='non_alcoholic'||r.preparation_type==='alcohol_free_interpretation'))return false
 return rows(l.troubleshooting,['problem','cause','fix'])&&l.troubleshooting.length>=1&&l.troubleshooting.length<=5&&rows(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&l.knowledge_checks.length<=3&&texts(l.takeaways)&&l.takeaways.length>=2&&l.takeaways.length<=5
}
const changeKinds=['documented_change','continuing_tradition','contemporary_alternative']
function hasDrinksThirdEdition(f){
 const l=f.drinks_lesson,m=l.making,e=l.explore_drinks
 if(!hasDrinksOpening(f)||!text(l.origin?.cultural_role)||!m||!text(m.introduction)||!changeKinds.includes(m.evolution_kind)||!texts(m.defining_features)||m.defining_features.length<2||m.defining_features.length>4)return false
 if(!rows(m.stages,['id','title','action','why_it_matters','what_to_notice'])||m.stages.length<3||m.stages.length>5||!ids(m.stages))return false
 if(!rows(m.comparisons,['id','aspect','earlier_or_standard','today_or_alternative','effect','relationship'])||m.comparisons.length>4||!ids(m.comparisons)||m.comparisons.some(p=>!changeKinds.includes(p.relationship)))return false
 if(!rows(e,['id','name','place','relationship','description','preparation','taste_difference','connection'])||e.length<2||e.length>8||!ids(e)||e.some(p=>!['variation','related_drink','documented_influence'].includes(p.relationship)||!texts(p.ingredients)||!p.ingredients.length||p.ingredients.length>8||!optionalText(p.development)))return false
 const names=e.map(p=>p.name.trim().toLowerCase());if(new Set(names).size!==names.length||names.includes(l.identity?.name?.trim().toLowerCase()))return false
 if(!Array.isArray(l.history)||l.history.length>6||!rows(l.history,['id','period','event','why_it_changed'])||!ids(l.history)||!Array.isArray(l.science)||l.science.length!==1)return false
 if(!Array.isArray(l.photos)||l.photos.length<12||l.photos.length>30||!ids(l.photos))return false
 const required=['overview','origin','method','ingredients','recipe','explore','serving']
 const refs={ingredients:l.ingredients,method:m.stages,science:l.science,explore:e}
 if(!required.every(section=>l.photos.some(p=>p.section_id===section))||l.photos.some(p=>!text(p.subject)||!['drink','ingredient','process','named_place','person','historical_object'].includes(p.kind)||!required.concat('science','history').includes(p.section_id)||!texts(p.queries)||p.queries.length<2||p.queries.length>3||p.queries.some(q=>q.length>160)||new Set(p.queries.map(q=>q.toLowerCase())).size!==p.queries.length||(p.entry_id!==null&&!refs[p.section_id]?.some(r=>r.id===p.entry_id))))return false
 for(const section of ['ingredients','method','explore'])if(!refs[section]?.every(p=>l.photos.some(photo=>photo.section_id===section&&photo.entry_id===p.id)))return false
 return validDrinksCore(f)
}
export function drinksView(f){
 const l=f.drinks_lesson
 if(l.content_version===3)return {opening:l.opening,culture:l.origin.cultural_role,distinction:null,making:{...l.making,details:[]},explore:l.explore_drinks,related:[]}
 const h=l.opening_hook,bridge=h?.bridge_question||l.question
 return {opening:{heading:h?.heading||l.question,introduction:h?[h.introduction,h.intriguing_detail].filter(Boolean).join('\n\n'):l.introduction.explanation,question:bridge.includes('?')?bridge.slice(0,bridge.indexOf('?')+1):bridge},
  culture:l.introduction.cultural_role,distinction:l.introduction.what_makes_it_unique,
  making:{introduction:null,evolution_kind:null,stages:l.production_steps.map(p=>({...p,action:p.explanation,why_it_matters:null})),comparisons:[{id:'legacy_comparison',aspect:'Earlier and current approaches',earlier_or_standard:l.then_and_now.earlier_method,today_or_alternative:l.then_and_now.modern_method,effect:l.then_and_now.what_changed,relationship:null}],defining_features:[l.then_and_now.what_remains],details:l.production_evolution?[{title:'Earlier methods',...l.production_evolution.historical},{title:'Current methods',...l.production_evolution.modern}]:[]},
  explore:l.variations.map(p=>({...p,relationship:'variation',description:p.difference,ingredients:[],preparation:null,taste_difference:null,connection:null,development:p.how_it_developed})),
  related:l.related_drinks.filter(name=>!l.variations.some(p=>p.name.toLowerCase()===name.toLowerCase()))}
}
