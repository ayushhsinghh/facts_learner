import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasCountryProfile,countryPhoto,displayCountryStat,mapPath,mapPoint,COUNTRY_PHOTO_KEYS } from './country.js'
import { articleImages,overviewImage } from './articleImages.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/country-profile.json',import.meta.url)))
const credit={url:'https://upload.wikimedia.org/example.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Example.jpg',license_url:'https://creativecommons.org/licenses/by/4.0/',author:'Actual photographer',title:'A place.jpg',description:'A documented place.',license:'CC BY 4.0'}
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
test('eight photographs plus the flag and map fit the country ceiling',()=>{
  const f=fixture();f.images={};f.image_credits={};f.image_details=[]
  COUNTRY_PHOTO_KEYS.forEach((k,i)=>{const c={...credit,url:`https://upload.wikimedia.org/${i}.jpg`};f.images[k]=c.url;f.image_credits[k]=c;if(k!=='cover')f.image_details.push({slot:k,placement:k==='overview'?'overview':'places'})})
  assert.equal(articleImages(f).length+3,10)
  assert.equal(overviewImage(f),f.images.overview)
  delete f.image_credits.overview;assert.equal(overviewImage(f),f.images.cover)
  assert.equal(articleImages(f).length,6)
})
test('missing population stays unknown and dateline paths do not draw across the map',()=>{
  assert.equal(displayCountryStat({value:null,year:null}),'Not supplied')
  assert.equal(displayCountryStat({value:100,year:null}),'Not supplied')
  assert.equal(displayCountryStat({value:100,year:2020}),'100 (2020)')
  assert.deepEqual(mapPoint(139,36,139),[180,54])
  const path=mapPath({type:'Polygon',coordinates:[[[179,10],[-179,10],[-179,11],[179,10]]]})
  assert.ok(!path.includes('NaN'));assert.equal((path.match(/M/g)||[]).length,3)
})
