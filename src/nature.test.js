import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {hasNatureLesson,validNatureDiagram,validNatureMeasurement,naturePhotos,natureScenes} from './nature.js'
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/nature-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/leaves.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Leaves.jpg',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/',author:'Photographer',title:'Leaf litter',description:'Leaves on the forest floor'}
test('Nature contract accepts optional omissions and keeps legacy fallback',()=>{
 const f=fixture();assert.ok(hasNatureLesson(f));assert.equal(hasNatureLesson({category:'nature'}),false)
 Object.assign(f.nature_lesson,{recognition_features:[],natural_connections:[],diagram:null,photos:[],notice_it_yourself:null,key_terms:[],optional_depth:[]});assert.ok(hasNatureLesson(f))
})
test('Nature rejects malformed records, scale and photo bindings',()=>{
 for(const mutate of [l=>l.recognition_features[0].viewing_scale='invisible',l=>l.explanation_steps[0].conditions=[],l=>l.photos[0].feature_id='missing',l=>l.photos[0].section_id='example',l=>l.real_world_example=null,l=>l.measurements=[null],l=>l.diagram.nodes[0].ref_id='missing',l=>l.notice_it_yourself.steps=[]]){const f=fixture();mutate(f.nature_lesson);assert.equal(hasNatureLesson(f),false)}
})
test('All five Nature diagrams resolve lesson records and meaningful relationships',()=>{
 const l=fixture().nature_lesson,d=l.diagram;assert.ok(validNatureDiagram(d,l));d.edges.pop();assert.equal(validNatureDiagram(d,l),false)
 d.type='cycle';d.edges.push({from_id:'n1',to_id:'n2',label:'Returns nutrients',explanation:'Breakdown changes the material.'},{from_id:'n2',to_id:'n0',label:'Return',explanation:'A conceptual return.'});assert.ok(validNatureDiagram(d,l))
 d.type='relationships';assert.ok(validNatureDiagram(d,l));d.edges=[];assert.equal(validNatureDiagram(d,l),false)
 d.type='labelled_structure';d.nodes=l.recognition_features.map((f,i)=>({id:`f${i}`,ref_type:'feature',ref_id:f.id,explanation:f.meaning}));assert.ok(validNatureDiagram(d,l))
 d.type='comparison';d.nodes=[];d.comparison_basis='Compare visible condition, not age';d.comparisons=['Whole','Fragmented'].map(name=>({name,observation:'Visible condition',explanation:'A clue only',conditions:'Same photograph'}));assert.ok(validNatureDiagram(d,l));d.comparison_basis=null;assert.equal(validNatureDiagram(d,l),false)
})
test('Conservation and reported measurements need valid dates and context',()=>{
 const f=fixture(),l=f.nature_lesson;l.conservation_context={status:'Example status',system:'Example system',scope:'Example scope',assessed_on:'2020-02-30'};assert.equal(hasNatureLesson(f),false);l.conservation_context.assessed_on='2020-02-20';assert.ok(hasNatureLesson(f))
 const m={id:'count',label:'Illustrative count',value:2,unit:'leaves',basis:'Demonstration only',kind:'illustrative',explanation:'Not a field measurement',place:null,period:null,as_of:null};assert.ok(validNatureMeasurement(m));m.kind='reported';assert.equal(validNatureMeasurement(m),false);Object.assign(m,{place:'Example place',period:'2020',as_of:'2020-12-31'});assert.ok(validNatureMeasurement(m));m.value=Infinity;assert.equal(validNatureMeasurement(m),false)
})
test('Nature inline photos require exact section and feature binding; popular views stay at gallery end',()=>{
 const f=fixture();f.image_credits={nature_photo_0:{...photo,nature_photo:true,photo_id:'leaflitter',section_id:'recognition',feature_id:'litter'}};assert.equal(naturePhotos(f,'recognition').length,1);f.image_credits.nature_photo_0.feature_id='fragments';assert.equal(naturePhotos(f,'recognition').length,0)
 f.image_credits.nature_photo_0.feature_id='litter';f.image_credits.nature_photo_0.popular_pick=true;assert.equal(naturePhotos(f,'recognition').length,0)
 f.image_credits={nature_scene_0:{...photo,nature_carousel:true,popular_pick:true},nature_scene_1:{...photo,url:photo.url+'2',source_url:photo.source_url+'2',nature_carousel:true}};assert.equal(natureScenes(f).at(-1).credit.popular_pick,true)
})
