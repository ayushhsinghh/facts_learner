import test from 'node:test'
import assert from 'node:assert/strict'
import { articleImages, overviewImage } from './articleImages.js'

test('discovery cards prefer the article overview over myth art and the cover', () => {
  assert.equal(overviewImage({images:{overview:'summary',myth_visual:'myth',cover:'cover'}}),'summary')
  assert.equal(overviewImage({images:{history:'legacy'}}),'legacy')
  assert.equal(overviewImage({images:{cover:'cover'}}),'cover')
})

test('all five article slots reach their intended reading sections', () => {
  const fact = {topic:'A fact',images:{cover:'cover',overview:'summary',how_it_works:'mechanism',explanation_2:'example',explanation_3:'limits'},image_details:[
    {slot:'overview',placement:'overview',alt:'Summary',caption:'The whole idea.'},
    {slot:'how_it_works',placement:'explanation',alt:'Mechanism'},
    {slot:'explanation_2',placement:'example',alt:'Example'},
    {slot:'explanation_3',placement:'limits',alt:'Limits'},
  ]}
  assert.equal(articleImages(fact).length,4)
  for(const placement of ['overview','explanation','example','limits']) assert.equal(articleImages(fact,{placement}).length,1)
  assert.equal(articleImages(fact,{slot:'overview'})[0].url,overviewImage(fact))
  delete fact.images.explanation_3
  assert.equal(articleImages(fact,{placement:'limits'}).length,0)
})

test('legacy images remain visible without new plan metadata', () => {
  const fact={topic:'Archived fact',images:{history:'summary',how_it_works:'detail'},physics_lesson:{supporting_image:{slot:'how_it_works',alt:'Legacy detail',caption:'A legacy caption'}}}
  assert.equal(articleImages(fact,{placement:'overview'})[0].url,'summary')
  assert.equal(articleImages(fact,{placement:'explanation'})[0].caption,'A legacy caption')
})
