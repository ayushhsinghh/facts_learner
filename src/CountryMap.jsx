import { useEffect, useState, useId, useRef } from 'react'
import { mapPath } from './country.js'
import { countryMapView, countryMapLabels } from './countryMapGeometry.js'
export default function CountryMap({ identity, waters=[] }) {
  const [data,setData]=useState(null),[registry,setRegistry]=useState({}),[error,setError]=useState(false),[regional,setRegional]=useState(true)
  const [size,setSize]=useState({width:800,height:380}),stage=useRef(null),label=useId(),description=useId()
  useEffect(()=>{
    const controller=new AbortController()
    const read=url=>fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()})
    read('/maps/countries.geojson').then(d=>{setData(d);setError(false)}).catch(e=>{if(e.name!=='AbortError')setError(true)})
    read('/maps/country-data.json').then(setRegistry).catch(()=>{})
    return ()=>controller.abort()
  },[])
  useEffect(()=>{
    if(!stage.current||typeof ResizeObserver==='undefined')return
    const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}))
    observer.observe(stage.current);return ()=>observer.disconnect()
  },[])
  const view=countryMapView(identity,data?.features,regional),annotations=countryMapLabels(identity,regional?registry:{},view,size)
  const {unit,font,line,padding,callout,labels}=annotations,[x,y]=view.point
  const labelledCodes=new Set(labels.map(item=>item.code))
  return <figure className="country-map">
    <div className="country-map-heading"><div><strong>{identity.name}</strong><span>{identity.subregion||identity.region}</span></div>
      <div className="country-map-controls" role="group" aria-label="Map view">
        <button type="button" aria-pressed={!regional} onClick={()=>setRegional(false)}>World</button>
        <button type="button" aria-pressed={regional} onClick={()=>setRegional(true)}>Region</button>
      </div>
    </div>
    <div className="country-map-stage" ref={stage}>
      {error?<p role="status">The map could not load. Read the location description below.</p>:!data?<p role="status">Loading the map…</p>:<svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" aria-labelledby={label} aria-describedby={description} preserveAspectRatio="xMidYMid meet">
        <title id={label}>{identity.name} highlighted on the {regional?'regional':'world'} locator map</title>
        <desc id={description}>The bright area and marker identify {identity.name}.{labels.length?` Nearby country labels: ${labels.map(p=>p.name).join(', ')}.`:''} The marker shows a country location, not its capital.</desc>
        {data.features.map((f,i)=><path key={i} d={mapPath(f.geometry,view.center)} className={f.properties.code===identity.iso2?'country-map-selected':labelledCodes.has(f.properties.code)?'country-map-nearby':''} />)}
        <g className="country-map-labels" fontSize={font} style={{'--map-text-outline':`${3*unit}px`}}>
          {labels.map(item=><text key={item.code} x={item.x} y={item.y} textAnchor="middle">{item.name}</text>)}
        </g>
        <circle cx={x} cy={y} r={4*unit} className="country-map-pin" style={{strokeWidth:1.5*unit}} />
        <g className="country-map-callout" fontSize={font}>
          <rect x={callout.x} y={callout.y} width={callout.width} height={callout.height}/>
          <text x={callout.x+callout.width/2} y={callout.y+padding+font} textAnchor="middle">{callout.lines.map((name,n)=><tspan key={n} x={callout.x+callout.width/2} dy={n?line:0}>{name}</tspan>)}</text>
        </g>
      </svg>}
    </div>
    <div className="country-map-key"><span><i aria-hidden="true"/>{identity.name}</span><span>Country marker · not the capital</span></div>
    <dl className="country-map-context">
      <div><dt>Land neighbours</dt><dd>{identity.neighbour_names?.join(', ')||'No land neighbours listed'}</dd></div>
      {waters.length>0&&<div><dt>Nearby waters</dt><dd>{waters.join(' · ')}</dd></div>}
    </dl>
    <figcaption>Natural Earth locator map. Region focuses on the main land area; distant territories may be outside this view. Boundaries do not imply endorsement of territorial claims.</figcaption>
  </figure>
}
