import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasFoodLesson,foodPhotos,foodScenes } from './food.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/food-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/hummus.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Hummus.jpg',
  license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Photographer',title:'Hummus',description:'Hummus in a bowl'}
test('global food has its own reader while old Food and Indian Diet remain compatible',()=>{
  assert.equal(hasFoodLesson(fixture()),true)
  assert.equal(hasFoodLesson({category:'food',topic:'An older fact'}),false)
  assert.equal(hasFoodLesson({...fixture(),category:'indian_diet'}),false)
  const f=fixture();f.food_lesson.recipe.steps[0].ingredient_ids=['unknown'];assert.equal(hasFoodLesson(f),false)
})
test('food photographs need valid provenance and a matching section request',()=>{
  const f=fixture();f.image_credits={food_photo_0:{...photo,food_photo:true,section_id:'overview',photo_id:'dish'}}
  assert.equal(foodPhotos(f,'overview').length,1);assert.equal(foodPhotos(f,'recipe').length,0)
  f.image_credits.food_photo_0.photo_id='incorrect';assert.equal(foodPhotos(f,'overview').length,0)
  f.image_credits.food_photo_0={...photo,food_photo:true,section_id:'overview',photo_id:'dish',license:'All rights reserved'}
  assert.equal(foodPhotos(f,'overview').length,0)
})
test('food galleries exclude inline figures and repeated sources',()=>{
  const f=fixture();f.image_credits={food_photo_0:{...photo,food_photo:true},food_scene_0:{...photo,food_carousel:true},food_scene_1:{...photo,food_carousel:true}}
  assert.equal(foodScenes(f).length,1)
  f.image_credits.food_scene_0.url='https://untrusted.example/image';delete f.image_credits.food_scene_1
  assert.equal(foodScenes(f).length,0)
})
