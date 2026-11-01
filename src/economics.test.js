import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { hasEconomicsLesson, validEconomicExample, validEconomicProvenance, validEconomicsDiagram, economicsPhotos, economicsScenes } from './economics.js'
const fixture = () => JSON.parse(fs.readFileSync(new URL('./fixtures/economics-lesson.json', import.meta.url)))
const photo = {provider:'wikimedia',url:'https://upload.wikimedia.org/market.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Market.jpg',title:'Grocery market',description:'A grocery market',author:'Photographer',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/'}
test('structured economics is distinct from legacy and keeps optional sections optional', () => {
  const f=fixture(); assert.equal(hasEconomicsLesson(f),true)
  f.economics_lesson.diagram=null;f.economics_lesson.photos=[];f.economics_lesson.distributional_effects=[];f.economics_lesson.optional_depth=[]
  assert.equal(hasEconomicsLesson(f),true)
  assert.equal(hasEconomicsLesson({category:'economics',topic:'Legacy fact'}),false)
})
test('economic actor references and section photo binding must resolve', () => {
  for(const mutate of [l=>l.mechanism.steps[0].actor_ids=['missing'],l=>l.mechanism.actors[0].id='seller',l=>l.distributional_effects[0].actor_id='missing',l=>l.photos[0].section_id='case',l=>l.photos[0].queries=[]]) {
    const f=fixture();mutate(f.economics_lesson);assert.equal(hasEconomicsLesson(f),false)
  }
})
test('economic arithmetic rejects wrong results, forward references, zero division and invalid numbers', () => {
  for(const mutate of [e=>e.calculations[0].result=6,e=>e.calculations[0].operand_ids=['after-count','before-price'],e=>e.values[1].value=0,e=>e.values[0].value=Infinity,e=>e.values[0].value=true,e=>e.values[0].value=1e16,e=>e.calculations[0].operation='eval']) {
    const e=fixture().economics_lesson.worked_example;mutate(e);assert.equal(validEconomicExample(e),false)
  }
  const e=fixture().economics_lesson.worked_example;e.values=[];e.calculations=[];assert.equal(validEconomicExample(e),true)
})
test('observed economics data requires dates and geography without implying verification', () => {
  const p=fixture().economics_lesson.diagram.provenance;p.kind='observed';assert.equal(validEconomicProvenance(p),false)
  Object.assign(p,{period:'2020',geography:'Demonstration region',as_of:'2020-12-31'});assert.equal(validEconomicProvenance(p),true)
  p.as_of='2020-02-30';assert.equal(validEconomicProvenance(p),false)
  p.as_of='9999-01-01';assert.equal(validEconomicProvenance(p),false)
})
test('economic charts require comparable series and comparisons require a shared basis', () => {
  const d=fixture().economics_lesson.diagram;assert.equal(validEconomicsDiagram(d),true)
  d.series[0].values=[5];assert.equal(validEconomicsDiagram(d),false)
  d.series[0].values=[5,-4];d.type='line';assert.equal(validEconomicsDiagram(d),true)
  Object.assign(d,{type:'comparison',labels:[],series:[],x_label:null,unit:null,comparison_basis:'The same shopping budget',comparisons:[{name:'A',approach:'A choice',benefit:'A benefit',cost:'A cost',conditions:'One condition'},{name:'B',approach:'Another choice',benefit:'Another benefit',cost:'Another cost',conditions:'Another condition'}]})
  assert.equal(validEconomicsDiagram(d),true);d.comparison_basis=null;assert.equal(validEconomicsDiagram(d),false)
})
test('economics photos require reusable provenance and exact section and request binding', () => {
  const f=fixture();f.image_credits={economics_photo_0:{...photo,economics_photo:true,section_id:'overview',photo_id:'market'}}
  assert.equal(economicsPhotos(f,'overview').length,1)
  f.image_credits.economics_photo_0.photo_id='other';assert.equal(economicsPhotos(f,'overview').length,0)
  f.image_credits.economics_photo_0.photo_id='market';f.economics_lesson.photos[0].kind='person';f.image_credits.economics_photo_0.provider='unsplash';assert.equal(economicsPhotos(f,'overview').length,0)
})
test('economics galleries deduplicate sources and omit unusable credits', () => {
  const f=fixture();f.image_credits={economics_scene_0:{...photo,economics_carousel:true},economics_scene_1:{...photo,economics_carousel:true},economics_scene_2:{...photo,license:''}}
  assert.equal(economicsScenes(f).length,1)
})
