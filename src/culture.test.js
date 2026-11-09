import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {hasCultureLesson,culturePhotos,cultureScenes} from './culture.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/culture-lesson.json',import.meta.url)))
const commons={provider:'wikimedia',url:'https://upload.wikimedia.org/example.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Example.jpg',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Example photographer',title:'Documented subject',description:'Description from the source'}
test('Culture uses a dedicated complete reader and retains generic legacy fallback',()=>{
 assert.equal(hasCultureLesson(fixture()),true)
 assert.equal(hasCultureLesson({category:'culture',headline_fact:'A saved older article'}),false)
})
test('Culture rejects incomplete sections, invalid links and invented relationship types',()=>{
 for(const mutate of [l=>l.markers.pop(),l=>l.worldview.concepts[0].source_ids=['unknown'],l=>l.daily_life.comparisons=[],l=>l.why_custom.drivers=[],l=>l.india_connections.connections[0].relationship='identical',l=>l.photos[0].entry_id='missing',l=>l.spread.pathways=[]]){
  const f=fixture();mutate(f.culture_lesson);assert.equal(hasCultureLesson(f),false)
 }
})
test('India connections can be empty without inventing shared ancestry',()=>{
 const f=fixture();f.culture_lesson.india_connections.connections=[];f.culture_lesson.photos=f.culture_lesson.photos.filter(p=>p.section_id!=='india');assert.ok(hasCultureLesson(f))
})
test('Section photos require exact bindings and Wikimedia provenance',()=>{
 const f=fixture(),index=f.culture_lesson.photos.findIndex(p=>p.section_id==='markers'),p=f.culture_lesson.photos[index]
 f.image_credits[`culture_photo_${index}`]={...commons,culture_photo:true,photo_id:p.id,section_id:p.section_id,entry_id:p.entry_id}
 assert.equal(culturePhotos(f,'markers',p.entry_id).length,1)
 assert.equal(culturePhotos(f,'markers','wrong').length,0)
 f.image_credits[`culture_photo_${index}`].popular_pick=true
 assert.equal(culturePhotos(f,'markers',p.entry_id).length,0)
})
test('The carousel excludes inline Commons and preserves popular picks at the end',()=>{
 const f=fixture(),unsplash={provider:'unsplash',url:'https://images.unsplash.com/example.jpg',source_url:'https://unsplash.com/photos/example',author_url:'https://unsplash.com/@author',license:'Unsplash License',license_url:'https://unsplash.com/license',author:'Photographer',title:'A photograph',description:'Source metadata',culture_carousel:true}
 const pix={...unsplash,provider:'pixabay',url:'https://objectstorage.ap-mumbai-1.oraclecloud.com/p/read/n/ns/b/bucket/o/photo.jpg',source_url:'https://pixabay.com/photos/example-123/',author_url:'https://pixabay.com/users/author-123/',license:'Pixabay Content License',license_url:'https://pixabay.com/service/license-summary/',stored_locally:true,popular_pick:true,selection_mode:'popular_pixabay'}
 f.image_credits={culture_scene_0:pix,culture_scene_1:unsplash,culture_scene_2:{...commons,culture_carousel:true},culture_scene_3:unsplash}
 const scenes=cultureScenes(f);assert.equal(scenes.length,2);assert.equal(scenes.at(-1).credit.provider,'pixabay')
 pix.stored_locally=false;assert.equal(cultureScenes(f).length,1)
})
