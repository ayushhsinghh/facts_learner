import { countryPhoto,mapPoint } from './country.js'
const text=v=>typeof v==='string'&&Boolean(v.trim())
const texts=v=>Array.isArray(v)&&v.every(text)
const records=(v,keys)=>Array.isArray(v)&&v.every(x=>x&&keys.every(k=>text(x[k])))
const finite=v=>typeof v==='number'&&Number.isFinite(v)
export function validGeographyDiagram(d) {
  if(d===null)return true
  if(!d||!['cross_section','cause_effect','comparison'].includes(d.type)||!['title','caption','description'].every(k=>text(d[k]))||!texts(d.assumptions)
    ||!Array.isArray(d.profile)||!records(d.nodes,['id','label','detail'])||!records(d.connections,['from_id','to_id','label'])||!records(d.comparisons,['label','conditions','explanation']))return false
  if(d.type==='comparison')return d.comparisons.length>=2&&d.comparisons.length<=3&&!d.nodes.length&&!d.connections.length&&!d.profile.length
  const nodes=d.nodes,edges=d.connections
  if(d.comparisons.length||nodes.length<3||nodes.length>5||new Set(nodes.map(n=>n.id)).size!==nodes.length||edges.length<2||edges.length>6)return false
  if(nodes.some(n=>!finite(n.x)||!finite(n.y)||n.x<.08||n.x>.92||n.y<.12||n.y>.85||n.label.length>48))return false
  if(nodes.some((a,i)=>nodes.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<.22)))return false
  if(nodes.some((a,i)=>nodes.slice(i+1).some(b=>Math.abs(a.x-b.x)<.31&&Math.abs(a.y-b.y)<.30))||edges.some(e=>e.label.length>48))return false
  const ids=new Set(nodes.map(n=>n.id)),pairs=new Set(edges.map(e=>`${e.from_id}/${e.to_id}`))
  if(pairs.size!==edges.length||edges.some(e=>!ids.has(e.from_id)||!ids.has(e.to_id)||e.from_id===e.to_id))return false
  if(edges.some(e=>pairs.has(`${e.to_id}/${e.from_id}`)))return false
  const reached=new Set([nodes[0].id])
  for(let i=0;i<nodes.length;i++)for(const edge of edges){if(reached.has(edge.from_id))reached.add(edge.to_id);if(reached.has(edge.to_id))reached.add(edge.from_id)}
  if(reached.size!==ids.size)return false
  if(d.type==='cause_effect')return !d.profile.length
  const p=d.profile
  return p.length>=4&&p.length<=12&&p[0]?.x===0&&p.at(-1)?.x===1&&p.every((v,i)=>finite(v.x)&&finite(v.height)&&v.x>=0&&v.x<=1&&v.height>=0&&v.height<=1&&(!i||v.x>p[i-1].x))&&Math.max(...p.map(v=>v.height))-Math.min(...p.map(v=>v.height))>=.15
}
export function hasGeographyLesson(fact) {
  const l=fact?.geography_lesson,c=l?.location_context,m=l?.map
  if(!(fact?.category==='geography'&&fact.schema_version==='2.0'&&fact.article_type==='geography_lesson'&&l
    &&['landform','physical_process','regional_pattern','human_environment'].includes(l.subject_type)
    &&['hook','question','learning_goal','central_idea'].every(k=>text(l[k]))
    &&['name','region','scale'].every(k=>text(l.identity?.[k]))
    &&['title','observation','what_to_notice'].every(k=>text(l.opening_observation?.[k]))
    &&text(c?.explanation)&&texts(c.spatial_relationships)&&records(c.locations,['id','name','kind','explanation'])&&c.locations.length>=1&&c.locations.length<=6
    &&c.locations.every(p=>finite(p.latitude)&&Math.abs(p.latitude)<=90&&finite(p.longitude)&&Math.abs(p.longitude)<=180)
    &&new Set(c.locations.map(p=>p.id)).size===c.locations.length
    &&records(l.key_terms,['term','meaning'])&&records(l.explanation_steps,['id','title','explanation','observable_effect'])&&l.explanation_steps.length>=3&&l.explanation_steps.length<=6
    &&new Set(l.explanation_steps.map(p=>p.id)).size===l.explanation_steps.length&&validGeographyDiagram(l.diagram)
    &&['title','location_id','observation','explanation','what_it_shows','variability'].every(k=>text(l.case_study?.[k]))
    &&records(l.human_connections,['title','explanation'])&&records(l.variations,['title','conditions','difference'])&&records(l.misconceptions,['belief','correction','explanation'])
    &&texts(l.limits)&&records(l.knowledge_checks,['question','answer','explanation'])&&l.knowledge_checks.length>=1&&texts(l.takeaways)&&l.takeaways.length>=2&&texts(l.related_topics)
    &&records(l.photos,['id','section_id','kind','subject'])&&l.photos.length>=2&&l.photos.length<=6))return false
  const ids=new Set(c.locations.map(p=>p.id))
  return ids.has(l.case_study.location_id)&&(m===null||m&&text(m.title)&&text(m.what_to_notice)&&['region','world'].includes(m.default_view)&&texts(m.location_ids)&&m.location_ids.length>=1&&m.location_ids.length<=4&&new Set(m.location_ids).size===m.location_ids.length&&m.location_ids.every(id=>ids.has(id))&&m.location_ids.includes(l.case_study.location_id))
    &&new Set(l.photos.map(p=>p.id)).size===l.photos.length&&new Set(l.photos.map(p=>p.section_id)).size===l.photos.length
    &&l.photos.every(p=>texts(p.queries)&&p.queries.length>=1&&p.queries.length<=2&&['overview','location','process','case-study','connections','variations'].includes(p.section_id)
      &&['subject','detail','process','named_place','satellite','historical_object'].includes(p.kind)&&(p.location_id===null||ids.has(p.location_id))
      &&(!['named_place','satellite'].includes(p.kind)||p.location_id!==null)&&(p.section_id!=='connections'||l.human_connections.length>0)&&(p.section_id!=='variations'||l.variations.length>0))
}
export function geographyPhotos(fact,section) {
  return (fact?.geography_lesson?.photos||[]).flatMap((request,index)=>{
    if(request.section_id!==section)return []
    const credit=countryPhoto(fact.image_credits?.[`geography_photo_${index}`])
    if(!credit?.geography_photo||credit.section_id!==section||credit.photo_id!==request.id||credit.location_id!==request.location_id)return []
    if(['named_place','satellite','historical_object'].includes(request.kind)&&credit.provider!=='wikimedia')return []
    return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  })
}
export function geographyScenes(fact) {
  const seen=new Set()
  return Object.entries(fact?.image_credits||{}).flatMap(([key,value])=>{
    if(!/^geography_scene_\d+$/.test(key)||!value?.geography_carousel)return []
    const credit=countryPhoto(value)
    if(!credit||seen.has(credit.source_url))return []
    seen.add(credit.source_url);return [{url:credit.url,credit,alt:credit.description,caption:credit.title}]
  }).slice(0,6)
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
export function geographyMapView(locations,world=false) {
  if(!locations.length)return {x:0,y:0,width:360,height:180,center:0,points:[]}
  const radians=locations.map(p=>p.longitude*Math.PI/180)
  const center=world?0:Math.atan2(radians.reduce((s,x)=>s+Math.sin(x),0),radians.reduce((s,x)=>s+Math.cos(x),0))*180/Math.PI
  const points=locations.map(p=>({...p,point:mapPoint(p.longitude,p.latitude,center)}))
  if(world)return {x:0,y:0,width:360,height:180,center,points}
  const xs=points.map(p=>p.point[0]),ys=points.map(p=>p.point[1])
  const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys)
  const width=clamp((right-left)*1.7+6,12,360),height=clamp((bottom-top)*1.7+4,8,180)
  return {x:clamp((left+right-width)/2,0,360-width),y:clamp((top+bottom-height)/2,0,180-height),width,height,center,points}
}
export function geographyMapLabels(view,size={width:800,height:360}) {
  const unit=Math.max(view.width/Math.max(1,size.width),view.height/Math.max(1,size.height)),font=13*unit,line=17*unit,pad=6*unit
  const occupied=view.points.map(p=>({x:p.point[0]-5*unit,y:p.point[1]-5*unit,width:10*unit,height:10*unit}))
  return view.points.map(p=>{
    const lines=['']
    for(const word of p.name.split(' ').flatMap(w=>w.match(/.{1,22}/gu)||[])){const i=lines.length-1;if(lines[i]&&lines[i].length+word.length>22)lines.push(word);else lines[i]+=(lines[i]?' ':'')+word}
    const width=Math.min(view.width-pad*2,Math.max(...lines.map(x=>x.length))*7*unit+pad*2),height=lines.length*line+pad*2
    const intersects=b=>occupied.some(a=>a.x<b.x+b.width+pad&&a.x+a.width+pad>b.x&&a.y<b.y+b.height+pad&&a.y+a.height+pad>b.y)
    const slots=[[p.point[0]-width/2,p.point[1]+14*unit],[p.point[0]-width/2,p.point[1]-height-14*unit],
      [p.point[0]+14*unit,p.point[1]-height/2],[p.point[0]-width-14*unit,p.point[1]-height/2],
      [p.point[0]-width/2,p.point[1]+height+28*unit],[p.point[0]-width/2,p.point[1]-height-28*unit]]
    for(let y=view.y+pad;y+height<=view.y+view.height-pad;y+=height+pad)for(let x=view.x+pad;x+width<=view.x+view.width-pad;x+=width+pad)slots.push([x,y])
    const candidates=slots.map(([x,y])=>({x:clamp(x,view.x+pad,view.x+view.width-width-pad),y:clamp(y,view.y+pad,view.y+view.height-height-pad),width,height}))
    candidates.sort((a,b)=>Math.hypot(a.x+width/2-p.point[0],a.y+height/2-p.point[1])-Math.hypot(b.x+width/2-p.point[0],b.y+height/2-p.point[1]))
    const box=candidates.find(b=>!intersects(b))
    if(box)occupied.push(box)
    return {...p,box,lines,font,line,pad,unit}
  })
}

export function geographyConnectionLabels(nodes,connections) {
  const byId=new Map(nodes.map(n=>[n.id,n])),occupied=nodes.map(n=>({x:n.x-98,y:n.y-36,width:196,height:72}))
  const intersects=b=>occupied.some(a=>a.x<b.x+b.width+4&&a.x+a.width+4>b.x&&a.y<b.y+b.height+4&&a.y+a.height+4>b.y)
  return connections.map(e=>{
    const a=byId.get(e.from_id),b=byId.get(e.to_id),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy))
    const width=Math.min(196,Math.max(90,e.label.length*7+16)),height=e.label.length>24?36:20
    const candidates=[{x:mid.x,y:mid.y-48}]
    for(const distance of [-64,64,-100,100,-140,140])for(const shift of [0,-60,60])candidates.push({x:mid.x-dy/len*distance+dx/len*shift,y:mid.y+dx/len*distance+dy/len*shift})
    const boxes=candidates.map(p=>({x:clamp(p.x-width/2,8,792-width),y:clamp(p.y-height/2,8,390-height),width,height}))
    const box=boxes.find(b=>!intersects(b))
    if(box)occupied.push(box)
    return box?{x:box.x+width/2,y:box.y+14,box}:null
  })
}
