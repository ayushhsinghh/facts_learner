import { useEffect, useState, useId } from 'react'
import { mapPath, mapPoint } from './country.js'
export default function CountryMap({ identity }) {
  const [data,setData]=useState(null), [error,setError]=useState(false), [regional,setRegional]=useState(false)
  const label=useId()
  useEffect(()=>{
    const controller=new AbortController()
    fetch('/maps/countries.geojson',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()}).then(d=>{setData(d);setError(false)}).catch(e=>{if(e.name!=='AbortError')setError(true)})
    return ()=>controller.abort()
  },[])
  const [lat,lon]=identity.coordinates, center=regional?lon:0, [x,y]=mapPoint(lon,lat,center)
  // A locator view uses a known country coordinate, never a capital mislabelled as a country centre.
  const view=regional?`${x-36} ${Math.max(0,Math.min(108,y-36))} 72 72`:'0 0 360 180'
  return <figure className="country-map">
    <div className="country-map-controls" role="group" aria-label="Map view">
      <button type="button" aria-pressed={!regional} onClick={()=>setRegional(false)}>World</button>
      <button type="button" aria-pressed={regional} onClick={()=>setRegional(true)}>Region</button>
    </div>
    {error?<p role="status">The map could not load. Read the location description below.</p>:!data?<p role="status">Loading the map…</p>:<svg viewBox={view} role="img" aria-labelledby={label} preserveAspectRatio="xMidYMid meet">
      <title id={label}>{identity.name} highlighted on the {regional?'regional':'world'} locator map</title>
      {data.features.map((f,i)=><path key={i} d={mapPath(f.geometry,center)} className={f.properties.code===identity.iso2?'country-map-selected':''} />)}
      <circle cx={x} cy={y} r={regional ? .65 : 1.5} className="country-map-pin" />
    </svg>}
    <figcaption>Locator map · Natural Earth. Small islands may be shown with a marker. This small-scale map does not imply endorsement of disputed boundaries.</figcaption>
  </figure>
}
