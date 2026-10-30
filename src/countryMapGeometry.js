import { mapPoint } from './country.js'
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v))
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

export function countryMapView(identity,features=[],regional=false) {
  const [lat,lon]=identity.coordinates,center=regional?lon:0,point=mapPoint(lon,lat,center)
  if(!regional)return {x:0,y:0,width:360,height:180,center,point}
  const g=features.find(f=>f.properties.code===identity.iso2)?.geometry
  const polygons=g?.type==='MultiPolygon'?g.coordinates:g?.type==='Polygon'?[g.coordinates]:[]
  const boxes=polygons.map(p=>{
    const points=(p[0]||[]).filter(c=>c.every(Number.isFinite)).map(c=>mapPoint(c[0],c[1],center))
    if(!points.length)return null
    const xs=points.map(c=>c[0]),ys=points.map(c=>c[1])
    return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)}
  }).filter(Boolean)
  boxes.sort((a,b)=>distance([(a.left+a.right)/2,(a.top+a.bottom)/2],point)-distance([(b.left+b.right)/2,(b.top+b.bottom)/2],point))
  const main=boxes[0]
  // Region focuses on the main land area; World preserves distant territories.
  const near=main?boxes.filter(b=>distance([(b.left+b.right)/2,(b.top+b.bottom)/2],point)<=Math.max(8,(main.right-main.left)*.65,(main.bottom-main.top)*.65)):[]
  const left=Math.min(point[0],...near.map(b=>b.left)),right=Math.max(point[0],...near.map(b=>b.right))
  const top=Math.min(point[1],...near.map(b=>b.top)),bottom=Math.max(point[1],...near.map(b=>b.bottom))
  const width=clamp((right-left)*1.8,18,320),height=clamp((bottom-top)*1.8,12,170)
  return {x:clamp((left+right-width)/2,0,360-width),y:clamp((top+bottom-height)/2,0,180-height),width,height,center,point}
}

export function countryMapLabels(identity,registry,view,size={width:800,height:380}) {
  const unit=Math.max(view.width/Math.max(1,size.width),view.height/Math.max(1,size.height))
  const font=13*unit,padding=6*unit,line=17*unit,lines=['']
  for(const word of identity.name.split(' ')){const n=lines.length-1;if(lines[n]&&lines[n].length+word.length>22)lines.push(word);else lines[n]+=(lines[n]?' ':'')+word}
  const width=Math.min(view.width-2*padding,Math.max(...lines.map(s=>s.length))*7*unit+2*padding),height=lines.length*line+padding
  const callout={x:clamp(view.point[0]-width/2,view.x+padding,view.x+view.width-width-padding),y:clamp(view.point[1]+12*unit,view.y+padding,view.y+view.height-height-padding),width,height,lines}
  const occupied=[callout],labels=[]
  const intersects=(a,b)=>a.x<b.x+b.width+padding&&a.x+a.width+padding>b.x&&a.y<b.y+b.height+padding&&a.y+a.height+padding>b.y
  const candidates=Object.entries(registry).filter(([code,item])=>code!==identity.iso2&&Array.isArray(item.coordinates))
    .map(([code,item])=>({code,name:item.name,point:mapPoint(item.coordinates[1],item.coordinates[0],view.center)}))
    .sort((a,b)=>distance(a.point,view.point)-distance(b.point,view.point))
  for(const item of candidates){
    if(labels.length>=4)break
    const [x,y]=item.point,w=item.name.length*6.5*unit,h=line
    if(x<view.x||x>view.x+view.width||y<view.y||y>view.y+view.height)continue
    for(const offset of [-h-3*unit,3*unit]){
      const box={x:x-w/2,y:y+offset,width:w,height:h}
      if(box.x<view.x+padding||box.x+w>view.x+view.width-padding||box.y<view.y+padding||box.y+h>view.y+view.height-padding||occupied.some(other=>intersects(box,other)))continue
      labels.push({...item,x,y:box.y+font});occupied.push(box);break
    }
  }
  return {unit,font,line,padding,callout,labels}
}
