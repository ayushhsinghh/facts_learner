import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasGeographyLesson,validGeographyDiagram,geographyMapView,geographyMapLabels,geographyConnectionLabels,geographyPhotos,geographyScenes } from './geography.js'
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/geography-lesson.json',import.meta.url)))
const photo={provider:'wikimedia',url:'https://upload.wikimedia.org/valley.jpg',source_url:'https://commons.wikimedia.org/wiki/File:Valley.jpg',author:'Photographer',title:'Owens Valley',description:'Owens Valley, California',license:'CC BY-SA 4.0',license_url:'https://creativecommons.org/licenses/by-sa/4.0/'}
test('geography reader validates locations and preserves old generic facts',()=>{
  assert.equal(hasGeographyLesson(fixture()),true);assert.equal(hasGeographyLesson({category:'geography',topic:'Old fact'}),false)
  const f=fixture();f.geography_lesson.case_study.location_id='unknown';assert.equal(hasGeographyLesson(f),false)
  const bad=fixture();bad.geography_lesson.location_context.locations[0].latitude=91;assert.equal(hasGeographyLesson(bad),false)
})
test('optional maps diagrams and human connections do not require filler',()=>{
  const f=fixture();Object.assign(f.geography_lesson,{map:null,diagram:null,human_connections:[],variations:[],misconceptions:[],limits:[]})
  assert.equal(hasGeographyLesson(f),true)
})
test('diagrams reject meaningless disconnected or overlapping geometry',()=>{
  const d=fixture().geography_lesson.diagram;assert.equal(validGeographyDiagram(d),true)
  d.connections[1].to_id='moist';assert.equal(validGeographyDiagram(d),false)
  const bad=fixture().geography_lesson.diagram;bad.nodes[0].x=.5;bad.nodes[0].y=.15;assert.equal(validGeographyDiagram(bad),false)
  const reciprocal=fixture().geography_lesson.diagram;reciprocal.connections.push({from_id:'rising',to_id:'moist',label:'Return flow'});assert.equal(validGeographyDiagram(reciprocal),false)
})
test('locator handles the dateline and keeps labels inside mobile and desktop views',()=>{
  const places=[{id:'a',name:'Example west of the dateline',longitude:179,latitude:10},{id:'b',name:'Example east of the dateline',longitude:-179,latitude:11}]
  const view=geographyMapView(places);assert.ok(view.width<30)
  assert.ok(view.points.every(p=>p.point[0]>=view.x&&p.point[0]<=view.x+view.width))
  for(const size of [{width:332,height:360},{width:1000,height:380}]){
    const labels=geographyMapLabels(view,size);assert.ok(labels.every(l=>l.box))
    for(const {box:b} of labels){assert.ok(b.x>=view.x&&b.x+b.width<=view.x+view.width);assert.ok(b.y>=view.y&&b.y+b.height<=view.y+view.height)}
  }
  assert.equal(geographyMapView(places,true).width,360);assert.equal(geographyMapView([]).width,360)
  const extremes=[{id:'a',name:'West',longitude:-179,latitude:90},{id:'b',name:'East',longitude:179,latitude:-90},{id:'c',name:'Centre',longitude:0,latitude:0},{id:'d',name:'Centre north',longitude:0,latitude:20}]
  const wide=geographyMapView(extremes)
  assert.ok(wide.points.every(p=>p.point[0]>=wide.x&&p.point[0]<=wide.x+wide.width&&p.point[1]>=wide.y&&p.point[1]<=wide.y+wide.height))
})
test('crossing relationships keep distinct labels clear of node boxes',()=>{
  const nodes=[{id:'a',x:150,y:100},{id:'b',x:650,y:100},{id:'c',x:150,y:330},{id:'d',x:650,y:330}]
  const labels=geographyConnectionLabels(nodes,[{from_id:'a',to_id:'d',label:'One relationship'},{from_id:'b',to_id:'c',label:'Another relationship'}])
  assert.ok(labels.every(Boolean));assert.notDeepEqual(labels[0].box,labels[1].box)
  const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y
  assert.equal(intersects(labels[0].box,labels[1].box),false)
  for(const label of labels)assert.ok(nodes.every(n=>!intersects(label.box,{x:n.x-98,y:n.y-36,width:196,height:72})))
})
test('named-place photographs need valid credits and matching location binding',()=>{
  const f=fixture();f.image_credits={geography_photo_1:{...photo,geography_photo:true,section_id:'case-study',photo_id:'valley',location_id:'east'}}
  assert.equal(geographyPhotos(f,'case-study').length,1)
  f.image_credits.geography_photo_1.location_id='west';assert.equal(geographyPhotos(f,'case-study').length,0)
  f.image_credits.geography_photo_1={...photo,provider:'unsplash',geography_photo:true,section_id:'case-study',photo_id:'valley',location_id:'east'}
  assert.equal(geographyPhotos(f,'case-study').length,0)
})
test('geography galleries do not duplicate their source photographs',()=>{
  const f=fixture();f.image_credits={geography_scene_0:{...photo,geography_carousel:true},geography_scene_1:{...photo,geography_carousel:true},geography_photo_0:photo}
  assert.equal(geographyScenes(f).length,1)
})
