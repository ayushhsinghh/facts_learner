import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasTechnologyLesson,validTechnologyDiagram,validTechnologyVersion,technologyPhotos,technologyScenes } from './technology.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/technology-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/router.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Router.jpg',author:'Photographer',title:'Wireless router',description:'A wireless router',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/'}
test('Technology preserves old facts and validates linked system references',()=>{
  assert.equal(hasTechnologyLesson(fixture()),true);assert.equal(hasTechnologyLesson({category:'technology',topic:'Older fact'}),false)
  const bad=fixture();bad.technology_lesson.walkthrough[0].component_ids=['unknown'];assert.equal(hasTechnologyLesson(bad),false)
  const duplicate=fixture();duplicate.technology_lesson.system_model.inputs[0].id='phone';assert.equal(hasTechnologyLesson(duplicate),false)
})
test('version dates reject invalid or future values and allow version-independent lessons',()=>{
  assert.equal(validTechnologyVersion(null),true)
  const v={system:'Demo',version:'1.0',as_of:'2020-02-29',scope:'Illustrative'}
  assert.equal(validTechnologyVersion(v),true);assert.equal(validTechnologyVersion({...v,as_of:'2020-02-30'}),false);assert.equal(validTechnologyVersion({...v,as_of:'9999-01-01'}),false)
})
test('flow supports labelled return connections and rejects skipped or missing parts',()=>{
  const {diagram:d,system_model:s}=fixture().technology_lesson
  assert.equal(validTechnologyDiagram(d,s),true)
  d.connections[0].to_id='server';assert.equal(validTechnologyDiagram(d,s),false)
})
test('layers and comparisons enforce meaningful references and comparison basis',()=>{
  const l=fixture().technology_lesson,d=l.diagram
  Object.assign(d,{type:'layers',node_ids:[],connections:[],layers:[{id:'upper',title:'Upper',role:'A responsibility',component_ids:['phone'],depends_on_ids:['lower']},{id:'lower',title:'Lower',role:'A supporting responsibility',component_ids:['router','server'],depends_on_ids:[]}]})
  assert.equal(validTechnologyDiagram(d,l.system_model),true)
  d.layers[1].depends_on_ids=['upper'];assert.equal(validTechnologyDiagram(d,l.system_model),false)
  Object.assign(d,{type:'comparison',layers:[],comparison_basis:'One use case',comparisons:[{name:'A',approach:'One approach',strength:'A benefit',limitation:'A constraint'},{name:'B',approach:'Another approach',strength:'Another benefit',limitation:'Another constraint'}]})
  assert.equal(validTechnologyDiagram(d,l.system_model),true)
  d.comparison_basis=null;assert.equal(validTechnologyDiagram(d,l.system_model),false)
})
test('photos need reusable credits and exact section/component bindings',()=>{
  const f=fixture();f.image_credits={technology_photo_0:{...photo,technology_photo:true,section_id:'system',photo_id:'hardware',component_id:'router'}}
  assert.equal(technologyPhotos(f,'system').length,1)
  f.image_credits.technology_photo_0.component_id='phone';assert.equal(technologyPhotos(f,'system').length,0)
  f.technology_lesson.photos=[];assert.equal(hasTechnologyLesson(f),true)
})
test('technology galleries retain only distinct usable sources',()=>{
  const f=fixture();f.image_credits={technology_scene_0:{...photo,technology_carousel:true},technology_scene_1:{...photo,technology_carousel:true},technology_photo_0:photo}
  assert.equal(technologyScenes(f).length,1)
})
