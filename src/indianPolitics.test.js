import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasIndianPoliticsLesson,validPoliticsDate,politicsPhotos,politicsScenes } from './indianPolitics.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/indian-politics-lesson.json',import.meta.url)))
test('Politics contract accepts an institutional lesson and preserves legacy fallback',()=>{
 assert.equal(hasIndianPoliticsLesson(fixture()),true)
 assert.equal(hasIndianPoliticsLesson({category:'indian_politics'}),false)
})
test('Politics rejects broken role, rule, example and source references',()=>{
 for(const change of [l=>l.process.steps[0].actor_ids=['missing'],l=>l.process.steps[0].rule_ids=['missing'],l=>l.worked_example.steps[0].process_step_id='missing',l=>l.actors[0].source_ids=['missing'],l=>l.photos[0].entry_id='missing']){
  const f=fixture();change(f.indian_politics_lesson);assert.equal(hasIndianPoliticsLesson(f),false)
 }
})
test('Politics dates cannot invent a real case or imply a future context',()=>{
 assert.equal(validPoliticsDate('2024-02-29'),true)
 for(const date of ['2023-02-29','9999-01-01','2024-2-01',null])assert.equal(validPoliticsDate(date),false)
 for(const change of [l=>l.worked_example.date='2024-01-01',l=>l.worked_example.kind='dated_real',l=>l.identity.as_of='9999-01-01']){
  const f=fixture();change(f.indian_politics_lesson);assert.equal(hasIndianPoliticsLesson(f),false)
 }
})
test('Politics requires active section requests and every actor and process binding',()=>{
 const f=fixture();f.indian_politics_lesson.photos=f.indian_politics_lesson.photos.filter(p=>p.section_id!=='actors');assert.equal(hasIndianPoliticsLesson(f),false)
 const g=fixture();g.indian_politics_lesson.photos[0].queries=['same','same'];assert.equal(hasIndianPoliticsLesson(g),false)
})
test('Politics refuses unbound or unrelated photograph credits',()=>{
 const f=fixture();f.images={overview:'https://example.org/a.jpg'}
 assert.deepEqual(politicsPhotos(f,'overview'),[])
 assert.deepEqual(politicsScenes(f),[])
 f.image_credits={indian_politics_scene_0:{provider:'pixabay',url:'https://pixabay.com/get/a.jpg',indian_politics_carousel:true,indian_politics_gallery_only:true}}
 assert.deepEqual(politicsScenes(f),[])
})

test('Institutional visuals require exact request binding and Commons provenance',()=>{
 const f=fixture(),p=f.indian_politics_lesson.photos[0]
 const credit={provider:'wikimedia',url:'https://upload.wikimedia.org/example.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Example.jpg',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Example creator',title:'An archival record',description:'Original source description',indian_politics_photo:true,photo_id:p.id,section_id:p.section_id,entry_id:p.entry_id}
 f.image_credits.indian_politics_photo_0=credit;assert.equal(politicsPhotos(f,'overview').length,1)
 credit.entry_id='wrong';assert.equal(politicsPhotos(f,'overview').length,0)
 credit.entry_id=null;credit.popular_pick=true;assert.equal(politicsPhotos(f,'overview').length,0)
})
test('Only explicitly separated institutional context reaches the stock carousel',()=>{
 const f=fixture(),p={provider:'unsplash',url:'https://images.unsplash.com/place.jpg',source_url:'https://unsplash.com/photos/place',author_url:'https://unsplash.com/@creator',author:'Creator',title:'The place today',description:'Present-day source caption',license:'Unsplash License',license_url:'https://unsplash.com/license',indian_politics_carousel:true}
 f.image_credits.indian_politics_scene_0=p;assert.equal(politicsScenes(f).length,0)
 p.indian_politics_gallery_only=true;assert.equal(politicsScenes(f).length,1)
 f.image_credits.indian_politics_scene_1={...p};assert.equal(politicsScenes(f).length,1)
})
test('Dated political cases and changes stay inside their stated context',()=>{
 const f=fixture(),l=f.indian_politics_lesson;l.identity.as_of='2024-12-31'
 Object.assign(l.worked_example,{kind:'dated_real',date:'2024-01-01'})
 l.changes=[{id:'change-one',date:'2024-01-01',title:'Synthetic date check',change:'Structural test only.',why_it_matters:'Checks date bounds.',source_ids:['rules']}]
 l.photos.push({id:'change-photo',section_id:'changes',entry_id:'change-one',kind:'document',subject:'Test document',queries:['Test document India','India procedure document']})
 assert.equal(hasIndianPoliticsLesson(f),true)
 l.changes[0].date='2025-01-01';assert.equal(hasIndianPoliticsLesson(f),false)
 l.changes[0].date='2024-01-01';l.worked_example.date='2025-01-01';assert.equal(hasIndianPoliticsLesson(f),false)
})
