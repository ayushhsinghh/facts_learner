import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasFashionLesson,fashionPhotos,fashionScenes } from './fashion.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/fashion-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/denim.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Denim.jpg',
  author:'Photographer',title:'Denim cloth',description:'A denim fabric sample',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/'}
test('fashion has a dedicated global reader and preserves old facts',()=>{
  assert.equal(hasFashionLesson(fixture()),true)
  assert.equal(hasFashionLesson({category:'fashion',topic:'Older fashion fact'}),false)
  assert.equal(hasFashionLesson({...fixture(),category:'food'}),false)
  const f=fixture();f.fashion_lesson.recognition_guide[1].id='diagonal';assert.equal(hasFashionLesson(f),false)
})
test('technique lessons can omit wearing properties, styling and care',()=>{
  const f=fixture();Object.assign(f.fashion_lesson,{subject_type:'technique',wearing_properties:[],practical_guide:null,care:[],variations:[]})
  assert.equal(hasFashionLesson(f),true)
  f.fashion_lesson.subject_type='garment';assert.equal(hasFashionLesson(f),false)
})
test('photos need a matching feature, section, request and reusable source',()=>{
  const f=fixture();f.image_credits={fashion_photo_0:{...photo,fashion_photo:true,section_id:'recognition',photo_id:'recognition',feature_id:'diagonal'}}
  assert.equal(fashionPhotos(f,'recognition').length,1)
  assert.equal(fashionPhotos(f,'materials').length,0)
  f.image_credits.fashion_photo_0.feature_id='unknown';assert.equal(fashionPhotos(f,'recognition').length,0)
  Object.assign(f.image_credits.fashion_photo_0,{feature_id:'diagonal',license:'All rights reserved'});assert.equal(fashionPhotos(f,'recognition').length,0)
})
test('generic stock cannot identify a historical object and gallery sources are unique',()=>{
  const f=fixture();f.fashion_lesson.photos[0].kind='historical_object'
  const stock={provider:'unsplash',url:'https://images.unsplash.com/model',source_url:'https://unsplash.com/photos/model',author_url:'https://unsplash.com/@author',
    author:'Photographer',title:'Fashion',description:'A fashion photo',license:'Unsplash License',license_url:'https://unsplash.com/license'}
  f.image_credits={fashion_photo_0:{...stock,fashion_photo:true,section_id:'recognition',photo_id:'recognition',feature_id:'diagonal'},
    fashion_scene_0:{...photo,fashion_carousel:true},fashion_scene_1:{...photo,fashion_carousel:true}}
  assert.equal(fashionPhotos(f,'recognition').length,0);assert.equal(fashionScenes(f).length,1)
})
