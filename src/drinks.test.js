import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {hasDrinksLesson,drinksPhotos,drinksScenes} from './drinks.js'
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/drinks-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/drink.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Drink.jpg',license:'CC BY 2.0',license_url:'https://creativecommons.org/licenses/by/2.0/',author:'Photographer',title:'A drink',description:'A photograph of a drink'}
test('Drinks uses a distinct reader and permits optional science without affecting legacy',()=>{
 const f=fixture();assert.ok(hasDrinksLesson(f));assert.equal(hasDrinksLesson({category:'drinks'}),false)
 f.drinks_lesson.science=[];f.drinks_lesson.science_focus_id=null;assert.ok(hasDrinksLesson(f))
})
test('Recipe checks quantities, ingredient coverage and alcohol labelling',()=>{
 for(const mutate of [r=>r.ingredients[0].amount=NaN,r=>r.servings=0,r=>r.steps[0].ingredient_ids=['missing'],r=>r.ingredients[0].contains_alcohol=true,r=>r.ingredients[0].contains_alcohol='false',r=>r.substitutions[0].ingredient_id='missing']){
  const f=fixture();mutate(f.drinks_lesson.recipe);assert.equal(hasDrinksLesson(f),false)
 }
})
test('Photo requests bind valid entries and need a real search plan',()=>{
 for(const mutate of [l=>l.photos=[],l=>l.photos[0].entry_id='missing',l=>l.photos[0].queries=[],l=>l.science_focus_id='missing']){const f=fixture();mutate(f.drinks_lesson);assert.equal(hasDrinksLesson(f),false)}
})
test('Repeated section photographs retain entry binding and exact-source restrictions',()=>{
 const f=fixture(),p=f.drinks_lesson.photos.find(p=>p.section_id==='ingredients'),index=f.drinks_lesson.photos.indexOf(p)
 f.image_credits={[`drinks_photo_${index}`]:{...photo,drinks_photo:true,section_id:p.section_id,photo_id:p.id,entry_id:p.entry_id}}
 assert.equal(drinksPhotos(f,'ingredients',p.entry_id).length,1);assert.equal(drinksPhotos(f,'ingredients').length,0)
 f.image_credits[`drinks_photo_${index}`].popular_pick=true;assert.equal(drinksPhotos(f,'ingredients',p.entry_id).length,0)
})
test('Gallery deduplicates sources and keeps popular picks at the end',()=>{
 const f=fixture();f.image_credits={drinks_scene_0:{...photo,drinks_carousel:true,popular_pick:true},drinks_scene_1:{...photo,source_url:photo.source_url+'2',drinks_carousel:true},drinks_scene_2:{...photo,drinks_carousel:true}}
 const photos=drinksScenes(f);assert.equal(photos.length,2);assert.equal(photos.at(-1).credit.popular_pick,true)
})
const edition2=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/drinks-lesson-v2.json',import.meta.url)))
test('Second edition requires both production stories and all dedicated photo searches',()=>{
 assert.ok(hasDrinksLesson(edition2()))
 for(const mutate of [l=>delete l.production_evolution,l=>l.production_evolution.modern.steps=[],l=>l.photos.pop(),l=>l.photos[0].queries=['one'],l=>l.science_focus_id=null]){
  const f=edition2();mutate(f.drinks_lesson);assert.equal(hasDrinksLesson(f),false)
 }
})
test('New Drinks carousel accepts stock providers and rejects documentary section photos',()=>{
 const f=edition2()
 const unsplash={...photo,provider:'unsplash',url:'https://images.unsplash.com/photo-drink',source_url:'https://unsplash.com/photos/drink',license:'Unsplash License',license_url:'https://unsplash.com/license',author_url:'https://unsplash.com/@photographer',drinks_carousel:true}
 const pixabay={...photo,provider:'pixabay',url:'https://objectstorage.ap-mumbai-1.oraclecloud.com/p/example/drink.jpg',source_url:'https://pixabay.com/photos/drink-123/',license:'Pixabay Content License',license_url:'https://pixabay.com/service/license-summary/',author_url:'https://pixabay.com/users/photographer-1/',stored_locally:true,drinks_carousel:true}
 f.image_credits={drinks_scene_0:{...photo,drinks_carousel:true},drinks_scene_1:unsplash,drinks_scene_2:pixabay}
 assert.deepEqual(drinksScenes(f).map(p=>p.credit.provider),['unsplash','pixabay'])
 f.image_credits.drinks_photo_0={...unsplash,drinks_photo:true,photo_id:f.drinks_lesson.photos[0].id,section_id:'overview',entry_id:null}
 assert.equal(drinksPhotos(f,'overview').length,0)
})
test('Opening hook is optional for saved articles and only renders when complete',async()=>{
 const {hasDrinksOpening}=await import('./drinks.js')
 assert.equal(hasDrinksOpening(fixture()),false)
 const f=edition2();assert.equal(hasDrinksOpening(f),true)
 f.drinks_lesson.opening_hook.bridge_question='';assert.equal(hasDrinksOpening(f),false)
})
test('Optional notes do not send complete lessons back to the generic reader',()=>{
 for(const factory of [fixture,edition2]){
  const f=factory(),l=f.drinks_lesson
  delete l.identity.strength_context;l.origin.evidence_and_uncertainty=null
  l.science.forEach(p=>delete p.limits);l.variations.forEach(p=>p.evidence_and_uncertainty=null)
  assert.equal(hasDrinksLesson(f),true)
  l.science[0].limits=123;assert.equal(hasDrinksLesson(f),false)
 }
})
test('Historical notes share one collection without hiding their factual content',async()=>{
 const {drinksHistoryNotes}=await import('./drinks.js')
 const f=edition2(),l=f.drinks_lesson
 l.origin.evidence_and_uncertainty='The earliest attribution is disputed.'
 l.variations[0].evidence_and_uncertainty='  The earliest attribution is disputed. '
 l.variations[1].evidence_and_uncertainty=null
 assert.deepEqual(drinksHistoryNotes(f),[{title:'Origin',text:'The earliest attribution is disputed.'}])
 l.origin.evidence_and_uncertainty=null;l.variations[0].evidence_and_uncertainty=undefined
 assert.deepEqual(drinksHistoryNotes(f),[])
})
const edition3=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/drinks-lesson-v3.json',import.meta.url)))
test('Third edition routes to the reader with making comparisons and six detailed discoveries',async()=>{
 const {drinksView}=await import('./drinks.js');const f=edition3()
 assert.equal(hasDrinksLesson(f),true);assert.equal(f.drinks_lesson.explore_drinks.length,6)
 const v=drinksView(f);assert.equal(v.opening,f.drinks_lesson.opening);assert.equal(v.making.stages.length,3)
 assert.equal(v.making.comparisons[1].relationship,'contemporary_alternative')
 assert.ok(v.explore.some(p=>p.relationship==='related_drink'));assert.equal(v.related.length,0)
})
test('Third edition rejects invalid bindings and maintains alcohol and recipe checks',()=>{
 for(const mutate of [l=>l.making.stages[0].id='unknown',l=>l.explore_drinks[0].relationship='descendant',l=>l.explore_drinks[1].name=l.explore_drinks[0].name,l=>l.photos[0].entry_id='unknown',l=>l.recipe.ingredients[0].contains_alcohol=true,l=>l.science_focus_id=null]){
  const f=edition3();mutate(f.drinks_lesson);assert.equal(hasDrinksLesson(f),false)
 }
})
test('Third edition supports thirty photo requests and all eight detailed related drinks',()=>{
 const f=edition3(),l=f.drinks_lesson
 for(let i=6;i<8;i++){l.explore_drinks.push({...l.explore_drinks[0],id:`extra_${i}`,name:`Example ${i}`});l.photos.push({...l.photos[0],id:`extra_photo_${i}`,section_id:'explore',entry_id:`extra_${i}`})}
 while(l.photos.length<30)l.photos.push({...l.photos[0],id:`extra_photo_${l.photos.length}`})
 assert.equal(hasDrinksLesson(f),true)
 l.photos.push({...l.photos[0],id:'overflow'});assert.equal(hasDrinksLesson(f),false)
})
test('Saved editions keep working with a single opening and one preparation sequence',async()=>{
 const {drinksView}=await import('./drinks.js')
 for(const f of [fixture(),edition2()]){
  const v=drinksView(f);assert.equal(v.making.stages.length,f.drinks_lesson.production_steps.length)
  assert.equal(v.opening.question.endsWith('?'),true)
 }
})

test('Saved lessons retain distinctive and preparation context without repeating step lists',async()=>{
 const {drinksView}=await import('./drinks.js'),f=edition2(),v=drinksView(f)
 assert.equal(v.distinction,f.drinks_lesson.introduction.what_makes_it_unique)
 for(const [index,era] of ['historical','modern'].entries()){
  assert.equal(v.making.details[index].context,f.drinks_lesson.production_evolution[era].context)
  assert.deepEqual(v.making.details[index].equipment,f.drinks_lesson.production_evolution[era].equipment)
  assert.equal(v.making.details[index].result,f.drinks_lesson.production_evolution[era].result)
 }
 assert.equal(drinksView(edition3()).making.details.length,0)
})
