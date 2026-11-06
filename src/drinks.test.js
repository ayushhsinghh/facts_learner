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
