import { useEffect,useId,useRef,useState } from 'react'
import { mapPath } from './country.js'
import { geographyMapView,geographyMapLabels } from './geography.js'
export default function GeographyMap({map,locations}) {
  const [data,setData]=useState(null),[error,setError]=useState(false),[world,setWorld]=useState(map.default_view==='world')
  const [size,setSize]=useState({width:800,height:360}),stage=useRef(null),titleId=useId(),descriptionId=useId()
  useEffect(()=>{const c=new AbortController();fetch('/maps/countries.geojson',{signal:c.signal}).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()}).then(value=>{if(!Array.isArray(value.features))throw Error('Invalid map');setData(value);setError(false)}).catch(e=>{if(e.name!=='AbortError')setError(true)});return()=>c.abort()},[])
  useEffect(()=>{if(!stage.current||typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(([e])=>setSize({width:e.contentRect.width,height:e.contentRect.height}));observer.observe(stage.current);return()=>observer.disconnect()},[])
  const shown=locations.filter(p=>map.location_ids.includes(p.id)),view=geographyMapView(shown,world),labels=geographyMapLabels(view,size)
  return <figure className="geography-map">
    <div className="geography-map-heading"><h3>{map.title}</h3><div role="group" aria-label="Map view"><button type="button" aria-pressed={!world} onClick={()=>setWorld(false)}>Focus</button><button type="button" aria-pressed={world} onClick={()=>setWorld(true)}>World</button></div></div>
    <div className="geography-map-stage" ref={stage}>{error?<p role="status">The map could not load. The locations and their explanations are listed below.</p>:!data?<p role="status">Loading the map…</p>:<svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <title id={titleId}>{map.title}</title><desc id={descriptionId}>{map.what_to_notice} Approximate locations: {shown.map(p=>p.name).join('; ')}.</desc>
      {data.features.map((f,i)=><path key={i} className="geography-map-land" vectorEffect="non-scaling-stroke" d={mapPath(f.geometry,view.center)}/>)}
      {labels.map(p=><g key={p.id} className="geography-map-location"><title>{p.name}: {p.explanation}</title><circle cx={p.point[0]} cy={p.point[1]} r={4*p.unit} style={{strokeWidth:1.5*p.unit}}/>{p.box&&<><line x1={p.point[0]} y1={p.point[1]} x2={p.box.x+p.box.width/2} y2={p.box.y+p.box.height/2} style={{strokeWidth:p.unit}}/><rect x={p.box.x} y={p.box.y} width={p.box.width} height={p.box.height}/><text x={p.box.x+p.box.width/2} y={p.box.y+p.pad+p.font} fontSize={p.font} textAnchor="middle">{p.lines.map((s,i)=><tspan key={i} x={p.box.x+p.box.width/2} dy={i?p.line:0}>{s}</tspan>)}</text></>}</g>)}
    </svg>}</div>
    <figcaption>Natural Earth locator. North is up. Dots show approximate locations, not the full extent of a feature.</figcaption>
    <p className="geography-notice" data-narration-content>{map.what_to_notice}</p>
    <dl className="geography-map-key">{shown.map(p=><div key={p.id}><dt>{p.name}</dt><dd data-narration-content>{p.explanation}</dd></div>)}</dl>
  </figure>
}
