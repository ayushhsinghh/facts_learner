import { useEffect, useRef, useState } from 'react'
import { countryScenes } from './country.js'
import PhotoCredit from './PhotoCredit.jsx'
export default function CountryCarousel({fact,onOpenImage,images:providedImages,label='Photographs from the country'}) {
  const [failed,setFailed]=useState(()=>new Set()),[active,setActive]=useState(0),track=useRef(null)
  const images=(providedImages??countryScenes(fact)).filter(item=>!failed.has(item.url))
  const current=Math.min(active,Math.max(0,images.length-1))
  useEffect(()=>{if(active>=images.length&&track.current)track.current.scrollTo({left:current*track.current.clientWidth})},[images.length,current,active])
  if(!images.length)return <p role="status">Photographs are temporarily unavailable.</p>
  const move=delta=>track.current?.scrollTo({left:(current+delta)*track.current.clientWidth})
  return <div className="country-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="country-carousel-controls">
      <p aria-live="polite">{current+1} / {images.length}</p>
      <div><button type="button" onClick={()=>move(-1)} disabled={current===0} aria-label="Previous photograph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" onClick={()=>move(1)} disabled={current===images.length-1} aria-label="Next photograph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div>
    </div>
    <div className="country-photo-track" ref={track} tabIndex={0} aria-label="Swipe or scroll to browse photographs"
      onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1)}}}
      onScroll={event=>setActive(Math.round(event.currentTarget.scrollLeft/Math.max(1,event.currentTarget.clientWidth)))}>
      {images.map((item,index)=><figure key={item.url} role="group" aria-roledescription="slide" aria-label={`${index+1} of ${images.length}`}>
        <button type="button" aria-label={`Enlarge photograph: ${item.caption}`} onClick={()=>onOpenImage(item)}>
          <img src={item.url} alt={item.alt} loading="lazy" decoding="async" onError={()=>setFailed(previous=>new Set([...previous,item.url]))}/>
        </button>
        <figcaption>{item.caption}<PhotoCredit credit={item.credit}/></figcaption>
      </figure>)}
    </div>
  </div>
}
