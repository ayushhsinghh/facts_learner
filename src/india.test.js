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

test('India carousel keeps only distinct attributed Unsplash scenes',async()=>{
  const {indiaScenes}=await import('./india.js')
  const stock={provider:'unsplash',india_carousel:true,url:'https://images.unsplash.com/stepwell',
    source_url:'https://unsplash.com/photos/stepwell',author_url:'https://unsplash.com/@photographer',
    license_url:'https://unsplash.com/license',license:'Unsplash License',author:'Photographer',title:'Stepwell in India',description:'Stepwell in India'}
  const f=fixture();f.image_credits={india_scene_0:stock,india_scene_1:stock,
    india_photo_0:{...stock,india_carousel:false},india_scene_2:{...stock,url:'https://bad.example/image'}}
  assert.equal(indiaScenes(f).length,1)
})
