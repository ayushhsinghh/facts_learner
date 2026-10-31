import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasIndiaLesson, indiaPhotos } from './india.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/india-lesson.json',import.meta.url)))
test('India uses its focused reader and preserves old generic articles',()=>{
  assert.equal(hasIndiaLesson(fixture()),true)
  assert.equal(hasIndiaLesson({category:'india',topic:'An older fact'}),false)
  assert.equal(hasIndiaLesson({...fixture(),category:'country'}),false)
  const f=fixture();delete f.india_lesson.background;assert.equal(hasIndiaLesson(f),false)
})
test('India photos require safe provenance and the matching section and photo request',()=>{
  const f=fixture(),credit={provider:'wikimedia',url:'https://upload.wikimedia.org/photo.jpg',
    source_url:'https://commons.wikimedia.org/wiki/File:Photo.jpg',license:'CC BY-SA 4.0',
    license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Photographer',title:'Stepwell',description:'A stepped route',
    section_id:'route',photo_id:'route-photo'}
  f.image_credits={india_photo_0:credit}
  assert.equal(indiaPhotos(f,'route').length,1)
  assert.equal(indiaPhotos(f,'case-study').length,0)
  f.image_credits.india_photo_0={...credit,photo_id:'wrong-photo'}
  assert.equal(indiaPhotos(f,'route').length,0)
  f.image_credits.india_photo_0={...credit,url:'https://untrusted.example/photo.jpg'}
  assert.equal(indiaPhotos(f,'route').length,0)
})

test('India carousel keeps only distinct attributed topic scenes',async()=>{
  const {indiaScenes}=await import('./india.js')
  const stock={provider:'unsplash',india_carousel:true,scene_query:'Gujarat stepwell',tags:['Gujarat','India','stepwell'],url:'https://images.unsplash.com/stepwell',
    source_url:'https://unsplash.com/photos/stepwell',author_url:'https://unsplash.com/@photographer',
    license_url:'https://unsplash.com/license',license:'Unsplash License',author:'Photographer',title:'Stepwell in India',description:'Stepwell in India'}
  const f=fixture();f.image_credits={india_scene_0:stock,india_scene_1:stock,
    india_photo_0:{...stock,india_carousel:false},india_scene_2:{...stock,url:'https://bad.example/image'}}
  assert.equal(indiaScenes(f).length,1)
})


test('a regional river photo cannot stand in for a root bridge',async()=>{
  const {indiaSceneMatches}=await import('./india.js')
  const fact={topic:'Meghalaya Living Root Bridges',india_lesson:{region:'Meghalaya, Northeast India',case_study:{place:'Nongriat Village, Sohra, Meghalaya'}}}
  assert.equal(indiaSceneMatches({title:'River in Meghalaya',description:'Umngot river in Meghalaya India'},'Living root bridge Meghalaya',fact),false)
  assert.equal(indiaSceneMatches({title:'Living root bridges in Meghalaya',description:'A root bridge in India'},'Living root bridge Meghalaya',fact),true)
})


test('a licensed Wikimedia bridge fallback can enter the India carousel',async()=>{
  const {indiaScenes}=await import('./india.js')
  const f={topic:'Meghalaya Living Root Bridges',india_lesson:{region:'Meghalaya, Northeast India',case_study:{place:'Nongriat Village, Sohra, Meghalaya'}},image_credits:{india_scene_0:{
    provider:'wikimedia',india_carousel:true,scene_query:'Living root bridge Meghalaya',title:'Living root bridge in India',description:'Living root bridges in Meghalaya, India',
    author:'Photographer',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',url:'https://upload.wikimedia.org/bridge.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Bridge.jpg'}}}
  assert.equal(indiaScenes(f).length,1)
})

test('returned subject tags support keyword matching but location tags alone do not',async()=>{
  const {indiaSceneMatches}=await import('./india.js')
  const f={topic:'Meghalaya Living Root Bridges',india_lesson:{region:'Meghalaya, Northeast India',case_study:{place:'Nongriat Village, Meghalaya'}}}
  const p={title:'Morning scene',description:'Morning in India',tags:['India','Meghalaya','bridge','root']}
  assert.equal(indiaSceneMatches(p,'Meghalaya bridge',f),true)
  assert.equal(indiaSceneMatches({...p,tags:['India','Meghalaya','river']},'Meghalaya bridge',f),false)
  assert.equal(indiaSceneMatches({...p,tags:['India','Goa','bridge']},'Meghalaya bridge',f),false)
})

test('a standalone location search still requires evidence of the lesson subject',async()=>{
  const {indiaSceneMatches}=await import('./india.js')
  const f={topic:'Meghalaya Living Root Bridges',india_lesson:{region:'Meghalaya, Northeast India',case_study:{place:'Nongriat Village, Meghalaya'}}}
  assert.equal(indiaSceneMatches({title:'A root bridge',description:'Meghalaya India',tags:['bridge','Meghalaya']},'Meghalaya',f),true)
  assert.equal(indiaSceneMatches({title:'A river',description:'Meghalaya India',tags:['river','Meghalaya']},'Meghalaya',f),false)
})

test('verified popular fallbacks remain visible even when the tags do not match',async()=>{
  const {indiaScenes}=await import('./india.js')
  const photo={provider:'unsplash',india_carousel:true,detail_fetched:true,selection_mode:'popular_fallback',scene_query:'Meghalaya bridge',
    url:'https://images.unsplash.com/river',source_url:'https://unsplash.com/photos/river',author_url:'https://unsplash.com/@photographer',
    license_url:'https://unsplash.com/license',license:'Unsplash License',author:'Photographer',title:'A river in Meghalaya',description:'A river in India',tags:['river','India','Meghalaya']}
  const f={topic:'Meghalaya Living Root Bridges',india_lesson:{region:'Meghalaya, Northeast India',case_study:{place:'Nongriat Village, Meghalaya'}},image_credits:{india_scene_0:photo}}
  assert.equal(indiaScenes(f).length,1)
  f.image_credits.india_scene_0={...photo,detail_fetched:false}
  assert.equal(indiaScenes(f).length,0)
})
