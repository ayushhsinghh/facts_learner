import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasCountryProfile,countryPhoto,displayCountryStat,mapPath,mapPoint,COUNTRY_PHOTO_KEYS,countryGallery,countryScenes,countrySubjectPhoto,countryVisualCandidates } from './country.js'
import { articleImages,overviewImage } from './articleImages.js'
import { countryMapView,countryMapLabels } from './countryMapGeometry.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/country-profile.json',import.meta.url)))
const atlas=JSON.parse(readFileSync(new URL('../public/maps/countries.geojson',import.meta.url)))
const registry=JSON.parse(readFileSync(new URL('../public/maps/country-data.json',import.meta.url)))
test('regional framing teaches a small country in context with readable nearby labels',()=>{
  const identity={...registry.CR,iso2:'CR'},view=countryMapView(identity,atlas.features,true)
  assert.ok(view.width<30&&view.height<20)
  const result=countryMapLabels(identity,registry,view,{width:340,height:300})
  assert.ok(result.labels.some(item=>['Panama','Nicaragua'].includes(item.name)))
  assert.equal(result.font/result.unit,13)
})
test('world and regional locator frames stay bounded across the full country snapshot',()=>{
  for(const [iso2,data] of Object.entries(registry)){
    for(const regional of [false,true]){
      const identity={...data,iso2},view=countryMapView(identity,atlas.features,regional)
      assert.ok([view.x,view.y,view.width,view.height,...view.point].every(Number.isFinite),iso2)
      assert.ok(view.x>=0&&view.y>=0&&view.x+view.width<=360.001&&view.y+view.height<=180.001,iso2)
      assert.ok(view.point[0]>=view.x&&view.point[0]<=view.x+view.width&&view.point[1]>=view.y&&view.point[1]<=view.y+view.height,iso2)
      const {callout,padding}=countryMapLabels(identity,{},view,{width:320,height:300})
      assert.ok(callout.x>=view.x&&callout.x+callout.width<=view.x+view.width+.001,iso2)
      assert.ok(callout.y>=view.y&&callout.y+callout.height<=view.y+view.height+.001,iso2)
      assert.ok(padding>0)
    }
  }
})
const credit={url:'https://upload.wikimedia.org/example.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Example.jpg',license_url:'https://creativecommons.org/licenses/by/4.0/',author:'Actual photographer',title:'A place.jpg',description:'A documented place.',license:'CC BY 4.0'}
test('subject images match the exact entry and do not enter the Unsplash carousel',()=>{
  const f=fixture()
  const portrait={...credit,provider:'wikimedia',subject_kind:'people',subject:'Katsushika Hokusai'}
  f.country_photo_galleries={country_people_0:[portrait]}
  assert.ok(countrySubjectPhoto(f,'people',0,'Katsushika Hokusai'))
  assert.equal(countrySubjectPhoto(f,'people',0,'Another person'),null)
  assert.equal(countrySubjectPhoto(f,'places',0,'Katsushika Hokusai'),null)
  assert.equal(countryScenes(f).length,0)
  f.country_photo_galleries.country_people_0=[{...portrait,provider:'unsplash'}]
  assert.equal(countrySubjectPhoto(f,'people',0,'Katsushika Hokusai'),null)
})
test('country profiles select the dedicated reader, while legacy and malformed records fall back',()=>{
  const f=fixture();assert.equal(hasCountryProfile(f),true)
  assert.equal(hasCountryProfile({category:'country',summary:'Old article'}),false)
  assert.equal(hasCountryProfile({...f,category:'history'}),false)
  f.country_profile.identity.coordinates=[999,999];assert.equal(hasCountryProfile(f),false)
})
test('country photos require reusable licences and safe provenance',()=>{
  assert.ok(countryPhoto(credit))
  for(const change of [{url:'javascript:alert(1)'},{source_url:'https://attacker.example/photo'},{license:'All rights reserved'},{license_url:'https://attacker.example/license'}])assert.equal(countryPhoto({...credit,...change}),null)
})
test('Unsplash photos preserve hotlinks and require provider attribution',()=>{
  const photo={provider:'unsplash',url:'https://images.unsplash.com/photo-sample?ixid=keep',source_url:'https://unsplash.com/photos/sample?utm_source=the_curiosity_archive&utm_medium=referral',author_url:'https://unsplash.com/@person?utm_source=the_curiosity_archive&utm_medium=referral',license_url:'https://unsplash.com/license',license:'Unsplash License',author:'Photographer',title:'Kyoto in Japan',description:'A street in Kyoto, Japan.'}
  assert.ok(countryPhoto(photo));assert.ok(countryPhoto(photo).url.includes('ixid=keep'))
  for(const change of [{author_url:'https://evil.example/profile'},{url:'https://evil.example/photo'},{license_url:'https://unsplash.com/other'},{author:''}])assert.equal(countryPhoto({...photo,...change}),null)
})
test('generated illustrations and licensed photo galleries have separate budgets',()=>{
  const f=fixture();f.images={};f.image_credits={};f.country_photo_galleries={}
  COUNTRY_PHOTO_KEYS.slice(0,4).forEach((key,i)=>{const url=`https://images.example/${i}.jpg`;f.images[key]=url;f.image_credits[key]={kind:'generated',url,title:'Illustration',description:'A generated illustration.'}})
  f.country_photo_galleries.explanation_3=Array.from({length:15},(_,i)=>({...credit,url:`https://upload.wikimedia.org/${i}.jpg`,source_url:`https://commons.wikimedia.org/wiki/File:${i}.jpg`}))
  assert.equal(articleImages(f).length,3)
  assert.equal(countryGallery(f).length,15)
  assert.equal(overviewImage(f),f.images.overview)
  delete f.image_credits.overview;assert.equal(overviewImage(f),f.images.cover)
})
test('cover and card fall back through available assets to bundled artwork',()=>{
  const f=fixture();f.images={overview:credit.url};f.image_credits={overview:credit}
  assert.equal(countryVisualCandidates(f)[0].url,credit.url)
  f.images={};f.image_credits={}
  assert.equal(countryVisualCandidates(f)[0].url,'/maps/country-fallback.svg')
  assert.equal(overviewImage(f),'/maps/country-fallback.svg')
})
test('missing population stays unknown and dateline paths do not draw across the map',()=>{
  assert.equal(displayCountryStat({value:null,year:null}),'Not supplied')
  assert.equal(displayCountryStat({value:100,year:null}),'Not supplied')
  assert.equal(displayCountryStat({value:100,year:2020}),'100 (2020)')
  assert.deepEqual(mapPoint(139,36,139),[180,54])
  const path=mapPath({type:'Polygon',coordinates:[[[179,10],[-179,10],[-179,11],[179,10]]]})
  assert.ok(!path.includes('NaN'));assert.equal((path.match(/M/g)||[]).length,3)
})

