import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {hasAgricultureLesson,validAgricultureDiagram,validAgricultureMeasurement,agriculturePhotos,agricultureScenes} from './agriculture.js'
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/agriculture-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/straw.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Straw.jpg',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Photographer',title:'Straw mulch',description:'A straw mulch cover'}
test('Agriculture uses its own reader and preserves legacy facts',()=>{
  const f=fixture();assert.equal(hasAgricultureLesson(f),true)
  assert.equal(hasAgricultureLesson({category:'agriculture',topic:'An old article'}),false)
  Object.assign(f.agriculture_lesson,{diagram:null,photos:[],measurements:[],key_terms:[],optional_depth:[]})
  f.agriculture_lesson.field_context.crops=[];f.agriculture_lesson.field_context.growing_conditions=[];f.agriculture_lesson.field_context.when_it_matters=null
  assert.equal(hasAgricultureLesson(f),true)
})
test('Malformed context, process references and measurements fall back safely',()=>{
  for(const mutate of [l=>l.process_steps[0].id='surface',l=>l.process_steps[0].conditions=[],l=>l.photos[0].step_id='missing',l=>l.photos[0].section_id='case',l=>l.measurements=[null],l=>l.field_context.growing_conditions=null,l=>l.indian_case_study=null]) {
    const f=fixture();mutate(f.agriculture_lesson);assert.equal(hasAgricultureLesson(f),false)
  }
})
test('cross-sections reference named layers and reject unrelated diagram fields',()=>{
  const l=fixture().agriculture_lesson,d=l.diagram;assert.equal(validAgricultureDiagram(d,l.process_steps),true)
  d.connections[0].to_id='missing';assert.equal(validAgricultureDiagram(d,l.process_steps),false)
  d.connections=[];d.layers[0].id='soil';assert.equal(validAgricultureDiagram(d,l.process_steps),false)
})
test('process and seasonal diagrams follow actual lesson steps in order',()=>{
  const l=fixture().agriculture_lesson,d=l.diagram
  Object.assign(d,{type:'process',layers:[],connections:[],process_step_ids:['cover','surface','observe']})
  assert.equal(validAgricultureDiagram(d,l.process_steps),true)
  d.process_step_ids.reverse();assert.equal(validAgricultureDiagram(d,l.process_steps),false)
  Object.assign(d,{type:'seasonal',process_step_ids:[],season_stages:[{id:'start',title:'Start',timing:'At the relevant crop stage',process_step_ids:['cover'],what_to_notice:'The material'},{id:'later',title:'Later',timing:'During the local growing period',process_step_ids:['surface','observe'],what_to_notice:'The context'}]})
  assert.equal(validAgricultureDiagram(d,l.process_steps),true)
  d.season_stages[1].process_step_ids=['cover'];assert.equal(validAgricultureDiagram(d,l.process_steps),false)
})
test('comparison diagrams state a shared basis',()=>{
  const l=fixture().agriculture_lesson,d=l.diagram
  Object.assign(d,{type:'comparison',layers:[],connections:[],comparison_basis:'An explicitly comparable plot setting',comparisons:['A','B'].map(name=>({name,approach:'An approach',benefit:'A possible benefit',limitation:'A limit',conditions:'A condition'}))})
  assert.equal(validAgricultureDiagram(d,l.process_steps),true);d.comparison_basis=null;assert.equal(validAgricultureDiagram(d,l.process_steps),false)
})
test('reported measurements require unit, basis and dated place context',()=>{
  const m={id:'test',label:'Demonstration count',value:2,unit:'plots',basis:'A hypothetical layout count',explanation:'An example, not a result',kind:'illustrative',place:null,period:null,as_of:null}
  assert.equal(validAgricultureMeasurement(m),true);m.kind='reported';assert.equal(validAgricultureMeasurement(m),false)
  Object.assign(m,{place:'Demonstration region',period:'2020',as_of:'2020-12-31'});assert.equal(validAgricultureMeasurement(m),true)
  for(const value of ['2020-02-30','9999-01-01']){m.as_of=value;assert.equal(validAgricultureMeasurement(m),false)}
  m.as_of='2020-12-31';m.value=Infinity;assert.equal(validAgricultureMeasurement(m),false)
})
test('inline photos bind to exact process and request IDs; popular photos remain in carousel',()=>{
  const f=fixture();f.image_credits={agriculture_photo_0:{...photo,agriculture_photo:true,section_id:'process',photo_id:'residue',step_id:'cover'}}
  assert.equal(agriculturePhotos(f,'process','cover').length,1);assert.equal(agriculturePhotos(f,'process').length,0)
  f.image_credits.agriculture_photo_0.step_id='observe';assert.equal(agriculturePhotos(f,'process','cover').length,0)
  f.image_credits.agriculture_photo_0.step_id='cover';f.image_credits.agriculture_photo_0.popular_pick=true;assert.equal(agriculturePhotos(f,'process','cover').length,0)
})
test('Agriculture gallery deduplicates sources and puts popular photos last',()=>{
  const f=fixture();f.image_credits={agriculture_scene_0:{...photo,agriculture_carousel:true,popular_pick:true},agriculture_scene_1:{...photo,source_url:'https://commons.wikimedia.org/wiki/File:Other.jpg',agriculture_carousel:true},agriculture_scene_2:{...photo,agriculture_carousel:true}}
  const scenes=agricultureScenes(f);assert.equal(scenes.length,2);assert.equal(scenes.at(-1).credit.popular_pick,true)
})
test('repaired photo plans bind to overview, crop context and case sections',()=>{
  const f=fixture()
  f.agriculture_lesson.photos=[
    {id:'fallback_overview',section_id:'overview',kind:'process',step_id:null,subject:'Mulching',queries:['Mulching']},
    {id:'fallback_crop',section_id:'context',kind:'crop',step_id:null,subject:'Banana',queries:['Banana farming']},
    {id:'fallback_place',section_id:'case',kind:'named_place',step_id:null,subject:'Tamil Nadu',queries:['Tamil Nadu']},
  ]
  f.image_credits=Object.fromEntries(f.agriculture_lesson.photos.map((p,i)=>[`agriculture_photo_${i}`,{...photo,agriculture_photo:true,section_id:p.section_id,photo_id:p.id,step_id:null}]))
  assert.equal(hasAgricultureLesson(f),true)
  for(const section of ['overview','context','case'])assert.equal(agriculturePhotos(f,section).length,1)
  f.image_credits.agriculture_photo_2.provider='unsplash'
  assert.equal(agriculturePhotos(f,'case').length,0)
})
test('Expanded photos can share a section and bind to each process step',()=>{
 const f=fixture(),p=f.agriculture_lesson.photos[0]
 for(let i=1;i<12;i++)f.agriculture_lesson.photos.push({...p,id:`detail_${i}`,queries:['Straw mulch','Mulching field','Crop residue']})
 assert.equal(hasAgricultureLesson(f),true)
 f.image_credits=Object.fromEntries(f.agriculture_lesson.photos.map((p,i)=>[`agriculture_photo_${i}`,{...photo,source_url:photo.source_url+i,agriculture_photo:true,photo_id:p.id,section_id:p.section_id,step_id:p.step_id}]))
 assert.equal(agriculturePhotos(f,'process','cover').length,12)
})
test('Expanded Agriculture carousel supports twelve distinct photographs',()=>{
 const f=fixture();f.image_credits=Object.fromEntries(Array.from({length:15},(_,i)=>[`agriculture_scene_${i}`,{...photo,source_url:photo.source_url+i,agriculture_carousel:true}]))
 assert.equal(agricultureScenes(f).length,12)
})
