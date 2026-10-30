import { useState } from 'react'
import { countryVisualCandidates, countrySubjectPhoto } from './country.js'
import PhotoCredit from './PhotoCredit.jsx'
export function useCountryVisual(fact,purpose='cover') {
  const [failed,setFailed]=useState(()=>new Set())
  const candidates=countryVisualCandidates(fact,purpose)
  const asset=candidates.find(item=>!failed.has(item.url))||candidates.at(-1)
  const onError=()=>{if(asset)setFailed(previous=>previous.has(asset.url)?previous:new Set([...previous,asset.url]))}
  return {asset,onError}
}
export function CountryCardVisual({fact}) {
  const {asset,onError}=useCountryVisual(fact,'overview')
  return asset?<><img className="history-card-bg country-visual-background" src={asset.url} alt="" loading="lazy" onError={onError}/><PhotoCredit credit={asset.credit}/></>:null
}
export function CountrySubjectImage({fact,kind,index,subject,onOpenImage}) {
  const [failed,setFailed]=useState(null)
  const image=countrySubjectPhoto(fact,kind,index,subject)
  if(!image||failed===image.url)return null
  return <figure className={`country-subject-image is-${kind}`}>
    <button type="button" aria-label={`Enlarge image of ${image.caption}`} onClick={()=>onOpenImage(image)}>
      <img src={image.url} alt={image.alt} loading="lazy" decoding="async" onError={()=>setFailed(image.url)}/>
    </button>
    <figcaption>{image.caption}<PhotoCredit credit={image.credit}/></figcaption>
  </figure>
}