test('short image searches stay bound to the original country topic',()=>{
  const f=fixture(),title='Gallo Pinto and Daily Cuisine'
  f.country_photo_galleries={country_culture_0:[{...credit,provider:'wikimedia',subject_kind:'culture',subject:'Gallo Pinto',entry_title:title,image_caption:'Gallo Pinto'}]}
  assert.equal(countrySubjectPhoto(f,'culture',0,title).caption,'Gallo Pinto')
  assert.equal(countrySubjectPhoto(f,'culture',0,'Another topic'),null)
})
test('a portrait cannot replace the country cover when landscapes are unavailable',()=>{
  const f=fixture();f.images={};f.image_credits={};f.country_photo_galleries={country_people_0:[{...credit,provider:'wikimedia',subject_kind:'people',subject:'A person'}]}
  assert.equal(countryVisualCandidates(f)[0].url,'/maps/country-fallback.svg')
})

test('contextual Commons scenes join the carousel while inline topic figures stay separate',()=>{
  const f=fixture()
  f.country_photo_galleries={country_scene_5:[{...credit,provider:'wikimedia',scene_query:'wildlife birds'}],
    country_culture_0:[{...credit,source_url:credit.source_url+'-food',provider:'wikimedia',subject_kind:'culture',subject:'Food'}]}
  assert.equal(countryScenes(f).length,1)
  assert.equal(countryScenes(f)[0].credit.scene_query,'wildlife birds')
})
