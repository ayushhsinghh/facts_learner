import { countryPhoto } from './country.js'
export default function PhotoCredit({ credit }) {
  const item = countryPhoto(credit)
  return item ? <span className="photo-credit">Photo: {item.author} · <a href={item.source_url} target="_blank" rel="noopener noreferrer">Original</a> · <a href={item.license_url} target="_blank" rel="noopener noreferrer">{item.license}</a><span>Resized; cover and card views may crop the image.</span></span> : null
}
