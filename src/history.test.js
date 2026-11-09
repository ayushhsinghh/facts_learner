import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {hasHistoryLesson,validHistoryPeriod,historyPhotos,historyScenes} from './history.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/history-lesson.json',import.meta.url)))
test('History uses the complete structured reader and retains the generic legacy fallback',()=>{
 assert.ok(hasHistoryLesson(fixture()))
 assert.equal(hasHistoryLesson({category:'history',topic:'An older saved fact'}),false)
})
test('BCE dates remain ordered and year zero is not introduced',()=>{
 assert.ok(validHistoryPeriod({start_year:-500,end_year:-400}))
 assert.ok(validHistoryPeriod({start_year:-1,end_year:1}))
 for(const p of [{start_year:0,end_year:1},{start_year:20,end_year:10},{start_year:1,end_year:9999},{start_year:true,end_year:1}])assert.equal(validHistoryPeriod(p),false)
})
test('History rejects reversed chronology, false India overlap, unknown people and sources',()=>{
 for(const mutate of [l=>l.chronology.reverse(),l=>l.chronology[0].figure_ids=['missing'],l=>l.decisions[0].chronology_id='missing',l=>Object.assign(l.india.connections[0],{start_year:1700,end_year:1701}),l=>l.india.connections[0].relationship='documented_impact',l=>l.evidence.records[0].source_ids=['missing'],l=>l.photos[0].entry_id='missing']){
  const f=fixture();mutate(f.history_lesson);assert.equal(hasHistoryLesson(f),false)
 }
})
test('History does not require an invented recent discovery',()=>{
 const f=fixture();f.history_lesson.evidence.updates=[];assert.ok(hasHistoryLesson(f))
})
test('Archival visuals require exact request binding and Commons provenance',()=>{
 const f=fixture(),p=f.history_lesson.photos[0]
 const credit={provider:'wikimedia',url:'https://upload.wikimedia.org/example.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Example.jpg',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Example creator',title:'An archival record',description:'Original source description',history_photo:true,photo_id:p.id,section_id:p.section_id,entry_id:p.entry_id}
 f.image_credits.history_photo_0=credit;assert.equal(historyPhotos(f,'overview').length,1)
 credit.entry_id='wrong';assert.equal(historyPhotos(f,'overview').length,0)
 credit.entry_id=null;credit.popular_pick=true;assert.equal(historyPhotos(f,'overview').length,0)
})
test('Only explicitly separated present-day context reaches the stock carousel',()=>{
 const f=fixture(),p={provider:'unsplash',url:'https://images.unsplash.com/place.jpg',source_url:'https://unsplash.com/photos/place',author_url:'https://unsplash.com/@creator',author:'Creator',title:'The place today',description:'Present-day source caption',license:'Unsplash License',license_url:'https://unsplash.com/license',history_carousel:true}
 f.image_credits.history_scene_0=p;assert.equal(historyScenes(f).length,0)
 p.history_gallery_only=true;assert.equal(historyScenes(f).length,1)
 f.image_credits.history_scene_1={...p};assert.equal(historyScenes(f).length,1)
})
