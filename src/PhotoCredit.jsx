import { countryPhoto } from './country.js'
export default function PhotoCredit({ credit }) {
  if(credit?.kind==='generated')return <span className="photo-credit">AI-generated illustration · Not a documentary photograph</span>
  if(credit?.kind==='fallback')return <span className="photo-credit">World map artwork · Natural Earth</span>
  const item = countryPhoto(credit)
  if(item?.provider==='unsplash')return <span className="photo-credit">Photo by <a href={item.author_url} target="_blank" rel="noopener noreferrer">{item.author}</a> on <a href={item.source_url} target="_blank" rel="noopener noreferrer">Unsplash</a><span><a href={item.license_url} target="_blank" rel="noopener noreferrer">Unsplash License</a> · Resized; cover and card views may crop the image.</span></span>
  return item ? <span className="photo-credit">Photo: {item.author} · <a href={item.source_url} target="_blank" rel="noopener noreferrer">Original</a> · <a href={item.license_url} target="_blank" rel="noopener noreferrer">{item.license}</a><span>Resized; cover and card views may crop the image.</span></span> : null
}
